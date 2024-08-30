import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons'

export default function FileMessageInput({ imgSrc }) {
    return(
        <div className="message-file-upload">
            <img src={imgSrc} style={{ height: "100%", borderRadius: "10px" }}/>
            <button style={{ all: "unset", position: "absolute", right: "0px", margin: "5px", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </button>
        </div>
    )
}