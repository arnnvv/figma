"use client";

import {
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useMyPresence,
  useOthers,
  useRedo,
  useStorage,
  useUndo,
} from "@liveblocks/react/suspense";
import type { fabric } from "fabric";
import { useSetAtom } from "jotai";
import {
  type ChangeEvent,
  type JSX,
  type PointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { elementAttributesAtom } from "@/lib/atoms";
import {
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleDelete,
  handleImageUpload,
  handleKeyDown,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvasElements";
import { COLORS, defaultNavElement } from "@/lib/constants";
import { useInterval } from "@/lib/useInterval";
import {
  type ActiveElement,
  CursorMode,
  type CursorState,
  type Reaction,
  type ReactionEvent,
} from "../../types";
import { Appbar } from "./Appbar";
import { Cursor } from "./Cursor";
import { Comments } from "./comments/Comments";
import { EditCanvas } from "./EditCanvas";
import { FlyingReaction } from "./FlyingReaction";
import { ReactionSelector } from "./ReactionSelector";
import { ShapeSelect } from "./ShapeSelect";

export const Whiteboard = (): JSX.Element => {
  const undo = useUndo();
  const redo = useRedo();
  const others = useOthers();
  const setElementAttributes = useSetAtom(elementAttributesAtom);
  const [{ cursor }, updatePresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });

  const canvasRef: RefObject<HTMLCanvasElement | null> =
    useRef<HTMLCanvasElement>(null);
  const fabricRef: RefObject<fabric.Canvas | null> =
    useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const imageRef: RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement>(null);
  const selectedShapeRef: RefObject<string | null> = useRef<string | null>(
    null,
  );
  const shapeRef: RefObject<fabric.Object | null> =
    useRef<fabric.Object | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const isEditingRef = useRef(false);

  const canvasObjects = useStorage(
    (root: {
      readonly canvasObjects: ReadonlyMap<string, any>;
    }): ReadonlyMap<string, any> => root.canvasObjects,
  );

  const deleteAllStorageShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");
    if (!canvasObjects || canvasObjects.size === 0) return true;
    for (const [key] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);

  const deleteStorageShape = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllStorageShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      case "delete":
        handleDelete(fabricRef.current as any, deleteStorageShape);
        setActiveElement(defaultNavElement);
        break;
      case "image":
        imageRef.current?.click();
        isDrawing.current = false;
        if (fabricRef.current) fabricRef.current.isDrawingMode = false;
        break;
      default:
        break;
    }
    selectedShapeRef.current = elem?.value as string;
  };

  const syncShapeInStorage = useMutation(({ storage }, object: any) => {
    if (!object) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const setReaction = useCallback((reaction: string) => {
    setState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    const handleResizeCallback = () => handleResize({ canvas });

    const handleKeyDownCallback = (e: KeyboardEvent) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteStorageShape,
      });
    };

    canvas.on("mouse:down", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    });

    canvas.on("mouse:move", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });

    canvas.on("object:modified", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });

    canvas.on("selection:created", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasObjectScaling({ options, setElementAttributes });
    });

    canvas.on("path:created", (options: fabric.IEvent<MouseEvent>) => {
      handlePathCreated({ options, syncShapeInStorage });
    });

    window.addEventListener("resize", handleResizeCallback);
    window.addEventListener("keydown", handleKeyDownCallback);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResizeCallback);
      window.removeEventListener("keydown", handleKeyDownCallback);
    };
  }, [
    syncShapeInStorage,
    deleteStorageShape,
    undo,
    redo,
    setElementAttributes,
  ]);

  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((r) => r.timestamp > Date.now() - 4000),
    );
  }, 1000);

  useInterval(() => {
    if (state.mode === CursorMode.Reaction && state.isPressed && cursor) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: state.reaction,
            timestamp: Date.now(),
          },
        ]),
      );
      broadcast({ x: cursor.x, y: cursor.y, value: state.reaction });
    }
  }, 100);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
      } else if (e.key === "Escape") {
        updatePresence({ message: "" });
        setState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") e.preventDefault();
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updatePresence]);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ]),
    );
  });

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden">
      <Appbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageRef}
        handleImageUpload={(e: ChangeEvent<HTMLInputElement>) => {
          e.stopPropagation();
          if (e.target.files?.[0]) {
            handleImageUpload({
              file: e.target.files[0],
              canvas: fabricRef as any,
              shapeRef,
              syncShapeInStorage,
            });
          }
        }}
      />
      <section className="flex h-full flex-row">
        <ShapeSelect allShapes={Array.from(canvasObjects)} />
        <div
          id="canvas"
          className="relative flex h-screen w-full touch-none items-center justify-center overflow-hidden"
          style={{
            cursor:
              state.mode === CursorMode.Chat
                ? "none"
                : "url(/assets/cursor.svg) 0 0, auto",
          }}
          onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            setLocalCursor({ x, y });
            updatePresence({ cursor: { x, y } });
          }}
          onPointerLeave={() => {
            setState({ mode: CursorMode.Hidden });
            updatePresence({ cursor: null, message: "" });
          }}
          onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            setLocalCursor({ x, y });
            updatePresence({ cursor: { x, y } });

            setState((state) =>
              state.mode === CursorMode.Reaction
                ? { ...state, isPressed: true }
                : state,
            );
          }}
          onPointerUp={() => {
            setState((state) =>
              state.mode === CursorMode.Reaction
                ? { ...state, isPressed: false }
                : state,
            );
          }}
        >
          <canvas ref={canvasRef} />

          {reactions.map((reaction) => (
            <FlyingReaction
              key={reaction.timestamp.toString()}
              x={reaction.point.x}
              y={reaction.point.y}
              timestamp={reaction.timestamp}
              value={reaction.value}
            />
          ))}

          <div
            className="absolute top-0 left-0"
            style={{
              transform: `translateX(${localCursor.x}px) translateY(${localCursor.y}px)`,
            }}
          >
            {state.mode === CursorMode.Chat && (
              <div
                className="absolute top-5 left-2 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white"
                onKeyUp={(e: ReactKeyboardEvent<HTMLDivElement>) =>
                  e.stopPropagation()
                }
                style={{ borderRadius: 20 }}
              >
                {state.previousMessage && <div>{state.previousMessage}</div>}
                <input
                  className="w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
                  autoFocus
                  onChange={(e) => {
                    updatePresence({ message: e.target.value });
                    setState({
                      mode: CursorMode.Chat,
                      previousMessage: null,
                      message: e.target.value,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setState({
                        mode: CursorMode.Chat,
                        previousMessage: state.message,
                        message: "",
                      });
                    } else if (e.key === "Escape") {
                      setState({ mode: CursorMode.Hidden });
                    }
                  }}
                  placeholder={state.previousMessage ? "" : "Say something…"}
                  value={state.message}
                  maxLength={50}
                />
              </div>
            )}
            {state.mode === CursorMode.ReactionSelector && (
              <ReactionSelector setReaction={setReaction} />
            )}
            {state.mode === CursorMode.Reaction && (
              <div className="pointer-events-none absolute top-3.5 left-1 select-none">
                {state.reaction}
              </div>
            )}
          </div>

          {others.map(({ connectionId, presence: otherPresence }) => {
            if (otherPresence.cursor) {
              return (
                <Cursor
                  key={connectionId}
                  color={COLORS[connectionId % COLORS.length]}
                  x={otherPresence.cursor.x}
                  y={otherPresence.cursor.y}
                  message={otherPresence.message}
                />
              );
            }
            return null;
          })}
          <Comments />
        </div>

        <EditCanvas
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
};
