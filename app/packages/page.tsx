"use client"


import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { claimPackage, fetchPackagesbyUser, fetchUser } from "@/api/packages";

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
id:string,
recipient_name:string,
package_identifier:string,
claimed:boolean,
date_added:any,
date_claimed:any

extra_information:string

}


export default function Packages() {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [packages,setPackages] = useState<Package[] | null>(null)


  useEffect(() => {
    console.log('page load')

    const fetchCurrentUser = async () => {
        console.log('in function call')
        //todo: don't filter by email
        const user = await fetchUser("evanjt06@gmail.com")

        setUser(user)
        console.log("he")
        
    }
   
    fetchCurrentUser()
    const fetchCurrentPackages = async () => {
      //TODO: do not filter by email
      const packages = await fetchPackagesbyUser("evanjt06@gmail.com")
      
      const packs: Package[] = packages
      console.log('done')
      console.log(packs)
      setPackages(packs)
      setLoading(false)
    }
    fetchCurrentPackages()
    
  }, [])

  
  
  const claim = async (id:string) => {
    if (packages != null) {
      const success = await claimPackage(id)
      if (success) {
        const newPacks: Package[] = packages.filter(pack => pack.id !== id)
        setPackages(newPacks)
      }
      
    }
  }
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
        {loading ? "Loading..." :  
      <div>
        <div>hi {user?.name}</div>
        <ul>
        {packages!.map((item, index) => (
          <li key={item.id}>
            <div>
              {item.id}
              <button onClick={() => claim(item.id)}>Claim</button>
            </div>
          </li>
        ))}
      </ul>
      </div>
        
        }
    </div>
  );
}
