# Type System Guide

## Overview

I've implemented a comprehensive type system with **color-coded handles** and **connection validation** for your visual programming app. This ensures type-safe connections and prevents common mistakes like using `.map()` on non-array inputs.

## What's New

### 1. **Color-Coded Handles**

Each handle now displays a color based on its data type:

```
🟠 Orange  → Number      (Math operations)
🟢 Green   → String      (Text operations)
🔵 Blue    → Array       (map, filter, etc.)
🟣 Purple  → Object      (key-value operations)
🔴 Red     → Boolean     (Conditions, comparisons)
🔷 Cyan    → Map         (Map data structure)
🟢 Light Green → Set     (Set data structure)
⚫ Gray    → Any         (Type-agnostic)
```

### 2. **Connection Validation**

The system validates connections between nodes:

- **Array functions** (`.map`, `.filter`, etc.) only accept array inputs
- **String functions** (`.toUpperCase`, `.split`, etc.) only accept string inputs
- **Math functions** (`.sqrt`, `.abs`, etc.) only accept number inputs
- **Condition inputs** expect boolean values
- **Output types** are inferred from functions (e.g., `.split()` returns array)

### 2.5. **Invalid Connection Visualization** ⚠️

When you create a connection between incompatible types:

- **Red dashed line** connects the two nodes
- **"⚠ Type mismatch" label** appears on the edge
- **Error notification** pops up in the top-right corner
- **Connection still works** at runtime (graceful degradation)

Example error messages:

```
⚠ Cannot connect string to array
⚠ Cannot connect number to boolean
⚠ Cannot connect map to string
```

### 3. **Type Inference**

The system intelligently infers types:

```javascript
// InputNode with value "42"
→ Inferred as: Number 🟠

// InputNode with value "[1,2,3]"
→ Inferred as: Array 🔵

// InputNode with value "hello"
→ Inferred as: String 🟢

// FunctionNode with split()
→ Output type: Array 🔵 (always)

// OperatorNode with >
→ Output type: Boolean 🔴 (comparison)
```

## How It Works

### Connection Flow

1. **User connects** OutputNode A (blue handle) to InputNode B (red handle)
2. **Validator checks**: Is blue (array) compatible with red (boolean)?
3. **Decision**: If incompatible, connection is marked as invalid but still created
4. **Runtime**: Execution handles type mismatches gracefully

### Function Metadata

All functions now include type information:

```javascript
// Before
map: {
  desc: "Transform each element",
  params: [
    { name: "arr", desc: "Array" },
    { name: "fn", desc: "(item) => result", isCallback: true }
  ]
}

// After
map: {
  desc: "Transform each element",
  outputType: "array",  // ← New
  params: [
    { name: "arr", desc: "Array", type: "array" },  // ← New
    { name: "fn", desc: "(item) => result", isCallback: true, type: "any" }  // ← New
  ]
}
```

## Examples

### ✅ Valid Connections

```
InputNode (array) → map() → Output ✓
InputNode (string) → split() → Output ✓
Operator (>) → Condition input ✓
split() output (array) → join() input ✓
```

### ❌ Invalid Connections (Still Work, Gracefully)

```
InputNode (string) → map() → Error (expects array)
InputNode (number) → split() → Error (expects string)
InputNode (array) → sqrt() → Error (expects number)
```

## Files Modified

1. **`src/utils/typeChecker.js`** (NEW)
   - Type validation logic
   - Compatibility matrix
   - Color mapping

2. **`src/data/functionMeta.js`**
   - Added `outputType` to all functions
   - Added `type` to all parameters

3. **`src/store/flowStore.js`**
   - Added edge validation in `onConnect`
   - Track validation errors in state

4. **`src/App.css`**
   - Type-specific handle colors
   - Hover effects
   - Error indicators

5. **Node Components** (updated)
   - `InputNode.jsx` - Type inference from value
   - `VariableNode.jsx` - Same as InputNode
   - `OperatorNode.jsx` - Operator-dependent output type
   - `ConditionNode.jsx` - Boolean input, any output
   - `FunctionNode.jsx` - Uses function metadata
   - `ForLoopNode.jsx` - Type-colored closure handles

## Type Compatibility Matrix

