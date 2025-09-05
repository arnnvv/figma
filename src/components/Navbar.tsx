import { LogOut, Upload } from "lucide-react";
import Image from "next/image";
import type { QueryResult } from "pg";
import type { JSX } from "react";
import { getCurrentSession, signOutAction, uploadFile } from "@/actions";
import { db } from "@/lib/db";
import { FileInput } from "./FileInput";
import { NavbarClient } from "./NavbarClient";
import { SignOutFormComponent } from "./SignOutForm";
import { UploadFormComponent } from "./UploadFormComponent";
import { AvatarFallback, AvatarImage, AvatarSHAD } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navbar = async (): Promise<JSX.Element> => {
  const { user, session } = await getCurrentSession();

  if (session === null || !user)
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

  let isOwner = false;
  const checkOwnerSql = "SELECT 1 FROM figma_rooms WHERE owner_id = $1 LIMIT 1";
  try {
    const result: QueryResult = await db.query(checkOwnerSql, [user.id]);
    if (result.rowCount && result.rowCount > 0) {
      isOwner = true;
    }
  } catch (error) {
    console.error(`Error checking room ownership for user ${user.id}:`, error);
    isOwner = false;
  }

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
                src={user.picture || "/default-avatar.png"} // Use user directly
                alt={`${user.username || "User"}'s avatar`}
              />
              <AvatarFallback>
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
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
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </SignOutFormComponent>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
