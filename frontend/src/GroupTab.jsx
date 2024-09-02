import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCirclePlus} from '@fortawesome/free-solid-svg-icons'
import AddGroup from "./AddGroup";

export default function GroupTab() {
    const [groups, setGroups] = useState(null);
    const [sender, setSender] = useState(null);
    const [addGroup, setAddGroup] = useState(false);

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
            console.log(res);
            setGroups(res.groups);
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
        navigate(route, { 
            state: {
                receiver: receiver,
                history: group.history
            } 
        });
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
        const readableDate = new Date(date)
        const formatter = new Intl.DateTimeFormat("en-US", options)
        const formattedDate = formatter.format(readableDate, options)

        return formattedDate;
    }

    const handleAddGroup = () => {
        if (addGroup) {
            setAddGroup(false);
        } else {
            setAddGroup(true);
        }
    }

    return(
        <div className="messages-page" style={{ position: "relative" }}>
            { addGroup &&
                <AddGroup closePopUp={handleAddGroup} />
            }
            <div className="groups-top-bar">
                <h1>Groups</h1>
                <button style={{all: "unset"}} onClick={handleAddGroup}>
                    <FontAwesomeIcon icon={faCirclePlus} className="file-upload-icon" style={{ height: "3rem" }}/>
                </button>
            </div>
            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="messages-container">
                        { groups &&
                            groups.map((group) => {
                                const lastMessage = group.history[group.history.length - 1];
                                return (
                                    <div>
                                        <div className="message-card" key={group._id} onClick={() => {handleGroup(group)}}>
                                            <ProfilePic imageSrc={group.profile_picture} size="5rem"/>
                                            <div className="name-message">
                                                <h2>{group.display_name}</h2>

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