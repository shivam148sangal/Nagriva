import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Eye,
  Info
} from 'lucide-react';
import { Complaint } from '../types';
import { Language, translations } from '../utils/translations';
import { LeafletMap } from './LeafletMap';

interface GISProblemMapProps {
  complaints: Complaint[];
  language: Language;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const GISProblemMap: React.FC<GISProblemMapProps> = ({
  complaints,
  language,
  onSelectComplaint,
}) => {
  const t = translations[language];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');

  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;
    if (selectedVillage !== 'all' && !c.location.village.toLowerCase().includes(selectedVillage.toLowerCase())) return false;
    return true;
  });

  const criticalCount = filteredComplaints.filter(c => c.priority === 'Critical').length;
  const highCount = filteredComplaints.filter(c => c.priority === 'High').length;
  const duplicateClustersCount = filteredComplaints.filter(c => c.aiAnalysis?.duplicateInfo?.isDuplicate).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
            <MapPin size={13} />
            <span>Geospatial Information System (GIS)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t.gisTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {t.gisSubtitle}
          </p>
        </div>

        {/* Map Summary Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Active Markers</span>
            <span className="text-lg font-bold text-white">{filteredComplaints.length}</span>
          </div>
          <div className="bg-rose-950/60 px-3 py-2 rounded-xl border border-rose-800 text-center">
            <span className="text-[10px] text-rose-300 font-semibold uppercase block">Critical Hazards</span>
            <span className="text-lg font-bold text-rose-400">{criticalCount}</span>
          </div>
          <div className="bg-amber-950/60 px-3 py-2 rounded-xl border border-amber-800 text-center">
            <span className="text-[10px] text-amber-300 font-semibold uppercase block">Geo Clusters</span>
            <span className="text-lg font-bold text-amber-400">{duplicateClustersCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter size={15} className="text-slate-500" />
          <span>GIS Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">{t.filterCategory}</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Roads">Roads</option>
            <option value="Electricity">Electricity</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Street Lights">Street Lights</option>
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">{t.filterPriority}</option>
            <option value="Critical">Critical (Red Pin)</option>
            <option value="High">High (Orange Pin)</option>
            <option value="Medium">Medium (Amber Pin)</option>
            <option value="Low">Low (Green Pin)</option>
          </select>

          {/* Village */}
          <select
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">{t.filterVillage}</option>
            <option value="Rampur">Rampur Gram Panchayat</option>
            <option value="Sundarpur">Sundarpur Gram Panchayat</option>
            <option value="Belur">Belur Gram Panchayat</option>
            <option value="Kalyanpur">Kalyanpur Gram Panchayat</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden p-2">
        <LeafletMap
          complaints={filteredComplaints}
          language={language}
          onComplaintClick={onSelectComplaint}
          height="540px"
        />
      </div>

      {/* Map Hotspot Callout */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
        <Info size={18} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>GIS Spatial Clustering Active:</strong> OpenStreetMap layer continuously analyzes Euclidean and road network distance between reports. Clicking any marker shows grievance details, photos, and priority classifications.
        </div>
      </div>
    </div>
  );
};
