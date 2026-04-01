/**
 * Node execution engine - evaluates node graph and produces results
 * Supports scope-aware variable resolution with closure semantics
 */

import { getClosureCount, parseLiteralValue, parseNodeValue } from "./valueUtils";

const OPERATORS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => (b !== 0 ? a / b : "Error: division by zero"),
  "%": (a, b) => a % b,
  "**": (a, b) => a ** b,
  "===": (a, b) => a === b,
  "!==": (a, b) => a !== b,
  ">": (a, b) => a > b,
  "<": (a, b) => a < b,
  ">=": (a, b) => a >= b,
  "<=": (a, b) => a <= b,
  "&&": (a, b) => a && b,
  "||": (a, b) => a || b,
  "??": (a, b) => a ?? b,
};

const MATH_FUNCTIONS = {
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  sign: Math.sign,
  trunc: Math.trunc,
  random: Math.random,
  PI: () => Math.PI,
  E: () => Math.E,
};

const STRING_FUNCTIONS = {
  length: (s) => String(s).length,
  toUpperCase: (s) => String(s).toUpperCase(),
  toLowerCase: (s) => String(s).toLowerCase(),
  trim: (s) => String(s).trim(),
  split: (s, sep) => String(s).split(sep ?? ""),
  join: (arr, sep) => (Array.isArray(arr) ? arr.join(sep ?? ",") : String(arr)),
  includes: (s, sub) => String(s).includes(sub),
  startsWith: (s, sub) => String(s).startsWith(sub),
  endsWith: (s, sub) => String(s).endsWith(sub),
  indexOf: (s, sub) => String(s).indexOf(sub),
  slice: (s, start, end) => String(s).slice(start, end),
  replace: (s, from, to) => String(s).replace(from, to),
  repeat: (s, n) => String(s).repeat(n),
  padStart: (s, len, fill) => String(s).padStart(len, fill),
  padEnd: (s, len, fill) => String(s).padEnd(len, fill),
  concat: (...args) => args.join(""),
  toString: (v) => String(v),
  parseInt: (s, radix) => parseInt(s, radix),
  parseFloat: (s) => parseFloat(s),
  Number: (v) => Number(v),
  Boolean: (v) => Boolean(v),
  JSON_stringify: (v) => JSON.stringify(v),
  JSON_parse: (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  },
};

const ARRAY_FUNCTIONS = {
  map: (arr, fn) => (Array.isArray(arr) ? arr.map(fn) : []),
  filter: (arr, fn) => (Array.isArray(arr) ? arr.filter(fn) : []),
  reduce: (arr, fn, init) => (Array.isArray(arr) ? arr.reduce(fn, init) : []),
  find: (arr, fn) => (Array.isArray(arr) ? arr.find(fn) : undefined),
  some: (arr, fn) => (Array.isArray(arr) ? arr.some(fn) : false),
  every: (arr, fn) => (Array.isArray(arr) ? arr.every(fn) : false),
  includes: (arr, v) => (Array.isArray(arr) ? arr.includes(v) : false),
  indexOf: (arr, v) => (Array.isArray(arr) ? arr.indexOf(v) : -1),
  push: (arr, v) => {
    const a = [...(arr || [])];
    a.push(v);
    return a;
  },
  pop: (arr) => {
    const a = [...(arr || [])];
    a.pop();
    return a;
  },
  shift: (arr) => {
    const a = [...(arr || [])];
    a.shift();
    return a;
  },
  unshift: (arr, v) => {
    const a = [...(arr || [])];
    a.unshift(v);
    return a;
  },
  splice: (arr, start, deleteCount) => {
    const a = [...(arr || [])];
    a.splice(start, deleteCount);
    return a;
  },
  slice: (arr, start, end) => (Array.isArray(arr) ? arr.slice(start, end) : []),
  concat: (a, b) => [...(a || []), ...(b || [])],
  flat: (arr, depth) => (Array.isArray(arr) ? arr.flat(depth ?? 1) : []),
  flatMap: (arr, fn) => (Array.isArray(arr) ? arr.flatMap(fn) : []),
  sort: (arr, fn) => [...(arr || [])].sort(fn),
  reverse: (arr) => [...(arr || [])].reverse(),
  length: (arr) => (arr || []).length,
  Array_from: (v) => Array.from(v || []),
  Array_isArray: (v) => Array.isArray(v),
  Object_keys: (v) => Object.keys(v || {}),
  Object_values: (v) => Object.values(v || {}),
  Object_entries: (v) => Object.entries(v || {}),
  Object_assign: (...args) => Object.assign({}, ...args),
};

