import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

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
      },
    );

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
          "video-transcriptor-handler.ts",
        ),
      },
    );

    videoTranscriptorLambdaFunction.addEventSource(
      new SqsEventSource(videoTranscriptorQueue),
    );

    videoTranscriptorBucket.grantRead(videoTranscriptorLambdaFunction);
  }
}
