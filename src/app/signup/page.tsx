import { redirect } from "next/navigation";
import { getCurrentSession } from "@/actions";
import type { JSX } from "react";
import { SignUpComp } from "@/components/SignUpComp";
import { globalGETRateLimit } from "@/lib/request";

export default async function Page(): Promise<JSX.Element | undefined> {
  if (!globalGETRateLimit()) return;
  const { session } = await getCurrentSession();
  if (session !== null) return redirect("/dashboard");

  return <SignUpComp />;
}
