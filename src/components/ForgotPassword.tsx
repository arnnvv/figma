"use client";

import { type JSX, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/actions";
import { useRouter } from "next/navigation";

export const ForgotPassword = (): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await forgotPasswordAction(formData);

      if (result.success) {
        toast.success(result.message);
        const email = formData.get("email");
        router.push(`/forgot2/${email}`);
      } else {
        toast.error(result.message);
      }
    });
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
        <form className="mt-8 space-y-6" action={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email" className="sr-only">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input bg-background text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
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
