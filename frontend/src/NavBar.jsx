import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGear, faUsers, faUser, faEarthAmericas, faMessage, faBell, faCircle} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState} from "react";

export default function NavBar({ active, markUpdatedDms, markUpdatedGroups }) {
    const [newNotifications, setNewNotifications] = useState(null);

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('/api/notifications/counter', {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
          .then(res => {
            console.log(res.new_notifications);
            setNewNotifications(res.new_notifications);

            if (active === 'Messages') {
                const dmNotifications = res.new_notifications.filter((notification) => notification.from_type === "User");
                if (markUpdatedDms) markUpdatedDms(dmNotifications);
            }

            if (active === 'Groups') {
                const groupNotifications = res.new_notifications.filter((notification) => notification.from_type === "Conversation");
                if (markUpdatedGroups) markUpdatedGroups(groupNotifications);
            }

          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    return(
        <nav>
            <Link to="/users" className="nav-link" style={{ color: active === 'Users' && '#007BFF'}}>
                <FontAwesomeIcon icon={faUser} className="nav-icon"/>
                <p className="nav-name">Users</p>
            </Link>
            <Link to="/dms" className="nav-link" style={{ color: active === 'Messages' && '#007BFF'}}>
                <FontAwesomeIcon icon={faMessage} className="nav-icon"/>
                <p className="nav-name">Messages</p>
            </Link>
            <Link to="/groups" className="nav-link" style={{ color: active === 'Groups' && '#007BFF'}}>
                <FontAwesomeIcon icon={faUsers} className="nav-icon"/>
                <p className="nav-name">Groups</p>
            </Link>
            <Link to="/notifications" className="nav-link" style={{ color: active === 'Notifications' && '#007BFF'}}>
                <div style={{ position: "relative", maxWidth: "fit-content"}}>
                    <FontAwesomeIcon icon={faBell} className="nav-icon"/>
                    { (newNotifications && newNotifications.length != 0) && 
                        <div className="notification-counter-container">
                            <div className="notification-counter">{newNotifications.length}</div>
                            <FontAwesomeIcon icon={faCircle} style={{ color: "red", position: "absolute", top: 0, height: "1.5rem"}}/>
                        </div>
                    }
                </div>
                <p className="nav-name">Notifications</p>
            </Link>
            <Link to="/settings" className="nav-link" style={{ color: active === 'Settings' && '#007BFF'}}>
                <FontAwesomeIcon icon={faGear} className="nav-icon"/>
                <p className="nav-name">Settings</p>
            </Link>
        </nav>
    )
}