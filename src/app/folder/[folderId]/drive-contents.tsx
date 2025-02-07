"use client";

import { Upload, ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-folder-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
}) {
  const navigate = useRouter();

  return (
    <div className="min-h-screen p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={`/folder/${props.parents.find((parent) => parent.parent === null)?.id}`}
              className="text-gray-300 hover:text-white"
            >
              My Drive
            </Link>
            {props.parents
              .filter((parent) => parent.parent)
              .map((folder) => (
                <div key={folder.id} className="flex items-center">
                  <ChevronRight className="mx-2 text-gray-500" size={16} />
                  <Link
                    href={`/folder/${folder.id}`}
                    className="text-gray-300 hover:text-white"
                  >
                    {folder.name}
                  </Link>
                </div>
              ))}
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div className="rounded-lg bg-neutral-900/50 shadow-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="w-1/2 px-6 py-4 text-left text-gray-400">
                  Name
                </th>
                <th className="w-1/6 px-6 py-4 text-center text-gray-400">
                  Type
                </th>
                <th className="w-1/4 px-6 py-4 text-center text-gray-400">
                  Size
                </th>
                <th className="w-1/12 px-6 py-4 text-center text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {props.folders.map((folder) => (
                <FolderRow key={folder.id} folder={folder} />
              ))}
              {props.files.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </tbody>
          </table>
        </div>

        <UploadButton
          endpoint="driveUploader"
          onClientUploadComplete={() => {
            navigate.refresh();
          }}
          input={{
            folderId: props.currentFolderId,
          }}
          appearance={{
            button:
              "focus-within:ring-0 ut-readying:bg-neutral-800 ut-ready:bg-neutral-800 ut-uploading:bg-neutral-800 after:bg-neutral-950 ut-uploading:border-2 ut-uploading:border-neutral-600 ut-uploading:cursor-not-allowed text-md font-medium",
            container: "p-2 my-2",
            allowedContent: "flex items-center justify-center text-white",
          }}
          content={{
            button({ ready, isUploading }) {
              if (isUploading) return;
              // if (ready) return "Upload Files";
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
      </div>
    </div>
  );
}
