"use client";

import type { JSX } from "react";

export const FileInput = (): JSX.Element => (
  <input
    id="upload-button"
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
