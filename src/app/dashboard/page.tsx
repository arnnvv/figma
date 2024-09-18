import { validateRequest } from "@/actions";
import { ActionResult, FormComponent } from "@/components/FormComponent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Users, PlusCircle, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

export default async (): Promise<JSX.Element> => {
  const { user } = await validateRequest();
  if (!user) return redirect("/login");
  const res = await db
    .select({
      maxId: sql<number>`MAX(CAST(id AS INT))`.as("maxId"),
    })
    .from(rooms);
  const maxId: number = res[0]?.maxId ?? 0;
  const roomId: number = maxId + 1;

  const userRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.ownerId, user.id));
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to RoomConnect
          </CardTitle>
          <CardDescription className="text-center">
            Join an existing room, create a new one, or access your rooms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRooms.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Your Rooms</h3>
              <div className="space-y-2">
                {userRooms.map(
                  (room: { id: string; ownerId: string }): JSX.Element => (
                    <FormComponent
                      key={room.id}
                      action={async (): Promise<never> => {
                        "use server";
                        return redirect(`/room/${room.id}`);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full flex items-center justify-between"
                      >
                        <span>Room {room.id}</span>
                        <LogIn size={18} />
                      </Button>
                    </FormComponent>
                  ),
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="roomId"
              className="text-sm font-medium text-gray-700"
            >
              Join Room
            </label>
            <FormComponent
              action={async (
                _: any,
                formData: FormData,
              ): Promise<ActionResult> => {
                "use server";
                const { session } = await validateRequest();
                if (!session) return { error: "Not logged in" };
                const roomId = formData.get("roomId") as string;
                const existingRoom = await db.query.rooms.findFirst({
                  where: eq(rooms.id, roomId),
                });
                if (!existingRoom) return { error: "Room doesn't exist" };
                else return redirect(`/room/${roomId}`);
              }}
            >
              <div className="flex space-x-2">
                <Input
                  id="roomId"
                  name="roomId"
                  type="text"
                  placeholder="Enter room ID"
                  className="flex-grow"
                  required
                />
                <Button type="submit" className="flex items-center space-x-1">
                  <Users size={18} />
                  <span>Join</span>
                </Button>
              </div>
            </FormComponent>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <FormComponent
            action={async (): Promise<never> => {
              "use server";
              await db.insert(rooms).values({
                id: String(roomId),
                ownerId: user.id,
              });
              return redirect(`/room/${roomId}`);
            }}
          >
            <Button
              type="submit"
              className="w-full flex items-center justify-center space-x-2"
            >
              <PlusCircle size={18} />
              <span>Create New Room</span>
            </Button>
          </FormComponent>
        </CardFooter>
      </Card>
    </div>
  );
};
