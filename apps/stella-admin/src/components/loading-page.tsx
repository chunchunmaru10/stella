import { Loader2 } from "lucide-react";
import React from "react";
import LoadingSpinner from "./loading-spinner";

export default function LoadingPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size={36} />
    </div>
  );
}
