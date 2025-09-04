import type { CSSProperties, JSX } from "react";

export const FlyingReaction = ({
  x,
  y,
  timestamp,
  value,
}: {
  x: number;
  y: number;
  timestamp: number;
  value: string;
}): JSX.Element => (
  <div
    style={
      {
        "--animation-name": `goUpAnimation${timestamp % 3}, fadeOut`,
        "--animation-duration": "2s",
        left: x,
        top: y,
      } as CSSProperties
    }
    className="pointer-events-none absolute select-none text-2xl md:text-3xl lg:text-4xl flying-reaction"
  >
    <div
      style={
        {
          "--sub-animation-name": `leftRightAnimation${timestamp % 3}`,
          "--sub-animation-duration": "0.3s",
        } as CSSProperties
      }
      className="flying-reaction-child"
    >
      <div className="-translate-x-1/2 -translate-y-1/2 transform">{value}</div>
    </div>
  </div>
);
