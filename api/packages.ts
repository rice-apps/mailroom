"use server";

import { createClient } from "@/utils/supabase/server";
import { create } from "domain";

export async function fetchUser(email: string): Promise<any | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();
    console.log(data);

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

export async function fetchPackagesbyUser(
  user_id: string,
): Promise<any | null> {
  const supabase = await createClient();

  console.log(34, user_id);

  try {
    const { data, error } = await supabase
      .from("packages")
      .select()
      .eq("user_id", user_id)
      .eq("claimed", false);
    if (error) {
      console.error(error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

export async function claimPackage(
  package_identifier: string,
): Promise<boolean | undefined> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("packages")
      .update({
        claimed: "true",
        date_claimed: new Date(Date.now()).toISOString(),
      })
      .eq("package_identifier", package_identifier);
    if (error) {
      console.error(
        `error claiming package with tracking id ${package_identifier}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      `error claiming package with tracking id ${package_identifier}`,
    );
    return false;
  }
}
