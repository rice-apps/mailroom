import Link from "next/link";
import { Shield, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <Shield className="w-20 h-20 text-blue-900" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. Please contact an
          administrator if you believe this is an error.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/packages"
            className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition"
          >
            <Home className="mr-2 w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
