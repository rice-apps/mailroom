"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, TruckIcon, PackageOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

import checkAuth from "../../api/checkAuth";

export default function PackageOptions() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthorization = async () => {
    console.log("Checking authorization...");
    try {
      const response = await checkAuth();

      setIsAuthorized(response.can_add_and_delete_packages === true);
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
        <h1 className="text-3xl font-bold text-center text-secondary-foreground mb-8">
          Package Management
        </h1>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full">
          <button
            onClick={() => handleNavigate("/scan")}
            className="relative bg-gray-100 bg-accent rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <TruckIcon className="w-24 h-24 text-gray-500 text-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                Check In
              </h2>
              <p className="text-forground text-center">
                Scan and register incoming packages
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-foreground transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
          <button
            onClick={() => handleNavigate("/settings")}
            className="absolute top-7 right-10 bg-gray-300 hover:bg-gray-400 rounded-full w-10 h-10 flex shadow-md"
          ></button>

          {isAuthorized ? (
            <div>
              <button
                onClick={() => handleNavigate("/admin")}
                className="relative bg-gray-100 text-foreground  rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
              >
                <div className="aspect-square p-8 flex flex-col items-center justify-center group">
                  <PackageOpen className="w-24 h-24 text-gray-500 mb-4" />
                  <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                    View Current Packages
                  </h2>
                  <p className="text-foreground text-center">
                    View your college's packages
                  </p>
                  <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-gray-500 dark:text-gray-400 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
