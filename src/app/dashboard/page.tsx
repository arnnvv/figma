import { getCurrentSession, askEditAccessAction } from "@/actions";
import {
  EditableRooms,
  EditableRoomsSkeleton,
  EditAccessRequests,
  EditAccessRequestsSkeleton,
  UserRooms,
  UserRoomsSkeleton,
} from "@/components/DashComponents";
import { FormComponent } from "@/components/FormComponent";
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
import { getMaxRoomId_Raw, insertRoom_Raw } from "@/lib/db/inlinequeries";
import { Users, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { type JSX, Suspense } from "react";

export default async (): Promise<JSX.Element> => {
  const { user, session } = await getCurrentSession();
  if (session === null) return redirect("/login");
  if (!user.verified) return redirect("/email-verification");
  if (
    user.username.startsWith("google-") ||
    user.username.startsWith("github-")
  )
    return redirect("/get-username");

  const maxId: number = await getMaxRoomId_Raw();
  const nextRoomId: number = maxId + 1;

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
          <div className="space-y-4">
            <Suspense fallback={<UserRoomsSkeleton />}>
              <UserRooms userId={user.id} />
            </Suspense>
            <Suspense fallback={<EditableRoomsSkeleton />}>
              <EditableRooms userId={user.id} />
            </Suspense>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="roomId"
              className="text-sm font-medium text-gray-700"
            >
              Ask Edit Access
            </label>
            {/* Use the dedicated server action */}
            <FormComponent action={askEditAccessAction}>
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
                  <span>Ask</span>
                </Button>
              </div>
            </FormComponent>
          </div>

          <Suspense fallback={<EditAccessRequestsSkeleton />}>
            <EditAccessRequests userId={user.id} />
          </Suspense>

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
            action={async () => {
              "use server";
              const { user: currentUser, session: currentSession } =
                await getCurrentSession();
              if (!currentSession || !currentUser) {
                console.error("Create room action failed: User not logged in.");
                return { error: "Authentication required." };
              }

              const newRoomIdString = String(nextRoomId);

              try {
                await insertRoom_Raw({
                  id: newRoomIdString,
                  owner_id: currentUser.id,
                });
              } catch (error: any) {
                console.error(
                  `Failed to create room ${newRoomIdString}:`,
                  error,
                );
                return {
                  error: `Failed to create room: ${error.message || "Unknown error"}`,
                };
              }
              redirect(`/room/${newRoomIdString}`);
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
