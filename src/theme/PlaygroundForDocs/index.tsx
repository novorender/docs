import React, { useEffect, useState } from "react";
import type { IDempProps } from "@site/demo-snippets/demo";
import PlaygroundComponent from "@site/src/components/PlaygroundComponent";

export default function Playground({ demoKey }: { demoKey: string; }): JSX.Element {
    const [currentDemo, setCurrentDemo] = useState<IDempProps>();

    useEffect(() => {
        import("@site/demo-snippets/index").then(({ snippets }) => {
            setCurrentDemo(getDemo(demoKey, snippets));
        });
    }, []);

    function getDemo(keyPath: string, snippets: object): IDempProps {
        const keys = keyPath.split('.');
        let value: IDempProps | object = snippets;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined; // Key path is invalid
            }
        }

        return value as IDempProps;
    }

    return (
        <>
            {currentDemo && <PlaygroundComponent {...currentDemo} />}
        </>
    );
}
