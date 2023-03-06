import React, { useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import Spinner from "@site/src/components/misc/spinner";
import Link from "@docusaurus/Link";
import IconExternalLink from "@theme/Icon/ExternalLink";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Head from "@docusaurus/Head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function DataRestAPI(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const {
    customFields: { swaggerUI, swaggerJSON_V1, swaggerJSON_V2 },
  } = siteConfig;
  const [isMD, setIsMD] = useState<boolean>(); // use to switch API layout on < MD devices
  const [currentDefinition, setCurrentDefinition] = useState<{
    label: "V1" | "V2";
    definition: string;
  }>({ label: "V1", definition: swaggerJSON_V1 as string }); // use to switch API layout on < MD devices

  useEffect(() => {
    setIsMD(innerWidth <= 996);

    const ele: HTMLDivElement = document.querySelector("div.main-wrapper");

    let observer: MutationObserver;

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
            <Layout title={`Data Rest API`} description="Data Rest API Documentation">
              <div className="dropdown api-version-dropdown dropdown--hoverable">
                <button style={{ padding: "0 10px", maxWidth: 60 }} className="button button--primary">
                  {currentDefinition.label} <FontAwesomeIcon icon={faChevronDown} />
                </button>
                <ul className="dropdown__menu">
                  <li
                    onClick={() => {
                      setCurrentDefinition({
                        label: "V1",
                        definition: swaggerJSON_V1 as string,
                      });
                    }}
                    className="dropdown__link"
                  >
                    Data API V1
                  </li>
                  <li
                    onClick={() => {
                      setCurrentDefinition({
                        label: "V2",
                        definition: swaggerJSON_V2 as string,
                      });
                    }}
                    className="dropdown__link"
                  >
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
