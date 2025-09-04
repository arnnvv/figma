"use client";

import { useRouter } from "next/navigation";
import {
  Children,
  cloneElement,
  type FormEvent,
  isValidElement,
  type JSX,
  type ReactNode,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { type ActionResult, isFormControl } from "@/lib/form-control";
import { Loader } from "./ui/loader";

export const UploadFormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: (formdata: FormData) => Promise<ActionResult>;
}): JSX.Element => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [, setFormState] = useState<ActionResult>({
    success: false,
    message: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await action(formData);
        setFormState(result);

        if (result.success) {
          toast.success("Uploaded");
        } else {
          toast.error(result.message);
        }

        router.refresh();
      } catch {
        toast.error("An unexpected error occurred");
        router.refresh();
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
    <form onSubmit={handleSubmit}>
      {disabledChildren}
      {isPending && <Loader />}
    </form>
  );
};
