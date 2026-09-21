import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const detectedRef = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Browsers only expose camera access on a secure origin (https:// or
    // localhost). On plain HTTP, navigator.mediaDevices doesn't exist at
    // all — most noticeably on iOS Safari — so check for that up front
    // instead of letting it fail with an opaque error.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera access requires a secure connection (HTTPS). This page is loaded over plain HTTP, so scanning isn't available here — see the README for adding HTTPS to your self-hosted server."
      );
      return;
    }

    const reader = new BrowserMultiFormatReader();

    const handleResult = (result) => {
      if (result && !cancelled && !detectedRef.current) {
        detectedRef.current = true;
        controlsRef.current?.stop();
        onDetect(result.getText());
      }
    };

    async function start() {
      try {
        let controls;
        try {
          // Prefer the rear camera on phones.
          controls = await reader.decodeFromConstraints(
            { audio: false, video: { facingMode: "environment" } },
            videoRef.current,
            handleResult
          );
        } catch {
          // No rear camera (e.g. a laptop webcam) — fall back to any camera.
          controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, handleResult);
        }
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      } catch (err) {
        if (!cancelled) {
          if (err.name === "NotAllowedError") {
            setError("Camera access was denied. Allow camera access to scan a barcode.");
          } else if (err.name === "NotFoundError") {
            setError("No camera was found on this device.");
          } else {
            setError(`Couldn't access the camera (${err.message || err.name || "unknown error"}).`);
          }
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onDetect]);

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="scanner-panel" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <span>Scan Barcode</span>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="scanner-video-wrap">
            <video ref={videoRef} className="scanner-video" muted playsInline autoPlay />
            <div className="scanner-target" />
          </div>
        )}
        <p className="scanner-hint">Point the camera at the barcode on the bottle.</p>
      </div>
    </div>
  );
}
