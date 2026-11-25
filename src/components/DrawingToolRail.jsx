import { createElement } from "react";
import {
  ArrowLongRightIcon,
  ArrowRightIcon,
  ChatBubbleLeftIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
  MinusIcon,
  PencilIcon,
  RectangleGroupIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { Panel } from "@xyflow/react";

const TOOLS = [
  { id: "pan", label: "Hand / pan", Icon: HandRaisedIcon },
  { id: "select", label: "Select and move", Icon: CursorArrowRaysIcon },
  { id: "rectangle", label: "Rectangle", Icon: RectangleGroupIcon },
  { id: "ellipse", label: "Ellipse", Icon: StopIcon },
  { id: "arrow", label: "Snapped arrow", Icon: ArrowLongRightIcon },
  { id: "line", label: "Snapped line", Icon: MinusIcon },
  { id: "freeLine", label: "Free line", Icon: ArrowRightIcon },
  { id: "text", label: "Text", Icon: ChatBubbleLeftIcon },
  { id: "freehand", label: "Freehand", Icon: PencilIcon },
];

export default function DrawingToolRail({ mode, onChange }) {
  return (
    <Panel position="top-left" className="drawing-tool-rail-panel">
      <div className="drawing-tool-rail" role="toolbar" aria-label="Canvas tools">
        {TOOLS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`drawing-tool-button ${mode === id ? "active" : ""}`}
            aria-label={label}
            aria-pressed={mode === id}
            title={label}
            onClick={() => onChange(id)}
          >
            {createElement(Icon, { "aria-hidden": true })}
          </button>
        ))}
      </div>
    </Panel>
  );
}