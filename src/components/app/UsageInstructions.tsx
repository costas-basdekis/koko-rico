import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isTouchDevice as checkIsTouchDevice,
  MoveInterpreter,
  RingMoveInterpreter,
} from "../../utils";
import {
  ButtonRow,
  ControlButton,
  DrawSettings,
  NextPositionArrowUp,
  Spinner,
} from "..";
import { Direction } from "../../game";
import _ from "underscore";

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
  onRedoRobotMove?: () => void;
  onNewPuzzle?: () => void;
  askForNewPuzzleConfirmation?: boolean;
  onShowSettings?: () => void;
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
  onRedoRobotMove,
  onNewPuzzle,
  askForNewPuzzleConfirmation = true,
  onShowSettings,
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
      <ButtonRow>
        <ControlButton disabled={!onRobotMove} onClick={onLeftClick}>
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
        </ControlButton>
        <ControlButton disabled={!onRobotMove} onClick={onRightClick}>
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
        </ControlButton>
        <ControlButton disabled={!onRobotMove} onClick={onUpClick}>
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
        </ControlButton>
        <ControlButton disabled={!onRobotMove} onClick={onDownClick}>
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
        </ControlButton>
        {isTouchDevice ? (
          <>
            <button
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
      </ButtonRow>
      <ButtonRow>
        <ControlButton
          disabled={!onSelectedRobotIndexChange}
          onClick={onNextRobotClick}
        >
          <span className={"button-hotkey"}>B</span>
          <br />
          {isTouchDevice ? "Next" : "Next robot"}
        </ControlButton>
        <ControlButton
          disabled={!onSelectedRobotIndexChange}
          onClick={onPreviousRobotClick}
        >
          <span className={"button-hotkey"}>⇧+B</span>
          <br />
          {isTouchDevice ? "Previous" : "Previous robot"}
        </ControlButton>
        <ControlButton disabled={!onRobotReset} onClick={onRobotReset}>
          <span className={"button-hotkey"}>T</span>
          <br />
          {isTouchDevice ? "Reset" : "Reset robots"}
        </ControlButton>
        <ControlButton disabled={!onUndoRobotMove} onClick={onUndoRobotMove}>
          <span className={"button-hotkey"}>U</span>
          <br />
          Undo
        </ControlButton>
        <ControlButton disabled={!onRedoRobotMove} onClick={onRedoRobotMove}>
          <span className={"button-hotkey"}>R</span>
          <br />
          Redo
        </ControlButton>
        <ControlButton disabled={!onNewPuzzle} onClick={innerOnNewPuzzle}>
          {gameLoading ? (
            <Spinner />
          ) : (
            <span className={"button-hotkey"}>N</span>
          )}
          <br />
          {isTouchDevice ? "New" : "New Puzzle"}
        </ControlButton>
        {onShowSettings ? (
          <ControlButton onClick={onShowSettings}>
            <span className={"button-hotkey"}>S</span>
            <br />
            Settings
          </ControlButton>
        ) : null}
      </ButtonRow>
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
