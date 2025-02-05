import { getCurrentSession } from "@/actions";
import { Room } from "@/components/Room";
import { Whiteboard } from "@/components/Whiteboard";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { JSX } from "react";

export const generateMetadata = async (props: {
  params: Promise<{
    roomId: string;
  }>;
}): Promise<Metadata> => {
  const params = await props.params;

  return {
    title: `RoomId: ${params.roomId}`,
  };
};

export default async (props: {
  params: Promise<{ roomId: string }>;
}): Promise<JSX.Element> => {
  const params = await props.params;
  const { roomId } = params;
  const { user, session } = await getCurrentSession();
  if (session === null) return redirect("/login");
  if (!user.verified) return redirect("/email-verification");
  if (
    user.username.startsWith("google-") ||
    user.username.startsWith("github-")
  )
    return redirect("/get-username");
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