| Target      | number | string | array | object | boolean | map | set | any |
| ----------- | ------ | ------ | ----- | ------ | ------- | --- | --- | --- |
| **number**  | ✓      | -      | -     | -      | -       | -   | -   | ✓   |
| **string**  | -      | ✓      | -     | -      | -       | -   | -   | ✓   |
| **array**   | -      | -      | ✓     | -      | -       | -   | -   | ✓   |
| **object**  | -      | -      | -     | ✓      | -       | -   | -   | ✓   |
| **boolean** | -      | -      | -     | -      | ✓       | -   | -   | ✓   |
| **map**     | -      | -      | -     | -      | -       | ✓   | -   | ✓   |
| **set**     | -      | -      | -     | -      | -       | -   | ✓   | ✓   |
| **any**     | ✓      | ✓      | ✓     | ✓      | ✓       | ✓   | ✓   | ✓   |

## Visual Examples

### Handle Colors in Action

```
FunctionNode (map)
├─ Input: 🔵 arr (expects array)
├─ Input: ⚫ fn (accepts any)
└─ Output: 🔵 result (returns array)

FunctionNode (split)
├─ Input: 🟢 str (expects string)
├─ Input: 🟢 sep (expects string)
└─ Output: 🔵 result (returns array)

OperatorNode (+)
├─ Input: 🟠 a (expects number)
├─ Input: 🟠 b (expects number)
└─ Output: 🟠 result (returns number)

OperatorNode (>)
├─ Input: 🟠 a (expects number)
├─ Input: 🟠 b (expects number)
└─ Output: 🔴 result (returns boolean)
```

## Future Enhancements

These features are planned but not yet implemented:

1. **Error Toast Notifications**
   - Show user when connecting incompatible types
   - "Cannot connect number to array"

2. **Connection Preview**
   - Show type mismatch warning before connecting
   - "This connection may cause runtime errors"

3. **Type Conversion Nodes**
   - Explicit cast nodes: string → number, etc.
   - Auto-conversion helpers

4. **Generic Types**
   - Better support for callback parameters
   - Type inference from lambda expressions

## Testing the Type System

Try these experiments:

1. **Create InputNode** with value `42` → See 🟠 handle
2. **Create InputNode** with value `[1,2,3]` → See 🔵 handle
3. **Create FunctionNode** with `split` function → See input 🟢 and output 🔵
4. **Try connecting** string output to number input → Connection creates, but marked as invalid
5. **Try connecting** array output to `.map()` → Success! ✓

## Technical Details

### Type Inference Algorithm

```javascript
// For InputNode with valueType="literal"
if (value === "true" || value === "false") return "boolean";
else if (!isNaN(parseFloat(value))) return "number";
else if (value.startsWith("[")) return "array";
else if (value.startsWith("{")) return "object";
else return "string";
```

### Connection Validation

```javascript
validateConnection(sourceNodeId, sourceHandle, targetNodeId, targetHandle) {
  const sourceType = getNodeOutputType(sourceNode)
  const targetType = getExpectedParameterType(targetNode, paramIndex)

  if (!areTypesCompatible(sourceType, targetType)) {
    return { valid: false, error: `Cannot connect ${sourceType} to ${targetType}` }
  }
  return { valid: true, error: null }
}
```

## Summary

✅ **Type System Complete!**

- 8 distinct types with unique colors
- ~80+ functions fully typed
- Type validation on all connections
- **Red dashed lines for invalid connections**
- **Error notifications in top-right corner**
- Graceful error handling
- Visual feedback through colors and warnings

The system is designed to be **helpful without being restrictive** — invalid connections are allowed to flow through with runtime handling, but visual indicators (red edges, error toasts, color coding) guide users toward correct connections.

## Testing Invalid Connections

### Quick Test

1. **Open the "Type Mismatch Demo" example** in the Examples panel
2. Look for the **red dashed line** connecting a string input to `.map()`
3. See the **"⚠ Type mismatch" label** on the red edge
4. Check for error notification in top-right corner

### Manual Test

1. Create a new flow with:
   - InputNode with value `"hello"` (🟢 green string handle)
   - FunctionNode with `map` function
   - Try to connect the string input to the array parameter

2. Expected result:
   - 🔴 Red dashed connection line appears
   - ⚠️ Error toast: "Cannot connect string to array"
   - Edge labeled "⚠ Type mismatch"
   - 🟠 Orange handle on `.map()` expects array (🔵 blue)

### Error Notification Examples

When connecting incompatible types, you'll see notifications like:

```
⚠️ Cannot connect number to array
⚠️ Cannot connect string to number
⚠️ Cannot connect string to object
⚠️ Cannot connect array to boolean
```

### Valid vs Invalid Connections

**Valid Connection (🟢 green dashed line):**

```
InputNode("hello") 🟢 → split() 🟢 ✓
  String output    →  String param ✓
```

**Invalid Connection (🔴 red dashed line):**

```
InputNode("hello") 🟢 → map() 🔵 ⚠️
  String output    →  Array param ✗
```
