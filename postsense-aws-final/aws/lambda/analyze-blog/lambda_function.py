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
        audience = body.get("audience", "general audience")
        goal     = body.get("goal", "educate")

        if not content:
            raise ValueError("Missing required field: content")

        prompt = f"""You are an expert blog and SEO content strategist for Indian creators.
Analyze this blog post targeting "{audience}" with the goal to "{goal}".

BLOG CONTENT:
\"\"\"{content}\"\"\"

Return ONLY valid JSON, no markdown, no explanation:
{{
  "readabilityScore": 72,
  "gradeLevel": "Grade 9",
  "readTime": "4 min read",
  "seoScore": 65,
  "keywordDensity": "Main keyword appears 3 times. Consider 5-7 times for better SEO density.",
  "metaDescriptionSuggestion": "Discover how PostSense helps Indian creators analyze content before posting using Amazon Bedrock AI.",
  "structureAnalysis": {{
    "hookStrength": 60,
    "flowScore": 75,
    "conclusionStrength": 55,
    "feedback": "Good flow overall. The intro could be punchier and the conclusion needs a stronger CTA."
  }},
  "toneConsistency": {{
    "score": 78,
    "shifts": [{{"location": "Third paragraph", "issue": "Tone shifts from professional to casual abruptly", "fix": "Maintain the professional tone throughout or signal the shift deliberately"}}]
  }},
  "headlineAlternatives": [
    {{"headline": "How Indian Creators Are Using AI to 10x Their Engagement in 2025", "ctrScore": 88, "reason": "Numbers + local relevance + year = high CTR"}},
    {{"headline": "Stop Posting Blindly: The AI Tool Every Creator Needs", "ctrScore": 82, "reason": "Pain point + solution structure works well"}},
    {{"headline": "We Analyzed 100 Posts Using Amazon Bedrock. Here Is What We Found.", "ctrScore": 79, "reason": "Data-driven headlines build credibility"}}
  ],
  "contentGaps": [
    {{"topic": "Real user testimonials or case studies", "impact": "Adds social proof which dramatically increases trust"}},
    {{"topic": "Step-by-step getting started guide", "impact": "Reduces friction for new readers to take action"}}
  ],
  "paragraphImprovements": [
    {{"original": "First 80 characters of a weak paragraph here", "improved": "Stronger rewritten version with clearer language", "reason": "More direct and scannable"}}
  ]
}}

Now analyze the ACTUAL blog content above and return real analysis in this exact JSON structure."""

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
