import { Loader2 } from "lucide-react";

export default function DriveLoading() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
      <span>Loading...</span>
    </div>
  );
}
