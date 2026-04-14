import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'fulcrum-bch',
  title: 'Fulcrum BCH',
  license: 'MIT',
  packageRepo: 'https://github.com/BitcoinCash1/fulcrum-bch-startos',
  upstreamRepo: 'https://github.com/cculianu/Fulcrum',
  marketingUrl: 'https://github.com/cculianu/Fulcrum',
  donationUrl: null,
  docsUrls: [
    'https://github.com/BitcoinCash1/fulcrum-bch-startos/blob/master/docs/instructions.md',
    'https://github.com/cculianu/Fulcrum',
  ],
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerTag: 'cculianu/fulcrum:v2.1.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install:
      'Fulcrum BCH requires Bitcoin Cash Node to be fully synced before it begins indexing. Initial indexing of the full BCH blockchain may take several hours.',
    update: null,
    uninstall:
      'Uninstalling Fulcrum BCH will permanently delete all index data. You will need to re-index from scratch if reinstalled.',
    restore: null,
    start:
      'Fulcrum BCH will not start until Bitcoin Cash Node is fully synced and running.',
    stop: null,
  },
  dependencies: {
    'bitcoin-cash-node': {
      description:
        'Bitcoin Cash Node is required with full indexing enabled. Pruning must be disabled and txindex must be active for Fulcrum BCH to function properly.',
      optional: false,
      metadata: {
        title: 'Bitcoin Cash Node',
        icon: 'https://raw.githubusercontent.com/BitcoinCash1/bitcoin-cash-node-startos/master/icon.png',
      },
    },
  },
})
