import React, { useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useLocation } from '@docusaurus/router';
import Layout from "@theme/Layout";
import Spinner from "@site/src/components/misc/spinner";
import Link from "@docusaurus/Link";
import IconExternalLink from "@theme/Icon/ExternalLink";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Head from "@docusaurus/Head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const enum API_VERSIONS {
  V1 = "V1",
  V2 = "V2"
};

export default function DataRestAPI(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const {
    customFields: { swaggerUI, swaggerJSON_V1, swaggerJSON_V2 },
  } = siteConfig;
  const [isMD, setIsMD] = useState<boolean>(); // use to switch API layout on < MD devices
  const [currentDefinition, setCurrentDefinition] = useState<{
    label: API_VERSIONS;
    definition: string;
  }>({ label: API_VERSIONS.V1, definition: swaggerJSON_V1 as string }); // use to switch API layout on < MD devices
  const { search, hash } = useLocation();

  useEffect(() => {
    setIsMD(innerWidth <= 996);

    const ele: HTMLDivElement = document.querySelector("div.main-wrapper");

    let observer: MutationObserver;

    const { id } = parseQueryParams(search || hash);

    const specVersionToShow = id?.toUpperCase() === API_VERSIONS.V2 ? API_VERSIONS.V2 : API_VERSIONS.V1;
    changeSpecVersion(specVersionToShow);

    if (ele) {
      ele.classList.add("data-rest-api-wrapper");
    } else {
      observer = new MutationObserver(() => {
        // wait for the wrapper to be available using MutationObserver
        const ele: HTMLDivElement = document.querySelector("div.main-wrapper");
        if (ele) {
          observer.disconnect();
          observer = null;
          ele.classList.add("data-rest-api-wrapper");
        }
      });
      observer.observe(document, { subtree: true, childList: true });
    }
    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }, []);

  const changeSpecVersion = (id: API_VERSIONS): void => {
    setCurrentDefinition({
      label: id,
      definition: id === API_VERSIONS.V1 ? swaggerJSON_V1 as string : swaggerJSON_V2 as string,
    });

    if (history.pushState) {
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const parseQueryParams = (url: string): {
    [key: string]: string;
  } => {
    const queryParams = {};
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    let match;

    while ((match = regex.exec(url))) {
      const paramName = decodeURIComponent(match[1]);
      const paramValue = decodeURIComponent(match[2]);
      queryParams[paramName] = paramValue;
    }

    return queryParams;
  };


  return (
    <BrowserOnly
      fallback={
        <Spinner
          wrapperStyles={{
            width: 32,
            height: 32,
            position: "absolute",
            margin: "auto",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      }
    >
      {() => {
        const { API } = require("@stoplight/elements");
        require("./index.css");
        return (
          <>
            <Head>
              <meta name="description" content="NovoRender Data Rest API Documentation" />
              <meta property="og:description" content="NovoRender Data Rest API Documentation" />
              <title>NovoRender | Data Rest API Documentation</title>
            </Head>
            <Layout title={`Data Rest API`}>
              <div className="dropdown api-version-dropdown dropdown--hoverable">
                <button style={{ padding: "0 10px", maxWidth: 60 }} className="button button--primary">
                  {currentDefinition.label} <FontAwesomeIcon icon={faChevronDown} />
                </button>
                <ul className="dropdown__menu">
                  <li onClick={() => { changeSpecVersion(API_VERSIONS.V1); }} className="dropdown__link">
                    Data API V1
                  </li>
                  <li onClick={() => { changeSpecVersion(API_VERSIONS.V2); }} className="dropdown__link">
                    Data API V2
                  </li>
                </ul>
              </div>

              <Link style={{ position: "absolute", right: 25, top: 70 }} to={swaggerUI + `/index.html?urls.primaryName=Novorender%20Data%20API%20${currentDefinition.label.toLowerCase()}`}>
                Swagger
                <IconExternalLink />
              </Link>

              {currentDefinition && <API router="hash" layout={isMD ? "stacked" : "sidebar"} apiDescriptionUrl={currentDefinition.definition} />}
            </Layout>
          </>
        );
      }}
    </BrowserOnly>
  );
}
