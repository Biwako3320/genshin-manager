import { Client } from '@/client/Client'
import { OutOfRangeError } from '@/errors/OutOfRangeError'
import { ImageAssets } from '@/models/assets/ImageAssets'
import { FightPropType, StatProperty } from '@/models/StatProperty'
import { JsonObject } from '@/utils/JsonParser'
interface ArtifactAffixAppendProp {
  id: number
  type: FightPropType
  value: number
}
/**
 * Class of artifact
 */
export class Artifact {
  /**
   * Artifact ID
   */
  public readonly id: number
  /**
   * Artifact level
   */
  public readonly level: number
  /**
   * Artifact type
   */
  public readonly type: ArtifactType
  /**
   * Artifact name
   */
  public readonly name: string
  /**
   * Artifact description
   */
  public readonly description: string
  /**
   * Artifact set ID
   */
  public readonly setId: number | undefined
  /**
   * Artifact set name
   */
  public readonly setName: string | undefined
  /**
   * Artifact set description (index:1 = 1pc, 2 = 2pc , 4 = 4pc)
   */
  public readonly setDescriptions: { [count: number]: string | undefined } = {}
  /**
   * Artifact rarity
   */
  public readonly rarity: number
  /**
   * Main stat
   */
  public readonly mainStat: StatProperty
  /**
   * Artifact sub stat list
   */
  public readonly subStats: StatProperty[]
  /**
   * Artifact sub stat ID list
   */
  public readonly appendPropList: ArtifactAffixAppendProp[]
  /**
   * Artifact icon
   */
  public readonly icon: ImageAssets
  /**
   * IDs of set bonuses that can be activated with one artifact
   */
  private readonly oneSetBonusIds: number[] = [
    15009, 15010, 15011, 15012, 15013,
  ]

  /**
   * Create an Artifact
   * @param artifactId Artifact ID
   * @param mainPropId Main stat ID from ReliquaryMainPropExcelConfigData.json
   * @param level Artifact level (0-20). Default: 0
   * @param appendPropIdList Artifact sub stat ID list
   */
  constructor(
    artifactId: number,
    mainPropId: number,
    level: number = 0,
    appendPropIdList: number[] = [],
  ) {
    this.id = artifactId
    this.level = level
    if (this.level < 0 || this.level > 20)
      throw new OutOfRangeError('level', this.level, 0, 20)
    const artifactJson = Client._getJsonFromCachedExcelBinOutput(
      'ReliquaryExcelConfigData',
      this.id,
    )
    this.type = artifactJson.equipType as ArtifactType
    this.name =
      Client.cachedTextMap.get(String(artifactJson.nameTextMapHash)) || ''
    this.description =
      Client.cachedTextMap.get(String(artifactJson.descTextMapHash)) || ''
    this.rarity = artifactJson.rankLevel as number
    this.setId = artifactJson.setId as number | undefined
    if (this.setId) {
      const setJson = Client._getJsonFromCachedExcelBinOutput(
        'ReliquarySetExcelConfigData',
        this.setId,
      )
      const equipAffixId = (setJson.EquipAffixId as number) * 10 + 0
      const equipAffixJson = Client._getJsonFromCachedExcelBinOutput(
        'EquipAffixExcelConfigData',
        equipAffixId,
      )

      this.setName = Client.cachedTextMap.get(
        String(equipAffixJson.nameTextMapHash),
      )

      if (this.oneSetBonusIds.includes(this.setId)) {
        this.setDescriptions[1] = equipAffixJson
          ? Client.cachedTextMap.get(String(equipAffixJson.descTextMapHash))
          : undefined
      } else {
        const equipAffixJsonBy2pc = Client._getJsonFromCachedExcelBinOutput(
          'EquipAffixExcelConfigData',
          equipAffixId,
        )
        this.setDescriptions[2] = equipAffixJsonBy2pc
          ? Client.cachedTextMap.get(
              String(equipAffixJsonBy2pc.descTextMapHash),
            )
          : undefined

        const equipAffixJsonBy4pc = Client._getJsonFromCachedExcelBinOutput(
          'EquipAffixExcelConfigData',
          equipAffixId + 1,
        )
        this.setDescriptions[4] = equipAffixJsonBy4pc
          ? Client.cachedTextMap.get(
              String(equipAffixJsonBy4pc.descTextMapHash),
            )
          : undefined
      }
    }
    const artifactMainJson = Client._getJsonFromCachedExcelBinOutput(
      'ReliquaryMainPropExcelConfigData',
      mainPropId,
    )
    const mainValue = (
      Client._getJsonFromCachedExcelBinOutput(
        'ReliquaryLevelExcelConfigData',
        artifactMainJson.propType as string,
      )[this.rarity] as JsonObject
    )[this.level] as number
    this.mainStat = new StatProperty(
      artifactMainJson.propType as FightPropType,
      mainValue,
    )
    this.subStats = this.getSubStatProperties(appendPropIdList)
    this.appendPropList = appendPropIdList.map((propId) => {
      const artifactAffixJson = Client._getJsonFromCachedExcelBinOutput(
        'ReliquaryAffixExcelConfigData',
        propId,
      )
      return {
        id: propId,
        type: artifactAffixJson.propType as FightPropType,
        value: artifactAffixJson.propValue as number,
      }
    })
    this.icon = new ImageAssets(artifactJson.icon as string)
  }

  /**
   * Get all artifact IDs
   * @returns All artifact IDs
   */
  public static getAllArtifactIds(): number[] {
    const artifactDatas = Object.values(
      Client._getCachedExcelBinOutputByName('ReliquaryExcelConfigData'),
    )
    const filteredArtifactDatas = artifactDatas.filter(
      (data) => data.setId !== 15000, // 15000 is dummy artifact
    )
    return filteredArtifactDatas.map((data) => data.id as number)
  }

  /**
   * Get sub stat properties from appendPropIdList
   * @param appendPropIdList Artifact sub stat ID list
   * @returns Sub stat properties
   */
  private getSubStatProperties(appendPropIdList: number[]): StatProperty[] {
    const result: Partial<{ [key in FightPropType]: number }> = {}
    appendPropIdList.forEach((propId) => {
      const artifactAffixJson = Client._getJsonFromCachedExcelBinOutput(
        'ReliquaryAffixExcelConfigData',
        propId,
      )
      const propType = artifactAffixJson.propType as FightPropType
      const propValue = result[propType]
      if (propValue)
        result[propType] = propValue + (artifactAffixJson.propValue as number)
      else result[propType] = artifactAffixJson.propValue as number
    })
    return Object.keys(result).map((key) => {
      return new StatProperty(
        key as FightPropType,
        result[key as FightPropType] as number,
      )
    })
  }
}

/**
 * Artifact type
 */
export type ArtifactType =
  | 'EQUIP_BRACER'
  | 'EQUIP_NECKLACE'
  | 'EQUIP_SHOES'
  | 'EQUIP_RING'
  | 'EQUIP_DRESS'
