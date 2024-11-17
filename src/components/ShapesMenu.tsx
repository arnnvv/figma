import Image from "next/image";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ActiveElement, ShapesMenuProps } from "../../types";
import { JSX } from "react";

export const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
}: ShapesMenuProps): JSX.Element => {
  const isDropdownElem = item.value.some(
    (elem: ActiveElement): boolean => elem?.value === activeElement.value,
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button
            className="relative h-5 w-5 object-contain"
            onClick={() => handleActiveElement(item)}
          >
            <Image
              src={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              fill
              className={isDropdownElem ? "invert" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-5 flex flex-col gap-y-1 border-none bg-primary-black py-4 text-white">
          {item.value.map(
            (elem: ActiveElement): JSX.Element => (
              <Button
                key={elem?.name}
                onClick={() => {
                  handleActiveElement(elem);
                }}
                className={`flex h-fit justify-between gap-10 rounded-none px-5 py-3 focus:border-none ${
                  activeElement.value === elem?.value
                    ? "bg-primary-green"
                    : "hover:bg-primary-grey-200"
                }`}
              >
                <div className="group flex items-center gap-2">
                  <Image
                    src={elem?.icon as string}
                    alt={elem?.name as string}
                    width={20}
                    height={20}
                    className={
                      activeElement.value === elem?.value ? "invert" : ""
                    }
                  />
                  <p
                    className={`text-sm  ${
                      activeElement.value === elem?.value
                        ? "text-primary-black"
                        : "text-white"
                    }`}
                  >
                    {elem?.name}
                  </p>
                </div>
              </Button>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
};
