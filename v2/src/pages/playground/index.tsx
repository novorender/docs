import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Admonition from "@theme/Admonition";
import { tutorials } from "@site/demo-snippets/index";
import type { IDempProps } from "../../../demo-snippets/misc";

export default function Playground(): JSX.Element {
  const [tutorialsList, setTutorialsList] = useState<Array<{ dirName: string; demos: IDempProps[] }>>([]);

  useEffect(() => {
    const tutsList = [
      ...Object.keys(tutorials).map((k) => {
        const values = Object.values(tutorials[k] as IDempProps);
        return { dirName: values[0].dirName, demos: [...values] };
      }),
    ];

    /** Move `gettingStarted` grp of demos to top */
    const indexOfGettingStartedDemo = tutsList.findIndex((i) => i.dirName === "getting_started");
    if (indexOfGettingStartedDemo !== -1) {
      const element = tutsList[indexOfGettingStartedDemo];
      tutsList.splice(indexOfGettingStartedDemo, 1);
      tutsList.splice(0, 0, element);
    }
    setTutorialsList(tutsList);
  }, []);

  const renderCard = (key: string, t: IDempProps) => {
    return (
      <div style={{ maxWidth: 320, height: 340 }}>
        <div className="card" style={{ height: "inherit" }}>
          <div style={{ height: 110, overflow: "hidden" }} className="card__image">
            {t.previewImageUrl && (
              <>
                <img
                  src={t.previewImageUrl}
                  alt={t.demoName}
                  title={t.demoName}
                  onError={(e) => {
                    e.currentTarget.src = require(`@site/static/assets/playground-demo-placeholder-dark.jpg`).default;
                    e.currentTarget.alt = "demo preview image not found";
                    e.currentTarget.title = "demo preview image not found";
                  }}
                />
              </>
            )}
          </div>
          <div className="card__body">
            <h4>{t.demoName}</h4>
            <small
              style={{
                overflow: "auto",
                maxHeight: 100,
                display: "inline-block",
              }}
            >
              {t.description}
            </small>
          </div>
          <div className="card__footer">
            <Link to={`/playground/run?id=${key}___${t.demoName}`} className="button button--primary button--block">
              Run
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title={`Playground`} description="novorender interactive api playground">
      <div
        style={{
          height: "calc(100vh - 60px)",
          padding: 10,
          margin: 10,
          overflow: "auto",
        }}
      >
        <div className="fade-in">
          <Admonition type="info" icon="💡" title="Tip">
            <p>Select a demo, then press "Run" to launch the playground.</p>
          </Admonition>
        </div>
        {tutorialsList.map((demo_grp) => (
          <div key={demo_grp.dirName}>
            <nav className="navbar fade-in" style={{ borderRadius: 10 }}>
              <div className="navbar__inner">
                <div className="navbar__items">
                  <div className="navbar__brand" style={{ fontWeight: "bold" }}>
                    {demo_grp.dirName}
                  </div>
                </div>
                {/* <div className="navbar__items navbar__items--right"></div> */}
              </div>
            </nav>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: "1rem 0",
              }}
            >
              {demo_grp.demos.map((t: IDempProps, i: number) => (
                <div key={t.demoName} style={{ margin: 5, animationDuration: i * 250 + "ms" }} className="fade-in-top">
                  {renderCard(demo_grp.dirName, t)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
