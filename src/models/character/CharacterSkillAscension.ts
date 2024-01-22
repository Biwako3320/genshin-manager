import { Client } from '@/client/Client'
import { OutOfRangeError } from '@/errors/OutOfRangeError'
import { FightPropType, StatProperty } from '@/models/StatProperty'
import { JsonObject } from '@/utils/JsonParser'

/**
 * Class of character skill ascension
 */
export class CharacterSkillAscension {
  /**
   * Skill ID
   */
  public readonly id: number
  /**
   * Skill level
   */
  public readonly level: number
  /**
   * Skill ascension costItems
   */
  public readonly costItems: {
    /**
     * Cost item ID (materialID)
     */
    id: number
    /**
     * Cost item count
     */
    count: number
  }[]
  /**
   * Skill ascension costMora
   */
  public readonly costMora: number
  /**
   * Skill ascension addProps
   */
  public readonly addProps: StatProperty[]

  /**
   * Create a character skill ascension
   * @param skillId Skill ID
   * @param Level skill level (1-15). Default: 1
   */
  constructor(skillId: number, Level: number = 1) {
    this.id = skillId
    this.level = Level
    if (this.level < 1 || this.level > 15)
      throw new OutOfRangeError('level', this.level, 1, 15)
    const skillJson = Client._getJsonFromCachedExcelBinOutput(
      'AvatarSkillExcelConfigData',
      this.id,
    )
    const proudSkillGroupId = skillJson.proudSkillGroupId as number
    const proudSkillJson = Client._getJsonFromCachedExcelBinOutput(
      'ProudSkillExcelConfigData',
      proudSkillGroupId,
    )[this.level] as JsonObject
    this.costItems = (proudSkillJson.costItems as JsonObject[])
      .map((costItem) => {
        return {
          id: costItem.id as number,
          count: costItem.count as number,
        }
      })
      .filter(
        (costItem) => costItem.id !== undefined && costItem.count !== undefined,
      )
    this.costMora = (proudSkillJson.coinCost as number | undefined) ?? 0
    this.addProps = (proudSkillJson.addProps as JsonObject[]).map(
      (addProp) =>
        new StatProperty(
          addProp.propType as FightPropType,
          (addProp.value ?? 0) as number,
        ),
    )
  }
}
