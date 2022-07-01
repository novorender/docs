import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Waves from '@site/static/img/waves.svg';
import WavesInverted from '@site/static/img/waves_inverted.svg';

function HomepageHeader() {
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
      <Waves className={styles.headerWaves} />
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title={`API Docs`}
      description="Novorender API Documentation <head />">
      <HomepageHeader />
      <main className={styles.featuresContainer}>
        <WavesInverted className={styles.wavesInverted} />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
