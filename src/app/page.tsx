import { getCurrentSession } from "@/actions";
import { redirect } from "next/navigation";

export default async (): Promise<never> => {
  const { user, session } = await getCurrentSession();
  if (session === null) return redirect("/login");
  if (!user.verified) return redirect("/email-verification");
  else return redirect("/dashboard");
};
