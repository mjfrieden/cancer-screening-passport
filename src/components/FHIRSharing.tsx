import { useState } from 'react';
import { UserProfile, ScreeningEvent, Recommendation } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { FileJson, Share2, ShieldCheck, Zap, FileText, FileDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { trackTelemetry } from '../lib/telemetry';

interface FHIRSharingProps {
  profile: UserProfile;
  events: ScreeningEvent[];
  recommendations: Recommendation[];
}

export default function FHIRSharing({ profile, events, recommendations }: FHIRSharingProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Simple FHIR R4 Bundle Generator
  const generateFHIRBundle = () => {
    const bundle: any = {
      resourceType: "Bundle",
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: []
    };

    // Patient Resource
    bundle.entry.push({
      resource: {
        resourceType: "Patient",
        id: profile.userId,
        name: [{ text: profile.name }],
        birthDate: profile.dob,
        gender: profile.sexAssignedAtBirth === 'female' ? 'female' : 'male'
      }
    });

    // Screening Observations
    events.filter(event => event.status === 'completed' && event.careStatus !== 'completed').forEach(event => {
      bundle.entry.push({
        resource: {
          resourceType: "Observation",
          id: event.id,
          status: "final",
          code: {
            text: event.type + " cancer screening"
          },
          effectiveDateTime: event.date,
          valueString: event.result,
          note: [{ text: event.source === 'clinician_confirmed' ? 'Clinician-confirmed' : event.source === 'imported' ? 'Imported into patient-held record' : 'Patient-entered; not verified against the medical record' }],
          component: [
            {
              code: { text: "abnormal" },
              valueBoolean: event.isAbnormal
            }
          ]
        }
      });
    });

    return bundle;
  };

  const fhirBundle = generateFHIRBundle();
  const fhirString = JSON.stringify(fhirBundle);

  // For the QR code, we might want to trim it or just use a message if it's too big
  // Mode 1: Local Payload (trimmed)
  const qrData = JSON.stringify({
    type: "CS_PASSPORT_FHIR",
    v: "1.0",
    data: fhirBundle
  });

  const downloadJson = () => {
    trackTelemetry('export_fhir_json', {
      method: 'json',
      source: 'fhir_sharing',
    });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(fhirString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cancer_screening_passport.fhir.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      trackTelemetry('export_pdf_summary', {
        method: 'pdf',
        source: 'fhir_sharing',
      });
      const { generateScreeningPDF } = await import('../lib/pdfGenerator');
      generateScreeningPDF(profile, recommendations, events);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Structured Health Passport</h3>
        <p className="text-sm text-gray-500">Share a patient-held screening summary with clinicians via QR or FHIR-style JSON.</p>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl flex flex-col items-center"
      >
        <div className="bg-gray-50 p-4 rounded-2xl mb-6">
          <QRCodeSVG
            value={qrData}
            size={220}
            level="L"
            includeMargin={false}
          />
        </div>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold mb-4">
          <ShieldCheck className="w-4 h-4" />
          PATIENT-HELD EXPORT
        </div>
        <p className="text-[10px] text-center text-gray-400 max-w-[200px]">
          Clinicians can review this structured summary during intake or care planning.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={downloadJson}
          data-smoke="export-fhir-json"
          className="flex flex-col items-center gap-3 p-6 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all border border-blue-100"
        >
          <FileJson className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Export FHIR JSON</span>
        </button>
        <button
          className="flex flex-col items-center gap-3 p-6 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 opacity-50 cursor-not-allowed"
          title="Sharing link functionality coming soon"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Secure Link</span>
        </button>
      </div>

      {/* 🏥 Professional Clinician Export Card */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shrink-0 shadow-sm shadow-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-gray-900 leading-tight">
              Preparing for a Primary Care Visit?
            </h4>
            <p className="text-xs text-gray-500 leading-normal mt-1 max-w-lg">
              Download a consolidated clinician-friendly summary PDF. Includes demographic details, documented screening procedures, and guideline-inspired follow-up dates for shared review.
            </p>
          </div>
        </div>

        <button
          id="btn-generate-pdf-summary"
          onClick={downloadPdf}
          data-smoke="export-pdf-summary"
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-600/10 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:cursor-wait disabled:opacity-75"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          <span>{isGeneratingPdf ? 'Preparing PDF' : 'Save Physician PDF'}</span>
        </button>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold">Interoperability Pro-Tip</h4>
        </div>
        <p className="text-sm leading-relaxed text-blue-50/90">
          This QR code contains a compact patient-held summary. During a clinic visit, show it to your care team as a conversation aid, not as a substitute for official medical records.
        </p>
      </div>
    </div>
  );
}
