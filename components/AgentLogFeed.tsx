import React from 'react';
import { Agent, AgentStatus } from '../types';

interface AgentLogFeedProps {
  agents: Agent[];
  isFailPath?: boolean;
}

const AgentLogFeed: React.FC<AgentLogFeedProps> = ({ agents, isFailPath }) => {
  const getMilestoneDetails = (agent: Agent) => {
    if (isFailPath) {
      switch (agent.id) {
        case 'INTAKE': return { title: 'Identity Verification', desc: '(Issue detected!) ID card did not matches.' };
        case 'OCR': return { title: 'Data Extraction', desc: '(Critical) MyKad not found in JPN registry.' };
        case 'BUSINESS': return { title: 'Entity Check', desc: '(Mismatch) Name ordinance conflict detected.' };
        case 'DECISION': return { title: 'Final Evaluation', desc: '(Rejected) Multiple gateway failures.' };
        case 'AUDIT': return { title: 'Ledger Documentation', desc: 'Provance of failure recorded.' };
        case 'DOC_CHECK': return { title: 'Document Integrity', desc: 'Scan analysis completed.' };
        case 'OWNERSHIP': return { title: 'Tenure Verification', desc: 'Registry cross-check failed.' };
        case 'SAFETY': return { title: 'Premise Safety', desc: 'Safety protocols evaluated.' };
        case 'VILLAGE': return { title: 'District Support', desc: 'Locality check finished.' };
        case 'SCORING': return { title: 'Compliance Modeling', desc: 'Negative weights applied.' };
        default: return { title: 'Agent Process', desc: 'Analysis finalized.' };
      }
    }

    switch (agent.id) {
      case 'INTAKE': return { title: 'Identity Verification', desc: 'ID card matches applicant details.' };
      case 'DOC_CHECK': return { title: 'Document Integrity', desc: 'PDF readability and original verification.' };
      case 'OCR': return { title: 'Data Extraction', desc: 'Processing images to machine-readable format.' };
      case 'OWNERSHIP': return { title: 'Tenure Verification', desc: 'Validating land title or tenancy stamps.' };
      case 'SAFETY': return { title: 'Premise Safety', desc: 'Confirming Bomba and premise safety standards.' };
      case 'VILLAGE': return { title: 'District Support', desc: 'Verifying Village Head and DO approvals.' };
      case 'BUSINESS': return { title: 'Entity Check', desc: 'Cross-referencing SSM registration records.' };
      case 'SCORING': return { title: 'Compliance Modeling', desc: 'Aggregating adherence and risk scores.' };
      case 'DECISION': return { title: 'Final Evaluation', desc: 'Determining regulatory approval status.' };
      case 'AUDIT': return { title: 'Ledger Documentation', desc: 'Finalizing immutable audit trails.' };
      default: return { title: 'Agent Process', desc: 'Analyzing data...' };
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-full flex flex-col shadow-inner relative overflow-hidden">
       <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span className="text-slate-500 uppercase font-bold tracking-widest text-xs">System Milestones & Verification</span>
            <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            </div>
       </div>
       
       <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
           {agents.map((agent) => {
             const { title, desc } = getMilestoneDetails(agent);
             const isWorking = agent.status === AgentStatus.WORKING || agent.status === AgentStatus.THINKING;
             const isCompleted = agent.status === AgentStatus.COMPLETED;
             const hasError = isFailPath && isCompleted && (agent.id === 'INTAKE' || agent.id === 'OCR' || agent.id === 'BUSINESS' || agent.id === 'DECISION' || agent.id === 'OWNERSHIP');
             
             return (
               <div 
                 key={agent.id} 
                 className={`flex items-start space-x-3 transition-all duration-500 ${isWorking ? 'scale-[1.02] py-1' : ''}`}
               >
                 <div className="shrink-0 mt-0.5 font-mono text-base">
                   {isCompleted ? (
                     <span className={`${hasError ? 'text-amber-500' : 'text-emerald-500'} animate-in zoom-in`}> [✓] </span>
                   ) : isWorking ? (
                     <span className="text-cyan-400 animate-pulse"> [◎] </span>
                   ) : (
                     <span className="text-slate-600"> [ ] </span>
                   )}
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-tight ${
                        isCompleted ? (hasError ? 'text-amber-500' : 'text-emerald-500') : isWorking ? 'text-cyan-400' : 'text-slate-500'
                      }`}>
                        {title}
                      </span>
                      {isWorking && (
                        <span className="flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-tight mt-0.5 ${
                      isCompleted ? (hasError ? 'text-amber-200' : 'text-slate-300') : isWorking ? 'text-cyan-200 animate-pulse' : 'text-slate-600'
                    }`}>
                      {isWorking ? agent.currentTask : isCompleted ? desc : 'Waiting for dependency...'}
                    </p>
                 </div>
               </div>
             );
           })}
       </div>

       {/* Scanline Effect */}
       <div className="absolute inset-0 pointer-events-none opacity-5 bg-gradient-to-b from-transparent via-cyan-500 to-transparent h-4 animate-[scan_4s_linear_infinite]"></div>
    </div>
  );
};

export default AgentLogFeed;