import { atom } from "jotai";
import type { Attributes } from "../../types";

export const elementAttributesAtom = atom<Attributes>({
  width: "",
  height: "",
  fontSize: "",
  fontFamily: "",
  fontWeight: "",
  fill: "#aabbcc",
  stroke: "#aabbcc",
});
