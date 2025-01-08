import { getCurrentSession } from "@/actions";
import { ForgotOTP } from "@/components/ForgotOTP";
import { redirect } from "next/navigation";
import { JSX } from "react";
import { globalGETRateLimit } from "@/lib/request";

export default async function Page(props: {
  params: Promise<{
    email: string;
  }>;
}): Promise<JSX.Element | undefined> {
  if (!globalGETRateLimit()) return;
  const params = await props.params;
  const { session } = await getCurrentSession();
  if (session !== null) return redirect("/dashboard");
  const emailBAD = params.email;
  const email = decodeURIComponent(emailBAD);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Enter OTP</h1>
        <ForgotOTP userEmail={email} />
      </div>
    </div>
  );
}
