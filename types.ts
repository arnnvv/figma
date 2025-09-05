import type { ChangeEvent, RefObject } from "react";

export enum CursorMode {
  Hidden = 0,
  Chat = 1,
  ReactionSelector = 2,
  Reaction = 3,
}

export type CursorState =
  | {
      mode: CursorMode.Hidden;
    }
  | {
      mode: CursorMode.Chat;
      message: string;
      previousMessage: string | null;
    }
  | {
      mode: CursorMode.ReactionSelector;
    }
  | {
      mode: CursorMode.Reaction;
      reaction: string;
      isPressed: boolean;
    };

export type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
};

export type ReactionEvent = {
  x: number;
  y: number;
  value: string;
};

export type ActiveElement = {
  name: string;
  value: string;
  icon: string;
} | null;

export type AppbarProps = {
  activeElement: ActiveElement;
  imageInputRef: RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  handleActiveElement: (element: ActiveElement) => void;
};

export type ShapesMenuProps = {
  item: {
    name: string;
    icon: string;
    value: Array<ActiveElement>;
  };
  activeElement: any;
  handleActiveElement: any;
  handleImageUpload: any;
  imageInputRef: any;
};

export interface CustomFabricObject<_T extends fabric.Object>
  extends fabric.Object {
  objectId?: string;
}

export type Attributes = {
  width: string;
  height: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  fill: string;
  stroke: string;
};

export type ModifyShape = {
  canvas: fabric.Canvas;
  property: string;
  value: any;
  activeObjectRef: RefObject<fabric.Object | null>;
  syncShapeInStorage: (shape: fabric.Object) => void;
};
