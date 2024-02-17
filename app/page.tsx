"use client";

import { useOthers } from "../liveblocks.config";

export default function Page() {
  const others = useOthers();
  const userCount = others.length;
  return (
    <h1 className="text-2xl text-white">
      There are {userCount} other user(s) online
    </h1>
  );
}
