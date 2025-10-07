import React from 'react'
import HeaderActionButton from '../HeaderActionButton';
import { BsTerminal } from 'react-icons/bs';

export default function Navbar({ handleDebugConsole, showDebugConsole }) {
  return (
    <div className='flex justify-between items-center shadow' >
      <div className='flex items-center gap-2'>
        <img className='w-40 p-4' src="/adarv-logo.png" alt="adarv-logo"/>
        {/* <p className='text-2xl font-medium'>Workflow Designer</p> */}
      </div>
      <div>
        <HeaderActionButton
          handleDebugConsole={handleDebugConsole}
          showDebugConsole={showDebugConsole}
          icon={<BsTerminal />}
          title="Toggle Debug Console"
        />
      </div>
    </div>
  );
}
