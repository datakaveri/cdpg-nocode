import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./components/common/Flow.jsx";

function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
