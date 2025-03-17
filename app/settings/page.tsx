"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@supabase/supabase-js";
import { useToast } from "../hooks/use-toast";

interface Student {
  netId: string;
  full_name: string;
  email: string;
  college: string;
  is_subscribed_email: boolean;
  additional_email: string | null;
  preferred_name: string | null;
}

export default function UserDetails() {
  const [additionalEmail, setAdditionalEmail] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [preferredName, setPreferredName] = useState<string | null>(null);
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSaveChanges = () => {
    supabase.functions
      .invoke("update-user", {
        body: {
          is_subscribed_email: emailNotifications,
          preferred_name: preferredName,
          additional_email: additionalEmail,
        },
      })
      .then(({ error }) => {
        if (error) {
          console.error("Error updating user:", error);
          toast({ title: `Failed to save.` });
        } else {
          console.log("User updated successfully");
          toast({ title: `Changes saved!` });
        }
      });
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted");
    supabase.functions.invoke("delete-user").then(({ data, error }) => {
      if (error) {
        console.error("Error deleting user:", error);
        toast({ title: `Failed to delete.` });
        return;
      }
      toast({ title: `Account deleted!` });
      router.push("/sign-in");
    });
  };

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("email", user.email);
        if (error) {
          console.error("Error fetching user:", error);
        }
        if (data && data.length > 0) {
          const userData = data[0];
          setEmailNotifications(userData.is_subscribed_email ?? true);
          setAdditionalEmail(userData.additional_email ?? "");
          setPreferredName(userData.preferred_name ?? "");

          setUser({
            netId: userData.net_id,
            full_name: userData.name,
            email: userData.email,
            college: userData.college,
            is_subscribed_email: userData.is_subscribed_email || true,
            additional_email: userData.additional_email,
            preferred_name: userData.preferred_name,
          });
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-accent text-foreground px-4 py-8 md:flex md:justify-center md:items-center">
      <div className="w-full max-w-xl mx-auto">
        <Card className="p-4 md:p-6 space-y-5 border-none shadow-md rounded-3xl">
          {/* -------------- Your Details --------------- */}
          <h2 className="text-xl md:text-2xl font-medium">Your Details</h2>
          <div className="space-y-5">
            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Name
              </span>
              {loading ? (
                <Skeleton className="h-5 w-40 mb-3 md:mb-1" />
              ) : (
                <span className="mb-3 md:mb-1 font-medium text-sm text-black">
                  {user?.full_name}
                </span>
              )}
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Rice Email
              </span>
              {loading ? (
                <Skeleton className="h-5 w-64 mb-3 md:mb-1" />
              ) : (
                <span className="mb-3 md:mb-1 font-medium text-sm text-black break-words">
                  {user?.email}
                </span>
              )}
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Residential College
              </span>
              {loading ? (
                <Skeleton className="h-5 w-32 mb-3 md:mb-1" />
              ) : (
                <span className="mb-3 md:mb-1 font-medium text-sm text-black">
                  {user?.college}
                </span>
              )}
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <div className="mb-1">
                <span className="font-medium text-sm text-gray-500">
                  Preferred Name
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Use the same name as your packages
                </p>
              </div>
              {loading ? (
                <Skeleton className="h-10 w-full rounded-full" />
              ) : (
                <Input
                  type="text"
                  placeholder="Mark Scout"
                  className="placeholder:text-gray-350 border-gray-300 rounded-full h-10 w-full"
                  value={preferredName ?? ""}
                  onChange={(e) => {
                    setPreferredName(e.target.value);
                  }}
                />
              )}
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-2 font-medium text-sm text-gray-500">
                Additional Email
              </span>
              {loading ? (
                <Skeleton className="h-10 w-full rounded-full" />
              ) : (
                <Input
                  type="email"
                  placeholder="example@domain.com"
                  className="placeholder:text-gray-350 border-gray-300 rounded-full h-10 w-full"
                  value={additionalEmail ?? ""}
                  onChange={(e) => {
                    setAdditionalEmail(e.target.value);
                  }}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
              )}
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-medium pt-2">
            Notification Settings
          </h2>
          <p className="text-sm text-gray-500">
            What notifications do you want to see?
          </p>

          <div className="space-y-5">
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            {loading ? (
              <>
                <Skeleton className="h-12 md:h-10 w-full md:w-40 md:mx-auto rounded-full" />
                <Skeleton className="h-12 md:h-10 w-full md:w-40 md:mx-auto rounded-full" />
              </>
            ) : (
              <>
                <Button
                  className="w-full md:w-auto md:mx-auto h-12 md:h-10 bg-blue-900 hover:bg-blue-800 rounded-full"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>

                <Button
                  className="w-full md:w-auto md:mx-auto h-12 md:h-10 bg-red-900 text-white hover:bg-red-800 rounded-full"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
