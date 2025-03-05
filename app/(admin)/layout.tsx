import { isAnAdmin } from "@/api/admin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient()
  const user = await supabase.auth.getUser()
  const authorized = await isAnAdmin(user.data.user?.email?.split("@")[0] ?? "")
  
  if (!authorized) {
    redirect("/unauthorized")
  }
  return (
    <>{children}</>
  );
}
