import Image from "next/image";
import styles from "./Avatar.module.css";
import { JSX } from "react";

export const Avatar = ({
  namename,
  otherStyles,
}: {
  namename: string;
  otherStyles: string;
}): JSX.Element => (
  <div
    className={`${styles.avatar} ${otherStyles} h-9 w-9`}
    data-tooltip={namename}
  >
    <Image
      src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
      fill
      className={styles.avatar_picture}
      alt={namename}
    />
  </div>
);
