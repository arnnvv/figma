"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { getLiveBlocksSecret } from "@/lib/liveblocks";
import { ModernLoader } from "./ModernLoader";
import { useAtom } from "jotai";
import { roomIDAtom } from "@/lib/atoms";

export const Room = ({ children }: { children: ReactNode }): JSX.Element => {
  const [roomID, setRoomId] = useAtom(roomIDAtom);

  setRoomId((prev: number): number => prev + 1);

  return (
    <LiveblocksProvider publicApiKey={getLiveBlocksSecret()}>
      <RoomProvider id={`${roomID}`}>
        <ClientSideSuspense fallback={<ModernLoader />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};
