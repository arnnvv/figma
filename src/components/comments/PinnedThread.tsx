import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-ui";
import Image from "next/image";
import {
  JSX,
  KeyboardEvent as ReactKeyboardEvent,
  useMemo,
  useState,
} from "react";

export const PinnedThread = ({
  thread,
  onFocus,
  ...props
}: {
  thread: ThreadData<{
    x: number;
    y: number;
    time?: number;
    resolved: boolean;
    zIndex: number;
  }>;
  onFocus: (threadId: string) => void;
}): JSX.Element => {
  const startMinimized = useMemo(
    (): boolean =>
      Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread],
  );

  const [minimized, setMinimized] = useState(startMinimized);

  return useMemo(
    (): JSX.Element => (
      <div
        className="absolute flex cursor-pointer gap-4"
        {...props}
        onClick={(e: any) => {
          onFocus(thread.id);

          if (
            e.target &&
            e.target.classList.contains("lb-icon") &&
            e.target.classList.contains("lb-button-icon")
          ) {
            return;
          }

          setMinimized(!minimized);
        }}
      >
        <div
          className="relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow"
          data-draggable={true}
        >
          <Image
            src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
            alt="Dummy Name"
            width={28}
            height={28}
            draggable={false}
            className="rounded-full"
          />
        </div>
        {!minimized ? (
          <div className="flex min-w-60 flex-col overflow-hidden rounded-lg bg-white text-sm shadow">
            <Thread
              thread={thread}
              indentCommentContent={false}
              onKeyUp={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                e.stopPropagation();
              }}
            />
          </div>
        ) : null}
      </div>
    ),
    [thread.comments.length, minimized],
  );
};
