import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import anime from 'animejs';
import { 
  ArrowLeft, 
  Building2, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useReducedMotion } from '../hooks/useReducedMotion';
import * as api from '../lib/api';
import { Complaint, TimelineNode } from '../types';

export const TimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const lineRef = useRef<SVGLineElement>(null);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch individual complaint from SQLite backend
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await api.getComplaint(id);
        if (data) {
          setComplaint(data);
        } else {
          setError("Complaint ticket records are empty.");
        }
      } catch (err: any) {
        console.error("Error loading complaint detail:", err);
        setError("Grievance ticket not found in the Smart City registry.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  // 2. Defensive SVG Line drawing animation (using Anime.js)
  useEffect(() => {
    if (prefersReduced || loading || !complaint || !lineRef.current) return;
    
    const lineEl = lineRef.current;
    let length = 800; // Safe fallback path length
    
    try {
      if (typeof lineEl.getTotalLength === 'function') {
        length = lineEl.getTotalLength() || 800;
      }
    } catch (e) {
      console.warn("Could not read SVG path length, using fallback.", e);
    }

    // Initialize line styles for drawing
    lineEl.style.strokeDasharray = `${length}`;
    lineEl.style.strokeDashoffset = `${length}`;
    
    // Animate the stroke dashoffset of the vertical connector line
    anime({
      targets: lineEl,
      strokeDashoffset: 0,
      easing: 'easeOutQuad',
      duration: 1200,
      delay: 150
    });
  }, [prefersReduced, loading, complaint]);

  // Generate node list based on complaint metadata
  const nodes = React.useMemo<TimelineNode[]>(() => {
    if (!complaint) return [];
    
    // Defensive date formatter to prevent RangeError crashes
    const formattedDate = (isoString?: string, daysToAdd = 0) => {
      if (!isoString) return 'Pending Allocation';
      const dt = new Date(isoString);
      if (isNaN(dt.getTime())) return 'Pending Allocation';
      
      if (daysToAdd) dt.setDate(dt.getDate() + daysToAdd);
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const compId = complaint.id ? String(complaint.id).toUpperCase() : 'UNKNOWN';

    return [
      {
        status: 'Submitted',
        title: 'Complaint Logged',
        timestamp: formattedDate(complaint.timestamp),
        description: 'Grievance submitted via Smart City portal by citizen.',
        details: {
          complainantId: `UDAI-${compId}`,
          ward: complaint.ward || 'Udaipur Central'
        }
      },
      {
        status: 'Classified',
        title: 'AI Inspection Completed',
        timestamp: formattedDate(complaint.timestamp),
        description: 'Categorization and safety analysis completed by Groq Llama AI.',
        details: {
          category: complaint.category,
          priority_score: complaint.priority_score,
          reasoning: complaint.reasoning || 'Automated category analysis.'
        }
      },
      {
        status: 'Routed',
        title: 'Assigned and Scheduled',
        timestamp: formattedDate(complaint.timestamp),
        description: 'Dispatched to specialized civic engineering division.',
        details: {
          department: complaint.department || 'Municipal Corporation General',
          sla_deadline: formattedDate(complaint.timestamp, complaint.resolution_days || 5)
        }
      },
      {
        status: 'In Progress',
        title: 'Dispatch Ground Operations',
        timestamp: complaint.status !== 'Submitted' ? formattedDate(complaint.timestamp) : undefined,
        description: 'Maintenance engineer has acknowledged the ticket and is on-site.',
        details: {
          assignee: 'Er. Rajesh Sharma (Field Lead)',
          last_updated: formattedDate(complaint.timestamp)
        }
      },
      {
        status: 'Resolved',
        title: 'Resolution Finalized',
        timestamp: complaint.status === 'Resolved' ? formattedDate(complaint.timestamp, (complaint.resolution_days || 4) - 1) : undefined,
        description: 'Infrastructure restored. Citizen verification pending.',
      }
    ];
  }, [complaint]);

  // Determine current active node index
  const activeNodeIndex = React.useMemo(() => {
    if (!complaint) return -1;
    switch (complaint.status) {
      case 'Submitted': return 0;
      case 'In Progress': return 3;
      case 'SLA Breached': return 3; // Stays in progress, flagged
      case 'Resolved': return 4;
      default: return 2; // Default routed state
    }
  }, [complaint]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-grow flex flex-col items-center justify-center text-cp-teal gap-3 bg-cp-base">
          <Loader2 className="animate-spin h-10 w-10" />
          <span className="font-display font-medium text-body-md tracking-wider">Locating ticket audit logs...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !complaint) {
    return (
      <AppLayout>
        <div className="flex-grow flex items-center justify-center p-6 bg-cp-base">
          <Card className="border border-cp-coral/30 max-w-md w-full bg-cp-coral/5 flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="text-cp-coral" size={48} />
            <h2 className="font-display font-bold text-body-lg text-cp-coral">Ticket Registry Error</h2>
            <p className="text-body-sm text-cp-text-secondary leading-relaxed">
              {error || "Could not load complaint details."}
            </p>
            <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-3xl mx-auto w-full px-6 py-12 flex-grow flex flex-col justify-start">
          
          {/* Back Action Bar */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              icon={<ArrowLeft size={16} />}
              aria-label="Back to Command Center"
            />
            <h1 className="font-display text-display-md text-cp-text-primary tracking-tight font-extrabold">
              Ticket Audit Timeline
            </h1>
          </div>

          {/* HEADER SUMMARY CARD */}
          <Card className="border border-cp-border mb-10 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Badge category={complaint.category} />
                <Badge status={complaint.status} pill />
              </div>
              <span className="text-body-sm font-semibold text-cp-text-secondary font-mono bg-cp-surface-2 px-2.5 py-1 rounded">
                Ward: {complaint.ward || 'Udaipur Central'}
              </span>
            </div>
            
            <p className="text-body-lg text-cp-text-primary font-body border-t border-cp-border/30 pt-4 leading-relaxed">
              "{complaint.text}"
            </p>
          </Card>

          {/* AUDIT TIMELINE TRACK */}
          <div className="relative pl-10 md:pl-12">
            
            {/* SVG Connector Line */}
            <svg 
              className="absolute left-3 top-2.5 h-full w-[2px] z-0 overflow-visible" 
              aria-hidden="true"
            >
              <line
                ref={lineRef}
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="#1E3A52" // cp-border
                strokeWidth="2"
                id="timeline-svg-line"
              />
            </svg>

            {/* Timeline Nodes */}
            <div className="flex flex-col gap-10 relative z-10">
              {nodes.map((node, idx) => {
                const isActive = idx <= activeNodeIndex;
                const isCurrent = idx === activeNodeIndex;
                const isDimmed = !isActive && !isCurrent;

                return (
                  <motion.div
                    key={idx}
                    custom={idx}
                    initial={prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: prefersReduced ? 0 : 0.2 + idx * 0.3,
                      duration: 0.3,
                      ease: 'easeOut',
                    }}
                    className={`flex flex-col md:flex-row gap-4 relative items-start ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
                  >
                    
                    {/* Circle Node Pin */}
                    <div className="absolute -left-10 md:-left-12 mt-1.5 flex items-center justify-center">
                      {isCurrent ? (
                        <div className="relative flex items-center justify-center w-6 h-6">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-cp-teal/30 animate-radar-ping"></span>
                          <span className="relative rounded-full h-3.5 w-3.5 bg-cp-teal border-2 border-cp-base"></span>
                        </div>
                      ) : (
                        <span 
                          className={`
                            rounded-full h-4.5 w-4.5 border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-150
                            ${isActive 
                              ? 'bg-cp-teal/20 border-cp-teal' 
                              : 'bg-cp-surface border-cp-border'
                            }
                          `}
                        >
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cp-teal" />}
                        </span>
                      )}
                    </div>

                    {/* Timeline Card Content */}
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex flex-wrap justify-between items-baseline gap-2">
                        <h3 className="font-display font-semibold text-body-md text-cp-text-primary">
                          {node.title}
                        </h3>
                        {node.timestamp && (
                          <span className="text-mono-sm text-cp-text-muted text-[11px] font-mono">
                            {node.timestamp}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-body-sm text-cp-text-secondary leading-relaxed">
                        {node.description}
                      </p>

                      {/* Render Expanded Specific Node Cards */}
                      {isActive && node.details && (
                        <Card className="bg-cp-surface-2/60 border border-cp-border/50 p-3 mt-1.5 font-body flex flex-col gap-2 shadow-inner">
                          
                          {/* Submission Details */}
                          {node.status === 'Submitted' && node.details.complainantId && (
                            <div className="flex flex-col gap-1 text-body-sm">
                              <div className="flex justify-between items-center text-[12px]">
                                <span className="text-cp-text-secondary">Complainant ID:</span>
                                <span className="text-cp-text-primary font-mono font-semibold">{node.details.complainantId}</span>
                              </div>
                              <div className="flex justify-between items-center text-[12px]">
                                <span className="text-cp-text-secondary">Assigned Ward:</span>
                                <span className="text-cp-text-primary font-semibold">{node.details.ward}</span>
                              </div>
                            </div>
                          )}

                          {/* AI Classification Details */}
                          {node.status === 'Classified' && node.details.priority_score !== undefined && (
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between gap-4 border-b border-cp-border/40 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] text-cp-text-secondary">Category:</span>
                                  {node.details.category && <Badge category={node.details.category as any} className="!text-[10px] !px-1.5 !py-0.5" />}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] text-cp-text-secondary">Severity:</span>
                                  <span className="text-body-sm font-bold" style={{ color: node.details.priority_score <= 3 ? '#00CED1' : node.details.priority_score <= 6 ? '#F59E0B' : '#EF4444' }}>
                                    {node.details.priority_score} / 10
                                  </span>
                                </div>
                              </div>
                              <div className="font-mono text-mono-sm text-cp-text-secondary leading-relaxed">
                                <span className="text-cp-teal font-semibold block mb-0.5 font-display text-[11px] uppercase tracking-wider">Groq reasoning output:</span>
                                "{node.details.reasoning}"
                              </div>
                            </div>
                          )}

                          {/* Routing Details */}
                          {node.status === 'Routed' && node.details.department && (
                            <div className="flex flex-col gap-1.5 text-body-sm">
                              <div className="flex items-center gap-2 text-[12px]">
                                <Building2 size={14} className="text-cp-teal" />
                                <span className="text-cp-text-secondary">Dispatched Dept:</span>
                                <span className="text-cp-text-primary font-semibold">{node.details.department}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[12px]">
                                <Calendar size={14} className="text-cp-text-muted" />
                                <span className="text-cp-text-secondary">SLA Resolution Deadline:</span>
                                <span className="text-cp-text-primary font-semibold">{node.details.sla_deadline}</span>
                              </div>
                            </div>
                          )}

                          {/* Assignee Details */}
                          {node.status === 'In Progress' && node.details.assignee && (
                            <div className="flex flex-col gap-1.5 text-body-sm">
                              <div className="flex items-center gap-2 text-[12px]">
                                <User size={14} className="text-cp-teal" />
                                <span className="text-cp-text-secondary">Assigned Lead:</span>
                                <span className="text-cp-text-primary font-semibold">{node.details.assignee}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[12px]">
                                <Clock size={14} className="text-cp-text-muted" />
                                <span className="text-cp-text-secondary">Last Field Status Update:</span>
                                <span className="text-cp-text-primary font-semibold">{node.details.last_updated}</span>
                              </div>
                            </div>
                          )}

                        </Card>
                      )}

                    </div>

                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </PageTransition>
    </AppLayout>
  );
};
export default TimelinePage;
