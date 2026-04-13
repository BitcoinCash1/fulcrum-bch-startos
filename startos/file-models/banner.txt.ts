import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const bannerTxt = FileHelper.raw(
  {
    base: sdk.volumes.main,
    subpath: 'banner.txt',
  },
  'utf8',
)
