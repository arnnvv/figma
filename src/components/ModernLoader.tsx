import type { JSX } from "react";
import { Skeleton } from "./ui/skeleton";

export const ModernLoader = (): JSX.Element => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-50">
    <div className="relative">
      <Skeleton className="w-32 h-32 rounded-full bg-gray-200 animate-pulse sm:w-40 sm:h-40 md:w-48 md:h-48" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin sm:w-32 sm:h-32 md:w-40 md:h-40" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-50 sm:w-10 sm:h-10 md:w-12 md:h-12" />
      </div>
    </div>
  </div>
);
