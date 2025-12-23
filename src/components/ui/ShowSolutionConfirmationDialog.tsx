import { useCallback, useEffect, useRef } from "react";

export interface ShowSolutionConfirmationDialogProps {
  open?: boolean;
  hasSolution?: boolean;
  findingSolution?: boolean;
  onFindSolution?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ShowSolutionConfirmationDialog({
  open,
  hasSolution = false,
  findingSolution = false,
  onFindSolution,
  onConfirm,
  onCancel,
}: ShowSolutionConfirmationDialogProps) {
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
    onCancel?.();
  }, [onCancel]);
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
      onCancel?.();
    },
    [dialogRef, onCancel],
  );
  return (
    <dialog ref={dialogRef} onClick={onDialogClick} onClose={onClose}>
      <h1>Reveal solution</h1>
      Are you sure you want to reveal the solution? This will disable this
      target
      <br />
      {hasSolution ? null : (
        <button
          onClick={onFindSolution}
          disabled={!onFindSolution || findingSolution}
        >
          {findingSolution ? "Finding solution..." : "Find solution first"}
        </button>
      )}
      <br />
      <button autoFocus onClick={onCancel} disabled={!onCancel}>
        Cancel
      </button>
      <button onClick={onConfirm} disabled={!onConfirm || !hasSolution}>
        Confirm
      </button>
    </dialog>
  );
}
