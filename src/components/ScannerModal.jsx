import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Image, Keyboard, AlertCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function ScannerModal({ isOpen, onClose, onScanSuccess, onOpenManualInput }) {
  const [scannerError, setScannerError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrcodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Safe method to stop camera and cleanup html5Qrcode instance
  const safeStopScanner = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (html5QrcodeRef.current) {
      const instance = html5QrcodeRef.current;
      html5QrcodeRef.current = null;
      try {
        if (instance.isScanning) {
          await instance.stop().catch(() => {});
        }
        await instance.clear().catch(() => {});
      } catch (e) {
        console.warn('Instance cleanup error:', e);
      }
    }

    // Direct track stop to ensure camera light turns off on mobile browsers
    try {
      const video = document.querySelector('#interactive-barcode-reader video');
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    } catch (e) {
      console.warn('Track stop error:', e);
    }
  };

  // Safe close handler that stops camera BEFORE closing modal
  const handleSafeClose = async (onDone) => {
    await safeStopScanner();
    onClose();
    if (onDone) onDone();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    isStoppingRef.current = false;
    setIsInitializing(true);
    setScannerError(null);

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const width = Math.max(200, Math.floor(viewfinderWidth * 0.8));
        const height = Math.max(120, Math.floor(viewfinderHeight * 0.45));
        return {
          width: Math.min(width, 300),
          height: Math.min(height, 180),
        };
      },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
    };

    const elementId = 'interactive-barcode-reader';

    const timer = setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode(elementId);
        html5QrcodeRef.current = html5Qrcode;

        const onScanMatch = async (decodedText) => {
          if (!isMounted || isStoppingRef.current) return;

          // Pause video immediately so scanner stops parsing frames
          try {
            if (html5Qrcode.isScanning) {
              html5Qrcode.pause(true);
            }
          } catch (e) {}

          // Stop camera before calling success callback
          await safeStopScanner();

          if (isMounted) {
            onScanSuccess(decodedText);
          }
        };

        // Try environment camera first
        try {
          await html5Qrcode.start(
            { facingMode: 'environment' },
            config,
            onScanMatch,
            () => {}
          );
        } catch (envErr) {
          console.warn('Environment camera failed, trying fallback camera list:', envErr);
          const devices = await Html5Qrcode.getCameras().catch(() => []);
          if (devices && devices.length > 0) {
            const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];
            await html5Qrcode.start(
              backCamera.id,
              config,
              onScanMatch,
              () => {}
            );
          } else {
            throw envErr;
          }
        }

        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (err) {
        console.warn('Camera start error:', err);
        if (isMounted) {
          setIsInitializing(false);
          setScannerError('Není přístup k fotoaparátu nebo zařízení nemá aktivní kameru.');
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      safeStopScanner();
    };
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode('interactive-barcode-reader');
      }
      const result = await html5QrcodeRef.current.scanFile(file, true);
      if (result) {
        await safeStopScanner();
        onScanSuccess(result);
      }
    } catch (err) {
      alert('Čárový kód se z obrázku nepodařilo přečíst. Zkuste jiný nebo zadejte ISBN ručně.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950 text-amber-100 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-amber-950/90 border-b border-amber-800/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-bold text-base text-amber-100 font-serif">Skenování čárového kódu</span>
        </div>
        <button
          onClick={() => handleSafeClose()}
          className="p-2 text-amber-300 hover:text-white bg-amber-900/60 rounded-full transition-colors"
          aria-label="Zavřít"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewfinder / Camera Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* HTML5 QRcode Video Container */}
        <div id="interactive-barcode-reader" className="w-full h-full object-cover" />

        {/* Custom Visual Frame Overlay */}
        {!scannerError && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            {/* Dark Mask Surrounding Target Box */}
            <div className="relative w-72 h-44 border-2 border-amber-500/90 rounded-3xl shadow-[0_0_0_9999px_rgba(28,25,23,0.8)] flex items-center justify-center overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-md" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-md" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-md" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-md" />

              {/* Scanning Laser Line Animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#d97706] animate-scanline" />
            </div>

            {/* Instruction Label */}
            <p className="mt-6 text-xs font-semibold text-amber-100 bg-amber-950/90 px-4 py-2 rounded-full border border-amber-700/60 shadow-lg text-center backdrop-blur-md">
              Naměřte čárový kód na knize do rámečku
            </p>
          </div>
        )}

        {/* Initializing Spinner */}
        {isInitializing && !scannerError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/90 gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-amber-200">Spouštění fotoaparátu...</p>
          </div>
        )}

        {/* Camera Error Fallback View */}
        {scannerError && (
          <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-stone-950 text-center gap-4">
            <div className="p-4 bg-amber-900/30 text-amber-400 rounded-full border border-amber-600/40">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-100 font-serif mb-1">Fotoaparát není k dispozici</h3>
              <p className="text-xs text-amber-200/70 max-w-xs mx-auto">
                {scannerError} Můžete vybrat fotografii s čárovým kódem nebo zadat ISBN ručně.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-amber-950 border-t border-amber-900 flex flex-col gap-3 z-20">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 bg-amber-900/40 hover:bg-amber-900/70 text-amber-200 font-semibold text-xs rounded-xl border border-amber-700/50 transition-colors flex items-center justify-center gap-2"
          >
            <Image className="w-4 h-4 text-amber-400" />
            <span>Nahrát fotku</span>
          </button>

          <button
            onClick={() => handleSafeClose(onOpenManualInput)}
            className="py-3 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-2"
          >
            <Keyboard className="w-4 h-4" />
            <span>Zadat ISBN</span>
          </button>
        </div>

        <button
          onClick={() => handleSafeClose()}
          className="w-full py-3 bg-stone-900/80 hover:bg-stone-900 text-amber-300/70 hover:text-amber-100 font-medium text-xs rounded-xl transition-colors"
        >
          Zrušit skenování
        </button>
      </div>
    </div>
  );
}
