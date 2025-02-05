import { type JSX, memo } from "react";
import type { ActiveElement, AppbarProps } from "../../types";
import Image from "next/image";
import { navElements } from "@/lib/constants";
import { Button } from "./ui/button";
import { Users } from "./Users";
import { ShapesMenu } from "./ShapesMenu";
import { NewThread } from "./comments/NewThread";

export const Appbar = memo(
  ({
    activeElement,
    imageInputRef,
    handleImageUpload,
    handleActiveElement,
  }: AppbarProps): JSX.Element => {
    const isActive = (value: string | Array<ActiveElement>): boolean =>
      (activeElement && activeElement.value === value) ||
      (Array.isArray(value) &&
        value.some(
          (val: ActiveElement): boolean => val?.value === activeElement?.value,
        ));
    return (
      <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
        <div className="flex-1" />
        <ul className="flex flex-row justify-center flex-1">
          {navElements.map(
            (item: ActiveElement | any): JSX.Element => (
              <li
                key={item.name}
                onClick={() => {
                  if (Array.isArray(item.value)) return;
                  handleActiveElement(item);
                }}
                className={`group px-2.5 py-5 flex justify-center items-center
            ${isActive(item.value) ? "bg-primary-green" : "hover:bg-primary-grey-200"}
            `}
              >
                {Array.isArray(item.value) ? (
                  <ShapesMenu
                    item={item}
                    activeElement={activeElement}
                    imageInputRef={imageInputRef}
                    handleActiveElement={handleActiveElement}
                    handleImageUpload={handleImageUpload}
                  />
                ) : item?.value === "comments" ? (
                  <NewThread>
                    <Button className="relative w-5 h-5 object-contain">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        fill
                        className={isActive(item.value) ? "invert" : ""}
                      />
                    </Button>
                  </NewThread>
                ) : (
                  <Button className="relative w-5 h-5 object-contain">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      fill
                      className={isActive(item.value) ? "invert" : ""}
                    />
                  </Button>
                )}
              </li>
            ),
          )}
        </ul>
        <div className="flex-1 flex justify-end">
          <Users />
        </div>
      </nav>
    );
  },
  (
    prevProps: Readonly<AppbarProps>,
    nextProps: Readonly<AppbarProps>,
  ): boolean => prevProps.activeElement === nextProps.activeElement,
);
