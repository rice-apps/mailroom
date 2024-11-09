"use client"


import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
// import { fetchPackagesbyUser, fetchUser } from "@/api/packages";

interface User {
    id: string;
    email: string;
    name: string;
    account_created: string;
    can_add_and_delete_packages: boolean;
    can_claim_packages: boolean;
    can_administrate_users: boolean;
    user_type: string;
  }

interface Package {

}


export default function Packages() {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [packages,setPackages] = useState<Package | null>(null)


  // useEffect(() => {
  //   console.log('page load')

  //   const fetchCurrentUser = async () => {
  //       console.log('in function call')
  //       const user = await fetchUser("evanjt06@gmail.com")

  //       setUser(user)
        
  //   }
   
  //   fetchCurrentUser()
  //   const fetchCurrentPackages = async () => {
  //     const packages = await fetchPackagesbyUser("evanjt06@gmail.com")
  //     console.log(packages)
  //     setLoading(false)
  //   }
  //   fetchCurrentPackages()
  // }, [])

  
  

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
        {loading ? "Loading..." :  
      <div>
        hi {user?.name}
        </div>
        }
    </div>
  );
}
