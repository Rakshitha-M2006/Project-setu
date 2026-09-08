import { useEffect, useRef, useCallback, useState } from "react";

export interface UseTrackingPollingOptions {
  /**
   * Polling interval in milliseconds. Defaults to 5000ms (5 seconds).
   */
  intervalMs?: number;
  /**
   * Whether polling is active. Defaults to true.
   */
  enabled?: boolean;
  /**
   * Automatically pause polling when the browser tab is hidden/inactive. Defaults to true.
   */
  pauseOnHidden?: boolean;
}

export interface UseTrackingPollingResult {
  /**
   * Timestamp of the most recent successful poll update.
   */
  lastUpdated: Date | null;
  /**
   * Manual trigger function to refresh immediately.
   */
  refreshNow: () => Promise<void>;
  /**
   * Whether a network request is currently in-flight.
   */
  isRefreshing: boolean;
}

/**
 * useTrackingPolling
 * 
 * Automatically polls grievance/application tracking data every `intervalMs` (default: 5000ms / 5s):
 * - Runs immediate initial fetch upon mounting.
 * - Prevents duplicate or overlapping concurrent network requests if latency exceeds interval.
 * - Pauses polling when the browser tab is hidden (Page Visibility API) to conserve system & network resources.
 * - Resumes immediately with a fresh fetch when the tab is focused again.
 * - Supports silent background updates without resetting user scroll, form state, or UI focus.
 * - Properly cleans up setInterval timers and listeners on component unmount.
 * - Never triggers full-page reloads.
 */
export function useTrackingPolling(
  callback: (isSilent: boolean) => Promise<void> | void,
  options: UseTrackingPollingOptions = {}
): UseTrackingPollingResult {
  const { intervalMs = 5000, enabled = true, pauseOnHidden = true } = options;

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const isFetchingRef = useRef<boolean>(false);
  const callbackRef = useRef(callback);

  // Keep callback reference updated without re-triggering effect
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Safe fetch executor with overlap protection
  const executePoll = useCallback(
    async (isSilent: boolean) => {
      // Prevent overlapping requests if previous poll is still in flight
      if (isFetchingRef.current) {
        return;
      }

      // Pause if tab is currently hidden
      if (pauseOnHidden && typeof document !== "undefined" && document.hidden) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsRefreshing(true);
        await callbackRef.current(isSilent);
        setLastUpdated(new Date());
      } catch {
        // Individual background poll errors handled silently to avoid disrupting user session
      } finally {
        isFetchingRef.current = false;
        setIsRefreshing(false);
      }
    },
    [pauseOnHidden]
  );

  const refreshNow = useCallback(async () => {
    await executePoll(false);
  }, [executePoll]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;
    let timerId: ReturnType<typeof setInterval> | null = null;

    // 1. Initial immediate fetch on mount
    executePoll(false);

    // 2. Setup recurring interval every 5 seconds
    timerId = setInterval(() => {
      if (isMounted) {
        executePoll(true);
      }
    }, intervalMs);

    // 3. Tab Visibility listener: immediately update when citizen returns to the tab
    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (!document.hidden && isMounted) {
        executePoll(true);
      }
    };

    if (pauseOnHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // 4. Proper cleanup on unmount to prevent memory leaks and duplicate intervals
    return () => {
      isMounted = false;
      if (timerId) {
        clearInterval(timerId);
      }
      if (pauseOnHidden && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [intervalMs, enabled, pauseOnHidden, executePoll]);

  return {
    lastUpdated,
    refreshNow,
    isRefreshing,
  };
}

export default useTrackingPolling;
