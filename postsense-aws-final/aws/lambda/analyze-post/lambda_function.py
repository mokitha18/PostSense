import json
import boto3
import re

# Amazon Bedrock client
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
}

def lambda_handler(event, context):
    # Handle CORS preflight
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body     = json.loads(event.get("body", "{}"))
        content  = body.get("content", "")
        platform = body.get("platform", "instagram")
        tone     = body.get("tone", "professional")

        if not content:
            raise ValueError("Missing required field: content")

        prompt = f"""You are an expert social media content analyst for Indian creators and brands.
Analyze this {platform} post written in {tone} tone.

POST CONTENT:
\"\"\"{content}\"\"\"

Return ONLY valid JSON, no markdown, no explanation:
{{
  "overallScore": 75,
  "emotions": {{
    "primary": {{"name": "Excitement", "emoji": "🔥", "confidence": 82}},
    "secondary": [{{"name": "Inspiration", "score": 65}}, {{"name": "Curiosity", "score": 50}}],
    "reasoning": "The post uses energetic language that conveys enthusiasm. The call-to-action is motivating."
  }},
  "misinterpretationRisk": {{
    "score": 30,
    "flaggedPhrases": [{{"phrase": "crushing it", "risk": 60, "reason": "Can sound aggressive to some audiences", "suggestion": "doing amazing"}}]
  }},
  "audiencePersonas": [
    {{"name": "First Timer", "dropOffRisk": 40, "thought": "This is interesting but I need more context", "suggestion": "Add a brief intro explaining the background"}},
    {{"name": "Loyal Fan", "dropOffRisk": 10, "thought": "Love seeing this progress!", "suggestion": "Keep the personal touch"}},
    {{"name": "Silent Reader", "dropOffRisk": 55, "thought": "Not sure if this applies to me", "suggestion": "Add a relatable hook"}},
    {{"name": "Skeptic", "dropOffRisk": 70, "thought": "Sounds too good to be true", "suggestion": "Add specific numbers or proof"}}
  ],
  "attentionHeatmap": [
    {{"word": "launched", "strength": "strong"}},
    {{"word": "new", "strength": "moderate"}},
    {{"word": "excited", "strength": "strong"}},
    {{"word": "finally", "strength": "moderate"}},
    {{"word": "ready", "strength": "weak"}}
  ],
  "toneAlignment": {{
    "intended": "{tone}",
    "perceived": "enthusiastic",
    "matchPercentage": 78,
    "adjustments": [{{"current": "we are ready", "suggested": "we are thrilled to announce", "reason": "Stronger emotional hook"}}]
  }},
  "microEdits": [
    {{"original": "check this out", "improved": "you need to see this", "reason": "More compelling and personal"}},
    {{"original": "very good", "improved": "outstanding", "reason": "Stronger adjective increases impact"}}
  ],
  "cringeDetector": {{
    "score": 20,
    "flaggedPhrases": [{{"phrase": "synergy", "replacement": "teamwork", "reason": "Overused corporate jargon"}}]
  }},
  "engagementPrediction": {{
    "likes": 72,
    "comments": 45,
    "shares": 38,
    "bestTimeToPost": "Tuesday or Thursday, 7-9 PM IST for {platform}"
  }}
}}

Now analyze the ACTUAL content provided above and return real analysis in this exact JSON structure."""

        # Call Amazon Bedrock - Titan Text Express
        response = bedrock.invoke_model(
            modelId="amazon.titan-text-express-v1",
            body=json.dumps({
                "inputText": prompt,
                "textGenerationConfig": {
                    "maxTokenCount": 2048,
                    "temperature": 0.3,
                    "topP": 0.9
                }
            })
        )

        result  = json.loads(response["body"].read())
        ai_text = result["results"][0]["outputText"]

        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', ai_text)
        if not json_match:
            raise ValueError("No JSON found in Bedrock response")

        analysis = json.loads(json_match.group())

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": True, "analysis": analysis})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": str(e)})
        }
