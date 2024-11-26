import { getCurrentSession } from "@/actions";
import { ForgotOTP } from "@/components/ForgotOTP";
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function Page(props: {
  params: Promise<{
    email: string;
  }>;
}): Promise<JSX.Element> {
  const params = await props.params;
  const email = (params.email as string) || "";
  const { session } = await getCurrentSession();
  if (session !== null) return redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Enter OTP</h1>
        <ForgotOTP userEmail={email} />
      </div>
    </div>
  );
}
