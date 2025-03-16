"use server";

import Page from "./client";
import UserWrapper from "@/components/user-wrapper";

export default async function HomeServer() {
  return <UserWrapper component={Page}></UserWrapper>;
}
