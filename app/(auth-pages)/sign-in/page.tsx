import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import Image from "next/image";
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
});

const figtreeClass = figtree.className;

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <div
      className={`${figtreeClass} flex flex-col w-screen min-h-screen justify-center items-center bg-white overflow-hidden font-[figtree]`}
    >
      <Image
        src="/mailroom_logo.png"
        width={200}
        height={200}
        alt=""
        priority={true}
        className="mb-6"
      />
      <form className="flex flex-col justify-center items-center align-middle gap-1 items-center justify-center">
        <h1 className={`text-2xl font-medium text-black pb-px`}>
          {" "}
          Welcome back to Mailroom!
        </h1>
        <h2 className={`text-sm font-medium text-grey-login-text-rgba mb-5`}>
          Login to your account to view packages
        </h2>
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          <Image
            src="/google-icon.webp"
            width={30}
            height={30}
            alt=""
            priority={true}
            className="mr-2"
          />
          Sign in with Google
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </div>
  );
}
