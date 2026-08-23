import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class VideoTranscriptorCloudformationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const videoTranscriptorQueue = new sqs.Queue(
      this,
      "VideoTranscriptorQueue",
      {},
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
  }
}
