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
      emulateMissingAs: 'x86_64',
    },
  },
  alerts: {
    install:
      'Fulcrum BCH requires a BCH full node (BCHN or BCHD) to be fully synced before it begins indexing. Initial indexing of the full BCH blockchain may take several hours.',
    update: null,
    uninstall:
      'Uninstalling Fulcrum BCH will permanently delete all index data. You will need to re-index from scratch if reinstalled.',
    restore: null,
    start:
      'Fulcrum BCH will not start until the selected BCH node is fully synced and running.',
    stop: null,
  },
  dependencies: {
    bitcoincashd: {
      description:
        'Bitcoin Cash Node — C++ full node. Pruning must be disabled and txindex must be active for Fulcrum BCH to function properly.',
      optional: true,
      metadata: {
        title: 'Bitcoin Cash Node',
        icon: 'https://raw.githubusercontent.com/BitcoinCash1/bitcoin-cash-node-startos/master/icon.png',
      },
    },
    bchd: {
      description:
        'BCHD — Go-based full node with built-in transaction index. An alternative to Bitcoin Cash Node for Fulcrum BCH.',
      optional: true,
      metadata: {
        title: 'Bitcoin Cash Daemon',
        icon: 'https://raw.githubusercontent.com/BitcoinCash1/bitcoin-cash-daemon-startos/master/icon.png',
      },
    },
  },
})
