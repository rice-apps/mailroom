"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, TruckIcon, PackageOpen } from "lucide-react";

export default function PackageOptions() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-8">
          Package Management
        </h1>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full">
          <button
            onClick={() => handleNavigate("/scan")}
            className="relative bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <TruckIcon className="w-24 h-24 text-gray-500 dark:text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                Check In
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Scan and register incoming packages
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-gray-500 dark:text-gray-400 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
          <button
            onClick={() => handleNavigate("/admin")}
            className="relative bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <PackageOpen className="w-24 h-24 text-gray-500 dark:text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                View Current Packages
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                View your college's packages
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-6 h-6 text-gray-500 dark:text-gray-400 transition-all duration-300 ease-in-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
          <button
            onClick={() => handleNavigate("/settings")}
            className="relative bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            <div className="aspect-square p-8 flex flex-col items-center justify-center group">
              <PackageOpen className="w-24 h-24 text-gray-500 dark:text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                Settings
              </h2>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
