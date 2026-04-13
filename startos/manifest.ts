import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'fulcrum-bch',
  title: 'Fulcrum BCH',
  license: 'MIT',
  packageRepo: 'https://github.com/CyberAshven/fulcrum-bch-startos',
  upstreamRepo: 'https://github.com/cculianu/Fulcrum',
  marketingUrl: 'https://github.com/cculianu/Fulcrum',
  donationUrl: null,
  docsUrls: [
    'https://github.com/CyberAshven/fulcrum-bch-startos/blob/master/docs/instructions.md',
    'https://github.com/cculianu/Fulcrum',
  ],
  description: {
    short: 'Fast Electrum server for Bitcoin Cash',
    long: 'Fulcrum BCH is a fast, feature-complete SPV server for Bitcoin Cash powered by Cculianu\'s Fulcrum. It indexes the BCH blockchain via Bitcoin Cash Node and serves the Electrum protocol to BCH wallets and the BCH Explorer.',
  },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerTag: 'cculianu/fulcrum:v2.1.0' },
    },
  },
  alerts: {
    install:
      'Fulcrum BCH requires Bitcoin Cash Node to be fully synced before it begins indexing. Initial indexing of the full BCH blockchain may take several hours.',
    update: null,
    uninstall:
      'Uninstalling Fulcrum BCH will permanently delete all index data. You will need to re-index from scratch if reinstalled.',
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    'bitcoin-cash-node': {
      description:
        'Bitcoin Cash Node provides the blockchain data that Fulcrum BCH indexes.',
      optional: false,
      s9pk: null,
    },
  },
})
