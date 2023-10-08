import { ShowAvatarInfo } from '@/models/enka/ShowAvatarInfo'
import { Material } from '@/models/Material'
import { ProfilePicture } from '@/models/ProfilePicture'
import { APIPlayerInfo } from '@/types/EnkaTypes'
/**
 * Class of player obtained from EnkaNetwork.
 */
export class PlayerInfo {
  /**
   * Nickname of the player.
   */
  readonly nickname: string
  /**
   * Adventure Rank of the player.
   */
  readonly level: number
  /**
   * Signature of the player.
   */
  readonly signature: string
  /**
   * World Level of the player.
   */
  readonly worldLevel: number
  /**
   * Name card of the player.
   */
  readonly nameCard: Material
  /**
   * Number of achievements that the player has finished.
   */
  readonly finishAchievementNum: number
  /**
   * Floor index of the Spiral Abyss.
   */
  readonly towerFloorIndex: number
  /**
   * Level index of the Spiral Abyss.
   */
  readonly towerLevelIndex: number
  /**
   * List of avatars that the player has.
   */
  readonly showAvatarInfoList: ShowAvatarInfo[]
  /**
   * List of name cards that the player has.
   */
  readonly showNameCardList: Material[]
  /**
   * Profile picture of the player.
   */
  readonly profilePicture: ProfilePicture

  /**
   * Create a PlayerInfo
   * @param data Data from EnkaNetwork
   */
  constructor(data: APIPlayerInfo) {
    this.nickname = data.nickname
    this.level = data.level
    this.signature = data.signature || ''
    this.worldLevel = data.worldLevel || 0
    this.nameCard = new Material(data.nameCardId)
    this.finishAchievementNum = data.finishAchievementNum || 0
    this.towerFloorIndex = data.towerFloorIndex || 0
    this.towerLevelIndex = data.towerLevelIndex || 0
    this.showAvatarInfoList = data.showAvatarInfoList
      ? data.showAvatarInfoList.map((v) => new ShowAvatarInfo(v))
      : []
    this.showNameCardList = data.showNameCardIdList
      ? data.showNameCardIdList.map((id) => new Material(id))
      : []

    let profilePictureId
    if (data.profilePicture && data.profilePicture.id) {
      profilePictureId = data.profilePicture.id
    } else {
      profilePictureId = ProfilePicture.findProfilePictureIdByInfoId(
        data.profilePicture?.costumeId ??
          data.profilePicture?.avatarId ??
          10000005,
      ) as number
    }
    this.profilePicture = new ProfilePicture(profilePictureId || 10000005)
  }
}
