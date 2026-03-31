import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

const initialNodes = [];
const initialEdges = [];

export const useFlowStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  modules: {},
  executionResults: {},
  debugMode: false,
  debugStep: 0,
  debugSteps: [],
  isRunning: false,

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

  setDebugMode: (mode) => set({ debugMode: mode }),

  setDebugStep: (step) => set({ debugStep: step }),

  setDebugSteps: (steps) => set({ debugSteps: steps }),

  setIsRunning: (running) => set({ isRunning: running }),

  clearResults: () => set({ executionResults: {} }),

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
      const data = JSON.parse(jsonString);
      set({
        nodes: data.nodes || [],
        edges: data.edges || [],
        modules: data.modules || {},
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
}));
