import { getCurrentSession } from "@/actions";
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function Page(): Promise<JSX.Element> {
  const { session } = await getCurrentSession();
  if (session!==null) return redirect("/dashboard");
  return <>HI</>
}
