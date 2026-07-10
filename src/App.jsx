import { useState, useCallback, useRef, useEffect } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useFlowStore } from "./store/flowStore";
import { NotificationProvider, useNotification } from "./context/NotificationContext";
import NotificationContainer from "./components/NotificationContainer";
import InputNode from "./components/nodes/InputNode";
import OutputNode from "./components/nodes/OutputNode";
import OperatorNode from "./components/nodes/OperatorNode";
import FunctionNode from "./components/nodes/FunctionNode";
import VariableNode from "./components/nodes/VariableNode";
import ConditionNode from "./components/nodes/ConditionNode";
import ForLoopNode from "./components/nodes/ForLoopNode";
import TimerNode from "./components/nodes/TimerNode";
import JsonNode from "./components/nodes/JsonNode";
import ModuleNode from "./components/nodes/ModuleNode";
import ScopeNode from "./components/nodes/ScopeNode";
import ApiNode from "./components/nodes/ApiNode";
import TextNode from "./components/nodes/TextNode";
import NodePalette from "./components/panels/NodePalette";
import DebugPanel from "./components/panels/DebugPanel";
import ModulePanel from "./components/panels/ModulePanel";
import PropertiesPanel from "./components/panels/PropertiesPanel";
import ExamplesPanel from "./components/panels/ExamplesPanel";
import ChallengePanel from "./components/panels/ChallengePanel";
import SolutionsPanel from "./components/panels/SolutionsPanel";
import Toolbar from "./components/Toolbar";
import "./App.css";

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  operatorNode: OperatorNode,
  functionNode: FunctionNode,
  variableNode: VariableNode,
  conditionNode: ConditionNode,
  forLoopNode: ForLoopNode,
  timerNode: TimerNode,
  jsonNode: JsonNode,
  moduleNode: ModuleNode,
  scopeNode: ScopeNode,
  apiNode: ApiNode,
  textNode: TextNode,
};

var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

function AppContent() {
  const [leftPanel, setLeftPanel] = useState(null);
  const [rightPanel, setRightPanel] = useState(null);
  const [urlImportMsg, setUrlImportMsg] = useState(null);
  const { addNotification } = useNotification();

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnectRaw = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const modules = useFlowStore((s) => s.modules);
  const debugMode = useFlowStore((s) => s.debugMode);
  const debugStep = useFlowStore((s) => s.debugStep);
  const debugSteps = useFlowStore((s) => s.debugSteps);

  // Wrap onConnect to show notifications for invalid connections
  const onConnect = useCallback(
    (connection) => {
      onConnectRaw(connection);

      // Check if this connection resulted in an error
      const state = useFlowStore.getState();
      const edgeId = `${connection.source}-${connection.target}-${connection.sourceHandle || ""}-${connection.targetHandle || ""}`;
      const error = state.edgeValidationErrors[edgeId];

      if (error) {
        addNotification(`⚠️ ${error}`, "error", 4000);
      } else {
        addNotification("✓ Connection successful", "success", 2000);
      }
    },
    [onConnectRaw, addNotification],
  );

  const handleNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node.id);
      // setRightPanel("properties");
    },
    [setSelectedNode],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    // Close panels on mobile when clicking diagram
    if (window.innerWidth < 768) {
      setLeftPanel(null);
      setRightPanel(null);
    }
  }, [setSelectedNode, setLeftPanel, setRightPanel]);

  // URL import: ?flow=<base64-encoded JSON>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flowParam = params.get("flow");
    if (!flowParam) return;
    try {
      const decoded = atob(flowParam);
      const result = useFlowStore.getState().importFromJson(decoded);
      if (result.success) {
        setUrlImportMsg("Flow imported from URL");
      } else {
        setUrlImportMsg(`Import error: ${result.error}`);
      }
    } catch {
      setUrlImportMsg("Invalid flow data in URL");
    }
    // Clean URL without reloading
    const url = new URL(window.location);
    url.searchParams.delete("flow");
    window.history.replaceState({}, "", url);
    // Auto-dismiss
    const t = setTimeout(() => setUrlImportMsg(null), 3000);
    return () => clearTimeout(t);
  }, []);

  const styledNodes = nodes.map((node) => {
    const baseNode = {
      ...node,
      dragHandle: node.dragHandle || ".drag-handle",
    };

    if (!debugMode || !debugSteps.length) return baseNode;
    const currentStepNodeId = debugSteps[debugStep]?.nodeId;
    if (node.id === currentStepNodeId) {
      return {
        ...baseNode,
        style: {
          ...baseNode.style,
          boxShadow: "0 0 0 2px var(--accent-debug)",
        },
      };
    }
    const pastStep = debugSteps.slice(0, debugStep).find((s) => s.nodeId === node.id);
    if (pastStep) {
      return {
        ...baseNode,
        style: {
          ...baseNode.style,
          boxShadow: "0 0 0 1px rgba(0, 229, 255, 0.3)",
        },
      };
    }
    return baseNode;
  });

  // Mark invalid edges with className
  const edgeValidationErrors = useFlowStore((s) => s.edgeValidationErrors);
  const styledEdges = edges.map((edge) => {
    const edgeId = `${edge.source}-${edge.target}-${edge.sourceHandle || ""}-${edge.targetHandle || ""}`;
    const isInvalid = edgeValidationErrors[edgeId];

    return {
      ...edge,
      className: isInvalid ? "invalid" : "",
    };
  });

  const edgeReconnectSuccessful = useRef(true);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    const store = useFlowStore.getState();
    // Remove old edge and add new connection with validation
    const edgesWithoutOld = store.edges.filter((e) => e.id !== oldEdge.id);
    useFlowStore.setState({ edges: edgesWithoutOld });
    // Use the onConnect action to validate the new connection
    store.onConnect(newConnection);
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      const store = useFlowStore.getState();
      store.onEdgesChange([{ id: edge.id, type: "remove" }]);
    }
    edgeReconnectSuccessful.current = true;
  }, []);

  return (
    <div className="app">
      <Toolbar
        leftPanel={leftPanel}
        setLeftPanel={setLeftPanel}
        rightPanel={rightPanel}
        setRightPanel={setRightPanel}
      />

      <div className="app-body">
        {leftPanel === "palette" && (
          <div className="side-panel left-panel">
            <NodePalette modules={modules} />
          </div>
        )}
        {leftPanel === "modules" && (
          <div className="side-panel left-panel">
            <ModulePanel />
          </div>
        )}
        {leftPanel === "examples" && (
          <div className="side-panel left-panel">
            <ExamplesPanel />
          </div>
        )}
        {leftPanel === "challenges" && (
          <div className="side-panel left-panel">
            <ChallengePanel />
          </div>
        )}
        {leftPanel === "solutions" && (
          <div className="side-panel left-panel">
            <SolutionsPanel />
          </div>
        )}

        <div className="flow-container">
          <ReactFlow
            nodes={styledNodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[8, 8]}
            deleteKeyCode="Delete"
          >
            <Background variant="dots" gap={8} size={1} color={iOS ? "var(--bg-primary)" : "var(--fill-primary)"} />
            <Controls />
            {/* <MiniMap nodeStrokeWidth={1} /> */}
          </ReactFlow>
          {debugMode && (
            <div className="debug-bar">
              <DebugPanel />
            </div>
          )}
          {urlImportMsg && <div className="url-import-toast">{urlImportMsg}</div>}
        </div>

        {rightPanel === "properties" && (
          <div className="side-panel right-panel">
            <PropertiesPanel />
          </div>
        )}
      </div>
      <NotificationContainer />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
