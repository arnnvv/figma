import { validateRequest } from "@/actions";
import { redirect } from "next/navigation";

export default async (): Promise<never> => {
  const { user } = await validateRequest();
  if (!user) return redirect("login");
  else return redirect("/dashboard");
};
