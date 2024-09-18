"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { getLiveBlocksSecret } from "@/lib/liveblocks";
import { ModernLoader } from "./ModernLoader";

export const Room = ({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}): JSX.Element => (
  <LiveblocksProvider publicApiKey={getLiveBlocksSecret()}>
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<ModernLoader />}>
        {(): ReactNode => children}
      </ClientSideSuspense>
    </RoomProvider>
  </LiveblocksProvider>
);
