import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Waves from '@site/static/img/waves.svg';
import WavesInverted from '@site/static/img/waves_inverted.svg';

function HomepageHeader() {
    return (
        <header className={`hero ${styles.headerBanner}`}>
            <div className={`${styles.headerContainer} container`}>
                <div style={{}}></div>
                <h1 className={`hero__title ${styles.headerTagLine}`}>A scalable<br />3D viewer<br />in the cloud</h1>
                <p className={styles.headerSubTagLine}>Welcome to Novorender's documentation landing page! Here you will find the most up to date tutorials and reference documentation on our various APIs and products. The information is mostly aim at professional developers who are proficient with the programming platform (web/typescript) and also are familiar with basic 3D math, such as vectors and matrices.</p>
                <div className={styles.buttons}>
                    <Link
                        className={styles.headerButtonMain}
                        to="/docs/category/documentation">
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
