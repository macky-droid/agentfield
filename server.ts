import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// In-Memory Data Store for AgentField
const mockAgents = [
  {
    id: 'researcher-agent',
    base_url: 'http://localhost:8001',
    version: '1.2.0',
    team_id: 'core-platform',
    health_status: 'healthy',
    lifecycle_status: 'running',
    last_heartbeat: new Date().toISOString(),
    registered_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    deployment_type: 'long_running',
    reasoner_count: 3,
    skill_count: 2,
    reasoners: [
      {
        id: 'researcher-agent.summarize',
        name: 'summarize',
        description: 'Summarizes long research documents and web pages into structured insights.',
        schema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to summarize' },
            depth: { type: 'string', enum: ['brief', 'detailed', 'exhaustive'], default: 'detailed' }
          },
          required: ['url']
        },
        timeout: '60s',
        retry_policy: { max_retries: 3 }
      },
      {
        id: 'researcher-agent.deep_dive',
        name: 'deep_dive',
        description: 'Executes recursive query decomposition and synthesizes multi-source research report.',
        schema: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'Research topic query' },
            max_sources: { type: 'number', default: 5 }
          },
          required: ['topic']
        },
        timeout: '120s'
      },
      {
        id: 'researcher-agent.extract_claims',
        name: 'extract_claims',
        description: 'Extracts verifiable assertions and statistics for citation verification.',
        schema: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          },
          required: ['text']
        }
      }
    ],
    skills: [
      { id: 'researcher-agent.fetch_page', name: 'fetch_page', description: 'Deterministic HTTP fetch with retry and sanitization' },
      { id: 'researcher-agent.pdf_extract', name: 'pdf_extract', description: 'Extracts clean Markdown from PDF binary stream' }
    ],
    mcp_summary: {
      total_servers: 2,
      healthy_servers: 2,
      degraded_servers: 0,
      failed_servers: 0,
      total_tools: 5
    },
    mcp_servers: [
      {
        server_alias: 'brave-search',
        status: 'healthy',
        ping_latency_ms: 24,
        consecutive_failures: 0,
        tool_count: 2,
        tools: [
          { name: 'brave_web_search', description: 'Web search query via Brave API' },
          { name: 'brave_local_search', description: 'Local geographical search' }
        ]
      },
      {
        server_alias: 'filesystem-store',
        status: 'healthy',
        ping_latency_ms: 3,
        consecutive_failures: 0,
        tool_count: 3,
        tools: [
          { name: 'read_file', description: 'Read document from local cache' },
          { name: 'write_file', description: 'Write artifact to scratchpad' },
          { name: 'list_directory', description: 'List scratchpad directories' }
        ]
      }
    ]
  },
  {
    id: 'coder-agent',
    base_url: 'http://localhost:8002',
    version: '1.2.0',
    team_id: 'developer-tools',
    health_status: 'healthy',
    lifecycle_status: 'running',
    last_heartbeat: new Date().toISOString(),
    registered_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    deployment_type: 'long_running',
    reasoner_count: 2,
    skill_count: 3,
    reasoners: [
      {
        id: 'coder-agent.generate_patch',
        name: 'generate_patch',
        description: 'Generates unified git patch for bugfix or feature request.',
        schema: {
          type: 'object',
          properties: {
            issue_description: { type: 'string' },
            target_repo: { type: 'string' }
          },
          required: ['issue_description']
        }
      },
      {
        id: 'coder-agent.review_diff',
        name: 'review_diff',
        description: 'Performs AST and security review of code modifications.',
        schema: {
          type: 'object',
          properties: {
            diff_content: { type: 'string' }
          },
          required: ['diff_content']
        }
      }
    ],
    skills: [
      { id: 'coder-agent.run_linter', name: 'run_linter', description: 'Executes language linter' },
      { id: 'coder-agent.run_tests', name: 'run_tests', description: 'Executes test runner inside sandbox container' },
      { id: 'coder-agent.git_apply', name: 'git_apply', description: 'Applies diff to sandbox working tree' }
    ],
    mcp_summary: {
      total_servers: 1,
      healthy_servers: 1,
      degraded_servers: 0,
      failed_servers: 0,
      total_tools: 4
    },
    mcp_servers: [
      {
        server_alias: 'github-gateway',
        status: 'healthy',
        ping_latency_ms: 45,
        consecutive_failures: 0,
        tool_count: 4,
        tools: [
          { name: 'get_pull_request', description: 'Fetch PR diff and metadata' },
          { name: 'post_review_comment', description: 'Submit inline code review' },
          { name: 'create_issue_branch', description: 'Create git ref' },
          { name: 'push_commit', description: 'Push signed commit to remote' }
        ]
      }
    ]
  },
  {
    id: 'critic-agent',
    base_url: 'http://localhost:8003',
    version: '1.1.4',
    team_id: 'qa-governance',
    health_status: 'healthy',
    lifecycle_status: 'running',
    last_heartbeat: new Date().toISOString(),
    registered_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    deployment_type: 'long_running',
    reasoner_count: 2,
    skill_count: 1,
    reasoners: [
      {
        id: 'critic-agent.verify_output',
        name: 'verify_output',
        description: 'Validates factual alignment, schema adherence, and security policies.',
        schema: {
          type: 'object',
          properties: {
            claim: { type: 'string' },
            evidence: { type: 'string' }
          },
          required: ['claim', 'evidence']
        }
      },
      {
        id: 'critic-agent.audit_vc',
        name: 'audit_vc',
        description: 'Cryptographically verifies W3C Verifiable Credential signature chain.',
        schema: {
          type: 'object',
          properties: {
            credential_jwt: { type: 'string' }
          },
          required: ['credential_jwt']
        }
      }
    ],
    skills: [
      { id: 'critic-agent.crypto_verify', name: 'crypto_verify', description: 'Ed25519 and secp256k1 cryptographic signature check' }
    ],
    mcp_summary: {
      total_servers: 1,
      healthy_servers: 1,
      degraded_servers: 0,
      failed_servers: 0,
      total_tools: 2
    },
    mcp_servers: [
      {
        server_alias: 'did-resolver',
        status: 'healthy',
        ping_latency_ms: 12,
        consecutive_failures: 0,
        tool_count: 2,
        tools: [
          { name: 'resolve_did_document', description: 'Resolve DID to public JWK' },
          { name: 'verify_credential_chain', description: 'Verify Merkle audit tree' }
        ]
      }
    ]
  },
  {
    id: 'planner-agent',
    base_url: 'http://localhost:8004',
    version: '1.3.1',
    team_id: 'orchestration',
    health_status: 'healthy',
    lifecycle_status: 'running',
    last_heartbeat: new Date().toISOString(),
    registered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    deployment_type: 'long_running',
    reasoner_count: 2,
    skill_count: 1,
    reasoners: [
      {
        id: 'planner-agent.create_dag',
        name: 'create_dag',
        description: 'Decomposes complex human goal into directed acyclic graph of agent tasks.',
        schema: {
          type: 'object',
          properties: {
            goal: { type: 'string' }
          },
          required: ['goal']
        }
      },
      {
        id: 'planner-agent.replan_on_failure',
        name: 'replan_on_failure',
        description: 'Dynamically reconfigures execution graph when sub-agent encounters failure.',
        schema: {
          type: 'object',
          properties: {
            failed_task_id: { type: 'string' },
            error_reason: { type: 'string' }
          },
          required: ['failed_task_id']
        }
      }
    ],
    skills: [
      { id: 'planner-agent.dag_validator', name: 'dag_validator', description: 'Topological sort & cycle detection' }
    ],
    mcp_summary: {
      total_servers: 0,
      healthy_servers: 0,
      degraded_servers: 0,
      failed_servers: 0,
      total_tools: 0
    },
    mcp_servers: []
  },
  {
    id: 'document-indexer-serverless',
    base_url: 'https://cloudrun.example.com/indexer',
    version: '0.9.5',
    team_id: 'search-infra',
    health_status: 'degraded',
    lifecycle_status: 'running',
    last_heartbeat: new Date(Date.now() - 360000).toISOString(),
    registered_at: new Date(Date.now() - 86400000).toISOString(),
    deployment_type: 'serverless',
    invocation_url: 'https://cloudrun.example.com/indexer/invoke',
    reasoner_count: 1,
    skill_count: 2,
    reasoners: [
      {
        id: 'document-indexer-serverless.chunk_and_embed',
        name: 'chunk_and_embed',
        description: 'Generates text embeddings using high-throughput serverless worker.',
        schema: {
          type: 'object',
          properties: {
            document_id: { type: 'string' }
          },
          required: ['document_id']
        }
      }
    ],
    skills: [
      { id: 'document-indexer-serverless.split_text', name: 'split_text', description: 'Semantic token chunker' },
      { id: 'document-indexer-serverless.upsert_vectors', name: 'upsert_vectors', description: 'Batch vector upsert' }
    ],
    mcp_summary: {
      total_servers: 0,
      healthy_servers: 0,
      degraded_servers: 0,
      failed_servers: 0,
      total_tools: 0
    },
    mcp_servers: []
  }
];

