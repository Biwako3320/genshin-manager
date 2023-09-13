import { Client } from '@/client/Client'
/**
 * Class of stat property.
 */
export class StatProperty {
  /**
   * Type of the stat.
   */
  public readonly type: FightPropType
  /**
   * Name of the stat.
   */
  public readonly name: string
  /**
   * Whether the stat is a percent value.
   */
  public readonly isPercent: boolean
  /**
   * Value of the stat.
   */
  public readonly value: number

  /**
   * Create a StatProperty
   * @param type FightPropType
   * @param value Value of the stat
   */
  constructor(type: FightPropType, value: number) {
    this.type = type

    const manualTextJson = Client.cachedExcelBinOutputGetter(
      'ManualTextMapConfigData',
      this.type,
    )

    this.name =
      Client.cachedTextMap.get(
        String(manualTextJson.textMapContentTextMapHash),
      ) || ''

    this.isPercent = percentFightPropType.includes(this.type)

    this.value = this.cleanUp(value)
  }

  public getMultipliedValue(): number {
    return this.cleanUp(this.value * (this.isPercent ? 100 : 1))
  }
  private cleanUp(v: number): number {
    return Math.round(v * 10000000) / 10000000
  }
}

const percentFightPropType: FightPropType[] = [
  'FIGHT_PROP_HP_PERCENT',
  'FIGHT_PROP_ATTACK_PERCENT',
  'FIGHT_PROP_DEFENSE_PERCENT',
  'FIGHT_PROP_SPEED_PERCENT',

  'FIGHT_PROP_CRITICAL',
  'FIGHT_PROP_CRITICAL_HURT',

  'FIGHT_PROP_CHARGE_EFFICIENCY',

  'FIGHT_PROP_HEAL_ADD',
  'FIGHT_PROP_HEALED_ADD',
  'FIGHT_PROP_PHYSICAL_SUB_HURT',
  'FIGHT_PROP_PHYSICAL_ADD_HURT',
  'FIGHT_PROP_FIRE_ADD_HURT',
  'FIGHT_PROP_ELEC_ADD_HURT',
  'FIGHT_PROP_WATER_ADD_HURT',
  'FIGHT_PROP_GRASS_ADD_HURT',
  'FIGHT_PROP_WIND_ADD_HURT',
  'FIGHT_PROP_ROCK_ADD_HURT',
  'FIGHT_PROP_ICE_ADD_HURT',
  'FIGHT_PROP_FIRE_SUB_HURT',
  'FIGHT_PROP_ELEC_SUB_HURT',
  'FIGHT_PROP_WATER_SUB_HURT',
  'FIGHT_PROP_GRASS_SUB_HURT',
  'FIGHT_PROP_WIND_SUB_HURT',
  'FIGHT_PROP_ROCK_SUB_HURT',
  'FIGHT_PROP_ICE_SUB_HURT',

  'FIGHT_PROP_SKILL_CD_MINUS_RATIO',
  'FIGHT_PROP_SHIELD_COST_MINUS_RATIO',
]

export type FightPropType =
  | 'FIGHT_PROP_BASE_HP'
  | 'FIGHT_PROP_HP'
  | 'FIGHT_PROP_HP_PERCENT'
  | 'FIGHT_PROP_BASE_ATTACK'
  | 'FIGHT_PROP_ATTACK'
  | 'FIGHT_PROP_ATTACK_PERCENT'
  | 'FIGHT_PROP_BASE_DEFENSE'
  | 'FIGHT_PROP_DEFENSE'
  | 'FIGHT_PROP_DEFENSE_PERCENT'
  | 'FIGHT_PROP_BASE_SPEED'
  | 'FIGHT_PROP_SPEED_PERCENT'
  | 'FIGHT_PROP_CRITICAL'
  | 'FIGHT_PROP_ANTI_CRITICAL'
  | 'FIGHT_PROP_CRITICAL_HURT'
  | 'FIGHT_PROP_ELEMENT_MASTERY'
  | 'FIGHT_PROP_CHARGE_EFFICIENCY'
  | 'FIGHT_PROP_ADD_HURT'
  | 'FIGHT_PROP_SUB_HURT'
  | 'FIGHT_PROP_HEAL_ADD'
  | 'FIGHT_PROP_HEALED_ADD'
  | 'FIGHT_PROP_FIRE_ADD_HURT'
  | 'FIGHT_PROP_FIRE_SUB_HURT'
  | 'FIGHT_PROP_WATER_ADD_HURT'
  | 'FIGHT_PROP_WATER_SUB_HURT'
  | 'FIGHT_PROP_GRASS_ADD_HURT'
  | 'FIGHT_PROP_GRASS_SUB_HURT'
  | 'FIGHT_PROP_ELEC_ADD_HURT'
  | 'FIGHT_PROP_ELEC_SUB_HURT'
  | 'FIGHT_PROP_ICE_ADD_HURT'
  | 'FIGHT_PROP_ICE_SUB_HURT'
  | 'FIGHT_PROP_WIND_ADD_HURT'
  | 'FIGHT_PROP_WIND_SUB_HURT'
  | 'FIGHT_PROP_PHYSICAL_ADD_HURT'
  | 'FIGHT_PROP_PHYSICAL_SUB_HURT'
  | 'FIGHT_PROP_ROCK_ADD_HURT'
  | 'FIGHT_PROP_ROCK_SUB_HURT'
  | 'FIGHT_PROP_MAX_HP'
  | 'FIGHT_PROP_CUR_ATTACK'
  | 'FIGHT_PROP_CUR_DEFENSE'
  | 'FIGHT_PROP_CUR_SPEED'
  | 'FIGHT_PROP_CUR_HP'
  | 'FIGHT_PROP_SKILL_CD_MINUS_RATIO'
  | 'FIGHT_PROP_SHIELD_COST_MINUS_RATIO'
