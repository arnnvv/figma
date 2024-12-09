import { JSX } from "react";

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
  <>
    <div
      className={`
        pointer-events-none
        absolute
        select-none
        goUp${timestamp % 3}
        text-${(timestamp % 5) + 2}xl
      `}
      style={{ left: x, top: y }}
    >
      <div className={`leftRight${timestamp % 3}`}>
        <div className="-translate-x-1/2 -translate-y-1/2 transform">
          {value}
        </div>
      </div>
    </div>

    <style jsx>{`
      .goUp0 {
        opacity: 0;
        animation:
          goUpAnimation0 2s,
          fadeOut 2s;
      }
      @keyframes goUpAnimation0 {
        from {
          transform: translate(0px, 0px);
        }
        to {
          transform: translate(0px, -400px);
        }
      }

      .goUp1 {
        opacity: 0;
        animation:
          goUpAnimation1 2s,
          fadeOut 2s;
      }
      @keyframes goUpAnimation1 {
        from {
          transform: translate(0px, 0px);
        }
        to {
          transform: translate(0px, -300px);
        }
      }

      .goUp2 {
        opacity: 0;
        animation:
          goUpAnimation2 2s,
          fadeOut 2s;
      }
      @keyframes goUpAnimation2 {
        from {
          transform: translate(0px, 0px);
        }
        to {
          transform: translate(0px, -200px);
        }
      }

      .leftRight0 {
        animation: leftRightAnimation0 0.3s alternate infinite ease-in-out;
      }
      @keyframes leftRightAnimation0 {
        from {
          transform: translate(0px, 0px);
        }
        to {
          transform: translate(50px, 0px);
        }
      }

      .leftRight1 {
        animation: leftRightAnimation1 0.3s alternate infinite ease-in-out;
      }
      @keyframes leftRightAnimation1 {
        from {
          transform: translate(0px, 0px);
        }
        to {
          transform: translate(100px, 0px);
        }
      }

      .leftRight2 {
        animation: leftRightAnimation2 0.3s alternate infinite ease-in-out;
      }
      @keyframes leftRightAnimation2 {
        from {
          transform: translate(0px, 0px);
        }
        to {
          transform: translate(-50px, 0px);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `}</style>
  </>
);
