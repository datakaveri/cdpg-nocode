import { SquareTerminal } from 'lucide-react';

type NavbarProps = {
  handleDebugConsole: () => void
  showDebugConsole: boolean
}

export default function Navbar({ handleDebugConsole, showDebugConsole }: NavbarProps) {
  return (
    <div className='flex justify-between items-center shadow' >
      <div className='flex items-center gap-2'>
        <img className='w-40 p-4' src="/adarv-logo.png" alt="adarv-logo" />
        {/* <p className='text-2xl font-medium'>Workflow Designer</p> */}
      </div>
      <div>
        <button
          onClick={handleDebugConsole}
          title="Toggle Debug Console"
          className={`group mx-4 cursor-pointer flex items-center gap-0 overflow-hidden rounded-xl ${showDebugConsole ? 'bg-green-200' :'bg-neutral-100'}  p-2 transition-all duration-300 hover:gap-2`}
        >
          <SquareTerminal size={28} />
          <p
            className={`w-0   overflow-hidden text-sm font-medium transition-all duration-300 group-hover:w-16 ${showDebugConsole ? 'w-16 opacity-100' :'w-0 opacity-0'} group-hover:opacity-100`}
          >
            Console
          </p>
        </button>

      </div>
    </div>
  );
}
