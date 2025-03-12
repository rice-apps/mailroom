"use client";

import { useEffect, useState } from "react";
import { Package, User, Bell } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleClaim = async (package_identifier: string) => {
    try {
      const success = await claimPackage(package_identifier);
      if (success && packages) {
        const newPackages = packages.filter(
          (pack) => pack.package_identifier !== package_identifier,
        );
        setPackages(newPackages);
      }
    } catch (err) {
      setError("Failed to claim package. Please try again.");
    }
  };

  const handleNotificationChange = async (value: string) => {
    const enableNotifications = value === "enable";
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
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Skeleton for welcome card */}
        <div className="mb-8 rounded-3xl shadow-md border-0 bg-white p-6">
          <div className="pb-2">
            <Skeleton className="h-8 w-64 mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-48 mb-5" /> {/* Description */}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full w-full md:w-40">
              <Skeleton className="h-5 w-5 mr-2 rounded-full" />{" "}
              {/* Package icon */}
              <Skeleton className="h-4 w-36" /> {/* Total packages text */}
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full w-full md:w-56">
              <Skeleton className="h-5 w-5 mr-2 rounded-full" />{" "}
              {/* User icon */}
              <Skeleton className="h-4 w-48" /> {/* Email text */}
            </div>
          </div>
        </div>

        {/* Skeleton for notifications section */}
        <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-3 rounded-full" />{" "}
              {/* Bell icon */}
              <Skeleton className="h-5 w-36" /> {/* Email Notifications text */}
            </div>
            <Skeleton className="h-10 w-[180px] rounded-full" />{" "}
            {/* Select dropdown */}
          </div>
        </div>

        {/* Skeleton for packages grid - show 3 package cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-3xl overflow-hidden border-0 shadow-md bg-white"
            >
              <div className="bg-gray-50 p-4 pb-3">
                <Skeleton className="h-6 w-40 mb-2" />{" "}
                {/* Package identifier */}
                <Skeleton className="h-4 w-32" /> {/* Added on date */}
              </div>
              <div className="p-6">
                <Skeleton className="h-4 w-full mb-2" /> {/* Info line 1 */}
                <Skeleton className="h-4 w-3/4 mb-4" /> {/* Info line 2 */}
                <Skeleton className="h-10 w-full rounded-full" /> {/* Button */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-8 rounded-3xl shadow-md border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold">
            Welcome, {user?.name}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Here's an overview of your packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
              <Package className="mr-2 h-5 w-5 text-[#00205B]" />
              <span className="font-medium">
                Total Packages: {packages?.length || 0}
              </span>
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
              <User className="mr-2 h-5 w-5 text-[#00205B]" />
              <span>{user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Setting */}
      <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-3 text-[#00205B]" />
            <h3 className="font-medium text-gray-700">Email Notifications</h3>
          </div>
          <Select
            value={notificationsEnabled ? "enable" : "disable"}
            onValueChange={handleNotificationChange}
          >
            <SelectTrigger className="w-[180px] rounded-full border-gray-200">
              <SelectValue placeholder="Notification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enable">Enabled</SelectItem>
              <SelectItem value="disable">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {packages && packages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <Card
              key={item.id}
              className="rounded-3xl overflow-hidden border-0 shadow-md"
            >
              <CardHeader className="bg-gray-50 pb-3">
                <CardTitle className="text-lg font-medium">
                  {item.package_identifier}
                </CardTitle>
                <CardDescription>
                  Added on: {new Date(item.date_added).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-gray-600">{item.extra_information}</p>
                <Button
                  onClick={() => handleClaim(item.package_identifier)}
                  className="w-full bg-[#00205B] text-white hover:bg-[#001845] rounded-full"
                >
                  Claim Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-3xl overflow-hidden border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-700">
              No packages available
            </p>
            <p className="text-gray-500 mt-2">
              You don't have any packages to claim at the moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
