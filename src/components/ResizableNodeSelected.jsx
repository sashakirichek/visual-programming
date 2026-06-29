import { memo } from "react";
import { Handle, Position, NodeResizer, NodeResizeControl } from "@xyflow/react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
const ResizableNodeSelected = ({ data, selected, ...props }) => {
  return (
    <>
      <NodeResizeControl
        color="transparent"
        style={{ border: 0 }}
        minWidth={160}
        minHeight={80}
        isVisible={selected}
        resizeDirection="horizontal"
        {...props}
      ></NodeResizeControl>
    </>
  );
};

export default memo(ResizableNodeSelected);
