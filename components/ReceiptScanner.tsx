import React, { useCallback, useRef, useEffect, useReducer } from 'react';
import { extractReceiptData } from '../services/geminiService';
import type { ExtractedData } from '../types';
import { Spinner } from './Spinner';
import { ProgressBar } from './ProgressBar';
import { CameraIcon } from './icons/CameraIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { VideoCameraSlashIcon } from './icons/VideoCameraSlashIcon';
import { UploadCloudIcon } from './icons/UploadCloudIcon';

interface ReceiptScannerProps {
  onScanStart: () => void;
  onScanSuccess: (data: ExtractedData) => void;
  onScanError: (message: string) => void;
  isScanning: boolean;
  initialAction: 'camera' | 'upload';
}

type ScanMode = 'receipt' | 'qr';

interface ScannerState {
  status: 'initializing' | 'denied' | 'live_feed' | 'preview' | 'qr_error';
  scanMode: ScanMode;
  isBarcodeDetectorSupported: boolean;
  message: string | null;
  imageData: string | null;
  mimeType: string | null;
  fileName: string | null;
}

type ScannerAction =
  | { type: 'SET_MODE'; mode: ScanMode }
  | { type: 'INITIALIZE'; isSupported: boolean }
  | { type: 'STARTING_CAMERA' }
  | { type: 'CAMERA_DENIED'; message: string }
  | { type: 'CAMERA_STARTED' }
  | { type: 'SET_PREVIEW'; image: string; mimeType: string; fileName?: string }
  | { type: 'QR_ERROR'; message: string }
  | { type: 'RESET' };

const initialState: ScannerState = {
  status: 'initializing',
  scanMode: 'receipt',
  isBarcodeDetectorSupported: false,
  message: null,
  imageData: null,
  mimeType: null,
  fileName: null,
};

