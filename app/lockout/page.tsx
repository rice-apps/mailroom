import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LockoutPage() {
  return (
    <div className="min-h-screen bg-accent p-8 flex items-center justify-center">
      <Card className="w-full max-w-lg rounded-3xl border-[2px] border-[#BEBFBF] shadow-md overflow-hidden">
        <CardHeader className="bg-white pb-3">
          <CardTitle className="text-2xl font-semibold text-[#00205B]">
            Account Not Found
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your account has not been added to the system yet
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <User className="h-10 w-10 text-[#00205B]" />
            </div>

            <h3 className="text-lg font-medium text-gray-800 mb-2 text-center">
              You need to be added by your college coordinator
            </h3>

            <p className="text-gray-600 mb-6 text-center">
              Your Rice email was recognized, but you haven't been added to the
              mailroom system yet. Please contact your college coordinator to
              request access.
            </p>

            <div className="bg-gray-50 p-4 rounded-xl w-full mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                What to do next:
              </h4>
              <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                <li>Email your college coordinator</li>
                <li>Ask them to add you to the mailroom system</li>
                <li>Include your full name and Rice netID in your message</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="rounded-full border border-[#00205B] text-[#00205B] hover:bg-[#00205B] hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
