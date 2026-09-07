#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { VideoTranscriptorCloudformationStack } from "../lib/video-transcriptor-cloudformation-stack.js";

const app = new cdk.App();
new VideoTranscriptorCloudformationStack(
  app,
  "VideoTranscriptorCloudformationStack",
  {},
);
