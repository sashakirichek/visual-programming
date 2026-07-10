/**
 * Metadata for all available functions — parameter names, descriptions, callback flags, and types.
 * Used by FunctionNode to display meaningful labels instead of Arg0/Arg1/Arg2/Arg3.
 *
 * Type system:
 * - params[i].type: expected input type ('number', 'string', 'array', 'object', 'any', 'boolean', 'map', 'set')
 * - outputType: return value type
 */

export const FUNCTION_META = {
  // === Math ===
  abs: {
    cat: "Math",
    desc: "Absolute value",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  ceil: {
    cat: "Math",
    desc: "Round up",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  floor: {
    cat: "Math",
    desc: "Round down",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  round: {
    cat: "Math",
    desc: "Round to nearest",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  sqrt: {
    cat: "Math",
    desc: "Square root",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  cbrt: {
    cat: "Math",
    desc: "Cube root",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  log: {
    cat: "Math",
    desc: "Natural logarithm",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  log2: {
    cat: "Math",
    desc: "Base-2 logarithm",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  log10: {
    cat: "Math",
    desc: "Base-10 logarithm",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  sin: {
    cat: "Math",
    desc: "Sine (radians)",
    outputType: "number",
    params: [{ name: "angle", desc: "Radians", type: "number" }],
  },
  cos: {
    cat: "Math",
    desc: "Cosine (radians)",
    outputType: "number",
    params: [{ name: "angle", desc: "Radians", type: "number" }],
  },
  tan: {
    cat: "Math",
    desc: "Tangent (radians)",
    outputType: "number",
    params: [{ name: "angle", desc: "Radians", type: "number" }],
  },
  asin: {
    cat: "Math",
    desc: "Arcsine",
    outputType: "number",
    params: [{ name: "value", desc: "-1..1", type: "number" }],
  },
  acos: {
    cat: "Math",
    desc: "Arccosine",
    outputType: "number",
    params: [{ name: "value", desc: "-1..1", type: "number" }],
  },
  atan: {
    cat: "Math",
    desc: "Arctangent",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  atan2: {
    cat: "Math",
    desc: "Arctangent of y/x",
    outputType: "number",
    params: [
      { name: "y", desc: "Number", type: "number" },
      { name: "x", desc: "Number", type: "number" },
    ],
  },
  min: {
    cat: "Math",
    desc: "Minimum of values",
    outputType: "number",
    params: [
      { name: "a", desc: "Number", type: "number" },
      { name: "b", desc: "Number", type: "number" },
    ],
  },
  max: {
    cat: "Math",
    desc: "Maximum of values",
    outputType: "number",
    params: [
      { name: "a", desc: "Number", type: "number" },
      { name: "b", desc: "Number", type: "number" },
    ],
  },
  pow: {
    cat: "Math",
    desc: "Raise to power",
    outputType: "number",
    params: [
      { name: "base", desc: "Number", type: "number" },
      { name: "exp", desc: "Exponent", type: "number" },
    ],
  },
  sign: {
    cat: "Math",
    desc: "Sign of number (-1, 0, 1)",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  trunc: {
    cat: "Math",
    desc: "Truncate decimal",
    outputType: "number",
    params: [{ name: "value", desc: "Number", type: "number" }],
  },
  random: { cat: "Math", desc: "Random 0..1", outputType: "number", params: [] },
  PI: { cat: "Math", desc: "Pi constant", outputType: "number", params: [] },
  E: { cat: "Math", desc: "Euler constant", outputType: "number", params: [] },

  // === String ===
  length: {
    cat: "String",
    desc: "String length",
    outputType: "number",
    params: [{ name: "str", desc: "String", type: "string" }],
  },
  toUpperCase: {
    cat: "String",
    desc: "Convert to uppercase",
    outputType: "string",
    params: [{ name: "str", desc: "String", type: "string" }],
  },
  toLowerCase: {
    cat: "String",
    desc: "Convert to lowercase",
    outputType: "string",
    params: [{ name: "str", desc: "String", type: "string" }],
  },
  trim: {
    cat: "String",
    desc: "Remove whitespace",
    outputType: "string",
    params: [{ name: "str", desc: "String", type: "string" }],
  },
  split: {
    cat: "String",
    desc: "Split into array",
    outputType: "array",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "sep", desc: "Separator", type: "string" },
    ],
  },
  join: {
    cat: "String",
    desc: "Join array to string",
    outputType: "string",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "sep", desc: "Separator", type: "string" },
    ],
  },
  includes: {
    cat: "String",
    desc: "Check if contains",
    outputType: "boolean",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "search", desc: "Substring", type: "string" },
    ],
  },
  startsWith: {
    cat: "String",
    desc: "Starts with prefix?",
    outputType: "boolean",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "prefix", desc: "Prefix", type: "string" },
    ],
  },
  endsWith: {
    cat: "String",
    desc: "Ends with suffix?",
    outputType: "boolean",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "suffix", desc: "Suffix", type: "string" },
    ],
  },
  indexOf: {
    cat: "String",
    desc: "Index of substring",
    outputType: "number",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "search", desc: "Substring", type: "string" },
    ],
  },
  slice: {
    cat: "String",
    desc: "Extract substring",
    outputType: "string",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "start", desc: "Start idx", type: "number" },
      { name: "end", desc: "End idx", type: "number" },
    ],
  },
  replace: {
    cat: "String",
    desc: "Replace first match",
    outputType: "string",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "from", desc: "Search", type: "string" },
      { name: "to", desc: "Replace with", type: "string" },
    ],
  },
  repeat: {
    cat: "String",
    desc: "Repeat N times",
    outputType: "string",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "count", desc: "Times", type: "number" },
    ],
  },
  padStart: {
    cat: "String",
    desc: "Pad start to length",
    outputType: "string",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "len", desc: "Target len", type: "number" },
      { name: "fill", desc: "Fill char", type: "string" },
    ],
  },
  padEnd: {
    cat: "String",
    desc: "Pad end to length",
    outputType: "string",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "len", desc: "Target len", type: "number" },
      { name: "fill", desc: "Fill char", type: "string" },
    ],
  },
  concat: {
    cat: "String",
    desc: "Concatenate strings",
    outputType: "string",
    params: [
      { name: "a", desc: "String", type: "string" },
      { name: "b", desc: "String", type: "string" },
      { name: "c", desc: "String", type: "string" },
      { name: "d", desc: "String", type: "string" },
    ],
  },
  toString: {
    cat: "String",
    desc: "Convert to string",
    outputType: "string",
    params: [{ name: "value", desc: "Any value", type: "any" }],
  },
  parseInt: {
    cat: "Convert",
    desc: "Parse integer",
    outputType: "number",
    params: [
      { name: "str", desc: "String", type: "string" },
      { name: "radix", desc: "Base (10)", type: "number" },
    ],
  },
  parseFloat: {
    cat: "Convert",
    desc: "Parse float",
    outputType: "number",
    params: [{ name: "str", desc: "String", type: "string" }],
  },
  Number: {
    cat: "Convert",
    desc: "Convert to number",
    outputType: "number",
    params: [{ name: "value", desc: "Any value", type: "any" }],
  },
  Boolean: {
    cat: "Convert",
    desc: "Convert to boolean",
    outputType: "boolean",
    params: [{ name: "value", desc: "Any value", type: "any" }],
  },
  JSON_stringify: {
    cat: "JSON",
    desc: "Object to JSON string",
    outputType: "string",
    params: [{ name: "value", desc: "Object/Array", type: "any" }],
  },
  JSON_parse: {
    cat: "JSON",
    desc: "JSON string to object",
    outputType: "any",
    params: [{ name: "str", desc: "JSON string", type: "string" }],
  },

  // === Array (with callbacks) ===
  map: {
    cat: "Array",
    desc: "Transform each element",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(item) => result", isCallback: true, type: "any" },
    ],
  },
  filter: {
    cat: "Array",
    desc: "Keep matching elements",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(item) => bool", isCallback: true, type: "any" },
    ],
  },
  reduce: {
    cat: "Array",
    desc: "Reduce to single value",
    outputType: "any",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(acc, item) => acc", isCallback: true, type: "any" },
      { name: "init", desc: "Initial value", type: "any" },
    ],
  },
  find: {
    cat: "Array",
    desc: "Find first match",
    outputType: "any",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(item) => bool", isCallback: true, type: "any" },
    ],
  },
  some: {
    cat: "Array",
    desc: "Any element matches?",
    outputType: "boolean",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(item) => bool", isCallback: true, type: "any" },
    ],
  },
  every: {
    cat: "Array",
    desc: "All elements match?",
    outputType: "boolean",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(item) => bool", isCallback: true, type: "any" },
    ],
  },
  flatMap: {
    cat: "Array",
    desc: "Map then flatten",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(item) => result", isCallback: true, type: "any" },
    ],
  },
  sort: {
    cat: "Array",
    desc: "Sort array",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "fn", desc: "(a, b) => number", isCallback: true, type: "any" },
    ],
  },
  push: {
    cat: "Array",
    desc: "Append to array",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "value", desc: "Item to add", type: "any" },
    ],
  },
  pop: {
    cat: "Array",
    desc: "Remove last element",
    outputType: "array",
    params: [{ name: "arr", desc: "Array", type: "array" }],
  },
  shift: {
    cat: "Array",
    desc: "Remove first element",
    outputType: "array",
    params: [{ name: "arr", desc: "Array", type: "array" }],
  },
  unshift: {
    cat: "Array",
    desc: "Prepend to array",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "value", desc: "Item to add", type: "any" },
    ],
  },
  splice: {
    cat: "Array",
    desc: "Remove/insert items",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "start", desc: "Start idx", type: "number" },
      { name: "count", desc: "Delete count", type: "number" },
    ],
  },
  flat: {
    cat: "Array",
    desc: "Flatten nested arrays",
    outputType: "array",
    params: [
      { name: "arr", desc: "Array", type: "array" },
      { name: "depth", desc: "Depth (1)", type: "number" },
    ],
  },
  reverse: {
    cat: "Array",
    desc: "Reverse array",
    outputType: "array",
    params: [{ name: "arr", desc: "Array", type: "array" }],
  },
  Array_from: {
    cat: "Array",
    desc: "Create array from iterable",
    outputType: "array",
    params: [{ name: "value", desc: "Iterable", type: "any" }],
  },
  Array_isArray: {
    cat: "Array",
    desc: "Check if array",
    outputType: "boolean",
    params: [{ name: "value", desc: "Any value", type: "any" }],
  },

  // === Object ===
  Object_keys: {
    cat: "Object",
    desc: "Get object keys",
    outputType: "array",
    params: [{ name: "obj", desc: "Object", type: "object" }],
  },
  Object_values: {
    cat: "Object",
    desc: "Get object values",
    outputType: "array",
    params: [{ name: "obj", desc: "Object", type: "object" }],
  },
  Object_entries: {
    cat: "Object",
    desc: "Get key-value pairs",
    outputType: "array",
    params: [{ name: "obj", desc: "Object", type: "object" }],
  },
  Object_assign: {
    cat: "Object",
    desc: "Merge objects",
    outputType: "object",
    params: [
      { name: "target", desc: "Object", type: "object" },
      { name: "source", desc: "Object", type: "object" },
    ],
  },
};

// Auto-derive categories from metadata — add a new function above and it appears in the UI
export const CATEGORIES = {};
for (const [name, meta] of Object.entries(FUNCTION_META)) {
  const cat = meta.cat;
  if (!CATEGORIES[cat]) CATEGORIES[cat] = [];
  CATEGORIES[cat].push(name);
}
