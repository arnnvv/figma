import type { LiveMap } from "@liveblocks/client";

// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: {
        x: number;
        y: number;
      } | null;
      message: string;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      canvasObjects: LiveMap<string, any>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {
      x: number;
      y: number;
      value: string;
    };

    ThreadMetadata: {
      x: number;
      y: number;
      time?: number;
      resolved: boolean;
      zIndex: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: Record<string, never>;
  }
}
