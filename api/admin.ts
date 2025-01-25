'use server'

import { createClient } from "@/utils/supabase/server"

export async function fetchStudentsGivenCollege(college: string): Promise<any | null> {
    const supabase = createClient()
  
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq('college', college)
  
      if (error) {
        console.error('Error fetching user:', error)
        return null
      }
      for (let i = 0; i < data.length; ++i) {
              //   now fetch all packages related to each user given student_uuid
            const packages = await supabase
                .from("packages")
                .select()
                .eq("user_id", data[i].id)

            if (packages.error) {
                console.error('Error fetching package:', packages.error)
                return null
            }

            data[i]["packages"] = packages.data || [];
      }

      console.log(data)
  
      return data
    } catch (error) {
      console.error('Unexpected error:', error)
      return null
    }

}

export async function updateAdmin(netid: string, is_admin: boolean) {
  const supabase = createClient()
  console.log("hello",is_admin)
  try {
    const {data,error } = await supabase
    .from("users")
    .update({can_add_and_delete_packages: is_admin})
    .eq('email',netid)

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    console.log(data)
    return data
  } catch (error){
    console.error("unexpected error",error)
  }
}