import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isTouchDevice as checkIsTouchDevice,
  MoveInterpreter,
  RingMoveInterpreter,
} from "./utils";
import { DrawSettings, NextPositionArrowUp, Spinner } from "./components";
import { Direction } from "./game";

export interface UsageInstructionsProps {
  showMoveInterpreter?: boolean;
  gameLoading?: boolean;
  onChangeShowMoveInterpreter?: (showMoveInterpreter: boolean) => void;
  moveInterpreter?: MoveInterpreter;
  selectedRobotIndex?: number;
  onSelectedRobotIndexChange?: (index: number) => void;
  onRobotMove?: (direction: Direction) => void;
  onRobotReset?: () => void;
  onUndoRobotMove?: () => void;
  onNewPuzzle?: () => void;
  askForNewPuzzleConfirmation?: boolean;
}

export function UsageInstructions({
  showMoveInterpreter = true,
  gameLoading = false,
  onChangeShowMoveInterpreter,
  moveInterpreter = new RingMoveInterpreter(),
  selectedRobotIndex,
  onSelectedRobotIndexChange,
  onRobotMove,
  onRobotReset,
  onUndoRobotMove,
  onNewPuzzle,
  askForNewPuzzleConfirmation = true,
}: UsageInstructionsProps) {
  const isTouchDevice = useMemo(() => {
    return checkIsTouchDevice();
  }, []);
  const toggleShowMoveInterpreter = useCallback(() => {
    onChangeShowMoveInterpreter?.(!showMoveInterpreter);
  }, [showMoveInterpreter, onChangeShowMoveInterpreter]);
  const onNextRobotClick = useCallback(() => {
    if (selectedRobotIndex === undefined) {
      return;
    }
    onSelectedRobotIndexChange?.(selectedRobotIndex + 1);
  }, [onSelectedRobotIndexChange, selectedRobotIndex]);
  const onPreviousRobotClick = useCallback(() => {
    if (selectedRobotIndex === undefined) {
      return;
    }
    onSelectedRobotIndexChange?.(selectedRobotIndex - 1);
  }, [onSelectedRobotIndexChange, selectedRobotIndex]);
  useEffect(() => {
    const savedShowMoveInterpreter = getSavedShowMoveInterpreter();
    if (savedShowMoveInterpreter !== showMoveInterpreter) {
      onChangeShowMoveInterpreter?.(savedShowMoveInterpreter);
    }
  }, []);
  const drawSettings = DrawSettings.use();
  const buttonSize = 50;
  const buttonPosition = useMemo(
    () => ({ x: buttonSize / 2, y: buttonSize / 2 }),
    [buttonSize],
  );
  const moveInterpreterProps = useMemo(
    () => ({
      start: { x: buttonSize / 2, y: buttonSize / 2 },
      stroke: showMoveInterpreter
        ? selectedRobotIndex !== undefined
          ? drawSettings.robotColours[selectedRobotIndex]
          : undefined
        : "grey",
    }),
    [buttonSize, showMoveInterpreter, drawSettings, selectedRobotIndex],
  );
  const adjustedMoveInterpreter = useMemo(
    () => moveInterpreter.fitIn(buttonSize),
    [moveInterpreter, buttonSize],
  );
  const onLeftClick = useCallback(
    () => onRobotMove?.(Direction.Left),
    [onRobotMove],
  );
  const onRightClick = useCallback(
    () => onRobotMove?.(Direction.Right),
    [onRobotMove],
  );
  const onUpClick = useCallback(
    () => onRobotMove?.(Direction.Up),
    [onRobotMove],
  );
  const onDownClick = useCallback(
    () => onRobotMove?.(Direction.Down),
    [onRobotMove],
  );
  const innerOnNewPuzzle = useCallback(() => {
    if (
      !gameLoading &&
      askForNewPuzzleConfirmation &&
      !confirm("Are you sure you want to create a new puzzle?")
    ) {
      return;
    }
    onNewPuzzle?.();
  }, [onNewPuzzle, askForNewPuzzleConfirmation]);
  return (
    <>
      <div className={"button-row"}>
        <button
          className={"control-button"}
          disabled={!onRobotMove}
          onClick={onLeftClick}
        >
          <svg width={buttonSize} height={buttonSize}>
            <NextPositionArrowUp
              size={buttonSize}
              direction={Direction.Left}
              position={buttonPosition}
              robotIndex={selectedRobotIndex}
            />
          </svg>
          <br />
          {isTouchDevice ? "Drag " : ""}Left
        </button>
        <button
          className={"control-button"}
          disabled={!onRobotMove}
          onClick={onRightClick}
        >
          <svg width={buttonSize} height={buttonSize}>
            <NextPositionArrowUp
              size={buttonSize}
              direction={Direction.Right}
              position={buttonPosition}
              robotIndex={selectedRobotIndex}
            />
          </svg>
          <br />
          {isTouchDevice ? "Drag " : ""}Right
        </button>
        <button
          className={"control-button"}
          disabled={!onRobotMove}
          onClick={onUpClick}
        >
          <svg width={buttonSize} height={buttonSize}>
            <NextPositionArrowUp
              size={buttonSize}
              direction={Direction.Up}
              position={buttonPosition}
              robotIndex={selectedRobotIndex}
            />
          </svg>
          <br />
          {isTouchDevice ? "Drag " : ""}Up
        </button>
        <button
          className={"control-button"}
          disabled={!onRobotMove}
          onClick={onDownClick}
        >
          <svg width={buttonSize} height={buttonSize}>
            <NextPositionArrowUp
              size={buttonSize}
              direction={Direction.Down}
              position={buttonPosition}
              robotIndex={selectedRobotIndex}
            />
          </svg>
          <br />
          {isTouchDevice ? "Drag " : ""}Down
        </button>
        {isTouchDevice ? (
          <>
            <button
              className={"control-button"}
              disabled={!onChangeShowMoveInterpreter}
              onClick={toggleShowMoveInterpreter}
            >
              <svg width={buttonSize} height={buttonSize}>
                <g>{adjustedMoveInterpreter.Visualise(moveInterpreterProps)}</g>
              </svg>
              <br />
              {showMoveInterpreter ? "Hide" : "Show"}
            </button>
          </>
        ) : null}
      </div>
      <div className={"button-row"}>
        <button
          className={"control-button"}
          disabled={!onSelectedRobotIndexChange}
          onClick={onNextRobotClick}
        >
          <span className={"button-hotkey"}>R</span>
          <br />
          Next robot
        </button>
        <button
          className={"control-button"}
          disabled={!onSelectedRobotIndexChange}
          onClick={onPreviousRobotClick}
        >
          <span className={"button-hotkey"}>Shift+R</span>
          <br />
          Previous robot
        </button>
        <button
          className={"control-button"}
          disabled={!onRobotReset}
          onClick={onRobotReset}
        >
          <span className={"button-hotkey"}>T</span>
          <br />
          Reset robots
        </button>
        <button
          className={"control-button"}
          disabled={!onUndoRobotMove}
          onClick={onUndoRobotMove}
        >
          <span className={"button-hotkey"}>U</span>
          <br />
          Undo
        </button>
        <button
          className={"control-button"}
          disabled={!onNewPuzzle}
          onClick={innerOnNewPuzzle}
        >
          {gameLoading ? (
            <Spinner />
          ) : (
            <span className={"button-hotkey"}>N</span>
          )}
          <br />
          New Puzzle
        </button>
      </div>
    </>
  );
}

export function getSavedShowMoveInterpreter(
  defaultValue: boolean = true,
): boolean {
  const savedShowMoveInterpreterStr = localStorage.getItem(
    "showMoveInterpreter",
  );
  if (!savedShowMoveInterpreterStr) {
    return defaultValue;
  }
  return savedShowMoveInterpreterStr === "true";
}

export function useShowMoveInterpreter() {
  return useState(getSavedShowMoveInterpreter());
}
