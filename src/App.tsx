import { ReactFlowProvider } from "@xyflow/react";
import Flow from "./components/common/Flow.tsx";

function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
