import { sdk } from '../sdk'
import { fulcrumConf } from '../file-models/fulcrum.conf'
import { bannerTxt } from '../file-models/banner.txt'
import { storeJson } from '../file-models/store.json'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, { nodePackageId: 'bitcoincashd', nodeConfirmed: false })
  await fulcrumConf.merge(effects, {})
  await bannerTxt.write(
    effects,
    'Fulcrum | Fast Electrum Server for Bitcoin Cash\n',
  )
})
