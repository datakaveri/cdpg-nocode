import React from 'react';
import { Handle } from 'reactflow';

const CustomNode = ({ data }) => {
  const backgroundColor = data.color || '#E6E0F8';
  
  return (
    <div
      style={{
        padding: '0',
        borderRadius: '5px',
        width: '180px',
        fontSize: '12px',
        color: '#333',
        textAlign: 'left',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        backgroundColor: backgroundColor,
        border: '1px solid rgba(0, 0, 0, 0.15)',
        position: 'relative',
      }}
    >
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

      {/* Simple node - just icon and label */}
      <div
        style={{
          padding: '10px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ marginRight: '8px', fontSize: '16px' }}>{data.icon}</span>
        {data.label}
      </div>

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