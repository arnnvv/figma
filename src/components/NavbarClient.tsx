"use client";

import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import type { JSX } from "react";
import { toast } from "sonner";
import { deleteRoomAction } from "@/actions";
import { Button } from "./ui/button";

export const NavbarClient = ({
  isOwner,
}: {
  isOwner: boolean;
}): JSX.Element | null => {
  const params = useParams();
  const { roomId } = params;

  return roomId && isOwner ? (
    <Button
      variant="destructive"
      size="sm"
      className="flex items-center gap-2"
      onClick={async () => {
        if (typeof roomId !== "string") {
          toast.error("Invalid Room ID.");
          return;
        }

        toast.info("Deleting room...");
        try {
          const result = await deleteRoomAction(roomId);
          if (result && !result.success) {
            toast.error(result.message);
          }
        } catch (_error) {
          toast.error("An unexpected error occurred while deleting the room.");
        }
      }}
    >
      <Trash2 size={16} />
      Delete
    </Button>
  ) : null;
};
