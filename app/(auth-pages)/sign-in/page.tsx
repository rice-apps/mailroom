import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Sign in</h1>
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in with Google
        </SubmitButton>
        <FormMessage message={searchParams} />
    </form>
  );
}
