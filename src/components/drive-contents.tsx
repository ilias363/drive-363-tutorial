import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-folder-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import CustomUploadButton from "./custom-upload-button";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
}) {
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
        <CustomUploadButton currentFolderId={props.currentFolderId} />
      </div>
    </div>
  );
}
