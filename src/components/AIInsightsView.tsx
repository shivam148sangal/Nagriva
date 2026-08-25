import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Droplets,
  Activity,
  Layers,
  ArrowRight,
  Info,
  MapPin,
  Building2,
  Zap,
  Trash2
} from 'lucide-react';
import { HotspotPrediction } from '../types';
import { Language, translations } from '../utils/translations';

interface AIInsightsViewProps {
  hotspots: HotspotPrediction[];
  language: Language;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  hotspots,
  language,
}) => {
  const t = translations[language];

  const demoInsights = [
    {
      id: 'ins-1',
      type: 'surge',
      icon: Droplets,
      title: 'Water Supply Grievance Surge (+28%)',
      titleHi: 'पेयजल शिकायतों में 28% की वृद्धि',
      description: 'Drinking water pipeline bursts and handpump failure complaints rose 28% this month across Sundarpur Ward 2 and Kalyanpur. High risk of waterborne illness.',
      descriptionHi: 'सुंदरपुर वार्ड 2 एवं कल्याणपुर में पाइपलाइन टूटने व हैंडपंप खराब होने की शिकायतों में 28% उछाल आया है।',
      department: 'Jal Jeevan & Water Dept',
      urgency: 'High',
    },
    {
      id: 'ins-2',
      type: 'road',
      icon: Layers,
      title: 'Road Surface Degradation Hotspot (Ward 3 & 5)',
      titleHi: 'सड़क गड्ढों का हॉटस्पॉट (वार्ड 3 व 5, रामपुर)',
      description: 'Ward 5 and Main Bazaar road in Rampur Gram Panchayat registered 4 duplicate pothole reports in the last 7 days following heavy vehicular transport.',
      descriptionHi: 'रामपुर मुख्य बाजार मार्ग पर पिछले 7 दिनों में भारी वाहनों के कारण 4 समान गड्ढों की शिकायतें दर्ज हुई हैं।',
      department: 'PWD Road Infrastructure',
      urgency: 'Medium',
    },
    {
      id: 'ins-3',
      type: 'power',
      icon: Zap,
      title: 'Transformer Overload Warning (Belur Agricultural Feeder)',
      titleHi: 'ट्रांसफार्मर ओवरलोड चेतावनी (बेलूर कृषि फीडर)',
      description: 'Predictive load analysis indicates agricultural tubewell power draw exceeds 100kVA capacity during summer sowing. Preventive phase load balancing required.',
      descriptionHi: 'ग्रीष्मकालीन बुवाई के दौरान 100kVA ट्रांसफार्मर पर भार अधिक पाया गया है। प्रिवेंटिव फेज बैलेंसिंग की आवश्यकता है।',
      department: 'Rural Electricity Board',
      urgency: 'High',
    },
    {
      id: 'ins-4',
      type: 'sanitation',
      icon: Trash2,
      title: 'Monsoon Drainage Siltation Vulnerability',
      titleHi: 'मानसून पूर्व नाली गाद निस्तारण चेतावनी',
      description: 'Drainage blockage reports in Kalyanpur Ward 1 show 60% silting in the eastern stormwater canal. Pre-monsoon desilting recommended to prevent waterlogging.',
      descriptionHi: 'कल्याणपुर वार्ड 1 की पूर्वी नाली में 60% तक गाद जमा होने का अनुमान है। जलभराव रोकने हेतु सफाई आवश्यक है।',
      department: 'Swachh Bharat & Sanitation',
      urgency: 'Medium',
    },
  ];

  const getRiskBadge = (risk: 'High' | 'Medium' | 'Low') => {
    switch (risk) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-indigo-900 text-white rounded-xl p-6 sm:p-7 shadow-sm border border-indigo-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-semibold mb-2">
            <Sparkles size={13} className="text-indigo-300" />
            <span>AI Predictive Governance & Early Warning System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t.hotspotsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
            {t.hotspotsSubtitle}
          </p>
        </div>

        <div className="bg-indigo-800/60 border border-indigo-700 px-4 py-2.5 rounded-lg text-xs text-indigo-200 flex items-center gap-2">
          <Info size={16} className="text-indigo-300 shrink-0" />
          <span>Machine Learning Simulation</span>
        </div>
      </div>

      {/* AI Key Insights Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-600" />
            <span>AI Macro Insights & Incident Patterns</span>
          </h3>
          <span className="text-xs text-slate-400">4 Active Proactive Alerts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoInsights.map(ins => {
            const Icon = ins.icon;
            return (
              <div
                key={ins.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {language === 'hi' ? ins.titleHi : ins.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">{ins.department}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    ins.urgency === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ins.urgency} Urgency
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'hi' ? ins.descriptionHi : ins.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Predictive Village Risk Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-700">
              Gram Panchayat Proactive Risk Assessment (30-Day Outlook)
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Forecast
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Seasonality & Asset Health Model
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {hotspots.map((h, idx) => (
            <div key={idx} className="p-5 sm:p-6 space-y-4 hover:bg-slate-50/50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{h.village}</h4>
                    <span className="text-xs text-slate-500">{h.block} Tehsil</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Panchayat Risk Level:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${getRiskBadge(h.overallRisk)}`}>
                    {h.overallRisk}
                  </span>
                </div>
              </div>

              {/* Sector Risk Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">💧 Water Risk</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${getRiskBadge(h.waterRisk)}`}>
                    {h.waterRisk}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">🛣️ Road Risk</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${getRiskBadge(h.roadRisk)}`}>
                    {h.roadRisk}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">⚡ Power Risk</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${getRiskBadge(h.electricityRisk)}`}>
                    {h.electricityRisk}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">🧹 Sanitation</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${getRiskBadge(h.sanitationRisk)}`}>
                    {h.sanitationRisk}
                  </span>
                </div>
              </div>

              {/* Prediction & Recommended Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                  <span className="font-bold text-amber-900 uppercase text-[10px] tracking-widest block">
                    Predicted Failure (Next 30 Days)
                  </span>
                  <p className="text-amber-950 font-medium leading-relaxed">
                    {h.predictedIssueNext30Days}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                  <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-widest block">
                    Recommended Preventive Action
                  </span>
                  <p className="text-emerald-950 font-medium leading-relaxed">
                    {h.recommendedPreventiveAction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
