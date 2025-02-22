"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchStudentsGivenCollege(
  college: string,
): Promise<any | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("college", college);

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }
    for (let i = 0; i < data.length; ++i) {
      //   now fetch all packages related to each user given student_uuid
      const packages = await supabase
        .from("packages")
        .select()
        .eq("user_id", data[i].id);

      if (packages.error) {
        console.error("Error fetching package:", packages.error);
        return null;
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
    .eq('email',netid+"@rice.edu")

    if (error) {
      console.log('Error fetching user:', error)
      return null
    }

    console.log(data)
    return data
  } catch (error){
    console.log("unexpected error",error)
  }
}

export async function isAnAdmin(netid: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('can_add_and_delete_packages')
    .eq('email', netid + "@rice.edu")
    .single(); // .single() ensures you get one row

  // Handling the response
  if (error) {
    console.error('Error selecting data:', error);
    return null; // Return null in case of error
  }

  // If you want to debug and see the result
  console.log('Selected data:', data); // Check the returned data structure

  // Return the boolean value
  if (data) {
    return data.can_add_and_delete_packages; // Access the boolean field
  } else {
    console.log('No data found for this user.');
    return null; // Return null if no data is found
  }
}


export async function userExists(netid: string) {
  const supabase = createClient();
  
  const { count, error } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true })
  .eq('email', netid + "@rice.edu");

if (error) {
  console.error('Error querying the table:', error);
} else if (count != null && count > 0) {
  return true
} else {
  return false
}

}