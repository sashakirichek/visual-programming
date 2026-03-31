import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

const initialNodes = [];
const initialEdges = [];

const VALID_NODE_TYPES = new Set([
  'inputNode', 'outputNode', 'operatorNode', 'functionNode',
  'variableNode', 'conditionNode', 'loopNode', 'jsonNode',
  'moduleNode', 'scopeNode', 'apiNode',
]);

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Strip HTML tags
  let s = str.replace(/<[^>]*>/g, '');
  // Remove javascript: URIs
  s = s.replace(/javascript\s*:/gi, '');
  // Remove on* event handlers pattern
  s = s.replace(/\bon\w+\s*=/gi, '');
  return s;
}

function sanitizeValue(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') return sanitizeString(val);
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[sanitizeString(k)] = sanitizeValue(v);
    }
    return out;
  }
  return val;
}

function sanitizeNodes(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.filter((n) =>
    n && typeof n.id === 'string' && VALID_NODE_TYPES.has(n.type)
  ).map((n) => ({
    id: sanitizeString(n.id),
    type: n.type,
    position: {
      x: typeof n.position?.x === 'number' ? n.position.x : 0,
      y: typeof n.position?.y === 'number' ? n.position.y : 0,
    },
    data: sanitizeValue(n.data || {}),
    ...(n.parentId ? { parentId: sanitizeString(n.parentId) } : {}),
    ...(n.extent ? { extent: n.extent } : {}),
    ...(n.style ? { style: sanitizeValue(n.style) } : {}),
  }));
}

function sanitizeEdges(edges) {
  if (!Array.isArray(edges)) return [];
  return edges.filter((e) =>
    e && typeof e.source === 'string' && typeof e.target === 'string'
  ).map((e) => ({
    id: sanitizeString(e.id || `${e.source}-${e.target}`),
    source: sanitizeString(e.source),
    target: sanitizeString(e.target),
    ...(e.sourceHandle ? { sourceHandle: sanitizeString(e.sourceHandle) } : {}),
    ...(e.targetHandle ? { targetHandle: sanitizeString(e.targetHandle) } : {}),
    animated: e.animated ?? true,
  }));
}

export const useFlowStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  modules: {},
  executionResults: {},
  consoleLogs: [],
  debugMode: false,
  debugStep: 0,
  debugSteps: [],
  isRunning: false,
  activeChallenge: null,
  challengeResults: null,
  vizNodes: [],
  vizEdges: [],

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({ edges: addEdge({ ...connection, animated: true }, state.edges) })),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })),

  setSelectedNode: (node) => set({ selectedNode: node }),

  setExecutionResults: (results) => set({ executionResults: results }),

  setConsoleLogs: (logs) => set({ consoleLogs: logs }),

  setDebugMode: (mode) => set({ debugMode: mode }),

  setDebugStep: (step) => set({ debugStep: step }),

  setDebugSteps: (steps) => set({ debugSteps: steps }),

  setIsRunning: (running) => set({ isRunning: running }),

  clearResults: () => set({ executionResults: {}, consoleLogs: [] }),

  // Viz editor state
  onVizNodesChange: (changes) =>
    set((state) => ({ vizNodes: applyNodeChanges(changes, state.vizNodes) })),

  onVizEdgesChange: (changes) =>
    set((state) => ({ vizEdges: applyEdgeChanges(changes, state.vizEdges) })),

  onVizConnect: (connection) =>
    set((state) => ({ vizEdges: addEdge({ ...connection, animated: true }, state.vizEdges) })),

  addVizNode: (node) =>
    set((state) => ({ vizNodes: [...state.vizNodes, node] })),

  setVizNodes: (nodes) => set({ vizNodes: nodes }),

  setVizEdges: (edges) => set({ vizEdges: edges }),

  // Challenge system
  startChallenge: (challenge) => {
    const inputNodes = (challenge.inputNodes || []).map((n, i) => ({
      id: `challenge_input_${i}`,
      type: 'inputNode',
      position: { x: 50, y: 80 + i * 120 },
      data: { ...n.data, label: 'inputNode', locked: true },
    }));
    const outputNode = {
      id: 'challenge_output',
      type: 'outputNode',
      position: { x: 600, y: 150 },
      data: { label: 'outputNode', locked: true },
    };
    set({
      nodes: [...inputNodes, outputNode],
      edges: [],
      activeChallenge: challenge,
      challengeResults: null,
      executionResults: {},
    });
  },

  exitChallenge: () => set({ activeChallenge: null, challengeResults: null }),

  setChallengeResults: (results) => set({ challengeResults: results }),

  // Scope system
  setScopeParent: (nodeId, scopeId) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, parentId: scopeId, extent: scopeId ? 'parent' : undefined }
          : n
      ),
    })),

  // Module system
  saveModule: (name, moduleData) =>
    set((state) => ({
      modules: { ...state.modules, [name]: moduleData },
    })),

  deleteModule: (name) =>
    set((state) => {
      const newModules = { ...state.modules };
      delete newModules[name];
      return { modules: newModules };
    }),

  loadModuleAsNodes: (moduleName) => {
    const { modules } = get();
    const mod = modules[moduleName];
    if (!mod) return;
    const offsetX = 100;
    const offsetY = 100;
    const prefix = `${moduleName}_${Date.now()}`;
    const newNodes = mod.nodes.map((n) => ({
      ...n,
      id: `${prefix}_${n.id}`,
      position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
      data: { ...n.data, moduleInstance: moduleName },
    }));
    const idMap = {};
    mod.nodes.forEach((n) => { idMap[n.id] = `${prefix}_${n.id}`; });
    const newEdges = mod.edges.map((e) => ({
      ...e,
      id: `${prefix}_${e.id}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target,
      animated: true,
    }));
    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
    }));
  },

  exportToJson: () => {
    const { nodes, edges, modules } = get();
    return JSON.stringify({ nodes, edges, modules }, null, 2);
  },

  importFromJson: (jsonString) => {
    try {
      const raw = JSON.parse(jsonString);
      const nodes = sanitizeNodes(raw.nodes);
      const edges = sanitizeEdges(raw.edges);
      const modules = sanitizeValue(raw.modules || {});
      set({ nodes, edges, modules });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
}));
