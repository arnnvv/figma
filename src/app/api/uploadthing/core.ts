import { getCurrentSession } from "@/actions";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  uploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async (): Promise<{ userId: number }> => {
      const { session, user } = await getCurrentSession();
      if (session === null) throw new UploadThingError("Unauthorized");
      const userId = user.id;
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      await db
        .update(users)
        .set({ picture: file.url })
        .where(eq(users.id, metadata.userId));
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
