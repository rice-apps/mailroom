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

    // console.log(data)

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

type StudentData = {
  "Full Name": string;
  netID: string;
};

export async function insertUsersGivenCollege(
  college: string,
  students: StudentData[],
): Promise<any | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from("users").insert(
      students.map((student) => ({
        college,
        user_type: "student",
        email: `${student.netID}@rice.edu`,
        name: student["Full Name"],
        can_add_and_delete_packages: false,
        can_claim_packages: true,
        can_administrate_users: false,
      })),
    );

    if (error) {
      console.error("Error inserting user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

export async function deleteInactiveUsers(emails: Array<string>) {
  console.log("HEY GUYS",emails)
  const supabase = createClient();
  try {
    const {data,error} = await supabase
    .from("users")
    .delete()
    .filter("email","not.in",`(${emails.map((email) => `'${email}'`).join(",")})`)
    .neq("can_add_and_delete_packages",true)
    console.log(data,"HAHHAHAHAHAH")
    console.log(error,"what?")
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("unexpected error",e.message)
      
    }
  }
}
