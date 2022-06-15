import React, { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';

export default function DataRestAPI(): JSX.Element {

  useEffect(() => {
    const ele: HTMLDivElement = document.querySelector('div.main-wrapper');
    ele.classList.add('data-rest-api-wrapper');
  }, [])

  return (
    <BrowserOnly
      fallback={<h1>loading</h1>}
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
