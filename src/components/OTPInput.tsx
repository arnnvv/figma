"use client";
import { verifyOTPAction } from "@/actions";
import { useRouter } from "next/navigation";
import { FormEvent, JSX, KeyboardEvent, useTransition } from "react";
import { toast } from "sonner";

export function OTPInput(): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleInput = (e: FormEvent<HTMLInputElement>, index: number) => {
    const input = e.currentTarget;
    // Convert input to uppercase immediately
    input.value = input.value.toUpperCase();
    if (input.value.length >= 1) {
      if (index < 7) {
        const nextInput = document.querySelector<HTMLInputElement>(
          `input[name='otp[${index + 1}]']`,
        );
        nextInput?.focus();
      } else if (index === 7) {
        // Submit the form when the last input is filled
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

  return (
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
  );
}
