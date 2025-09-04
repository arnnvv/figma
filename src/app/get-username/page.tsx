import { redirect } from "next/navigation";
import type { JSX } from "react";
import { getCurrentSession } from "@/actions";
import { GetUsernameForm } from "@/components/GetUsernameForm";

export default async function GetUsernamePage(): Promise<JSX.Element> {
  const { session, user } = await getCurrentSession();
  if (session === null || !user) {
    redirect("/login");
  }

  if (
    !(
      user.username.startsWith("google-") || user.username.startsWith("github-")
    )
  ) {
    redirect("/dashboard");
  }

  return <GetUsernameForm />;
}
