"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import checkAuth from "../../../api/checkAuth";
import ScanIcon from "@/components/scan-icon";
import AdminIcon from "@/components/admin-icon";

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
            Would you like to scan in a package?
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
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
          <button
            onClick={() => handleNavigate("/settings")}
            className="absolute top-7 right-10 bg-gray-300 hover:bg-gray-400 rounded-full w-10 h-10 flex shadow-md"
          ></button>
        </div>
      </div>
    </div>
  );
}
