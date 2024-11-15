import { getCurrentSession } from "@/actions";
import { Room } from "@/components/Room";
import { Whiteboard } from "@/components/Whiteboard";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const generateMetadata = ({
  params,
}: {
  params: {
    roomId: string;
  };
}): Metadata => ({
  title: `RoomId: ${params.roomId}`,
});

export default async ({
  params,
}: {
  params: { roomId: string };
}): Promise<JSX.Element> => {
  const { roomId } = params;
  const { session } = await getCurrentSession();
  if (session === null) return redirect("/login");

  const result = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  if (result.length <= 0) return redirect("/dashboard");

  return (
    <Room roomId={roomId}>
      <Whiteboard />
    </Room>
  );
};
