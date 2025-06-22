import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, RotateCcw, Check, X, Crop } from 'lucide-react';

interface SmartCameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title: string;
}

interface FileInputProps {
  onFileSelect: (file: File) => void;
  title: string;
}

declare global {
  interface Window {
    cv: any;
  }
}

export function SmartCameraCapture({ isOpen, onClose, onCapture, title }: SmartCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cvLoaded, setCvLoaded] = useState(false);
  const [corners, setCorners] = useState<any[]>([]);
  const [showCropped, setShowCropped] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);


  // Load OpenCV
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;
    script.onload = () => {
      if (window.cv) {
        window.cv.onRuntimeInitialized = () => {
          setCvLoaded(true);
        };
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Start camera with better error handling and multiple attempts
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setIsVideoReady(false);

      console.log('Starting camera...');

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      let mediaStream: MediaStream | null = null;

      // Try multiple camera configurations in order of preference
      const cameraConfigs = [
        // Mobile back camera (preferred for sticker capture)
        {
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Mobile back camera (less strict)
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Any camera with good resolution
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Basic camera (fallback)
        {
          video: true
        }
      ];

      for (let i = 0; i < cameraConfigs.length; i++) {
        try {
          console.log(`Trying camera config ${i + 1}:`, cameraConfigs[i]);
          mediaStream = await navigator.mediaDevices.getUserMedia(cameraConfigs[i]);
          console.log('Camera started successfully with config', i + 1);
          break;
        } catch (configError) {
          console.log(`Camera config ${i + 1} failed:`, configError);
          if (i === cameraConfigs.length - 1) {
            throw configError; // Last attempt failed
          }
        }
      }

      if (!mediaStream) {
        throw new Error('Failed to start camera with any configuration');
      }

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Set up event handlers
        const video = videoRef.current;

        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
          video.play()
            .then(() => {
              console.log('Video playing successfully');
              setIsVideoReady(true);
            })
            .catch((playError) => {
              console.error('Error playing video:', playError);
              setCameraError('Failed to start video playback. Please try again.');
            });
        };

        const handleVideoError = (error: any) => {
          console.error('Video error:', error);
          setCameraError('Video stream error. Please try again.');
        };

        video.onloadedmetadata = handleLoadedMetadata;
        video.onerror = handleVideoError;

        // Force load if metadata is already available
        if (video.readyState >= 1) {
          handleLoadedMetadata();
        }
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Camera access failed. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else {
        errorMessage += 'Please check camera permissions and try again.';
      }

      setCameraError(errorMessage);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
    setCameraError(null);
  }, [stream]);

  // Edge detection using OpenCV
  const detectEdges = useCallback((imageData: ImageData) => {
    if (!window.cv || !cvLoaded) return null;

    const cv = window.cv;
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    const blur = new cv.Mat();
    const edges = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    try {
      // Convert to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Apply Gaussian blur
      cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
      
      // Canny edge detection
      cv.Canny(blur, edges, 50, 150);
      
      // Find contours
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      
      // Find the largest rectangular contour
      let maxArea = 0;
      let bestContour = null;
      
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        
        if (area > maxArea && area > 10000) { // Minimum area threshold
          const peri = cv.arcLength(contour, true);
          const approx = new cv.Mat();
          cv.approxPolyDP(contour, approx, 0.02 * peri, true);
          
          if (approx.rows === 4) { // Rectangle has 4 corners
            maxArea = area;
            bestContour = approx.clone();
          }
          approx.delete();
        }
        contour.delete();
      }
      
      // Clean up
      src.delete();
      gray.delete();
      blur.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
      
      return bestContour;
    } catch (error) {
      console.error('OpenCV processing error:', error);
      return null;
    }
  }, [cvLoaded]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataURL);

    // Detect edges if OpenCV is loaded
    if (cvLoaded) {
      setIsProcessing(true);
      setTimeout(() => {
        const detectedCorners = detectEdges(imageData);
        if (detectedCorners) {
          setCorners(detectedCorners);
          drawDetectedRectangle(detectedCorners);
        }
        setIsProcessing(false);
      }, 100);
    }
  }, [cvLoaded, detectEdges]);

  // Draw detected rectangle on preview
  const drawDetectedRectangle = useCallback((detectedCorners: any) => {
    if (!previewCanvasRef.current || !canvasRef.current) return;

    const previewCanvas = previewCanvasRef.current;
    const sourceCanvas = canvasRef.current;
    const ctx = previewCanvas.getContext('2d');

    if (!ctx) return;

    previewCanvas.width = sourceCanvas.width;
    previewCanvas.height = sourceCanvas.height;
    
    // Draw original image
    ctx.drawImage(sourceCanvas, 0, 0);
    
    // Draw detected rectangle
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    const corners = detectedCorners.data32S;
    for (let i = 0; i < 4; i++) {
      const x = corners[i * 2];
      const y = corners[i * 2 + 1];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    
    // Draw corner points
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < 4; i++) {
      const x = corners[i * 2];
      const y = corners[i * 2 + 1];
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, []);

  // Crop image using detected corners
  const cropImage = useCallback(() => {
    if (!window.cv || !corners || !canvasRef.current) return;

    const cv = window.cv;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const src = cv.matFromImageData(imageData);
      
      // Define destination points for perspective transform
      const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        300, 0,
        300, 400,
        0, 400
      ]);
      
      // Get source points from detected corners
      const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, corners.data32S);
      
      // Get perspective transform matrix
      const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
      
      // Apply perspective transform
      const dst = new cv.Mat();
      cv.warpPerspective(src, dst, M, new cv.Size(300, 400));
      
      // Convert back to canvas
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = 300;
      croppedCanvas.height = 400;
      cv.imshow(croppedCanvas, dst);
      
      const croppedDataURL = croppedCanvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(croppedDataURL);
      setShowCropped(true);
      
      // Clean up
      src.delete();
      dst.delete();
      M.delete();
      srcPoints.delete();
      dstPoints.delete();
    } catch (error) {
      console.error('Cropping error:', error);
    }
  }, [corners]);

  // Convert data URL to File
  const dataURLToFile = useCallback((dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setCorners([]);
    setShowCropped(false);
    setCameraError(null);
    setIsVideoReady(false);
    onClose();
  }, [stopCamera, onClose]);

  // Confirm capture
  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      const file = dataURLToFile(capturedImage, `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`);
      onCapture(file);
      handleClose();
    }
  }, [capturedImage, dataURLToFile, onCapture, title, handleClose]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCorners([]);
    setShowCropped(false);
    // Restart camera if needed
    if (!isVideoReady && !stream) {
      startCamera();
    }
  }, [isVideoReady, stream, startCamera]);



  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  // Auto-retry camera if it fails
  useEffect(() => {
    if (isOpen && cameraError && !stream) {
      const retryTimer = setTimeout(() => {
        console.log('Auto-retrying camera...');
        startCamera();
      }, 3000); // Retry after 3 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [isOpen, cameraError, stream, startCamera]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Camera className="h-5 w-5" />
            {title} - Smart Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage ? (
            // Camera view
            <div className="relative bg-black rounded-lg overflow-hidden">
              {cameraError ? (
                // Error state - camera only
                <div className="w-full h-96 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center p-6">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg mb-2">Camera Error</p>
                    <p className="text-sm text-gray-300 mb-6 max-w-md">{cameraError}</p>
                    <Button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                      size="lg"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Try Camera Again
                    </Button>
                    <p className="text-xs text-gray-400 mt-4">
                      Camera access is required for sticker capture
                    </p>
                  </div>
                </div>
              ) : !isVideoReady ? (
                // Loading state
                <div className="w-full h-96 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Starting Camera...</p>
                    <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
                  </div>
                </div>
              ) : (
                // Camera ready
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 border-dashed m-4 rounded-lg pointer-events-none">
                    <div className="absolute top-2 left-2 text-blue-500 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      Position sticker within frame
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button
                      onClick={capturePhoto}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16"
                      disabled={!isVideoReady}
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Preview view
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                {showCropped ? (
                  <img src={capturedImage} alt="Cropped" className="w-full h-96 object-contain" />
                ) : (
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-96 object-contain"
                  />
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-lg">Processing...</div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
                
                {corners.length > 0 && !showCropped && (
                  <Button
                    onClick={cropImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Crop className="h-4 w-4" />
                    Auto Crop
                  </Button>
                )}
                
                <Button
                  onClick={confirmCapture}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Use This
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvases for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
}
