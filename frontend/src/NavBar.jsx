import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGear, faUsers, faEarthAmericas, faMessage, faBell, faCircle} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState} from "react";

export default function NavBar({ active }) {
    const [counter, setCounter] = useState(null);
    
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
            setCounter(res.new_notification_counter);
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
                <div style={{ position: "relative", maxWidth: "fit-content"}}>
                    <FontAwesomeIcon icon={faBell} className="nav-icon"/>
                    { (counter != 0 && counter) && 
                        <div className="notification-counter-container">
                            <div className="notification-counter">{counter}</div>
                            <FontAwesomeIcon icon={faCircle} style={{ color: "red", position: "absolute", top: 0 }}className="nav-icon"/>
                        </div>
                    }
                </div>
                <p>Notifications</p>
            </Link>
            <Link to="/settings" className="nav-link" style={{ color: active === 'Settings' && '#007BFF'}}>
                <FontAwesomeIcon icon={faGear} className="nav-icon"/>
                <p>Settings</p>
            </Link>
        </nav>
    )
}