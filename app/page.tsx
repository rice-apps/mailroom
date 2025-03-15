// import Hero from "@/components/hero";
import { isAnAdmin } from "@/api/admin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/api/packages";

export default async function Index() {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const isAdmin = await isAnAdmin(user.data.user?.email?.split("@")[0] ?? "");

  if (isAdmin) {
    redirect("/home");
  } else {
    const college = (await fetchUser(user.data.user?.email ?? "")).college;
    if (college) {
      redirect("/packages");
    } else {
      redirect("/lockout");
    }
  }
}