const MAP_FUNCTIONS = {
  Map_new: () => new Map(),
  Map_set: (map, key, value) => {
    map.set(key, value);
    return map;
  },
  Map_get: (map, key) => map.get(key),
  Map_has: (map, key) => map.has(key),
  Map_size: (map) => map.size,
  Map_delete: (map, key) => {
    map.delete(key);
    return map;
  },
  Map_entries: (map) => [...map.entries()],
  Map_keys: (map) => [...map.keys()],
  Map_values: (map) => [...map.values()],
};

const CALLBACK_FUNCTIONS = new Set(["map", "filter", "reduce", "find", "some", "every", "flatMap", "sort"]);

function parseLambda(str, bindings = {}) {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  try {
    const bindNames = Object.keys(bindings);
    const bindValues = Object.values(bindings);
    if (bindNames.length > 0) {
      const factory = new Function(...bindNames, `"use strict"; return (${trimmed});`);
      return factory(...bindValues);
    }
    return new Function(`"use strict"; return (${trimmed});`)();
  } catch {
    return null;
  }
}

function getIncomingValue(nodeId, handleId, nodes, edges, results) {
  const incomingEdge = edges.find(
    (e) => e.target === nodeId && (e.targetHandle === handleId || (!e.targetHandle && !handleId)),
  );
  if (!incomingEdge) return undefined;
  const sourceResult = results[incomingEdge.source];
  if (sourceResult === undefined) return undefined;
  if (incomingEdge.sourceHandle && typeof sourceResult === "object" && sourceResult !== null) {
    return sourceResult[incomingEdge.sourceHandle] ?? sourceResult;
  }
  return sourceResult;
}

function topologicalSort(nodes, edges) {
  const inDegree = {};
  const adjacency = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adjacency[n.id] = [];
  });

  edges.forEach((e) => {
    if (adjacency[e.source]) {
      adjacency[e.source].push(e.target);
    }
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target]++;
    }
  });

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const sorted = [];

  while (queue.length > 0) {
    const id = queue.shift();
    sorted.push(id);
    (adjacency[id] || []).forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  return sorted;
}

export async function executeGraph(nodes, edges) {
  const results = {};
  const steps = [];
  const logs = [];
  const sortedIds = topologicalSort(nodes, edges);

  for (const nodeId of sortedIds) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    // Skip group nodes (visual only)
    if (node.type === "scopeNode") continue;

    let result;
    try {
      result = await executeNode(node, nodes, edges, results, logs);
    } catch (e) {
      result = `Error: ${e.message}`;
    }

    results[nodeId] = result;
    steps.push({ nodeId, result, nodeLabel: node.data?.label || node.type });
  }

  return { results, steps, logs };
}

