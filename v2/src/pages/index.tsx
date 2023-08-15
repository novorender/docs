import React from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import { useColorMode } from '@docusaurus/theme-common';
import Link from "@docusaurus/Link";
import("./index.css");

function HomepageHeader() {

  const { colorMode } = useColorMode();

  return (
    <header className={`hero header-banner ${colorMode === "light" && "dark-bg"}`}>
      <div className={`header-container container`}>
        <h1 className="title-heading fade-in-top">Your Gateway to<br />Effortless 3D Management<br />and Innovation.</h1>
        <div className="action-btn-container fade-in-fwd">
          <Link to={`/docs/web_api/`} className="button-get-started pulse">Get Started!</Link>
          <p>or</p>
          <button className="button button--outline button--secondary">Learn more</button>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {

  const location = useLocation();

  React.useEffect(() => {

    /** transparent navbar on homepage */
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
    /** transparent navbar on homepage */
    const navbar: HTMLElement = document.querySelector(".navbar");
    if ((location.pathname === "/v2/" || location.pathname === "/v2") && !navbar.classList.contains("transparent")) {
      navbar.classList.add("transparent");
    }
  }, [location]);

  return (
    <Layout title={`Novorender API Docs`} description="Novorender API Documentation">
      <HomepageHeader />
    </Layout>
  );
}
