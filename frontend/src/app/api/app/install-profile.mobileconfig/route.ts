import { readFile } from "node:fs/promises";
import { join } from "node:path";

function toPlistDate(date: Date): string {
  return date.toISOString();
}

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
  const origin = new URL(request.url).origin;
  const webUrl = `${origin}/`;
  const iconPath = join(process.cwd(), "public", "logo.png");
  const iconBuffer = await readFile(iconPath);
  const iconBase64 = iconBuffer.toString("base64");
  const now = toPlistDate(new Date());
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
      <key>Icon</key>
      <data>
${iconBase64}
      </data>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>SG 公交出行</string>
      <key>PayloadDescription</key>
      <string>配置 Web Clip</string>
      <key>PayloadDisplayName</key>
      <string>SG 公交出行</string>
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
      <key>URL</key>
      <string>${escapeXml(webUrl)}</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Install SG 公交出行 WebClip</string>
  <key>PayloadDisplayName</key>
  <string>SG 公交出行</string>
  <key>PayloadIdentifier</key>
  <string>com.sgbuscoming.profile</string>
  <key>PayloadOrganization</key>
  <string>SG Bus Coming</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${profileUuid}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadCreationDate</key>
  <date>${now}</date>
</dict>
</plist>
`;

  return new Response(plist, {
    headers: {
      "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sg-bus-coming.mobileconfig"',
      "Cache-Control": "no-store",
    },
  });
}
