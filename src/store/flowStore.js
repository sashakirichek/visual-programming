import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const initialNodes = [];
const initialEdges = [];
const FLOW_STORAGE_KEY = "vp-flow-state";

const VALID_NODE_TYPES = new Set([
  "inputNode",
  "outputNode",
  "operatorNode",
  "functionNode",
  "variableNode",
  "conditionNode",
  "loopNode",
  "jsonNode",
  "moduleNode",
  "scopeNode",
  "apiNode",
]);

function sanitizeString(str) {
  if (typeof str !== "string") return str;
  // Strip HTML tags
  let s = str.replace(/<[^>]*>/g, "");
  // Remove javascript: URIs
  s = s.replace(/javascript\s*:/gi, "");
  // Remove on* event handlers pattern
  s = s.replace(/\bon\w+\s*=/gi, "");
  return s;
}

function sanitizeValue(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === "string") return sanitizeString(val);
  if (typeof val === "number" || typeof val === "boolean") return val;
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (typeof val === "object") {
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
  return nodes
    .filter((n) => n && typeof n.id === "string" && VALID_NODE_TYPES.has(n.type))
    .map((n) => {
      const style = n.style ? sanitizeValue(n.style) : {};

      if (typeof n.width === "number") {
        style.width = n.width;
      }

      if (typeof n.height === "number") {
        style.height = n.height;
      }

      return {
        id: sanitizeString(n.id),
        type: n.type,
        position: {
          x: typeof n.position?.x === "number" ? n.position.x : 0,
          y: typeof n.position?.y === "number" ? n.position.y : 0,
        },
        data: sanitizeValue(n.data || {}),
        ...(n.parentId ? { parentId: sanitizeString(n.parentId) } : {}),
        ...(n.extent ? { extent: n.extent } : {}),
        ...(typeof n.width === "number" ? { width: n.width } : {}),
        ...(typeof n.height === "number" ? { height: n.height } : {}),
        ...(typeof n.zIndex === "number" ? { zIndex: n.zIndex } : {}),
        ...(typeof n.dragHandle === "string" ? { dragHandle: sanitizeString(n.dragHandle) } : {}),
        ...(Object.keys(style).length > 0 ? { style } : {}),
      };
    });
}

function sanitizeEdges(edges) {
  if (!Array.isArray(edges)) return [];
  return edges
    .filter((e) => e && typeof e.source === "string" && typeof e.target === "string")
    .map((e) => ({
      id: sanitizeString(e.id || `${e.source}-${e.target}`),
      source: sanitizeString(e.source),
      target: sanitizeString(e.target),
      ...(e.sourceHandle ? { sourceHandle: sanitizeString(e.sourceHandle) } : {}),
      ...(e.targetHandle ? { targetHandle: sanitizeString(e.targetHandle) } : {}),
      animated: e.animated ?? true,
    }));
}

function sanitizeModules(modules) {
  if (!modules || typeof modules !== "object" || Array.isArray(modules)) return {};

  return Object.fromEntries(
    Object.entries(modules).flatMap(([name, mod]) => {
      if (!mod || typeof mod !== "object") return [];

      const safeName = sanitizeString(name);
      return [[
        safeName,
        {
          name: sanitizeString(mod.name || safeName),
          description: sanitizeString(mod.description || ""),
          nodes: sanitizeNodes(mod.nodes),
          edges: sanitizeEdges(mod.edges),
          ...(mod.createdAt ? { createdAt: sanitizeString(mod.createdAt) } : {}),
        },
      ]];
    }),
  );
}

function serializeGraphState(state) {
  return {
    nodes: sanitizeNodes(state?.nodes),
    edges: sanitizeEdges(state?.edges),
    modules: sanitizeModules(state?.modules),
  };
}

