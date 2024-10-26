// This page is for the college coordinators (ccs) to input package information.
// Need to request input for the following fields:
//    id, recipient_name, email, date_added, package_identifier(??), extra_information
// These fields will have defaults:
//    claimed: False, date_claimed: null(?)
// A mapping of these fields should be built to insert into supabase table packages.


// First, we need to request the information from the webpage
//    Front-end pending on design
//    Back-end http requests?
//    Save the responses to a mapping of the column name to the response
// Second, update the supabase table with the package information
//    Build a mapping of the all columns name : response
//    Insert the mapping
// Third, maybe display back the entire package information
//    Pop-up? Ask them to confirm the details? Has a button to return and edit?


// The following is from the page built from a practice sprint, just a placeholder.

import { createClient } from '@/utils/supabase/server';

export default async function Names() {
  const supabase = createClient();
  // const { data: names } = await supabase.from("developer_data").select().filter('name', 'in', '("Trisha")').single();

  return (
    // <>
    //   <main className="flex-1 flex flex-col gap-6 px-4">
    //     <h2 className="font-medium text-xl mb-4">Hi, my name is {names.name} and I'm a {names.year}.</h2>
    //     {/* <pre>{JSON.stringify(names, null, 2)}</pre> */}
    //   </main>
    // </>
  );
}

