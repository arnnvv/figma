"use client";

import { useThreads } from "@liveblocks/react/suspense";
import { Thread } from "@liveblocks/react-ui";
import { ThreadData } from "@liveblocks/client";

export const CommentsOverlay = (): JSX.Element => {
  const { threads } = useThreads();

  return (
    <div>
      {threads.map(
        (thread: ThreadData): JSX.Element => (
          <Thread key={thread.id} thread={thread} />
        ),
      )}
    </div>
  );
};
