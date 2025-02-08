// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    // { global: { headers: { Authorization: authHeader } } }
  );

  const url = new URL(req.url);
  const trackingID = url.searchParams.get("trackingID");

  // console.log(trackingID)

  const { data, error } = await supabaseClient
    .from("packages")
    .update({ claimed: true })
    .eq("package_identifier", trackingID)
    .select();

  console.log(error);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Redirect to a webpage after successful update
  return new Response(null, {
    status: 302, // Use 301 for permanent redirect
    headers: {
      Location: "http://localhost:3000/packages", // Replace with your target URL
      "Access-Control-Allow-Origin": "*",
    },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/claim-package' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
