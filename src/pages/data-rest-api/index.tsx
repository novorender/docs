import React, { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Spinner from '@site/src/components/misc/spinner';

export default function DataRestAPI(): JSX.Element {

  useEffect(() => {
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
      fallback={<Spinner wrapperStyles={{ width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }} />}
    >
      {() => {
        const { API } = require('@stoplight/elements');
        require('./index.css');
        return (
          <Layout>
            <API router="hash" layout="sidebar" apiDescriptionUrl="https://data.novorender.com/swagger/v1/swagger.json" />
          </Layout>
        )
      }}
    </BrowserOnly>

  );
} 
