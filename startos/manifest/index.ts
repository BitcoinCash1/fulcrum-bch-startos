import { setupManifest } from '@start9labs/start-sdk'
import {
  bchdDescription,
  bitcoincashdDescription,
  floweeDescription,
  knuthDescription,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'fulcrum-bch',
  title: 'Fulcrum BCH',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/fulcrum-bch-startos',
  upstreamRepo: 'https://github.com/cculianu/Fulcrum',
  marketingUrl: 'https://github.com/cculianu/Fulcrum',
  donationUrl: 'https://github.com/cculianu/Fulcrum',
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: { dockerTag: 'cculianu/fulcrum:v2.1.2' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // Exactly one of these is needed at a time — whichever the Select Node
  // Backend action has chosen — so each is optional on its own.
  dependencies: {
    bitcoincashd: {
      description: bitcoincashdDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin Cash Node',
        icon: 'https://raw.githubusercontent.com/Start9-Community/bitcoin-cash-node-startos/master/icon.png',
      },
    },
    bchd: {
      description: bchdDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin Cash Daemon',
        icon: 'https://raw.githubusercontent.com/Start9-Community/bitcoin-cash-daemon-startos/master/icon.png',
      },
    },
    flowee: {
      description: floweeDescription,
      optional: true,
      metadata: {
        title: 'Flowee the Hub',
        icon: 'https://raw.githubusercontent.com/Start9-Community/flowee-the-hub-startos/master/icon.png',
      },
    },
    'knuth-bch': {
      description: knuthDescription,
      optional: true,
      metadata: {
        title: 'Knuth',
        icon: 'https://raw.githubusercontent.com/Start9-Community/knuth-bch-startos/master/icon.svg',
      },
    },
  },
})
