import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons'

export default function FileMessageInput({ imgSrc, deleteFunction, edit }) {

    return(
        <div className="message-file-upload" style={{ top: edit && "160px" }}>
            <img src={imgSrc} style={{ height: "100%", borderRadius: "10px" }} id="image-upload"/>
            <button style={{ all: "unset", position: "absolute", right: "0px", margin: "5px", cursor: "pointer" }} onClick={deleteFunction}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </button>
        </div>
    )
}