"use client"

import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default async function Packages() {
  const supabase = createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return redirect("/sign-in");
//   }

 
 
  useEffect(() => {

    const fetchUser = async () => {
        const { data: user } = await supabase.from("users").select();
        console.log(user)
    }
 
    fetchUser()
  }, [])

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      hi user
    </div>
  );
}