// Mock Workflows
const mockWorkflows = [
  {
    run_id: 'wf-run-9842',
    workflow_id: 'wf-deep-research-001',
    root_execution_id: 'exec-84210',
    status: 'succeeded',
    root_reasoner: 'planner-agent.create_dag',
    current_task: 'Completed report synthesis & verification',
    total_executions: 6,
    max_depth: 3,
    started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    latest_activity: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    duration_ms: 720000,
    display_name: 'Deep Research: Autonomous Vehicle Regulations 2026',
    agent_id: 'planner-agent',
    agent_name: 'Planner Agent',
    session_id: 'sess-usr-4912',
    actor_id: 'actor-developer',
    status_counts: { succeeded: 6, failed: 0, running: 0 },
    active_executions: 0,
    terminal: true
  },
  {
    run_id: 'wf-run-9843',
    workflow_id: 'wf-code-security-audit-002',
    root_execution_id: 'exec-84220',
    status: 'running',
    root_reasoner: 'coder-agent.review_diff',
    current_task: 'Critic agent running cryptographic proof checks',
    total_executions: 4,
    max_depth: 2,
    started_at: new Date(Date.now() - 120000).toISOString(),
    latest_activity: new Date(Date.now() - 15000).toISOString(),
    duration_ms: 105000,
    display_name: 'Security Audit: PR #318 Dependency Graph',
    agent_id: 'coder-agent',
    agent_name: 'Coder Agent',
    session_id: 'sess-usr-8812',
    actor_id: 'actor-ci-bot',
    status_counts: { succeeded: 2, running: 2, failed: 0 },
    active_executions: 2,
    terminal: false
  },
  {
    run_id: 'wf-run-9840',
    workflow_id: 'wf-doc-sync-003',
    root_execution_id: 'exec-84190',
    status: 'failed',
    root_reasoner: 'researcher-agent.summarize',
    current_task: 'Serverless indexer rate limit exceeded',
    total_executions: 3,
    max_depth: 2,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    latest_activity: new Date(Date.now() - 86400000 + 45000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 + 45000).toISOString(),
    duration_ms: 45000,
    display_name: 'Doc Sync: RFC 9110 HTTP Semantics Indexing',
    agent_id: 'researcher-agent',
    agent_name: 'Researcher Agent',
    session_id: 'sess-usr-1200',
    actor_id: 'actor-doc-worker',
    status_counts: { succeeded: 1, failed: 2, running: 0 },
    active_executions: 0,
    terminal: true
  }
];

// Mock Executions
let mockExecutions = [
  {
    id: 1,
    execution_id: 'exec-84221',
    workflow_id: 'wf-code-security-audit-002',
    agentfield_request_id: 'req-af-99120',
    session_id: 'sess-usr-8812',
    actor_id: 'actor-ci-bot',
    agent_node_id: 'critic-agent',
    parent_workflow_id: 'wf-code-security-audit-002',
    root_workflow_id: 'wf-code-security-audit-002',
    workflow_depth: 2,
    reasoner_id: 'critic-agent.verify_output',
    task_name: 'Verify Diff Security Invariants',
    workflow_name: 'Security Audit: PR #318 Dependency Graph',
    agent_name: 'Critic Agent',
    status: 'running',
    duration_ms: 32000,
    input_size: 4280,
    output_size: 0,
    input_data: {
      claim: 'No unauthorized filesystem write primitives detected in PR #318 diff',
      evidence: 'AST parser trace from coder-agent review_diff step'
    },
    output_data: null,
    workflow_tags: ['security', 'ci-check', 'ast-analysis'],
    created_at: new Date(Date.now() - 32000).toISOString(),
    started_at: new Date(Date.now() - 32000).toISOString(),
    retry_count: 0,
    updated_at: new Date().toISOString(),
    notes: [
      { message: 'Verification initiated against NIST-800 guidelines', tags: ['audit'], timestamp: new Date(Date.now() - 25000).toISOString() }
    ],
    webhook_registered: true,
    webhook_events: [
      { id: 1, execution_id: 'exec-84221', event_type: 'started', status: 'delivered', http_status: 200, created_at: new Date(Date.now() - 31000).toISOString() }
    ]
  },
  {
    id: 2,
    execution_id: 'exec-84220',
    workflow_id: 'wf-code-security-audit-002',
    agentfield_request_id: 'req-af-99119',
    session_id: 'sess-usr-8812',
    actor_id: 'actor-ci-bot',
    agent_node_id: 'coder-agent',
    parent_workflow_id: 'wf-code-security-audit-002',
    root_workflow_id: 'wf-code-security-audit-002',
    workflow_depth: 1,
    reasoner_id: 'coder-agent.review_diff',
    task_name: 'Diff AST Inspection',
    workflow_name: 'Security Audit: PR #318 Dependency Graph',
    agent_name: 'Coder Agent',
    status: 'succeeded',
    duration_ms: 18450,
    input_size: 12400,
    output_size: 3200,
    input_data: { diff_content: '@@ -42,6 +42,12 @@ import express from "express";\n+import helmet from "helmet";\n+app.use(helmet());' },
    output_data: { findings: [], security_score: 98, approved: true },
    workflow_tags: ['security', 'ci-check'],
    created_at: new Date(Date.now() - 95000).toISOString(),
    started_at: new Date(Date.now() - 95000).toISOString(),
    completed_at: new Date(Date.now() - 76550).toISOString(),
    retry_count: 0,
    updated_at: new Date(Date.now() - 76550).toISOString(),
    notes: [],
    webhook_registered: true,
    webhook_events: [
      { id: 2, execution_id: 'exec-84220', event_type: 'completed', status: 'delivered', http_status: 200, created_at: new Date(Date.now() - 76500).toISOString() }
    ]
  },
  {
    id: 3,
    execution_id: 'exec-84210',
    workflow_id: 'wf-deep-research-001',
    agentfield_request_id: 'req-af-99100',
    session_id: 'sess-usr-4912',
    actor_id: 'actor-developer',
    agent_node_id: 'planner-agent',
    root_workflow_id: 'wf-deep-research-001',
    workflow_depth: 1,
    reasoner_id: 'planner-agent.create_dag',
    task_name: 'Decompose Research Plan',
    workflow_name: 'Deep Research: Autonomous Vehicle Regulations 2026',
    agent_name: 'Planner Agent',
    status: 'succeeded',
    duration_ms: 8400,
    input_size: 512,
    output_size: 2048,
    input_data: { goal: 'Investigate latest UNECE WP.29 regulatory changes for automated lane keeping systems' },
    output_data: {
      plan_steps: ['Query UNECE official releases', 'Synthesize cross-jurisdiction impacts', 'Generate verified compliance briefing'],
      total_subtasks: 3
    },
    workflow_tags: ['research', 'regulation', 'autonomous-systems'],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    started_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 7191600).toISOString(),
    retry_count: 0,
    updated_at: new Date(Date.now() - 7191600).toISOString(),
    notes: [{ message: 'DAG compiled with 0 cyclic dependencies', tags: ['dag', 'planner'], timestamp: new Date(Date.now() - 7195000).toISOString() }]
  },
  {
    id: 4,
    execution_id: 'exec-84211',
    workflow_id: 'wf-deep-research-001',
    agentfield_request_id: 'req-af-99101',
    session_id: 'sess-usr-4912',
    actor_id: 'actor-developer',
    agent_node_id: 'researcher-agent',
    parent_workflow_id: 'wf-deep-research-001',
    root_workflow_id: 'wf-deep-research-001',
    workflow_depth: 2,
    reasoner_id: 'researcher-agent.deep_dive',
    task_name: 'Synthesize Multi-Source Regulation Report',
    workflow_name: 'Deep Research: Autonomous Vehicle Regulations 2026',
    agent_name: 'Researcher Agent',
    status: 'succeeded',
    duration_ms: 48200,
    input_size: 890,
    output_size: 14200,
    input_data: { topic: 'UNECE WP.29 ALKS speed increase amendment', max_sources: 4 },
    output_data: {
      executive_summary: 'WP.29 extended ALKS operational envelope to 130 km/h under specified motorway conditions, requiring dual-channel redundant cybersecurity audit.',
      citations: ['UNECE/TRANS/WP.29/2024/78', 'ISO/SAE 21434 Road Vehicles Cybersecurity']
    },
    workflow_tags: ['research', 'regulation'],
    created_at: new Date(Date.now() - 7190000).toISOString(),
    started_at: new Date(Date.now() - 7190000).toISOString(),
    completed_at: new Date(Date.now() - 7141800).toISOString(),
    retry_count: 0,
    updated_at: new Date(Date.now() - 7141800).toISOString(),
    notes: []
  },
  {
    id: 5,
    execution_id: 'exec-84190',
    workflow_id: 'wf-doc-sync-003',
    agentfield_request_id: 'req-af-98900',
    session_id: 'sess-usr-1200',
    actor_id: 'actor-doc-worker',
    agent_node_id: 'document-indexer-serverless',
    parent_workflow_id: 'wf-doc-sync-003',
    root_workflow_id: 'wf-doc-sync-003',
    workflow_depth: 2,
    reasoner_id: 'document-indexer-serverless.chunk_and_embed',
    task_name: 'Serverless Batch Embedding',
    workflow_name: 'Doc Sync: RFC 9110 HTTP Semantics Indexing',
    agent_name: 'Document Indexer (Serverless)',
    status: 'failed',
    duration_ms: 25000,
    input_size: 45000,
    output_size: 120,
    error_message: 'HTTP 429 Too Many Requests: Upstream embedding API quota limit exceeded during batch chunk 14.',
    input_data: { document_id: 'doc-rfc-9110' },
    output_data: null,
    workflow_tags: ['indexing', 'embeddings', 'error'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 + 25000).toISOString(),
    retry_count: 2,
    updated_at: new Date(Date.now() - 86400000 + 25000).toISOString(),
    notes: [
      { message: 'Auto-retry triggered twice with exponential backoff (2s, 4s). Quota remained exhausted.', tags: ['retry', 'alert'], timestamp: new Date(Date.now() - 86400000 + 24000).toISOString() }
    ]
  }
];

