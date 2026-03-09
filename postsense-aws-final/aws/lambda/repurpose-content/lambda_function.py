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
        platform = body.get("originalPlatform", body.get("sourcePlatform", "original"))

        if not content:
            raise ValueError("Missing required field: content")

        prompt = f"""You are an expert content strategist for Indian social media creators.
Repurpose this {platform} content for ALL major platforms simultaneously.

ORIGINAL CONTENT:
\"\"\"{content}\"\"\"

Return ONLY valid JSON, no markdown, no explanation:
{{
  "instagram": {{
    "caption": "Full engaging Instagram caption written here with emojis and storytelling",
    "hashtags": ["#ContentCreator", "#IndianCreator", "#AITools", "#SocialMedia", "#PostSense", "#DigitalMarketing", "#CreatorEconomy", "#Viral", "#Trending", "#India"],
    "tone": "Casual and vibey with emojis",
    "bestTime": "7-9 PM IST on Tuesday or Wednesday"
  }},
  "linkedin": {{
    "hook": "I spent 6 months learning this one lesson about content creation.",
    "post": "Full professional LinkedIn post written here. Multiple paragraphs. Uses line breaks for readability. Ends with a question to drive comments.",
    "bestTime": "8-10 AM IST on Tuesday or Thursday"
  }},
  "twitter": {{
    "tweets": [
      "Tweet 1: The hook - under 280 chars",
      "Tweet 2: The insight - under 280 chars",
      "Tweet 3: The proof - under 280 chars",
      "Tweet 4: The practical tip - under 280 chars",
      "Tweet 5: The CTA - under 280 chars"
    ],
    "bestTime": "12-1 PM or 7-8 PM IST"
  }},
  "youtube": {{
    "title": "Compelling YouTube title with keyword here (2025)",
    "description": "Full YouTube description here. Includes timestamps, links section, about section, hashtags at bottom.",
    "hook": "First 30 seconds hook script: Start with a bold statement or question that stops scrolling...",
    "tags": ["content creator", "social media", "AI tools", "Indian creator", "postsense"]
  }},
  "facebook": {{
    "post": "Full Facebook post here. More conversational. Can be longer. Tells a story.",
    "engagementQuestion": "What is your biggest challenge with social media content right now?",
    "bestTime": "1-3 PM or 7-9 PM IST"
  }}
}}

Now repurpose the ACTUAL content above and return real platform-specific content in this exact JSON structure."""

        response = bedrock.invoke_model(
            modelId="amazon.titan-text-express-v1",
            body=json.dumps({
                "inputText": prompt,
                "textGenerationConfig": {"maxTokenCount": 2048, "temperature": 0.5, "topP": 0.9}
            })
        )
        result  = json.loads(response["body"].read())
        ai_text = result["results"][0]["outputText"]

        json_match = re.search(r'\{[\s\S]*\}', ai_text)
        if not json_match:
            raise ValueError("No JSON found in Bedrock response")

        repurposed = json.loads(json_match.group())
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": True, "repurposed": repurposed})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": str(e)})
        }
