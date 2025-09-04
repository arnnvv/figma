"use client";

import { AtSign } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { changeUsernameAction } from "@/actions";
import { AuthFormComponent } from "./AuthFormComponent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const GetUsernameForm = (): JSX.Element => {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <AuthFormComponent
          action={changeUsernameAction}
          onSuccessAction={handleSuccess}
        >
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-black">Set Your Username</h1>
            <p className="text-sm text-black">
              Choose a unique username. Shouldn&apos;t start with google- or
              github-
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black">
                Username
              </Label>
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
};
