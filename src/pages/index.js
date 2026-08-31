import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <p className={styles.kicker}>UNITED PROGRESS PARTY</p>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className={clsx('hero__subtitle', styles.lede)}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/Big Changes">
            Big Changes
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/Foreign Policy/Philosophy, Vision">
            Vision
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/Preface End facism/Priority is to win back congress/How to win">
            How to win
          </Link>
        </div>
        <p className={styles.lede} style={{marginTop: '1.5rem'}}>
          <Link to="https://unitedprogressparty.com/">
            Party home — unitedprogressparty.com
          </Link>
        </p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
