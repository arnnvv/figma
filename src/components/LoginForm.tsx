"use client";

import Link from "next/link";
import { useId } from "react";
import { logInAction } from "@/actions";
import { AuthFormComponent } from "./AuthFormComponent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function LoginForm() {
  const emailId = useId();
  const passwordId = useId();

  return (
    <AuthFormComponent action={logInAction}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor={passwordId} className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            id={passwordId}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-black hover:bg-gray-800 text-white py-2 mt-6"
      >
        Sign In
      </Button>
    </AuthFormComponent>
  );
}
