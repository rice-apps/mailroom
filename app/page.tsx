// import Hero from "@/components/hero";
import { isAnAdmin } from "@/api/admin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const isAdmin = await isAnAdmin(user.data.user?.email?.split("@")[0] ?? "");

  if (isAdmin) {
    console.log("admin");
    redirect("/kiosk");
  } else {
    console.log("student");
    redirect("/packages");
  }
}
