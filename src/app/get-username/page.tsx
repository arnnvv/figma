import { getCurrentSession } from "@/actions";
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function GetUsername(): Promise<JSX.Element> {
const { session, user } = await getCurrentSession();
if (session===null) return redirect("/login");
if (!(user.username.startsWith('google-') || user.username.startsWith('github-'))) return redirect("/dashboard");
return <div className="accent-black">OAUTH WALE</div>
}
