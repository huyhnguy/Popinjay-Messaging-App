import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUser, faUserGroup} from '@fortawesome/free-solid-svg-icons'

export default function ProfilePic({ imageSrc = undefined, size= "5rem", group = false }: { imageSrc: string | undefined, size: string, group?: boolean }) {
    return (
        <div className="profile-pic-container" style={{height: size, width: size}}>
            { imageSrc ?
                <img src={imageSrc} alt="profile picture" loading="lazy"/>
                :
                <FontAwesomeIcon icon={ group ? faUserGroup : faUser} />
            }
        </div>
    )
}