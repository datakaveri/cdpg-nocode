import { FaTimes } from "react-icons/fa";
import { CustomNodeData } from "../../types/common.type";
import { Node } from "@xyflow/react";

const ParameterSidebar = ({
  selectedNode,
  closeSidebar,
  onNodeDataChange,
}: {
    selectedNode: CustomNodeData,
  closeSidebar: () => void,
  onNodeDataChange: (id: string, update: any) => void,
}) => {
  return (
    <div className="fixed top-20 right-0 w-90 h-[calc(100vh-80px)] bg-white shadow-md p-5 overflow-y-auto z-50 transition-transform duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-800">
          <span className="mr-2">{selectedNode.data.icon}</span>
          {selectedNode.data.label}
        </h3>
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={closeSidebar}
        >
          <FaTimes />
        </button>
      </div>

      {/* Panel */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-700 mb-5">
          Node Parameters
        </h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            closeSidebar();
          }}
        >
          {Object.entries(selectedNode.data.params!).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label
                htmlFor={`param-${key}`}
                className="block mb-1 font-medium text-gray-700 text-sm"
              >
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                :
              </label>
              <input
                id={`param-${key}`}
                type="text"
                value={value as string || ""}
                onChange={(e) => {
                  const newParams = {
                    ...selectedNode.data.params,
                    [key]: e.target.value,
                  };
                  onNodeDataChange(selectedNode.id, { params: newParams });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={closeSidebar}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParameterSidebar;
