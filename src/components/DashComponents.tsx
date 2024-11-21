import { db } from "@/lib/db";
import { editAccess, rooms } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { FormComponent } from "./FormComponent";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { CheckCircle, Edit, LogIn, XCircle } from "lucide-react";
import { getNameFromId } from "@/lib/getUserName";
import { JSX } from "react";

export async function UserRooms({
  userId,
}: {
  userId: number;
}): Promise<JSX.Element | null> {
  const userRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.ownerId, userId));

  return userRooms.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Your Rooms</h3>
      <div className="space-y-2">
        {userRooms.map((room) => (
          <FormComponent
            key={room.id}
            action={async () => {
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
        ))}
      </div>
    </div>
  ) : null;
}

export async function EditableRooms({
  userId,
}: {
  userId: number;
}): Promise<JSX.Element | null> {
  const editableRooms = await db
    .select({
      id: rooms.id,
      ownerId: rooms.ownerId,
    })
    .from(rooms)
    .innerJoin(editAccess, eq(editAccess.roomIdRequestedFor, rooms.id))
    .where(
      and(
        eq(editAccess.requesterId, userId),
        eq(editAccess.status, "accepted"),
      ),
    );

  return editableRooms.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Rooms You Can Edit</h3>
      <div className="space-y-2">
        {editableRooms.map((room) => (
          <FormComponent
            key={room.id}
            action={async () => {
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
              <Edit size={18} />
            </Button>
          </FormComponent>
        ))}
      </div>
    </div>
  ) : null;
}

export async function EditAccessRequests({
  userId,
}: {
  userId: number;
}): Promise<JSX.Element | null> {
  const editAccessRequests = await db
    .select({
      id: editAccess.id,
      requesterId: editAccess.requesterId,
      roomId: editAccess.roomIdRequestedFor,
      status: editAccess.status,
    })
    .from(editAccess)
    .where(and(eq(editAccess.status, "pending"), eq(rooms.ownerId, userId)))
    .innerJoin(rooms, eq(editAccess.roomIdRequestedFor, rooms.id));

  return editAccessRequests.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Edit Access Requests
      </h3>
      <div className="space-y-2">
        {editAccessRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
          >
            <span>
              Room {request.roomId} - {getNameFromId(request.requesterId)}
            </span>
            <div className="flex space-x-2">
              <FormComponent
                action={async () => {
                  "use server";
                  await db
                    .update(editAccess)
                    .set({ status: "accepted" })
                    .where(eq(editAccess.id, request.id));
                  return { message: "Request accepted" };
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  <CheckCircle size={18} className="text-green-500" />
                </Button>
              </FormComponent>
              <FormComponent
                action={async () => {
                  "use server";
                  await db
                    .update(editAccess)
                    .set({ status: "declined" })
                    .where(eq(editAccess.id, request.id));
                  return { message: "Request declined" };
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  <XCircle size={18} className="text-red-500" />
                </Button>
              </FormComponent>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;
}

export function UserRoomsSkeleton(): JSX.Element {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-10 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export function EditableRoomsSkeleton(): JSX.Element {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-10 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export function EditAccessRequestsSkeleton(): JSX.Element {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between p-2 bg-gray-100 rounded-md h-12"
          ></div>
        ))}
      </div>
    </div>
  );
}
