import React, { useState, useEffect, useRef } from 'react';
import { Agent, AgentRole, AgentStatus, ApplicationData, LogEntry, ScoreMetric, SimulationResult } from '../types';
import { AGENTS, SIMULATION_STEPS } from '../constants';
import AgentCard from './AgentCard';
import AgentLogFeed from './AgentLogFeed';
import ScoringPanel from './ScoringPanel';
import BackendProcessView from './BackendProcessView';
import { generateAgentThought, generateFinalJustification } from '../services/geminiService';

interface Props {
  appData: ApplicationData;
  onComplete: (result: SimulationResult) => void;
}

const ControlRoom: React.FC<Props> = ({ appData, onComplete }) => {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [showBackend, setShowBackend] = useState(false);
  
  // DEMO CASE VARIABLES
  const isFailPath = appData.businessName === 'Warong rowan';
  
  // Updated to 10 criteria matching the 10 agents
  const [scoreMetrics, setScoreMetrics] = useState<ScoreMetric[]>([
    { category: 'Identity Profile', score: 0, maxScore: 10, weight: 10 },    // Intake
    { category: 'Registry Manifest', score: 0, maxScore: 10, weight: 10 },   // Doc Check
    { category: 'Evidence Extraction', score: 0, maxScore: 10, weight: 10 }, // OCR
    { category: 'Tenure Compliance', score: 0, maxScore: 10, weight: 10 },   // Ownership
    { category: 'Life Safety (Bomba)', score: 0, maxScore: 15, weight: 15 }, // Safety
    { category: 'Zoning Regulatory', score: 0, maxScore: 15, weight: 15 },   // Village
    { category: 'Corporate Standing', score: 0, maxScore: 10, weight: 10 },  // Business
    { category: 'Model Convergence', score: 0, maxScore: 5, weight: 5 },     // Scoring
    { category: 'Decision Gateways', score: 0, maxScore: 10, weight: 10 },   // Decision
    { category: 'Audit Provenance', score: 0, maxScore: 5, weight: 5 },      // Audit
  ]);
  
  const [isFinished, setIsFinished] = useState(false);
  const [finalJustification, setFinalJustification] = useState<string>("");

  const totalScore = scoreMetrics.reduce((acc, curr) => acc + curr.score, 0);
  const hasStartedRef = useRef(false);

  // Helper to add log
  const addLog = (agentId: AgentRole, message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      agentId,
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Helper to update specific agent
  const updateAgent = (id: AgentRole, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // Update Score Helper
  const incrementScore = (categoryIndex: number, amount: number, limit?: number) => {
    setScoreMetrics(prev => {
        const next = [...prev];
        const current = next[categoryIndex];
        const targetLimit = limit !== undefined ? limit : current.maxScore;
        
        if (current.score < targetLimit) {
            current.score = Math.min(targetLimit, current.score + amount);
        }
        return next;
    });
  };

  // Simulation Loop
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const totalDocs = appData.documents.length;
    const uploadedDocs = appData.documents.filter(d => d.fileName).length;
    
    // Normal calculation unless it's the specific fail path name
    const calculatedDocScore = isFailPath ? 2 : (totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 10) : 10);

    const customizedSteps = SIMULATION_STEPS.map(step => {
        let processedStep: typeof step & { isSkipped?: boolean } = { ...step };

        // Handle specific Fail Path Override
        if (isFailPath) {
            if (step.agent === 'INTAKE') {
                processedStep.log = 'FAIL: Name mismatch detected against JPN database.';
            }
            if (step.agent === 'OCR') {
                processedStep.log = 'FAIL: MyKad invalid / not found in JPN registry.';
            }
            if (step.agent === 'BUSINESS') {
                processedStep.log = 'FAIL: Entity registry name mismatch.';
            }
            if (step.agent === 'DECISION') {
                processedStep.log = 'FAIL: Address mismatch / Premises verification failed.';
            }
        } else {
            // Normal Logic
            if (step.agent === 'INTAKE' && step.action === 'Parsing metadata...') {
                processedStep.action = 'Validating Entity Data...';
                processedStep.log = `Verified Applicant: ${appData.applicantName}. Validating Business Name: '${appData.businessName}'...`;
            }

            if (step.agent === 'OCR' && step.action === 'Reading MyKad...') {
                processedStep.log = `Extracted IC: ${appData.icNumber}. Biometric match confirmed.`;
            }
            
            if (step.agent === 'BUSINESS' && step.action === 'Checking Business Names...') {
                processedStep.log = `SSM Registry Query: '${appData.businessName}' - COMPLIANT.`;
            }
        }

        if (processedStep.agent === 'VILLAGE' && !appData.isVillageShop) {
            processedStep = { ...processedStep, action: 'Skipping Village Check', log: 'Standard premise category.', duration: 500, isSkipped: true };
        }
        if (processedStep.agent === 'BUSINESS' && appData.type === 'Individual' && !isFailPath) {
             processedStep = { ...processedStep, action: 'Individual Entity - Skipped', log: 'Name ordinance N/A for individual.', duration: 500, isSkipped: true };
        }
        return processedStep;
    });

    let currentStep = 0;

    const executeStep = async () => {
      if (currentStep >= customizedSteps.length) {
        setIsFinished(true);
        // Final Score Adjustment
        const finalScore = isFailPath ? totalScore : (100 - (10 - calculatedDocScore));
        const justification = await generateFinalJustification(appData, finalScore);
        setFinalJustification(justification);
        updateAgent('AUDIT', { status: AgentStatus.COMPLETED, currentTask: undefined });
        return;
      }

      const step = customizedSteps[currentStep];
      setStepIndex(currentStep);

      if (step.isSkipped) {
         updateAgent(step.agent as AgentRole, { status: AgentStatus.IDLE });
         addLog(step.agent as AgentRole, step.action, 'warning');
         // Grant full score for skipped valid logical checks unless in fail path
         if (!isFailPath) {
             if (step.agent === 'VILLAGE') incrementScore(5, 15);
             if (step.agent === 'BUSINESS') incrementScore(6, 10); 
         }
      } else {
         updateAgent(step.agent as AgentRole, { status: AgentStatus.WORKING, currentTask: step.action });
         const thoughtPromise = generateAgentThought(step.agent as AgentRole, step.action, appData);
         
         // Mapping Agent Actions to Scoring Indices
         // Only award points if NOT in the specific mismatched steps of the Fail Path
         if (step.agent === 'INTAKE') { if (!isFailPath) incrementScore(0, 10); }
         if (step.agent === 'DOC_CHECK') incrementScore(1, 10, calculatedDocScore);
         if (step.agent === 'OCR') { if (!isFailPath) incrementScore(2, 10); }
         if (step.agent === 'OWNERSHIP') incrementScore(3, 10);
         if (step.agent === 'SAFETY') incrementScore(4, 15);
         if (step.agent === 'VILLAGE') incrementScore(5, 15);
         if (step.agent === 'BUSINESS') { if (!isFailPath) incrementScore(6, 10); }
         if (step.agent === 'SCORING') incrementScore(7, 5);
         if (step.agent === 'DECISION') { if (!isFailPath) incrementScore(8, 10); }
         if (step.agent === 'AUDIT') incrementScore(9, 5);

         const [thought] = await Promise.all([
            thoughtPromise,
            new Promise(resolve => setTimeout(resolve, step.duration))
         ]);

         addLog(step.agent as AgentRole, thought, 'thinking');
         addLog(step.agent as AgentRole, step.log, isFailPath && (step.agent === 'INTAKE' || step.agent === 'OCR' || step.agent === 'BUSINESS' || step.agent === 'DECISION') ? 'error' : 'success');
      }

      updateAgent(step.agent as AgentRole, { status: AgentStatus.COMPLETED, currentTask: undefined });
      currentStep++;
      executeStep();
    };

    executeStep();
  }, [appData, isFailPath, totalScore]);

  const handleFinish = () => {
    onComplete({
        score: totalScore,
        justification: finalJustification,
        status: totalScore >= 80 ? 'APPROVED' : 'FLAGGED'
    });
  };

  const activeAgent = agents.find(a => a.status === AgentStatus.WORKING || a.status === AgentStatus.THINKING);

  return (
    <div className="flex flex-row bg-slate-950 lg:h-screen lg:overflow-hidden min-h-screen transition-all duration-500">
      <div className={`flex flex-col p-2 md:p-4 gap-4 transition-all duration-500 ${showBackend ? 'w-1/2' : 'w-full'}`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800 gap-4 md:gap-0 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-cyan-500">⚛</span> Agentic Workflow Engine <span className="bg-cyan-900 text-cyan-200 text-xs px-2 py-0.5 rounded ml-2 uppercase tracking-widest">Autonomous</span>
            </h1>
            <p className="text-xs text-slate-400">Node_UID: Solaris_0x{Math.floor(Math.random() * 9999)} • Target: {appData.businessName}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowBackend(!showBackend)}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all border ${showBackend ? 'bg-cyan-900 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500'}`}
            >
              {showBackend ? '[X] CLOSE_BACKEND' : '[>] BACKEND AGENT PROCESSES'}
            </button>

            {isFinished ? (
              <button onClick={handleFinish} className={`${totalScore >= 80 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} text-white shadow-lg px-6 py-2 rounded-lg font-bold transition`}>
                <span>{totalScore >= 80 ? 'View License' : 'View Audit Report'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-500 font-mono text-sm animate-pulse hidden md:inline">NODE_LIVE</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-4 lg:min-h-0">
          <div className={`col-span-12 ${showBackend ? 'lg:col-span-4' : 'lg:col-span-3'} flex flex-col gap-2 order-2 lg:order-1 lg:h-full lg:overflow-hidden`}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Agent Nodes</div>
            <div className="flex-1 space-y-3 pr-2 custom-scrollbar overflow-y-auto max-h-60 lg:max-h-none">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>
          </div>

          <div className={`col-span-12 ${showBackend ? 'lg:col-span-8' : 'lg:col-span-6'} flex flex-col gap-4 order-1 lg:order-2 lg:h-full lg:overflow-hidden`}>
            <div className="flex-1 min-h-[16rem] lg:min-h-0 relative rounded-xl overflow-hidden">
              <AgentLogFeed agents={agents} isFailPath={isFailPath} />
            </div>
            
            <div className="h-24 bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                {isFinished ? (
                   <div className="z-10 animate-fade-in-up">
                      <h2 className={`text-xl font-bold mb-1 ${totalScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {totalScore >= 80 ? 'COMPLIANCE CONFIRMED' : 'APPLICATION REJECTED'}
                      </h2>
                   </div>
                ) : (
                  <div className="z-10">
                     <p className="text-lg text-cyan-400 font-mono truncate max-w-full">
                        {activeAgent?.currentTask || "WAIT_QUEUED"}
                     </p>
                  </div>
                )}
            </div>
          </div>

          {!showBackend && (
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 order-3 lg:h-full lg:overflow-hidden">
               <div className="flex-1 min-h-[16rem] lg:min-h-0 overflow-hidden">
                 <ScoringPanel metrics={scoreMetrics} totalScore={totalScore} />
               </div>
               <div className="h-1/3 bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col shrink-0 overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Audit Trace</h3>
                  <div className="flex-1 bg-slate-950 rounded p-3 text-[11px] text-slate-300 font-mono overflow-y-auto border border-slate-800 custom-scrollbar italic leading-relaxed">
                     {isFinished ? finalJustification : "Synthesizing verification vector..."}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {showBackend && (
        <div className="w-1/2 hidden lg:block animate-slide-left">
          <BackendProcessView activeAgent={activeAgent} logs={logs} metrics={scoreMetrics} isFailPath={isFailPath} onClose={() => setShowBackend(false)} />
        </div>
      )}
    </div>
  );
};

export default ControlRoom;