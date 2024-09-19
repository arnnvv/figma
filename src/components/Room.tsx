"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { getLiveBlocksSecret } from "@/lib/liveblocks";
import { ModernLoader } from "./ModernLoader";
import { LiveMap } from "@liveblocks/client";

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
