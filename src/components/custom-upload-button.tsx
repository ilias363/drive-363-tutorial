"use client";

import { Upload } from "lucide-react";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";

export default function CustomUploadButton(props: { currentFolderId: number }) {
  const navigate = useRouter();

  const posthog = usePostHog();

  const randomKey = Math.random();

  return (
    <UploadButton
      endpoint="driveUploader"
      uploadProgressGranularity="fine"
      onBeforeUploadBegin={(files) => {
        toast.loading("Preparing files...", {
          description: "Preparing files for upload",
          id: "upload-prepare-" + randomKey,
          duration: 100000,
        });
        return files;
      }}
      onUploadBegin={() => {
        posthog.capture("upload_begin");
        toast.dismiss("upload-prepare-" + randomKey);
        toast.loading("Upload started", {
          description: "Your files are being uploaded",
          id: "upload-begin-" + randomKey,
          duration: 100000,
        });
      }}
      onUploadAborted={() => {
        toast.dismiss("upload-prepare-" + randomKey);
        toast.dismiss("upload-begin-" + randomKey);
        toast.error("Upload aborted");
      }}
      onUploadError={(error) => {
        posthog.capture("upload_error", { error });
        toast.dismiss("upload-prepare-" + randomKey);
        toast.dismiss("upload-begin-" + randomKey);
        console.log(error);
        toast.error("Upload failed", {
          description: "Check the console for more info",
        });
      }}
      onClientUploadComplete={() => {
        posthog.capture("upload_complete");
        toast.dismiss("upload-prepare-" + randomKey);
        toast.dismiss("upload-begin-" + randomKey);
        toast.success("Upload completed!");
        navigate.refresh();
      }}
      input={{
        folderId: props.currentFolderId,
      }}
      config={{ cn: twMerge }}
      appearance={{
        button:
          "focus-within:ring-offset-0 focus-within:ring-2 focus-within:ring-neutral-600 ut-readying:bg-neutral-800 ut-ready:bg-neutral-800 ut-ready:hover:bg-neutral-700 ut-uploading:bg-neutral-800 data-[state=uploading]:after:bg-neutral-950 ut-uploading:border-2 ut-uploading:border-neutral-600 ut-uploading:cursor-not-allowed text-md font-medium",
        container: "",
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
