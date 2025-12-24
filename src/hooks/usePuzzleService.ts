import { useEffect, useMemo } from "react";
import { PuzzleService } from "../utils";

export function usePuzzleService(): PuzzleService {
  const puzzleService = useMemo(() => {
    return new PuzzleService();
  }, []);
  useEffect(() => {
    return () => {
      puzzleService.terminate();
    };
  }, [puzzleService]);
  return puzzleService;
}
