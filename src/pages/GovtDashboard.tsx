import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  Search, 
  Check, 
  BrainCircuit,
  Map,
  FileSpreadsheet,
  Zap,
  ArrowLeftRight,
  MapPin,
  FileText,
  TrendingUp
} from 'lucide-react';

import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { KPIStat } from '../components/ui/KPIStat';
import { CityHeatmap } from '../components/map/CityHeatmap';
import { useComplaints } from '../context/ComplaintsContext';
import * as api from '../lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const GovtDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, analytics, refreshData } = useComplaints();
  
  // Tab states: 'overview' | 'registry' | 'predictive'
  const [activeTab, setActiveTab] = useState<'overview' | 'registry' | 'predictive'>('overview');
  
  // Registry Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Selected complaint details modal/sidebar
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  
  // Predictive data state
  const [predictiveData, setPredictiveData] = useState<api.PredictiveData | null>(null);
  const [isPredictiveLoading, setIsPredictiveLoading] = useState(false);

  // Fetch predictive analytics on load
  useEffect(() => {
    const fetchPredictive = async () => {
      try {
        setIsPredictiveLoading(true);
        const data = await api.getPredictiveAnalytics();
        setPredictiveData(data);
      } catch (err) {
        console.error("Error loading predictive data:", err);
      } finally {
        setIsPredictiveLoading(false);
      }
    };
    fetchPredictive();
  }, [complaints]);

  // Handle complaint status update
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateComplaint(id, newStatus);
      await refreshData(); // Refresh context complaints state
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket status.");
    }
  };

  // Handle complaint department reassignment
  const handleUpdateDept = async (id: string, newDept: string) => {
    try {
      await api.updateComplaint(id, undefined, newDept);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to re-route department.");
    }
  };

  // Selected complaint memo
  const selectedComplaint = useMemo(() => {
    return complaints.find(c => c.id === selectedComplaintId) || null;
  }, [selectedComplaintId, complaints]);

  // Filtered complaints for registry table
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = c.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.ward.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, searchQuery, selectedCategory, selectedStatus]);

  // Predictive Chart Data Mapping
  const chartData = useMemo(() => {
    if (!analytics || !predictiveData) return [];
    
    return Object.keys(analytics.category_counts).map(cat => ({
      category: cat,
      Current: analytics.category_counts[cat] || 0,
      Predicted: predictiveData.predictions[cat] || 0
    }));
  }, [analytics, predictiveData]);

  // Radar chart data mapping (Ward risk scores)
  const radarChartData = useMemo(() => {
    if (!predictiveData) return [];
    
    // Top 7 wards for visual spacing
    const topWards = Object.keys(predictiveData.ward_risk_scores).slice(0, 7);
    return topWards.map(w => ({
      ward: w,
      Risk: predictiveData.ward_risk_scores[w] || 30
    }));
  }, [predictiveData]);



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'SLA Breached': return 'bg-red-100 text-red-700 border border-red-200 animate-pulse';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow flex flex-col gap-6">
          
          {/* HEADER CONTROL */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cp-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cp-coral/10 text-cp-coral font-display font-bold text-label px-2.5 py-1 rounded-badge">
                  ADMINISTRATIVE CONTROL ROOM
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-cp-text-secondary bg-cp-surface-2 px-2.5 py-1 rounded">
                  <span className="w-1.5 h-1.5 bg-cp-teal rounded-full animate-ping"></span>
                  G2G Central Engine Active
                </span>
              </div>
              <h1 className="font-display text-display-md text-cp-text-primary tracking-tight font-extrabold mt-2">
                Smart Governance Operations
              </h1>
              <p className="text-body-sm text-cp-text-secondary mt-1">
                Real-time complaint routing, predictive analytics forecasts, and department load assignment.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary"
                onClick={() => navigate('/citizen')}
                icon={<ArrowLeftRight size={16} />}
              >
                Citizen Portal
              </Button>
            </div>
          </div>

          {/* METRIC OVERVIEW ROW */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPIStat
                label="Active Complaints"
                value={complaints.filter(c => c.status !== 'Resolved').length}
                unit="Tickets"
                trend="up"
                trendPct={4}
                icon={AlertCircle}
              />
              <KPIStat
                label="Avg SLA Resolution"
                value={analytics.avg_resolution_days}
                unit="Days"
                trend="down"
                trendPct={12}
                icon={Clock}
              />
              <KPIStat
                label="Breached Ratio"
                value={analytics.sla_breach_pct}
                unit="%"
                trend="down"
                trendPct={5}
                alertCondition={analytics.sla_breach_pct > 15}
                icon={AlertTriangle}
              />
              <KPIStat
                label="Department Workloads"
                value={Object.values(analytics.department_loads).reduce((a, b) => a + b, 0)}
                unit="Tasks"
                trend="neutral"
                trendPct={0}
                icon={Building2}
              />
            </div>
          )}

          {/* DASHBOARD TABS */}
          <div className="flex border-b border-cp-border gap-2 text-body-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-display font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'overview' 
                  ? 'border-cp-teal text-cp-teal' 
                  : 'border-transparent text-cp-text-secondary hover:text-cp-text-primary'
              }`}
            >
              <Map size={16} /> Live Operations Map
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className={`py-3 px-4 font-display font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'registry' 
                  ? 'border-cp-teal text-cp-teal' 
                  : 'border-transparent text-cp-text-secondary hover:text-cp-text-primary'
              }`}
            >
              <FileSpreadsheet size={16} /> Grievance Action Center
            </button>
            <button
              onClick={() => setActiveTab('predictive')}
              className={`py-3 px-4 font-display font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'predictive' 
                  ? 'border-cp-teal text-cp-teal' 
                  : 'border-transparent text-cp-text-secondary hover:text-cp-text-primary'
              }`}
            >
              <BrainCircuit size={16} /> Predictive Governance & AI Suggestions
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-grow flex flex-col justify-start">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: OPERATIONAL MAP */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow"
                >
                  <div className="lg:col-span-2 min-h-[480px] h-full flex flex-col">
                    <CityHeatmap complaints={complaints} />
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <Card className="border border-cp-border bg-white flex flex-col flex-grow">
                      <h3 className="font-display font-bold text-body-md text-cp-text-primary border-b border-cp-border pb-3 mb-3">
                        Department Operational Loads
                      </h3>
                      {analytics && (
                        <div className="space-y-4">
                          {Object.entries(analytics.department_loads).map(([dept, load]) => (
                            <div key={dept} className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-body-sm">
                                <span className="font-medium text-cp-text-primary">{dept}</span>
                                <span className="font-bold text-cp-teal bg-cp-teal-glow px-2 py-0.5 rounded text-[11px]">{load} Active</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-cp-teal h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, (load / 15) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                    
                    <Card className="border border-cp-border bg-slate-50 flex items-center justify-between p-4 rounded-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cp-teal/10 flex items-center justify-center text-cp-teal">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-body-sm text-cp-text-primary">Voice-Assisted Tickets</h4>
                          <p className="text-[11px] text-cp-text-secondary mt-0.5">Citizens filing via Speech API</p>
                        </div>
                      </div>
                      <span className="font-mono text-body-md font-bold text-cp-teal">Active</span>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ACTION REGISTRY */}
              {activeTab === 'registry' && (
                <motion.div
                  key="registry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-col lg:flex-row gap-6 flex-grow"
                >
                  {/* Registry main list */}
                  <Card className="border border-cp-border bg-white flex-grow flex flex-col p-4">
                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-3 items-center justify-between border-b border-cp-border pb-4 mb-4">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 text-cp-text-muted" size={16} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search tickets, wards, texts..."
                          className="bg-cp-base border border-cp-border rounded-btn pl-9 pr-3 py-1.5 text-body-sm w-full focus:outline-none focus:border-cp-teal focus:ring-1 focus:ring-cp-teal-glow"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="bg-cp-base border border-cp-border rounded-btn px-3 py-1.5 text-body-sm text-cp-text-primary focus:outline-none focus:border-cp-teal"
                        >
                          <option value="All">All Categories</option>
                          <option value="Road">Road</option>
                          <option value="Water">Water</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Sanitation">Sanitation</option>
                          <option value="Other">Other</option>
                        </select>

                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="bg-cp-base border border-cp-border rounded-btn px-3 py-1.5 text-body-sm text-cp-text-primary focus:outline-none focus:border-cp-teal"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Submitted">Submitted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="SLA Breached">SLA Breached</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto select-none">
                      <table className="w-full text-left border-collapse min-w-[650px]">
                        <thead>
                          <tr className="border-b border-cp-border text-label text-cp-text-secondary">
                            <th className="py-2.5 font-semibold">TICKET ID</th>
                            <th className="py-2.5 font-semibold">WARD</th>
                            <th className="py-2.5 font-semibold">GRIEVANCE DETAIL</th>
                            <th className="py-2.5 font-semibold">DEPARTMENT</th>
                            <th className="py-2.5 font-semibold">PRIORITY</th>
                            <th className="py-2.5 font-semibold">STATUS</th>
                            <th className="py-2.5 font-semibold text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cp-border/50 text-body-sm text-cp-text-primary">
                          {filteredComplaints.slice(0, 50).map((c) => (
                            <tr 
                              key={c.id} 
                              onClick={() => setSelectedComplaintId(c.id)}
                              className={`cursor-pointer hover:bg-cp-base/50 transition-colors ${selectedComplaintId === c.id ? 'bg-cp-teal-glow/30' : ''}`}
                            >
                              <td className="py-3 font-mono font-bold text-cp-teal text-[11px]">
                                UDAI-{c.id.toUpperCase()}
                              </td>
                              <td className="py-3 font-medium">{c.ward}</td>
                              <td className="py-3 max-w-[200px] truncate pr-4 text-cp-text-secondary">
                                {c.text}
                              </td>
                              <td className="py-3 text-cp-text-primary font-medium text-[12px]">{c.department}</td>
                              <td className="py-3">
                                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-badge ${
                                  c.priority_score >= 8 ? 'bg-red-50 text-red-600 border border-red-100' :
                                  c.priority_score >= 5 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                  'bg-slate-50 text-slate-500 border border-slate-100'
                                }`}>
                                  P{c.priority_score}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusBadge(c.status)}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-1 justify-end">
                                  {c.status !== 'Resolved' && (
                                    <>
                                      <button 
                                        onClick={() => handleUpdateStatus(c.id, 'In Progress')}
                                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                        title="Mark In Progress"
                                      >
                                        <Clock size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateStatus(c.id, 'Resolved')}
                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                        title="Mark Resolved"
                                      >
                                        <Check size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Sidebar detail inspector */}
                  <div className="w-full lg:w-96 flex-shrink-0">
                    {selectedComplaint ? (
                      <Card className="border-cp-border border bg-white flex flex-col gap-4 sticky top-24">
                        <div className="flex items-center justify-between border-b border-cp-border pb-3">
                          <div>
                            <span className="text-[10px] text-cp-teal font-mono font-bold">UDAI-{selectedComplaint.id.toUpperCase()}</span>
                            <h3 className="font-display font-bold text-body-md text-cp-text-primary mt-0.5">Ticket Inspector</h3>
                          </div>
                          <Badge status={selectedComplaint.status} />
                        </div>

                        
                        <div className="space-y-4 text-body-sm">
                          <div>
                            <span className="text-label text-cp-text-secondary block mb-1">GRIEVANCE DESCRIPTION</span>
                            <p className="bg-cp-base p-2.5 rounded border border-cp-border text-cp-text-primary leading-relaxed">
                              {selectedComplaint.text}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-label text-cp-text-secondary block mb-1">WARD LOCATION</span>
                              <span className="font-medium text-cp-text-primary flex items-center gap-1">
                                <MapPin size={14} className="text-cp-teal" /> {selectedComplaint.ward}
                              </span>
                            </div>
                            <div>
                              <span className="text-label text-cp-text-secondary block mb-1">AI SAFETY SCORE</span>
                              <span className="font-mono font-bold text-cp-coral text-[15px]">
                                {selectedComplaint.priority_score} / 10
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-label text-cp-text-secondary block mb-1">ASSIGNED DEPARTMENT</span>
                            <select
                              value={selectedComplaint.department}
                              onChange={(e) => handleUpdateDept(selectedComplaint.id, e.target.value)}
                              className="bg-cp-base border border-cp-border rounded-btn px-2.5 py-1.5 w-full text-body-sm font-semibold text-cp-text-primary focus:outline-none focus:border-cp-teal"
                            >
                              <option value="Public Works Department">Public Works Department</option>
                              <option value="Jal Board">Jal Board</option>
                              <option value="DISCOM">DISCOM</option>
                              <option value="Municipal Sanitation">Municipal Sanitation</option>
                              <option value="General">General Division</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-label text-cp-text-secondary block mb-1">AI ROUTING REASONING</span>
                            <p className="text-[11px] text-cp-text-secondary italic leading-relaxed">
                              "{selectedComplaint.reasoning}"
                            </p>
                          </div>

                          <div className="border-t border-cp-border pt-3 flex gap-2">
                            {selectedComplaint.status !== 'Resolved' && (
                              <Button 
                                size="sm" 
                                className="flex-grow !bg-emerald-600 hover:!bg-emerald-700 text-white"
                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'Resolved')}
                              >
                                Mark Resolved
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => navigate(`/timeline/${selectedComplaint.id}`)}
                            >
                              Timeline View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border border-cp-border bg-slate-50 border-dashed h-full flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                        <FileText size={32} className="text-cp-text-muted" />
                        <h4 className="font-display font-bold text-body-sm text-cp-text-primary mt-2">No Ticket Selected</h4>
                        <p className="text-[11px] text-cp-text-secondary max-w-[200px] mt-1">Select any complaint from the ledger list to inspect AI metrics and updates.</p>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PREDICTIVE GOVERNANCE */}
              {activeTab === 'predictive' && (
                <motion.div
                  key="predictive"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-col gap-6 flex-grow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* CHART 1: Workload Forecasting */}
                    <Card className="border border-cp-border bg-white p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-4 border-b border-cp-border pb-2">
                        <div>
                          <h3 className="font-display font-bold text-body-md text-cp-text-primary">Workload Trend Forecast</h3>
                          <p className="text-[10px] text-cp-text-secondary">Current Active vs Next Week Predicted</p>
                        </div>
                        <TrendingUp size={18} className="text-cp-teal" />
                      </div>
                      
                      <div className="h-[250px] w-full mt-2 font-mono text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="category" stroke="#64748B" />
                            <YAxis stroke="#64748B" />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Current" fill="#0D9488" name="Active Now" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Predicted" fill="#EF4444" name="Predicted Next Week" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* CHART 2: Ward Risk Radar Map */}
                    <Card className="border border-cp-border bg-white p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-4 border-b border-cp-border pb-2">
                        <div>
                          <h3 className="font-display font-bold text-body-md text-cp-text-primary">Ward SLA Breach Risk</h3>
                          <p className="text-[10px] text-cp-text-secondary">Predicted probability index by ward (0-100)</p>
                        </div>
                        <BrainCircuit size={18} className="text-cp-teal" />
                      </div>
                      
                      <div className="h-[250px] w-full mt-2 font-mono text-[10px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                            <PolarGrid stroke="#E2E8F0" />
                            <PolarAngleAxis dataKey="ward" stroke="#64748B" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" />
                            <Radar name="Risk Index" dataKey="Risk" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                            <Tooltip contentStyle={{ fontSize: 11 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                  </div>

                  {/* AI RECOMMENDATIONS CARD */}
                  <Card className="border border-cp-border bg-white p-5 flex flex-col relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-44 h-44 bg-cp-teal/5 rounded-full blur-3xl -z-0"></div>
                    
                    <div className="flex items-center gap-2.5 border-b border-cp-border pb-3.5 mb-4 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-cp-teal-glow flex items-center justify-center text-cp-teal">
                        <BrainCircuit size={20} className="animate-bounce" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-body-md text-cp-text-primary">
                          AI-Driven Proactive Governance Decisions
                        </h3>
                        <p className="text-[10px] text-cp-text-secondary">Actionable insights from Groq Llama 3.1 Advisory</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                      {isPredictiveLoading ? (
                        [...Array(3)].map((_, i) => (
                          <div key={i} className="bg-slate-50 border border-cp-border/60 p-4 rounded-card animate-pulse space-y-2">
                            <div className="w-24 h-4 bg-slate-200 rounded"></div>
                            <div className="w-full h-8 bg-slate-200 rounded"></div>
                          </div>
                        ))
                      ) : (
                        predictiveData?.proactive_suggestions.map((s, idx) => {
                          const parts = s.split(':');
                          const dept = parts[0] || 'Alert';
                          const desc = parts.slice(1).join(':') || s;
                          
                          return (
                            <div key={idx} className="bg-slate-50 hover:bg-cp-teal-glow/10 border border-cp-border/60 p-4 rounded-card hover:border-cp-teal/30 transition-all flex flex-col gap-2">
                              <span className="text-[11px] font-bold text-cp-teal uppercase tracking-wider font-display bg-cp-teal-glow px-2 py-0.5 rounded w-max">
                                {dept}
                              </span>
                              <p className="text-body-sm text-cp-text-primary font-medium leading-relaxed">
                                {desc.trim()}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </PageTransition>
    </AppLayout>
  );
};
export default GovtDashboard;
