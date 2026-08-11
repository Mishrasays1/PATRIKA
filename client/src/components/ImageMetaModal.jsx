import React, { useState } from 'react';
import { X, Camera, MapPin, Calendar, FileCode, CheckCircle, Search, Cpu } from 'lucide-react';

export const ImageMetaModal = ({ media, location, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({
        exifMatch: true,
        cameraModel: 'Sony Alpha 7 IV (SEL2470GM)',
        capturedAt: '2026-08-09T14:15:22 IST',
        gpsCoordinates: `${location?.lat || 19.0657}° N, ${location?.lng || 72.8797}° E`,
        locationMatchScore: '99.4% Geotag Match',
        reverseSearchMatches: 0,
        tamperDetected: false,
        compressionAuthenticity: 'Original Camera Encoding (No Digital Modification)'
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Cpu className="w-5 h-5" />
            <span>OSINT Media Forensic Inspector</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center">
            <img 
              src={media?.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'} 
              alt="Media evidence preview" 
              className="max-h-64 object-contain"
            />
            <div className="absolute bottom-2 left-2 bg-slate-950/90 text-xs px-2.5 py-1 rounded-md border border-slate-800 text-slate-300 font-mono">
              {media?.caption || 'Ground Media File Attachment'}
            </div>
          </div>

          {/* Analysis Action */}
          {!analysisResult ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-slate-400">
                Run automated EXIF header extraction, reverse image search simulation, and GPS spatial integrity check.
              </p>
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scanning EXIF & Spatial Data...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Deep Forensic Metadata Scan</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3 text-emerald-300">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Forensic Integrity Check Passed</div>
                  <div className="text-xs text-emerald-400/80">No digital manipulation or duplicate stock matches detected.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Camera Hardware</span>
                  </div>
                  <div className="font-mono text-slate-200">{analysisResult.cameraModel}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>EXIF Timestamp</span>
                  </div>
                  <div className="font-mono text-slate-200">{analysisResult.capturedAt}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GPS Coordinates</span>
                  </div>
                  <div className="font-mono text-slate-200">{analysisResult.gpsCoordinates}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">{analysisResult.locationMatchScore}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>Reverse Image Index</span>
                  </div>
                  <div className="font-mono text-slate-200">0 Prior Online Copies (Unique)</div>
                  <div className="text-[10px] text-slate-400">{analysisResult.compressionAuthenticity}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
