import NavBar from "../components/NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "../components/ProfilePic";
import { NotificationType, ConversationType, UserType } from "../types";

type Dms = ConversationType[] | null
type DmNotifications = NotificationType[] | null

export default function DmTab() {
    const [dms, setDms] = useState<Dms>(null);
    const [sender, setSender] = useState(null);
    const [notifications, setNotifications] = useState<DmNotifications>(null);

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('/api/dms', {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            if (res.ok) { return res.json() }
            throw Error
          })
          .then(res => {
            console.log(res.dms);
            
            setSender(res.sender);
            const dmArray = res.dms;
            sortByMostRecent(dmArray);
            setDms(dmArray);

          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    const markNotificationAsRead = (notification: NotificationType ) => {
        fetch(`/api/notifications/${notification._id}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            if (res.ok) { return res.json() }
            throw Error
          })
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                const loginPage = '/'
                navigate(loginPage);
            }
        })
    }

    const handleClick = (dm: ConversationType) => {
        const uniqueDirectMessage = `/dms/${dm._id}`;
        navigate(uniqueDirectMessage);

        const notification = checkArrayOfNotificationsForDmId(notifications, dm._id);

        if (notification) {
            markNotificationAsRead(notification);
        }
    }

    function isSameDay(d1: Date, d2: Date) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      }

    function isYesterday(d1: Date, d2: Date) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate() - 1;
    }

    const convertDate = (date: Date) => {
        const readableDate = new Date(date);
        const currentDate = new Date();

        if (isSameDay(readableDate, currentDate) === true) {
            let options: object = {
                hour: "numeric",
                minute: "numeric",
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate);

            return formattedDate
        } else if (isYesterday(readableDate, currentDate) === true) {
            return "Yesterday"
        } else if (isSameDay(readableDate, currentDate) === false) {
            let options: object = {
                month: "numeric",
                day: "numeric",
                year: "2-digit"
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate);

            return formattedDate
        }
    }

    function sortByMostRecent(dms: ConversationType[]) {
        dms.sort((a,b) => {
            const aLastMessageDate = a.history[a.history.length - 1].createdAt;
            const bLastMessageDate = b.history[b.history.length - 1].createdAt;
            const convertedADate: any = new Date(aLastMessageDate);
            const convertedBDate: any = new Date(bLastMessageDate);

            return convertedBDate - convertedADate;
        })
        
        return dms
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toLowerCase();

        dms?.forEach(dm => {
            const receiver: UserType | undefined = dm.users.find(user => user._id != sender);
            const isVisible = receiver?.display_name.toLowerCase().includes(value);
            const messageCard = document.getElementById(`${dm._id}`);
            messageCard?.classList.toggle("hide", !isVisible);
        })
    }

    const markUpdatedDms = (dmNotifications: DmNotifications) => {
        setNotifications(dmNotifications);
    }

    const checkArrayOfNotificationsForDmId = (notifications: DmNotifications, dmId: string) => {
        if (notifications) {
            for (let i = 0; i < notifications.length; i++) {
                if (notifications[i].conversation_id === dmId) return notifications[i]
            }
        }

        return false
    }

    return(
        <div className="messages-page">
            <div className="users-header">
                <h1 style={{ margin: 0 }}>Messages</h1>
                <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)}></input>
            </div>
            <div className="flexible-section">
                <div className="messages-container">
                        { dms &&
                            dms.map((dm) => {
                                const receiver = dm.users.find(user => user._id != sender);
                                const lastMessage = dm.history[dm.history.length - 1];

                                return (
                                    <div id={`${dm._id}`} key={dm._id}>
                                        <div className={`message-card ${(notifications && checkArrayOfNotificationsForDmId(notifications, dm._id)) && "new"}`}  onClick={() => {handleClick(dm)}}>
                                            <ProfilePic imageSrc={receiver?.profile_picture} size="5rem"/>
                                            <div className="name-message">
                                                <h2>{receiver?.display_name}</h2>
                                                { lastMessage.user === sender ?
                                                    <p style={{color: "grey",  wordBreak: "break-word" }}>You: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
                                                    :
                                                    <p style={{color: "grey", wordBreak: "break-word" }}>{receiver?.display_name}: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
                                                }
                                            </div>
                                            <p style={{ color: "grey", margin: 0 }}>{convertDate(lastMessage.createdAt)}</p>
                                        </div>
                                        <hr style={{ margin: 0 }}/>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>
            <NavBar active='Messages' markUpdatedDms={markUpdatedDms}/>
        </div>
    )
}