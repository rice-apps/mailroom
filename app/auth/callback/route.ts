import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  console.log("headers", JSON.stringify(request.headers));
  const host = request.headers.get("host") || requestUrl.host;
  if (
    !(JSON.parse(process.env.NEXT_PUBLIC_ALLOWED_HOSTS || "[]") ?? []).includes(
      host,
    )
  ) {
    throw new Error(
      `Invalid host ${host} in ${process.env.NEXT_PUBLIC_ALLOWED_HOSTS}`,
    );
  }

  const protocol = request.headers.get("x-forwarded-proto") || "http";

  const baseUrl = `${protocol}://${host}`;

  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${baseUrl}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${baseUrl}`);
}
