import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class VideoTranscriptorCloudformationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, "VideoTranscriptorHandler", {
      entry: path.join(
        import.meta.dirname,
        "lambdas",
        "video-transcriptor-handler.ts",
      ),
    });

    new apigateway.LambdaRestApi(this, `ApiGatewaywEndpoint`, {
      handler,
      restApiName: `VideoTranscriptor`,
    });
  }
}
