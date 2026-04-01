export const VALUE_TYPE_OPTIONS = [
  { value: "literal", label: "Literal" },
  { value: "map", label: "Map()" },
  { value: "set", label: "Set()" },
  { value: "symbol", label: "Symbol()" },
];

const VALUE_TYPE_PLACEHOLDERS = {
  literal: '3, true, hello, [1,2], {"a":1}',
  map: 'blank = new Map(), [["k",1]] or {"k":1}',
  set: "blank = new Set(), [1,2,3]",
  symbol: "description",
};

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function normalizeValue(value, seen = new WeakSet()) {
  if (typeof value === "symbol") return value.toString();
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Date) return value.toISOString();

  if (value instanceof Map) {
    if (seen.has(value)) return "[Circular Map]";
    seen.add(value);
    const normalizedMap = {
      __type: `Map(${value.size})`,
      entries: Array.from(value.entries()).map(([key, entryValue]) => [
        normalizeValue(key, seen),
        normalizeValue(entryValue, seen),
      ]),
    };
    seen.delete(value);
    return normalizedMap;
  }

  if (value instanceof Set) {
    if (seen.has(value)) return "[Circular Set]";
    seen.add(value);
    const normalizedSet = {
      __type: `Set(${value.size})`,
      values: Array.from(value.values()).map((entryValue) => normalizeValue(entryValue, seen)),
    };
    seen.delete(value);
    return normalizedSet;
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) return "[Circular Array]";
    seen.add(value);
    const normalizedArray = value.map((entryValue) => normalizeValue(entryValue, seen));
    seen.delete(value);
    return normalizedArray;
  }

  if (value && typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    const normalizedObject = {};
    for (const [key, entryValue] of Object.entries(value)) {
      normalizedObject[key] = normalizeValue(entryValue, seen);
    }
    seen.delete(value);
    return normalizedObject;
  }

  return value;
}

function stringifyStructuredValue(value, pretty = false) {
  return JSON.stringify(normalizeValue(value), null, pretty ? 2 : 0);
}

export function parseLiteralValue(str) {
  if (str === undefined || str === null || str === "") return str;
  if (str === "true") return true;
  if (str === "false") return false;
  if (str === "null") return null;
  if (str === "undefined") return undefined;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export function parseNodeValue(rawValue, valueType = "literal") {
  switch (valueType) {
    case "map": {
      if (rawValue === undefined || rawValue === null || rawValue === "") return new Map();
      const parsedValue = parseLiteralValue(rawValue);
      try {
        if (parsedValue instanceof Map) return new Map(parsedValue);
        if (Array.isArray(parsedValue)) return new Map(parsedValue);
        if (isPlainObject(parsedValue)) return new Map(Object.entries(parsedValue));
      } catch (error) {
        return `Error: ${error.message}`;
      }
      return "Error: Map value must be [[key, value], ...] or an object";
    }
    case "set": {
      if (rawValue === undefined || rawValue === null || rawValue === "") return new Set();
      const parsedValue = parseLiteralValue(rawValue);
      if (parsedValue instanceof Set) return new Set(parsedValue);
      if (Array.isArray(parsedValue)) return new Set(parsedValue);
      return "Error: Set value must be an array";
    }
    case "symbol": {
      if (rawValue === undefined || rawValue === null || rawValue === "") return Symbol();
      const parsedValue = parseLiteralValue(rawValue);
      return Symbol(typeof parsedValue === "string" ? parsedValue : String(parsedValue));
    }
    default:
      return parseLiteralValue(rawValue);
  }
}

export function getValuePlaceholder(valueType = "literal") {
  return VALUE_TYPE_PLACEHOLDERS[valueType] || VALUE_TYPE_PLACEHOLDERS.literal;
}

export function getClosureCount(data = {}) {
  const explicitCount = Number(data.closureCount);
  let inferredCount = 0;

  for (const key of Object.keys(data)) {
    const match = key.match(/^bind(?:Name)?(\d+)$/);
    if (match) {
      inferredCount = Math.max(inferredCount, Number(match[1]) + 1);
    }
  }

  if (Number.isFinite(explicitCount)) {
    return Math.max(explicitCount, 0);
  }

  return inferredCount;
}

export function formatValue(value, options = {}) {
  const { pretty = false, maxLength } = options;
  let output;

  if (value === undefined) {
    output = "undefined";
  } else if (typeof value === "string") {
    output = value;
  } else if (typeof value === "symbol") {
    output = value.toString();
  } else if (typeof value === "function") {
    output = `[Function ${value.name || "anonymous"}]`;
  } else if (value instanceof Map) {
    output = pretty
      ? stringifyStructuredValue(value, true)
      : `Map(${value.size}) ${stringifyStructuredValue(Array.from(value.entries()))}`;
  } else if (value instanceof Set) {
    output = pretty
      ? stringifyStructuredValue(value, true)
      : `Set(${value.size}) ${stringifyStructuredValue(Array.from(value.values()))}`;
  } else if (value !== null && typeof value === "object") {
    output = stringifyStructuredValue(value, pretty);
  } else {
    output = String(value);
  }

  if (typeof maxLength === "number" && output.length > maxLength) {
    return `${output.slice(0, maxLength)}...`;
  }

  return output;
}
