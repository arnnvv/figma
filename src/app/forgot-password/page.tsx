import { redirect } from "next/navigation";
import type { JSX } from "react";
import { getCurrentSession } from "@/actions";
import { ForgotPassword } from "@/components/ForgotPassword";

export default async function Page(): Promise<JSX.Element> {
  const { session } = await getCurrentSession();
  if (session !== null) return redirect("/dashboard");
  return <ForgotPassword />;
}
