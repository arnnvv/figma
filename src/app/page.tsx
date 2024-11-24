import { getCurrentSession } from "@/actions";
import { redirect } from "next/navigation";

export default async (): Promise<never> => {
  const { session } = await getCurrentSession();
  if (!session) return redirect("/login");
  else return redirect("/dashboard");
};
