import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { Button } from "./ui/button";

export default function DeleteConfirmationDialog(props: {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onDelete: () => void;
}) {
  const handleDelete = () => {
    props.setIsDeleteDialogOpen(false);
    props.onDelete();
  };
  return (
    <Dialog
      open={props.isDeleteDialogOpen}
      onOpenChange={props.setIsDeleteDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Confirmation</DialogTitle>
        </DialogHeader>
        <DialogDescription>Are you sure you want to delete?</DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
