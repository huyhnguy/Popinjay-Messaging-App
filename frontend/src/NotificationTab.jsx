import NavBar from "./NavBar"
import { useState, useEffect } from "react"
import ProfilePic from "./ProfilePic";

export default function NotificationTab() {
    const [notifications, setNotifications] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/api/notifications', {
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
            console.log(res);
            setNotifications(res.notifications);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    return(
        <div className="messages-page">
            <div className="users-header">
                <h1 style={{ margin: 0 }}>Notifications</h1>
            </div>
            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="notifications-container">
                    { notifications &&
                        notifications.map((notification) => {
                            return (
                                <div key={notification._id}>
                                    <div className="notification">
                                        <ProfilePic imageSrc={notification.from.profile_picture} size="4rem"/>
                                        <div>
                                            <h1 style={{ margin: 0 }}>{notification.from.display_name}</h1>
                                            <p style={{ margin: 0}}>{notification.update}</p>
                                        </div>
                                        <p style={{ color: "grey" }}>30m</p>
                                    </div>
                                    <hr style={{ margin: 0 }}/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <NavBar active='Notifications'/>
        </div>
    )
}