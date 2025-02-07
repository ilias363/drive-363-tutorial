"use client";

import { Upload } from "lucide-react";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function CustomUploadButton(props: { currentFolderId: number }) {
  const navigate = useRouter();

  return (
    <UploadButton
      endpoint="driveUploader"
      onClientUploadComplete={() => {
        navigate.refresh();
      }}
      input={{
        folderId: props.currentFolderId,
      }}
      config={{ cn: twMerge }}
      appearance={{
        button:
          "focus-within:ring-offset-0 focus-within:ring-2 focus-within:ring-neutral-600 ut-readying:bg-neutral-800 ut-ready:bg-neutral-800 ut-uploading:bg-neutral-800 after:bg-neutral-950 ut-uploading:border-2 ut-uploading:border-neutral-600 ut-uploading:cursor-not-allowed text-md font-medium",
        container: "p-2 my-2",

        allowedContent: "flex items-center justify-center text-white",
      }}
      content={{
        button({ ready, isUploading }) {
          if (isUploading) return;
          if (ready)
            return (
              <div className="flex flex-row items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </div>
            );
          return "Initializing...";
        },
        allowedContent({ ready, isUploading }) {
          if (!ready) return "Initializing...";
          if (isUploading) return "Uploading files...";
        },
      }}
    />
  );
}
