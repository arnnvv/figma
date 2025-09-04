"use client";

import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { JSX } from "react";
import { toast } from "sonner";
import { deleteRoomAction } from "@/actions";
import { Button } from "./ui/button";

export const NavbarClient = ({
  isOwner,
}: {
  isOwner: boolean;
}): JSX.Element => {
  const params = useParams();
  const router = useRouter();
  const { roomId } = params;

  return roomId && isOwner ? (
    <Button
      variant="destructive"
      size="sm"
      className="flex items-center gap-2"
      onClick={async () => {
        //@ts-expect-error: W T F
        await deleteRoomAction(roomId);
        toast.success("Deleting...");
        router.push("/dashboard");
      }}
    >
      <Trash2 size={16} />
      Delete
    </Button>
  ) : (
    <></>
  );
};
