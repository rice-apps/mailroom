"use server";

import checkAuth from "@/api/checkAuth";
import { redirect } from "next/navigation";
import { ComponentType, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  account_created: string;
  can_add_and_delete_packages: boolean;
  can_claim_packages: boolean;
  can_administrate_users: boolean;
  user_type: string;
  college: string;
  is_subscribed_email: boolean;
  is_subscribed_text: boolean;
  additional_email: string | null;
  preferred_name: string | null;
}

interface UserWrapperProps<P> {
  component: ComponentType<P & { user: User }>;
  childProps?: Omit<P, "user">;
  children?: ReactNode;
}

export default async function UserWrapper<P>({
  component: Component,
  childProps = {} as Omit<P, "user">,
  children,
}: UserWrapperProps<P>) {
  const checkAuthorization = async () => {
    console.log("Checking authorization...");
    try {
      const response = await checkAuth();
      return response as User;
    } catch (error) {
      console.error("Authorization check failed:", error);
      return null;
    }
  };

  const user = await checkAuthorization();
  console.log("got data", user?.additional_email);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <Component {...(user as any)} {...(childProps as any)}>
      {children}
    </Component>
  );
}
