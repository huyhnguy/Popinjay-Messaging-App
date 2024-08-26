import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'

export default function ProfilePic({ imageSrc = null, size= "5rem" }) {
    return (
        <div className="profile-pic-container" style={{height: size, width: size}}>
            { imageSrc ?
                <img src={imageSrc} alt="profile picture"/>
                :
                <FontAwesomeIcon icon={faUser} />
            }
        </div>
    )
}