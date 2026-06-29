'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, Scan, AlertCircle, Smartphone, Barcode } from 'lucide-react'

export default function BarcodeScanner({ onScan, onClose }) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [lastScanned, setLastScanned] = useState(null)
  const [scanMode, setScanMode] = useState('manual') // 'manual', 'camera', 'hardware'
  const [useNativeDetector, setUseNativeDetector] = useState(false)
  const html5QrCodeRef = useRef(null)
  const manualInputRef = useRef(null)
  const hardwareInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanIntervalRef = useRef(null)
  const lastScanTimeRef = useRef(0)

  useEffect(() => {
    // Auto-focus pada input yang aktif
    if (scanMode === 'manual' && manualInputRef.current) {
      setTimeout(() => manualInputRef.current?.focus(), 100)
    } else if (scanMode === 'hardware' && hardwareInputRef.current) {
      setTimeout(() => hardwareInputRef.current?.focus(), 100)
    }
    
    return () => {
      stopScanner()
      stopNativeScanner()
    }
  }, [scanMode])

  // Check if BarcodeDetector API is available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      // Native API available! Much faster than JS library
      console.log('✅ Native BarcodeDetector API available!')
      setUseNativeDetector(true)
    } else {
      console.log('⚠️ Native BarcodeDetector not available, using fallback')
      setUseNativeDetector(false)
    }
  }, [])

  // Listen untuk hardware barcode scanner (USB/Bluetooth)
  useEffect(() => {
    if (scanMode !== 'hardware') return

    let buffer = ''
    let timeout = null

    const handleKeyPress = (e) => {
      // Hardware scanner biasanya mengirim karakter dengan cepat dan diakhiri Enter
      if (e.key === 'Enter') {
        if (buffer.trim().length > 0) {
          handleSuccessfulScan(buffer.trim())
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

  // Success handler with feedback
  const handleSuccessfulScan = (barcode) => {
    // Prevent duplicate scans within 1 second
    const now = Date.now()
    if (now - lastScanTimeRef.current < 1000) {
      console.log('⚠️ Duplicate scan prevented')
      return
    }
    lastScanTimeRef.current = now

    console.log('✅ BARCODE SCANNED:', barcode)
    setLastScanned(barcode)
    
    // Instant feedback
    // 1. Vibration (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(200) // 200ms vibration
    }
    
    // 2. Beep sound (optional - can be added later)
    // playBeepSound()
    
    // 3. Visual feedback (handled by UI with lastScanned state)
    
    onScan(barcode)
    
    // Auto-close after successful scan (optional)
    setTimeout(() => {
      stopScanner()
      stopNativeScanner()
      onClose()
    }, 500)
  }

  // Stop native scanner
  const stopNativeScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // ✅ OPTIMIZED NATIVE BARCODE DETECTOR (FAST!)
  const startNativeScanner = async () => {
    try {
      setError(null)
      setIsScanning(true)

      console.log('🚀 Starting NATIVE BarcodeDetector scanner (super fast!)...')

      // OPTIMIZED: Use lower resolution for faster processing
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Back camera
          width: { ideal: 640 },  // Lower resolution = faster!
          height: { ideal: 480 }, // Was 1920x1080, now 640x480
          focusMode: { ideal: 'continuous' }, // Auto-focus
        },
        audio: false
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Create BarcodeDetector
      const barcodeDetector = new window.BarcodeDetector({
        formats: [
          'ean_13', 'ean_8', 'upc_a', 'upc_e', // Common product barcodes
          'code_128', 'code_39', 'code_93',    // Industrial barcodes
          'qr_code',                            // QR codes
        ]
      })

      console.log('✅ BarcodeDetector created')

      // Create canvas for scanning (region of interest)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      // THROTTLED SCANNING: Only scan every 150ms instead of every frame
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
          return
        }

        try {
          // OPTIMIZATION: Only scan center region (region of interest)
          const video = videoRef.current
          const videoWidth = video.videoWidth
          const videoHeight = video.videoHeight
          
          // Define ROI: center 60% of frame (faster than full frame)
          const roiWidth = Math.floor(videoWidth * 0.6)
          const roiHeight = Math.floor(videoHeight * 0.6)
          const roiX = Math.floor((videoWidth - roiWidth) / 2)
          const roiY = Math.floor((videoHeight - roiHeight) / 2)
          
          canvas.width = roiWidth
          canvas.height = roiHeight
          
          // Draw ROI to canvas
          context.drawImage(
            video,
            roiX, roiY, roiWidth, roiHeight, // Source ROI
            0, 0, roiWidth, roiHeight        // Destination
          )

          // Detect barcodes in ROI
          const barcodes = await barcodeDetector.detect(canvas)
          
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue
            console.log('🎯 Native detector found barcode:', barcode)
            handleSuccessfulScan(barcode)
            stopNativeScanner()
          }
        } catch (detectError) {
          // Silently ignore detection errors
        }
      }, 150) // THROTTLE: Scan every 150ms instead of every frame (~7 FPS)

      console.log('✅ Native scanner fully started!')

    } catch (err) {
      console.error('❌ Native scanner error:', err)
      handleCameraError(err)
      setIsScanning(false)
    }
  }

  // Handle camera errors with user-friendly messages
  const handleCameraError = (err) => {
    if (err.name === 'NotAllowedError') {
      setError('🔴 IZIN KAMERA DITOLAK\n\n✔️ SOLUSI:\n1. Pengaturan HP → Privacy → Camera → Izinkan browser\n2. Atau reset izin: Pengaturan → Apps → Browser → Permissions → Camera → Reset\n3. Refresh halaman\n4. Coba lagi')
    } else if (err.name === 'NotFoundError') {
      setError('❌ KAMERA TIDAK DITEMUKAN\n\nDevice ini mungkin tidak punya kamera.')
    } else if (err.message?.includes('Camera API not available')) {
      setError('⚠️ KAMERA TIDAK DIDUKUNG\n\n📱 SOLUSI:\n1. Gunakan HTTPS (bukan HTTP)\n2. Atau gunakan Mode Manual untuk input barcode\n\nHTTP tidak support kamera di kebanyakan browser modern.')
    } else if (err.message?.includes('getUserMedia') || err.message?.includes('undefined')) {
      setError('⚠️ BROWSER TIDAK SUPPORT KAMERA\n\n📱 SOLUSI:\n1. Coba browser lain (Chrome/Safari)\n2. Update browser ke versi terbaru\n3. Atau gunakan Mode Manual')
    } else {
      setError('❌ SCANNER ERROR\n\n' + (err.message || 'Unknown error') + '\n\n💡 Gunakan Mode Manual untuk sementara')
    }
  }

  // ✅ FALLBACK: Html5Qrcode scanner (if native not available)
  const startScanner = async () => {
    // If native detector available, use it instead (much faster!)
    if (useNativeDetector) {
      return startNativeScanner()
    }

    // Fallback to Html5Qrcode
    try {
      setError(null)
      setIsScanning(true)

      console.log('=== STARTING HTML5-QRCODE FALLBACK SCANNER ===')

      // STEP 0: Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available. Please use HTTPS or try a different browser.')
      }

      // STEP 1: Test camera access directly first
      console.log('Step 1: Testing getUserMedia...')
      let testStream = null
      try {
        // OPTIMIZED: Lower resolution for faster processing
        testStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 800 },  // Reduced from 1280
            height: { ideal: 600 }  // Reduced from 720
          },
          audio: false
        })
        console.log('✅ getUserMedia works! Stream:', testStream)
        // Stop test stream
        testStream.getTracks().forEach(track => {
          console.log('Stopping track:', track)
          track.stop()
        })
      } catch (testErr) {
        console.error('❌ getUserMedia failed:', testErr.name, testErr.message)
        throw testErr
      }

      // STEP 2: Wait untuk DOM render
      console.log('Step 2: Waiting for DOM...')
      await new Promise(resolve => setTimeout(resolve, 300))

      const readerElement = document.getElementById('barcode-reader')
      if (!readerElement) {
        throw new Error('barcode-reader div not found')
      }
      console.log('✅ DOM ready:', readerElement)

      // STEP 3: Initialize Html5Qrcode
      console.log('Step 3: Creating Html5Qrcode instance...')
      const html5QrCode = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = html5QrCode
      console.log('✅ Html5Qrcode instance created')

      // STEP 4: Get cameras
      console.log('Step 4: Getting available cameras...')
      let devices = []
      try {
        devices = await Html5Qrcode.getCameras()
        console.log('✅ Cameras found:', devices)
      } catch (camErr) {
        console.warn('⚠️ getCameras failed, using default:', camErr.message)
        devices = [{ id: 'user', label: 'Default Camera' }]
      }

      // STEP 5: Select camera
      console.log('Step 5: Selecting camera...')
      let cameraId = devices[0]?.id || 'user'
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      if (backCamera) {
        cameraId = backCamera.id
        console.log('✅ Using back camera:', cameraId)
      } else {
        console.log('✅ Using default camera:', cameraId)
      }

      // STEP 6: Start scanner with OPTIMIZED config
      console.log('Step 6: Starting Html5Qrcode.start()...')
      const config = {
        fps: 7, // REDUCED from 10 for better performance
        qrbox: { width: 250, height: 150 }, // Region of interest
        aspectRatio: 1.777778,
        disableFlip: false,
      }

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          console.log('✅ BARCODE DETECTED:', decodedText)
          handleSuccessfulScan(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Silently ignore scanning errors
        }
      )

      console.log('✅✅✅ FALLBACK SCANNER FULLY STARTED ✅✅✅')

    } catch (err) {
      console.error('❌ SCANNER ERROR:', err)
      console.error('  Name:', err.name)
      console.error('  Message:', err.message)
      console.error('  Stack:', err.stack)

      handleCameraError(err)
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
      handleSuccessfulScan(barcode)
      e.target.value = ''
    }
  }

  const handleClose = () => {
    stopScanner()
    stopNativeScanner()
    onClose()
  }

  const changeScanMode = (mode) => {
    stopScanner()
    stopNativeScanner()
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
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
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
                onKeyDown={handleManualEntry}
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
                  
                  {/* Badge: Native vs Fallback */}
                  {useNativeDetector && (
                    <div className="inline-block mb-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      ⚡ Mode Cepat (Native API)
                    </div>
                  )}
                  
                  {/* Warning untuk HTTP */}
                  {typeof window !== 'undefined' && window.location.protocol === 'http:' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1') && (
                    <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-left">
                      <p className="text-xs text-yellow-800 font-bold mb-1">⚠️ PERHATIAN:</p>
                      <p className="text-xs text-yellow-700">Kamera tidak berfungsi di HTTP untuk keamanan. Gunakan Mode Manual atau deploy ke HTTPS.</p>
                    </div>
                  )}
                  
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
                  <p className="text-xs text-gray-400 mt-2">
                    ℹ️ Browser akan meminta izin kamera otomatis
                  </p>
                </div>
              ) : (
                <div>
                  {/* Video untuk Native Detector */}
                  {useNativeDetector ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg border-2 border-emerald-500"
                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                      />
                      {/* ROI Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3/5 h-3/5 border-4 border-emerald-400 rounded-lg shadow-lg">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* HTML5-QRCode Fallback */
                    <div
                      id="barcode-reader"
                      className="rounded-lg overflow-hidden border-2 border-emerald-500"
                      style={{ width: '100%', height: '250px' }}
                    />
                  )}
                  
                  <button
                    onClick={() => {
                      stopScanner()
                      stopNativeScanner()
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Berhenti Scan
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    🎯 Arahkan barcode ke dalam kotak hijau
                  </p>
                  {useNativeDetector && (
                    <p className="text-xs text-green-600 mt-1 text-center font-medium">
                      ⚡ Menggunakan teknologi deteksi cepat
                    </p>
                  )}
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