// Mock Packages
const mockPackages = [
  {
    id: 'pkg-agentfield-core',
    name: 'agentfield-core-reasoners',
    description: 'Essential reasoners for DAG coordination, task decomposition, and cryptographic VC auditing.',
    version: '1.4.0',
    installed: true,
    installed_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    author: 'AgentField Team',
    agents: ['planner-agent', 'critic-agent'],
    repository: 'https://github.com/Agent-Field/agentfield'
  },
  {
    id: 'pkg-web-research',
    name: 'web-research-suite',
    description: 'Autonomous research agents with Brave search, PDF extraction, and claim extraction skills.',
    version: '1.1.2',
    installed: true,
    installed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: 'AgentField Community',
    agents: ['researcher-agent'],
    repository: 'https://github.com/Agent-Field/web-research-suite'
  },
  {
    id: 'pkg-developer-copilot',
    name: 'code-review-copilot',
    description: 'Automated pull-request analysis, test generation, and semantic patch generation.',
    version: '2.0.1',
    installed: true,
    installed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    author: 'AgentField Team',
    agents: ['coder-agent'],
    repository: 'https://github.com/Agent-Field/code-review-copilot'
  },
  {
    id: 'pkg-multimodal-vision',
    name: 'multimodal-vision-pack',
    description: 'Inspects user interface mockups, chart screenshots, and diagrams for layout regressions.',
    version: '0.8.0',
    installed: false,
    author: 'Vision Labs',
    agents: [],
    repository: 'https://github.com/Agent-Field/multimodal-vision'
  }
];

// --- ROUTES ---

// 1. Dashboard APIs
app.get(['/api/ui/v1/dashboard/summary', '/api/dashboard/summary'], (req, res) => {
  const runningAgents = mockAgents.filter(a => a.health_status === 'healthy').length;
  res.json({
    agents: {
      running: runningAgents,
      total: mockAgents.length
    },
    executions: {
      today: 184,
      yesterday: 152
    },
    success_rate: 97.4,
    packages: {
      available: mockPackages.length,
      installed: mockPackages.filter(p => p.installed).length
    }
  });
});

app.get(['/api/ui/v1/dashboard/enhanced', '/api/dashboard/enhanced'], (req, res) => {
  const activeCount = mockAgents.filter(a => a.health_status === 'healthy').length;
  const degradedCount = mockAgents.filter(a => a.health_status === 'degraded').length;
  const offlineCount = mockAgents.filter(a => a.health_status === 'offline').length;
  const totalReasoners = mockAgents.reduce((acc, a) => acc + (a.reasoners?.length || 0), 0);
  const totalSkills = mockAgents.reduce((acc, a) => acc + (a.skills?.length || 0), 0);

  const dates7d = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().split('T')[0];
  });

  res.json({
    generated_at: new Date().toISOString(),
    overview: {
      total_agents: mockAgents.length,
      active_agents: activeCount,
      degraded_agents: degradedCount,
      offline_agents: offlineCount,
      total_reasoners: totalReasoners,
      total_skills: totalSkills,
      executions_last_24h: 184,
      executions_last_7d: 1140,
      success_rate_24h: 97.4,
      average_duration_ms_24h: 1420,
      median_duration_ms_24h: 890
    },
    execution_trends: {
      last_24h: {
        total: 184,
        succeeded: 179,
        failed: 5,
        success_rate: 97.28,
        average_duration_ms: 1420,
        throughput_per_hour: 7.6
      },
      last_7_days: dates7d.map((date, idx) => ({
        date,
        total: 140 + idx * 12,
        succeeded: 135 + idx * 11,
        failed: 5 + (idx % 2)
      }))
    },
    agent_health: {
      total: mockAgents.length,
      active: activeCount,
      degraded: degradedCount,
      offline: offlineCount,
      agents: mockAgents.map(a => ({
        id: a.id,
        team_id: a.team_id || 'default',
        version: a.version,
        status: a.health_status,
        health: a.health_status,
        lifecycle: a.lifecycle_status || 'running',
        last_heartbeat: a.last_heartbeat || new Date().toISOString(),
        reasoners: a.reasoners?.length || 0,
        skills: a.skills?.length || 0,
        uptime: '99.98%'
      }))
    },
    workflows: {
      top_workflows: mockWorkflows.map(w => ({
        workflow_id: w.workflow_id,
        name: w.display_name,
        total_executions: w.total_executions,
        success_rate: w.status === 'succeeded' ? 100 : w.status === 'failed' ? 33.3 : 85,
        failed_executions: w.status === 'failed' ? 1 : 0,
        average_duration_ms: w.duration_ms || 50000,
        last_activity: w.latest_activity
      })),
      active_runs: mockWorkflows.filter(w => w.status === 'running').map(w => ({
        execution_id: w.root_execution_id || 'exec-active-1',
        workflow_id: w.workflow_id,
        name: w.display_name,
        started_at: w.started_at,
        elapsed_ms: Date.now() - new Date(w.started_at).getTime(),
        agent_node_id: w.agent_id || 'coder-agent',
        reasoner_id: w.root_reasoner,
        status: w.status
      })),
      longest_executions: mockExecutions.slice(0, 3).map(e => ({
        execution_id: e.execution_id,
        workflow_id: e.workflow_id,
        name: e.task_name,
        duration_ms: e.duration_ms,
        completed_at: e.completed_at,
        status: e.status
      }))
    },
    incidents: mockExecutions.filter(e => e.status === 'failed').map(e => ({
      execution_id: e.execution_id,
      workflow_id: e.workflow_id,
      name: e.task_name,
      status: e.status,
      started_at: e.started_at,
      completed_at: e.completed_at,
      agent_node_id: e.agent_node_id,
      reasoner_id: e.reasoner_id,
      error: e.error_message
    }))
  });
});

// 2. Nodes APIs
app.get(['/api/ui/v1/nodes/summary', '/api/nodes/summary'], (req, res) => {
  const summaries = mockAgents.map(a => ({
    id: a.id,
    base_url: a.base_url,
    version: a.version,
    team_id: a.team_id || 'default',
    health_status: a.health_status,
    lifecycle_status: a.lifecycle_status || 'running',
    last_heartbeat: a.last_heartbeat,
    deployment_type: a.deployment_type,
    invocation_url: a.invocation_url,
    mcp_summary: a.mcp_summary,
    reasoner_count: a.reasoners?.length || 0,
    skill_count: a.skills?.length || 0
  }));
  res.json({ nodes: summaries, count: summaries.length });
});

app.get(['/api/ui/v1/nodes/:nodeId/details', '/api/nodes/:nodeId/details'], (req, res) => {
  const node = mockAgents.find(a => a.id === req.params.nodeId);
  if (!node) {
    return res.status(404).json({ message: 'Node not found' });
  }
  res.json(node);
});

