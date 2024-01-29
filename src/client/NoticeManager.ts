import { merge } from 'ts-deepmerge'

import { AnnContentNotFoundError } from '@/errors/AnnContentNotFoundError'
import { AnnError } from '@/errors/AnnError'
import { Notice } from '@/models/Notice'
import {
  APIGetAnnContent,
  APIGetAnnList,
  NoticeLanguage,
  UrlParams,
} from '@/types/GetAnnTypes'

/**
 * Class that manages notices
 */
export class NoticeManager {
  /**
   * URL of getAnnContent
   */
  private static readonly getContentUrl: string =
    'https://sg-hk4e-api-static.hoyoverse.com/common/hk4e_global/announcement/api/getAnnContent'
  /**
   * URL of getAnnList
   */
  private static readonly getListUrl: string =
    'https://sg-hk4e-api.hoyoverse.com/common/hk4e_global/announcement/api/getAnnList'
  /**
   * Default fetch option
   */
  private static readonly defaultFetchOption: RequestInit = {
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  }
  /**
   * Default url params
   */
  private static readonly defaultUrlParams: UrlParams = {
    game: 'hk4e',
    game_biz: 'hk4e_global',
    lang: 'en',
    auth_appid: 'announcement',
    bundle_id: 'hk4e_global',
    channel_id: '1',
    level: '60',
    platform: 'pc',
    region: 'os_asia',
    sdk_presentation_style: 'fullscreen',
    sdk_screen_transparent: 'true',
    uid: '888888888',
  }

  /**
   * Fetch option
   * @default
   * ```ts
   * {
   * headers: {
   *   'user-agent': 'Mozilla/5.0',
   * },
   * ```
   */
  public fetchOption: RequestInit
  /**
   * Language of notices
   */
  public language: keyof typeof NoticeLanguage
  /**
   * Notices
   * @key Notice ID
   * @value Notice
   */
  public notices = new Map<number, Notice>()

  /**
   * Url params
   */
  private urlParams: UrlParams

  /**
   * Create a NoticeManager
   * @param language Language of notices
   * @param fetchOption Fetch option
   * @param urlParams Url params
   */
  constructor(
    language: keyof typeof NoticeLanguage,
    fetchOption?: RequestInit,
    urlParams?: Partial<UrlParams>,
  ) {
    this.language = language
    this.fetchOption = fetchOption ?? NoticeManager.defaultFetchOption
    this.urlParams = merge.withOptions(
      { mergeArrays: false },
      NoticeManager.defaultUrlParams,
      urlParams ?? {},
    ) as UrlParams
  }

  /**
   * Update notices
   */
  public async update(): Promise<void> {
    const annContent = await this.getAnnContent()
    const annEnContent = await this.getAnnContent('en')
    const annList = await this.getAnnList()
    this.notices.clear()
    annList.data.list.forEach((tab) => {
      tab.list.forEach((data) => {
        const content = annContent.data.list.find(
          (content) => content.ann_id === data.ann_id,
        )
        const enContent = annEnContent.data.list.find(
          (content) => content.ann_id === data.ann_id,
        )
        if (!content || !enContent)
          throw new AnnContentNotFoundError(data.ann_id)
        this.notices.set(
          data.ann_id,
          new Notice(data, content, enContent, this.urlParams.region),
        )
      })
    })
  }

  /**
   * Get AnnContent
   * @param lang Language of notices
   * @returns AnnContent
   */
  private async getAnnContent(
    lang?: keyof typeof NoticeLanguage,
  ): Promise<APIGetAnnContent> {
    return (await this._getAnn(
      NoticeManager.getContentUrl,
      lang,
    )) as APIGetAnnContent
  }

  /**
   * Get AnnList
   * @returns AnnList
   */
  private async getAnnList(): Promise<APIGetAnnList> {
    return (await this._getAnn(NoticeManager.getListUrl)) as APIGetAnnList
  }

  /**
   * Get Ann
   * @param urlText Url
   * @param lang Language of notices
   * @returns Ann
   */
  private async _getAnn(
    urlText: string,
    lang?: keyof typeof NoticeLanguage,
  ): Promise<APIGetAnnContent | APIGetAnnList> {
    const url = new URL(urlText)
    Object.keys(this.urlParams).forEach((key) => {
      if (key === 'lang') url.searchParams.append(key, lang ?? this.language)
      else url.searchParams.append(key, this.urlParams[key as keyof UrlParams])
    })
    const res = await fetch(url.toString())
    if (!res.ok) throw new AnnError(res)
    return (await res.json()) as APIGetAnnContent | APIGetAnnList
  }
}
