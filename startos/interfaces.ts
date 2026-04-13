import { sdk } from './sdk'
import { electrumPort, electrumInterfaceId } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const electrumMulti = sdk.MultiHost.of(effects, 'main')
  const electrumOrigin = await electrumMulti.bindPort(electrumPort, {
    protocol: 'tcp',
    preferredExternalPort: electrumPort,
    addSsl: null,
    secure: { ssl: false },
  })

  const electrum = sdk.createInterface(effects, {
    name: 'Electrum Interface',
    id: electrumInterfaceId,
    description:
      'Serves the Electrum protocol for BCH wallets and the BCH Explorer',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await electrumOrigin.export([electrum])]
})
