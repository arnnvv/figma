import { changeUsernameAction, getCurrentSession } from "@/actions";
import { AuthFormComponent } from "@/components/AuthFormComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { AtSign } from "lucide-react";
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">Set Your Username</h1>
            <p className="mt-2 text-sm text-black">Choose a unique username.</p>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-black"
            >
              Username
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="e.g. johndoe"
                className="pl-10 text-black"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Set Username
          </Button>
        </AuthFormComponent>
      </div>
    </div>
  );
}
