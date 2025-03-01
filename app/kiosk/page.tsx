"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, TruckIcon, PackageOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

import checkAuth from "../../api/checkAuth";
import ScanIcon from "@/components/scan-icon";
import AdminIcon from "@/components/admin-icon";
import CursorIcon from "@/components/cursor-icon";

export default function PackageOptions() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [name, setName] = useState("");

  const checkAuthorization = async () => {
    console.log("Checking authorization...");
    try {
      const response = await checkAuth();

      setIsAuthorized(response.can_add_and_delete_packages === true);
      setName(response.name);
    } catch (error) {
      console.error("Authorization check failed:", error);
      setIsAuthorized(false);
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
          {isAuthorized
            ? "Would you like to scan in a package, track all packages, or edit as an admin?"
            : "Would you like to scan in a package or track all packages?"}
        </h3>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full">
          <button
            onClick={() => handleNavigate("/scan")}
            className="relative bg-gray-100 bg-accent rounded-[3rem] border-[2px] border-[#BEBFBF] shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg py-2 px-2"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <ScanIcon className="w-24 h-24 text-foreground mb-8" />
              <h2 className="text-lg font-semibold text-black mb-2 rounded-3xl border border-black px-4 py-2">
                Scan In Package
              </h2>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-foreground transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
          <button
            onClick={() => handleNavigate("/settings")}
            className="absolute top-7 right-10 bg-gray-300 hover:bg-gray-400 rounded-full w-10 h-10 flex shadow-md"
          ></button>

          {isAuthorized && (
            <button
              onClick={() => handleNavigate("/admin")}
              className="relative bg-gray-100 bg-accent rounded-[3rem] border-[2px] border-[#BEBFBF] shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg py-2 px-2"
              >
              <div className="aspect-square p-8 flex flex-col items-center justify-center group">
                <CursorIcon className="w-24 h-24 text-gray-500 mb-8" />
                <h2 className="text-lg font-semibold text-black mb-2 rounded-3xl border border-black px-4 py-2">
                  Track Packages
                </h2>
                <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-gray-500 dark:text-gray-400 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </button>
          )}

          {isAuthorized && (
            <button
              onClick={() => handleNavigate("/settings")}
              className="relative bg-gray-100 bg-accent rounded-[3rem] border-[2px] border-[#BEBFBF] shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg py-2 px-2"
              >
              <div className="aspect-square p-8 flex flex-col items-center justify-center group">
                <AdminIcon className="w-24 h-24 text-gray-500 mb-8" />
                <h2 className="text-lg font-semibold text-black mb-2 rounded-3xl border border-black px-4 py-2">
                Manage Admin
                </h2>
                <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-gray-500 dark:text-gray-400 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
