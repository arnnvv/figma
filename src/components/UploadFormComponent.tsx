"use client";

import { FormEvent, JSX, ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type ActionResult = {
  success: boolean;
  errorOrUrl: string;
};

type UploadFormProps = {
  children: ReactNode;
  action: (formdata: FormData) => Promise<ActionResult>;
};

export const UploadFormComponent = ({
  children,
  action,
}: UploadFormProps): JSX.Element => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [, setFormState] = useState<ActionResult>({
    success: false,
    errorOrUrl: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await action(formData);
        setFormState(result);

        if (result.success) {
          toast.success("Uploaded", {
            id: "success-toast",
            action: {
              label: "Close",
              onClick: () => toast.dismiss("success-toast"),
            },
          });
        } else {
          toast.error(result.errorOrUrl, {
            id: "error-toast",
            action: {
              label: "Close",
              onClick: () => toast.dismiss("error-toast"),
            },
          });
        }

        router.refresh();
      } catch {
        toast.error("An unexpected error occurred", {
          id: "error-toast",
          action: {
            label: "Close",
            onClick: () => toast.dismiss("error-toast"),
          },
        });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} aria-disabled={isPending}>
      {children}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </form>
  );
};
