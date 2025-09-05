"use client";

import type { fabric } from "fabric";
import { useAtom } from "jotai";
import { type JSX, type RefObject, useCallback, useMemo, useRef } from "react";
import { elementAttributesAtom } from "@/lib/atoms";
import { modifyShape } from "@/lib/canvasElements";
import type { Attributes } from "../../types";
import { Color } from "./Color";
import { Dimentions } from "./Dimentions";
import { Export } from "./Export";
import { Text } from "./Text";

export const EditCanvas = ({
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorageAction,
}: {
  fabricRef: RefObject<fabric.Canvas | null>;
  activeObjectRef: RefObject<fabric.Object | null>;
  isEditingRef: RefObject<boolean>;
  syncShapeInStorageAction: (obj: any) => void;
}): JSX.Element => {
  const [elementAttributes, setElementAttributes] = useAtom(
    elementAttributesAtom,
  );
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = useCallback(
    (property: string, value: string) => {
      if (!isEditingRef.current) {
        isEditingRef.current = true;
      }
      setElementAttributes((prev: Attributes) => ({
        ...prev,
        [property]: value,
      }));

      modifyShape({
        canvas: fabricRef.current as fabric.Canvas,
        property,
        value,
        activeObjectRef,
        syncShapeInStorage: syncShapeInStorageAction,
      });
    },
    [
      isEditingRef,
      setElementAttributes,
      fabricRef,
      activeObjectRef,
      syncShapeInStorageAction,
    ],
  );

  return useMemo(
    (): JSX.Element => (
      <section className="min-w-[227px] sticky right-0 h-full flex select-none flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 max-sm:hidden">
        <Dimentions
          isEditingRef={isEditingRef}
          width={elementAttributes.width}
          height={elementAttributes.height}
          handleInputChange={handleInputChange}
        />

        <Text
          fontFamily={elementAttributes.fontFamily}
          fontSize={elementAttributes.fontSize}
          fontWeight={elementAttributes.fontWeight}
          handleInputChange={handleInputChange}
        />

        <Color
          inputRef={colorInputRef}
          attribute={elementAttributes.fill}
          placeholder="color"
          attributeType="fill"
          handleInputChange={handleInputChange}
        />

        <Color
          inputRef={strokeInputRef}
          attribute={elementAttributes.stroke}
          placeholder="stroke"
          attributeType="stroke"
          handleInputChange={handleInputChange}
        />

        <Export />
      </section>
    ),
    [elementAttributes, handleInputChange, isEditingRef],
  );
};
