import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGear, faUsers, faEarthAmericas, faMessage, faBell} from '@fortawesome/free-solid-svg-icons'

export default function NavBar({ active }) {
    return(
        <nav>
            <Link to="/groups" className="nav-link" style={{ color: active === 'Groups' && '#007BFF'}}>
                <FontAwesomeIcon icon={faUsers} className="nav-icon"/>
                <p>Groups</p>
            </Link>
            <Link to="/dms" className="nav-link" style={{ color: active === 'Messages' && '#007BFF'}}>
                <FontAwesomeIcon icon={faMessage} className="nav-icon"/>
                <p>Messages</p>
            </Link>
            <Link to="/users" className="nav-link" style={{ color: active === 'Users' && '#007BFF'}}>
                <FontAwesomeIcon icon={faEarthAmericas} className="nav-icon"/>
                <p>Users</p>
            </Link>
            <Link to="/notifications" className="nav-link" style={{ color: active === 'Notifications' && '#007BFF'}}>
                <FontAwesomeIcon icon={faBell} className="nav-icon"/>
                <p>Notifications</p>
            </Link>
            <Link to="/settings" className="nav-link" style={{ color: active === 'Settings' && '#007BFF'}}>
                <FontAwesomeIcon icon={faGear} className="nav-icon"/>
                <p>Settings</p>
            </Link>
        </nav>
    )
}