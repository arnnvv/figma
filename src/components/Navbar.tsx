import { getCurrentSession, signOutAction } from "@/actions";
import Image from "next/image";
import { FormComponent } from "./FormComponent";
import { Button } from "./ui/button";
import { NavbarClient } from "./NavbarClient";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JSX } from "react";
import { AuthFormComponent } from "./AuthFormComponent";

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

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />

      <div className="flex items-center gap-4">
        <NavbarClient isOwner={isOwner} />
        {user && (
          <AuthFormComponent action={signOutAction}>
            <Button>Logout</Button>
          </AuthFormComponent>
        )}
      </div>
    </nav>
  );
};
