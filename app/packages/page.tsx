"use client";

import { useEffect, useState } from "react";
import { Package, User, Bell, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/app/hooks/use-toast";
import * as Dialog from "@radix-ui/react-dialog";

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
  preferred_name: string | null;
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
  const { toast } = useToast();

  const [currentStudentEmail, setCurrentStudentEmail] = useState<string | null>(
    null,
  );
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  // Add these states for the preferred name onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferredName, setPreferredName] = useState("");
  const [saving, setSaving] = useState(false);

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

          // Check if we need to show the onboarding dialog
          if (userData && userData.preferred_name === null) {
            setPreferredName(userData.name || ""); // Default to their full name
            setShowOnboarding(true);
          }

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
    const { error } = await supabase.functions.invoke("update-user", {
      body: { is_subscribed_email: enableNotifications },
    });

    if (error) {
      console.error("Error updating notifications setting:", error);
    }
  };

  const handleSavePreferredName = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          preferred_name: preferredName,
        })
        .eq("id", user.id);

      if (error) throw error;

      setUser({
        ...user,
        preferred_name: preferredName,
      });

      setShowOnboarding(false);

      toast({
        title: "Preferred name saved",
        description: "Your preferred name has been set successfully.",
      });
    } catch (err) {
      console.error("Failed to save preferred name:", err);
      toast({
        title: "Failed to save name",
        description: "Please try again or check settings later.",
      });
    } finally {
      setSaving(false);
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
      {/* Preferred Name Onboarding Dialog */}
      <Dialog.Root open={showOnboarding} onOpenChange={setShowOnboarding}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content
            className="
              fixed
              top-1/2 left-1/2
              w-[90vw] max-w-lg
              -translate-x-1/2 -translate-y-1/2
              rounded-3xl bg-white
              shadow-lg
              border-[2px] border-[#BEBFBF]
              overflow-auto
              max-h-[85vh]
            "
          >
            <div className="p-6">
              <Dialog.Title className="text-2xl font-semibold text-[#00205B]">
                Set Your Preferred Name
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-1">
                Please provide the name you'd like to use for package pickups
              </Dialog.Description>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <User className="h-10 w-10 text-[#00205B]" />
                </div>

                <div className="w-full mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 text-center">
                    Make sure your name matches your packages
                  </h3>

                  <p className="text-gray-600 mb-6 text-center">
                    This name should match what's on your packages. This helps
                    identify you quickly when checking in packages.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-xl w-full mb-6">
                    <div className="flex items-start gap-3">
                      <Info size="18" className="text-blue-500 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Important:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>
                            Your preferred name should match your package labels
                          </li>
                          <li>If unsure, use your name on your student ID</li>
                          <li>You can change this later in settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="preferredName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Preferred Name
                    </label>
                    <Input
                      id="preferredName"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="Enter your preferred name"
                      className="rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowOnboarding(false)}
                  className="rounded-full border-[#00205B] text-[#00205B]"
                >
                  Later
                </Button>
                <Button
                  onClick={handleSavePreferredName}
                  disabled={!preferredName || saving}
                  className="rounded-full bg-[#00205B] text-white hover:bg-[#001845]"
                >
                  {saving ? "Saving..." : "Save Name"}
                  {!saving && <Check className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Card className="mb-8 rounded-3xl shadow-md border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold">
            Welcome, {user?.preferred_name ?? user?.name}
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
