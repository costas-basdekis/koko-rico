import { useCallback, useMemo } from "react";
import {
  isTouchDevice as checkIsTouchDevice,
  MoveInterpreter,
  RingMoveInterpreter,
} from "../../utils";
import {
  ButtonHotkey,
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
  robotCount?: number;
  onSelectedRobotIndexChange?: (index: number) => void;
  onRobotMove?: (direction: Direction) => void;
  onRobotReset?: () => void;
  onUndoRobotMove?: () => void;
  undoRobotIndex?: number;
  onRedoRobotMove?: () => void;
  redoRobotIndex?: number;
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
  robotCount,
  onSelectedRobotIndexChange,
  onRobotMove,
  onRobotReset,
  onUndoRobotMove,
  undoRobotIndex,
  onRedoRobotMove,
  redoRobotIndex,
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
          <ButtonHotkey
            robotIndex={
              robotCount !== undefined && selectedRobotIndex !== undefined
                ? (selectedRobotIndex - 1 + robotCount) % robotCount
                : undefined
            }
          >
            B
          </ButtonHotkey>
          <br />
          {isTouchDevice ? "Next" : "Next robot"}
        </ControlButton>
        <ControlButton
          disabled={!onSelectedRobotIndexChange}
          onClick={onPreviousRobotClick}
        >
          <ButtonHotkey
            robotIndex={
              robotCount !== undefined && selectedRobotIndex !== undefined
                ? (selectedRobotIndex + 1) % robotCount
                : undefined
            }
          >
            ⇧+B
          </ButtonHotkey>
          <br />
          {isTouchDevice ? "Previous" : "Previous robot"}
        </ControlButton>
        <ControlButton disabled={!onRobotReset} onClick={onRobotReset}>
          <ButtonHotkey>T</ButtonHotkey>
          <br />
          {isTouchDevice ? "Reset" : "Reset robots"}
        </ControlButton>
        <ControlButton disabled={!onUndoRobotMove} onClick={onUndoRobotMove}>
          <ButtonHotkey robotIndex={undoRobotIndex}>U</ButtonHotkey>
          <br />
          Undo
        </ControlButton>
        <ControlButton disabled={!onRedoRobotMove} onClick={onRedoRobotMove}>
          <ButtonHotkey robotIndex={redoRobotIndex}>R</ButtonHotkey>
          <br />
          Redo
        </ControlButton>
        <ControlButton disabled={!onNewPuzzle} onClick={innerOnNewPuzzle}>
          {gameLoading ? <Spinner /> : <ButtonHotkey>N</ButtonHotkey>}
          <br />
          {isTouchDevice ? "New" : "New Puzzle"}
        </ControlButton>
        {onShowSettings ? (
          <ControlButton onClick={onShowSettings}>
            <ButtonHotkey>S</ButtonHotkey>
            <br />
            Settings
          </ControlButton>
        ) : null}
      </ButtonRow>
    </>
  );
}
