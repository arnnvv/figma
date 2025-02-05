import type { JSX } from "react";

export const Loader = (): JSX.Element => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);
