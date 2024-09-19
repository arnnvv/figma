"use client";

import {
  useBroadcastEvent,
  useMyPresence,
  useOthers,
} from "@liveblocks/react/suspense";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { deleteRoomAction } from "@/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { CursorMode, CursorState, Reaction } from "../../types";
import { useInterval } from "@/lib/useInterval";

export const Whiteboard = ({
  isOwner,
  roomId,
}: {
  isOwner: boolean;
  roomId: string;
}): JSX.Element => {
  const router = useRouter();
  const others = useOthers();
  const [presence, updatePresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const setReaction = useCallback((reaction: string) => {
    setState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);
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

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="text-black font-semibold">
          Users in room: {others.length + 1}
        </div>
        {isOwner && (
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await deleteRoomAction(roomId);
              toast.success("Deleting...");
              router.push("/dashboard");
            }}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
