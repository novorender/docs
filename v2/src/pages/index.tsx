import React, { useRef } from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import("./index.css");

export default function Home(): JSX.Element {

  const location = useLocation();
  const section2 = useRef<HTMLDivElement>(null);

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
      {/* SECTION 1 */}
      <header className="hero header-banner">
        <div className="header-container container">
          <h1 className="title-heading fade-in-top">Your Gateway to<br />Effortless 3D Management<br />and Innovation.</h1>
          <div className="action-btn-container fade-in-fwd">
            <Link to={`/docs/web_api/`} className="button-get-started pulse">Get Started!</Link>
            <p>or</p>
            <button onClick={() => { section2.current.scrollIntoView({ behavior: "smooth" }); }} className="button button--outline button--secondary">Learn more</button>
            <div className="mouse-scroll">
              <div>
                <span className="down-arrow-1"></span>
                <span className="down-arrow-2"></span>
                <span className="down-arrow-3"></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2 */}
      <div ref={section2} className="hero section-2">
        <p>Discover the revolutionary capabilities of Novorender's state-of-the-art technology, granting you the ability to experience 3D models across a spectrum of formats and file sizes seamlessly, all without the necessity of extra software or plugins. Now, your 3D models are at your fingertips, accessible from any device, anywhere.</p>
        <p>We've taken the bold step of <a href="https://docs.novorender.com/blog/webgl-web-api-v2">open-sourcing</a> the foundational technology that drives the <a href="https://novorender.com">industry's most potent 3D Viewer</a>. This empowers you not only to leverage the might of our advanced viewer but also to swiftly create and deploy dependable web applications, streamlining your 3D workflows. Whether it's in the realms of <a href="https://novorender.com/industries/construction/">Construction</a>, <a href="https://novorender.com/industries/infrastructure/">Infrastructure</a>, <a href="https://novorender.com/industries/energy/">Energy</a>, or <a href="https://novorender.com/industries/ship-design/">Shipyard & Design</a>, our solution caters to a myriad of use cases, propelling your projects into a new era of efficiency and innovation.</p>
        <p>Leverage the potential of Novorender's Open Source API to craft robust functionalities for your 3D models. Unleash capabilities like Clash Detection, Precise Area Measurements, Dynamic Parametric Assessments, Smart Clipping Planes, Insightful Cross Sections, Fine-tuned Geometric Controls, and an array of other transformative features. Elevate your 3D experience with Novorender's API and empower your creations beyond imagination.</p>
        <p>Seamlessly integrate your 3D workflow with widely embraced 3rd party services by harnessing Novorender's <a href="https://docs.novorender.com/docs/category/data-rest-api-v1">Open API</a>. Forge connections with industry stalwarts like <a href="https://novorender.com/integrations/active-directory-ad/">Active Directory (AD)</a>, <a href="https://novorender.com/integrations/autodesk-bim360/">Autodesk BIM360</a>, <a href="https://novorender.com/integrations/jira/">Jira</a>, <a href="https://novorender.com/integrations/microsoft-teams/">Microsoft Teams</a>, <a href="https://novorender.com/integrations/power-bi/">Power BI</a>, <a href="https://novorender.com/integrations/naviswork/">Navisworks</a>, and an <a href="https://novorender.com/integrations/">extensive lineup</a> of other influential platforms. Elevate your collaboration and efficiency through the power of Novorender's API, expanding your horizons to a realm of limitless possibilities.</p>
      </div>
    </Layout>
  );
}
