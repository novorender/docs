import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import React, { useEffect, useState } from 'react';
import { PlaygroundContext } from './context';

if (ExecutionEnvironment.canUseDOM) {
    window['runtime_process_env'] = {
        DEBUG: true
    };
}

// Default implementation, that you can customize
export default function Root({ children }) {

    const [runningPlaygroundId, setRunningPlaygroundId] = useState('');

    useEffect(() => {

        /**
         * Global custom alert component to display any kind of info,
         * mainly intended to be used in the monaco snippets where React
         * components aren't available
         * just do `openAlert('whatever content...')` to show an alert
         */
        window['openAlert'] = (content: string) => {
            const existing_alert = document.querySelector('.custom-alert-container');
            if (existing_alert) {
                document.body.removeChild(existing_alert);
            }
            const ele = document.createElement("div");
            const close_btn = document.createElement('button');
            close_btn.classList.add('clean-btn', 'close');
            close_btn.setAttribute('type', 'button');
            close_btn.innerHTML = `<span aria-hidden="true">&times;</span>`;
            close_btn.addEventListener('click', () => { document.body.removeChild(ele); });
            ele.classList.add('alert', 'alert--info', 'custom-alert-container');
            ele.appendChild(close_btn);
            ele.append(content);
            document.body.appendChild(ele);
        };
    }, []);

    return <PlaygroundContext.Provider value={{ runningPlaygroundId, setRunningPlaygroundId }}>{children}</PlaygroundContext.Provider>;
}