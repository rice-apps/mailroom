import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Kick out non-Rice gmail accounts
  if (!user.email?.endsWith("@rice.edu")) {
    supabase.auth.signOut();
    return encodedRedirect("error", "/sign-in", "Please sign in with your Rice email!");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
          {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
