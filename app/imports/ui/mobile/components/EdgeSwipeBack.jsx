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
    const MIN_SWIPE_DISTANCE = 100; // Minimum distance to trigger back
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
        const newBlobState = {
          visible: true,
          x: startX,
          y: startY,
          progress: 0
        };
        setBlobState(newBlobState);
        console.log('[EdgeSwipeBack] 🔵 Blob shown:', newBlobState);

        // Add visual feedback
        document.body.style.userSelect = 'none';

        console.log('[EdgeSwipeBack] 👆 Edge swipe started at:', { x: startX, y: startY });
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
        setBlobState(prev => ({ ...prev, visible: false }));
        document.body.style.userSelect = '';
        console.log('[EdgeSwipeBack] ❌ Cancelled due to vertical drift');
        return;
      }

      // Cancel if swiping backwards (left)
      if (deltaX < 0) {
        isSwipingRef.current = false;
        setBlobState(prev => ({ ...prev, visible: false }));
        document.body.style.userSelect = '';
        console.log('[EdgeSwipeBack] ❌ Cancelled due to wrong direction');
        return;
      }

      // Update blob position and progress
      const progress = Math.min(deltaX / MIN_SWIPE_DISTANCE, 1);
      const newBlobState = {
        visible: true,
        x: currentX,
        y: currentY,
        progress: progress
      };
      setBlobState(newBlobState);

      // Debug log every 50px of movement
      if (Math.floor(deltaX / 50) !== Math.floor((deltaX - 10) / 50)) {
        console.log('[EdgeSwipeBack] 🔵 Blob updated:', newBlobState);
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

      // Check if this qualifies as a back gesture
      const isValidSwipe =
        deltaX >= MIN_SWIPE_DISTANCE &&
        deltaY <= MAX_VERTICAL_DRIFT &&
        swipeTime <= MAX_SWIPE_TIME;

      if (isValidSwipe) {
        console.log('[EdgeSwipeBack] ✅ Valid back gesture detected:', {
          distance: deltaX,
          time: swipeTime,
          vertical: deltaY
        });

        // Show completion animation before hiding
        setBlobState(prev => ({ ...prev, progress: 1 }));

        // Hide blob after brief delay and navigate
        setTimeout(() => {
          setBlobState(prev => ({ ...prev, visible: false }));

          // Trigger back navigation
          if (history.length > 1) {
            history.goBack();
            console.log('[EdgeSwipeBack] 🔙 Navigated back');
          } else {
            console.log('[EdgeSwipeBack] ℹ️ No history to go back to');
          }
        }, 150);

      } else {
        // Hide blob immediately for invalid swipe
        setBlobState(prev => ({ ...prev, visible: false }));

        console.log('[EdgeSwipeBack] ❌ Invalid swipe:', {
          distance: deltaX,
          time: swipeTime,
          vertical: deltaY,
          minDistance: MIN_SWIPE_DISTANCE,
          maxTime: MAX_SWIPE_TIME,
          maxVertical: MAX_VERTICAL_DRIFT
        });
      }
    };

    const handleTouchCancel = () => {
      isSwipingRef.current = false;
      setBlobState(prev => ({ ...prev, visible: false }));
      document.body.style.userSelect = '';
      console.log('[EdgeSwipeBack] 🚫 Touch cancelled');
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
    <EdgeSwipeBackContainer
      ref={containerRef}
      disabled={disabled}
    >
      <SwipeBlob
        visible={blobState.visible}
        x={blobState.x}
        y={blobState.y}
        progress={blobState.progress}
      />
    </EdgeSwipeBackContainer>
  );
};

export default withRouter(EdgeSwipeBack);
