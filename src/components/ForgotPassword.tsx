"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { forgotPasswordAction } from "@/actions";
import { FormComponent } from "@/components/FormComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ForgotPassword = (): JSX.Element => {
  const router = useRouter();

  const handleSuccess = (formData: FormData) => {
    const email = formData.get("email") as string;
    router.push(`/forgot2/${email}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-black">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>
        <FormComponent
          action={forgotPasswordAction}
          onSuccessAction={handleSuccess}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="sr-only">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input bg-background text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input sm:text-sm"
                placeholder="example@example.com"
                required
              />
            </div>
            <div>
              <Button
                type="submit"
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Send Reset Link
              </Button>
            </div>
          </div>
        </FormComponent>
        <div className="text-center mt-4">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
