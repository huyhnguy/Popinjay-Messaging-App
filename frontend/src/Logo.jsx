import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFeatherPointed} from '@fortawesome/free-solid-svg-icons'

export default function Logo() {
    return(
        <div style={{display: "flex", gap: "1rem" }}>
            <FontAwesomeIcon icon={faFeatherPointed} style={{height: "3rem", color: "#007bff"}}/>
            <h1 className="site-name">Popinjay</h1>
        </div>
    )
}