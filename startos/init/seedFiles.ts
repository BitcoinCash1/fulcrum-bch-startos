import { utils } from '@start9labs/start-sdk'
import { bannerTxt } from '../fileModels/banner.txt'
import { fulcrumConf } from '../fileModels/fulcrum.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// Seeds the Flowee credential exactly once and then leaves it alone, rather
// than gating on `kind === 'install'`: the task that registers it on Flowee has
// nothing to send without it, and it postdates installs that already exist.
export const seedFiles = sdk.setupOnInit(async (effects) => {
  const store = await storeJson.read().once()

  await storeJson.merge(effects, {
    ...(!store?.floweeRpcUser && {
      floweeRpcUser: `fulcrum_bch_${utils.getDefaultString({
        charset: 'a-z',
        len: 8,
      })}`,
      floweeRpcPassword: utils.getDefaultString({
        charset: 'a-z,A-Z,0-9',
        len: 24,
      }),
    }),
  })

  await fulcrumConf.merge(effects, {})

  if ((await bannerTxt.read().once()) === null) {
    await bannerTxt.write(
      effects,
      'Fulcrum | Fast Electrum Server for Bitcoin Cash\n',
    )
  }
})
