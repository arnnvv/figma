"use client";

import { useRouter } from "next/navigation";
import {
  Children,
  cloneElement,
  isValidElement,
  type JSX,
  type ReactNode,
  useTransition,
} from "react";
import { toast } from "sonner";
import { type ActionResult, isFormControl } from "@/lib/form-control";
import { Loader } from "./ui/loader";

export const SignOutFormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: () => Promise<ActionResult>;
}): JSX.Element => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const result = await action();

        if (result.success) {
          toast.success(result.message);
          router.push("/login");
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const disabledChildren = Children.map(children, (child) => {
    if (isValidElement(child) && isFormControl(child)) {
      return cloneElement(child, { disabled: isPending });
    }
    return child;
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {disabledChildren}
      {isPending && <Loader />}
    </form>
  );
};
