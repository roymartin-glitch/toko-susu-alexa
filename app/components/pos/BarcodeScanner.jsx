'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, Scan, AlertCircle, Smartphone, Barcode } from 'lucide-react'

export default function BarcodeScanner({ onScan, onClose }) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [lastScanned, setLastScanned] = useState(null)
  const [scanMode, setScanMode] = useState('manual') // 'manual', 'camera', 'hardware'
  const html5QrCodeRef = useRef(null)
  const manualInputRef = useRef(null)
  const hardwareInputRef = useRef(null)

  useEffect(() => {
    // Auto-focus pada input yang aktif
    if (scanMode === 'manual' && manualInputRef.current) {
      setTimeout(() => manualInputRef.current?.focus(), 100)
    } else if (scanMode === 'hardware' && hardwareInputRef.current) {
      setTimeout(() => hardwareInputRef.current?.focus(), 100)
    }
    
    return () => {
      stopScanner()
    }
  }, [scanMode])

  // Listen untuk hardware barcode scanner (USB/Bluetooth)
  useEffect(() => {
    if (scanMode !== 'hardware') return

    let buffer = ''
    let timeout = null

    const handleKeyPress = (e) => {
      // Hardware scanner biasanya mengirim karakter dengan cepat dan diakhiri Enter
      if (e.key === 'Enter') {
        if (buffer.trim().length > 0) {
          setLastScanned(buffer.trim())
          onScan(buffer.trim())
          buffer = ''
        }
      } else if (e.key.length === 1) {
        buffer += e.key
        
        // Reset buffer jika tidak ada input dalam 100ms (typing manual)
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          buffer = ''
        }, 100)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      clearTimeout(timeout)
    }
  }, [scanMode, onScan])

  const startScanner = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Check if device has camera
      const devices = await Html5Qrcode.getCameras()
      if (!devices || devices.length === 0) {
        throw new Error('Tidak ada kamera ditemukan di device')
      }

      const html5QrCode = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778,
        disableFlip: false,
        formatsToSupport: [
          Html5Qrcode.SCAN_TYPE_CAMERA
        ]
      }

      // Gunakan kamera belakang jika tersedia (untuk mobile)
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      )
      const cameraId = backCamera ? backCamera.id : devices[0].id

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          // Trigger scan
          setLastScanned(decodedText)
          onScan(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Silently ignore scanning errors
        }
      )
    } catch (err) {
      console.error('Scanner error:', err)
      setError(err.message || 'Tidak dapat mengakses kamera. Gunakan mode lain.')
      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current = null
      }
      setIsScanning(false)
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
  }

  const handleManualEntry = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const barcode = e.target.value.trim()
      setLastScanned(barcode)
      onScan(barcode)
      e.target.value = ''
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  const changeScanMode = (mode) => {
    stopScanner()
    setScanMode(mode)
    setError(null)
    setLastScanned(null)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Scan size={20} className="text-emerald-600" />
            Scan Barcode
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-600 mb-2">Pilih Mode Scan:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => changeScanMode('manual')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                scanMode === 'manual'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Barcode size={20} />
              <span className="text-xs font-medium">Manual</span>
            </button>
            <button
              onClick={() => changeScanMode('camera')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                scanMode === 'camera'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Camera size={20} />
              <span className="text-xs font-medium">Kamera</span>
            </button>
            <button
              onClick={() => changeScanMode('hardware')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                scanMode === 'hardware'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone size={20} />
              <span className="text-xs font-medium">Scanner</span>
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Manual Input Mode */}
          {scanMode === 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masukkan Barcode:
              </label>
              <input
                ref={manualInputRef}
                type="text"
                placeholder="Ketik barcode dan tekan Enter"
                onKeyPress={handleManualEntry}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-lg"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Ketik kode barcode secara manual dan tekan <strong>Enter</strong>
              </p>
            </div>
          )}

          {/* Camera Scanner Mode */}
          {scanMode === 'camera' && (
            <div>
              {!isScanning ? (
                <div className="text-center py-6">
                  <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4 font-medium">
                    Gunakan kamera HP untuk scan barcode
                  </p>
                  <button
                    onClick={startScanner}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    Aktifkan Kamera
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    📱 Cocok untuk scan dengan HP/Tablet
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    id="barcode-reader"
                    className="rounded-lg overflow-hidden border-2 border-emerald-500"
                    style={{ width: '100%', height: '250px' }}
                  />
                  <button
                    onClick={stopScanner}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Berhenti Scan
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Arahkan kamera ke barcode produk
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hardware Scanner Mode */}
          {scanMode === 'hardware' && (
            <div>
              <div className="text-center py-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 mb-4">
                <Smartphone size={48} className="mx-auto mb-3 text-emerald-600" />
                <p className="text-gray-700 font-medium mb-2">
                  Mode Scanner Hardware Aktif
                </p>
                <p className="text-sm text-gray-600 px-4">
                  Arahkan scanner barcode USB/Bluetooth ke produk
                </p>
              </div>
              
              {/* Hidden input untuk capture dari hardware scanner */}
              <input
                ref={hardwareInputRef}
                type="text"
                className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-emerald-50"
                placeholder="Siap menerima input dari scanner..."
                readOnly
                autoComplete="off"
              />
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>✓ Kompatibel dengan:</strong>
                  <br />• Scanner Barcode USB
                  <br />• Scanner Bluetooth
                  <br />• HP Android dengan app scanner
                  <br />• Alat POS scanner profesional
                </p>
              </div>
            </div>
          )}

          {/* Last Scanned */}
          {lastScanned && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg animate-pulse">
              <p className="text-sm text-green-700 font-medium">
                ✓ Barcode terdeteksi: <strong className="text-lg">{lastScanned}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-xs text-gray-600">
            <strong>Tips:</strong> Pilih mode sesuai perangkat Anda. Mode Scanner untuk alat profesional, Kamera untuk HP, atau Manual untuk input cepat.
          </p>
        </div>
      </div>
    </div>
  )
}
