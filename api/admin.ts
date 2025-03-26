"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchStudentsGivenCollege(
  college: string,
): Promise<any | null> {
  const supabase = await createClient();

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

    console.log(data);

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

export async function updateAdmin(netid: string, is_admin: boolean) {
  const supabase = await createClient();
  console.log("hello", is_admin);
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ can_add_and_delete_packages: is_admin })
      .eq("email", netid + "@rice.edu");

    if (error) {
      console.log("Error fetching user:", error);
      return null;
    }

    console.log(data);
    return data;
  } catch (error) {
    console.log("unexpected error", error);
  }
}

export async function isAnAdmin(netid: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("can_add_and_delete_packages")
    .eq("email", netid + "@rice.edu")
    .single(); // .single() ensures you get one row

  // Handling the response
  if (error) {
    console.error("Error selecting data:", error);
    return null; // Return null in case of error
  }

  // If you want to debug and see the result
  console.log("Selected data:", data); // Check the returned data structure

  // Return the boolean value
  if (data) {
    return data.can_add_and_delete_packages; // Access the boolean field
  } else {
    console.log("No data found for this user.");
    return null; // Return null if no data is found
  }
}

export async function userExists(netid: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("email", netid + "@rice.edu");

  if (error) {
    console.error("Error querying the table:", error);
  } else if (count != null && count > 0) {
    return true;
  } else {
    return false;
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
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("users").upsert(
      students.map((student) => ({
        college,
        user_type: "student",
        email: `${student.netID}@rice.edu`,
        name: student["Full Name"],
        can_add_and_delete_packages: false,
        can_claim_packages: true,
        can_administrate_users: false,
      })),
      {
        onConflict: "email",
        ignoreDuplicates: true,
      },
    );

    if (error) {
      console.error("Error inserting user:", error);
      return null;
    }

    const deletedUsers = await supabase
      .from("users")
      .delete()
      .eq("college", college)
      .filter(
        "email",
        "not.in",
        `(${students.map((s) => `${s.netID}@rice.edu`).join(",")})`,
      )
      .neq("can_add_and_delete_packages", true)
      .select("id");

    if (deletedUsers.error) {
      console.error("Error inserting user:", deletedUsers.error);
      return null;
    }

    const deletedIds = deletedUsers.data.map((u) => u.id);
    if (deletedIds.length > 0) {
      await supabase.functions.invoke("delete-auth", {
        body: { ids: deletedIds },
      });
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}
