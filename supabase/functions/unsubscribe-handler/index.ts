import { createClient } from "npm:@supabase/supabase-js";

const unsubscribeHandler = async (request: Request): Promise<Response> => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ?? "");
    const url = new URL(request.url);
    const netID = url.searchParams.get("netID");

    if (!netID) {
      console.error("Missing netID in request");
      return new Response("Missing netID", { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ is_subscribed_email: false })
      .eq("email", netID+"@rice.edu")
      .select()

    if (error) {
      console.error("Error unsubscribing:", error);
      return new Response(`Error unsubscribing: ${error}`, { status: 500 });
    }

    return new Response(`You have been unsubscribed from future notifications.`, { status: 200 });

  } catch (error) {
    console.error("Unexpected error in unsubscribeHandler:", error);
    return new Response(`Unexpected error occurred: `, { status: 500 });
  }
};

Deno.serve(unsubscribeHandler);