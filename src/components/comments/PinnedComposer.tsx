import { Composer, type ComposerProps } from "@liveblocks/react-ui";
import Image from "next/image";
import type { JSX, KeyboardEvent as ReactKeyboardEvent } from "react";

export const PinnedComposer = ({
  onComposerSubmit,
  ...props
}: {
  onComposerSubmit: ComposerProps["onComposerSubmit"];
}): JSX.Element => (
  <div className="absolute flex gap-4" {...props}>
    <div className="select-none relative w-9 h-9 shadow rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full bg-white flex justify-center items-center">
      <Image
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        alt="someone"
        width={28}
        height={28}
        className="rounded-full"
      />
    </div>
    <div className="shadow bg-white rounded-lg flex flex-col text-sm min-w-96 overflow-hidden p-2">
      <Composer
        onComposerSubmit={onComposerSubmit}
        autoFocus={true}
        onKeyUp={(e: ReactKeyboardEvent<HTMLFormElement>) => {
          e.stopPropagation();
        }}
      />
    </div>
  </div>
);
