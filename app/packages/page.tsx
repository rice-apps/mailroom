"use client";

import { useEffect, useState } from "react";
import { Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUser, fetchPackagesbyUser, claimPackage } from "@/api/packages";
import { createClient } from "@/utils/supabase/client";

interface User {
  id: string;
  email: string;
  name: string;
  account_created: string;
  can_add_and_delete_packages: boolean;
  can_claim_packages: boolean;
  can_administrate_users: boolean;
  user_type: string;
  user_id: string;
}

interface Package {
  id: string;
  recipient_name: string;
  package_identifier: string;
  claimed: boolean;
  date_added: string;
  date_claimed: string | null;
  extra_information: string;
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [currentStudentEmail, setCurrentStudentEmail] = useState<string | null>(
    null,
  );
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  // Get the current user email from Supabase
  useEffect(() => {
    const getUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) {
        setCurrentStudentEmail(user.email);
      }
    };

    getUserEmail();
  }, []);

  // Fetch the user and package data using the email
  useEffect(() => {
    const fetchData = async () => {
      if (currentStudentEmail) {
        try {
          const userData = await fetchUser(currentStudentEmail);
          setUser(userData);

          const fetchedPackages = await fetchPackagesbyUser(userData.id);
          setPackages(fetchedPackages);
        } catch (err) {
          setError("Failed to load data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [currentStudentEmail]);

  // Once the user is available, fetch their current notifications setting.
  useEffect(() => {
    const fetchNotificationSetting = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("is_subscribed_email")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching notification settings:", error);
        } else if (data) {
          setNotificationsEnabled(data.is_subscribed_email);
        }
      }
    };

    fetchNotificationSetting();
  }, [user]);

  const handleClaim = async (id: string) => {
    try {
      const success = await claimPackage(id);
      if (success && packages) {
        const newPackages = packages.filter((pack) => pack.id !== id);
        setPackages(newPackages);
      }
    } catch (err) {
      setError("Failed to claim package. Please try again.");
    }
  };

  const handleNotificationChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const enableNotifications = e.target.value === "enable";
    setNotificationsEnabled(enableNotifications);

    // Get the netID of the logged in user using supabase.auth.getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No logged in user found");
      return;
    }
    const email = user.email;

    // Update the notifications setting in the Supabase table
    const { error } = await supabase
      .from("users")
      .update({ is_subscribed_email: enableNotifications })
      .eq("email", email)
      .select();

    if (error) {
      console.error("Error updating notifications setting:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user?.name}</CardTitle>
          <CardDescription>Here's an overview of your packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              <span>Total Packages: {packages?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Dropdown */}
      <div className="mb-8">
        <label htmlFor="notifications" className="mr-2 font-medium   ">
          Email Notifications:
        </label>
        <select
          id="notifications"
          value={notificationsEnabled ? "enable" : "disable"}
          onChange={handleNotificationChange}
          className="border rounded p-2m bg-background"
        >
          <option value="enable">Enabled</option>
          <option value="disable">Disabled</option>
        </select>
      </div>

      {packages && packages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.package_identifier}</CardTitle>
                <CardDescription>
                  Added on: {new Date(item.date_added).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{item.extra_information}</p>
                <Button onClick={() => handleClaim(item.id)} className="w-full">
                  Claim Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold">No packages available</p>
            <p className="text-muted-foreground">
              You don't have any packages to claim at the moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
