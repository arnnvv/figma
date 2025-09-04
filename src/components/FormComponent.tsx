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

export const FormComponent = ({
  children,
  action,
  onSuccessAction,
}: {
  children: ReactNode;
  action: (prevState: any, formdata: FormData) => Promise<ActionResult>;
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
          toast.success(result.message, {
            id: "success-toast",
          });
          if (onSuccessAction) {
            onSuccessAction(formData);
          }
        } else if (result.message) {
          toast.error(result.message, {
            id: "error-toast",
          });
        }
      } catch {
        toast.error("An unexpected error occurred", {
          id: "error-toast",
        });
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
        const formData = new FormData(e.currentTarget);
        handleSubmit(formData);
        // Reset form if it's for adding something, e.g. room access request
        if (e.currentTarget.id === "ask-access-form") {
          e.currentTarget.reset();
        }
      }}
    >
      {disabledChildren}
      {isPending && <Loader />}
    </form>
  );
};
