import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { QueryResult } from "pg";
import type { JSX } from "react";
import { getCurrentSession } from "@/actions";
import { Room } from "@/components/Room";
import { Whiteboard } from "@/components/Whiteboard";
import { db } from "@/lib/db";

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

  const checkRoomSql = "SELECT id FROM figma_rooms WHERE id = $1 LIMIT 1";
  let roomExists = false;

  try {
    type RoomIdResult = { id: string };
    const result: QueryResult<RoomIdResult> = await db.query(checkRoomSql, [
      roomId,
    ]);

    if (result.rowCount! > 0) {
      roomExists = true;
    }
  } catch (error) {
    console.error(`Error checking existence of room ${roomId}:`, error);
    return redirect("/dashboard?error=db_error");
  }
  if (!roomExists) {
    console.log(`Room ${roomId} not found, redirecting to dashboard.`);
    return redirect("/dashboard");
  }

  return (
    <Room roomId={roomId}>
      <Whiteboard />
    </Room>
  );
};
