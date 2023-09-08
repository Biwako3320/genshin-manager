import { Client } from '@/client/Client'
import { ImageAssets } from '@/models/assets/ImageAssets'
import { JsonObject } from '@/utils/JsonParser'

/**
 * Class of character's costume.
 */
export class Costume {
  /**
   * Costume id
   */
  public readonly id: number
  /**
   * Costume name
   */
  public readonly name: string
  /**
   * Costume description
   */
  public readonly description: string
  /**
   * Costume rarity
   */
  public readonly rarity: number
  /**
   * Costume side icon
   */
  public readonly sideIcon: ImageAssets
  /**
   * Costume icon
   */
  public readonly icon: ImageAssets
  /**
   * Costume art
   */
  public readonly art: ImageAssets

  constructor(costumeId: number) {
    this.id = costumeId
    const costumeJson = Client.cachedExcelBinOutputGetter(
      'AvatarCostumeExcelConfigData',
      this.id,
    )
    const avatarJson = Client.cachedExcelBinOutputGetter(
      'AvatarExcelConfigData',
      costumeJson.avatarId as number,
    )

    this.name =
      Client.cachedTextMap.get(String(costumeJson.nameTextMapHash)) || ''
    this.description =
      Client.cachedTextMap.get(String(costumeJson.descTextMapHash)) || ''
    this.rarity = (costumeJson.rarity as number) || 0
    const sideIconName =
      costumeJson.rarity && typeof avatarJson != 'undefined'
        ? (costumeJson.sideIconName as string)
        : (avatarJson.sideIconName as string)
    this.sideIcon = new ImageAssets(sideIconName)
    const nameParts = this.sideIcon.name.split('_')
    const avatarTag = nameParts[nameParts.length - 1]
    this.icon = new ImageAssets('UI_AvatarIcon_' + avatarTag)
    this.art = new ImageAssets(
      costumeJson.rarity
        ? 'UI_Costume_' + avatarTag
        : 'UI_Gacha_AvatarImg_' + avatarTag,
    )
  }
  /**
   * Get all costume ids
   * @returns All costume ids
   */
  public static getAllCostumeIds(): number[] {
    const costumeDatas = Object.values(
      Client.cachedExcelBinOutput
        .get('AvatarCostumeExcelConfigData')
        ?.get() as JsonObject,
    ) as JsonObject[]
    return costumeDatas.map((k) => k.costumeId as number)
  }
}
