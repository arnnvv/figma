"use client";

import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { CommentsOverlay } from "./CommentsOverlay";
import { ModernLoader } from "../ModernLoader";

export const Comments = (): JSX.Element => (
  <ClientSideSuspense fallback={<ModernLoader />}>
    {(): JSX.Element => <CommentsOverlay />}
  </ClientSideSuspense>
);
