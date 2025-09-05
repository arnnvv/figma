"use client";

import { useId } from "react";
import { signUpAction } from "@/actions";
import { AuthFormComponent } from "./AuthFormComponent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SignupForm() {
  const emailId = useId();
  const usernameId = useId();
  const passwordId = useId();

  return (
    <AuthFormComponent action={signUpAction}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={emailId} className="text-sm font-medium">
            Email
          </Label>
          <Input
            name="email"
            id={emailId}
            placeholder="email@example.com"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={usernameId} className="text-sm font-medium">
            Username
          </Label>
          <Input
            name="username"
            id={usernameId}
            placeholder="Pick a Username"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={passwordId} className="text-sm font-medium">
            Password
          </Label>
          <Input
            type="password"
            name="password"
            id={passwordId}
            placeholder="**********"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-black hover:bg-gray-800 text-white py-2 mt-6"
      >
        Sign Up
      </Button>
    </AuthFormComponent>
  );
}
