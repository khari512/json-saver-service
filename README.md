# json-saver-service

A minimal Express app exposing a POST `/data` endpoint to append JSON payloads to a local file. This guide assumes you are new to AWS and will use Elastic Beanstalk for deployment.

## Prerequisites
- An AWS account with permissions to use Elastic Beanstalk
- AWS CLI installed and configured (`aws configure`)
- EB CLI installed (`pip install awsebcli`)
- Git installed

## Local Testing
1. Install dependencies:
   ```bash
   npm install