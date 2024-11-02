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


"use client";  // Mark as Client Component

import { createClient } from '@/utils/supabase/client';  // Use client-side Supabase
import React, { useState } from 'react';

const supabase = createClient();

interface PackageInfo {
  id?: string;
  recipient_name?: string;
  email?: string;
  date_added?: string;
  package_identifier?: string;
  claimed: boolean;
  date_claimed: string;
  extra_information?: string;
}

const PackageInfoForm: React.FC = () => {
  const [formData, setFormData] = useState<PackageInfo>({
    claimed: false,
    date_claimed: 'unclaimed',
  });
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('packages')
      .insert([
        {
          claimed: formData.claimed,
          claimed_date: formData.date_claimed,
          recipient_name: formData.recipient_name,
          email: formData.email,
          date_added: formData.date_added,
          package_identifier: formData.package_identifier,
          extra_information: formData.extra_information,
        },
      ]);

    if (error) {
      console.error("Error inserting package info:", error.message);
      setConfirmationMessage("Error submitting data. Please try again.");
    } else {
      console.log("Package info inserted successfully!");
      setConfirmationMessage("Package information submitted successfully!");
    }
  };

  return (
    <div>
      <h1 style={{ fontWeight: 'bold' }}>Package Information</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Recipient Name:
          <input
            type="text"
            name="recipient_name"
            value={formData.recipient_name || ''}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Date Added:
          <input
            type="date"
            name="date_added"
            value={formData.date_added || ''}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Package Identifier:
          <input
            type="text"
            name="package_identifier"
            value={formData.package_identifier || ''}
            onChange={handleChange}
          />
        </label>
        <br />

        <label>
          Extra Information:
          <textarea
            name="extra_information"
            value={formData.extra_information || ''}
            onChange={handleChange}
          />
        </label>
        <br />

        <button type="submit">Submit</button>
      </form>

      {confirmationMessage && <p>{confirmationMessage}</p>}
    </div>
  );
};

export default PackageInfoForm;






// "use client";  // Mark as Client Component
// // import { createClient } from '@/utils/supabase/server';
// import { createClient } from '@/utils/supabase/client';  // Use client-side Supabase
// import React, { useState } from 'react';

// const supabase = createClient();

// interface PackageInfo {
//   id?: string;
//   recipient_name?: string;
//   email?: string;
//   date_added?: string;
//   package_identifier?: string;
//   claimed: boolean;
//   date_claimed: string;
//   extra_information?: string;
// }

// // what's the difference between id and package_identifier? for now, will assume id is rice ID
// // how should the package_identifer (barcode number) be populated?
// // const package_info: PackageInfo = {
// //   claimed: false,
// //   date_claimed: 'unclaimed',
// // };

// const PackageInfoForm: React.FC = () => {
//   // const [formData, setFormData] = useState<PackageInfo>({
//   //   ...package_info,
//   // });

//   const [formData, setFormData] = useState<PackageInfo>({
//     claimed: false,
//     date_claimed: 'unclaimed',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // You can now send formData to Supabase or handle it as needed
//     console.log("Form submitted:", formData);
//   };

//   return (
//     <div>
//       <h2>Package Information</h2>
//       <form onSubmit={handleSubmit}>
//         <label>
//           Recipient Name:
//           <input
//             type="text"
//             name="recipient_name"
//             value={formData.recipient_name || ''}
//             onChange={handleChange}
//           />
//         </label>
//         <br />

//         <label>
//           Email:
//           <input
//             type="email"
//             name="email"
//             value={formData.email || ''}
//             onChange={handleChange}
//           />
//         </label>
//         <br />

//         <label>
//           Date Added:
//           <input
//             type="date"
//             name="date_added"
//             value={formData.date_added || ''}
//             onChange={handleChange}
//           />
//         </label>
//         <br />

//         <label>
//           Package Identifier:
//           <input
//             type="text"
//             name="package_identifier"
//             value={formData.package_identifier || ''}
//             onChange={handleChange}
//           />
//         </label>
//         <br />

//         <label>
//           Extra Information:
//           <textarea
//             name="extra_information"
//             value={formData.extra_information || ''}
//             onChange={handleChange}
//           />
//         </label>
//         <br />

//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// };

// export default PackageInfoForm;

// const insertPackageInfo = async () => {
//   const { error } = await supabase
//     .from('packages')
//     .insert([
//       {
//         claimed: package_info.claimed,
//         claimed_date: package_info.date_claimed,
//         recipient_name: package_info.recipient_name,
//         email: package_info.email,
//         date_added: package_info.date_added,
//         package_identifier: package_info.package_identifier,
//         extra_information: package_info.extra_information,
//       },
//     ]);

//   if (error) {
//     console.error("Error inserting package info:", error.message);
//   } else {
//     console.log("Package info inserted successfully!");
//   }
// };