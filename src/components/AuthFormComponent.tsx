"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type JSX,
  type ReactNode,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { type ActionResult, isFormControl } from "@/lib/form-control";
import { Loader } from "./ui/loader";

export const AuthFormComponent = ({
  children,
  action,
  onSuccessAction,
}: {
  children: ReactNode;
  action: (_: any, formdata: FormData) => Promise<ActionResult>;
  onSuccessAction?: (formData: FormData) => void;
}): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const [, setFormState] = useState<ActionResult>({
    success: false,
    message: "",
  });

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await action(null, formData);
        setFormState(result);

        if (result.success) {
          toast.success(result.message);
          if (onSuccessAction) {
            onSuccessAction(formData);
          }
        } else if (result.message) {
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
    <form action={handleSubmit}>
      {disabledChildren}
      {isPending && <Loader />}
    </form>
  );
};
