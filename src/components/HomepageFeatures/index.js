import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    number: '01',
    title: 'Big Changes',
    to: '/docs/Big Changes',
    description:
      'The six reforms this party is for: tax, carbon, UBI, popular vote, expand Congress and the Court, healthcare.',
  },
  {
    number: '02',
    title: 'Vision',
    to: '/docs/Foreign Policy/Philosophy, Vision',
    description:
      'What we owe people — starting with children — and the responsibility that comes with leadership.',
  },
  {
    number: '03',
    title: 'How to win',
    to: '/docs/Preface End facism/Priority is to win back congress/How to win',
    description:
      'How it was done before, how to do it now, and how a left party still shows up for everyone.',
  },
];

function Feature({number, title, to, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md">
        <p className={styles.number}>{number}</p>
        <Heading as="h3">
          <Link to={to}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <p className={styles.intro}>
          Empty pages in this book are the outline: topics the party will fill.
          Start with the pages already written, then use{' '}
          <Link to="/docs/intro">the full map</Link>.
        </p>
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
