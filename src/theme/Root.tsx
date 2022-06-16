import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import React, { useState } from 'react';
import { PlaygroundContext } from './context';

if(ExecutionEnvironment.canUseDOM){
    window['runtime_process_env'] = {
        DEBUG: true
      };
}

// Default implementation, that you can customize
export default function Root({ children }) {

    const [runningPlaygroundId, setRunningPlaygroundId] = useState('');
    
    return <PlaygroundContext.Provider value={{runningPlaygroundId, setRunningPlaygroundId}}>{children}</PlaygroundContext.Provider>;
}