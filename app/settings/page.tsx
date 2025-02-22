"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function UserDetails() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [additionalEmail, setAdditionalEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [textNotifications, setTextNotifications] = useState(true);

  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleSaveChanges = () => {
    console.log("Changes saved");
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted");
  };

  return (
    <div className="min-h-screen bg-accent text-foreground flex justify-center items-center">
      <div className="w-full max-w-xl -mt-20">
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
                Eugenia Sung
              </span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Rice Email
              </span>
              <span className="mb-1 font-medium text-sm text-black">
                eys3@rice.edu
              </span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                NetID
              </span>
              <span className="mb-1 font-medium text-sm text-black">eys3</span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Residential College
              </span>
              <span className="mb-1 font-medium text-sm text-black">
                Martel
              </span>
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Phone Number
              </span>
              <Input
                placeholder="Enter Phone Number"
                className="placeholder:text-gray-350 border-black rounded-full h-9 w-80"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 w-full">
              <span className="mb-1 font-medium text-sm text-gray-500">
                Additional Email
              </span>
              <Input
                placeholder="Enter Additional Email"
                className="placeholder:text-gray-350 border-black rounded-full h-9 w-80"
                value={additionalEmail}
                onChange={(e) => setAdditionalEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <Button
                className="mt-2 w-50 h-8 bg-blue-900 hover:bg-blue-800 rounded-full mx-auto"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* -------------- Notification Settings --------------- */}
        <div className="p-8 space-y-2 border-none shadow-none w-full">
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

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-5">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">
                  Text Message
                </span>
              </div>
              <Switch
                checked={textNotifications}
                onCheckedChange={setTextNotifications}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              className="mt-2 w-50 h-8 bg-blue-900 text-white hover:bg-blue-800 rounded-full"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleNavigate("/kiosk")}
        className="absolute top-12 left-20"
      >
        <ArrowLeft
          className="w-10 h-7 text-gray-800 hover:text-gray-500"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
