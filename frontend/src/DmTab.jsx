import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";

export default function DmTab() {
    const [dms, setDms] = useState(null);
    const [sender, setSender] = useState(null);
    const [notifications, setNotifications] = useState(null);

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('http://localhost:3000/api/dms', {
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
            console.log(res.dms);
            
            setSender(res.sender);
            const dmArray = res.dms;
            sortByMostRecent(dmArray);
            setDms(dmArray);

          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    const handleDM = (dm) => {
        const receiver = dm.users.find(user => user._id != sender);

        const route = `/dms/${dm._id}`;
        navigate(route, { 
            state: {
                receiver: receiver,
                history: dm.history
            } 
        });

        const notification = checkArrayOfNotificationsForDmId(notifications, dm._id);

        if (notification) {
            fetch(`http://localhost:3000/api/notifications/${notification._id}`, {
                method: 'PUT',
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
              })
              .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/login');
                }
            })
        }
    }

    function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      }

    function isYesterday(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate() - 1;
    }

    const convertDate = (date) => {
        let options;
        const readableDate = new Date(date);
        const currentDate = new Date();

        if (sameDay(readableDate, currentDate) === true) {
            options = {
                hour: "numeric",
                minute: "numeric",
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate, options);

            return formattedDate
        } else if (isYesterday(readableDate, currentDate) === true) {
            return "Yesterday"
        } else if (sameDay(readableDate, currentDate) === false) {
            let options = {
                month: "numeric",
                day: "numeric",
                year: "2-digit"
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate, options);

            return formattedDate
        }
    }

    function sortByMostRecent(dms) {
        dms.sort((a,b) => {
            const aLastMessageDate = a.history[a.history.length - 1].createdAt;
            const bLastMessageDate = b.history[b.history.length - 1].createdAt;
            const convertedADate = new Date(aLastMessageDate);
            const convertedBDate = new Date(bLastMessageDate);

            return convertedBDate - convertedADate;
        })
        
        return dms
    }

    const handleSearch = (e) => {
        let value = e.target.value.toLowerCase();

        dms.forEach(dm => {
            const receiver = dm.users.find(user => user._id != sender);
            const isVisible = receiver.display_name.toLowerCase().includes(value);
            const messageCard = document.getElementById(`${dm._id}`);
            messageCard.classList.toggle("hide", !isVisible);
        })
    }

    const markUpdatedDms = (dmNotifications) => {
        setNotifications(dmNotifications);
    }

    const checkArrayOfNotificationsForDmId = (notifications, dmId) => {
        for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].conversation_id === dmId) return notifications[i]
        }

        return false
    }

    return(
        <div className="messages-page">
            <div className="users-header">
                <h1 style={{ margin: 0 }}>Messages</h1>
                <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)}></input>
            </div>
            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="messages-container">
                        { dms &&
                            dms.map((dm) => {
                                const receiver = dm.users.find(user => user._id != sender);
                                const lastMessage = dm.history[dm.history.length - 1];

                                return (
                                    <div id={`${dm._id}`} key={dm._id}>
                                        <div className={`message-card ${checkArrayOfNotificationsForDmId(notifications, dm._id) && "new"}`}  onClick={() => {handleDM(dm)}}>
                                            <ProfilePic imageSrc={receiver.profile_picture} size="5rem"/>
                                            <div className="name-message">
                                                <h2>{receiver.display_name}</h2>
                                                { lastMessage.user === sender ?
                                                    <p style={{color: "grey",  wordBreak: "break-word" }}>You: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
                                                    :
                                                    <p style={{color: "grey", wordBreak: "break-word" }}>{receiver.display_name}: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
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