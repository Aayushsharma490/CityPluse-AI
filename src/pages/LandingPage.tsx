import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import anime from 'animejs';
import { 
  Building2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  CheckCircle, 
  Megaphone, 
  Cpu, 
  UserCheck 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button, MagneticButton } from '../components/ui/Button';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useCountUp } from '../hooks/useCountUp';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // 1. Hero Parallax Scroll Transforms (only when motion enabled)
  const { scrollY } = useScroll();
  const headlineY = useTransform(scrollY, [0, 500], [0, -90]);
  const subheadlineY = useTransform(scrollY, [0, 500], [0, -45]);

  // 2. Anime.js SVG Blob Morphing
  useEffect(() => {
    if (prefersReduced) return;

    anime({
      targets: '#morphing-blob-1',
      d: [
        { value: 'M25.4,-30.2C31.5,-23.9,34.4,-14.1,35,-4.7C35.6,4.7,33.9,13.7,29.3,21C24.7,28.3,17.2,33.9,8.5,36.5C-0.2,39.1,-10.1,38.7,-19.1,35.1C-28.1,31.5,-36.2,24.7,-39.8,15.8C-43.4,6.9,-42.5,-4.1,-38,-13.2C-33.5,-22.3,-25.4,-29.5,-16.5,-31.8C-7.6,-34.1,2.1,-31.5,11.3,-32.5C20.5,-33.5,19.3,-36.5,25.4,-30.2Z' },
        { value: 'M20.2,-28.4C26.3,-24.4,31.2,-18.2,34.6,-10.8C38,-3.4,39.9,5.2,37.3,13.1C34.7,21,27.6,28.2,19.2,32.7C10.8,37.2,1.1,39,-8.8,37.9C-18.7,36.8,-28.8,32.8,-35.3,25.6C-41.8,18.4,-44.7,8.1,-44.3,-2.3C-43.9,-12.7,-40.2,-23.2,-32.8,-28C-25.4,-32.8,-14.3,-31.9,-4.3,-30.2C5.7,-28.5,14.1,-32.4,20.2,-28.4Z' },
        { value: 'M23.5,-32.1C30.6,-27.2,36.7,-20.5,39.6,-12.3C42.5,-4.1,42.2,5.5,38.8,13.8C35.4,22.1,28.8,29.1,20.9,34.4C13,39.7,3.8,43.2,-5.3,42.2C-14.4,41.2,-23.4,35.7,-30.9,28.4C-38.4,21.1,-44.4,12,-45.6,2.2C-46.8,-7.6,-43.2,-18.1,-36.8,-24.1C-30.4,-30.1,-21.2,-31.6,-12.3,-34.5C-3.4,-37.4,5.2,-41.7,14.3,-41C23.4,-40.3,16.4,-37,23.5,-32.1Z' }
      ],
      duration: 8000,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    });

    anime({
      targets: '#morphing-blob-2',
      d: [
        { value: 'M18.8,-25.3C24.4,-20.8,29,-14.7,31,-7.7C33,-0.7,32.4,7.2,28.8,13.5C25.2,19.8,18.6,24.5,11.3,27.1C4,29.7,-4,30.2,-11.2,28.2C-18.4,26.2,-24.8,21.7,-28.7,15.5C-32.6,9.3,-34,1.4,-32.7,-6.2C-31.4,-13.8,-27.4,-21.1,-21.4,-25.5C-15.4,-29.9,-7.4,-31.4,0.1,-31.5C7.6,-31.6,13.2,-29.8,18.8,-25.3Z' },
        { value: 'M25.6,-28C30.4,-22.8,32.7,-15.5,33.5,-8.3C34.3,-1.1,33.6,5.9,30.3,11.8C27,17.7,21.1,22.5,14.3,25.8C7.5,29.1,-0.2,30.9,-7.8,29.8C-15.4,28.7,-22.9,24.7,-28,18.9C-33.1,13.1,-35.8,5.5,-35.1,-1.9C-34.4,-9.3,-30.3,-16.5,-24.8,-21.6C-19.3,-26.7,-12.4,-29.7,-4.8,-30.6C2.8,-31.5,20.8,-33.2,25.6,-28Z' },
        { value: 'M18.8,-25.3C24.4,-20.8,29,-14.7,31,-7.7C33,-0.7,32.4,7.2,28.8,13.5C25.2,19.8,18.6,24.5,11.3,27.1C4,29.7,-4,30.2,-11.2,28.2C-18.4,26.2,-24.8,21.7,-28.7,15.5C-32.6,9.3,-34,1.4,-32.7,-6.2C-31.4,-13.8,-27.4,-21.1,-21.4,-25.5C-15.4,-29.9,-7.4,-31.4,0.1,-31.5C7.6,-31.6,13.2,-29.8,18.8,-25.3Z' }
      ],
      duration: 10000,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    });
  }, [prefersReduced]);

  // 3. GSAP ScrollTrigger city grid lines fade-out
  useEffect(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.to('#city-grid-lines', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        opacity: 0,
        ease: 'none',
      });
    }, heroRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  // 4. Stats section viewport trigger
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  
  const citiesCount = useCountUp(12, 1500, statsInView && !prefersReduced);
  const complaintsCount = useCountUp(50000, 1800, statsInView && !prefersReduced);
  const complianceCount = useCountUp(87, 1500, statsInView && !prefersReduced);

  // Problem cards scroll reveal
  const problemRef = useRef<HTMLDivElement>(null);
  const problemInView = useInView(problemRef, { once: true, amount: 0.2 });

  return (
    <AppLayout>
      <PageTransition>
        
        {/* SECTION 1: Hero Section */}
        <section 
          ref={heroRef}
          id="hero-section"
          className="relative min-h-[90svh] flex flex-col justify-center items-center px-6 overflow-hidden border-b border-cp-border"
        >
          {/* Animated SVG Morphing Blobs (z-0) */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            {/* Blob 1 */}
            <svg 
              className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] text-[#0D3358]/15" 
              viewBox="-50 -50 100 100"
            >
              <path id="morphing-blob-1" fill="currentColor" d="M25.4,-30.2C31.5,-23.9,34.4,-14.1,35,-4.7C35.6,4.7,33.9,13.7,29.3,21C24.7,28.3,17.2,33.9,8.5,36.5C-0.2,39.1,-10.1,38.7,-19.1,35.1C-28.1,31.5,-36.2,24.7,-39.8,15.8C-43.4,6.9,-42.5,-4.1,-38,-13.2C-33.5,-22.3,-25.4,-29.5,-16.5,-31.8C-7.6,-34.1,2.1,-31.5,11.3,-32.5C20.5,-33.5,19.3,-36.5,25.4,-30.2Z" />
            </svg>
            
            {/* Blob 2 */}
            <svg 
              className="absolute -bottom-1/3 -right-1/4 w-[75%] h-[75%] text-[#00CED1]/10" 
              viewBox="-50 -50 100 100"
            >
              <path id="morphing-blob-2" fill="currentColor" d="M18.8,-25.3C24.4,-20.8,29,-14.7,31,-7.7C33,-0.7,32.4,7.2,28.8,13.5C25.2,19.8,18.6,24.5,11.3,27.1C4,29.7,-4,30.2,-11.2,28.2C-18.4,26.2,-24.8,21.7,-28.7,15.5C-32.6,9.3,-34,1.4,-32.7,-6.2C-31.4,-13.8,-27.4,-21.1,-21.4,-25.5C-15.4,-29.9,-7.4,-31.4,0.1,-31.5C7.6,-31.6,13.2,-29.8,18.8,-25.3Z" />
            </svg>
          </div>

          {/* Decorative City Grid Lines (fade-out on scroll) */}
          <div 
            id="city-grid-lines" 
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] text-cp-border flex justify-end items-start"
            aria-hidden="true"
          >
            <svg width="400" height="400" className="mr-8 mt-12" viewBox="0 0 100 100">
              <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="0.3" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.3" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.3" />
              <line x1="10" y1="0" x2="10" y2="100" stroke="currentColor" strokeWidth="0.3" />
              <line x1="40" y1="0" x2="40" y2="100" stroke="currentColor" strokeWidth="0.3" />
              <line x1="70" y1="0" x2="70" y2="100" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="40" cy="30" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="70" cy="50" r="2.5" fill="none" stroke="#00CED1" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Hero Content Panel */}
          <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Headline with Parallax */}
            <motion.h1 
              style={prefersReduced ? {} : { y: headlineY }}
              className="font-display text-[2.5rem] md:text-display-xl leading-tight text-cp-text-primary tracking-tight font-extrabold max-w-3xl"
            >
              Urban Grievance Intelligence for Smart Cities
            </motion.h1>

            {/* Subtitle with Parallax */}
            <motion.p 
              style={prefersReduced ? {} : { y: subheadlineY }}
              className="mt-6 text-body-md md:text-body-lg text-cp-text-secondary max-w-2xl font-body"
            >
              Transform civic complaints into categorized, prioritized, and routed smart interventions in real-time. Built entirely on open-source, free-tier AI components.
            </motion.p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap gap-4 justify-center items-center z-10">
              <MagneticButton>
                <Button 
                  size="lg"
                  onClick={() => navigate('/citizen')}
                  icon={<ArrowRight size={18} />}
                >
                  Citizen Portal
                </Button>
              </MagneticButton>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate('/govt')}
              >
                Govt Control Room
              </Button>
            </div>

            {/* KPI Counter Row */}
            <div 
              ref={statsRef}
              className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 border-t border-cp-border/50 pt-10 w-full max-w-3xl"
            >
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-[2rem] text-cp-teal">
                  {citiesCount}
                </span>
                <span className="text-body-sm text-cp-text-secondary mt-1">Smart Cities Connected</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-[2rem] text-cp-teal">
                  {prefersReduced ? '50,000+' : `${complaintsCount.toLocaleString()}+`}
                </span>
                <span className="text-body-sm text-cp-text-secondary mt-1">Grievances Processed</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-[2rem] text-cp-teal">
                  {complianceCount}%
                </span>
                <span className="text-body-sm text-cp-text-secondary mt-1">SLA Compliance Rate</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: Problem Statement */}
        <section id="problem-section" className="bg-cp-surface py-20 px-6 border-b border-cp-border">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Chaotic illustration overlay */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-cp-base/40 rounded-full border border-cp-border flex items-center justify-center">
                <div className="absolute w-[85%] h-[85%] border border-cp-border/60 rounded-full border-dashed animate-[spin_40s_linear_infinite]" aria-hidden="true"></div>
                {/* Chaotic Scattered Icons */}
                <Building2 className="absolute top-8 left-8 text-cp-text-muted rotate-[12deg]" size={40} />
                <ShieldAlert className="absolute top-10 right-12 text-cp-coral/75 -rotate-[15deg]" size={48} />
                <Clock className="absolute bottom-12 left-10 text-cp-amber/80 rotate-[25deg]" size={36} />
                <MapPin className="absolute bottom-16 right-16 text-cp-text-muted -rotate-[8deg]" size={44} />
                <div className="z-10 p-5 bg-cp-surface rounded-card border border-cp-border shadow-lg flex flex-col items-center">
                  <ShieldCheck size={48} className="text-cp-teal animate-pulse" />
                  <span className="text-label text-cp-text-secondary mt-2 tracking-wide">CityPulse AI</span>
                </div>
              </div>
            </div>

            {/* Right Column: Problem Cards */}
            <div ref={problemRef} className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-6">
              <span className="text-label text-cp-teal">Legacy Bottlenecks</span>
              <h2 className="font-display text-display-md text-cp-text-primary tracking-tight">
                Why Municipal Operations Struggle to Keep Up
              </h2>
              
              <div className="flex flex-col gap-4 mt-2">
                {[
                  {
                    icon: Clock,
                    title: "Slow Manual Routing",
                    desc: "Incoming complaints rot in physical files or basic email boxes, taking days to route to appropriate field engineers.",
                    color: "group-hover:text-cp-coral"
                  },
                  {
                    icon: ShieldAlert,
                    title: "Blind Spot Prioritization",
                    desc: "Critical safety issues (open manholes, live wires) are treated with the same priority as minor aesthetics, risking lives.",
                    color: "group-hover:text-cp-amber"
                  },
                  {
                    icon: Building2,
                    title: "Zero Operational Visibility",
                    desc: "Command centers lack real-time heatmaps to allocate budgets, identify ward failures, and monitor SLA breach alerts.",
                    color: "group-hover:text-cp-teal"
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
                    animate={prefersReduced ? {} : (problemInView ? { opacity: 1, y: 0 } : {})}
                    transition={{ duration: 0.4, delay: idx * 0.15, ease: 'easeOut' }}
                  >
                    <Card className="group flex gap-4 hover:border-cp-border-glow">
                      <div className="flex-shrink-0 mt-0.5">
                        <item.icon size={24} className={`text-cp-text-secondary transition-colors duration-150 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-body-md text-cp-text-primary group-hover:text-cp-teal transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-body-sm text-cp-text-secondary mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: Solution Overview */}
        <section id="solution-section" className="bg-cp-base py-20 px-6 border-b border-cp-border">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <span className="text-label text-cp-teal">Autonomous Orchestration</span>
            <h2 className="font-display text-display-md text-cp-text-primary tracking-tight mt-2 text-center max-w-2xl">
              An AI-Driven Civic Command Center Running at Zero Cost
            </h2>
            
            {/* Asymmetric 3-Card Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full mt-12">
              
              {/* Large Card (Col Span 3) */}
              <Card className="lg:col-span-3 flex flex-col justify-between hover:border-cp-border-glow group">
                <div>
                  <div className="w-12 h-12 rounded-badge bg-cp-teal/10 flex items-center justify-center text-cp-teal mb-6">
                    <Cpu size={24} />
                  </div>
                  <h3 className="font-display text-display-sm text-cp-text-primary group-hover:text-cp-teal transition-colors">
                    Meta Llama 3.3 70B Classifications
                  </h3>
                  <p className="text-body-md text-cp-text-secondary mt-3 max-w-xl">
                    CityPulse AI processes citizen reports instantly. Our backend validates models response dynamically using Pydantic schemas, routing complaints to municipal departments, estimating resolution delays, and calculating safety scores.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-cp-border/50 text-body-sm text-cp-text-muted font-mono">
                  Stack: Meta Llama 3.3 70B · Groq Free Tier · Pydantic
                </div>
              </Card>

              {/* Small Stack Column (Col Span 2) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Small Card 1 */}
                <Card className="flex-grow flex flex-col justify-between hover:border-cp-border-glow group">
                  <div>
                    <div className="w-10 h-10 rounded-badge bg-cp-teal/10 flex items-center justify-center text-cp-teal mb-4">
                      <MapPin size={20} />
                    </div>
                    <h4 className="font-display font-semibold text-body-lg text-cp-text-primary group-hover:text-cp-teal transition-colors">
                      Ward Density Heatmaps
                    </h4>
                    <p className="text-body-sm text-cp-text-secondary mt-2">
                      Geographic clustering of grievances across 15+ Udaipur wards. Pinpoint hardware failures on dark maps.
                    </p>
                  </div>
                </Card>

                {/* Small Card 2 */}
                <Card className="flex-grow flex flex-col justify-between hover:border-cp-border-glow group">
                  <div>
                    <div className="w-10 h-10 rounded-badge bg-cp-teal/10 flex items-center justify-center text-cp-teal mb-4">
                      <CheckCircle size={20} />
                    </div>
                    <h4 className="font-display font-semibold text-body-lg text-cp-text-primary group-hover:text-cp-teal transition-colors">
                      SLA Breach Auditing
                    </h4>
                    <p className="text-body-sm text-cp-text-secondary mt-2">
                      Real-time triggers for department workloads. Escalates tickets automatically when they breach predicted timelines.
                    </p>
                  </div>
                </Card>

              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: How It Works */}
        <section id="how-it-works" className="bg-cp-surface py-20 px-6 border-b border-cp-border">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <span className="text-label text-cp-teal">Operational Flow</span>
            <h2 className="font-display text-display-md text-cp-text-primary tracking-tight mt-2 text-center">
              Citizen Reporting to Resolution in 4 Steps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full mt-12 relative">
              {[
                {
                  step: "01",
                  icon: Megaphone,
                  title: "Citizen Submits",
                  desc: "Complainant inputs text or dictates civic grievances through the portal."
                },
                {
                  step: "02",
                  icon: Cpu,
                  title: "AI Classifies",
                  desc: "Llama 3.3 70b computes urgency score, category, and maps resolution days."
                },
                {
                  step: "03",
                  icon: Building2,
                  title: "Routed Automatically",
                  desc: "Database routes ticket directly to PWD, Jal Board, or DISCOM command feeds."
                },
                {
                  step: "04",
                  icon: UserCheck,
                  title: "Engineer Resolves",
                  desc: "Field workers execute repair operations and resolve complaints."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative z-10">
                  {/* Step Badge */}
                  <div className="w-14 h-14 rounded-full border border-cp-teal bg-cp-surface flex items-center justify-center text-cp-teal font-display font-bold text-body-lg shadow-glow-teal mb-4">
                    {item.step}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-display font-semibold text-body-md text-cp-text-primary mt-2">
                    {item.title}
                  </h3>
                  
                  {/* Desc */}
                  <p className="text-body-sm text-cp-text-secondary mt-2 max-w-[200px]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: Call to Action */}
        <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-[#0F4C6B] to-[#0D1B2A]">
          {/* Subtle Mesh CSS grid lines (aria-hidden) */}
          <div 
            className="absolute inset-0 opacity-[0.08]" 
            style={{ 
              backgroundImage: 'radial-gradient(#00CED1 1px, transparent 1px)',
              backgroundSize: '24px 24px' 
            }}
            aria-hidden="true"
          ></div>

          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <h2 className="font-display text-[2rem] md:text-display-lg leading-tight text-cp-text-primary font-bold">
              Ready to Upgrade Udaipur's Municipal Intelligence?
            </h2>
            <p className="mt-4 text-body-md text-cp-text-secondary max-w-xl">
              Equip Smart City command staff with real-time AI routing and predictive resolution forecasting today.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center items-center">
              <MagneticButton>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/citizen')}
                  icon={<ArrowRight size={18} />}
                >
                  Enter Citizen Portal
                </Button>
              </MagneticButton>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate('/govt')}
              >
                Access Govt Room
              </Button>
            </div>
          </div>
        </section>


      </PageTransition>
    </AppLayout>
  );
};
export default LandingPage;
