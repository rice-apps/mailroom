"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInAction = async (formData: FormData) => {
  const supabase = createClient();
  const headersList = headers();
  const host = headersList.get("host") || "";
  if (
    !(JSON.parse(process.env.NEXT_PUBLIC_ALLOWED_HOSTS || "[]") ?? []).includes(
      host,
    )
  ) {
    throw new Error("Invalid host");
  }

  const protocol = headersList.get("x-forwarded-proto") || "http";

  const baseUrl = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        prompt: "consent",
      },
      redirectTo: baseUrl + "/auth/callback",
    },
  });
  console.log(baseUrl, data);
  redirect(data.url ?? "");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
