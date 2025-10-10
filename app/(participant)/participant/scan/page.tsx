'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import QRScanner from '@/components/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, QrCode, Award } from 'lucide-react';

export default function ScanPage() {
  const { data: session } = useSession();
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    points?: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const workshopId = decodedText;

      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult({
          success: true,
          message: data.message,
          points: data.pointsAwarded,
        });
      } else {
        setScanResult({
          success: false,
          message: data.error || 'Erreur lors de la validation',
        });
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult({
        success: false,
        message: 'Erreur lors du traitement',
      });
    } finally {
      setIsProcessing(false);
      // Reset after 5 seconds
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scanner QR Code</h1>
          <p className="text-gray-600 mt-2">
            Scannez le QR code du workshop pour confirmer votre présence
          </p>
        </div>

        {/* Result Display */}
        {scanResult && (
          <Card className={`mb-6 ${scanResult.success ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {scanResult.success ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      scanResult.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.success && scanResult.points && (
                    <p className="text-yellow-600 font-medium flex items-center gap-2 mt-1">
                      <Award className="h-4 w-4" />
                      +{scanResult.points} points gagnés !
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
 
        {/* Scanner Component */}
        <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>1. Cliquez sur "Démarrer le scan"</p>
            <p>2. Autorisez l'accès à votre caméra</p>
            <p>3. Positionnez le QR code du workshop dans le cadre</p>
            <p>4. Votre présence sera automatiquement validée</p>
            <p className="text-yellow-600 font-medium mt-4">
              ⚠️ Vous ne pouvez scanner qu'une seule fois par workshop
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}