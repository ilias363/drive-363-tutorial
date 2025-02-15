import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import type { folders_table } from "~/server/db/schema";
import {
  getAllFoldersForCurrentUser,
  moveFoldersAndFiles,
} from "~/server/actions";
import FolderStructure from "./folder-structure";
import { toast } from "sonner";

export default function MoveDialog(props: {
  currentParentId: number;
  setIsMoveDialogOpen: (open: boolean) => void;
  setToMoveFolders?: (ids: number[]) => void;
  setToMoveFiles?: (ids: number[]) => void;
  isMoveDialogOpen: boolean;
  toMoveFoldersIds: number[];
  toMoveFilesIds: number[];
}) {
  const [selectedDest, setSelectedDest] = useState<number | null>(null);
  const [allFolders, setAllFolders] = useState<
    (typeof folders_table.$inferSelect)[]
  >([]);

  const handleCancel = () => {
    setSelectedDest(null);
    props.setIsMoveDialogOpen(false);
  };

  const handleMove = async () => {
    props.setIsMoveDialogOpen(false);

    if (props.currentParentId === selectedDest || !selectedDest) {
      setSelectedDest(null);
      return;
    }

    const toastId = `key-${Math.random()}`;
    try {
      toast.loading("Moving data...", {
        id: toastId,
      });

      await moveFoldersAndFiles(
        selectedDest,
        props.toMoveFoldersIds,
        props.toMoveFilesIds,
      );

      toast.dismiss(toastId);
      toast.success("Data moved succesfully!");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Error moving data", {
        description: e instanceof Error ? e.message : "An error occured",
      });
    }

    if (props.setToMoveFolders) props.setToMoveFolders([]);
    if (props.setToMoveFiles) props.setToMoveFiles([]);

    setSelectedDest(null);
  };

  useEffect(() => {
    const fetchFolders = async () => {
      const allFoldersForUser = await getAllFoldersForCurrentUser();
      setAllFolders(allFoldersForUser);
    };

    fetchFolders().catch((error) => {
      console.error("Failed to fetch folders:", error);
    });
  }, []);

  return (
    <Dialog
      open={props.isMoveDialogOpen}
      onOpenChange={props.setIsMoveDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <FolderStructure
            allFolders={allFolders}
            parentFolders={allFolders.filter(
              (folder) => folder.parent === null,
            )}
            toMoveFoldersIds={props.toMoveFoldersIds}
            setSelectedDest={setSelectedDest}
            selectedDest={selectedDest}
          />
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedDest}>
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
