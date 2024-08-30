import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faDragon} from '@fortawesome/free-solid-svg-icons'

export default function Logo() {
    return(
        <div style={{display: "flex", gap: "1rem" }}>
            <FontAwesomeIcon icon={faDragon} style={{height: "3rem"}}/>
            <h1 className="site-name">Popinjay</h1>
        </div>
    )
}