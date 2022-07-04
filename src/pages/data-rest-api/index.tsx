import React, { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Spinner from '@site/src/components/misc/spinner';
import Link from '@docusaurus/Link';
import IconExternalLink from '@theme/IconExternalLink';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function DataRestAPI(): JSX.Element {

  const { siteConfig } = useDocusaurusContext();
  const { customFields: { swaggerUI, swaggerJSON } } = siteConfig;
  const [isMD, setIsMD] = useState<boolean>(); // use to switch API layout on < MD devices

  useEffect(() => {

    setIsMD(innerWidth <= 996);

    const ele: HTMLDivElement = document.querySelector('div.main-wrapper');

    let observer: MutationObserver;

    if (ele) {
      ele.classList.add('data-rest-api-wrapper');
    } else {
      observer = new MutationObserver(() => { // wait for the wrapper to be available using MutationObserver
        const ele: HTMLDivElement = document.querySelector('div.main-wrapper');
        if (ele) {
          observer.disconnect();
          observer = null;
          ele.classList.add('data-rest-api-wrapper');
        }
      });
      observer.observe(document, { subtree: true, childList: true });
    }
    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  }, [])

  return (
    <BrowserOnly
      fallback={<Spinner wrapperStyles={{ width: 32, height: 32, position: "absolute", margin: "auto", top: 0, bottom: 0, left: 0, right: 0 }} />}
    >
      {() => {
        const { API } = require('@stoplight/elements');
        require('./index.css');
        return (
          <Layout title={`Data Rest API`} description="Data Rest API Documentation">

            <Link style={{ position: 'absolute', right: 25, top: 70 }} to={swaggerUI as string}>
              Swagger
              <IconExternalLink />
            </Link>

            <API router="hash" layout={isMD ? 'stacked' : 'sidebar'} apiDescriptionUrl={swaggerJSON} />
          </Layout>
        )
      }}
    </BrowserOnly>

  );
} 
