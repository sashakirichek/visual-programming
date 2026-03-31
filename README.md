# Visual Programming

A node-based visual programming environment built with React, [@xyflow/react](https://reactflow.dev), and TanStack.

![Visual Programming UI](https://github.com/user-attachments/assets/326a23b5-f071-492a-8915-097dbaa9b803)

## Features

- **Node-based diagram** – drag, connect, and execute nodes visually using React Flow
- **Execution engine** – supports all JS operators (`+`, `-`, `*`, `/`, `%`, `**`, `===`, `!==`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `??`) and built-in functions (Math, String, Array, Object, JSON)
- **Visual debugger** – step through execution, highlight active nodes, watch variables, view execution trace
- **JSON support** – export the full flow to JSON, copy to clipboard, download, or import from a file
- **Module system** – save the current flow as a reusable module and load it back into any flow
- **GitHub Actions coding agent** – label any issue with `approved-for-fix` to trigger the AI coding agent

## Node Types

| Node         | Description                                              |
| ------------ | -------------------------------------------------------- |
| 📥 Input     | Static value input (string, number, boolean, JSON)       |
| 📤 Output    | Display the result of connected nodes                    |
| 📦 Variable  | Named variable that holds a value                        |
| ⚙️ Operator  | Binary math/logic operator                               |
| ƒ Function   | Built-in JS function (Math, String, Array, Object, JSON) |
| 🔀 Condition | If/else branch based on a condition                      |
| 🔄 Loop      | Array iteration (forEach, map, filter)                   |
| 📄 JSON      | JSON parse/stringify/get/set operations                  |

## Getting Started

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- [@xyflow/react](https://reactflow.dev/) – node-based diagram
- [@tanstack/react-query](https://tanstack.com/query) – async state management
- [@tanstack/react-table](https://tanstack.com/table) – data tables (available for future use)
- [Zustand](https://zustand-demo.pmnd.rs/) – UI state management

## GitHub Actions: Coding Agent

To instruct the AI coding agent to fix an issue:

1. Create a GitHub issue describing the bug or feature request
2. Add the `approved-for-fix` label (only repository owners/maintainers can do this)
3. The coding agent workflow will automatically trigger and open a pull request with the fix