app.get(['/api/ui/v1/nodes/:nodeId/status', '/api/nodes/:nodeId/status'], (req, res) => {
  const node = mockAgents.find(a => a.id === req.params.nodeId);
  if (!node) {
    return res.status(404).json({ message: 'Node not found' });
  }
  res.json({
    node_id: node.id,
    status: node.health_status,
    health: node.health_status,
    lifecycle: node.lifecycle_status || 'running',
    last_heartbeat: node.last_heartbeat || new Date().toISOString()
  });
});

app.post(['/api/ui/v1/nodes/:nodeId/status/refresh', '/api/nodes/:nodeId/status/refresh'], (req, res) => {
  const node = mockAgents.find(a => a.id === req.params.nodeId);
  if (node) {
    node.last_heartbeat = new Date().toISOString();
  }
  res.json({ status: 'healthy', refreshed_at: new Date().toISOString() });
});

app.get(['/api/ui/v1/nodes/:nodeId/did', '/api/nodes/:nodeId/did'], (req, res) => {
  const nodeId = req.params.nodeId;
  const agentDid = `did:key:z6MkuV${Buffer.from(nodeId).toString('hex').slice(0, 32)}`;
  res.json({
    did: agentDid,
    agent_node_id: nodeId,
    status: 'active',
    derivation_path: `m/44'/1237'/${nodeId.length}'/0`,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    reasoners: (mockAgents.find(a => a.id === nodeId)?.reasoners || []).map((r, i) => ({
      did: `${agentDid}#reasoner-${i + 1}`,
      name: r.name,
      component_name: r.name,
      type: 'reasoner',
      derivation_path: `m/44'/1237'/${nodeId.length}'/1/${i}`,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    })),
    skills: (mockAgents.find(a => a.id === nodeId)?.skills || []).map((s, i) => ({
      did: `${agentDid}#skill-${i + 1}`,
      name: s.name,
      component_name: s.name,
      type: 'skill',
      derivation_path: `m/44'/1237'/${nodeId.length}'/2/${i}`,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }))
  });
});

// Helper for SSE headers
function setupSSEHeaders(res: express.Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

// SSE endpoint for Reasoners events
app.get(['/api/ui/v1/reasoners/events', '/api/reasoners/events'], (req, res) => {
  setupSSEHeaders(res);

  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'Reasoner SSE connected',
    timestamp: new Date().toISOString()
  })}\n\n`);

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 10000);

  req.on('close', () => clearInterval(interval));
});

// SSE endpoint for Node events
app.get(['/api/ui/v1/nodes/events', '/api/nodes/events'], (req, res) => {
  setupSSEHeaders(res);

  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'Node events stream connected',
    timestamp: new Date().toISOString()
  })}\n\n`);

  const interval = setInterval(() => {
    const randomAgent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
    const data = JSON.stringify({
      type: 'node_heartbeat',
      node_id: randomAgent.id,
      health: randomAgent.health_status,
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${data}\n\n`);
  }, 10000);

  req.on('close', () => clearInterval(interval));
});

// SSE endpoint for Executions events
app.get(['/api/ui/v1/executions/events', '/api/executions/events'], (req, res) => {
  setupSSEHeaders(res);

  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'Executions stream connected',
    timestamp: new Date().toISOString()
  })}\n\n`);

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 10000);

  req.on('close', () => clearInterval(interval));
});

// SSE endpoint for Execution Notes stream
app.get(['/api/ui/v1/executions/:id/notes/stream', '/api/executions/:id/notes/stream'], (req, res) => {
  setupSSEHeaders(res);

  res.write(`data: ${JSON.stringify({
    type: 'connected',
    execution_id: req.params.id,
    timestamp: new Date().toISOString()
  })}\n\n`);

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 10000);

  req.on('close', () => clearInterval(interval));
});

// SSE endpoint for MCP health events
app.get(['/api/ui/v1/nodes/:nodeId/mcp/events', '/api/nodes/:nodeId/mcp/events'], (req, res) => {
  setupSSEHeaders(res);

  res.write(`data: ${JSON.stringify({
    type: 'connected',
    node_id: req.params.nodeId,
    timestamp: new Date().toISOString()
  })}\n\n`);

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'health_update',
      node_id: req.params.nodeId,
      status: 'healthy',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 10000);

  req.on('close', () => clearInterval(interval));
});

// 3. MCP APIs
app.get(['/api/ui/v1/mcp/status', '/api/mcp/status'], (req, res) => {
  res.json({ status: 'healthy', total_servers: 4, healthy_servers: 4 });
});

app.get(['/api/ui/v1/nodes/:nodeId/mcp/health', '/api/nodes/:nodeId/mcp/health'], (req, res) => {
  const node = mockAgents.find(a => a.id === req.params.nodeId);
  res.json({
    status: node?.health_status || 'healthy',
    mcp_summary: node?.mcp_summary || { total_servers: 0, healthy_servers: 0, degraded_servers: 0, failed_servers: 0, total_tools: 0 },
    mcp_servers: node?.mcp_servers || []
  });
});

app.get(['/api/ui/v1/nodes/:nodeId/mcp/servers/:serverId/tools', '/api/nodes/:nodeId/mcp/servers/:serverId/tools'], (req, res) => {
  const node = mockAgents.find(a => a.id === req.params.nodeId);
  const server = node?.mcp_servers?.find(s => s.server_alias === req.params.serverId);
  res.json({ tools: server?.tools || [] });
});

app.post(['/api/ui/v1/nodes/:nodeId/mcp/servers/:serverId/tools/:toolName/test', '/api/nodes/:nodeId/mcp/servers/:serverId/tools/:toolName/test'], (req, res) => {
  res.json({
    success: true,
    execution_time_ms: Math.floor(Math.random() * 40) + 15,
    result: {
      status: 'executed',
      tool: req.params.toolName,
      server: req.params.serverId,
      parameters_echo: req.body.parameters || {},
      output: `Test execution of tool '${req.params.toolName}' succeeded on agent '${req.params.nodeId}' with zero exceptions.`
    }
  });
});

app.get(['/api/ui/v1/nodes/:nodeId/mcp/metrics', '/api/nodes/:nodeId/mcp/metrics'], (req, res) => {
  res.json({
    metrics: {
      uptime_percentage: 99.98,
      p95_latency_ms: 38,
      total_calls: 1249,
      error_rate: 0.001
    }
  });
});

app.get(['/api/ui/v1/nodes/:nodeId/mcp/events/history', '/api/nodes/:nodeId/mcp/events/history'], (req, res) => {
  res.json({
    events: [
      { id: 1, type: 'ping', status: 'healthy', latency_ms: 18, timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 2, type: 'tool_call', status: 'success', latency_ms: 32, timestamp: new Date(Date.now() - 300000).toISOString() }
    ]
  });
});

// 4. Reasoners APIs
app.get(['/api/ui/v1/reasoners/all', '/api/reasoners/all'], (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
  const reasonersWithNodes: any[] = [];

  mockAgents.forEach(agent => {
    (agent.reasoners || []).forEach(r => {
      if (!search || r.name.toLowerCase().includes(search) || r.description?.toLowerCase().includes(search)) {
        reasonersWithNodes.push({
          ...r,
          agent_node_id: agent.id,
          agent_node_name: agent.id,
          agent_node: agent,
          full_reasoner_id: `${agent.id}.${r.name}`,
          is_online: agent.health_status === 'healthy',
          status: agent.health_status,
          health_status: agent.health_status
        });
      }
    });
  });

  res.json({
    reasoners: reasonersWithNodes,
    total: reasonersWithNodes.length,
    online_count: reasonersWithNodes.filter(r => r.is_online).length,
    offline_count: reasonersWithNodes.filter(r => !r.is_online).length,
    nodes_count: mockAgents.length
  });
});

app.get(['/api/ui/v1/reasoners/:reasonerId/details', '/api/reasoners/:reasonerId/details'], (req, res) => {
  const fullId = req.params.reasonerId;
  let targetReasoner: any = null;
  let targetAgent: any = null;

  for (const agent of mockAgents) {
    const found = agent.reasoners?.find(r => r.id === fullId || `${agent.id}.${r.name}` === fullId || r.name === fullId);
    if (found) {
      targetReasoner = found;
      targetAgent = agent;
      break;
    }
  }

  if (!targetReasoner) {
    return res.status(404).json({ message: 'Reasoner not found' });
  }

  res.json({
    ...targetReasoner,
    agent_node_id: targetAgent.id,
    agent_node_name: targetAgent.id,
    agent_node: targetAgent,
    full_reasoner_id: `${targetAgent.id}.${targetReasoner.name}`,
    is_online: targetAgent.health_status === 'healthy',
    status: targetAgent.health_status
  });
});

