import { getCurrentSession, signOutAction, uploadFile } from "@/actions";
import Image from "next/image";
import { Button } from "./ui/button";
import { NavbarClient } from "./NavbarClient";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JSX } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AvatarFallback, AvatarImage, AvatarSHAD } from "./ui/avatar";
import { LogOut, Upload } from "lucide-react";
import { SignOutFormComponent } from "./SignOutForm";
import { FileInput } from "./FileInput";
import { UploadFormComponent } from "./UploadFormComponent";

export const Navbar = async (): Promise<JSX.Element> => {
  const { user, session } = await getCurrentSession();
  if (session === null)
    return (
      <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
        <Image
          src="/assets/logo.svg"
          alt="FigPro Logo"
          width={58}
          height={20}
        />
      </nav>
    );

  const isOwner: boolean =
    (
      await db
        .select({ id: rooms.id })
        .from(rooms)
        .where(eq(rooms.ownerId, user.id))
        .limit(1)
    ).length > 0;

  const text: string = !user.picture ? "Upload Image" : "Change Image";

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />

      <div className="flex items-center gap-4">
        <NavbarClient isOwner={isOwner} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AvatarSHAD className="cursor-pointer">
              <AvatarImage
                src={user?.picture || "/default-avatar.png"}
                alt={`${user?.username || "User"}'s avatar`}
              />
              <AvatarFallback>
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </AvatarSHAD>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <UploadFormComponent action={uploadFile}>
                <label
                  htmlFor="upload-button"
                  className="w-full block cursor-pointer hover:bg-secondary p-2 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>{text}</span>
                  </div>
                  <FileInput />
                </label>
              </UploadFormComponent>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <SignOutFormComponent action={signOutAction}>
                <Button variant="ghost" className="w-full justify-start">
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </>
                </Button>
              </SignOutFormComponent>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
