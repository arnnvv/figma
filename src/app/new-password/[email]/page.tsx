import { getCurrentSession } from "@/actions";
import { ResetPasswordForm } from "@/components/ResetPassword";
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function Page(props: {
  params: Promise<{
    email: string;
  }>;
}): Promise<JSX.Element> {
  const params = await props.params;
  const { session } = await getCurrentSession();
  if (session !== null) return redirect("/dashboard");
  const emailBAD = params.email;
  const email = decodeURIComponent(emailBAD);

  return <ResetPasswordForm email={email} />;
}
