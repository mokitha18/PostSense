# PostSense — AI Content Intelligence Suite
### AWS AI for Bharat Hackathon 2026

> **Stop posting blindly. Know how your audience will react — before you hit publish.**

---

## AWS Architecture

```
USER BROWSER (React + TypeScript)
        |
        | HTTPS POST
        v
AWS LAMBDA FUNCTION URL
https://nbw36je6gxstqu5bqymohlgasi0hfnag.lambda-url.us-west-2.on.aws/
        |
        | (routes by _function field in request body)
        |
   +---------+----------+----------+------------------+---------------+
   |         |          |          |                  |               |
analyze   analyze    analyze   repurpose-content  viral-predict
  -post    -script    -blog
        |
        | boto3.invoke_model()
        v
AMAZON BEDROCK
Model: amazon.titan-text-express-v1
Region: us-east-1
```

---

## Why AI is Required

PostSense is fundamentally impossible without Generative AI:

- Emotion Simulator: LLM understands human emotional context and nuance
- Misinterpretation Risk: AI predicts how different audiences interpret the same phrase
- Audience Persona Cards: AI roleplays 4 different audience archetypes simultaneously
- Viral Predictor: Pattern recognition across psychological triggers
- Auto-Rewrite: Generative AI produces contextually appropriate rewrites

---

## AWS Services Used

- Amazon Bedrock — Foundation model: amazon.titan-text-express-v1
- AWS Lambda — Serverless compute for all 5 AI functions
- AWS Lambda Function URLs — HTTPS endpoints without API Gateway
- AWS IAM — Lambda execution role with bedrock:InvokeModel permission

---

## Project Structure

```
postsense/
  src/
    pages/
      PostAnalyzer.tsx          # Calls AWS Lambda → Bedrock
      ScriptAnalyzer.tsx        # Calls AWS Lambda → Bedrock
      BlogAnalyzer.tsx          # Calls AWS Lambda → Bedrock
      RepurposeEngine.tsx       # Calls AWS Lambda → Bedrock
      ViralPredictor.tsx        # Calls AWS Lambda → Bedrock
    integrations/
      aws/
        client.ts               # AWS Lambda client (replaces Supabase)

  aws/
    lambda/
      analyze-post/lambda_function.py       # boto3 → Amazon Bedrock
      analyze-script/lambda_function.py
      analyze-blog/lambda_function.py
      repurpose-content/lambda_function.py
      viral-predict/lambda_function.py
```

---

## Local Setup

```bash
npm install
npm run dev
```

The frontend calls the live AWS Lambda Function URL directly.

---

## Deploy Lambda Functions

```bash
cd aws/lambda/analyze-post
zip -r function.zip lambda_function.py

aws lambda create-function \
  --function-name postsense-analyze-post \
  --runtime python3.12 \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/postsense-lambda-role \
  --region us-west-2

aws lambda create-function-url-config \
  --function-name postsense-analyze-post \
  --auth-type NONE \
  --cors '{"AllowOrigins":["*"],"AllowMethods":["POST","OPTIONS"],"AllowHeaders":["Content-Type"]}'
```

## Required IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["bedrock:InvokeModel"],
    "Resource": "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-express-v1"
  }]
}
```

---

## Team

- Team Name: PostSense
- Team Leader: Mokitha
- Hackathon: AWS AI for Bharat 2026
- GitHub: https://github.com/mokitha18/postsense
