// Answers with the id of the running deployment (the git commit on Vercel). Open tabs compare it with the id
// baked into their own bundle (see VersionCheck) and reload when they differ. The id is a build time constant,
// so this route is prerendered; the no-store header comes from next.config.ts.
export function GET() {
  return new Response(process.env.NEXT_PUBLIC_BUILD_ID ?? "local", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
