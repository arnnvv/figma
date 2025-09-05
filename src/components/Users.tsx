import type { User } from "@liveblocks/client";
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { type JSX, useMemo } from "react";
import { generateRandomName } from "@/lib/utils";
import { Avatar } from "./Avatar";

export const Users = (): JSX.Element => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  return useMemo(
    (): JSX.Element => (
      <div className="flex items-center justify-center gap-1">
        <div className="flex pl-3">
          {currentUser && (
            <div className="relative ml-8 first:ml-0">
              <Avatar
                namename={"kjadgf"}
                otherStyles="border-3[px] border-primary-green"
              />
            </div>
          )}
          {users.slice(0, 3).map(
            ({
              connectionId,
            }: User<
              { cursor: { x: number; y: number } | null; message: string },
              { id: string }
            >): JSX.Element => (
              <Avatar
                key={connectionId}
                namename={generateRandomName()}
                otherStyles="-ml-3"
              />
            ),
          )}
          {hasMoreUsers && (
            <div
              style={{
                borderWidth: "4px",
                borderRadius: "9999px",
                borderColor: "white",
                backgroundColor: "#9ca3af",
                minWidth: "56px",
                width: "56px",
                height: "56px",
                marginLeft: "-0.75rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
              }}
            >
              +{users.length - 3}
            </div>
          )}
        </div>
      </div>
    ),
    [users.length, currentUser, hasMoreUsers, users.slice],
  );
};
