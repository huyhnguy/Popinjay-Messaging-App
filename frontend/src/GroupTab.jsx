import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCirclePlus, faStar} from '@fortawesome/free-solid-svg-icons'
import AddGroup from "./AddGroup";

export default function GroupTab() {
    const [groups, setGroups] = useState(null);
    const [sender, setSender] = useState(null);
    const [addGroup, setAddGroup] = useState("closed");

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('http://localhost:3000/api/groups', {
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
            const groupsArray = res.groups;
            sortByMostRecent(groupsArray);
            setGroups(groupsArray);
            setSender(res.sender)
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    const handleGroup = (group) => {
        const route = `/groups/${group._id}`;
        navigate(route);
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
        let options = {
            month: "short",
            day: "numeric",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
            year: "numeric"
        }
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
        }else if (sameDay(readableDate, currentDate) === false) {
            let options = {
                month: "numeric",
                day: "numeric",
                year: "numeric"
            }
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const formattedDate = formatter.format(readableDate, options);

            return formattedDate
        }
    }

    const handleAddGroup = (action) => {
        if (action === "completed") {
            setAddGroup("closed");

            fetch('http://localhost:3000/api/groups', {
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
                const groupsArray = res.groups;
                sortByMostRecent(groupsArray);
                setGroups(groupsArray);
                setSender(res.sender)
              })
              .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/login');
                }
              })

        } else if (action === "open") {
            setAddGroup("open");
        } else if (action === "close") {
            setAddGroup("close");
        }
    }

    const displayUsersNamesInGroup = (users) => {
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

    function sortByMostRecent(dms) {
        dms.sort((a,b) => {
            if (a._id === '66d7d2fead84fa8a36bea088') {
                return -1
            } else if (b._id === '66d7d2fead84fa8a36bea088') {
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
            const convertedADate = new Date(aLastMessageDate);
            const convertedBDate = new Date(bLastMessageDate);

            return convertedBDate - convertedADate;
        })
        
        return dms
    }

    return(
        <div className="messages-page" style={{ position: "relative" }}>
            { addGroup === "open" &&
                <AddGroup closePopUp={handleAddGroup} />
            }
            <div className="groups-top-bar">
                <h1>Groups</h1>
                <button style={{all: "unset"}} onClick={() => {handleAddGroup("open")}}>
                    <FontAwesomeIcon icon={faCirclePlus} className="file-upload-icon" style={{ height: "3rem" }}/>
                </button>
            </div>
            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="messages-container">
                        { groups &&
                            groups.map((group) => {
                                const lastMessage = group.history[group.history.length - 1];
                                return (
                                    <div key={group._id}>
                                        <div className="message-card"  onClick={() => {handleGroup(group)}}>
                                            { group._id === '66d7d2fead84fa8a36bea088' ?               
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
            <NavBar active='Groups'/>
        </div>
    )
}