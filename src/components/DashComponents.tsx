import { FormComponent } from "./FormComponent";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { CheckCircle, Edit, LogIn, XCircle } from "lucide-react";
import type { JSX } from "react";
import type {
  Room,
  EditableRoomInfo,
  EditAccessRequestWithRoomOwner,
} from "@/lib/db/types";
import { handleEditAccessAction } from "@/actions";
import {
  findEditableRoomsForUser_Raw,
  findPendingEditRequestsForOwner_Raw,
  findRoomsByOwnerId_Raw,
  getNameFromId,
} from "@/lib/db/inlinequeries";

export async function UserRooms({
  userId,
}: {
  userId: number;
}): Promise<JSX.Element | null> {
  let userRooms: Room[] = [];
  try {
    userRooms = await findRoomsByOwnerId_Raw(userId);
  } catch (error) {
    console.error(`Error fetching user rooms for user ${userId}:`, error);
    return null;
  }

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
  let editableRooms: EditableRoomInfo[] = [];
  try {
    editableRooms = await findEditableRoomsForUser_Raw(userId);
  } catch (error) {
    console.error(`Error fetching editable rooms for user ${userId}:`, error);
    return null;
  }

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
  let editAccessRequests: EditAccessRequestWithRoomOwner[] = [];
  try {
    editAccessRequests = await findPendingEditRequestsForOwner_Raw(userId);
  } catch (error) {
    console.error(
      `Error fetching pending edit requests for owner ${userId}:`,
      error,
    );
    return null;
  }

  const requesterNames = await Promise.all(
    editAccessRequests.map((req) => getNameFromId(req.requester_id)),
  );

  return editAccessRequests.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Edit Access Requests
      </h3>
      <div className="space-y-2">
        {editAccessRequests.map((request, index) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
          >
            <span>
              Room {request.room_id} -{" "}
              {requesterNames[index] || `User ID: ${request.requester_id}`}
            </span>
            <div className="flex space-x-2">
              <FormComponent
                action={async () => {
                  "use server";
                  const result = await handleEditAccessAction(
                    request.id,
                    "accepted",
                  );
                  return result;
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  <CheckCircle size={18} className="text-green-500" />
                </Button>
              </FormComponent>
              <FormComponent
                action={async () => {
                  "use server";
                  const result = await handleEditAccessAction(
                    request.id,
                    "declined",
                  );
                  return result;
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
