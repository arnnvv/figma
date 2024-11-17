"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { deleteRoomAction } from "@/actions";
import { toast } from "sonner";
import { JSX } from "react";

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
