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
import { useRouter } from "next/navigation";
import { Loader } from "./ui/loader";
import { type ActionResult, isFormControl } from "@/lib/form-control";

export const AuthFormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: (_: any, formdata: FormData) => Promise<ActionResult>;
}): JSX.Element => {
  const router = useRouter();
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
          router.push("/dashboard");
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
