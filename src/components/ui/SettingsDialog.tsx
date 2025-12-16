import "./SettingsDialog.css";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SettingsDialogProps {
  open?: boolean;
  onSetOpen?: (open: boolean) => void;
  children?: any;
}

export function SettingsDialog({
  open,
  onSetOpen,
  children,
}: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!dialogRef.current) {
      return;
    }
    if (open) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [open, dialogRef.current]);
  const onClose = useCallback(() => {
    onSetOpen?.(false);
  }, [onSetOpen]);
  const onDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const $dialog = dialogRef.current;
      if (!$dialog) {
        return;
      }
      if ($dialog.tagName !== "DIALOG") {
        //This prevents issues with forms
        return;
      }

      const rect = $dialog.getBoundingClientRect();

      if (
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width &&
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height
      ) {
        e.stopPropagation();
        return;
      }
      onSetOpen?.(false);
    },
    [dialogRef, onSetOpen],
  );
  return (
    <dialog ref={dialogRef} onClick={onDialogClick} onClose={onClose}>
      <h2>Settings</h2>
      {children}
      <br />
      <button autoFocus onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}

export type ShowSettingsDialog = (() => void) | undefined;
export type SetShowSettingsDialog = React.Dispatch<
  React.SetStateAction<ShowSettingsDialog>
>;

export function useShowSettingsDialog(): [
  ShowSettingsDialog,
  SetShowSettingsDialog,
] {
  return useState<ShowSettingsDialog | undefined>(undefined);
}

export function useSettingsDialog(
  setShowSettingsDialog: SetShowSettingsDialog,
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [dialogOpen, setDialogOpen] = useState(false);
  const onDialogOpen = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);
  useEffect(() => {
    setShowSettingsDialog?.(() => {
      return onDialogOpen;
    });
    return () => {
      setShowSettingsDialog?.(undefined);
    };
  }, [setShowSettingsDialog, onDialogOpen]);
  return [dialogOpen, setDialogOpen];
}
