"use client";

import { useAtom } from "jotai";
import { MutableRefObject, RefObject, useMemo, useRef } from "react";
import { fabric } from "fabric";
import { elementAttributesAtom } from "@/lib/atoms";
import { Attributes } from "../../types";
import { modifyShape } from "@/lib/canvasElements";
import { Dimentions } from "./Dimentions";
import { Text } from "./Text";
import { Color } from "./Color";
import { Export } from "./Export";

export const EditCanvas = ({
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
}: {
  fabricRef: RefObject<fabric.Canvas | null>;
  activeObjectRef: RefObject<fabric.Object | null>;
  isEditingRef: MutableRefObject<boolean>;
  syncShapeInStorage: (obj: any) => void;
}): JSX.Element => {
  const [elementAttributes, setElementAttributes] = useAtom(
    elementAttributesAtom,
  );
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;
    setElementAttributes(
      (
        prev: Attributes,
      ): {
        width: string;
        height: string;
        fontSize: string;
        fontFamily: string;
        fontWeight: string;
        fill: string;
        stroke: string;
      } => ({
        ...prev,
        [property]: value,
      }),
    );

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    });
  };
  return useMemo(
    (): JSX.Element => (
      <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky right-0 h-full max-sm:hidden select-none">
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
    [elementAttributes],
  );
};
