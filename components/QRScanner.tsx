'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          console.log('Scan error:', errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = 'Impossible d\'accéder à la caméra';
      setError(errorMsg);
      if (onScanError) onScanError(errorMsg);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scanner QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          id="qr-reader"
          className={`${isScanning ? 'block' : 'hidden'} w-full rounded-lg overflow-hidden`}
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Démarrer le scan
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Arrêter
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Positionnez le QR code devant la caméra pour scanner
        </p>
      </CardContent>
    </Card>
  );
}