import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import PlaygroundComponent from "@site/src/components/PlaygroundComponent";
import { tutorials } from "@site/demo-snippets/index";
import type { IDempProps } from "../../../../demo-snippets/misc";

export default function Playground(): JSX.Element {
    const [currentDemo, setCurrentDemo] = useState<IDempProps>();
    const [infoMessage, setInfoMessage] = useState<string>("This is where the playground will load 🚀");
    const { search } = useLocation();

    useEffect(() => {
        console.log("tutorials ", tutorials);

        const demo404 = "We're sorry, but it seems like the requested demo isn't available at the moment 🙁";
        const demoId = search.replace("?id=", "").split("___");

        let findCurrentDemo: IDempProps;
        try {
            Object.keys(tutorials).forEach((key) => {
                let currentDemo = tutorials[key][demoId[1]];
                if (currentDemo?.dirName === demoId[0]) {
                    findCurrentDemo = Object.assign({}, currentDemo);
                }
            });
            if (!findCurrentDemo) {
                throw "demoNotFound 404";
            }
        } catch (error) {
            console.log("error occurred ", error);
            setInfoMessage(demo404);
            return;
        }
        findCurrentDemo.editorConfig = {
            ...findCurrentDemo.editorConfig,
            ...{ mode: "fill", clickToRun: false },
        };
        setCurrentDemo(findCurrentDemo);
    }, []);

    return (
        <Layout title={`Playground`} description="novorender interactive api playground">
            <div>
                {/* <div className="navbar__items navbar__items--right" style={{ padding: '5px 18px' }}>
                        <button className='clean-btn navbar__item' title='go back to tutorials'>✖️</button>
                    </div> */}
                {currentDemo && <PlaygroundComponent {...currentDemo}></PlaygroundComponent>}
                {!currentDemo && <p style={{ marginTop: "calc(100vh - 50%)", textAlign: "center" }}>{infoMessage}</p>}
            </div>
        </Layout>
    );
}
