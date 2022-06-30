import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Waves from '@site/static/img/waves.svg';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.headerBanner)}>
      <div className={clsx(styles.headerContainer, 'container')}>
        <div style={{}}></div>
        <h1 className={clsx("hero__title", styles.headerTagLine)}>The world´s<br />most powerful<br />3D viewer</h1>
        {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
        <div className={styles.buttons}>
          <Link
            className={styles.headerButtonMain}
            to="/docs/intro">
            Get Started
          </Link>
        </div>
      </div>
      <Waves style={{ position: 'absolute', bottom: 0, width: '100%' }} />
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`API Docs`}
      description="Novorender API Documentation <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
