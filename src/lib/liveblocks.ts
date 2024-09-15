export const getLiveBlocksSecret = (): string =>
  process.env.NEXT_PUBLIC_LIVEBLOCKS_PLUBLIC_KEY ??
  ((): never => {
    throw new Error("Missing NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY");
  })();
