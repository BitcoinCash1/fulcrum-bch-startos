import { i18n } from './i18n'
import { sdk } from './sdk'
import { electrumHostId, electrumInterfaceId, electrumPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multiHost = sdk.MultiHost.of(effects, electrumHostId)
  // Plaintext only. BCH Explorer reads this binding's bridge address without
  // asking for a scheme, so publishing a TLS address alongside it would leave
  // which of the two it dials undefined.
  const electrumOrigin = await multiHost.bindPort(electrumPort, {
    protocol: null,
    preferredExternalPort: electrumPort,
    secure: { ssl: false },
    addSsl: null,
  })

  const electrum = sdk.createInterface(effects, {
    id: electrumInterfaceId,
    name: i18n('Electrum'),
    description: i18n(
      'Serves the Electrum protocol to Bitcoin Cash wallets and to BCH Explorer',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await electrumOrigin.export([electrum])]
})
