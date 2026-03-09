import json
import boto3
import re

bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
}

def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body     = json.loads(event.get("body", "{}"))
        content  = body.get("content", "")
        platform = body.get("platform", "instagram")

        if not content:
            raise ValueError("Missing required field: content")

        prompt = f"""You are an expert viral content analyst specializing in Indian social media trends on {platform}.
Predict the viral potential of this content.

CONTENT:
\"\"\"{content}\"\"\"

Return ONLY valid JSON, no markdown, no explanation:
{{
  "viralScore": 68,
  "viralLabel": "High Potential",
  "triggers": {{
    "surprise": 75,
    "relatability": 90,
    "aspiration": 60,
    "humor": 30,
    "outrage": 15,
    "inspiration": 80
  }},
  "trendAlignment": {{
    "score": 7,
    "explanation": "This content aligns well with the current trend of authenticity and behind-the-scenes content popular on Indian social media."
  }},
  "missingElements": [
    {{"suggestion": "Add a specific number or statistic", "impact": "High", "reason": "Data-driven content gets 3x more shares on LinkedIn and Twitter"}},
    {{"suggestion": "Include a personal failure or lesson learned", "impact": "High", "reason": "Vulnerability content has 40% higher engagement on Instagram"}},
    {{"suggestion": "Add a direct question to the audience", "impact": "Medium", "reason": "Questions drive comments which boost algorithmic reach"}}
  ],
  "predictedReactions": {{
    "love": 55,
    "surprise": 25,
    "skeptical": 12,
    "negative": 8
  }},
  "platformTips": [
    {{"tip": "Post between 7-9 PM IST when Indian audience is most active", "impact": "High"}},
    {{"tip": "Use 3-5 hashtags maximum for better reach on this platform", "impact": "Medium"}},
    {{"tip": "Reply to every comment in the first 60 minutes to boost algorithm", "impact": "High"}}
  ],
  "optimalVersion": "Rewritten version of the content with all viral optimizations applied goes here."
}}

Now analyze the ACTUAL content above and return real viral prediction in this exact JSON structure."""

        response = bedrock.invoke_model(
            modelId="amazon.titan-text-express-v1",
            body=json.dumps({
                "inputText": prompt,
                "textGenerationConfig": {"maxTokenCount": 2048, "temperature": 0.3, "topP": 0.9}
            })
        )
        result  = json.loads(response["body"].read())
        ai_text = result["results"][0]["outputText"]

        json_match = re.search(r'\{[\s\S]*\}', ai_text)
        if not json_match:
            raise ValueError("No JSON found in Bedrock response")

        prediction = json.loads(json_match.group())
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": True, "prediction": prediction})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": str(e)})
        }