function scannerReducer(state: ScannerState, action: ScannerAction): ScannerState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isBarcodeDetectorSupported: action.isSupported };
    case 'SET_MODE':
      return { ...state, scanMode: action.mode, status: 'initializing' };
    case 'STARTING_CAMERA':
      return { ...state, status: 'initializing', message: null };
    case 'CAMERA_DENIED':
      return { ...state, status: 'denied', message: action.message };
    case 'CAMERA_STARTED':
      return { ...state, status: 'live_feed', message: null };
    case 'SET_PREVIEW':
      return { ...state, status: 'preview', imageData: action.image, mimeType: action.mimeType, fileName: action.fileName };
    case 'QR_ERROR':
      return { ...state, status: 'qr_error', message: action.message };
    case 'RESET':
      return { ...state, status: 'initializing' };
    default:
      return state;
  }
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onScanStart,
  onScanSuccess,
  onScanError,
  isScanning,
  initialAction,
}) => {
  const [state, dispatch] = useReducer(scannerReducer, initialState);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);


  useEffect(() => {
    dispatch({ type: 'INITIALIZE', isSupported: 'BarcodeDetector' in window });
    // Removed auto-click - it causes race conditions
    // User will click the "Upload File" button in the UI instead
  }, [initialAction]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    console.log('[ReceiptScanner] startCamera called');
    stopCamera();
    if (!isMountedRef.current) {
      console.log('[ReceiptScanner] Component not mounted, aborting');
      return;
    }
    console.log('[ReceiptScanner] Dispatching STARTING_CAMERA');
    dispatch({ type: 'STARTING_CAMERA' });

    // Try back camera first (environment), then any camera as fallback
    const constraints = [
      { video: { facingMode: 'environment' } }, // Back camera (preferred)
      { video: { facingMode: 'user' } },        // Front camera
      { video: true }                            // Any camera
    ];

    for (const constraint of constraints) {
      try {
        console.log('[ReceiptScanner] Trying camera with constraint:', constraint);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
        console.log('[ReceiptScanner] Camera access granted, mediaStream:', mediaStream);
        if (isMountedRef.current && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          streamRef.current = mediaStream;
          console.log('[ReceiptScanner] Dispatching CAMERA_STARTED');
          dispatch({ type: 'CAMERA_STARTED' });
          return; // Success! Exit the function
        } else {
          console.log('[ReceiptScanner] Component unmounted or videoRef missing, stopping stream');
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('[ReceiptScanner] Camera error with constraint', constraint, ':', err);
        // Continue to next constraint
      }
    }

    // All attempts failed
    if (!isMountedRef.current) return;
    console.error("[ReceiptScanner] All camera access attempts failed");
    streamRef.current = null;
    let message = 'Could not access the camera. Please check browser permissions.';
    dispatch({ type: 'CAMERA_DENIED', message });
  }, [stopCamera]);

  useEffect(() => {
    console.log('[ReceiptScanner] Camera effect running', { initialAction, scanMode: state.scanMode, status: state.status });
    // Start camera for:
    // 1. Camera mode (initialAction = 'camera') when scanMode is 'receipt'
    // 2. QR Code mode (scanMode = 'qr') regardless of initialAction
    const shouldStartCamera =
      (initialAction === 'camera' && state.scanMode === 'receipt') ||
      state.scanMode === 'qr';

    console.log('[ReceiptScanner] Should start camera?', shouldStartCamera);
    if (shouldStartCamera && state.status === 'initializing') {
      console.log('[ReceiptScanner] Waiting for videoRef to be ready...');
      // Add delay to ensure video element is rendered and ref is attached
      const timer = setTimeout(() => {
        console.log('[ReceiptScanner] Calling startCamera() after delay');
        startCamera();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    }
    return () => stopCamera();
  }, [state.scanMode, state.status, startCamera, stopCamera, initialAction]);


  const parseAndValidateQrCode = useCallback((qrData: string): ExtractedData | null => {
    try {
      const data = JSON.parse(qrData);
      if (data.productName && data.purchaseDate && data.warrantyPeriod) {
        return data as ExtractedData;
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (state.status !== 'live_feed' || state.scanMode !== 'qr' || !state.isBarcodeDetectorSupported) {
      return;
    }

    const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    let isScanningActive = true;

    const scan = async () => {
      if (!isScanningActive || !videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0 && isScanningActive) {
          isScanningActive = false;
          stopCamera();
          const qrData = barcodes[0].rawValue;
          const validatedData = parseAndValidateQrCode(qrData);
          if (validatedData) {
            onScanSuccess(validatedData);
          } else {
            dispatch({ type: 'QR_ERROR', message: 'Invalid QR Code. Please scan a valid warranty QR code.' });
          }
        }
      } catch (error) {
        console.error('QR detection error:', error);
      }
    };

    const intervalId = window.setInterval(scan, 500);
    return () => {
      isScanningActive = false;
      clearInterval(intervalId);
    };
  }, [state.status, state.scanMode, state.isBarcodeDetectorSupported, onScanSuccess, stopCamera, parseAndValidateQrCode]);

  useEffect(() => {
    if (state.status === 'qr_error') {
      const timer = setTimeout(() => {
        startCamera();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.status, startCamera]);


  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      onScanError('Camera components are not ready.');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Camera is not providing a valid video stream.");
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get 2D context from canvas to capture image.');
      }

      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (!dataUrl) {
        throw new Error('Failed to create data URL from canvas.');
      }

      stopCamera();

      dispatch({ type: 'SET_PREVIEW', image: dataUrl, mimeType: 'image/jpeg' });

    } catch (error) {
      console.error("Failed to capture image:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during capture.';
      onScanError(`Capture failed: ${message}`);
    }
  }, [stopCamera, onScanError]);

  const handleRetake = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    dispatch({ type: 'RESET' });
    if (initialAction === 'upload') {
      // Small delay to ensure state is reset before triggering file dialog
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    } else {
      startCamera();
    }
  }, [startCamera, initialAction]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ReceiptScanner] File change event triggered', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('[ReceiptScanner] File selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        console.log('[ReceiptScanner] File loaded, setting preview');
        stopCamera();
        dispatch({
          type: 'SET_PREVIEW',
          image: loadEvent.target?.result as string,
          mimeType: file.type,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      console.log('[ReceiptScanner] No file selected (cancelled or empty)');
      if (initialAction === 'camera') {
        startCamera();
      }
    }
  };

  const handleScan = useCallback(async () => {
    if (state.status !== 'preview' || !state.imageData) {
      onScanError('No image has been captured.');
      return;
    }
    onScanStart();
    try {
      const base64String = state.imageData.split(',')[1];
      const data = await extractReceiptData(base64String, state.mimeType!);
      onScanSuccess({
        ...data,
        receiptImage: state.imageData,
        receiptMimeType: state.mimeType!,
      });
    } catch (error) {
      if (error instanceof Error) {
        onScanError(error.message);
      } else {
        onScanError('An unexpected error occurred during scanning.');
      }
    }
  }, [state, onScanStart, onScanSuccess, onScanError]);

  const handleModeChange = useCallback((mode: ScanMode) => {
    if (isScanning) return;
    dispatch({ type: 'SET_MODE', mode: mode });
  }, [isScanning]);

  const renderContent = () => {
    if (isScanning) {
      return (
        <div className="my-8 px-4">
          <ProgressBar />
        </div>
      );
    }

    switch (state.status) {
      case 'initializing':
        // If initialAction is upload, show upload button immediately instead of spinner
        if (initialAction === 'upload') {
          return (
            <div className="mt-8">
              <div className="relative w-full aspect-video bg-deep-graphite rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                <div className="text-center p-8">
                  <UploadCloudIcon className="w-16 h-16 mx-auto text-muted-silver mb-4" />
                  <p className="text-off-white font-semibold mb-2">Ready to Upload</p>
                  <p className="text-sm text-muted-silver mb-6">Select a receipt image or PDF document</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold clay-button"
                  >
                    <UploadCloudIcon className="w-5 h-5" />
                    <span>Choose File</span>
                  </button>
                </div>
              </div>
            </div>
          );
        }
        // For camera mode, show manual start button (mobile browsers often need user interaction)
        return (
          <div className="mt-8">
            <div className="relative w-full aspect-video bg-deep-graphite rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
              <div className="text-center p-8">
                <CameraIcon className="w-16 h-16 mx-auto text-muted-silver mb-4" />
                <p className="text-off-white font-semibold mb-2">Camera Ready</p>
                <p className="text-sm text-muted-silver mb-6">
                  {state.scanMode === 'qr' ? 'Tap to start QR code scanner' : 'Tap to activate your camera'}
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold clay-button"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>Start Camera</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'denied':
        return (
          <div className="mt-8 text-center p-8 bg-deep-graphite rounded-2xl border border-alert-red/30">
            <VideoCameraSlashIcon className="w-12 h-12 mx-auto text-alert-red" />
            <h3 className="mt-4 text-lg font-semibold text-off-white">Camera Access Denied</h3>
            <p className="mt-2 text-sm text-muted-silver">{state.message}</p>
            <button
              onClick={startCamera}
              className="mt-6 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold clay-button"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        );
      case 'live_feed':
      case 'qr_error':
        return (
          <div className="mt-8">
            <div className="relative w-full aspect-video bg-charcoal-black rounded-2xl overflow-hidden border border-white/5">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
              {state.scanMode === 'qr' && state.status === 'live_feed' && <div className="absolute inset-0 border-8 border-white/10 rounded-2xl animate-pulse"></div>}
              <canvas ref={canvasRef} className="hidden"></canvas>
              {state.status === 'qr_error' && (
                <div className="absolute inset-0 bg-alert-red/80 flex items-center justify-center text-center p-4">
                  <p className="font-semibold text-white">{state.message}</p>
                </div>
              )}
            </div>

            {state.scanMode === 'receipt' && state.status === 'live_feed' && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button onClick={handleCapture} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-semibold clay-button">
                  <CameraIcon className="w-6 h-6" />
                  <span>Capture</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-semibold clay-button-secondary">
                  <UploadCloudIcon className="w-6 h-6" />
                  <span>Upload File</span>
                </button>
              </div>
            )}
          </div>
        );
      case 'preview':
        return (
          <div className="mt-8">
            <div className="relative w-full aspect-video bg-charcoal-black rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center p-2">
              {state.mimeType?.startsWith('image/') ? (
                <img src={state.imageData!} alt="Receipt preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <DocumentTextIcon className="w-16 h-16 mx-auto text-muted-silver" />
                  <p className="mt-4 font-semibold text-off-white break-all">{state.fileName || 'PDF Document'}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp, application/pdf"
      />
      <div className="text-center">
        <h2 className="text-3xl font-serif font-semibold text-off-white">
          {isScanning ? 'Processing...' : 'Add from Receipt'}
        </h2>
        <p className="mt-2 text-muted-silver">
          {isScanning
            ? 'Our AI is analyzing the details. This may take a moment.'
            : state.status === 'preview'
              ? 'Review your chosen document.'
              : state.scanMode === 'receipt'
                ? 'Capture or upload a receipt.'
                : 'Position the QR code inside the frame.'
          }
        </p>
      </div>

      {!isScanning && state.isBarcodeDetectorSupported && initialAction === 'camera' && (
        <div className="mt-8 flex justify-center p-1.5 bg-deep-graphite rounded-xl max-w-xs mx-auto">
          <button
            onClick={() => handleModeChange('receipt')}
            className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${state.scanMode === 'receipt' ? 'bg-onyx-gray text-off-white' : 'text-muted-silver hover:bg-onyx-gray/50'}`}
          >
            <DocumentTextIcon className="w-5 h-5" /> Receipt
          </button>
          <button
            onClick={() => handleModeChange('qr')}
            className={`w-1/2 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${state.scanMode === 'qr' ? 'bg-onyx-gray text-off-white' : 'text-muted-silver hover:bg-onyx-gray/50'}`}
          >
            <QrCodeIcon className="w-5 h-5" /> QR Code
          </button>
        </div>
      )}

      {renderContent()}

      {state.status === 'preview' && !isScanning && (
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleRetake}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium clay-button-secondary"
          >
            <RefreshIcon className="w-5 h-5 mr-2" />
            Change
          </button>
          <button
            onClick={handleScan}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold clay-button"
          >
            Extract Info
          </button>
        </div>
      )}

      {isScanning && (
        <div className="mt-8 flex justify-center">
          <button
            disabled
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-onyx-gray text-base font-medium rounded-xl shadow-sm text-dark-smoke bg-deep-graphite cursor-not-allowed clay-button-secondary"
          >
            <Spinner />
            Analyzing...
          </button>
        </div>
      )}
    </div>
  );
};