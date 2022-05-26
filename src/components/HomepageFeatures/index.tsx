import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Any format and size',
    description: (
      <>
        Biggest 3D model to date: 50 GB of CAD data with over 4 000 000 000 triangles
      </>
    ),
  },
  {
    title: 'Any device',
    description: (
      <>
        View in browser on devices such as phone, tablet and laptop
      </>
    ),
  },
  {
    title: 'Embed',
    description: (
      <>
        Embed your 3D models in Microsoft Teams, Sharepoint, web apps and more
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* <Svg className={styles.featureSvg} role="img" /> */}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
