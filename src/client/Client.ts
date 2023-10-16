import cron from 'node-cron'
import path from 'path'
import merge from 'ts-deepmerge'

import { AssetCacheManager } from '@/client/AssetCacheManager'
import { ImageAssets } from '@/models/assets/ImageAssets'
import { ClientOption, TextMapLanguage } from '@/types'

/**
 * Class of the client.
 * This is the main body of `Genshin-Manager` where cache information is stored.
 * @extends AssetCacheManager
 */
export class Client extends AssetCacheManager {
  public readonly option: ClientOption

  /**
   * Create a client.
   * @param option Client option
   */
  constructor(option?: Partial<ClientOption>) {
    const defaultOption: ClientOption = {
      fetchOption: {
        timeout: 0,
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      },
      downloadLanguages: [
        'EN',
        'RU',
        'VI',
        'TH',
        'PT',
        'KR',
        'JP',
        'ID',
        'FR',
        'ES',
        'DE',
        'CHT',
        'CHS',
      ],
      defaultImageBaseUrl: 'https://api.ambr.top/assets/UI',
      imageBaseUrlByRegex: {
        'https://api.hakush.in/gi/UI': [
          /^UI_(NameCardIcon|Costume|RelicIcon|MonsterIcon|AnimalIcon|ItemIcon|Gcg_CardFace)_/,
        ],
        'https://enka.network/ui': [
          /^UI_(EquipIcon|NameCardPic|AvatarIcon_Side)_/,
          /^UI_AvatarIcon_(.+)_Card$/,
          /^UI_AvatarIcon_(.+)_Circle/,
        ],
        'https://res.cloudinary.com/genshin/image/upload/sprites': [
          /^Eff_UI_Talent_/,
          /^UI_(TowerPic|TowerBlessing|GcgIcon|Gcg_Cardtable|Gcg_CardBack)_/,
        ],
      },
      defaultLanguage: 'EN',
      showFetchCacheLog: true,
      autoFetchLatestAssetsByCron: '0 0 0 * * 3', //Every Wednesday 00:00:00
      autoCacheImage: true,
      autoFixTextMap: true,
      assetCacheFolderPath: path.resolve(__dirname, '..', '..', 'cache'),
    }
    const mergeOption = option
      ? (merge.withOptions(
          { mergeArrays: false },
          defaultOption,
          option,
        ) as ClientOption)
      : defaultOption

    if (!mergeOption.downloadLanguages.includes(mergeOption.defaultLanguage)) {
      mergeOption.downloadLanguages = [
        mergeOption.defaultLanguage,
        ...mergeOption.downloadLanguages,
      ]
    }

    if (!mergeOption.autoFetchLatestAssetsByCron) {
      mergeOption.autoFixTextMap = false
    }

    if (!module.parent) {
      throw new Error('module.parent is undefined.')
    }
    super(mergeOption, module.parent.children)
    this.option = mergeOption
  }

  /**
   * Deploy assets to cache & Update assets
   * @example
   * ```ts
   * const client = new Client()
   * await client.deploy()
   * ```
   */
  public async deploy() {
    await Client.updateCache()
    if (this.option.autoFetchLatestAssetsByCron) {
      cron.schedule(this.option.autoFetchLatestAssetsByCron, () => {
        void Client.updateCache()
      })
    }
    ImageAssets.deploy(this.option)
  }

  /**
   * Change cached languages.
   * @param language Country code
   * @example
   * ```ts
   * const client = new Client()
   * await client.deploy()
   * await Client.changeLanguage('JP')
   * ```
   */
  public static async changeLanguage(language: keyof typeof TextMapLanguage) {
    await Client.setTextMapToCache(language)
  }
}
