import React, { useState, useEffect, useRef } from "react";
import {
  ModalOverlay,
  ModalContent,
  ModalBody,
  AppLogo,
  AppName,
  InstallButton,
  SkipButton,
  IOSInstructions,
  ShareIcon,
} from "../styles/PWAInstallPrompt";
import { usePWAInstall } from "../hooks/usePWAInstall";

/**
 * PWA Install Prompt Component
 * Converted from pwa-install-prompt library to React
 * Provides cross-platform PWA installation guidance
 */

const PWAInstallPrompt = () => {
  const {
    isVisible,
    isIOS,
    isMobile,
    isRunningAsPWA,
    hideInstallPrompt,
  } = usePWAInstall();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [setIsInstallable] = useState(false);
  const [buttonText, setButtonText] = useState("Loading app info...");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [appInfo, setAppInfo] = useState({ name: "", logo: "" });
  const modalRef = useRef(null);

  /**
   * Get favicon URL for app logo
   */
  const getFaviconHref = () => {
    const linkElements = document.getElementsByTagName("link");
    for (let i = 0; i < linkElements.length; i++) {
      if (linkElements[i].getAttribute("rel") === "icon") {
        return linkElements[i].getAttribute("href");
      }
    }
    return "/icon-192x192.png"; // Fallback to PWA icon
  };

  /**
   * Initialize app info (name and logo)
   */
  useEffect(() => {
    setAppInfo({
      name: document.title || "CarpSchool",
      logo: getFaviconHref(),
    });
  }, []);

  /**
   * Handle beforeinstallprompt event
   */
  useEffect(() => {
    if (!isMobile || isIOS || isRunningAsPWA) {
      return; // Only Android supports beforeinstallprompt
    }

    let beforeInstallPromptFired = false;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setButtonText("Install as an app");
      setButtonDisabled(false);
      beforeInstallPromptFired = true;
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App was installed");
      setDeferredPrompt(null);
      setIsInstallable(false);
      onClose();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Give browser time to fire beforeinstallprompt
    const timeout = setTimeout(() => {
      if (!beforeInstallPromptFired) {
        setButtonText("The app is already installed or your environment doesn't support installation.");
        setButtonDisabled(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timeout);
    };
  }, [isMobile, isIOS, isRunningAsPWA, hideInstallPrompt]);

  /**
   * Handle install button click
   */
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
        hideInstallPrompt();
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("[PWA] Install prompt error:", error);
    }
  };

  /**
   * Handle modal background click
   */
  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      hideInstallPrompt();
    }
  };

  /**
   * Prevent modal close when clicking inside content
   */
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Don't render if running as PWA, but allow hash to override mobile/shown restrictions
  if (isRunningAsPWA) {
    return null;
  }

  // If not visible (which includes hash and mobile checks), don't render
  if (!isVisible) {
    return null;
  }

  return (
    <ModalOverlay
      ref={modalRef}
      $isVisible={isVisible}
      onClick={handleOverlayClick}
    >
      <ModalContent onClick={handleContentClick}>
        <ModalBody>
          <h1>{isIOS ? "iOS App Installation Method" : "Install as PWA?"}</h1>
          <AppLogo src={appInfo.logo} alt="App logo" />
          <AppName>{appInfo.name}</AppName>
        </ModalBody>

        {isIOS ? (
          <IOSInstructions>
            <ol>
              <li>
                Click the share icon
                <ShareIcon>
                  <svg
                    version="1.1"
                    viewBox="0 0 2048 2048"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      transform="translate(600,655)"
                      d={
                        "m0 0h301l1 2v79l-1 1-284 1-17 2-10 5-6 5-6 10-3 11v751l3 12 7 10 8 6 8 3 " +
                        "12 2h776l54-1 12-4 9-7 6-10 3-14v-744l-2-12-5-10-5-6-14-7-4-1-18-1-278-1-1-1v-81h301l18 3 " +
                        "16 5 16 8 12 8 12 10v2l3 1 9 11 9 14 8 17 4 14 2 12 1 15v744l-2 21-6 21-9 19-10 14-12 13-10 8-11 7-" +
                        "14 7-18 6-17 3-13 1h-824l-20-2-19-5-16-7-12-7-16-13-11-12-10-15-8-16-5-17-3-18-1-42v-658l1-61 " +
                        "3-18 5-16 4-9 7-13 8-11 3-4h2l2-4 13-12 16-10 15-7 18-5z"
                      }
                    />
                    <path
                      transform="translate(1023,229)"
                      d={
                        "m0 0 5 3 269 269 1 4-53 53-2 3-4-1-172-172-1 3v753l-2 3h-81l-1-2v-758l-174 174h-3l-7-8-" +
                        "48-48 1-5 10-9 162-162 5-6 7-6 5-6 7-6 5-6 7-6 5-6 7-6 5-6 7-6 5-6 7-6 5-6 8-7z"
                      }
                    />
                  </svg>
                </ShareIcon>
                in the browser address bar,
              </li>
              <li>
                <p>Click &apos;Add to Home Screen&apos;.</p>
              </li>
            </ol>
          </IOSInstructions>
        ) : (
          <InstallButton
            onClick={handleInstall}
            disabled={buttonDisabled}
          >
            {buttonText}
          </InstallButton>
        )}

        <SkipButton onClick={hideInstallPrompt}>
          I&apos;m fine, I&apos;ll just view it in my browser.
        </SkipButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PWAInstallPrompt;