async function executeNode(node, nodes, edges, results, logs) {
  const { type, data } = node;

  switch (type) {
    case "inputNode": {
      return parseNodeValue(data.value, data.valueType);
    }

    case "outputNode": {
      const val = getIncomingValue(node.id, "value", nodes, edges, results);
      return val;
    }

    case "variableNode": {
      const input = getIncomingValue(node.id, "value", nodes, edges, results);
      if (input !== undefined) return input;
      return parseNodeValue(data.value, data.valueType);
    }

    case "operatorNode": {
      const op = data.operator || "+";
      const a = getIncomingValue(node.id, "a", nodes, edges, results);
      const b = getIncomingValue(node.id, "b", nodes, edges, results);
      const aVal = a !== undefined ? a : parseLiteralValue(data.aValue);
      const bVal = b !== undefined ? b : parseLiteralValue(data.bValue);
      if (OPERATORS[op]) return OPERATORS[op](aVal, bVal);
      return `Unknown operator: ${op}`;
    }

    case "functionNode": {
      const fnName = data.functionName || "";

      // Collect closure bindings for callback functions
      const bindings = {};
      if (CALLBACK_FUNCTIONS.has(fnName)) {
        const closureCount = getClosureCount(data);
        for (let i = 0; i < closureCount; i++) {
          const bindName = data[`bindName${i}`];
          if (bindName) {
            const bindVal = getIncomingValue(node.id, `bind${i}`, nodes, edges, results);
            if (bindVal !== undefined) {
              bindings[bindName] = bindVal;
            } else if (data[`bind${i}`] !== undefined && data[`bind${i}`] !== "") {
              bindings[bindName] = parseLiteralValue(data[`bind${i}`]);
            }
          }
        }
      }

      const args = [];
      for (let i = 0; i < 4; i++) {
        const arg = getIncomingValue(node.id, `arg${i}`, nodes, edges, results);
        if (arg !== undefined) args.push(arg);
        else if (data[`arg${i}`] !== undefined && data[`arg${i}`] !== "") {
          // For callback-expecting functions, parse lambda from the callback arg position
          if (CALLBACK_FUNCTIONS.has(fnName) && i === 1) {
            const fn = parseLambda(data[`arg${i}`], bindings);
            if (fn) {
              args.push(fn);
              continue;
            }
          }
          args.push(parseLiteralValue(data[`arg${i}`]));
        }
      }

      const allFns = { ...MATH_FUNCTIONS, ...STRING_FUNCTIONS, ...ARRAY_FUNCTIONS, ...MAP_FUNCTIONS };
      if (allFns[fnName]) return allFns[fnName](...args);
      return `Unknown function: ${fnName}`;
    }

    case "conditionNode": {
      const condition = getIncomingValue(node.id, "condition", nodes, edges, results);
      const trueBranch = getIncomingValue(node.id, "true", nodes, edges, results);
      const falseBranch = getIncomingValue(node.id, "false", nodes, edges, results);
      const cond = condition !== undefined ? condition : parseLiteralValue(data.condition);
      const trueVal = trueBranch !== undefined ? trueBranch : parseLiteralValue(data.trueValue);
      const falseVal = falseBranch !== undefined ? falseBranch : parseLiteralValue(data.falseValue);
      return cond ? trueVal : falseVal;
    }

    case "loopNode": {
      const arr = getIncomingValue(node.id, "array", nodes, edges, results);
      const inputArr = arr !== undefined ? arr : parseLiteralValue(data.array);
      if (!Array.isArray(inputArr)) return `Error: Expected array, got ${typeof inputArr}`;
      const op = data.loopOp || "forEach";
      const fn = parseLambda(data.transform);
      if (op === "forEach") {
        inputArr.forEach((item, i) => {
          if (fn) {
            const out = fn(item, i, inputArr);
            if (out !== undefined) logs.push({ nodeId: node.id, value: out });
          } else {
            logs.push({ nodeId: node.id, value: item });
          }
        });
        return inputArr;
      }
      if (op === "map") return fn ? inputArr.map(fn) : inputArr.map((item) => item);
      if (op === "filter") return fn ? inputArr.filter(fn) : inputArr.filter(Boolean);
      return inputArr;
    }

    case "jsonNode": {
      const input = getIncomingValue(node.id, "value", nodes, edges, results);
      const op = data.jsonOp || "parse";
      if (op === "template") {
        let tpl = data.jsonValue || "{}";
        tpl = tpl.replace(/\$\{([^}]+)\}/g, (_, varName) => {
          const trimmed = varName.trim();
          // Look up variable name from results of variableNode / inputNode
          for (const n of nodes) {
            if (
              (n.type === "variableNode" || n.type === "inputNode") &&
              n.data?.name === trimmed &&
              results[n.id] !== undefined
            ) {
              const v = results[n.id];
              return typeof v === "object" ? JSON.stringify(v) : String(v);
            }
          }
          return "${" + trimmed + "}";
        });
        try {
          return JSON.parse(tpl);
        } catch (e) {
          return `Template Error: ${e.message}`;
        }
      }
      if (op === "parse") {
        const src = input !== undefined ? input : data.jsonValue || "{}";
        try {
          return JSON.parse(src);
        } catch (e) {
          return `JSON Error: ${e.message}`;
        }
      }
      if (op === "stringify") {
        const val = input !== undefined ? input : parseLiteralValue(data.jsonValue);
        return JSON.stringify(val, null, 2);
      }
      if (op === "get") {
        const obj = input !== undefined ? input : parseLiteralValue(data.jsonValue);
        const path = data.path || "";
        if (!path) return obj;
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
      }
      if (op === "set") {
        const obj = input !== undefined ? { ...input } : parseLiteralValue(data.jsonValue) || {};
        const path = data.path || "";
        const value = parseLiteralValue(data.setValue);
        if (!path) return obj;
        const keys = path.split(".");
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!cur[keys[i]]) cur[keys[i]] = {};
          cur = cur[keys[i]];
        }
        cur[keys[keys.length - 1]] = value;
        return obj;
      }
      return input;
    }

    case "moduleNode": {
      return `Module: ${data.moduleName || "unnamed"}`;
    }

    case "apiNode": {
      const method = (data.method || "GET").toUpperCase();
      const url = data.url || "";
      if (!url) return "Error: No URL provided";
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return "Error: Invalid URL";
      }
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return "Error: Only http/https URLs allowed";
      }
      const opts = { method };
      if (data.headers) {
        try {
          opts.headers = JSON.parse(data.headers);
        } catch {
          /* skip */
        }
      }
      if (method === "POST" || method === "PUT") {
        const bodyInput = getIncomingValue(node.id, "body", nodes, edges, results);
        const bodyStr =
          bodyInput !== undefined
            ? typeof bodyInput === "object"
              ? JSON.stringify(bodyInput)
              : String(bodyInput)
            : data.body || "";
        if (bodyStr) {
          opts.body = bodyStr;
          opts.headers = { "Content-Type": "application/json", ...opts.headers };
        }
      }
      try {
        const res = await fetch(url, opts);
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      } catch (e) {
        return `Error: ${e.message}`;
      }
    }

    default:
      return `Unknown node type: ${type}`;
  }
}
