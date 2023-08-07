import React from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import { useColorMode } from '@docusaurus/theme-common';
import("./index.css");

type FeatureItem = {
  title: string;
  Svg: any;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Any format and size",
    Svg: require("@site/static/img/albums-outline.svg").default,
    description: <>Biggest 3D model to date: 50 GB of CAD data with over 4 000 000 000 triangles</>,
  },
  {
    title: "Any device",
    Svg: require("@site/static/img/globe-outline.svg").default,
    description: <>View in browser on devices such as phone, tablet and laptop</>,
  },
  {
    title: "Sharing",
    Svg: require("@site/static/img/share-social-outline.svg").default,
    description: <>Share 3D models with anyone inside or outside your organization</>,
  },
  {
    title: "Open API",
    Svg: require("@site/static/img/hardware-chip-outline.svg").default,
    description: <>If wanted, connect to APIs such as ERP, IoT sensors and others</>,
  },
  {
    title: "Embed",
    Svg: require("@site/static/img/code-slash-outline.svg").default,
    description: <>Embed your 3D models in Microsoft Teams, Sharepoint, web apps and more</>,
  },
];

function HomepageHeader() {

  const { colorMode } = useColorMode();

  return (
    <header className={`hero headerBanner ${colorMode === "light" && "dark-bg"}`}>
      <div className={`headerContainer container`}>
        <h2>WIP Documentation for web_app aka v2 API</h2>

        {/* <div style={{}}></div>
        <h1 className={`hero__title ${styles.headerTagLine}`}>
          A scalable
          <br />
          3D viewer
          <br />
          in the cloud
        </h1>
        <p className={styles.headerSubTagLine}>
          Welcome to Novorender&apos;s documentation landing page! Here you will find the most up to date tutorials and reference documentation on our various APIs and products. The information is mostly aim at professional developers who are proficient with the programming platform
          (web/typescript) and also are familiar with basic 3D math, such as vectors and matrices.
        </p>
        <div className={styles.buttons}>
          <Link className={styles.headerButtonMain} to="/docs/tutorials/getting_started">
            Get Started
          </Link>
        </div> */}
      </div>
      {/* <Waves className={styles.headerWaves} /> */}
    </header>
  );
}

// function Feature({ title, description, Svg }: FeatureItem) {
//   return (
//     <div className="card shadow--md" style={{ position: "relative", width: 250, margin: 15 }}>
//       <CardWaves style={{ position: "absolute", bottom: 0 }} />
//       <div className="card__header">
//         <Svg
//           style={{
//             width: 50,
//             color: "var(--ifm-color-primary)",
//             marginBottom: 15,
//           }}
//         />
//         <h3>{title}</h3>
//       </div>
//       <div className="card__body" style={{ marginBottom: 15 }}>
//         <p>{description}</p>
//       </div>
//     </div>
//   );
// }

export default function Home(): JSX.Element {

  const location = useLocation();

  React.useEffect(() => {

    const navbar: HTMLElement = document.querySelector(".navbar");

    const observer = new MutationObserver((mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "attributes" && !navbar.classList.contains("transparent")) {
          navbar.classList.add("transparent");
        }
      }
    });

    observer.observe(navbar, { attributes: true });

    return () => {
      navbar.classList.remove("transparent");
      observer.disconnect();
    };

  }, []);

  React.useEffect(() => {
    const navbar: HTMLElement = document.querySelector(".navbar");
    if ((location.pathname === "/v2/" || location.pathname === "/v2") && !navbar.classList.contains("transparent")) {
      navbar.classList.add("transparent");
    }
  }, [location]);

  return (
    <Layout title={`Novorender API Docs`} description="Novorender API Documentation">
      <HomepageHeader />
      {/* <main className={styles.featuresContainer}>
        <WavesInverted className={styles.wavesInverted} />
        <section className={styles.features}>
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ justifyContent: "center" }} className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
        <section className={styles.features} style={{ marginTop: 48 }}>
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <p style={{ fontSize: 62 }}>Ready to dive in?</p>
            <div style={{ justifyContent: "center" }} className="row">
              <div className="card shadow--md" style={{ position: "relative", width: 250, margin: 15 }}>
                <CardWaves style={{ position: "absolute", bottom: 0 }} />
                <div className="card__header">
                  <h3>Get Started</h3>
                </div>
                <div className="card__body" style={{ marginBottom: 15 }}>
                  <p style={{ minHeight: 135 }}>Learn how to set up various Novorender packages by following our getting started guide.</p>
                  <Link className="button button--outline button--primary" to="/docs/tutorials/getting_started">
                    Get Started
                  </Link>
                </div>
              </div>
              <div className="card shadow--md" style={{ position: "relative", width: 250, margin: 15 }}>
                <CardWaves style={{ position: "absolute", bottom: 0 }} />
                <div className="card__header">
                  <h3>Docs</h3>
                </div>
                <div className="card__body" style={{ marginBottom: 15 }}>
                  <p style={{ minHeight: 135 }}>Learn more about the features and APIs offered by the various Novorender packages by checking out the latest documentation.</p>
                  <Link className="button button--outline button--primary" to="/docs/category/documentation">
                    Go To Docs
                  </Link>
                </div>
              </div>
              <div className="card shadow--md" style={{ position: "relative", width: 250, margin: 15 }}>
                <CardWaves style={{ position: "absolute", bottom: 0 }} />
                <div className="card__header">
                  <h3>Playground</h3>
                </div>
                <div className="card__body" style={{ marginBottom: 15 }}>
                  <p style={{ minHeight: 135 }}>Our online playground is the quickest and easiest way to experiment different Novorender packages right in your browser.</p>
                  <Link className="button button--outline button--primary" to="/playground">
                    Open Playground
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main> */}
    </Layout>
  );
}
