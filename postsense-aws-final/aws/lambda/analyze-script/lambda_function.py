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
        script   = body.get("content", body.get("script", ""))
        platform = body.get("platform", "youtube")
        duration = body.get("videoLength", body.get("duration", 5))

        if not script:
            raise ValueError("Missing required field: content")

        prompt = f"""You are an expert script analyst for {platform} content creators.
Analyze this script (target duration: {duration} minutes).

SCRIPT:
\"\"\"{script}\"\"\"

Return ONLY valid JSON, no markdown, no explanation:
{{
  "hookScore": 68,
  "hookAnalysis": "The opening is decent but lacks a strong pattern interrupt to stop scrolling",
  "improvedHook": "What if I told you ONE change could double your engagement? Here is what most creators get wrong...",
  "retentionArc": [
    {{"section": "Intro", "start": 0, "end": 20, "energy": 65, "label": "Sets context"}},
    {{"section": "Build-up", "start": 20, "end": 50, "energy": 78, "label": "Rising tension"}},
    {{"section": "Peak", "start": 50, "end": 75, "energy": 90, "label": "Key insight delivered"}},
    {{"section": "Close", "start": 75, "end": 100, "energy": 55, "label": "CTA and wrap-up"}}
  ],
  "dropoffPoints": [
    {{"paragraph": "First 50 chars of weak section here", "reason": "Too much background info slows momentum", "fix": "Cut the backstory, jump straight to the value"}}
  ],
  "ctaAnalysis": {{
    "detected": "Subscribe for more",
    "score": 55,
    "improved": "If this helped you, share it with one creator friend who needs it right now"
  }},
  "pacingAnalysis": {{
    "wordsPerMinute": 140,
    "verdict": "good",
    "suggestion": "Pacing is solid. Consider adding a 2-second pause after your key insight for emphasis."
  }},
  "smartSuggestions": [
    {{"original": "I think this is important", "improved": "Here is why this matters to you", "reason": "Direct address increases engagement"}},
    {{"original": "in conclusion", "improved": "here is your action step", "reason": "Action-oriented language drives completion"}}
  ],
  "rewrittenScript": "Rewritten version of the script with all improvements applied goes here."
}}

Now analyze the ACTUAL script above and return real analysis in this exact JSON structure."""

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
