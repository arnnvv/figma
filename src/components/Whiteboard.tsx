"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { deleteRoomAction } from "@/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Whiteboard = ({
  isOwner,
  roomId,
}: {
  isOwner: boolean;
  roomId: string;
}): JSX.Element => {
  const router = useRouter();
  const others = useOthers();
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
