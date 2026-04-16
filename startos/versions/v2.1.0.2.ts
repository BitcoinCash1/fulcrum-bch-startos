import { VersionInfo } from '@start9labs/start-sdk'
import { bannerTxt } from '../file-models/banner.txt'

export const v_2_1_0_2 = VersionInfo.of({
  version: '2.1.0:2',
  releaseNotes:
    'Multi-node support: select BCHN or BCHD as the backend node. ' +
    'Fixed stale banner text from previous versions.',
  migrations: {
    up: async ({ effects }) => {
      // Fix stale "Fulcrum BCH" banner from previous installs
      const banner = await bannerTxt.read().once()
      if (banner && banner.includes('Fulcrum BCH')) {
        await bannerTxt.write(
          effects,
          banner.replace(/Fulcrum BCH/g, 'Fulcrum'),
        )
      }
    },
    down: async ({ effects }) => {},
  },
})
