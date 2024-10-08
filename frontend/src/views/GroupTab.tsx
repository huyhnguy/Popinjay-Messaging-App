import NavBar from "../components/NavBar";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "../components/ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCirclePlus, faStar} from '@fortawesome/free-solid-svg-icons'
import AddGroup from "../components/AddGroup";
import { ConversationType, NotificationType, UserType } from "../types";

type Action = "completed" | "open" | "close"

type Groups = ConversationType[] | null

type Notifications = NotificationType[] | null

export default function GroupTab() {
    const [groups, setGroups] = useState<Groups>(null);
    const [sender, setSender] = useState(null);
    const [addGroup, setAddGroup] = useState("closed");
    const [notifications, setNotifications] = useState<Notifications>(null);

    const globalChatId = '66ef1677007b15bccb9a1cca';

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('/api/groups', {
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
            console.log(res);
            const groupsArray = res.groups;
            sortByMostRecent(groupsArray);
            setGroups(groupsArray);
            setSender(res.sender)
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    const handleGroup = (group: ConversationType) => {
        const route = `/groups/${group._id}`;
        navigate(route);

        const notification = checkArrayOfNotificationsForGroupId(notifications!, group._id);

        if (notification) {
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
                    navigate('/');
                }
            })
        }
    }

    function sameDay(d1: Date, d2: Date) {
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
        let options: object = {}
        const readableDate = new Date(date);
        const currentDate = new Date();

        if (sameDay(readableDate, currentDate) === true) {
            options = {
                hour: "numeric",
                minute: "numeric",
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate);

            return formattedDate
        } else if (isYesterday(readableDate, currentDate) === true) {
            return "Yesterday"
        }else if (sameDay(readableDate, currentDate) === false) {
            options = {
                month: "numeric",
                day: "numeric",
                year: "2-digit"
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate);

            return formattedDate
        }
    }


    const handleAddGroup = (action: Action) => {
        if (action === "completed") {
            setAddGroup("closed");

            fetch('/api/groups', {
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
                const groupsArray = res.groups;
                sortByMostRecent(groupsArray);
                setGroups(groupsArray);
                setSender(res.sender)
              })
              .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/');
                }
              })

        } else if (action === "open") {
            setAddGroup("open");
        } else if (action === "close") {
            setAddGroup("close");
        }
    }

    const displayUsersNamesInGroup = (users: UserType[]) => {
        let names = "";
        for (let i = 0; i < users.length; i++) {
            if (i === 0) {
                names = users[i].display_name;
            } else {
                names = names + ", " + users[i].display_name;
            }
        }
        return names
    }

    function sortByMostRecent(dms: ConversationType[]) {
        
        dms.sort((a,b) => {
            if (a._id === globalChatId) {
                return -1
            } else if (b._id === globalChatId) {
                return 1
            }else if (!a.history[a.history.length - 1] && !b.history[b.history.length - 1]) {
                return 0
            } else if (!a.history[a.history.length - 1]) {
                return -1
            } else if (!b.history[b.history.length - 1]) {
                return 1
            }

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

        groups?.forEach(group => {
            const isVisible = group.display_name.toLowerCase().includes(value) || group.users.some((user) => user.display_name.toLowerCase().includes(value));
            const groupCard = document.getElementById(`${group._id}`);
            groupCard?.classList.toggle("hide", !isVisible);
        })
    }

    const markUpdatedGroups = (groupNotifications: NotificationType[]) => {
        setNotifications(groupNotifications);
    }

    const checkArrayOfNotificationsForGroupId = (notifications: NotificationType[], groupId: string) => {
        for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].conversation_id === groupId) return notifications[i]
        }

        return false
    }

    return(
        <div className="messages-page" style={{ position: "relative" }}>
            { addGroup === "open" &&
                <AddGroup closePopUp={handleAddGroup} />
            }
            <div className="groups-top-bar">
                <h1 style={{ margin: 0 }}>Groups</h1>
                <input type="search" placeholder="Search group name or user" className="user-list-search" onChange={(e) => handleSearch(e)}></input>
                <button style={{all: "unset"}} onClick={() => {handleAddGroup("open")}}>
                    <FontAwesomeIcon icon={faCirclePlus} className="file-upload-icon" style={{ height: "3rem" }}/>
                </button>
            </div>
            <div className="flexible-section">
                <div className="messages-container">
                        { groups &&
                            groups.map((group) => {
                                const lastMessage = group.history[group.history.length - 1];
                                return (
                                    <div key={group._id} id={`${group._id}`} >
                                        <div className={`message-card ${(notifications && checkArrayOfNotificationsForGroupId(notifications, group._id)) && "new"}`}  onClick={() => {handleGroup(group)}}>
                                            { group._id === globalChatId ?               
                                                <div style={{position: "relative"}}>
                                                    <ProfilePic imageSrc={group.profile_picture} size="5rem" group={true} />
                                                    <FontAwesomeIcon icon={faStar} style={{ height: "2rem", color: "gold", position: "absolute", top: "-5px", right: "-5px" }}/>
                                                </div>
                                                :
                                                <ProfilePic imageSrc={group.profile_picture} size="5rem" group={true} />
                                            }
                                            <div className="name-message">
                                                <h2>{group.display_name != "" ? group.display_name : displayUsersNamesInGroup(group.users)}</h2>

                                                { group.history.length != 0 &&
                                                    <>
                                                        {lastMessage.user._id === sender ?
                                                            <p style={{color: "grey",  wordBreak: "break-word" }}>You: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
                                                            :
                                                            <p style={{color: "grey", wordBreak: "break-word" }}>{lastMessage.user.display_name}: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
                                                        }
                                                    </>
                                                }
                                            </div>
                                            <p style={{ color: "grey", margin: 0 }}>{
                                                group.history.length != 0 && 
                                                    convertDate(lastMessage.createdAt)
                                            }</p>
                                        </div>
                                        <hr style={{ margin: 0 }}/>
                                    </div>
                                )
                            })
                        }
                </div>
            </div>
            <NavBar active='Groups' markUpdatedGroups={markUpdatedGroups}/>
        </div>
    )
}