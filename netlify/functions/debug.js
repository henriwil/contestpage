export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        SITE_ID: process.env.NETLIFY_SITE_ID ? "exists" : "missing",
        BLOBS_TOKEN: process.env.NETLIFY_BLOBS_TOKEN ? "exists" : "missing",
        // 👇 Uncomment the next line ONLY for local testing (never in prod!)
        ACTUAL_TOKEN: process.env.NETLIFY_BLOBS_TOKEN,
      },
      null,
      2
    ),
  };
}
