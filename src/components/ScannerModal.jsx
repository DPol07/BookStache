import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Image, Keyboard, AlertCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function ScannerModal({ isOpen, onClose, onScanSuccess, onOpenManualInput }) {
  const [scannerError, setScannerError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrcodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsInitializing(true);
    setScannerError(null);

    const config = {
      fps: 10,
      qrbox: { width: 280, height: 160 },
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

    // Wait for DOM element
    const timer = setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode(elementId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) {
              // Stop camera and trigger callback
              html5Qrcode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(() => {
                onScanSuccess(decodedText);
              });
            }
          },
          () => {
            // Frame search error, ignore
          }
        );

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
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrcodeRef.current) {
        if (html5QrcodeRef.current.isScanning) {
          html5QrcodeRef.current.stop().catch(() => {});
        }
        html5QrcodeRef.current.clear().catch(() => {});
      }
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
        onScanSuccess(result);
      }
    } catch (err) {
      alert('Čárový kód se z obrázku nepodařilo přečíst. Zkuste jiný nebo zadejte ISBN ručně.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-bold text-base text-white">Skenování čárového kódu</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
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
            <div className="relative w-72 h-44 border-2 border-amber-400/80 rounded-3xl shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] flex items-center justify-center overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-md" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-md" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-md" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-md" />

              {/* Scanning Laser Line Animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-scanline" />
            </div>

            {/* Instruction Label */}
            <p className="mt-6 text-xs font-semibold text-slate-200 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700/80 shadow-lg text-center backdrop-blur-md">
              Naměřte čárový kód na knize do rámečku
            </p>
          </div>
        )}

        {/* Initializing Spinner */}
        {isInitializing && !scannerError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 gap-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">Spouštění fotoaparátu...</p>
          </div>
        )}

        {/* Camera Error Fallback View */}
        {scannerError && (
          <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-slate-950 text-center gap-4">
            <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Fotoaparát není k dispozici</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {scannerError} Můžete vybrat fotografii s čárovým kódem nebo zadat ISBN ručně.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3 z-20">
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
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Image className="w-4 h-4 text-amber-400" />
            <span>Nahrát fotku</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenManualInput();
            }}
            className="py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs rounded-xl border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Keyboard className="w-4 h-4" />
            <span>Zadat ISBN</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs rounded-xl transition-colors"
        >
          Zrušit skenování
        </button>
      </div>
    </div>
  );
}
