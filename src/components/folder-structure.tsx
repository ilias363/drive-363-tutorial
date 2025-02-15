import { useState } from "react";
import { Button } from "./ui/button";
import type { folders_table } from "~/server/db/schema";
import { ChevronRight, Folder } from "lucide-react";

export default function FolderStructure(props: {
  allFolders: (typeof folders_table.$inferSelect)[];
  parentFolders: (typeof folders_table.$inferSelect)[];
  setSelectedDest: (folderId: number) => void;
  selectedDest: number | null;
  toMoveFoldersIds: number[];
  level?: number;
}) {
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId],
    );
  };

  return (
    <div className="space-y-1">
      {props.parentFolders.map((folder) => {
        const children = props.allFolders.filter(
          (childFolder) => childFolder.parent === folder.id,
        );

        return (
          <div key={folder.id} className="mt-1">
            <Button
              variant="ghost"
              className={`w-full justify-start ${props.selectedDest === folder.id ? "bg-secondary" : ""} ${props.toMoveFoldersIds.includes(folder.id) ? "cursor-not-allowed opacity-50" : ""}`}
              style={{ paddingLeft: `${(props.level ?? 0) * 16 + 12}px` }}
              onClick={() => {
                if (
                  !props.toMoveFoldersIds.includes(folder.id) &&
                  props.selectedDest !== folder.id
                ) {
                  props.setSelectedDest(folder.id);
                }
                if (children && children.length > 0) {
                  toggleFolder(folder.id);
                }
              }}
              disabled={props.toMoveFoldersIds.includes(folder.id)}
            >
              <Folder className="mr-1 h-4 w-4" />
              {folder.name}
              {children && children.length > 0 && (
                <ChevronRight
                  className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                    expandedFolders.includes(folder.id) ? "rotate-90" : ""
                  }`}
                />
              )}
            </Button>
            {children &&
              children.length > 0 &&
              expandedFolders.includes(folder.id) && (
                <FolderStructure
                  allFolders={props.allFolders}
                  parentFolders={children}
                  setSelectedDest={props.setSelectedDest}
                  selectedDest={props.selectedDest}
                  toMoveFoldersIds={props.toMoveFoldersIds}
                  level={(props.level ?? 0) + 1}
                />
              )}
          </div>
        );
      })}
    </div>
  );
}
