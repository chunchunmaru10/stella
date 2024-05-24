import { MouseEventHandler } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";

type Props = {
  buttonText: string;
  deleteObjectName: string;
  onConfirm: MouseEventHandler<HTMLButtonElement>;
  isLoading: boolean;
};

export default function ConfirmDeleteDialog({
  buttonText,
  deleteObjectName,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash size={20} />
          <span className="ml-2 hidden md:block">{buttonText}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Delete?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {deleteObjectName}? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
