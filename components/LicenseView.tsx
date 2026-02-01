import React, { useState } from 'react';
import { ApplicationData, SimulationResult } from '../types';

interface Props {
  appData: ApplicationData;
  result: SimulationResult;
  onReset: () => void;
  onRetry: () => void;
}

const LicenseView: React.FC<Props> = ({ appData, result, onReset, onRetry }) => {
  const [isPreparing, setIsPreparing] = useState(false);

  const handleDownloadPDF = () => {
    setIsPreparing(true);
    setTimeout(() => {
        const originalTitle = document.title;
        const safeName = appData.businessName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
        document.title = `SWK_GOV_LICENSE_${safeName}`;
        window.print();
        document.title = originalTitle;
        setIsPreparing(false);
    }, 1200);
  };

  if (result.status === 'FLAGGED') {
      const parts = result.justification.split('---REMEDIATION---');
      const failures = parts[0].replace('CRITICAL FAILURE DETECTED:', '').trim();
      const remediation = parts[1] ? parts[1].trim() : '';

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950">
           <div className="bg-slate-900 border-2 border-red-600/50 w-full max-w-4xl p-6 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="bg-red-900/30 p-3 rounded-full border border-red-600/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-red-500 uppercase tracking-tighter">AI Audit: Application Rejected</h1>
                        <p className="text-slate-400 text-sm">Case Reference: SWK-{Math.floor(Math.random() * 99999)} • Verification System v4.0.2</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Part 1: Critical Failures */}
                    <div className="bg-slate-950/50 border border-red-900/30 p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-red-500 rounded p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                             </div>
                             <h3 className="text-sm font-black text-red-400 uppercase tracking-widest">Critical Failure Detected</h3>
                        </div>
                        <div className="font-mono text-sm text-red-100/80 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-red-900/40">
                            {failures}
                        </div>
                    </div>

                    {/* Part 2: Remediation */}
                    <div className="bg-slate-950/50 border border-cyan-900/30 p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-cyan-500 rounded p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                             </div>
                             <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">Recommended Remediation</h3>
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-cyan-900/40 italic">
                            {remediation || "Please contact the licensing officer for detailed feedback on this application."}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800 pt-8">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-black text-red-500">{result.score}%</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Compliance</div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800"></div>
                        <div className="text-slate-400 text-xs max-w-xs leading-tight">
                            Your application scored below the 80% mandatory threshold for automated processing.
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button onClick={onReset} className="flex-1 md:flex-none px-8 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-bold border border-slate-800">Discard</button>
                        <button onClick={onRetry} className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group transform active:scale-95">
                            Modify Application
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
           </div>
        </div>
      );
  }

  const licenseNum = `L/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950">
      {/* Official License Document Container */}
      <div className="bg-[#fdfcf0] text-black w-full max-w-2xl p-4 md:p-6 rounded shadow-2xl relative overflow-hidden print-container font-sans border-[3px] border-black">
        {/* Inner Thin Border for Double Line Effect */}
        <div className="border border-black p-6 md:p-10 h-full w-full relative">
            
            {/* Background Watermark Shield */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none p-10">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full max-w-sm">
                    <path d="M50 0L10 15V45C10 70 50 100 50 100C50 100 90 70 90 45V15L50 0ZM50 85L20 65V45L50 60L80 45V65L50 85Z" />
                </svg>
            </div>

            {/* Header: Logo & Title */}
            <div className="flex flex-col items-center mb-6 relative z-10">
                <div className="w-20 h-20 mb-2 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="45" fill="#1e3a8a" stroke="#d97706" strokeWidth="4" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="2 1" />
                        <path d="M30 40 L50 20 L70 40 L50 60 Z" fill="#d97706" />
                        <text x="50" y="82" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">TRADE LICENSE</text>
                    </svg>
                </div>
                <h3 className="text-slate-700 font-bold text-lg tracking-[0.2em] mb-4">SARAWAK GOV</h3>
                <h1 className="text-xl md:text-3xl font-black text-center tracking-tight leading-none mb-2">SARAWAK GOVERNMENT - TRADE LICENSE</h1>
                <div className="flex flex-col items-center gap-1">
                    <div className="h-[1px] w-48 bg-black/20"></div>
                    <span className="italic font-serif text-sm md:text-base text-slate-700">The Local Authority Ordinance, Sarawak</span>
                    <div className="h-[1px] w-48 bg-black/20"></div>
                </div>
            </div>

            {/* Data Rows */}
            <div className="grid grid-cols-1 gap-y-5 my-8 text-sm md:text-base relative z-10 font-mono">
                <div className="flex justify-between items-baseline border-b border-black/5 pb-1">
                    <span className="text-slate-600 font-sans">License No:</span>
                    <span className="font-bold text-lg">{licenseNum}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 pb-1">
                    <span className="text-slate-600 font-sans">Business Name:</span>
                    <span className="font-bold uppercase text-right max-w-[60%]">{appData.businessName}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 pb-1">
                    <span className="text-slate-600 font-sans">Licensee:</span>
                    <span className="font-bold uppercase text-right">{appData.applicantName}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 pb-1">
                    <span className="text-slate-600 font-sans">IC No:</span>
                    <span className="font-bold">{appData.icNumber}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 pb-1">
                    <span className="text-slate-600 font-sans">Premise:</span>
                    <span className="font-bold uppercase text-right max-w-[60%]">{appData.address}</span>
                </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="mt-12 flex justify-between items-end relative z-10">
                {/* Left: Dates */}
                <div className="space-y-1 text-[11px] md:text-xs font-bold">
                    <div className="flex gap-2">
                        <span className="text-slate-500 font-normal">Issued Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-slate-500 font-normal">Expiry Date:</span>
                        <span>{new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Center: Wax Seal */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-[#c2410c] rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,0.3),0_4px_10px_rgba(0,0,0,0.2)] border-2 border-[#9a3412] flex items-center justify-center p-3">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-[#9a3412] opacity-80">
                            <path d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M50 20 C60 20 70 30 70 50 C70 70 60 80 50 80 C40 80 30 70 30 50 C30 30 40 20 50 20" fill="none" stroke="currentColor" strokeWidth="2" />
                            <text x="50" y="55" textAnchor="middle" fontSize="6" fontWeight="bold" fill="currentColor">SARAWAK</text>
                        </svg>
                    </div>
                </div>

                {/* Right: Authentication */}
                <div className="flex items-center gap-4">
                    {/* QR Code */}
                    <div className="p-1 border border-black bg-white">
                        <div className="w-14 h-14 md:w-16 md:h-16 grid grid-cols-5 grid-rows-5 gap-0.5">
                            {Array.from({length: 25}).map((_,i) => (
                                <div key={i} className={`bg-black ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`}></div>
                            ))}
                        </div>
                    </div>
                    {/* Hologram Bird */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-300 to-slate-100 flex items-center justify-center shadow-inner overflow-hidden">
                        <svg viewBox="0 0 100 100" className="w-10 h-10 text-slate-500 opacity-60">
                             <path d="M20 50 Q50 20 80 50 Q50 80 20 50" fill="none" stroke="currentColor" strokeWidth="4" />
                             <circle cx="50" cy="50" r="10" fill="currentColor" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Action Buttons (Excluded from Print) */}
      <div className="mt-8 flex flex-col md:flex-row gap-4 no-print items-center">
        <button 
            onClick={handleDownloadPDF}
            disabled={isPreparing}
            className={`min-w-[240px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 group ${isPreparing ? 'opacity-70 cursor-wait' : ''}`}
        >
            {isPreparing ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Finalizing Credentials...</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Official PDF
                </>
            )}
        </button>

        <button 
            onClick={onReset}
            disabled={isPreparing}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg border border-slate-700 transition-all transform hover:scale-105 flex items-center gap-2 group disabled:opacity-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LicenseView;