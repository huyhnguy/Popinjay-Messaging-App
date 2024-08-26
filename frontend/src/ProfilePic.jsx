import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'

export default function ProfilePic({ imageSrc = null }) {
    return (
        <div className="profile-pic-container">
            { imageSrc ?
                <img src={imageSrc} alt="profile picture"/>
                :
                <FontAwesomeIcon icon={faUser} />
            }
        </div>
    )
}