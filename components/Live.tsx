"use Client";

import { PointerEvent, useCallback, useState, useEffect } from "react";
import LiveCursors from "./cursor/LiveCursors";
import { useMyPresence, useOthers } from "@/liveblocks.config";
import { CursorState, CursorMode } from "@/types/type";
import CursorChat from "./cursor/CursorChat";

const Live = () => {
  const others = useOthers();
  const userCount = others.length;
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const handlePointerMove = useCallback((event: PointerEvent) => {
    event.preventDefault();
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });
  }, []);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
  }, [updateMyPresence]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      className="h-[100vh] w-full flex justify-center items-center text-center"
    >
      <h1 className="text-2xl text-white">
        There are {userCount} other user(s) online
      </h1>

      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}

      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
