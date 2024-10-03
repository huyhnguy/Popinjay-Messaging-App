import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons'

export default function FileMessageInput({ imgSrc, deleteFunction }: { imgSrc: string, deleteFunction: () => void }) {

    return(
        <div className="message-file-upload">
            <img src={imgSrc} style={{ height: "100%", borderRadius: "10px" }} id="image-upload"/>
            <button style={{ all: "unset", position: "absolute", right: "0px", margin: "5px", cursor: "pointer" }} onClick={deleteFunction}>
                <FontAwesomeIcon icon={faCircleXmark}/>
            </button>
        </div>
    )
}