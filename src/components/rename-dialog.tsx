import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onRename: (newName: string) => Promise<void>;
}

export function RenameDialog({
  open,
  onOpenChange,
  initialName,
  onRename,
}: RenameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form
          onSubmit={() => onOpenChange(false)}
          action={async (formData) => {
            const newName = formData.get("name") as string;

            try {
              await onRename(newName);
            } catch (error) {
              toast.error("Failed to rename", {
                description:
                  error instanceof Error ? error.message : "An error occurred",
              });
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 items-center gap-4 py-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialName}
              className="col-span-3"
              maxLength={35}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Rename</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
