import React, { useState, useEffect, useRef } from 'react';
import { Agent, AgentStatus, LogEntry, ScoreMetric } from '../types';

interface Props {
  activeAgent: Agent | undefined;
  logs: LogEntry[];
  metrics: ScoreMetric[];
  isFailPath?: boolean;
  onClose: () => void;
}

const BackendProcessView: React.FC<Props> = ({ activeAgent, logs, metrics, isFailPath, onClose }) => {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeAgent) return;

    const generateTechnicalLogs = () => {
      const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
      const prefix = `[${timestamp}] [SYS_NODE:${activeAgent.id}] `;
      
      let contextSpecificSnippets: string[] = [];

      // Demo Fail Path Specific Error Snippets
      if (isFailPath) {
          const isErrorNode = ['INTAKE', 'OCR', 'BUSINESS', 'DECISION', 'OWNERSHIP'].includes(activeAgent.id);
          if (isErrorNode) {
              contextSpecificSnippets.push(
                `[ERROR] VALIDATION_MISMATCH: identity_vector != registry_data`,
                `[CRITICAL] DATABASE_REJECTION: node_${activeAgent.id}_hard_fail`,
                `[WARN] integrity_score_dropped: 0.34 < threshold_0.80`,
                `[FAIL] cross_reference_abort: mismatched_field_detected`
              );
          }
      }

      switch (activeAgent.id) {
        case 'INTAKE':
          contextSpecificSnippets.push(
            `parse_form_v2(id='SWK_LICENSE')`,
            `sanitize_sql_input(entity='${activeAgent.name}')`,
            `validation_engine::verify_fields(REQUIRED_MANDATORY)`,
            `metadata_checksum = calc_hash(form_payload)`
          );
          break;
        case 'DOC_CHECK':
          contextSpecificSnippets.push(
            `manifest_validator::verify_files(count=10)`,
            `file_signature_check(md5_sum='a8f2...1e')`,
            `integrity_scan::binary_verification(OK)`,
            `cross_reference_pbt_checklist(target='DBKU')`
          );
          break;
        case 'OCR':
          contextSpecificSnippets.push(
            `vision_ai::tess_process(modality='MYKAD')`,
            `extracting_bounding_boxes(confidence > 0.98)`,
            `pattern_match(regex='^[0-9]{6}-[0-9]{2}-[0-9]{4}$')`,
            `ocr_engine::denoise_filter(3x3_gaussian)`
          );
          break;
        case 'SAFETY':
          contextSpecificSnippets.push(
            `bomba_api::fetch_letter(ref='JBPM_SWK')`,
            `spatial_analysis::check_exits(min_count=2)`,
            `thermal_load_calc(materials='WOOD_COMMERCIAL')`,
            `safety_node::evaluate_hazard_index()`
          );
          break;
        case 'OWNERSHIP':
          contextSpecificSnippets.push(
            `land_registry::query_parcel(id='LOT_402')`,
            `tenancy_engine::check_stamp_duty(LHDN_GATEWAY)`,
            `verify_owner_signature(digital_cert_v3)`,
            `title_deed::integrity_check(PENDING_VERIFIED)`
          );
          break;
        case 'VILLAGE':
          contextSpecificSnippets.push(
            `district_api::query_zoning(lat=1.55, lng=110.34)`,
            `village_head_consent::verify_signature()`,
            `validate_residential_compliance(category='VILLAGE_SHOP')`,
            `support_letter_scan::ocr_verify(ref='DO_KUCHING')`
          );
          break;
        case 'BUSINESS':
          contextSpecificSnippets.push(
            `ssm_gateway::query_entity(roc='202401xxxx')`,
            `insolvency_check::query_blacklist()`,
            `form_9_integrity_verification(signed=true)`,
            `business_nature_match(code='RETAIL_CAFE')`
          );
          break;
        case 'SCORING':
          contextSpecificSnippets.push(
            `calc_weighted_mean(w_ident=10, w_doc=10, w_safety=15)`,
            `risk_engine::aggregate_vectors(node_status='HEALTHY')`,
            `normalizing_score_distribution(target='COMPLIANCE')`,
            `final_score_update = sum(metrics) / total_weight`
          );
          break;
        case 'DECISION':
          contextSpecificSnippets.push(
            `eval_decision_tree(nodes=512, depth=12)`,
            `policy_check::sarawak_trade_ordinance_2024()`,
            `threshold_gate_check(current=0.95, target=0.80)`,
            `prepare_decision_metadata(status='APPROVED')`
          );
          break;
        case 'AUDIT':
          contextSpecificSnippets.push(
            `ledger::write_block(payload_hash='7e1c...99')`,
            `generate_immutable_trace(ref='SWK_AUDIT_24')`,
            `explainability_engine::output_justification()`,
            `finalize_audit_provenance(node='AGENT_0xAF')`
          );
          break;
        default:
          contextSpecificSnippets.push(
            `exec_logic(file='agent_logic.py', node='${activeAgent.id}')`,
            `logic_engine::verify_dependencies(upstream='PASSED')`,
            `await_rpc_response(sarawak_gov_gateway)`,
            `processing_context_node(uid='${activeAgent.id}')`
          );
      }

      const generalSnippets = [
        `CPU_CYCLE: ${(Math.random() * 5 + 1).toFixed(1)}ms`,
        `MEM_USAGE: ${(Math.random() * 80 + 20).toFixed(2)}MB`,
        `TOKEN_BUF: IN(452) | OUT(128)`,
        `HYPOTHESIS: Model confidence > 0.92`,
        `NETWORK_STATE: ESTABLISHED(Sarawak_API)`,
      ];

      const combined = [...contextSpecificSnippets, ...generalSnippets];
      const newLine = prefix + combined[Math.floor(Math.random() * combined.length)];
      setTerminalLines(prev => [...prev.slice(-40), newLine]);
    };

    const interval = setInterval(generateTechnicalLogs, 300);
    return () => clearInterval(interval);
  }, [activeAgent, isFailPath]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  return (
    <div className="flex flex-col h-full bg-black border-l border-cyan-900/50 font-mono text-[10px] md:text-xs overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,255,255,0.05)]">
      <div className="bg-slate-900/80 border-b border-cyan-900/30 p-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
          </div>
          <span className="text-cyan-500 font-bold ml-2">
            <span className="animate-pulse">●</span> BACKEND_AGENTS_CORE
          </span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white bg-slate-800 px-2 py-1 rounded text-[10px]">
          [ESC] EXIT
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[rgba(0,5,5,0.95)]" ref={scrollRef}>
        <div className="mb-4 border-b border-cyan-950 pb-4">
          <div className="text-emerald-500 mb-1">{`>>> TARGET_NODE_ENVIRONMENT: ${activeAgent?.id || 'IDLE'}`}</div>
          <div className="text-slate-500 flex gap-4">
            <span>Identity: {activeAgent?.name}</span>
            <span>Security_Lvl: HIGH_TRUST</span>
          </div>
        </div>

        <div className="space-y-1">
          {terminalLines.map((line, idx) => {
            const isError = line.includes('ERROR') || line.includes('CRITICAL') || line.includes('FAIL');
            const isAgentCode = !isError && (line.includes('engine') || line.includes('::') || line.includes('()'));
            const isImportant = !isError && (line.includes('HYPOTHESIS') || line.includes('TARGET') || line.includes('threshold'));
            
            return (
              <div key={idx} className={`leading-tight ${
                isError ? 'text-red-500 font-bold' :
                isAgentCode ? 'text-cyan-400 font-bold' : 
                isImportant ? 'text-amber-400' : 
                'text-emerald-500/70'
              }`}>
                {line}
              </div>
            );
          })}
          <div className="animate-pulse inline-block w-2 h-4 bg-emerald-500 ml-1 translate-y-1"></div>
        </div>
      </div>

      <div className="h-1/4 border-t border-cyan-900/30 bg-black/90 p-4 grid grid-cols-2 gap-4 shrink-0">
        <div className="border border-cyan-900/20 p-2 rounded bg-cyan-950/5">
          <div className="text-cyan-500 text-[9px] uppercase mb-1 font-bold tracking-widest opacity-70">Agent_Internal_Tasks</div>
          <div className="text-slate-400 text-[10px] leading-tight italic">
            {activeAgent?.status === AgentStatus.WORKING ? `Sub-Task Exec: logic_flow_${activeAgent.id.toLowerCase()}.bin triggered. Awaiting gate confirmation.` : 'IDLE: Monitoring system state.'}
          </div>
        </div>
        <div className="border border-emerald-900/20 p-2 rounded bg-emerald-950/5">
          <div className="text-emerald-500 text-[9px] uppercase mb-1 font-bold tracking-widest opacity-70">Decision_Gates</div>
          <div className="text-[10px] space-y-1">
             <div className="flex justify-between">
                <span className="text-slate-500">Node Compliance:</span>
                <span className={`font-bold ${isFailPath && activeAgent && ['INTAKE', 'OCR', 'BUSINESS', 'DECISION'].includes(activeAgent.id) ? 'text-red-500' : 'text-emerald-400'}`}>
                    {isFailPath && activeAgent && ['INTAKE', 'OCR', 'BUSINESS', 'DECISION'].includes(activeAgent.id) ? 'FAILED' : 'PASSED'}
                </span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500">Security Check:</span>
                <span className="text-emerald-400">VERIFIED</span>
             </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.02] overflow-hidden">
        {Array.from({length: 8}).map((_, i) => (
          <div key={i} className="absolute top-0 text-[8px] animate-pulse" style={{ left: `${i * 12}%`, animationDelay: `${i * 0.4}s`, writingMode: 'vertical-rl' }}>
            {Math.random().toString(36).substring(2, 10)} 0x{Math.floor(Math.random() * 999).toString(16)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackendProcessView;