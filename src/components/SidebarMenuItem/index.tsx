import { DynamicIcon } from "lucide-react/dynamic";
import { BaseNodeTemplate } from "../../types/common.type";

type SidebarMenuItemProps = {
  template: BaseNodeTemplate;
};

const SidebarMenuItem = ({ template }: SidebarMenuItemProps) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(template)
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "scale(0.98)";
    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
  };

  const resetStyles = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.06)";
  };

  return (
    <div
      className="
        flex items-center text-[14px] font-medium cursor-grab
        border border-black/5 rounded-lg shadow-sm
        transition-transform duration-150 ease-in-out
        active:cursor-grabbing
        p-[14px]
      "
      style={{
        backgroundColor: template.color || "#f1f1f1",
        color: "#333",
      }}
      draggable
      onDragStart={handleDragStart}
      onMouseDown={handleMouseDown}
      onMouseUp={resetStyles}
      onMouseLeave={resetStyles}
    >
      <span className="mr-2 text-[20px] flex items-center">
        <DynamicIcon name={template.icon} size={20} />
      </span>
      {template.label}
    </div>
  );
};

export default SidebarMenuItem;
