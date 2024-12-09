import Image from "next/image";
import { JSX } from "react";

export const Avatar = ({
  namename,
  otherStyles,
}: {
  namename: string;
  otherStyles: string;
}): JSX.Element => (
  <div
    className={`relative flex items-center justify-center w-14 h-14 bg-gray-400 rounded-full border-4 border-white -ml-3 group ${otherStyles}`}
    data-tooltip={namename}
  >
    <Image
      src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
      fill
      className="w-full h-full rounded-full object-cover"
      alt={namename}
    />
  </div>
);
