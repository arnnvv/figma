"use client";

import { useRouter } from "next/navigation";
import { type JSX, useId } from "react";
import { resetPasswordAction } from "../actions";
import { AuthFormComponent } from "./AuthFormComponent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const ResetPasswordForm = ({
  email,
}: {
  email: string;
}): JSX.Element => {
  const router = useRouter();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const handleSuccess = () => {
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-black">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a new password for {email}
          </p>
        </div>
        <AuthFormComponent
          action={resetPasswordAction}
          onSuccessAction={handleSuccess}
        >
          <input type="hidden" name="email" value={email} />
          <div className="space-y-6">
            <div>
              <Label
                htmlFor={passwordId}
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <Input
                id={passwordId}
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-input bg-background text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input sm:text-sm"
                placeholder="New Password"
              />
            </div>
            <div>
              <Label
                htmlFor={confirmPasswordId}
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </Label>
              <Input
                id={confirmPasswordId}
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-input bg-background text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input sm:text-sm"
                placeholder="Confirm New Password"
              />
            </div>
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </AuthFormComponent>
      </div>
    </div>
  );
};
