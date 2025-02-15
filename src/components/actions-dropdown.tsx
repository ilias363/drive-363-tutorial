import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  FolderIcon as FolderMove,
  Trash2,
} from "lucide-react";

interface ActionsDropdownProps {
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function ActionsDropdown({
  onRename,
  onMove,
  onDelete,
}: ActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onRename()}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMove()}>
          <FolderMove className="mr-2 h-4 w-4" />
          <span>Move</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete()}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
