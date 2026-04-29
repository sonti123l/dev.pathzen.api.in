import "dotenv/config";


// 1. Create a live input — called when teacher goes live
export async function createLiveInput(title: string) {
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
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

  // The live input UID — same UID used in ALL Cloudflare URLs for this stream
  const liveInputId: string = data.result.uid;

  // The WebRTC publish URL — teacher uses this to broadcast from their browser
  // Format: https://customer-{subdomain}.cloudflarestream.com/{liveInputId}/webRTC/publish
  const streamKey: string = data.result.webRTC?.url;

  if (!streamKey) {
    throw new Error("Cloudflare did not return a WebRTC publish URL");
  }

  // NOTE: Cloudflare live input creation does NOT return playback.hls in its response.
  // That field only exists on recorded video objects.
  // The HLS manifest URL for a live input is always this pattern:
  //   https://customer-{subdomain}.cloudflarestream.com/{liveInputId}/manifest/video.m3u8
  // We extract the customer subdomain from the WebRTC URL (it's already there).
  const match = streamKey.match(/(https:\/\/customer-[^/]+\.cloudflarestream\.com)/);
  if (!match) {
    throw new Error(`Could not parse Cloudflare customer subdomain from: ${streamKey}`);
  }
  const customerSubdomain = match[1];
  // e.g. https://customer-loe8uzh3j24f0ndb.cloudflarestream.com

  const hlsUrl = `${customerSubdomain}/${liveInputId}/manifest/video.m3u8`;

  // FIX: The correct embed URL for live inputs is iframe.cloudflarestream.com
  // The old pattern (customer-subdomain/uid/iframe) only works for recordings, NOT live.
  const iframeUrl = `https://iframe.cloudflarestream.com/${liveInputId}`;

  return {
    liveInputId,
    streamKey,
    hlsUrl,
    iframeUrl,
  };
}
// 2. Get viewer count — teacher polls this every 5 seconds
export async function getViewerCount(liveInputId: string) {
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs/${liveInputId}/videos`,
    {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    },
  );
  const data = await res.json();
  return data.result?.[0]?.liveInput?.currentViewers ?? 0;
}

// 3. Check if Cloudflare is ACTUALLY receiving the live stream from the teacher.
export async function checkIsStreamLive(liveInputId: string): Promise<boolean> {
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/live_inputs/${liveInputId}`,
    {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    },
  );
  const data = await res.json();

  // state will be "connected" when video is actively flowing to Cloudflare.
  // Before video flows, it's usually "disconnected" or null.
  return data.result?.status?.current?.state === "connected";
}

// 3. Get recording URL — called after teacher ends stream
export async function getRecordingUrl(liveInputId: string) {
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
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
