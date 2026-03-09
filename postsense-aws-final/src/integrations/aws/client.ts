/**
 * PostSense — AWS Lambda Integration
 * Replaces Supabase Edge Functions with AWS Lambda Function URLs
 * All AI powered by Amazon Bedrock (amazon.titan-text-express-v1)
 */

// AWS Lambda Function URL — single endpoint, routes by _function field
const LAMBDA_URL = "https://nbw36je6gxstqu5bqymohlgasi0hfnag.lambda-url.us-west-2.on.aws/";

type LambdaFunction =
  | "analyze-post"
  | "analyze-script"
  | "analyze-blog"
  | "repurpose-content"
  | "viral-predict";

interface LambdaResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

/**
 * Invokes an AWS Lambda function via Function URL.
 * Drop-in replacement for: supabase.functions.invoke(name, { body })
 */
async function invokeLambda<T = unknown>(
  functionName: LambdaFunction,
  body: Record<string, unknown>
): Promise<LambdaResponse<T>> {
  try {
    const response = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, _function: functionName }),
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      return { data: null, error: json.error || "Lambda request failed" };
    }

    return { data: json as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { data: null, error: message };
  }
}

/**
 * Drop-in replacement for the supabase client.
 * Usage: replace `supabase.functions.invoke(...)` with `awsLambda.functions.invoke(...)`
 */
export const awsLambda = {
  functions: {
    invoke: <T = unknown>(
      name: LambdaFunction,
      options: { body: Record<string, unknown> }
    ): Promise<LambdaResponse<T>> => invokeLambda<T>(name, options.body ?? {}),
  },
};
