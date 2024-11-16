const PackageInfoForm: React.FC = () => {
    const [formData, setFormData] = useState<PackageInfo>({
      claimed: false,
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
            date_claimed: formData.date_claimed,
            // recipient_name: formData.recipient_name,
            // email: formData.email,
            date_added: formData.date_added,
            package_identifier: formData.package_identifier,
            extra_information: formData.extra_information,
            user_id: "a7d79e13-bdb3-4d8b-af8f-1f346eb3e1b0",
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
  };

  export default PackageInfoForm;