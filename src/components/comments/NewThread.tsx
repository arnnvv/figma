"use client";

import {
  type FormEvent,
  type JSX,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { Root } from "@radix-ui/react-portal";
import { useCreateThread } from "@liveblocks/react/suspense";
import type { ComposerSubmitComment } from "@liveblocks/react-ui";
import { useMaxZIndex } from "@/lib/useMaxZIndex";
import { PinnedComposer } from "./PinnedComposer";
import { NewThreadCursor } from "./NewThreadCursor";

export const NewThread = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [creatingCommentState, setCreatingCommentState] = useState<
    "placing" | "placed" | "complete"
  >("complete");

  const createThread = useCreateThread();
  const maxZIndex = useMaxZIndex();
  const [composerCoords, setComposerCoords] = useState<null | {
    x: number;
    y: number;
  }>(null);
  const lastPointerEvent = useRef<PointerEvent | null>(null);
  const [allowUseComposer, setAllowUseComposer] = useState(false);
  const allowComposerRef = useRef(allowUseComposer);
  allowComposerRef.current = allowUseComposer;

  useEffect((): (() => void) | undefined => {
    if (creatingCommentState === "complete") return;
    const newComment = (e: MouseEvent) => {
      e.preventDefault();
      if (creatingCommentState === "placed") {
        const isClickOnComposer = ((e as any)._savedComposedPath = e
          .composedPath()
          .some((el: any) => {
            return el.classList?.contains("lb-composer-editor-actions");
          }));
        if (isClickOnComposer) return;
        if (!isClickOnComposer) {
          setCreatingCommentState("complete");
          return;
        }
      }
      setCreatingCommentState("placed");
      setComposerCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };
    document.documentElement.addEventListener("click", newComment);

    return () => {
      document.documentElement.removeEventListener("click", newComment);
    };
  }, [creatingCommentState]);

  useEffect((): (() => void) => {
    const handlePointerMove = (e: PointerEvent) => {
      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;
    };

    document.documentElement.addEventListener("pointermove", handlePointerMove);

    return () => {
      document.documentElement.removeEventListener(
        "pointermove",
        handlePointerMove,
      );
    };
  }, []);

  useEffect((): (() => void) | undefined => {
    if (creatingCommentState !== "placing") return;

    const handlePointerDown = (e: PointerEvent) => {
      if (allowComposerRef.current) return;
      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;
      setAllowUseComposer(true);
    };

    const handleContextMenu = (e: Event) => {
      if (creatingCommentState === "placing") {
        e.preventDefault();
        setCreatingCommentState("complete");
      }
    };

    document.documentElement.addEventListener("pointerdown", handlePointerDown);
    document.documentElement.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.documentElement.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      document.documentElement.removeEventListener(
        "contextmenu",
        handleContextMenu,
      );
    };
  }, [creatingCommentState]);

  const handleComposerSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const overlayPanel = document.querySelector("#canvas");
      if (!composerCoords || !lastPointerEvent.current || !overlayPanel) return;
      const { top, left } = overlayPanel.getBoundingClientRect();
      const x = composerCoords.x - left;
      const y = composerCoords.y - top;
      createThread({
        body,
        metadata: {
          x,
          y,
          resolved: false,
          zIndex: maxZIndex + 1,
        },
      });

      setComposerCoords(null);
      setCreatingCommentState("complete");
      setAllowUseComposer(false);
    },
    [createThread, composerCoords, maxZIndex],
  );

  return (
    <>
      <Slot
        onClick={() =>
          setCreatingCommentState(
            creatingCommentState !== "complete" ? "complete" : "placing",
          )
        }
        style={{ opacity: creatingCommentState !== "complete" ? 0.7 : 1 }}
      >
        {children}
      </Slot>

      {composerCoords && creatingCommentState === "placed" ? (
        <Root
          className="absolute left-0 top-0"
          style={{
            pointerEvents: allowUseComposer ? "initial" : "none",
            transform: `translate(${composerCoords.x}px, ${composerCoords.y}px)`,
          }}
          data-hide-cursors
        >
          <PinnedComposer onComposerSubmit={handleComposerSubmit} />
        </Root>
      ) : null}
      <NewThreadCursor display={creatingCommentState === "placing"} />
    </>
  );
};
