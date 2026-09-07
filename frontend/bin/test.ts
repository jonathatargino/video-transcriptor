#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { FrontendCloudFormationStack } from "../lib/cloudformation-stack";

const app = new cdk.App();
new FrontendCloudFormationStack(app, "FrontendCloudFormationStack", {});
