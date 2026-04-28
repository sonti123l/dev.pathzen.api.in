import "dotenv/config";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// 1. Create a live input — called when teacher goes live
export async function createLiveInput(title: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta: { name: title },
        recording: { mode: "automatic" },
      }),
    },
  );
  const data = await res.json();

  if (!data.result) {
    throw new Error(`Cloudflare error: ${JSON.stringify(data.errors)}`);
  }

  const streamKey = data.result.webRTC.url;
  // streamKey = https://customer-loe8uzh3j24f0ndb.cloudflarestream.com/UID/webRTC/publish

  // Extract the correct customer subdomain and UID from the stream key itself
  const match = streamKey.match(
    /(https:\/\/customer-[^/]+\.cloudflarestream\.com)\/([^/]+)\/webRTC/,
  );

  if (!match) {
    throw new Error(`Could not parse Cloudflare stream key: ${streamKey}`);
  }

  const customerSubdomain = match[1];
  // → https://customer-loe8uzh3j24f0ndb.cloudflarestream.com

  const videoUID = match[2];
  // → 79addb7441041ebeea986b1c27bfb714k28a76c05a98a5c842fe4490d167e4744

  return {
    liveInputId: data.result.uid,
    streamKey,
    videoUID,
    customerSubdomain,
    // Both built from the SAME account — no more mismatch
    hlsUrl: `${customerSubdomain}/${videoUID}/manifest/video.m3u8`,
    iframeUrl: `${customerSubdomain}/${videoUID}/iframe`,
  };
}
// 2. Get viewer count — teacher polls this every 5 seconds
export async function getViewerCount(liveInputId: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs/${liveInputId}/videos`,
    {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    },
  );
  const data = await res.json();
  return data.result?.[0]?.liveInput?.currentViewers ?? 0;
}

// 3. Get recording URL — called after teacher ends stream
export async function getRecordingUrl(liveInputId: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs/${liveInputId}/videos`,
    {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    },
  );
  const data = await res.json();
  const video = data.result?.[0];
  if (!video) return null;

  // Use the playback URL directly from Cloudflare — don't build it manually
  return video.playback?.hls ?? null;
}
