import { downloadTarget, isPreviewBot, previewPage } from "@/lib/download";

/* Server-side 302 to the right store (iOS ignores script redirects); chat
 * apps' link-preview bots get a small Open Graph page instead. The answer
 * depends on who is asking, so no shared cache may keep it. */
export function GET(request: Request): Response {
  const ua = request.headers.get("user-agent") || "";
  if (isPreviewBot(ua)) {
    return new Response(previewPage(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", Vary: "User-Agent" },
    });
  }
  const location = downloadTarget(ua);
  return new Response(`Found: ${location}\n`, {
    status: 302,
    headers: { Location: location, "Cache-Control": "no-store", Vary: "User-Agent", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const HEAD = GET;

/* anything else gets the old handler's answer */
function methodNotAllowed(): Response {
  return new Response("Method Not Allowed\n", {
    status: 405,
    headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export { methodNotAllowed as POST, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE, methodNotAllowed as OPTIONS };
