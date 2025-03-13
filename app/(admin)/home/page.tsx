"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, TruckIcon, PackageOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

import checkAuth from "../../../api/checkAuth";
import ScanIcon from "@/components/scan-icon";
import AdminIcon from "@/components/admin-icon";
import CursorIcon from "@/components/cursor-icon";
import PackageIcon from "@/components/package-icon";

export default function PackageOptions() {
  const router = useRouter();
  const [name, setName] = useState("");

  const checkAuthorization = async () => {
    console.log("Checking authorization...");
    try {
      const response = await checkAuth();
      setName(response.name);
    } catch (error) {
      console.error("Authorization check failed:", error);
    }
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const handleNavigate = async (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-accent p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-semibold text-center text-secondary-foreground mb-4">
          {`Hi ${name}!`}
        </h1>
        <h3 className="text-lg text-center text-muted-foreground mb-12">
          Would you like to enter kiosk mode, track your college's packages, or
          view your own packages?
        </h3>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full">
          <button
            onClick={() => handleNavigate("/kiosk")}
            className="relative bg-gray-100 bg-accent rounded-[3rem] border-[2px] border-[#BEBFBF] shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg py-2 px-2 w-full"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <ScanIcon className="w-24 h-24 text-foreground mb-8" />
              <h2 className="text-lg font-semibold text-black mb-2 rounded-3xl border border-black px-4 py-2 text-center">
                Enter Kiosk Mode
              </h2>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
          <button
            onClick={() => handleNavigate("/admin")}
            className="relative bg-gray-100 bg-accent rounded-[3rem] border-[2px] border-[#BEBFBF] shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg py-2 px-2 w-full"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <CursorIcon className="w-24 h-24 text-gray-500 mb-8" />
              <h2 className="text-lg font-semibold text-black mb-2 rounded-3xl border border-black px-4 py-2 text-center">
                Track Packages
              </h2>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>

          <button
            onClick={() => handleNavigate("/packages")}
            className="relative bg-gray-100 bg-accent rounded-[3rem] border-[2px] border-[#BEBFBF] shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg py-2 px-2 w-full"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <PackageIcon className="w-24 h-24 text-gray-500 mb-8" />
              <h2 className="text-lg font-semibold text-black mb-2 rounded-3xl border border-black px-4 py-2 text-center">
                View Your Packages
              </h2>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
