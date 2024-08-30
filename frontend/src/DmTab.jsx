import Logo from "./Logo"
import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";

export default function DmTab() {
    const [dms, setDms] = useState(null);
    const [sender, setSender] = useState(null);

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
            console.log(res);
            setSender(res.sender);
            setDms(res.dms);

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
    }

    return(
        <div className="messages-page">
            <h1>Messages</h1>
            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="messages-container">
                        { dms &&
                            dms.map((dm) => {
                                const receiver = dm.users.find(user => user._id != sender);
                                const lastMessage = dm.history[dm.history.length - 1];
                                return (
                                    <div className="message-card" key={dm._id} onClick={() => {handleDM(dm)}}>
                                        <div className="profile-container">
                                            <ProfilePic imageSrc={receiver.profile_picture} size="5rem"/>
                                            <p><strong>{receiver.display_name}</strong></p>
                                        </div>
                                        { lastMessage.user._id === sender ?
                                            <p style={{color: "grey"}}>You: {lastMessage.image ? <i>sent an image</i> : lastMessage.content}</p>
                                            :
                                            <p style={{color: "grey"}}>{receiver.display_name}: {lastMessage.content}</p>
                                        }
                                    </div>
                                )
                            })
                        }
                </div>
            </div>
            <NavBar active='Messages'/>
        </div>
    )
}