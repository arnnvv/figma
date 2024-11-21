import Link from "next/link";
import { JSX } from "react";

export default function NotFound(): JSX.Element {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden text-white">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-gray-900 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-noise opacity-20"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div
          className="
            text-[20vw] md:text-[25vw] 
            font-black 
            text-transparent 
            bg-clip-text 
            bg-gradient-to-r 
            from-gray-500 
            to-white 
            opacity-20 
            select-none 
            pointer-events-none
            absolute 
            top-1/2 
            left-1/2 
            transform 
            -translate-x-1/2 
            -translate-y-1/2
            z-0
          "
        >
          404
        </div>

        {/* Centered Content */}
        <div className="relative z-10 space-y-6">
          <h1
            className="
              text-4xl 
              md:text-6xl 
              font-bold 
              mb-4 
              bg-gradient-to-r 
              from-white 
              to-gray-400 
              bg-clip-text 
              text-transparent
              tracking-tight
            "
          >
            Lost in the Digital Wilderness
          </h1>

          <p
            className="
              text-lg 
              md:text-xl 
              text-gray-300 
              max-w-2xl 
              mx-auto 
              mb-8
              leading-relaxed
            "
          >
            The page you&apos;re searching for has vanished into the endless
            expanses of the internet. It seems to have taken an unexpected
            journey beyond the boundaries of known digital territories.
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/"
              className="
                px-8 
                py-3 
                bg-white/10 
                hover:bg-white/20 
                border 
                border-white/20 
                hover:border-white/40 
                rounded-full 
                text-white 
                font-semibold 
                transition-all 
                duration-300 
                flex 
                items-center 
                space-x-2
                group
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Return Home</span>
            </Link>

            <a
              href="/contact"
              className="
                px-8 
                py-3 
                bg-transparent 
                border 
                border-white/20 
                hover:bg-white/10 
                rounded-full 
                text-gray-300 
                hover:text-white 
                font-semibold 
                transition-all 
                duration-300 
                flex 
                items-center 
                space-x-2
                group
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>

      <div
        className="
          absolute 
          inset-0 
          pointer-events-none 
          opacity-50 
          mix-blend-screen
        "
      >
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="
              absolute 
              bg-white/30 
              rounded-full 
              animate-star
            "
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes starAnimation {
  0% { transform: scale(0.5) translateY(0); opacity: 0.5; }
  50% { transform: scale(1) translateY(-10px); opacity: 1; }
  100% { transform: scale(0.5) translateY(0); opacity: 0.5; }
}

.animate-gradient-slow {
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
}

.animate-star {
  animation: starAnimation linear infinite;
}

.bg-noise {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
`;
