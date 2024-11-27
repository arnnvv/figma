import { JSX } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github } from 'lucide-react';
import { logInAction } from "@/actions";
import { AuthFormComponent } from "./AuthFormComponent";

export const LogInComp = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
    <Card className="w-full max-w-md bg-gray-100 border-none shadow-none">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-3xl font-bold text-center">Sign In</CardTitle>
        <p className="text-sm text-muted-foreground text-center">Enter your email and password to access your account</p>
      </CardHeader>
      <CardContent className="space-y-8">
      <AuthFormComponent action={logInAction}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              name="email"
              id="email"
              placeholder="email@example.com"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
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
              id="password"
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-2 mt-6">
          Sign In
        </Button>
        </AuthFormComponent>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
        <div className="w-full">
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-100 px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full bg-white hover:bg-gray-100 py-2">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full bg-white hover:bg-gray-100 py-2">
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  </div>
);
