import React from 'react';
import styles from './styles.module.css';
import CardWaves from '@site/static/img/card_waves.svg'

type FeatureItem = {
  title: string;
  Svg: any;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Any format and size',
    Svg: require('@site/static/img/albums-outline.svg').default,
    description: (
      <>
        Biggest 3D model to date: 50 GB of CAD data with over 4 000 000 000 triangles
      </>
    ),
  },
  {
    title: 'Any device',
    Svg: require('@site/static/img/globe-outline.svg').default,
    description: (
      <>
        View in browser on devices such as phone, tablet and laptop
      </>
    ),
  },
  {
    title: 'Sharing',
    Svg: require('@site/static/img/share-social-outline.svg').default,
    description: (
      <>
        Share 3D models with anyone inside or outside your organization
      </>
    ),
  },
  {
    title: 'Open API',
    Svg: require('@site/static/img/hardware-chip-outline.svg').default,
    description: (
      <>
        If wanted, connect to APIs such as ERP, IoT sensors and others
      </>
    ),
  },
  {
    title: 'Embed',
    Svg: require('@site/static/img/code-slash-outline.svg').default,
    description: (
      <>
        Embed your 3D models in Microsoft Teams, Sharepoint, web apps and more
      </>
    ),
  },
];

function Feature({ title, description, Svg }: FeatureItem) {
  return (
    <div className="card shadow--md" style={{ position: 'relative', width: 250, margin: 15 }}>

      <CardWaves style={{ position: 'absolute', bottom: 0 }} />
      <div className="card__header">
        <Svg style={{ width: 50, color: 'var(--ifm-color-primary)', marginBottom: 15 }} />
        <h3>{title}</h3>
      </div>
      <div className="card__body" style={{ marginBottom: 15 }}>
        <p>
          {description}
        </p>
      </div>
      {/* <div className="card__footer">
  <button className="button button--secondary button--block">See All</button>
</div> */}
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ justifyContent: 'center' }} className="row">

          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
