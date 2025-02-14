import { FolderPlus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createFolder } from "~/server/actions";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateFolderButton(props: {
  parent: number;
  userId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-md flex w-full flex-row items-center justify-start gap-2 bg-slate-300 px-2 py-5 font-medium hover:bg-slate-300/85">
          <FolderPlus className="h-5 w-5" />
          {" Create Folder"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form
          onSubmit={() => setOpen(false)}
          action={async (formData) => {
            const folderName = formData.get("folderName") as string;
            const toastId = `create-folder-${folderName}`;

            try {
              toast.loading(`Creating folder "${folderName}"...`, {
                id: toastId,
              });
              await createFolder({ formData, ...props });
              toast.dismiss(toastId);
              toast.success(`Folder "${folderName}" created successfully`);
            } catch (error) {
              toast.dismiss(toastId);
              toast.error(`Failed to create folder "${folderName}"`, {
                description:
                  error instanceof Error ? error.message : "An error occurred",
              });
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 items-center gap-4 py-4">
            <Label htmlFor="name" className="text-right">
              Folder name
            </Label>
            <Input
              id="name"
              name="folderName"
              placeholder="Enter folder name"
              className="col-span-3"
              maxLength={35}
              required
            />
          </div>
          <DialogFooter>
            <p className="col-span-4 text-sm text-gray-500">
              {
                "Note: You can create nested folders by using slashes (e.g., 'folder 1/folder 2')."
              }
            </p>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
