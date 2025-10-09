import React from 'react'
import NodeSection from './NodeSection';
import SidebarButtons from '../SidebarButtons';
import { nodeTemplates } from '../../constants/nodeTemplates';

type SidebarProps = { 
  clearCanvas:()=>void, 
  handleDeploy:()=>void, 
  isRunning:boolean 
}

export default function Sidebar({ clearCanvas, handleDeploy, isRunning }:SidebarProps) {

  const visualizationNodes = nodeTemplates.filter(
    (template) => template.label === "plot"
  );

  const fhirResOrg = nodeTemplates.filter((template) =>
    ["observation", "condition"].includes(template.label)
  );

  const dataUploadNodes = nodeTemplates.filter(
    (template) => template.label === "load-dataset"
  );

  const analyticsNodes = nodeTemplates.filter((template) =>
    [
      "correlation",
      "cluster",
      "frequency",
      "range",
      "std",
      "mode",
      "median",
      "mean",
      "abbreviate",
      "join",
      "symptom-pattern",
      "covariance",
      "corr-coefficient",
      "prevalence",
    ].includes(template.label)
  );

  return (
    <aside className="custom-scrollbar  h-[calc(100vh-80px)] overflow-y-auto relative p-1">
      <div className='space-y-4'>
        <NodeSection title={"Node Palette"} nodes={nodeTemplates} />
        <NodeSection title={"Visualization"} nodes={visualizationNodes} />
        <NodeSection title={"Analytics"} nodes={analyticsNodes} />
        <NodeSection title={"FHIR Resource Operations"} nodes={fhirResOrg} />
        <NodeSection title={"Data Upload"} nodes={dataUploadNodes} />
      </div>

      <div className="cta-btn sticky border -bottom-2 bg-white py-1 rounded-t-2xl px-1 shadow-[0px_-5px_40px_4px_black]">
        <SidebarButtons
          clearCanvas={clearCanvas}
          handleDeploy={handleDeploy}
          isRunning={isRunning}
        />
      </div>
    </aside>
  );
}
