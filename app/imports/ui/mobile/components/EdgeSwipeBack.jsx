import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { EdgeSwipeBackContainer, SwipeBlob } from '../styles/EdgeSwipeBack';

const EdgeSwipeBack = ({ history, disabled = false }) => {
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isSwipingRef = useRef(false);

  // State for visual blob indicator
  const [blobState, setBlobState] = useState({
    visible: false,
    x: 0,
    y: 0,
    progress: 0 // 0-1 representing swipe progress
  });

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Configuration
    const EDGE_THRESHOLD = 20; // Pixels from edge to start gesture
    const MIN_SWIPE_DISTANCE = 30; // Minimum distance for valid swipe
    const MAX_SWIPE_DISTANCE = 100; // Maximum distance for valid swipe
    const MAX_SWIPE_TIME = 500; // Maximum time for gesture (ms)
    const MAX_VERTICAL_DRIFT = 100; // Maximum vertical movement allowed

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      // Only start gesture if touch begins near left edge
      if (startX <= EDGE_THRESHOLD) {
        touchStartRef.current = {
          x: startX,
          y: startY,
          time: Date.now()
        };
        isSwipingRef.current = true;

        // Show blob at starting position
        setBlobState({
          visible: true,
          x: startX,
          y: startY,
          progress: 0
        });

        // Add visual feedback
        document.body.style.userSelect = 'none';

        // Edge swipe gesture started
      }
    };

    const handleTouchMove = (e) => {
      if (!isSwipingRef.current) return;

      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;

      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);

      // Cancel if too much vertical movement
      if (deltaY > MAX_VERTICAL_DRIFT) {
        isSwipingRef.current = false;
        setBlobState({ visible: false, x: 0, y: 0, progress: 0 });
        document.body.style.userSelect = '';
        return;
      }

      // Cancel if swiping backwards (left)
      if (deltaX < 0) {
        isSwipingRef.current = false;
        setBlobState({ visible: false, x: 0, y: 0, progress: 0 });
        document.body.style.userSelect = '';
        return;
      }

      // Update blob based on distance ranges
      if (deltaX <= 100) {
        // 1-100px: Keep blob displayed
        const progress = Math.min(deltaX / 100, 1);
        setBlobState({
          visible: true,
          x: currentX,
          y: currentY,
          progress: progress
        });
      } else {
        // Over 100px: Remove blob and stop everything
        isSwipingRef.current = false;
        setBlobState({ visible: false, x: 0, y: 0, progress: 0 });
        document.body.style.userSelect = '';
        return;
      }

      // Only prevent default for horizontal swipes to preserve app responsiveness
      if (deltaX > 30 && deltaY < 20) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isSwipingRef.current) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;
      const startTime = touchStartRef.current.time;

      const deltaX = endX - startX;
      const deltaY = Math.abs(endY - startY);
      const swipeTime = Date.now() - startTime;

      // Reset state
      isSwipingRef.current = false;
      document.body.style.userSelect = '';

      // Check if this qualifies as a back gesture (30-100px range, under 500ms)
      const isValidSwipe =
        deltaX >= 30 &&
        deltaX <= 100 &&
        deltaY <= MAX_VERTICAL_DRIFT &&
        swipeTime <= MAX_SWIPE_TIME;

      if (isValidSwipe) {
        // Remove blob and navigate back
        setBlobState({ visible: false, x: 0, y: 0, progress: 0 });

        // Trigger back navigation
        if (history.length > 1) {
          history.goBack();
        }
      } else {
        // Invalid swipe - just hide blob, do nothing
        setBlobState({ visible: false, x: 0, y: 0, progress: 0 });
      }
    };

    const handleTouchCancel = () => {
      isSwipingRef.current = false;
      setBlobState({ visible: false, x: 0, y: 0, progress: 0 });
      document.body.style.userSelect = '';
    };

    // Add event listeners to document to avoid blocking app interactions
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      document.body.style.userSelect = '';
    };
  }, [history, disabled]);

  // Only render on mobile devices
  if (typeof window !== 'undefined') {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      return null;
    }
  }

  return (
    <>
      <EdgeSwipeBackContainer
        ref={containerRef}
        disabled={disabled}
      />
      <SwipeBlob
        visible={blobState.visible}
        x={blobState.x}
        y={blobState.y}
        progress={blobState.progress}
      />
    </>
  );
};

export default withRouter(EdgeSwipeBack);
