"use client"

import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUser } from "@/api/packages";

export default function Packages() {

    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState([])
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return redirect("/sign-in");
//   }

  useEffect(() => {
    console.log('page load')

    const fetchCurrentUser = async () => {
        console.log('in function call')
        const user = await fetchUser("evanjt06@gmail.com")

        setUser(user)
    }
   
    fetchCurrentUser()
  }, [])

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
        {!loading && 
      <div>
        hi {user?.name}
        </div>
        }
    </div>
  );
}
