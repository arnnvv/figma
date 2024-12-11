"use client";

import { ButtonHTMLAttributes, ElementType, FC, JSX, ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  borderRadius?: string;
  children: ReactNode;
  as?: ElementType;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}): JSX.Element => (
  <Component
    className={cn(
      "bg-transparent relative text-xl h-16 w-40 p-[1px] overflow-hidden ",
      containerClassName,
    )}
    style={{
      borderRadius: borderRadius,
    }}
    {...otherProps}
  >
    <div
      className="absolute inset-0"
      style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
    >
      <MovingBorder duration={duration} rx="30%" ry="30%">
        <div
          className={cn(
            "h-20 w-20 opacity-[0.8] bg-[radial-gradient(var(--sky-500)_40%,transparent_60%)]",
            borderClassName,
          )}
        />
      </MovingBorder>
    </div>

    <div
      className={cn(
        "relative bg-slate-900/[0.8] border border-slate-800 backdrop-blur-xl text-white flex items-center justify-center w-full h-full text-sm antialiased",
        className,
      )}
      style={{
        borderRadius: `calc(${borderRadius} * 0.96)`,
      }}
    >
      {children}
    </div>
  </Component>
);

export const MovingBorder: FC<{
  children: ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: any;
}> = ({ children, duration = 2000, rx, ry, ...otherProps }): JSX.Element => {
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pct = (time % duration) / duration;
      progress.set(pct);
    }
  });

  const x = useTransform(
    progress,
    (val) =>
      pathRef.current && (val * pathRef.current.getTotalLength()).toFixed(0),
  );

  return (
    <div className="absolute inset-0" {...otherProps}>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          transform: "translate(0%, 0%) rotate(0deg)",
        }}
      >
        <motion.path
          fill="none"
          strokeWidth="1"
          stroke="white"
          strokeDasharray="0 1"
          d={`
            M 0,0
            L 100,0
            L 100,100
            L 0,100
            Z
          `}
          style={{
            pathLength: 1,
            strokeDasharray: 1,
            strokeDashoffset: x,
          }}
        />
        <path
          ref={pathRef}
          d={`
            M 0,0
            L 100,0
            L 100,100
            L 0,100
            Z
          `}
          fill="none"
          strokeOpacity={0}
        />
      </svg>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: "0",
        }}
      >
        <defs>
          <motion.path
            id="border-path"
            fill="none"
            strokeWidth="1"
            stroke="white"
            strokeDasharray="0 1"
            d={`
              M 0,0
              L 100,0
              L 100,100
              L 0,100
              Z
            `}
            style={{
              pathLength: 1,
              strokeDasharray: 1,
              strokeDashoffset: x,
            }}
          />
        </defs>
        <use xlinkHref="#border-path" />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          inset: "0",
          rotate: useMotionTemplate`${useTransform(progress, [0, 1], [0, 360])}deg`,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
