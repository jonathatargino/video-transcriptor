import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as ec2 from "aws-cdk-lib/aws-ec2";

import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

export class VideoTranscriptorCloudformationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const videoTranscriptorBucket = new s3.Bucket(this, "VideosToTranscript", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const videoTranscriptorDeadLetterQueue = new sqs.Queue(
      this,
      "VideoTranscriptorDeadLetterQueue",
      { retentionPeriod: cdk.Duration.days(14) },
    );

    const videoTranscriptorQueue = new sqs.Queue(
      this,
      "VideoTranscriptorQueue",
      {
        deadLetterQueue: {
          queue: videoTranscriptorDeadLetterQueue,
          maxReceiveCount: 3,
        },
        visibilityTimeout: cdk.Duration.minutes(5),
      },
    );

    const table = new dynamodb.TableV2(this, "TranscriptionsDynamoDBTablev2", {
      partitionKey: {
        name: "jobId",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: "transcription",
      billing: dynamodb.Billing.onDemand(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    videoTranscriptorBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.SqsDestination(videoTranscriptorQueue),
      { suffix: ".mp4" },
    );

    const videoTranscriptorLambdaFunction = new NodejsFunction(
      this,
      "VideoTranscriptorHandler",
      {
        entry: path.join(
          import.meta.dirname,
          "lambdas",
          "video-transcriptor-handler",
          "index.ts",
        ),
        environment: {
          DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || "",
          TRANSCRIPTIONS_TABLE_NAME: table.tableName,
        },
        timeout: cdk.Duration.minutes(5),
        memorySize: 256,
      },
    );

    videoTranscriptorLambdaFunction.addEventSource(
      new SqsEventSource(videoTranscriptorQueue),
    );

    videoTranscriptorBucket.grantRead(videoTranscriptorLambdaFunction);

    table.grantWriteData(videoTranscriptorLambdaFunction);

    const cluster = new ecs.Cluster(this, "VideoTranscriptorECSCluster", {
      clusterName: "video-transcriptor",
    });

    const fargateService =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        "FargateService",
        {
          cluster,
          publicLoadBalancer: false,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset(
              path.join(import.meta.dirname, ".."),
            ),
            containerPort: 3009,
            environment: {
              TRANSCRIPTIONS_TABLE_NAME: table.tableName,
              TRANSCRIPTIONS_VIDEO_BUCKET_NAME:
                videoTranscriptorBucket.bucketName,
              NODE_ENV: "production",
            },
          },
        },
      );

    const httpApi = new apigatewayv2.HttpApi(this, "VideoTranscriptorApi");

    const vpcLinkSecurityGroup = new ec2.SecurityGroup(
      this,
      "VideoTranscriptorVpcLinkSecurityGroup",
      { vpc: cluster.vpc, allowAllOutbound: true },
    );

    const vpcLink = new apigatewayv2.VpcLink(this, "VideoTranscriptorVpcLink", {
      vpc: cluster.vpc,
      securityGroups: [vpcLinkSecurityGroup],
    });

    fargateService.loadBalancer.connections.allowFrom(
      vpcLinkSecurityGroup,
      ec2.Port.tcp(80),
      "Allow API Gateway VPC Link to reach the ALB",
    );

    const albIntegration = new apigatewayv2Integrations.HttpAlbIntegration(
      "VideoTranscriptorAlbIntegration",
      fargateService.listener,
      { vpcLink },
    );

    httpApi.addRoutes({
      path: "/api/v1/transcription/{id}",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: albIntegration,
    });

    httpApi.addRoutes({
      path: "/api/v1/transcription/presigned-url",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: albIntegration,
    });

    table.grantReadData(fargateService.taskDefinition.taskRole);
  }
}
