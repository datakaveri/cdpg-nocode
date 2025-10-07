import React from 'react'
import SidebarMenuItem from '../SidebarMenuItem';

export default function NodeSection({title,nodes}) {
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
