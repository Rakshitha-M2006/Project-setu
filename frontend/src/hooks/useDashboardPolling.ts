import { useEffect, useRef, useCallback, useState } from "react";

export interface UseDashboardPollingOptions {
  /**
   * Polling interval in milliseconds. Defaults to 2000ms (2 seconds).
   */
  intervalMs?: number;
  /**
   * Whether polling is enabled. Defaults to true.
   */
  enabled?: boolean;
  /**
   * Pause polling when the browser tab is hidden/inactive. Defaults to true.
   */
  pauseOnHidden?: boolean;
}

export interface UseDashboardPollingResult {
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
 * useDashboardPolling
 * 
 * Automatically polls dashboard data every `intervalMs` (default: 2000ms / 2s):
 * - Runs immediate initial fetch upon mounting without waiting 2s.
 * - Prevents duplicate/overlapping concurrent requests when server latency exceeds interval.
 * - Pauses polling when the browser tab is inactive (Page Visibility API) to conserve resources.
 * - Resumes immediately when the tab is focused again.
 * - Properly cleans up setInterval timers and listeners on component unmount.
 * - Zero full-page reloads.
 */
export function useDashboardPolling(
  callback: (isSilent: boolean) => Promise<void> | void,
  options: UseDashboardPollingOptions = {}
): UseDashboardPollingResult {
  const { intervalMs = 2000, enabled = true, pauseOnHidden = true } = options;

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const isFetchingRef = useRef<boolean>(false);
  const callbackRef = useRef(callback);

  // Keep callback reference updated without re-triggering the effect
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

      // Check if page/tab is currently hidden
      if (pauseOnHidden && typeof document !== "undefined" && document.hidden) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsRefreshing(true);
        await callbackRef.current(isSilent);
        setLastUpdated(new Date());
      } catch {
        // Individual poll errors handled silently without disrupting the dashboard
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

    // 2. Setup recurring interval every 2 seconds
    timerId = setInterval(() => {
      if (isMounted) {
        executePoll(true);
      }
    }, intervalMs);

    // 3. Tab Visibility listener
    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (!document.hidden && isMounted) {
        // Tab became visible again: immediately fetch latest metrics
        executePoll(true);
      }
    };

    if (pauseOnHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // 4. Proper cleanup on unmount to prevent memory leaks and zombie intervals
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

export default useDashboardPolling;
