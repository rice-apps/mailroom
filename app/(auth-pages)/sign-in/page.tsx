import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center ">
      <form className="flex flex-col justify-center items-center align-middle gap-7 bg-gray-900 bg-opacity-75 rounded-lg p-20 items-center justify-center">
        <h1 className="text-4xl font-medium">📬 Mailroom Sign In</h1>
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in with Google
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </div>
  );
}
