"use client";

import { ClientSideSuspense } from "@liveblocks/react/suspense";
import type { JSX } from "react";
import { ModernLoader } from "../ModernLoader";
import { CommentsOverlay } from "./CommentsOverlay";

export const Comments = (): JSX.Element => (
  <ClientSideSuspense fallback={<ModernLoader />}>
    {(): JSX.Element => <CommentsOverlay />}
  </ClientSideSuspense>
);
