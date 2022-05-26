import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './about.module.css';


export default function About(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`About`}
      description="Novorender API Documentation <head />">
      <main className={clsx(styles.container)}>
        <h3>Hello from About.</h3>
      </main>
    </Layout>
  );
} 
