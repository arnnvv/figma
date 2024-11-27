import { redirect } from "next/navigation";
import { getCurrentSession } from "@/actions";
import { JSX } from "react";
import { LogInComp } from "@/components/LoginComp";

export default async function Page(): Promise<JSX.Element> {
  const { session } = await getCurrentSession();
  if (session !== null) return redirect("/dashboard");
  return <LogInComp />;
}
