// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ?? "");

  const authHeader = req.headers.get("Authorization")!;
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const { data } = await supabase.auth.getUser(token);
  const user = data.user;
  const { id } = user;
  const callerUserResp = await supabase
    .from("users")
    .select("can_add_and_delete_packages")
    .eq("email", data.user.email)
    .single();

  if (
    callerUserResp.error ||
    !callerUserResp.data.can_add_and_delete_packages
  ) {
    return new Response("Insufficient permissions", {
      status: 403,
      headers: corsHeaders,
    });
  }

  const { ids } = await req.json();
  for (const id of ids) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
});

/* To invoke locally:
  
    1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
    2. Make an HTTP request:
  
    curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-user' \
      --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
      --header 'Content-Type: application/json' \
      --data '{"name":"Functions"}'
  
  */
