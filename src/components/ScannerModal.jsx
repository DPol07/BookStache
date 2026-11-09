import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Camera,
  Image,
  Keyboard,
  AlertCircle,
  RefreshCw,
  ScanText,
  Barcode,
  CheckCircle2,
  Sparkles,
  Search,
  Loader2
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { extractIsbnCandidatesFromText, isValidIsbn } from '../services/isbnValidator';
import { normalizeIsbn, formatIsbnDisplay } from '../services/bookApi';

export default function ScannerModal({ isOpen, onClose, onScanSuccess, onOpenManualInput }) {
  // Mode: 'barcode' or 'ocr'
  const [scanMode, setScanMode] = useState('barcode');

  const [scannerError, setScannerError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // OCR state
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [detectedIsbns, setDetectedIsbns] = useState([]); // [{ isbn, formatted, type, valid }]
  const [ocrManualEdit, setOcrManualEdit] = useState('');
  const [showOcrConfirmation, setShowOcrConfirmation] = useState(false);

  const html5QrcodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const ocrFileInputRef = useRef(null);
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

  // Start or restart camera scanner
  const startCamera = async () => {
    isStoppingRef.current = false;
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

    try {
      const html5Qrcode = new Html5Qrcode(elementId);
      html5QrcodeRef.current = html5Qrcode;

      const onScanMatch = async (decodedText) => {
        if (isStoppingRef.current) return;
        // In barcode mode, trigger immediately
        if (scanMode === 'barcode') {
          try {
            if (html5Qrcode.isScanning) {
              html5Qrcode.pause(true);
            }
          } catch (e) {}

          await safeStopScanner();
          onScanSuccess(decodedText);
        }
      };

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

      setIsInitializing(false);
    } catch (err) {
      console.warn('Camera start error:', err);
      setIsInitializing(false);
      setScannerError('Není přístup k fotoaparátu nebo zařízení nemá aktivní kameru.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let timer = setTimeout(() => {
      startCamera();
    }, 150);

    return () => {
      clearTimeout(timer);
      safeStopScanner();
    };
  }, [isOpen]);

  // Process text or image using Tesseract.js
  const processImageWithOcr = async (imageSource) => {
    setIsOcrProcessing(true);
    setOcrStatusText('Načítání OCR modulu...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');

      setOcrStatusText('Rozpoznávání textu na fotografii...');
      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      const text = ret.data.text || '';
      const candidates = extractIsbnCandidatesFromText(text);

      if (candidates && candidates.length > 0) {
        setDetectedIsbns(candidates);
        setOcrManualEdit(candidates[0].isbn);
        setShowOcrConfirmation(true);
      } else {
        // Fallback: try regex on raw digits in text
        const digitsOnly = text.replace(/[^0-9X]/gi, '');
        const norm = normalizeIsbn(digitsOnly);
        if (norm && norm.length >= 10 && isValidIsbn(norm)) {
          const item = { isbn: norm, formatted: formatIsbnDisplay(norm), type: norm.length === 13 ? 'ISBN-13' : 'ISBN-10', valid: true };
          setDetectedIsbns([item]);
          setOcrManualEdit(norm);
          setShowOcrConfirmation(true);
        } else {
          // No ISBN detected automatically
          setDetectedIsbns([]);
          setOcrManualEdit(norm || '');
          setShowOcrConfirmation(true);
        }
      }
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Během rozpoznávání textu došlo k chybě. Zkontrolujte připojení nebo zadejte kód ručně.');
    } finally {
      setIsOcrProcessing(false);
      setOcrStatusText('');
    }
  };

  // OCR Snapshot from live camera
  const handleCaptureCameraOcr = async () => {
    try {
      const video = document.querySelector('#interactive-barcode-reader video');
      if (!video) {
        alert('Fotoaparát není připraven.');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      await processImageWithOcr(canvas);
    } catch (err) {
      console.error('Capture error:', err);
      alert('Nepodařilo se pořídit snímek z kamery.');
    }
  };

  // Barcode file upload
  const handleBarcodeFileUpload = async (e) => {
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

  // OCR file upload
  const handleOcrFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageWithOcr(file);
  };

  // Confirm recognized/edited ISBN
  const handleConfirmOcrIsbn = async () => {
    const clean = normalizeIsbn(ocrManualEdit);
    if (!clean) {
      alert('Zadejte platné číslo ISBN.');
      return;
    }

    await safeStopScanner();
    setShowOcrConfirmation(false);
    onScanSuccess(clean);
  };

  if (!isOpen) return null;

  return (
    <div style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }} className="fixed inset-0 z-50 flex flex-col animate-fadeIn">
      {/* Top Header */}
      <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="flex items-center justify-between p-4 border-b z-20">
        <div className="flex items-center gap-2">
          {scanMode === 'barcode' ? (
            <Barcode className="w-5 h-5 animate-pulse" style={{ color: '#5C3A24' }} />
          ) : (
            <ScanText className="w-5 h-5 animate-pulse" style={{ color: '#5C3A24' }} />
          )}
          <span style={{ color: '#3D2314' }} className="font-bold text-base font-serif">
            {scanMode === 'barcode' ? 'Skenování čárového kódu' : 'OCR rozpoznání tištěného ISBN'}
          </span>
        </div>
        <button
          onClick={() => handleSafeClose()}
          style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
          className="p-2 rounded-full transition-colors cursor-pointer hover:opacity-90"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="px-4 py-2 border-b z-20">
        <div style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B' }} className="grid grid-cols-2 p-1 rounded-2xl border text-xs font-bold max-w-sm mx-auto">
          <button
            onClick={() => setScanMode('barcode')}
            style={{
              backgroundColor: scanMode === 'barcode' ? '#4A2E1B' : 'transparent',
              color: scanMode === 'barcode' ? '#FAF6F0' : '#5C3A24',
            }}
            className="py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
            <span>Čárový kód</span>
          </button>

          <button
            onClick={() => setScanMode('ocr')}
            style={{
              backgroundColor: scanMode === 'ocr' ? '#4A2E1B' : 'transparent',
              color: scanMode === 'ocr' ? '#FAF6F0' : '#5C3A24',
            }}
            className="py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ScanText className="w-4 h-4" />
            <span>Tištěné ISBN (OCR)</span>
          </button>
        </div>
      </div>

      {/* Main Viewfinder / Camera Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* HTML5 QRcode Video Container */}
        <div id="interactive-barcode-reader" className="w-full h-full object-cover" />

        {/* Custom Visual Frame Overlay */}
        {!scannerError && !isOcrProcessing && !showOcrConfirmation && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            <div className={`relative ${scanMode === 'ocr' ? 'w-[300px] h-[100px]' : 'w-[280px] h-[160px]'} border-2 border-[#8C593B]/60 rounded-2xl flex items-center justify-center transition-all duration-300`}>
              {/* Scanline Inner Container */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center pointer-events-none">
                <div className="w-full h-0.5 bg-[#F2E8D8] shadow-sm animate-scanline" />
              </div>

              {/* Corner Brackets */}
              <div className="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-4 border-l-4 border-[#F2E8D8] rounded-tl-2xl pointer-events-none" />
              <div className="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-4 border-r-4 border-[#F2E8D8] rounded-tr-2xl pointer-events-none" />
              <div className="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-4 border-l-4 border-[#F2E8D8] rounded-bl-2xl pointer-events-none" />
              <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-4 border-r-4 border-[#F2E8D8] rounded-br-2xl pointer-events-none" />
            </div>

            <p style={{ backgroundColor: '#F2E8D8', color: '#3D2314', borderColor: '#8C593B' }} className="mt-6 text-xs font-semibold px-4 py-2 rounded-full border text-center shadow-md">
              {scanMode === 'barcode'
                ? 'Naměřte čárový kód na knize do rámečku'
                : 'Zaměřte tištěný text „ISBN...“ do rámečku a stiskněte „Rozpoznat kamerou“'}
            </p>
          </div>
        )}

        {/* Initializing Spinner */}
        {isInitializing && !scannerError && (
          <div style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#5C3A24' }} />
            <p className="text-sm font-medium">Spouštění fotoaparátu...</p>
          </div>
        )}

        {/* OCR Processing Overlay */}
        {isOcrProcessing && (
          <div style={{ backgroundColor: 'rgba(250, 246, 240, 0.95)', color: '#3D2314' }} className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#8C593B' }} />
            <p className="text-sm font-bold font-serif">{ocrStatusText || 'Rozpoznávání ISBN...'}</p>
            <p className="text-xs" style={{ color: '#5C3A24' }}>Probíhá analýza a optické čtení textu...</p>
          </div>
        )}

        {/* OCR Result & Confirmation Dialog (Overlay) */}
        {showOcrConfirmation && (
          <div style={{ backgroundColor: 'rgba(61, 35, 20, 0.75)' }} className="absolute inset-0 z-40 flex items-center justify-center p-4">
            <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }} className="w-full max-w-sm border rounded-3xl p-5 space-y-4 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: '#E6D7C3' }}>
                <span className="font-bold font-serif text-sm flex items-center gap-2" style={{ color: '#3D2314' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#8C593B' }} />
                  Kontrola rozpoznaného ISBN
                </span>
                <button
                  onClick={() => setShowOcrConfirmation(false)}
                  style={{ color: '#5C3A24' }}
                  className="p-1 rounded-full cursor-pointer hover:bg-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {detectedIsbns.length > 0 ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      Nalezeno {detectedIsbns[0].type} s platným kontrolním součtem!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Číslo ISBN nebylo jednoznačně detekováno. Zkontrolujte nebo doplňte číslo níže.
                  </span>
                </div>
              )}

              {/* Editable input field for manual correction */}
              <div className="space-y-1">
                <label className="block text-xs font-bold" style={{ color: '#3D2314' }}>
                  Rozpoznané číslo ISBN (lze ručně upravit):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ocrManualEdit}
                    onChange={(e) => setOcrManualEdit(e.target.value)}
                    placeholder="Např. 9788000058825"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm font-mono focus:outline-none"
                    autoFocus
                  />
                  {isValidIsbn(ocrManualEdit) && (
                    <CheckCircle2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  )}
                </div>
                <div className="text-[11px] pt-1" style={{ color: isValidIsbn(ocrManualEdit) ? '#15803D' : '#8C593B' }}>
                  {isValidIsbn(ocrManualEdit)
                    ? '✓ Kontrolní součet ISBN je platný'
                    : 'Zadejte 10 nebo 13místné číslo ISBN'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOcrConfirmation(false)}
                  style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
                  className="flex-1 py-2.5 font-semibold text-xs rounded-xl border transition-colors cursor-pointer"
                >
                  Znovu
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOcrIsbn}
                  disabled={!ocrManualEdit.trim()}
                  style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0', opacity: ocrManualEdit.trim() ? 1 : 0.6 }}
                  className="flex-1 py-2.5 font-bold text-xs rounded-xl transition-all font-serif uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Vyhledat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Camera Error Fallback View */}
        {scannerError && (
          <div style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }} className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center gap-4">
            <div style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706' }} className="p-4 text-amber-600 rounded-full border">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif mb-1">Fotoaparát není k dispozici</h3>
              <p style={{ color: '#5C3A24' }} className="text-xs max-w-xs mx-auto">
                {scannerError} Můžete nahrát fotografii nebo zadat kód ručně.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="p-4 border-t flex flex-col gap-3 z-20">
        {/* Hidden File inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleBarcodeFileUpload}
          className="hidden"
        />
        <input
          type="file"
          ref={ocrFileInputRef}
          accept="image/*"
          onChange={handleOcrFileUpload}
          className="hidden"
        />

        {scanMode === 'barcode' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
              className="py-3 px-4 font-semibold text-xs rounded-xl border flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-50"
            >
              <Image className="w-4 h-4" style={{ color: '#5C3A24' }} />
              <span>Nahrát fotku</span>
            </button>

            <button
              onClick={() => handleSafeClose(onOpenManualInput)}
              style={{ backgroundColor: '#4A2E1B', borderColor: '#3D2314', color: '#FAF6F0' }}
              className="py-3 px-4 font-bold text-xs rounded-xl border flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            >
              <Keyboard className="w-4 h-4" />
              <span>Zadat ISBN</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCaptureCameraOcr}
              disabled={isOcrProcessing || !!scannerError}
              style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0', opacity: isOcrProcessing || scannerError ? 0.6 : 1 }}
              className="py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 font-serif"
            >
              <Camera className="w-4 h-4" />
              <span>Rozpoznat kamerou</span>
            </button>

            <button
              onClick={() => ocrFileInputRef.current?.click()}
              disabled={isOcrProcessing}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
              className="py-3 px-4 font-semibold text-xs rounded-xl border flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-50"
            >
              <Image className="w-4 h-4" style={{ color: '#5C3A24' }} />
              <span>Nahrát fotku</span>
            </button>
          </div>
        )}

        <button
          onClick={() => handleSafeClose()}
          style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#5C3A24' }}
          className="w-full py-2.5 border font-medium text-xs rounded-xl cursor-pointer hover:bg-stone-50"
        >
          Zrušit skenování
        </button>
      </div>
    </div>
  );
}
