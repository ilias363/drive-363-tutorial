import { SquareMousePointer } from "lucide-react";
import { Button } from "./ui/button";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";
import { deleteFiles, deleteFolders } from "~/server/actions";

export function EditSelectedButton(props: {
  setSelectedFolders: Dispatch<SetStateAction<number[]>>;
  setSelectedFiles: Dispatch<SetStateAction<number[]>>;
  selectedFoldersIds: number[];
  selectedFilesIds: number[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteSelectedItems = async () => {
    setIsDialogOpen(false);
    const toastId = `key-${Math.random()}`;
    toast.loading("Deleting selected files and folders", {
      id: toastId,
    });
    try {
      await Promise.all([
        deleteFolders(props.selectedFoldersIds),
        deleteFiles(props.selectedFilesIds),
      ]);
      toast.dismiss(toastId);
      toast.success(
        (props.selectedFoldersIds.length !== 0
          ? `${props.selectedFoldersIds.length} folder${props.selectedFoldersIds.length === 1 ? "" : "s"}`
          : "") +
          (props.selectedFoldersIds.length * props.selectedFilesIds.length !== 0
            ? " and "
            : "") +
          (props.selectedFilesIds.length !== 0
            ? `${props.selectedFilesIds.length} file${props.selectedFilesIds.length === 1 ? "" : "s"}`
            : "") +
          " deleted successfully",
      );
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Delete error", {
        description: e instanceof Error ? e.message : "An error occured",
      });
    } finally {
      props.setSelectedFolders([]);
      props.setSelectedFiles([]);
    }
  };

  const moveSelectedItems = () => {
    console.log("Move selected folders : ", props.selectedFoldersIds);
    console.log("Move selected files : ", props.selectedFilesIds);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        className="text-md flex w-full flex-row items-center justify-start gap-2 bg-slate-300 px-2 py-5 font-medium hover:bg-slate-300/85"
        onClick={() => setIsDialogOpen(true)}
        disabled={
          props.selectedFoldersIds.length + props.selectedFilesIds.length === 0
        }
      >
        <SquareMousePointer className="h-5 w-5" />
        {"Edit Selected"}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose an action</DialogTitle>
            <DialogDescription>
              What would you like to do with the selected items?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                console.log(props.selectedFilesIds, props.selectedFoldersIds);
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="destructive" onClick={deleteSelectedItems}>
                Delete
              </Button>
              <Button onClick={moveSelectedItems}>Move</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
