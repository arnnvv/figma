"use client";
import { verifyOTPAction, resendOTPAction } from "@/actions";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type JSX,
  type KeyboardEvent,
  useTransition,
  useState,
} from "react";
import { toast } from "sonner";

interface OTPInputProps {
  userEmail: string;
}

export function OTPInput({ userEmail }: OTPInputProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [isResendPending, startResendTransition] = useTransition();
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleInput = (e: FormEvent<HTMLInputElement>, index: number) => {
    const input = e.currentTarget;
    input.value = input.value.toUpperCase();
    if (input.value.length >= 1) {
      if (index < 7) {
        const nextInput = document.querySelector<HTMLInputElement>(
          `input[name='otp[${index + 1}]']`,
        );
        nextInput?.focus();
      } else if (index === 7) {
        input.form?.requestSubmit();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      const prevInput = document.querySelector<HTMLInputElement>(
        `input[name='otp[${index - 1}]']`,
      );
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await verifyOTPAction(formData);
      if (result?.success) {
        toast.success(result.message);
        router.push("/dashboard");
      } else {
        toast.error(result?.message);
      }
    });
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;

    startResendTransition(async () => {
      try {
        const result = await resendOTPAction();
        if (result?.success) {
          toast.success(result.message);
          // Start 60-second cooldown
          setResendCooldown(60);
          const cooldownTimer = setInterval(() => {
            setResendCooldown((prev) => {
              if (prev <= 1) {
                clearInterval(cooldownTimer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          toast.error(result?.message);
        }
      } catch {
        toast.error("Failed to resend OTP. Please try again.");
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-4">
          {[...Array(8)].map((_, index) => (
            <input
              key={index}
              type="text"
              pattern="[A-Za-z0-9]"
              maxLength={1}
              name={`otp[${index}]`}
              className="w-12 h-16 text-2xl text-center border-b-2 border-gray-300 bg-transparent text-gray-800 uppercase focus:outline-none focus:border-blue-500 transition-colors"
              required
              autoFocus={index === 0}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <button type="submit" disabled={isPending} className="hidden" />
      </form>
      <div className="flex justify-between items-center mt-4 px-2">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isResendPending || resendCooldown > 0}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors 
          disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Didn't Receive OTP?"}
        </button>
        <p className="text-gray-600 text-sm text-right">
          The OTP was sent to {userEmail}.
        </p>
      </div>
    </div>
  );
}
