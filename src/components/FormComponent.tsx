"use client";

import { type ReactNode, useActionState, useEffect } from "react";
import { toast } from "sonner";

export interface ActionResult {
  error?: string | null;
  message?: string | null;
}

export const FormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: (prevState: any, formdata: FormData) => Promise<ActionResult>;
}): JSX.Element => {
  const [state, formAction] = useActionState(action, {
    error: null,
  });

  useEffect((): void => {
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
  }, [state.error, state.message]);

  return <form action={formAction}>{children}</form>;
};
