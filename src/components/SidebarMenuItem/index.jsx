import { DynamicIcon } from "lucide-react/dynamic";
import styles from "./styles.module.css";

const SidebarMenuItem = ({ template }) => {
  return (
    <div
      className={styles.sidebarMenuItem}
      style={{
        backgroundColor: template.color || "#f1f1f1",
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/reactflow",
          JSON.stringify(template)
        );
      }}
      draggable
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.98)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.06)";
      }}
    >
      <span
        style={{
          marginRight: "10px",
          fontSize: "20px",
        }}
      >
        <DynamicIcon name={template.icon} size={20} />
      </span>
      {template.label}
    </div>
  );
};

export default SidebarMenuItem;
