import React, { useState } from 'react';
import { PlaygroundContext } from './context';

// Default implementation, that you can customize
export default function Root({ children }) {

    const [runningPlaygroundId, setRunningPlaygroundId] = useState('');
    
    return <PlaygroundContext.Provider value={{runningPlaygroundId, setRunningPlaygroundId}}>{children}</PlaygroundContext.Provider>;
}