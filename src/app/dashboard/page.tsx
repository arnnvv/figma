"use client";

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
import { Users, PlusCircle } from "lucide-react";

export default (): JSX.Element => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to RoomConnect
        </CardTitle>
        <CardDescription className="text-center">
          Join an existing room or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="room-id"
            className="text-sm font-medium text-gray-700"
          >
            Join Room
          </label>
          <div className="flex space-x-2">
            <Input
              id="room-id"
              type="text"
              placeholder="Enter room ID"
              className="flex-grow"
            />
            <Button className="flex items-center space-x-1">
              <Users size={18} />
              <span>Join</span>
            </Button>
          </div>
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
        <Button className="w-full flex items-center justify-center space-x-2">
          <PlusCircle size={18} />
          <span>Create New Room</span>
        </Button>
      </CardFooter>
    </Card>
  </div>
);
