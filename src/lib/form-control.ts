import type { ReactElement } from "react";

export interface ActionResult {
  success: boolean;
  message: string;
}

export const formControlTypes = [
  "input",
  "button",
  "select",
  "textarea",
  "fieldset",
] as const;

export function isFormControl(
  element: ReactElement,
): element is ReactElement<{ disabled?: boolean }> {
  return (
    typeof element.type === "string" &&
    formControlTypes.includes(element.type as (typeof formControlTypes)[number])
  );
}
