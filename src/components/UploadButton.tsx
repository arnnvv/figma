"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Spinner } from "./ui/Spinner";
import { useUploadThing } from "@/lib/uploadthing";

type Input = Parameters<typeof useUploadThing>;

const useUploadThingInputProps = (
  ...args: Input
): {
  inputProps: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    multiple: boolean;
    accept: string;
  };
  isUploading: boolean;
} => {
  const $ut = useUploadThing(...args);

  const onChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    await $ut.startUpload(selectedFiles);
  };

  return {
    inputProps: {
      onChange,
      multiple: ($ut.routeConfig?.image?.maxFileCount ?? 1) > 1,
      accept: "image/*",
    },
    isUploading: $ut.isUploading,
  };
};

export const UploadButton = ({ text }: { text: string }): JSX.Element => {
  const router = useRouter();
  const { inputProps } = useUploadThingInputProps("uploader", {
    onUploadBegin() {
      toast(
        <div className="flex items-center gap-2 text-white">
          <Spinner />
          <span className="text-lg">Uploading...</span>
        </div>,
        {
          duration: 100000,
          id: "upload-start",
          style: {
            backgroundColor: "black",
          },
        },
      );
    },
    onUploadError() {
      toast.dismiss("upload-start");
      toast.error("Upload failed");
    },
    onClientUploadComplete() {
      toast.dismiss("upload-start");
      toast.success("Upload complete");
      router.refresh();
    },
  });

  return (
    <label
      htmlFor="upload-button"
      className="w-full block cursor-pointer hover:bg-secondary p-2 rounded-md transition-colors"
    >
      <div className="flex items-center">
        <Upload className="mr-2 h-4 w-4" />
        <span>{text}</span>
      </div>
      <input
        id="upload-button"
        type="file"
        className="hidden"
        {...inputProps}
      />
    </label>
  );
};
