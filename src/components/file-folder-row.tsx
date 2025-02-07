import { Folder as FolderIcon, FileIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { deleteFile } from "~/server/actions";
import type { files_table, folders_table } from "~/server/db/schema";

export function FileRow(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;
  return (
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
      <td className="px-6 py-4 text-center text-gray-400">File</td>
      <td className="px-6 py-4 text-center text-gray-400">{file.size}</td>
      <td className="px-6 py-4 text-center text-gray-400">
        <Button
          variant="ghost"
          onClick={() => deleteFile(file.id)}
          aria-label="Delete file"
        >
          <Trash2Icon size={20} />
        </Button>
      </td>
    </tr>
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
}) {
  const { folder } = props;
  return (
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
      <td className="px-6 py-4 text-center text-gray-400">Folder</td>
      <td className="px-6 py-4 text-center text-gray-400">--</td>
      <td className="px-6 py-4 text-center text-gray-400">--</td>
    </tr>
  );
}
