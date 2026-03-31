/**
 * Metadata for all available functions — parameter names, descriptions, callback flags.
 * Used by FunctionNode to display meaningful labels instead of Arg0/Arg1/Arg2/Arg3.
 */

export const FUNCTION_META = {
  // === Math ===
  abs: { cat: "Math", desc: "Absolute value", params: [{ name: "value", desc: "Number" }] },
  ceil: { cat: "Math", desc: "Round up", params: [{ name: "value", desc: "Number" }] },
  floor: { cat: "Math", desc: "Round down", params: [{ name: "value", desc: "Number" }] },
  round: { cat: "Math", desc: "Round to nearest", params: [{ name: "value", desc: "Number" }] },
  sqrt: { cat: "Math", desc: "Square root", params: [{ name: "value", desc: "Number" }] },
  cbrt: { cat: "Math", desc: "Cube root", params: [{ name: "value", desc: "Number" }] },
  log: { cat: "Math", desc: "Natural logarithm", params: [{ name: "value", desc: "Number" }] },
  log2: { cat: "Math", desc: "Base-2 logarithm", params: [{ name: "value", desc: "Number" }] },
  log10: { cat: "Math", desc: "Base-10 logarithm", params: [{ name: "value", desc: "Number" }] },
  sin: { cat: "Math", desc: "Sine (radians)", params: [{ name: "angle", desc: "Radians" }] },
  cos: { cat: "Math", desc: "Cosine (radians)", params: [{ name: "angle", desc: "Radians" }] },
  tan: { cat: "Math", desc: "Tangent (radians)", params: [{ name: "angle", desc: "Radians" }] },
  asin: { cat: "Math", desc: "Arcsine", params: [{ name: "value", desc: "-1..1" }] },
  acos: { cat: "Math", desc: "Arccosine", params: [{ name: "value", desc: "-1..1" }] },
  atan: { cat: "Math", desc: "Arctangent", params: [{ name: "value", desc: "Number" }] },
  atan2: {
    cat: "Math",
    desc: "Arctangent of y/x",
    params: [
      { name: "y", desc: "Number" },
      { name: "x", desc: "Number" },
    ],
  },
  min: {
    cat: "Math",
    desc: "Minimum of values",
    params: [
      { name: "a", desc: "Number" },
      { name: "b", desc: "Number" },
    ],
  },
  max: {
    cat: "Math",
    desc: "Maximum of values",
    params: [
      { name: "a", desc: "Number" },
      { name: "b", desc: "Number" },
    ],
  },
  pow: {
    cat: "Math",
    desc: "Raise to power",
    params: [
      { name: "base", desc: "Number" },
      { name: "exp", desc: "Exponent" },
    ],
  },
  sign: { cat: "Math", desc: "Sign of number (-1, 0, 1)", params: [{ name: "value", desc: "Number" }] },
  trunc: { cat: "Math", desc: "Truncate decimal", params: [{ name: "value", desc: "Number" }] },
  random: { cat: "Math", desc: "Random 0..1", params: [] },
  PI: { cat: "Math", desc: "Pi constant", params: [] },
  E: { cat: "Math", desc: "Euler constant", params: [] },

  // === String ===
  length: { cat: "String", desc: "String length", params: [{ name: "str", desc: "String" }] },
  toUpperCase: { cat: "String", desc: "Convert to uppercase", params: [{ name: "str", desc: "String" }] },
  toLowerCase: { cat: "String", desc: "Convert to lowercase", params: [{ name: "str", desc: "String" }] },
  trim: { cat: "String", desc: "Remove whitespace", params: [{ name: "str", desc: "String" }] },
  split: {
    cat: "String",
    desc: "Split into array",
    params: [
      { name: "str", desc: "String" },
      { name: "sep", desc: "Separator" },
    ],
  },
  join: {
    cat: "String",
    desc: "Join array to string",
    params: [
      { name: "arr", desc: "Array" },
      { name: "sep", desc: "Separator" },
    ],
  },
  includes: {
    cat: "String",
    desc: "Check if contains",
    params: [
      { name: "str", desc: "String" },
      { name: "search", desc: "Substring" },
    ],
  },
  startsWith: {
    cat: "String",
    desc: "Starts with prefix?",
    params: [
      { name: "str", desc: "String" },
      { name: "prefix", desc: "Prefix" },
    ],
  },
  endsWith: {
    cat: "String",
    desc: "Ends with suffix?",
    params: [
      { name: "str", desc: "String" },
      { name: "suffix", desc: "Suffix" },
    ],
  },
  indexOf: {
    cat: "String",
    desc: "Index of substring",
    params: [
      { name: "str", desc: "String" },
      { name: "search", desc: "Substring" },
    ],
  },
  slice: {
    cat: "String",
    desc: "Extract substring",
    params: [
      { name: "str", desc: "String" },
      { name: "start", desc: "Start idx" },
      { name: "end", desc: "End idx" },
    ],
  },
  replace: {
    cat: "String",
    desc: "Replace first match",
    params: [
      { name: "str", desc: "String" },
      { name: "from", desc: "Search" },
      { name: "to", desc: "Replace with" },
    ],
  },
  repeat: {
    cat: "String",
    desc: "Repeat N times",
    params: [
      { name: "str", desc: "String" },
      { name: "count", desc: "Times" },
    ],
  },
  padStart: {
    cat: "String",
    desc: "Pad start to length",
    params: [
      { name: "str", desc: "String" },
      { name: "len", desc: "Target len" },
      { name: "fill", desc: "Fill char" },
    ],
  },
  padEnd: {
    cat: "String",
    desc: "Pad end to length",
    params: [
      { name: "str", desc: "String" },
      { name: "len", desc: "Target len" },
      { name: "fill", desc: "Fill char" },
    ],
  },
  concat: {
    cat: "String",
    desc: "Concatenate strings",
    params: [
      { name: "a", desc: "String" },
      { name: "b", desc: "String" },
      { name: "c", desc: "String" },
      { name: "d", desc: "String" },
    ],
  },
  toString: { cat: "String", desc: "Convert to string", params: [{ name: "value", desc: "Any value" }] },
  parseInt: {
    cat: "Convert",
    desc: "Parse integer",
    params: [
      { name: "str", desc: "String" },
      { name: "radix", desc: "Base (10)" },
    ],
  },
  parseFloat: { cat: "Convert", desc: "Parse float", params: [{ name: "str", desc: "String" }] },
  Number: { cat: "Convert", desc: "Convert to number", params: [{ name: "value", desc: "Any value" }] },
  Boolean: { cat: "Convert", desc: "Convert to boolean", params: [{ name: "value", desc: "Any value" }] },
  JSON_stringify: { cat: "JSON", desc: "Object to JSON string", params: [{ name: "value", desc: "Object/Array" }] },
  JSON_parse: { cat: "JSON", desc: "JSON string to object", params: [{ name: "str", desc: "JSON string" }] },

  // === Array (with callbacks) ===
  map: {
    cat: "Array",
    desc: "Transform each element",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(item) => result", isCallback: true },
    ],
  },
  filter: {
    cat: "Array",
    desc: "Keep matching elements",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(item) => bool", isCallback: true },
    ],
  },
  reduce: {
    cat: "Array",
    desc: "Reduce to single value",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(acc, item) => acc", isCallback: true },
      { name: "init", desc: "Initial value" },
    ],
  },
  find: {
    cat: "Array",
    desc: "Find first match",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(item) => bool", isCallback: true },
    ],
  },
  some: {
    cat: "Array",
    desc: "Any element matches?",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(item) => bool", isCallback: true },
    ],
  },
  every: {
    cat: "Array",
    desc: "All elements match?",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(item) => bool", isCallback: true },
    ],
  },
  flatMap: {
    cat: "Array",
    desc: "Map then flatten",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(item) => result", isCallback: true },
    ],
  },
  sort: {
    cat: "Array",
    desc: "Sort array",
    params: [
      { name: "arr", desc: "Array" },
      { name: "fn", desc: "(a, b) => number", isCallback: true },
    ],
  },
  push: {
    cat: "Array",
    desc: "Append to array",
    params: [
      { name: "arr", desc: "Array" },
      { name: "value", desc: "Item to add" },
    ],
  },
  pop: { cat: "Array", desc: "Remove last element", params: [{ name: "arr", desc: "Array" }] },
  shift: { cat: "Array", desc: "Remove first element", params: [{ name: "arr", desc: "Array" }] },
  unshift: {
    cat: "Array",
    desc: "Prepend to array",
    params: [
      { name: "arr", desc: "Array" },
      { name: "value", desc: "Item to add" },
    ],
  },
  splice: {
    cat: "Array",
    desc: "Remove/insert items",
    params: [
      { name: "arr", desc: "Array" },
      { name: "start", desc: "Start idx" },
      { name: "count", desc: "Delete count" },
    ],
  },
  flat: {
    cat: "Array",
    desc: "Flatten nested arrays",
    params: [
      { name: "arr", desc: "Array" },
      { name: "depth", desc: "Depth (1)" },
    ],
  },
  reverse: { cat: "Array", desc: "Reverse array", params: [{ name: "arr", desc: "Array" }] },
  Array_from: { cat: "Array", desc: "Create array from iterable", params: [{ name: "value", desc: "Iterable" }] },
  Array_isArray: { cat: "Array", desc: "Check if array", params: [{ name: "value", desc: "Any value" }] },

  // === Object ===
  Object_keys: { cat: "Object", desc: "Get object keys", params: [{ name: "obj", desc: "Object" }] },
  Object_values: { cat: "Object", desc: "Get object values", params: [{ name: "obj", desc: "Object" }] },
  Object_entries: { cat: "Object", desc: "Get key-value pairs", params: [{ name: "obj", desc: "Object" }] },
  Object_assign: {
    cat: "Object",
    desc: "Merge objects",
    params: [
      { name: "target", desc: "Object" },
      { name: "source", desc: "Object" },
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
