"use client";

import { JSX, type ReactNode, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type ActionResult = {
  success: boolean;
  message: string;
};

export const AuthFormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: (_: any, formdata: FormData) => Promise<ActionResult>;
}): JSX.Element => {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message, {
        id: "success-toast",
        action: {
          label: "Close",
          onClick: (): string | number => toast.dismiss("success-toast"),
        },
      });
      router.push("/dashboard");
    } else if (state.message) {
      toast.error(state.message, {
        id: "error-toast",
        action: {
          label: "Close",
          onClick: (): string | number => toast.dismiss("error-toast"),
        },
      });
    }
  }, [state, router]);

  return <form action={formAction}>{children}</form>;
};
