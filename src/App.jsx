import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowStore } from './store/flowStore';
import InputNode from './components/nodes/InputNode';
import OutputNode from './components/nodes/OutputNode';
import OperatorNode from './components/nodes/OperatorNode';
import FunctionNode from './components/nodes/FunctionNode';
import VariableNode from './components/nodes/VariableNode';
import ConditionNode from './components/nodes/ConditionNode';
import LoopNode from './components/nodes/LoopNode';
import JsonNode from './components/nodes/JsonNode';
import ModuleNode from './components/nodes/ModuleNode';
import NodePalette from './components/panels/NodePalette';
import DebugPanel from './components/panels/DebugPanel';
import ModulePanel from './components/panels/ModulePanel';
import PropertiesPanel from './components/panels/PropertiesPanel';
import Toolbar from './components/Toolbar';
import './App.css';

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  operatorNode: OperatorNode,
  functionNode: FunctionNode,
  variableNode: VariableNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  jsonNode: JsonNode,
  moduleNode: ModuleNode,
};

export default function App() {
  const [activePanel, setActivePanel] = useState('palette');

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const modules = useFlowStore((s) => s.modules);
  const debugMode = useFlowStore((s) => s.debugMode);
  const debugStep = useFlowStore((s) => s.debugStep);
  const debugSteps = useFlowStore((s) => s.debugSteps);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNode(node.id);
    setActivePanel('properties');
  }, [setSelectedNode]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Highlight active debug node
  const styledNodes = nodes.map((node) => {
    if (!debugMode || !debugSteps.length) return node;
    const currentStepNodeId = debugSteps[debugStep]?.nodeId;
    if (node.id === currentStepNodeId) {
      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: '0 0 0 3px #ff9800, 0 0 20px rgba(255, 152, 0, 0.5)',
          borderRadius: '8px',
        },
      };
    }
    const pastStep = debugSteps.slice(0, debugStep).find((s) => s.nodeId === node.id);
    if (pastStep) {
      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: '0 0 0 2px #4caf50',
          borderRadius: '8px',
        },
      };
    }
    return node;
  });

  return (
    <div className="app">
      <Toolbar activePanel={activePanel} setActivePanel={setActivePanel} />

      <div className="app-body">
        {activePanel === 'palette' && (
          <div className="side-panel left-panel">
            <NodePalette modules={modules} />
          </div>
        )}
        {activePanel === 'modules' && (
          <div className="side-panel left-panel">
            <ModulePanel />
          </div>
        )}

        <div className="flow-container">
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
          >
            <Background variant="dots" gap={16} size={1} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} />
          </ReactFlow>
        </div>

        {activePanel === 'properties' && (
          <div className="side-panel right-panel">
            <PropertiesPanel />
          </div>
        )}
        {activePanel === 'debug' && (
          <div className="side-panel right-panel">
            <DebugPanel />
          </div>
        )}
      </div>
    </div>
  );
}
