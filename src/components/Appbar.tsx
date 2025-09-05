import Image from "next/image";
import { type JSX, memo } from "react";
import { navElements } from "@/lib/constants";
import type { ActiveElement, AppbarProps } from "../../types";
import { NewThread } from "./comments/NewThread";
import { ShapesMenu } from "./ShapesMenu";
import { Users } from "./Users";
import { Button } from "./ui/button";

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
          {navElements.map((item: ActiveElement | any): JSX.Element => {
            const isElementActive = isActive(item.value);
            const commonClasses =
              "group px-2.5 py-5 flex justify-center items-center h-full";

            if (Array.isArray(item.value)) {
              return (
                <li
                  key={item.name}
                  className={`${commonClasses} ${isElementActive ? "bg-primary-green" : "hover:bg-primary-grey-200"}`}
                >
                  <ShapesMenu
                    item={item}
                    activeElement={activeElement}
                    imageInputRef={imageInputRef}
                    handleActiveElement={handleActiveElement}
                    handleImageUpload={handleImageUpload}
                  />
                </li>
              );
            }

            if (item.value === "comments") {
              return (
                <li
                  key={item.name}
                  className={`${commonClasses} ${isElementActive ? "bg-primary-green" : "hover:bg-primary-grey-200"}`}
                >
                  <NewThread>
                    <Button
                      className="relative w-5 h-5 object-contain"
                      onClick={() => handleActiveElement(item)}
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        fill
                        className={isElementActive ? "invert" : ""}
                      />
                    </Button>
                  </NewThread>
                </li>
              );
            }

            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => handleActiveElement(item)}
                  className={`${commonClasses} w-full ${isElementActive ? "bg-primary-green" : "hover:bg-primary-grey-200"}`}
                >
                  <div className="relative w-5 h-5 object-contain">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      fill
                      className={isElementActive ? "invert" : ""}
                    />
                  </div>
                </button>
              </li>
            );
          })}
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
