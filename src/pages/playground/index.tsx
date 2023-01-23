import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { tutorials } from '@site/demo-snippets/index';
import type { IDemo, IDempProps } from '../../../demo-snippets/misc';
import useBaseUrl from "@docusaurus/useBaseUrl";
import Admonition from '@theme/Admonition';
import Link from '@docusaurus/Link';


export default function Playground(): JSX.Element {

    const [tutorialsList, setTutorialsList] = useState<{ [key: string]: IDemo; }>();

    useEffect(() => {
        setTutorialsList(tutorials);
    }, []);

    const renderCard = (key: string, t: IDempProps) => {
        return <div style={{ maxWidth: 320, height: 340 }}>
            <div className="card" style={{ height: 'inherit' }}>
                <div className="card__image">
                    <img
                        src={useBaseUrl(t.previewImageUrl)}
                        alt={t.demoName}
                        title={t.demoName} />
                </div>
                <div className="card__body">
                    <h4>{t.demoName}</h4>
                    <small style={{ overflow: 'auto', maxHeight: 100, display: 'inline-block' }}>{t.description}</small>
                </div>
                <div className="card__footer">
                    <Link to={`/playground/run?id=${key}___${t.demoName}`} className="button button--primary button--block">Run</Link>
                </div>
            </div>
        </div>;
    };

    return (
        <Layout
            title={`Playground`}
            description="novorender api playground">
            <div style={{ height: 'calc(100vh - 60px)', padding: 10, margin: 10, overflow: 'auto' }}>
                <div className="fade-in">
                    <Admonition type="info" icon="💡" title="Tip">
                        <p>Select a demo, then press "Run" to launch the playground.</p>
                    </Admonition>
                </div>
                {tutorialsList && Object.keys(tutorialsList).map((key: string) => <div key={key}>

                    <nav className="navbar fade-in" style={{ borderRadius: 10 }}>
                        <div className="navbar__inner">
                            <div className="navbar__items">
                                <div className="navbar__brand" style={{ fontWeight: 'bold' }}>{key}</div>
                            </div>
                            {/* <div className="navbar__items navbar__items--right"></div> */}
                        </div>
                    </nav>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '1rem 0' }}>{Object.values(tutorialsList[key]).map((t: IDempProps, i: number) => <div key={t.demoName} style={{ margin: 5, animationDuration: i * 250 + 'ms' }} className="fade-in-top">{renderCard(key, t)}</div>)}</div>
                </div>)}
            </div>
        </Layout>
    );
}
