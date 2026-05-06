import { WEBCLIP_ICON_BASE64 } from "./webclip-icon-base64";

export const runtime = "edge";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createUuid(): string {
  return crypto.randomUUID();
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const lang = requestUrl.searchParams.get("lang") === "en" ? "en" : "zh";
  const appName = lang === "en" ? "Bus Comming" : "巴士来了";
  const profileDescription =
    lang === "en" ? `Install ${appName} WebClip` : `安装 ${appName} WebClip`;
  const webUrl = `${origin}/`;
  const profileUuid = createUuid();
  const payloadUuid = createUuid();

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>${appName}</string>
      <key>PayloadDescription</key>
      <string>配置 Web Clip</string>
      <key>PayloadDisplayName</key>
      <string>${appName}</string>
      <key>PayloadIdentifier</key>
      <string>com.sgbuscoming.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>${payloadUuid}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>Icon</key>
      <data>${WEBCLIP_ICON_BASE64}</data>
      <key>URL</key>
      <string>${escapeXml(webUrl)}</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>${profileDescription}</string>
  <key>PayloadDisplayName</key>
  <string>${appName}</string>
  <key>PayloadIdentifier</key>
  <string>com.sgbuscoming.profile</string>
  <key>PayloadOrganization</key>
  <string>${appName}</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${profileUuid}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
`;

  return new Response(plist, {
    headers: {
      "Content-Type": "application/x-apple-aspen-config",
      "Content-Disposition": 'attachment; filename="sg-bus-coming.mobileconfig"',
      "Cache-Control": "no-store",
    },
  });
}
