import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGear, faUsers, faEarthAmericas, faMessage, faBell, faCircle} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState} from "react";
import { noAuto } from "@fortawesome/fontawesome-svg-core";

export default function NavBar({ active, markUpdatedDms, markUpdatedGroups }) {
    const [newNotifications, setNewNotifications] = useState(null);
    
    useEffect(() => {
        fetch('http://localhost:3000/api/notifications/counter', {
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
                markUpdatedDms(dmNotifications);
            }

            if (active === 'Groups') {
                const groupNotifications = res.new_notifications.filter((notification) => notification.from_type === "Conversation");
                markUpdatedGroups(groupNotifications);
            }

          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    return(
        <nav>
            <Link to="/groups" className="nav-link" style={{ color: active === 'Groups' && '#007BFF'}}>
                <FontAwesomeIcon icon={faUsers} className="nav-icon"/>
            </Link>
            <Link to="/dms" className="nav-link" style={{ color: active === 'Messages' && '#007BFF'}}>
                <FontAwesomeIcon icon={faMessage} className="nav-icon"/>
            </Link>
            <Link to="/users" className="nav-link" style={{ color: active === 'Users' && '#007BFF'}}>
                <FontAwesomeIcon icon={faEarthAmericas} className="nav-icon"/>
            </Link>
            <Link to="/notifications" className="nav-link" style={{ color: active === 'Notifications' && '#007BFF'}}>
                <div style={{ position: "relative", maxWidth: "fit-content"}}>
                    <FontAwesomeIcon icon={faBell} className="nav-icon"/>
                    { (newNotifications && newNotifications.length != 0) && 
                        <div className="notification-counter-container">
                            <div className="notification-counter">{newNotifications.length}</div>
                            <FontAwesomeIcon icon={faCircle} style={{ color: "red", position: "absolute", top: 0 }}className="nav-icon"/>
                        </div>
                    }
                </div>
            </Link>
            <Link to="/settings" className="nav-link" style={{ color: active === 'Settings' && '#007BFF'}}>
                <FontAwesomeIcon icon={faGear} className="nav-icon"/>
            </Link>
        </nav>
    )
}