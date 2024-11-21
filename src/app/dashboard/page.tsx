import { getCurrentSession } from "@/actions";
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
import { db } from "@/lib/db";
import { editAccess, rooms } from "@/lib/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { Users, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { JSX, Suspense } from "react";

export default async (): Promise<JSX.Element> => {
	const { user, session } = await getCurrentSession();
	if (session === null) return redirect("/login");
	const res = await db
		.select({
			maxId: sql<number>`MAX(CAST(id AS INT))`.as("maxId"),
		})
		.from(rooms);
	const maxId: number = res[0]?.maxId ?? 0;
	const roomId: number = maxId + 1;

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
						<FormComponent
							action={async (_, formData) => {
								"use server";
								const { session } = await getCurrentSession();
								if (session === null) return { error: "Not logged in" };
								const roomId = formData.get("roomId") as string;
								try {
									const existingRoom = await db.query.rooms.findFirst({
										where: eq(rooms.id, roomId),
									});
									if (!existingRoom) return { error: "Room doesn't exist" };
									if (existingRoom.ownerId === user.id)
										return { error: "Can't send Req to yourself" };
									try {
										const existingRequest = await db.query.editAccess.findFirst(
											{
												where: and(
													eq(editAccess.requesterId, user.id),
													eq(editAccess.roomIdRequestedFor, roomId),
													or(
														eq(editAccess.status, "pending"),
														eq(editAccess.status, "accepted"),
													),
												),
											},
										);

										if (existingRequest)
											return { error: "Request already sent" };

										await db.insert(editAccess).values({
											requesterId: user.id,
											roomIdRequestedFor: roomId,
											status: "pending",
										});
										return { message: "Request Sent" };
									} catch {
										return { error: "Couldn't send Req" };
									}
								} catch {
									return { error: "Couldn't find room" };
								}
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