// Reasoner Execution API
const handleExecute = (req: express.Request, res: express.Response) => {
  const reasonerId = req.params.reasonerId;
  const input = req.body || {};
  const executionId = `exec-${Date.now()}`;
  const duration = Math.floor(Math.random() * 300) + 120;

  const newExecution = {
    id: mockExecutions.length + 1,
    execution_id: executionId,
    workflow_id: 'wf-interactive-run',
    agentfield_request_id: `req-${Date.now()}`,
    session_id: 'sess-ui-interactive',
    actor_id: 'actor-current-user',
    agent_node_id: reasonerId.split('.')[0] || 'researcher-agent',
    parent_workflow_id: 'wf-interactive-run',
    root_workflow_id: 'wf-interactive-run',
    workflow_depth: 1,
    reasoner_id: reasonerId,
    task_name: `Interactive Execution: ${reasonerId}`,
    workflow_name: 'Interactive Test Playground',
    agent_name: reasonerId.split('.')[0] || 'Agent',
    status: 'succeeded' as const,
    duration_ms: duration,
    input_size: JSON.stringify(input).length,
    output_size: 420,
    input_data: input,
    output_data: {
      status: 'success',
      executed_at: new Date().toISOString(),
      reasoner: reasonerId,
      result_summary: `Reasoner '${reasonerId}' executed successfully with input keys: [${Object.keys(input).join(', ')}].`,
      verified: true
    },
    workflow_tags: ['interactive', 'manual-test'],
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    retry_count: 0,
    updated_at: new Date().toISOString(),
    notes: [
      { message: 'Executed via AgentField UI Reasoner Playground', tags: ['ui', 'test'], timestamp: new Date().toISOString() }
    ]
  };

  mockExecutions.unshift(newExecution);

  res.json({
    execution_id: executionId,
    status: 'succeeded',
    result: newExecution.output_data,
    duration_ms: duration,
    execution_time_ms: duration,
    started_at: newExecution.started_at,
    completed_at: newExecution.completed_at
  });
};

app.post(['/api/v1/execute/:reasonerId', '/api/ui/v1/execute/:reasonerId', '/execute/:reasonerId'], handleExecute);

