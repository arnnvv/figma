"use client";

import {
  MutationContext,
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useMyPresence,
  useOthers,
  useRedo,
  useStorage,
  useUndo,
} from "@liveblocks/react/suspense";
import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useState,
  ChangeEvent,
  MutableRefObject,
  useRef,
  RefObject,
} from "react";
import {
  ActiveElement,
  CursorMode,
  CursorState,
  Reaction,
  ReactionEvent,
} from "../../types";
import { fabric } from "fabric";
import { useInterval } from "@/lib/useInterval";
import { Cursor } from "./Cursor";
import { COLORS, defaultNavElement } from "@/lib/constants";
import { LiveMap, User } from "@liveblocks/client";
import { FlyingReaction } from "./FlyingReaction";
import { ReactionSelector } from "./ReactionSelector";
import { CursorSVG } from "./CursorSVG";
import { Appbar } from "./Appbar";
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
} from "@/lib/canvasElements";
import { ShapeSelect } from "./ShapeSelect";
import { EditCanvas } from "./EditCanvas";
import { useSetAtom } from "jotai";
import { elementAttributesAtom } from "@/lib/atoms";

export const Whiteboard = (): JSX.Element => {
  const undo = useUndo();
  const redo = useRedo();
  const others = useOthers();
  const setElementAttributes = useSetAtom(elementAttributesAtom);
  const [presence, updatePresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });
  const canvasRef: RefObject<HTMLCanvasElement> =
    useRef<HTMLCanvasElement>(null);
  const fabricRef: MutableRefObject<fabric.Canvas | null> =
    useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const imageRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
  const selectedShapeRef: MutableRefObject<string | null> = useRef<
    string | null
  >(null);
  const shapeRef: MutableRefObject<fabric.Object | null> =
    useRef<fabric.Object | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const isEditingRef = useRef(false);

  const canvasObjects = useStorage(
    (root: {
      readonly canvasObjects: ReadonlyMap<string, any>;
    }): ReadonlyMap<string, any> => root.canvasObjects,
  );

  const deleteAllStorageShapes = useMutation(
    ({
      storage,
    }: MutationContext<
      { cursor: { x: number; y: number } | null; message: string },
      { canvasObjects: LiveMap<string, any> },
      { id: string }
    >): boolean => {
      const canvasObjects = storage.get("canvasObjects");
      if (!canvasObjects || canvasObjects.size === 0) return true;
      for (const [key] of canvasObjects.entries()) {
        canvasObjects.delete(key);
      }
      return canvasObjects.size === 0;
    },
    [],
  );

  const deleteStorageShape = useMutation(
    (
      {
        storage,
      }: MutationContext<
        { cursor: { x: number; y: number } | null; message: string },
        { canvasObjects: LiveMap<string, any> },
        { id: string }
      >,
      objectId,
    ) => {
      const canvasObjects = storage.get("canvasObjects");
      canvasObjects.delete(objectId);
    },
    [],
  );

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllStorageShapes(); //Clr from liveblocks storage
        fabricRef.current?.clear(); //clr from existing canvas
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

  const syncShapeInStorage = useMutation(
    (
      {
        storage,
      }: MutationContext<
        { cursor: { x: number; y: number } | null; message: string },
        { canvasObjects: LiveMap<string, any> },
        { id: string }
      >,
      object: any,
    ) => {
      if (!object) return;

      const { objectId } = object;

      const shapeData = object.toJSON();
      shapeData.objectId = objectId;

      const canvasObjects = storage.get("canvasObjects");
      canvasObjects.set(objectId, shapeData);
    },
    [],
  );

  const setReaction = useCallback((reaction: string) => {
    setState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

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
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on("selection:created", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options: fabric.IEvent<MouseEvent>) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on("path:created", (options: fabric.IEvent<MouseEvent>) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });
    window.addEventListener("resize", () => {
      handleResize({ canvas });
    });

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteStorageShape: deleteStorageShape,
      });
    });

    return () => {
      canvas.dispose();
    };
  }, [syncShapeInStorage, deleteStorageShape, undo, redo]);

  useInterval(() => {
    setReactions((reactions: Reaction[]): Reaction[] =>
      reactions.filter(
        (reaction: Reaction): boolean => reaction.timestamp > Date.now() - 4000,
      ),
    );
  }, 1000);
  useInterval(() => {
    if (
      state.mode === CursorMode.Reaction &&
      state.isPressed &&
      presence.cursor
    ) {
      setReactions((reactions: Reaction[]): Reaction[] =>
        reactions.concat([
          {
            //@ts-expect-error: W T F
            point: { x: presence.cursor.x, y: presence.cursor.y },
            value: state.reaction,
            timestamp: Date.now(),
          },
        ]),
      );
      broadcast({
        x: presence.cursor.x,
        y: presence.cursor.y,
        value: state.reaction,
      });
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

    window.addEventListener("keyup", onKeyUp);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updatePresence]);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions: Reaction[]): Reaction[] =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ]),
    );
  });

  return (
    <main className="h-screen overflow-hidden">
      <Appbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageRef}
        handleImageUpload={(e: ChangeEvent<HTMLInputElement>) => {
          e.stopPropagation();
          if (e.target.files && e.target.files.length > 0)
            handleImageUpload({
              file: e.target.files[0],
              canvas: fabricRef as any,
              shapeRef,
              syncShapeInStorage,
            });
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
                : "url(cursor.svg) 0 0, auto",
          }}
          onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (
              presence.cursor == null ||
              state.mode !== CursorMode.ReactionSelector
            ) {
              updatePresence({
                cursor: {
                  x: Math.round(event.clientX),
                  y: Math.round(event.clientY),
                },
              });
            }
          }}
          onPointerLeave={() => {
            setState({
              mode: CursorMode.Hidden,
            });
            updatePresence({
              cursor: null,
            });
          }}
          onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
            updatePresence({
              cursor: {
                x: Math.round(event.clientX),
                y: Math.round(event.clientY),
              },
            });
            setState(
              (
                state: CursorState,
              ):
                | { mode: CursorMode.Hidden }
                | {
                    mode: CursorMode.Chat;
                    message: string;
                    previousMessage: string | null;
                  }
                | { mode: CursorMode.ReactionSelector }
                | {
                    isPressed: true;
                    mode: CursorMode.Reaction;
                    reaction: string;
                  } =>
                state.mode === CursorMode.Reaction
                  ? { ...state, isPressed: true }
                  : state,
            );
          }}
          onPointerUp={() => {
            setState(
              (
                state: CursorState,
              ):
                | { mode: CursorMode.Hidden }
                | {
                    mode: CursorMode.Chat;
                    message: string;
                    previousMessage: string | null;
                  }
                | { mode: CursorMode.ReactionSelector }
                | {
                    isPressed: false;
                    mode: CursorMode.Reaction;
                    reaction: string;
                  } =>
                state.mode === CursorMode.Reaction
                  ? { ...state, isPressed: false }
                  : state,
            );
          }}
        >
          <canvas ref={canvasRef} />

          {reactions.map(
            (reaction: Reaction): JSX.Element => (
              <FlyingReaction
                key={reaction.timestamp.toString()}
                x={reaction.point.x}
                y={reaction.point.y}
                timestamp={reaction.timestamp}
                value={reaction.value}
              />
            ),
          )}
          {presence.cursor && (
            <div
              className="absolute top-0 left-0"
              style={{
                transform: `translateX(${presence.cursor.x}px) translateY(${presence.cursor.y}px)`,
              }}
            >
              {state.mode === CursorMode.Chat && (
                <>
                  <CursorSVG color={COLORS[0]} />

                  <div
                    className="absolute top-5 left-2 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white"
                    onKeyUp={(e: ReactKeyboardEvent<HTMLDivElement>) =>
                      e.stopPropagation()
                    }
                    style={{
                      borderRadius: 20,
                    }}
                  >
                    {state.previousMessage && (
                      <div>{state.previousMessage}</div>
                    )}
                    <input
                      className="w-60 border-none	bg-transparent text-white placeholder-blue-300 outline-none"
                      autoFocus={true}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        updatePresence({ message: e.target.value });
                        setState({
                          mode: CursorMode.Chat,
                          previousMessage: null,
                          message: e.target.value,
                        });
                      }}
                      onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          setState({
                            mode: CursorMode.Chat,
                            previousMessage: state.message,
                            message: "",
                          });
                        } else if (e.key === "Escape") {
                          setState({
                            mode: CursorMode.Hidden,
                          });
                        }
                      }}
                      placeholder={
                        state.previousMessage ? "" : "Say something…"
                      }
                      value={state.message}
                      maxLength={50}
                    />
                  </div>
                </>
              )}
              {state.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                  setReaction={(reaction: string) => {
                    setReaction(reaction);
                  }}
                />
              )}
              {state.mode === CursorMode.Reaction && (
                <div className="pointer-events-none absolute top-3.5 left-1 select-none">
                  {state.reaction}
                </div>
              )}
            </div>
          )}

          {others.map(
            ({
              connectionId,
              presence,
            }: User<
              { cursor: { x: number; y: number } | null; message: string },
              { id: string }
            >): JSX.Element | null => {
              if (presence == null || !presence.cursor) return null;

              return (
                <Cursor
                  key={connectionId}
                  color={COLORS[connectionId % COLORS.length]}
                  x={presence.cursor.x}
                  y={presence.cursor.y}
                  message={presence.message}
                />
              );
            },
          )}
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
