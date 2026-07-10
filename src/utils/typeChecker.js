/**
 * Type checking and validation for node connections
 * Ensures type-safe connections between nodes
 */

import { FUNCTION_META } from "../data/functionMeta";

// Type color mapping for visual representation
export const TYPE_COLORS = {
  number: "#FFB84D",    // Orange
  string: "#7CB342",    // Green
  array: "#42A5F5",     // Blue
  object: "#AB47BC",    // Purple
  boolean: "#EF5350",   // Red
  map: "#29B6F6",       // Light Blue
  set: "#66BB6A",       // Light Green
  any: "#9E9E9E",       // Gray
};

// Compatibility matrix: which types can connect to which
const TYPE_COMPATIBILITY = {
  number: ["number", "any"],
  string: ["string", "any"],
  array: ["array", "any"],
  object: ["object", "any"],
  boolean: ["boolean", "any"],
  map: ["map", "any"],
  set: ["set", "any"],
  any: ["any", "number", "string", "array", "object", "boolean", "map", "set"],
};

/**
 * Get the output type for a node
 */
export function getNodeOutputType(node, nodes, edges, results) {
  if (!node) return "any";

  switch (node.type) {
    case "inputNode":
      return getInputNodeType(node);
    case "outputNode":
      return "any";
    case "operatorNode":
      return "any"; // Could be number or boolean depending on operator
    case "functionNode":
      return getFunctionOutputType(node);
    case "variableNode":
      return getInputNodeType(node);
    case "conditionNode":
      return "any";
    case "loopNode":
      return "array";
    case "forLoopNode":
      return "any";
    case "timerNode":
      return "any";
    case "jsonNode":
      return "any";
    case "moduleNode":
      return "any";
    case "textNode":
      return "string";
    case "apiNode":
      return "any";
    default:
      return "any";
  }
}

/**
 * Get input node's value type
 */
function getInputNodeType(node) {
  const valueType = node.data?.valueType;
  if (valueType === "map") return "map";
  if (valueType === "set") return "set";
  
  // Try to infer from value
  const value = node.data?.value;
  if (typeof value === "string" && value.startsWith("[")) return "array";
  if (typeof value === "string" && value.startsWith("{")) return "object";
  if (typeof value === "number" || !isNaN(value)) return "number";
  if (value === "true" || value === "false") return "boolean";
  
  return "string";
}

/**
 * Get function's output type
 */
function getFunctionOutputType(node) {
  const fnName = node.data?.functionName;
  if (!fnName) return "any";
  
  const meta = FUNCTION_META[fnName];
  return meta?.outputType || "any";
}

/**
 * Get the expected type for a specific parameter
 */
export function getExpectedParameterType(nodeId, paramIndex, nodes, edges) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return "any";

  switch (node.type) {
    case "operatorNode": {
      // Operators expect both sides to be compatible
      if (paramIndex === 0) return "number"; // Simplified: assumes numeric operators
      if (paramIndex === 1) return "number";
      return "any";
    }
    case "functionNode": {
      const fnName = node.data?.functionName;
      if (!fnName) return "any";
      
      const meta = FUNCTION_META[fnName];
      if (!meta || !meta.params) return "any";
      
      return meta.params[paramIndex]?.type || "any";
    }
    case "conditionNode": {
      if (paramIndex === 0) return "boolean"; // condition
      return "any"; // true/false branches accept anything
    }
    case "loopNode": {
      if (paramIndex === 0) return "array";
      return "any";
    }
    default:
      return "any";
  }
}

/**
 * Check if two types are compatible for connection
 */
export function areTypesCompatible(sourceType, targetType) {
  if (sourceType === "any" || targetType === "any") return true;
  if (sourceType === targetType) return true;
  
  const compatible = TYPE_COMPATIBILITY[targetType];
  return compatible?.includes(sourceType) ?? false;
}

/**
 * Validate a connection between two nodes
 */
export function validateConnection(sourceNodeId, sourceHandle, targetNodeId, targetHandle, nodes, edges, results) {
  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  const targetNode = nodes.find((n) => n.id === targetNodeId);

  if (!sourceNode || !targetNode) return { valid: true, error: null };

  // Extract parameter index from handle (e.g., "arg0" -> 0)
  const paramIndex = parseInt(targetHandle?.replace(/\D/g, ""), 10);

  const sourceType = getNodeOutputType(sourceNode, nodes, edges, results);
  const expectedType = getExpectedParameterType(targetNodeId, paramIndex, nodes, edges);

  if (!areTypesCompatible(sourceType, expectedType)) {
    return {
      valid: false,
      error: `Cannot connect ${sourceType} to ${expectedType}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Get handle color based on type
 */
export function getHandleColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.any;
}
