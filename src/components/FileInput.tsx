"use client";

import { type JSX, useId } from "react";

export const FileInput = (): JSX.Element => {
  const fileInputId = useId();
  return (
    <input
      id={fileInputId}
      name="file"
      type="file"
      maxLength={1}
      minLength={1}
      className="hidden"
      onChange={(e) => {
        e.currentTarget.form?.requestSubmit();
      }}
    />
  );
};
