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
  return {
    liveInputId: data.result.uid,
    streamKey: data.result.webRTC.url,
    hlsUrl: `https://customer-${CF_ACCOUNT_ID}.cloudflarestream.com/${data.result.uid}/manifest/video.m3u8`,
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
  const videoId = data.result?.[0]?.uid;
  return `https://customer-${CF_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
}
