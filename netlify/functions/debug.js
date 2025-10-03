export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      SITE_ID: !!process.env.NETLIFY_SITE_ID,
      BLOBS_TOKEN: !!process.env.NETLIFY_BLOBS_TOKEN,
    }),
  };
}
