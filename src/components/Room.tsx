"use client";

import { LiveMap } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import type { JSX, ReactNode } from "react";
import { getLiveBlocksSecret } from "@/lib/liveblocks";
import { ModernLoader } from "./ModernLoader";

export const Room = ({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}): JSX.Element => (
  <LiveblocksProvider publicApiKey={getLiveBlocksSecret()} throttle={16}>
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null, message: "" }}
      initialStorage={{ canvasObjects: new LiveMap() }}
    >
      <ClientSideSuspense fallback={<ModernLoader />}>
        {(): ReactNode => children}
      </ClientSideSuspense>
    </RoomProvider>
  </LiveblocksProvider>
);