function loadPersistedGraphState() {
  if (typeof window === "undefined") {
    return { nodes: initialNodes, edges: initialEdges, modules: {} };
  }

  try {
    const raw = window.localStorage.getItem(FLOW_STORAGE_KEY);
    if (!raw) {
      return { nodes: initialNodes, edges: initialEdges, modules: {} };
    }

    return serializeGraphState(JSON.parse(raw));
  } catch {
    return { nodes: initialNodes, edges: initialEdges, modules: {} };
  }
}

function persistGraphState(state) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(serializeGraphState(state)));
  } catch {
    // Ignore storage failures so the editor remains usable.
  }
}

const persistedGraphState = loadPersistedGraphState();

export const useFlowStore = create((set, get) => ({
  nodes: persistedGraphState.nodes,
  edges: persistedGraphState.edges,
  selectedNode: null,
  modules: persistedGraphState.modules,
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

  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) => set((state) => ({ edges: addEdge({ ...connection, animated: true }, state.edges) })),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
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

  clearFlow: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      executionResults: {},
      consoleLogs: [],
      debugMode: false,
      debugStep: 0,
      debugSteps: [],
      isRunning: false,
      activeChallenge: null,
      challengeResults: null,
    }),

  // Viz editor state
  onVizNodesChange: (changes) => set((state) => ({ vizNodes: applyNodeChanges(changes, state.vizNodes) })),

  onVizEdgesChange: (changes) => set((state) => ({ vizEdges: applyEdgeChanges(changes, state.vizEdges) })),

  onVizConnect: (connection) =>
    set((state) => ({ vizEdges: addEdge({ ...connection, animated: true }, state.vizEdges) })),

  addVizNode: (node) => set((state) => ({ vizNodes: [...state.vizNodes, node] })),

  setVizNodes: (nodes) => set({ vizNodes: nodes }),

  setVizEdges: (edges) => set({ vizEdges: edges }),

  // Challenge system
  startChallenge: (challenge) => {
    const inputNodes = (challenge.inputNodes || []).map((n, i) => ({
      id: `challenge_input_${i}`,
      type: "inputNode",
      position: { x: 50, y: 80 + i * 120 },
      data: { ...n.data, label: "inputNode", locked: true },
    }));
    const outputNode = {
      id: "challenge_output",
      type: "outputNode",
      position: { x: 600, y: 150 },
      data: { label: "outputNode", locked: true },
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

  // Module system
  saveModule: (name, moduleData) =>
    set((state) => {
      const safeName = sanitizeString(name);
      const safeModule = sanitizeModules({
        [safeName]: {
          name: moduleData?.name || safeName,
          description: moduleData?.description || "",
          nodes: moduleData?.nodes,
          edges: moduleData?.edges,
          createdAt: moduleData?.createdAt || new Date().toISOString(),
        },
      })[safeName];

      return {
        modules: { ...state.modules, [safeName]: safeModule },
      };
    }),

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
    const moduleNodes = sanitizeNodes(mod.nodes);
    const moduleEdges = sanitizeEdges(mod.edges);
    const newNodes = moduleNodes.map((n) => ({
      ...n,
      id: `${prefix}_${n.id}`,
      position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
      data: { ...n.data, moduleInstance: moduleName },
    }));
    const idMap = {};
    moduleNodes.forEach((n) => {
      idMap[n.id] = `${prefix}_${n.id}`;
    });
    const newEdges = moduleEdges.map((e) => ({
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
    return JSON.stringify(serializeGraphState(get()), null, 2);
  },

  importFromJson: (jsonString) => {
    try {
      const raw = JSON.parse(jsonString);
      const { nodes, edges, modules } = serializeGraphState(raw);
      set({
        nodes,
        edges,
        modules,
        selectedNode: null,
        executionResults: {},
        consoleLogs: [],
        debugMode: false,
        debugStep: 0,
        debugSteps: [],
        isRunning: false,
        activeChallenge: null,
        challengeResults: null,
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
}));

if (typeof window !== "undefined") {
  useFlowStore.subscribe((state) => {
    persistGraphState(state);
  });
}
