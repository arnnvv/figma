"use client";

import { type ReactNode, useActionState, useEffect } from "react";
import { toast } from "sonner";

export type ActionResult =
  | { message: string | null; error?: never }
  | { error: string | null; message?: never };

export const FormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: (_: any, formdata: FormData) => Promise<ActionResult>;
}): JSX.Element => {
  const [state, formAction] = useActionState(action, {
    error: null,
  });

  useEffect(() => {
    if (state.error)
      toast.error(state.error, {
        id: "1",
        action: {
          label: "Close",
          onClick: (): string | number => toast.dismiss("1"),
        },
      });

    if (state.message)
      toast.success(state.message, {
        id: "2",
        action: {
          label: "Close",
          onClick: (): string | number => toast.dismiss("2"),
        },
      });
  }, [state]);

  return <form action={formAction}>{children}</form>;
};
