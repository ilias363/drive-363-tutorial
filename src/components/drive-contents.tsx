"use client";

import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-folder-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import CustomUploadButton from "./custom-upload-button";
import CreateFolderButton from "./create-folder-button";
import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { EditSelectedButton } from "./edit-selected-button";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
}) {
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  const toggleFolder = (folderId: number) => {
    setSelectedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((folder) => folder !== folderId)
        : [...prev, folderId],
    );
  };
  const toggleFile = (fileId: number) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((file) => file !== fileId)
        : [...prev, fileId],
    );
  };

  const toggleAll = () => {
    if (
      selectedFolders.length + selectedFiles.length ===
      props.folders.length + props.files.length
    ) {
      setSelectedFolders([]);
      setSelectedFiles([]);
    } else {
      setSelectedFolders(props.folders.map((folder) => folder.id));
      setSelectedFiles(props.files.map((file) => file.id));
    }
  };

  return (
    <div className="flex min-h-screen flex-row items-start justify-center gap-6 pl-2 pt-6 text-gray-100">
      <nav className="flex h-[94vh] w-[13vw] flex-col items-center justify-between rounded-lg border border-l-0 border-gray-600 bg-neutral-900 px-4 py-2 shadow-xl">
        <div className="mt-2 flex flex-col items-start gap-3">
          <CreateFolderButton
            parent={props.currentFolderId}
            userId={props.parents[0]!.ownerId}
          />
          <EditSelectedButton
            currentParentId={props.currentFolderId}
            setSelectedFolders={setSelectedFolders}
            setSelectedFiles={setSelectedFiles}
            selectedFoldersIds={selectedFolders}
            selectedFilesIds={selectedFiles}
          />
        </div>
        <div className="my-4">
          <CustomUploadButton currentFolderId={props.currentFolderId} />
        </div>
      </nav>
      <div className="mx-auto max-h-[94vh] flex-1 overflow-y-auto pr-8 pt-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center pl-4">
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
          <div className="flex h-8 w-8 items-center justify-center">
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
                <th className="w-[5%] py-4 text-center">
                  <Checkbox
                    checked={
                      selectedFolders.length + selectedFiles.length ===
                        props.folders.length + props.files.length &&
                      props.folders.length + props.files.length !== 0
                    }
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-2 py-4 text-left text-gray-400">Name</th>
                <th className="w-3/12 px-2 py-4 text-center text-gray-400">
                  Created
                </th>
                <th className="w-2/12 px-2 py-4 text-center text-gray-400">
                  Size
                </th>
                <th className="w-2/12 px-2 py-4 text-center text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {props.folders.map((folder) => (
                <FolderRow
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedFolders.includes(folder.id)}
                  onToggle={toggleFolder}
                />
              ))}
              {props.files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.includes(file.id)}
                  onToggle={toggleFile}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
