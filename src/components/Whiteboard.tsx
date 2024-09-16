"use client";

import { useOthers } from "@liveblocks/react/suspense";

export const Whiteboard = (): JSX.Element => {
  const others = useOthers();
  return <div className="text-black">{others.length + 1}</div>;
};
