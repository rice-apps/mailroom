"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

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


  const handleSaveChanges = () => {
    console.log("Changes saved");

    const updatedUser = {
      ...user,
      is_subscribed_email: emailNotifications,
      additional_email: additionalEmail,
    };

    supabase
      .from("users")
      .update({
        is_subscribed_email: updatedUser.is_subscribed_email,
        additional_email: updatedUser.additional_email,
      })
      .eq("email", updatedUser.email)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating user:", error);
        } else {
          console.log("User updated successfully");
        }
      });
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted");
    supabase.functions.invoke('delete-user')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error deleting user:', error);
          return;
        }
        router.push('/sign-in');
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
          setEmailNotifications(userData.is_subscribed_email || true);

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
    <div className="min-h-screen bg-accent text-foreground flex justify-center items-center">
      <div className="w-full max-w-xl">
        {/* -------------- Your Details --------------- */}
        <div className="p-6 space-y-5 border-none shadow-none max-w-3xl">
          <h2 className="text-2xl font-medium">Your Details</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Name
              </span>
              <span className="mb-1 font-medium text-sm text-black">
                {" "}
                {user?.full_name}
              </span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Rice Email
              </span>
              <span className="mb-1 font-medium text-sm text-black">
                {user?.email}
              </span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Residential College
              </span>
              <span className="mb-1 font-medium text-sm text-black">
                {user?.college}
              </span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Additional Email
              </span>
              <Input
                type="email"
                placeholder="example@domain.com"
                className="placeholder:text-gray-350 border-black rounded-full h-9 w-80"
                value={additionalEmail ?? ""}
                onChange={(e) => {
                  setAdditionalEmail(e.target.value);
                }}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              />
            </div>
          </div>
          <h2 className="text-2xl font-medium">Notification Settings</h2>
          <p className="text-sm text-gray-500">
            What notifications do you want to see?
          </p>
          <div className="space-y-5">
            <div className="flex justify-between items-center mt-7">
              <div className="flex items-center space-x-5">
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              className="mt-2 w-50 h-8 bg-blue-900 hover:bg-blue-800 rounded-full mx-auto"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              className="mt-2 w-50 h-8 bg-red-900 text-white hover:bg-red-800 rounded-full"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
