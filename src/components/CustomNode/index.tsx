import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { BaseNodeTemplate } from "../../types/common.type";

type CustomNodeProps = {
  data: BaseNodeTemplate
}

const CustomNode = ({ data }:CustomNodeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const backgroundColor = data.color || "#E6E0F8";

  const handleInfoClick = (e:React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  const handleTooltipClick = (e:React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="
				relative w-[200px] rounded-xl text-[12px] text-[#333]
				shadow-[0_4px_12px_rgba(0,0,0,0.15)]
				border-2 border-white/30
				transition-all duration-300 ease-in-out
				backdrop-blur-md
				overflow-visible
			"
      style={{ backgroundColor }}
    >
      {/* Left handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="
					!w-[10px] !h-[10px] rounded-full border-2 border-white
					bg-gradient-to-tr from-[#555] to-[#777]
					shadow-[0_2px_4px_rgba(0,0,0,0.2)]
					transition-all duration-200 ease-in-out
					hover:scale-125 hover:bg-gradient-to-tr hover:from-[#4CAF50] hover:to-[#66BB6A]
				"
      />

      {/* Info button */}
      <div
        onClick={handleInfoClick}
        title="Click for more information"
        className="
					absolute -top-2 -right-2 w-5 h-5
					rounded-full border-2 border-white
					bg-gradient-to-tr from-[#667eea] to-[#764ba2]
					text-white flex items-center justify-center
					font-bold text-[12px] cursor-pointer
					shadow-[0_2px_8px_rgba(0,0,0,0.2)]
					transition-all duration-300 ease-in-out
					hover:scale-110 hover:bg-gradient-to-tr hover:from-[#764ba2] hover:to-[#667eea]
					hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
					z-10
				"
      >
        i
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          onClick={handleTooltipClick}
          className="
						absolute top-[30px] -right-[10px]
						bg-gradient-to-br from-[#2c3e50] to-[#34495e]
						text-white p-3 rounded-md text-[11px] max-w-[280px]
						shadow-[0_8px_24px_rgba(0,0,0,0.3)]
						border border-white/10 backdrop-blur-md
						opacity-100 visible translate-y-0
						transition-all duration-300 ease-in-out
						z-[1000]
					"
        >
          <div className="font-bold mb-1.5 text-[#ecf0f1] text-[12px] flex items-center gap-1">
            {data.icon} {data.label}
          </div>
          <div className="text-[#bdc3c7] leading-[1.4]">
            {data.description || "No description available"}
          </div>

          {/* Tooltip arrow */}
          <div
            className="
							absolute -top-2 right-5
							w-0 h-0
							border-l-[8px] border-l-transparent
							border-r-[8px] border-r-transparent
							border-b-[8px] border-b-[#2c3e50]
						"
          />
        </div>
      )}

      {/* Node content */}
      <div
        className="
					p-3 rounded-lg font-semibold text-[13px]
					flex items-center justify-start
					bg-gradient-to-br from-white/10 to-white/5
					relative
				"
      >
        <span className="mr-2 text-[18px] flex items-center justify-center w-6 h-6 text-[#333]">
          <DynamicIcon name={data.icon} size={20} />
        </span>
        <span className="text-[#333] tracking-[0.3px]">{data.label}</span>
      </div>

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="
					!w-[10px] !h-[10px] rounded-full border-2 border-white
					bg-gradient-to-tr from-[#555] to-[#777]
					shadow-[0_2px_4px_rgba(0,0,0,0.2)]
					transition-all duration-200 ease-in-out
					hover:scale-125 hover:bg-gradient-to-tr hover:from-[#4CAF50] hover:to-[#66BB6A]
				"
      />
    </div>
  );
};

export default CustomNode;
