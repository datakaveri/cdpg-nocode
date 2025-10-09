import React from 'react'
import SidebarMenuItem from '../SidebarMenuItem';
import { BaseNodeTemplate } from '../../types/common.type';

type NodeSectionProps = {
  title: string
  nodes: BaseNodeTemplate[]
}

export default function NodeSection({title,nodes}:NodeSectionProps) {
  return (
    <div className='rounded-xl p-1 bg-neutral-100 border'>
      <h3 className="py-3 pl-2">{title}</h3>
      <div className="space-y-4 p-2">
        {nodes.map((template, index) => (
          <SidebarMenuItem key={index} template={template} />
        ))}
      </div>
    </div>
  );
}