// 5. Executions APIs
app.get(['/api/ui/v1/executions', '/api/executions'], (req, res) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const pageSize = parseInt(req.query.page_size as string || '20', 10);
  const statusFilter = req.query.status as string;
  const searchFilter = req.query.search as string;
  const workflowFilter = req.query.workflow_id as string;
  const nodeFilter = req.query.agent_node_id as string;

  let filtered = [...mockExecutions];

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (workflowFilter) {
    filtered = filtered.filter(e => e.workflow_id === workflowFilter);
  }
  if (nodeFilter) {
    filtered = filtered.filter(e => e.agent_node_id === nodeFilter);
  }
  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(e =>
      e.execution_id.toLowerCase().includes(q) ||
      e.reasoner_id.toLowerCase().includes(q) ||
      (e.task_name && e.task_name.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  res.json({
    executions: paginated,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages
  });
});

app.get(['/api/ui/v1/executions/stats', '/api/executions/stats'], (req, res) => {
  const total = mockExecutions.length;
  const succeeded = mockExecutions.filter(e => e.status === 'succeeded').length;
  const failed = mockExecutions.filter(e => e.status === 'failed').length;
  const running = mockExecutions.filter(e => e.status === 'running').length;
  const avgDuration = Math.round(mockExecutions.reduce((acc, e) => acc + (e.duration_ms || 0), 0) / (total || 1));

  const byAgent: Record<string, number> = {};
  mockExecutions.forEach(e => {
    byAgent[e.agent_node_id] = (byAgent[e.agent_node_id] || 0) + 1;
  });

  res.json({
    total_executions: total,
    successful_count: succeeded,
    failed_count: failed,
    running_count: running,
    average_duration_ms: avgDuration,
    executions_by_status: {
      succeeded,
      failed,
      running
    },
    executions_by_agent: byAgent
  });
});

app.get(['/api/ui/v1/executions/recent', '/api/executions/recent'], (req, res) => {
  res.json({
    recent_activities: mockExecutions.slice(0, 10).map(e => ({
      id: e.id,
      execution_id: e.execution_id,
      workflow_id: e.workflow_id,
      agent_node_id: e.agent_node_id,
      reasoner_id: e.reasoner_id,
      status: e.status,
      timestamp: e.started_at,
      duration_ms: e.duration_ms
    }))
  });
});

app.get(['/api/ui/v1/executions/timeline', '/api/executions/timeline'], (req, res) => {
  const now = Date.now();
  const intervals = Array.from({ length: 12 }, (_, i) => {
    const t = new Date(now - (11 - i) * 3600000);
    return {
      timestamp: t.toISOString(),
      label: `${t.getHours()}:00`,
      total: Math.floor(Math.random() * 15) + 5,
      succeeded: Math.floor(Math.random() * 12) + 5,
      failed: Math.floor(Math.random() * 2),
      avg_duration_ms: Math.floor(Math.random() * 800) + 400
    };
  });

  res.json({ intervals });
});

app.get(['/api/ui/v1/executions/:id', '/api/executions/:id'], (req, res) => {
  const execution = mockExecutions.find(e => e.execution_id === req.params.id);
  if (!execution) {
    return res.status(404).json({ message: 'Execution not found' });
  }
  res.json(execution);
});

app.post(['/api/ui/v1/executions/:id/retry', '/api/executions/:id/retry'], (req, res) => {
  const execution = mockExecutions.find(e => e.execution_id === req.params.id);
  if (!execution) {
    return res.status(404).json({ message: 'Execution not found' });
  }
  execution.status = 'running';
  execution.retry_count += 1;
  setTimeout(() => {
    execution.status = 'succeeded';
    execution.completed_at = new Date().toISOString();
  }, 2000);
  res.json({ message: 'Retry queued successfully', execution });
});

app.post(['/api/ui/v1/executions/:id/notes', '/api/executions/:id/notes'], (req, res) => {
  const execution = mockExecutions.find(e => e.execution_id === req.params.id);
  if (!execution) {
    return res.status(404).json({ message: 'Execution not found' });
  }
  const note = {
    message: req.body.message || '',
    tags: req.body.tags || [],
    timestamp: new Date().toISOString()
  };
  execution.notes = execution.notes || [];
  execution.notes.push(note);
  res.json({ message: 'Note added', note });
});

// 6. Workflows APIs
const mapWorkflowToApiRun = (w: typeof mockWorkflows[0]) => ({
  run_id: w.run_id,
  workflow_id: w.workflow_id,
  root_execution_id: w.root_execution_id,
  status: w.status,
  display_name: w.display_name,
  current_task: w.current_task,
  root_reasoner: w.root_reasoner,
  agent_id: w.agent_id,
  session_id: w.session_id,
  actor_id: w.actor_id,
  total_executions: w.total_executions,
  max_depth: w.max_depth,
  active_executions: w.active_executions,
  status_counts: w.status_counts,
  started_at: w.started_at,
  updated_at: w.latest_activity,
  latest_activity: w.latest_activity,
  completed_at: w.completed_at,
  duration_ms: w.duration_ms,
  terminal: w.terminal
});

// V2 Workflow Runs List
app.get(['/api/ui/v2/workflow-runs', '/api/ui/v1/workflow-runs', '/api/workflow-runs'], (req, res) => {
  const runId = req.query.run_id as string;
  const workflowId = req.query.workflow_id as string;
  const status = req.query.status as string;
  const search = (req.query.search as string || '').toLowerCase();
  const page = parseInt(req.query.page as string || '1', 10);
  const pageSize = parseInt(req.query.page_size as string || '20', 10);

  let filtered = [...mockWorkflows];
  if (runId) {
    filtered = filtered.filter(w => w.run_id === runId || w.workflow_id === runId);
  }
  if (workflowId) {
    filtered = filtered.filter(w => w.workflow_id === workflowId);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(w => w.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    filtered = filtered.filter(w =>
      w.display_name.toLowerCase().includes(search) ||
      w.workflow_id.toLowerCase().includes(search) ||
      w.current_task.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  res.json({
    runs: paginated.map(mapWorkflowToApiRun),
    total_count: total,
    page,
    page_size: pageSize,
    has_more: start + pageSize < total
  });
});

// V2 Workflow Run Detail
app.get(['/api/ui/v2/workflow-runs/:runId', '/api/ui/v1/workflow-runs/:runId', '/api/workflow-runs/:runId'], (req, res) => {
  const targetId = req.params.runId;
  const workflow = mockWorkflows.find(w => w.run_id === targetId || w.workflow_id === targetId);

  if (!workflow) {
    return res.status(404).json({ message: 'Workflow run not found' });
  }

  const related = mockExecutions.filter(e => e.workflow_id === workflow.workflow_id);

  res.json({
    run: {
      run_id: workflow.run_id,
      root_workflow_id: workflow.workflow_id,
      root_execution_id: workflow.root_execution_id,
      status: workflow.status,
      total_steps: workflow.total_executions,
      completed_steps: workflow.status_counts.succeeded || 0,
      failed_steps: workflow.status_counts.failed || 0,
      returned_steps: 0,
      status_counts: workflow.status_counts,
      created_at: workflow.started_at,
      updated_at: workflow.latest_activity,
      completed_at: workflow.completed_at
    },
    executions: related.map((e, idx) => ({
      execution_id: e.execution_id,
      workflow_id: e.workflow_id,
      parent_execution_id: idx > 0 ? related[idx - 1].execution_id : null,
      parent_workflow_id: e.parent_workflow_id || null,
      agent_node_id: e.agent_node_id,
      reasoner_id: e.reasoner_id,
      status: e.status,
      started_at: e.started_at,
      completed_at: e.completed_at || null,
      workflow_depth: e.workflow_depth,
      active_children: 0,
      pending_children: 0
    }))
  });
});

// Execute / Trigger Workflow
app.post(['/api/ui/v1/workflows/execute', '/api/ui/v2/workflow-runs', '/api/ui/v1/workflows/:id/execute'], (req, res) => {
  const targetWfId = req.params.id || req.body.workflow_id || `wf-intel-${Date.now().toString().slice(-4)}`;
  const displayName = req.body.display_name || req.body.name || `Autonomous Run: ${req.body.goal || 'Intelligence Synthesis'}`;
  const runId = `wf-run-${Date.now()}`;
  const exec1Id = `exec-${Date.now()}-1`;
  const exec2Id = `exec-${Date.now()}-2`;
  const exec3Id = `exec-${Date.now()}-3`;

  const newWorkflow = {
    run_id: runId,
    workflow_id: targetWfId,
    root_execution_id: exec1Id,
    status: 'running' as const,
    root_reasoner: 'planner-agent.create_dag',
    current_task: 'Decomposing task goal into verified DAG',
    total_executions: 3,
    max_depth: 2,
    started_at: new Date().toISOString(),
    latest_activity: new Date().toISOString(),
    duration_ms: 0,
    display_name: displayName,
    agent_id: 'planner-agent',
    agent_name: 'Planner Agent',
    session_id: `sess-${Date.now().toString().slice(-4)}`,
    actor_id: 'actor-developer',
    status_counts: { running: 1, pending: 2, succeeded: 0, failed: 0 },
    active_executions: 1,
    terminal: false
  };

  const newExecutions = [
    {
      id: mockExecutions.length + 1,
      execution_id: exec1Id,
      workflow_id: targetWfId,
      agentfield_request_id: `req-${Date.now()}-1`,
      session_id: newWorkflow.session_id,
      actor_id: 'actor-developer',
      agent_node_id: 'planner-agent',
      root_workflow_id: targetWfId,
      workflow_depth: 1,
      reasoner_id: 'planner-agent.create_dag',
      task_name: 'Goal Decomposition & DAG Synthesis',
      workflow_name: displayName,
      agent_name: 'Planner Agent',
      status: 'running' as const,
      duration_ms: 1200,
      input_size: 256,
      output_size: 1024,
      input_data: { goal: req.body.goal || displayName },
      output_data: null,
      workflow_tags: ['intelligence', 'dag', 'live'],
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      retry_count: 0,
      updated_at: new Date().toISOString(),
      notes: [{ message: 'DAG compiled by planner-agent', tags: ['workflow', 'started'], timestamp: new Date().toISOString() }],
      webhook_registered: true
    },
    {
      id: mockExecutions.length + 2,
      execution_id: exec2Id,
      workflow_id: targetWfId,
      agentfield_request_id: `req-${Date.now()}-2`,
      session_id: newWorkflow.session_id,
      actor_id: 'actor-developer',
      agent_node_id: 'researcher-agent',
      parent_workflow_id: targetWfId,
      root_workflow_id: targetWfId,
      workflow_depth: 2,
      reasoner_id: 'researcher-agent.summarize',
      task_name: 'Multi-Source Knowledge Retrieval',
      workflow_name: displayName,
      agent_name: 'Researcher Agent',
      status: 'pending' as const,
      duration_ms: 0,
      input_size: 512,
      output_size: 2048,
      input_data: { query: 'Synthesize research evidence' },
      output_data: null,
      workflow_tags: ['intelligence', 'research'],
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      retry_count: 0,
      updated_at: new Date().toISOString(),
      notes: []
    },
    {
      id: mockExecutions.length + 3,
      execution_id: exec3Id,
      workflow_id: targetWfId,
      agentfield_request_id: `req-${Date.now()}-3`,
      session_id: newWorkflow.session_id,
      actor_id: 'actor-developer',
      agent_node_id: 'critic-agent',
      parent_workflow_id: targetWfId,
      root_workflow_id: targetWfId,
      workflow_depth: 2,
      reasoner_id: 'critic-agent.verify_output',
      task_name: 'Cryptographic & Policy Verification',
      workflow_name: displayName,
      agent_name: 'Critic Agent',
      status: 'pending' as const,
      duration_ms: 0,
      input_size: 1024,
      output_size: 512,
      input_data: { claim: 'Verifiable integrity assertions' },
      output_data: null,
      workflow_tags: ['intelligence', 'verification'],
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      retry_count: 0,
      updated_at: new Date().toISOString(),
      notes: []
    }
  ];

  mockWorkflows.unshift(newWorkflow);
  mockExecutions.unshift(...newExecutions);

  // Transition to succeeded after 2.5 seconds
  setTimeout(() => {
    newWorkflow.status = 'succeeded' as const;
    newWorkflow.terminal = true;
    newWorkflow.completed_at = new Date().toISOString();
    newWorkflow.current_task = 'All workflow intelligence steps executed and cryptographically verified';
    newWorkflow.duration_ms = 2500;
    newWorkflow.active_executions = 0;
    newWorkflow.status_counts = { succeeded: 3, running: 0, failed: 0 };

    newExecutions.forEach(e => {
      e.status = 'succeeded' as const;
      e.completed_at = new Date().toISOString();
      e.duration_ms = 800;
      e.output_data = {
        result: 'Executed successfully',
        verified: true,
        summary: `Task '${e.task_name}' executed cleanly with 0 faults.`
      };
    });
  }, 2500);

  res.status(201).json({
    success: true,
    run_id: runId,
    workflow_id: targetWfId,
    display_name: displayName,
    status: 'running',
    message: 'Workflow intelligence executed successfully',
    workflow: mapWorkflowToApiRun(newWorkflow)
  });
});

// Enhanced Executions API
app.get(['/api/ui/v1/executions/enhanced', '/api/executions/enhanced'], (req, res) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const pageSize = parseInt(req.query.limit as string || req.query.page_size as string || '20', 10);
  const statusFilter = req.query.status as string;
  const workflowIdFilter = req.query.workflow_id as string;

  let filtered = [...mockExecutions];
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (workflowIdFilter) {
    filtered = filtered.filter(e => e.workflow_id === workflowIdFilter);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  res.json({
    executions: paginated.map(e => ({
      execution_id: e.execution_id,
      workflow_id: e.workflow_id,
      status: e.status,
      task_name: e.task_name,
      workflow_name: e.workflow_name,
      agent_name: e.agent_name,
      relative_time: 'Just now',
      duration_display: `${Math.round((e.duration_ms || 1000) / 1000)}s`,
      started_at: e.started_at,
      completed_at: e.completed_at,
      duration_ms: e.duration_ms,
      session_id: e.session_id,
      actor_id: e.actor_id
    })),
    total_count: total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    has_more: start + pageSize < total
  });
});

// Execution Filter Options API
app.get(['/api/ui/v1/executions/filter-options', '/api/executions/filter-options'], (req, res) => {
  res.json({
    agents: mockAgents.map(a => a.id),
    workflows: mockWorkflows.map(w => w.workflow_id),
    sessions: ['sess-usr-4912', 'sess-usr-8812', 'sess-usr-1200'],
    statuses: ['succeeded', 'running', 'failed', 'pending']
  });
});

app.get(['/api/ui/v1/workflows', '/api/workflows'], (req, res) => {
  res.json({
    workflows: mockWorkflows,
    total_count: mockWorkflows.length,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
});

app.get(['/api/ui/v1/workflows/:id', '/api/workflows/:id', '/api/ui/v1/workflows/:id/details'], (req, res) => {
  const workflow = mockWorkflows.find(w => w.workflow_id === req.params.id || w.run_id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ message: 'Workflow not found' });
  }
  res.json(workflow);
});

app.get(['/api/ui/v1/workflows/:id/executions', '/api/workflows/:id/executions'], (req, res) => {
  const execs = mockExecutions.filter(e => e.workflow_id === req.params.id);
  res.json({
    executions: execs.map(e => ({
      execution_id: e.execution_id,
      workflow_id: e.workflow_id,
      status: e.status,
      task_name: e.task_name,
      workflow_name: e.workflow_name,
      agent_name: e.agent_name,
      relative_time: '2 hours ago',
      duration_display: `${Math.round(e.duration_ms / 1000)}s`,
      started_at: e.started_at,
      completed_at: e.completed_at,
      duration_ms: e.duration_ms
    })),
    total_count: execs.length,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
});

app.get(['/api/ui/v1/workflows/:id/dag', '/api/ui/v1/workflows/:id/dag/lightweight', '/api/workflows/:id/dag'], (req, res) => {
  const workflowId = req.params.id;
  const relatedExecutions = mockExecutions.filter(e => e.workflow_id === workflowId);

  res.json({
    root_workflow_id: workflowId,
    workflow_status: 'succeeded',
    workflow_name: 'Autonomous Agent Workflow DAG',
    total_nodes: Math.max(relatedExecutions.length, 3),
    max_depth: 3,
    timeline: relatedExecutions.map((e, idx) => ({
      execution_id: e.execution_id,
      parent_execution_id: idx > 0 ? relatedExecutions[idx - 1].execution_id : undefined,
      agent_node_id: e.agent_node_id,
      reasoner_id: e.reasoner_id,
      status: e.status,
      started_at: e.started_at,
      completed_at: e.completed_at,
      duration_ms: e.duration_ms,
      workflow_depth: e.workflow_depth
    })),
    mode: 'lightweight'
  });
});

app.get(['/api/ui/v1/workflows/:id/timeline', '/api/workflows/:id/timeline'], (req, res) => {
  const workflowId = req.params.id;
  const related = mockExecutions.filter(e => e.workflow_id === workflowId);
  res.json({
    nodes: related.map(e => ({
      workflow_id: e.workflow_id,
      execution_id: e.execution_id,
      agent_node_id: e.agent_node_id,
      reasoner_id: e.reasoner_id,
      status: e.status,
      started_at: e.started_at,
      completed_at: e.completed_at,
      duration_ms: e.duration_ms,
      workflow_depth: e.workflow_depth,
      task_name: e.task_name,
      agent_name: e.agent_name,
      input_data: e.input_data,
      output_data: e.output_data
    }))
  });
});

// 7. Packages APIs
app.get(['/api/ui/v1/packages', '/api/packages'], (req, res) => {
  res.json({ packages: mockPackages, count: mockPackages.length });
});

// 8. Identity & DID APIs
app.get(['/api/ui/v1/identity/dids/stats', '/api/identity/dids/stats'], (req, res) => {
  res.json({
    total_agents: mockAgents.length,
    total_reasoners: mockAgents.reduce((acc, a) => acc + (a.reasoners?.length || 0), 0),
    total_skills: mockAgents.reduce((acc, a) => acc + (a.skills?.length || 0), 0),
    total_dids: mockAgents.length + 12
  });
});

app.get(['/api/ui/v1/identity/dids/search', '/api/identity/dids/search'], (req, res) => {
  const results = [
    {
      type: 'agent',
      id: 'researcher-agent',
      name: 'researcher-agent',
      did: 'did:key:z6MkuV7812903ab3401f82',
      derivation_path: "m/44'/1237'/1/0",
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      type: 'reasoner',
      id: 'researcher-agent.summarize',
      name: 'summarize',
      parent_did: 'did:key:z6MkuV7812903ab3401f82',
      parent_name: 'researcher-agent',
      did: 'did:key:z6MkuV7812903ab3401f82#summarize',
      derivation_path: "m/44'/1237'/1/1/0",
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      type: 'agent',
      id: 'coder-agent',
      name: 'coder-agent',
      did: 'did:key:z6MkuVCoder99120a8ff2',
      derivation_path: "m/44'/1237'/2/0",
      status: 'active',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];
  res.json({ results });
});

app.get(['/api/ui/v1/identity/dids/agents', '/api/identity/dids/agents'], (req, res) => {
  res.json({
    agents: mockAgents.map((a, i) => ({
      did: `did:key:z6MkuV${Buffer.from(a.id).toString('hex').slice(0, 24)}`,
      agent_node_id: a.id,
      status: 'active',
      derivation_path: `m/44'/1237'/${i + 1}'/0`,
      created_at: a.registered_at || new Date().toISOString(),
      reasoner_count: a.reasoners?.length || 0,
      skill_count: a.skills?.length || 0
    }))
  });
});

app.get(['/api/ui/v1/identity/credentials/stats', '/api/identity/credentials/stats'], (req, res) => {
  res.json({
    total_credentials: 24,
    verified_credentials: 23,
    revoked_credentials: 0,
    failed_verifications: 1
  });
});

app.get(['/api/ui/v1/identity/credentials/executions', '/api/identity/credentials/executions'], (req, res) => {
  res.json({
    credentials: mockExecutions.map(e => ({
      credential_id: `vc-exec-${e.execution_id}`,
      execution_id: e.execution_id,
      workflow_id: e.workflow_id,
      issuer: `did:key:z6MkuV${Buffer.from(e.agent_node_id).toString('hex').slice(0, 20)}`,
      subject: e.reasoner_id,
      status: 'verified',
      issued_at: e.started_at,
      proof_type: 'Ed25519Signature2020'
    }))
  });
});

app.get(['/api/ui/v1/identity/credentials/workflows', '/api/identity/credentials/workflows'], (req, res) => {
  res.json({
    credentials: mockWorkflows.map(w => ({
      credential_id: `vc-wf-${w.run_id}`,
      workflow_id: w.workflow_id,
      run_id: w.run_id,
      issuer: 'did:key:z6MkuVControlPlaneAuthority',
      status: 'verified',
      issued_at: w.started_at,
      components_count: w.total_executions,
      proof_type: 'MerkleProof2019'
    }))
  });
});

app.post(['/api/ui/v1/identity/credentials/verify', '/api/ui/v1/vc/verify', '/api/vc/verify'], (req, res) => {
  res.json({
    valid: true,
    verification_status: 'verified',
    issuer: 'did:key:z6MkuVControlPlaneMasterKey',
    verified_at: new Date().toISOString(),
    cryptographic_checks: {
      signature_valid: true,
      not_expired: true,
      issuer_active: true,
      merkle_root_match: true
    }
  });
});

// VC Chain for Workflow
app.get([
  '/api/ui/v1/workflows/:id/vc-chain',
  '/api/workflows/:id/vc-chain',
  '/api/ui/v1/vc/chain/:workflowId',
  '/api/vc/chain/:workflowId'
], (req, res) => {
  const workflowId = req.params.id || req.params.workflowId;
  const relatedExecutions = mockExecutions.filter(
    e => e.workflow_id === workflowId || e.root_workflow_id === workflowId
  );

  const executionsToUse = relatedExecutions.length > 0 ? relatedExecutions : mockExecutions.slice(0, 3);

  const componentVcs = executionsToUse.map(e => ({
    vc_id: `vc-exec-${e.execution_id}`,
    execution_id: e.execution_id,
    workflow_id: workflowId,
    session_id: e.session_id || 'sess-usr-4912',
    issuer_did: `did:key:z6MkuV${Buffer.from(e.agent_node_id || 'planner-agent').toString('hex').slice(0, 20)}`,
    target_did: `did:key:z6MkuV${Buffer.from(e.reasoner_id || 'reasoner').toString('hex').slice(0, 20)}`,
    caller_did: 'did:key:z6MkuVControlPlaneMasterKey',
    status: 'verified',
    created_at: e.started_at,
    issued_at: e.started_at,
    proof_type: 'Ed25519Signature2020',
    signature: '3045022100e4c6b84074f7623a...verified_ed25519_proof',
    input_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    output_hash: 'sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    vc_document: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `urn:uuid:vc-${e.execution_id}`,
      type: ['VerifiableCredential', 'AgentExecutionCredential'],
      issuer: `did:key:z6MkuV${e.agent_node_id}`,
      issuanceDate: e.started_at,
      credentialSubject: {
        id: `did:key:z6MkuV${e.agent_node_id}`,
        execution_id: e.execution_id,
        reasoner: e.reasoner_id,
        task: e.task_name,
        status: e.status
      }
    }
  }));

  const workflowVc = {
    workflow_id: workflowId,
    workflow_vc_id: `vc-wf-${workflowId}`,
    session_id: 'sess-usr-4912',
    component_vcs: componentVcs.map(vc => vc.vc_id),
    status: 'verified',
    start_time: executionsToUse[0]?.started_at || new Date().toISOString(),
    end_time: executionsToUse[executionsToUse.length - 1]?.completed_at || new Date().toISOString(),
    total_steps: componentVcs.length,
    completed_steps: componentVcs.length,
    issuer_did: 'did:key:z6MkuVControlPlaneAuthority',
    signature: '304402206f47c32729a...workflow_merkle_root_proof',
    vc_document: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `urn:uuid:vc-wf-${workflowId}`,
      type: ['VerifiableCredential', 'WorkflowAggregateCredential'],
      issuer: 'did:key:z6MkuVControlPlaneAuthority',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        workflow_id: workflowId,
        merkle_root: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        total_steps: componentVcs.length,
        verified_steps: componentVcs.length
      }
    }
  };

  const didResolutionBundle = {
    'did:key:z6MkuVControlPlaneAuthority': {
      method: 'key',
      public_key_jwk: { kty: 'OKP', crv: 'Ed25519', x: 'O2A5W9xP9V0B_x6aY-8dJvK...' },
      resolved_from: 'local_keystore',
      resolved_at: new Date().toISOString()
    }
  };

  res.json({
    workflow_id: workflowId,
    component_vcs: componentVcs,
    workflow_vc: workflowVc,
    total_steps: componentVcs.length,
    status: 'verified',
    verification_status: 'verified',
    did_resolution_bundle: didResolutionBundle
  });
});

// Single Execution VC
app.get(['/api/ui/v1/executions/:id/vc', '/api/executions/:id/vc'], (req, res) => {
  const execution = mockExecutions.find(e => e.execution_id === req.params.id) || mockExecutions[0];
  res.json({
    vc_id: `vc-exec-${execution.execution_id}`,
    execution_id: execution.execution_id,
    workflow_id: execution.workflow_id,
    session_id: execution.session_id,
    issuer_did: `did:key:z6MkuV${Buffer.from(execution.agent_node_id).toString('hex').slice(0, 20)}`,
    target_did: `did:key:z6MkuV${Buffer.from(execution.reasoner_id).toString('hex').slice(0, 20)}`,
    caller_did: 'did:key:z6MkuVControlPlaneRoot',
    status: 'verified',
    signature: '3045022100e4c6b84074f7623a...verified_ed25519_proof',
    input_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    output_hash: 'sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    created_at: execution.started_at,
    issued_at: execution.started_at,
    vc_document: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: `urn:uuid:vc-${execution.execution_id}`,
      type: ['VerifiableCredential', 'AgentExecutionCredential'],
      issuer: `did:key:z6MkuV${execution.agent_node_id}`,
      issuanceDate: execution.started_at,
      credentialSubject: {
        id: `did:key:z6MkuV${execution.agent_node_id}`,
        execution_id: execution.execution_id,
        reasoner: execution.reasoner_id,
        status: execution.status
      }
    }
  });
});

// DID Verification API
app.post(['/api/ui/v1/did/verify', '/api/did/verify'], (req, res) => {
  res.json({
    valid: true,
    verification_status: 'verified',
    issuer: 'did:key:z6MkuVControlPlaneMasterKey',
    verified_at: new Date().toISOString(),
    cryptographic_checks: {
      signature_valid: true,
      not_expired: true,
      issuer_active: true,
      merkle_root_match: true
    }
  });
});

// Create workflow VC
app.post(['/api/ui/v1/did/workflow/:workflowId/vc', '/api/did/workflow/:workflowId/vc'], (req, res) => {
  const workflowId = req.params.workflowId;
  res.json({
    workflow_id: workflowId,
    workflow_vc_id: `vc-wf-${workflowId}`,
    session_id: req.body.session_id || 'sess-usr-4912',
    component_vcs: req.body.execution_vc_ids || [],
    status: 'verified',
    start_time: new Date().toISOString(),
    total_steps: req.body.execution_vc_ids?.length || 1,
    completed_steps: req.body.execution_vc_ids?.length || 1,
    issuer_did: 'did:key:z6MkuVControlPlaneAuthority'
  });
});

// Batch VC status
app.post(['/api/ui/v1/did/workflow/vc-status/batch', '/api/did/workflow/vc-status/batch'], (req, res) => {
  const workflowIds = req.body.workflow_ids || [];
  const statuses: Record<string, any> = {};
  workflowIds.forEach((id: string) => {
    statuses[id] = {
      has_vcs: true,
      vc_count: 3,
      verified_count: 3,
      failed_count: 0,
      last_vc_created: new Date().toISOString(),
      verification_status: 'verified'
    };
  });
  res.json({ statuses });
});

// Verify Execution VC
app.post(['/api/ui/v1/executions/:id/verify-vc', '/api/executions/:id/verify-vc'], (req, res) => {
  res.json({
    is_valid: true,
    verification_status: 'verified',
    execution_id: req.params.id,
    checks: {
      signature_valid: true,
      issuer_trusted: true,
      claims_match_hashes: true
    }
  });
});

// Verify Workflow VC
app.post(['/api/ui/v1/workflows/:id/verify-vc', '/api/workflows/:id/verify-vc'], (req, res) => {
  res.json({
    is_valid: true,
    verification_status: 'verified',
    workflow_id: req.params.id,
    checks: {
      merkle_tree_valid: true,
      all_component_vcs_verified: true,
      authority_signature_valid: true
    }
  });
});

// DID Resolution Bundle
app.get(['/api/ui/v1/did/:did/resolution-bundle', '/api/did/:did/resolution-bundle'], (req, res) => {
  const did = req.params.did;
  res.json({
    did,
    method: 'key',
    public_key_jwk: { kty: 'OKP', crv: 'Ed25519', x: 'O2A5W9xP9V0B_x6aY-8dJvK...' },
    resolved_from: 'local_keystore',
    resolved_at: new Date().toISOString()
  });
});

// Environment & Configuration schemas
app.get(['/api/ui/v1/agents/:agentId/env', '/api/agents/:agentId/env'], (req, res) => {
  res.json({
    agent_id: req.params.agentId,
    variables: {
      LOG_LEVEL: 'info',
      CONCURRENCY_LIMIT: '10',
      TIMEOUT_SECONDS: '60'
    }
  });
});

app.get(['/api/ui/v1/agents/:agentId/config/schema', '/api/agents/:agentId/config/schema'], (req, res) => {
  res.json({
    fields: [
      { name: 'max_retries', type: 'number', default: 3, label: 'Max Retries' },
      { name: 'log_level', type: 'string', default: 'info', label: 'Log Level' }
    ]
  });
});

// Workflow VC Status Batch
app.all(['/api/ui/v1/workflows/vc-status', '/api/workflows/vc-status'], (req, res) => {
  const ids: string[] = req.body?.workflow_ids || mockWorkflows.map(w => w.workflow_id);
  const summaries = ids.map(id => ({
    workflow_id: id,
    has_vcs: true,
    vc_count: 2,
    verified_count: 2,
    failed_count: 0,
    last_vc_created: new Date().toISOString(),
    verification_status: 'verified' as const
  }));
  res.json({ summaries });
});

// Single Workflow VC Status
app.get(['/api/ui/v1/workflows/:id/vc-status', '/api/workflows/:id/vc-status'], (req, res) => {
  const workflowId = req.params.id;
  res.json({
    workflow_id: workflowId,
    has_vc: true,
    vc_status: 'verified',
    status: 'verified',
    component_vcs_count: 2,
    verified_count: 2,
    failed_count: 0,
    last_verification: new Date().toISOString()
  });
});

// Single Execution VC Status
app.get(['/api/ui/v1/executions/:id/vc-status', '/api/executions/:id/vc-status'], (req, res) => {
  res.json({
    has_vc: true,
    vc_id: `vc-exec-${req.params.id}`,
    status: 'verified',
    issuer_did: 'did:key:z6MkuVControlPlaneAuthority',
    verified_at: new Date().toISOString()
  });
});

// Catch-all for undefined API routes to prevent falling through to Vite
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Redirect /ui prefix to root
app.get(['/ui', '/ui/*'], (req, res) => {
  const newPath = req.originalUrl.replace(/^\/ui(\/|$)/, '/');
  res.redirect(newPath || '/');
});

// Vite & Static serving setup
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log('[Server] Initializing Vite middleware in development mode...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Serving built client in production mode...');
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`AgentField Control Plane running on http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
