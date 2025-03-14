"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "../hooks/use-toast";

interface Student {
  netId: string;
  full_name: string;
  email: string;
  college: string;
  is_subscribed_email: boolean;
  additional_email: string | null;
}

export default function UserDetails() {
  const [additionalEmail, setAdditionalEmail] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [user, setUser] = useState<Student | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSaveChanges = () => {
    console.log("Changes saved");

    const updatedUser = {
      ...user,
      is_subscribed_email: emailNotifications,
      additional_email: additionalEmail,
    };

    Promise.all([
      supabase.functions.invoke("update-notifs", {
        body: { enabled: emailNotifications },
      }),
      supabase.functions.invoke("update-email", {
        body: { email: updatedUser.additional_email },
      }),
    ]).then(([notifsResult, emailResult]) => {
      if (notifsResult.error || emailResult.error) {
        console.error(
          "Error updating user:",
          notifsResult.error || emailResult.error,
        );
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

          setUser({
            netId: userData.net_id,
            full_name: userData.name,
            email: userData.email,
            college: userData.college,
            is_subscribed_email: userData.is_subscribed_email || true,
            additional_email: userData.additional_email,
          });
        }
      }
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
              <span className="mb-3 md:mb-1 font-medium text-sm text-black">
                {user?.full_name}
              </span>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Rice Email
              </span>
              <span className="mb-3 md:mb-1 font-medium text-sm text-black break-words">
                {user?.email}
              </span>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Residential College
              </span>
              <span className="mb-3 md:mb-1 font-medium text-sm text-black">
                {user?.college}
              </span>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 w-full">
              <span className="mb-2 font-medium text-sm text-gray-500">
                Additional Email
              </span>
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
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
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
          </div>
        </Card>
      </div>
    </div>
  );
}
