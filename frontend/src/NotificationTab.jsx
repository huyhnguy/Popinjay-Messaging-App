import NavBar from "./NavBar"
import { useState, useEffect } from "react"
import ProfilePic from "./ProfilePic";
import { useNavigate } from "react-router-dom";

export default function NotificationTab() {
    const [notifications, setNotifications] = useState(null);

    const navigation = useNavigate();

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

    const convertDate = (date) => {
        const readableDate = new Date(date);
        const currentDate = new Date();

        const differenceInMs = Math.abs(currentDate - readableDate);
        const differenceInSeconds = differenceInMs / 1000 
        const differenceInMinutes = differenceInSeconds / 60 
        const differenceInHours = differenceInMinutes / 60 
        const differenceInDays = differenceInHours / 24 

        if (differenceInDays >= 1) return Math.floor(differenceInDays) + 'd'
        if (differenceInHours > 2) return Math.floor(differenceInHours) + 'hrs'
        if (differenceInHours >= 1 && differenceInHours < 2) return Math.floor(differenceInHours) + 'hr'
        if (differenceInMinutes > 1) return Math.floor(differenceInMinutes) + 'm'
        if (differenceInSeconds > 1) return Math.floor(differenceInSeconds) + 's'
    }

    const routeToResource = (notification) => {
        if (notification.from_type === "User") {
            navigation(`/dms/${notification.conversation_id}`)
        } else if (notification.from_type === "Conversation" && 
            notification.update === "You are the new master." ||
            notification.update === "You are now an admin." ||
            notification.update === "You are no longer an admin."
        ) {
            navigation(`/groups/${notification.conversation_id}/settings`)
        } else if (notification.from_type === "Conversation" &&
            notification.update === "You have been kicked."
        ) {
            navigation(`/groups`)
        } else if (notification.from_type === "Conversation") {
            navigation(`/groups/${notification.conversation_id}`)
        }
    }

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
                                    <div className="notification" onClick={() => {routeToResource(notification)}}>
                                        <ProfilePic imageSrc={notification.from.profile_picture} size="4rem"/>
                                        <div>
                                            <h1 style={{ margin: 0 }}>{notification.from.display_name}</h1>
                                            <p style={{ margin: 0}}>{notification.update}</p>
                                        </div>
                                        <p style={{ color: "grey" }}>{convertDate(notification.createdAt)}</p>
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