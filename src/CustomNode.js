import React from 'react';
import { Handle } from 'reactflow';

const CustomNode = ({ id, data }) => {
  // Use data.color or default to a Node-RED like color
  const backgroundColor = data.color || '#E6E0F8';
  
  return (
    <div
      style={{
        padding: '0',
        borderRadius: '5px',
        width: '160px',
        fontSize: '12px',
        color: '#333',
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        backgroundColor: backgroundColor,
        border: '1px solid rgba(0, 0, 0, 0.15)',
        position: 'relative',
      }}
    >
      {/* Input handle - positioned on the left side */}
      <Handle
        type="target"
        position="left"
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          border: '1px solid white',
        }}
      />

      {/* Node header - only showing the node name and icon */}
      <div
        style={{
          padding: '10px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <span style={{ marginRight: '6px', fontSize: '16px' }}>{data.icon}</span>
        {data.label}
      </div>

      {/* Output handle - positioned on the right side */}
      <Handle
        type="source"
        position="right"
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          border: '1px solid white',
        }}
      />
    </div>
  );
};

export default CustomNode;