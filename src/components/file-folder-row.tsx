"use client";

import { Folder as FolderIcon, FileIcon } from "lucide-react";
import Link from "next/link";
import {
  deleteFiles,
  deleteFolders,
  renameFile,
  renameFolder,
} from "~/server/actions";
import type { files_table, folders_table } from "~/server/db/schema";
import { toast } from "sonner";
import { ActionsDropdown } from "./actions-dropdown";
import { useState } from "react";
import { RenameDialog } from "./rename-dialog";

export function FileRow(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const handleRename = async (newName: string) => {
    const toastId = `rename-file-${file.id}`;
    toast.loading(`Renaming file "${file.name}" -> "${newName}"`, {
      id: toastId,
    });

    try {
      await renameFile(file.id, newName);
      toast.dismiss(toastId);
      toast.success(`File "${file.name}" renamed to "${newName}" successfully`);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Failed to rename file "${file.name}"`, {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const onRename = () => {
    setRenameDialogOpen(true);
  };

  const onMove = () => 1;

  const handleDelete = async () => {
    const fileName =
      file.name.length > 15 ? file.name.slice(0, 15) + "..." : file.name;
    const toastId = "file-delete-loading" + file.id;

    toast.loading('Deleting file "' + fileName + '"', {
      id: toastId,
    });

    try {
      await deleteFiles([file.id]);
      toast.dismiss(toastId);
      toast.success('File "' + fileName + '" deleted successfully');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to delete file "' + fileName + '"', {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-black/30">
        <td className="px-6 py-4">
          <a
            href={file.url ?? "#"}
            className="flex items-center text-gray-100 hover:text-blue-400"
            target="_blank"
          >
            <FileIcon className="mr-3" size={20} />
            {file.name}
          </a>
        </td>
        <td className="px-6 py-4 text-center text-gray-400">
          {file.createdAt.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td className="px-6 py-4 text-center text-gray-400">{file.size}</td>
        <td className="px-6 py-4 text-center text-gray-400">
          <ActionsDropdown
            onRename={onRename}
            onMove={onMove}
            onDelete={handleDelete}
          />
        </td>
      </tr>
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        initialName={file.name}
        onRename={handleRename}
      />
    </>
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
}) {
  const { folder } = props;
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const handleRename = async (newName: string) => {
    const toastId = `rename-folder-${folder.id}`;
    toast.loading(`Renaming folder "${folder.name}" -> "${newName}"`, {
      id: toastId,
    });

    try {
      await renameFolder(folder.id, newName);
      toast.dismiss(toastId);
      toast.success(
        `Folder "${folder.name}" renamed to "${newName}" successfully`,
      );
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Failed to rename folder "${folder.name}"`, {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const onRename = () => {
    setRenameDialogOpen(true);
  };

  const onMove = () => 1;

  const handleDelete = async () => {
    const folderName =
      folder.name.length > 15 ? folder.name.slice(0, 15) + "..." : folder.name;
    const toastId = "folder-delete-loading" + folder.id;

    toast.loading('Deleting folder "' + folderName + '"', {
      id: toastId,
    });

    try {
      await deleteFolders([folder.id]);
      toast.dismiss(toastId);
      toast.success('Folder "' + folderName + '" deleted successfully');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to delete folder "' + folderName + '"', {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-black/30">
        <td className="px-6 py-4">
          <Link
            href={`/folder/${folder.id}`}
            className="flex items-center text-gray-100 hover:text-blue-400"
          >
            <FolderIcon className="mr-3" size={20} />
            {folder.name}
          </Link>
        </td>
        <td className="px-6 py-4 text-center text-gray-400">
          {folder.createdAt.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td className="px-6 py-4 text-center text-gray-400">--</td>
        <td className="px-6 py-4 text-center text-gray-400">
          <ActionsDropdown
            onRename={onRename}
            onMove={onMove}
            onDelete={handleDelete}
          />
        </td>
      </tr>
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        initialName={folder.name}
        onRename={handleRename}
      />
    </>
  );
}
