import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonBlock } from '../components/ui/Skeleton';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useClassify } from '../hooks/useClassify';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useComplaints } from '../context/ComplaintsContext';

const WARD_OPTIONS = [
  "Chetak Circle",
  "Hiran Magri",
  "Bhupalpura",
  "Sukhadia Circle",
  "Fateh Sagar",
  "Ambamata",
  "Hathi Pol",
  "Surajpole",
  "City Station",
  "Sector 4",
  "Sector 11",
  "Sector 14",
  "Mallatalai",
  "Shobhagpura",
  "Sajjan Nagar",
  "Goverdhan Vilas",
  "Panchwati"
];

const MOCK_VOICE_COMPLAINTS = [
  "There is a major water pipeline burst near Hathi Pol. Water is flooding the street and blocking traffic.",
  "Streetlights are completely out of order in Hiran Magri Sector 11. The lane is pitch dark and unsafe.",
  "A huge pothole has formed in the middle of the road at Chetak Circle, causing severe traffic delays.",
  "Garbage piles have not been cleared for a week near Bhupalpura main market. It smells terrible.",
  "Unsafe electric wires are hanging low from the transformer near Sukhadia Circle."
];

export const IntakePage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const { addComplaint } = useComplaints();
  const { state, result, error, classify, reset } = useClassify();

  // Form states
  const [text, setText] = useState('');
  const [selectedWard, setSelectedWard] = useState('Chetak Circle');
  
  // Voice simulation
  const [isListening, setIsListening] = useState(false);

  // Staged reveal flags
  const [stages, setStages] = useState({
    category: false,
    progress: false,
    reasoning: false,
    dept: false,
    days: false,
  });

  // Saved complaint output from context
  const [savedComplaintId, setSavedComplaintId] = useState<string | null>(null);

  // Trigger staged reveal sequence when classification completes
  useEffect(() => {
    if (state === 'success' && result) {
      if (prefersReduced) {
        setStages({
          category: true,
          progress: true,
          reasoning: true,
          dept: true,
          days: true,
        });
        
        // Save complaint to DB immediately in reduced motion
        addComplaint(text, result, selectedWard).then((saved) => {
          setSavedComplaintId(saved.id);
        });
        return;
      }

      setStages({
        category: false,
        progress: false,
        reasoning: false,
        dept: false,
        days: false,
      });

      // Sequential delays: t=0ms, t=250ms, t=500ms, t=750ms, t=1000ms
      const t1 = setTimeout(() => setStages(s => ({ ...s, category: true })), 0);
      const t2 = setTimeout(() => setStages(s => ({ ...s, progress: true })), 250);
      const t3 = setTimeout(() => setStages(s => ({ ...s, reasoning: true })), 500);
      const t4 = setTimeout(() => setStages(s => ({ ...s, dept: true })), 750);
      const t5 = setTimeout(() => {
        setStages(s => ({ ...s, days: true }));
        // Save to DB when final stage starts to reveal
        addComplaint(text, result, selectedWard).then((saved) => {
          setSavedComplaintId(saved.id);
        });
      }, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    } else {
      setStages({
        category: false,
        progress: false,
        reasoning: false,
        dept: false,
        days: false,
      });
      setSavedComplaintId(null);
    }
  }, [state, result, prefersReduced]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length > 1000) return;
    try {
      await classify(text, selectedWard);
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Voice Dictation Input
  const handleVoiceInput = () => {
    if (isListening) return;
    setIsListening(true);
    
    // Choose a random Udaipur complaint
    const randomCom = MOCK_VOICE_COMPLAINTS[Math.floor(Math.random() * MOCK_VOICE_COMPLAINTS.length)];
    
    // Simulate typing after 2 seconds
    setTimeout(() => {
      setText(randomCom);
      setIsListening(false);
      // Auto-extract ward if template contains it
      const matchedWard = WARD_OPTIONS.find(w => randomCom.includes(w));
      if (matchedWard) {
        setSelectedWard(matchedWard);
      }
    }, 2000);
  };

  const handleResetForm = () => {
    setText('');
    reset();
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-3xl mx-auto w-full px-6 py-12 flex-grow flex flex-col justify-start">
          
          {/* Header Bar */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/')}
              icon={<ArrowLeft size={16} />}
              aria-label="Back to home"
            />
            <h1 className="font-display text-display-md text-cp-text-primary tracking-tight">
              Intake Portal
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* INPUT SECTION CARD */}
            <Card className="border border-cp-border">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Ward selector */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="ward-select" className="text-label text-cp-text-secondary">
                    Grievance Location (Udaipur Ward)
                  </label>
                  <select
                    id="ward-select"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={state === 'loading'}
                    className="w-full bg-cp-base border border-cp-border hover:border-cp-teal/50 text-cp-text-primary rounded-btn px-4 py-2.5 font-body text-body-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal outline-none disabled:opacity-50"
                  >
                    {WARD_OPTIONS.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward} Ward
                      </option>
                    ))}
                  </select>
                </div>

                {/* Complaint Text Area */}
                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center">
                    <label htmlFor="complaint-textarea" className="text-label text-cp-text-secondary">
                      Describe the Issue
                    </label>
                    <span className={`text-label font-mono ${text.length > 1000 ? 'text-cp-coral font-bold' : 'text-cp-text-muted'}`}>
                      {text.length} / 1000
                    </span>
                  </div>
                  <textarea
                    id="complaint-textarea"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={state === 'loading'}
                    placeholder="Enter details here (e.g. 'Streetlight not working near Surajpole for 4 days...')"
                    className="w-full bg-cp-base border border-cp-border text-cp-text-primary rounded-btn p-4 font-body text-body-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal outline-none disabled:opacity-50 transition-colors placeholder:text-cp-text-muted resize-none"
                  />
                </div>

                {/* Action Row */}
                <div className="flex gap-4">
                  {/* Mock Dictation Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleVoiceInput}
                    disabled={state === 'loading' || isListening}
                    icon={isListening ? <MicOff size={18} className="text-cp-coral animate-pulse" /> : <Mic size={18} />}
                    className="flex-shrink-0"
                    aria-label="Dictate complaint"
                  >
                    {isListening ? 'Listening...' : 'Voice Dictate'}
                  </Button>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!text.trim() || text.length > 1000 || state === 'loading'}
                    loading={state === 'loading'}
                    className="flex-grow font-bold"
                  >
                    Analyze Grievance
                  </Button>
                </div>

              </form>
            </Card>

            {/* INTERACTIVE STATE REVEALS */}
            <AnimatePresence mode="wait">
              
              {/* 1. Loading Skeleton Screen */}
              {state === 'loading' && (
                <motion.div
                  key="loading-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-cp-border bg-cp-surface/50">
                    <span className="text-label text-cp-teal animate-pulse mb-4 block">AI Engine Reasoning...</span>
                    <SkeletonBlock lines={5} />
                  </Card>
                </motion.div>
              )}

              {/* 2. Error Card */}
              {state === 'error' && (
                <motion.div
                  key="error-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-cp-coral/30 bg-cp-coral/5 text-cp-text-primary flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-cp-coral flex-shrink-0" size={24} />
                      <div>
                        <h3 className="font-display font-bold text-body-md text-cp-coral">
                          Analysis Pipeline Interrupted
                        </h3>
                        <p className="text-body-sm text-cp-text-secondary mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="secondary" size="sm" onClick={handleResetForm}>
                        Clear
                      </Button>
                      <Button size="sm" onClick={handleSubmit}>
                        Retry Classification
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* 3. Successful Classification Staged Output */}
              {state === 'success' && result && (
                <motion.div
                  key="success-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <Card className="border border-cp-border flex flex-col gap-6 relative">
                    
                    {/* Top row: Category Badge (slides in from left) */}
                    <div className="flex justify-between items-start">
                      <AnimatePresence>
                        {stages.category && (
                          <motion.div
                            initial={prefersReduced ? {} : { opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Badge category={result.category} className="!text-body-sm" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <span className="text-label text-cp-text-muted">Model: Llama-3.3-70B-Versatile</span>
                    </div>

                    {/* Middle: Score CircularProgress and reasoning */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-b border-cp-border/50 py-6">
                      {/* Priority Score circular ring */}
                      <div className="md:col-span-3 flex flex-col items-center gap-2">
                        <AnimatePresence>
                          {stages.progress && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col items-center"
                            >
                              <CircularProgress value={result.priority_score} />
                              <span className="text-label text-cp-text-secondary mt-2">Priority Score</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* AI Reasoning */}
                      <div className="md:col-span-9">
                        <AnimatePresence>
                          {stages.reasoning && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-cp-surface-2 border border-cp-border rounded p-4 font-mono text-mono-sm text-cp-text-secondary"
                            >
                              <span className="text-cp-teal font-semibold block mb-1">Reasoning Trail:</span>
                              "{result.reasoning || result.priority_reasoning}"
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Bottom: Department routing chip and estimated days */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      
                      {/* Department Chip (slides in from right) */}
                      <AnimatePresence>
                        {stages.dept && (
                          <motion.div
                            initial={prefersReduced ? {} : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2 text-body-sm text-cp-text-primary font-semibold"
                          >
                            <Building2 className="text-cp-teal" size={18} />
                            <span>Routed to:</span>
                            <span className="bg-cp-base border border-cp-border px-2.5 py-1 rounded text-cp-teal font-display">
                              {result.department}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Resolution days estimate (fades up) */}
                      <AnimatePresence>
                        {stages.days && (
                          <motion.div
                            initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2 text-body-sm text-cp-text-secondary"
                          >
                            <Clock size={16} className="text-cp-text-muted" />
                            <span>Estimated Resolution:</span>
                            <span className="text-cp-text-primary font-semibold font-mono">
                              {result.resolution_days || result.estimated_resolution_days} Days
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>

                  </Card>

                  {/* Submission Success Alert */}
                  {savedComplaintId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border border-status-resolved/30 bg-status-resolved/5 text-cp-text-primary flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-status-resolved" size={20} />
                          <div>
                            <span className="font-semibold block text-body-sm">Grievance Registered Successfully</span>
                            <span className="text-body-sm text-cp-text-secondary mt-0.5">Ticket ID: #{savedComplaintId}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={handleResetForm}>
                            File Another
                          </Button>
                          <Button size="sm" onClick={() => navigate(`/timeline/${savedComplaintId}`)}>
                            Track Complaint
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                </motion.div>
              )}

            </AnimatePresence>

          </div>

        </div>
      </PageTransition>
    </AppLayout>
  );
};
export default IntakePage;
