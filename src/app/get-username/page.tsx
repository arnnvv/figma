import { changeUsernameAction, getCurrentSession } from "@/actions";
import { AuthFormComponent } from "@/components/AuthFormComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from 'lucide-react';
import { redirect } from "next/navigation";
import { JSX } from "react";

export default async function GetUsername(): Promise<JSX.Element> {
  const { session, user } = await getCurrentSession();
  if (session === null) return redirect("/login");
  if (
    !(
      user.username.startsWith("google-") || user.username.startsWith("github-")
    )
  )
    return redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <AuthFormComponent action={changeUsernameAction}>
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-black">Set Your Username</h1>
            <p className="text-sm text-black">
              Choose a unique username. Shouldn&apos;t start with google- or
              github-
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Pick a username"
                  className="pl-10 text-black"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Set Username
            </Button>
          </div>
        </AuthFormComponent>
      </div>
    </div>
  );
}
