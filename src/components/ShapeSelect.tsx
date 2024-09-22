import { getShapeInfo } from "@/lib/utils";
import Image from "next/image";
import { useMemo } from "react";

export const ShapeSelect = ({
  allShapes,
}: {
  allShapes: Array<any>;
}): JSX.Element =>
  useMemo(
    (): JSX.Element => (
      <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
        <div className="flex flex-col">
          {allShapes?.map((shape: any): JSX.Element => {
            const info = getShapeInfo(shape[1]?.type);

            return (
              <div
                key={shape[1]?.objectId}
                className="group my-1 flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer hover:bg-primary-green hover:text-primary-black"
              >
                <Image
                  src={info?.icon}
                  alt="Layer"
                  width={16}
                  height={16}
                  className="group-hover:invert"
                />
                <h3 className="text-sm font-semibold capitalize">
                  {info.name}
                </h3>
              </div>
            );
          })}
        </div>
      </section>
    ),
    [allShapes],
  );
