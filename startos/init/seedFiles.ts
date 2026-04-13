import { sdk } from '../sdk'
import { fulcrumConf } from '../file-models/fulcrum.conf'
import { bannerTxt } from '../file-models/banner.txt'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  await fulcrumConf.merge(effects, {})
  await bannerTxt.write(
    effects,
    'Fulcrum BCH | Fast Electrum Server for Bitcoin Cash\n',
  )
})
