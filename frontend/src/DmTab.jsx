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
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setSender(res.sender);
            setDms(res.dms);

          })
    }, [])

    const handleDM = (dm) => {
        const receiver = dm.users.find(user => user != sender);

        const route = `/dms/${dm._id}`;
        navigate(route, { 
            state: {
                receiver: receiver,
                history: dm.history
            } 
        });
    }

    return(
        <>
            <Logo />
                { dms &&
                    dms.map((dm) => {
                        const receiver = dm.users.find(user => user._id != sender);
                        const lastMessage = dm.history[dm.history.length - 1];
                        return (
                            <div className="user-card" key={dm._id} onClick={() => {handleDM(dm)}}>
                                <ProfilePic imageSrc={receiver.profile_picture} size="5rem"/>
                                <p><strong>{receiver.display_name}</strong></p>
                                { lastMessage.user._id === sender ?
                                    <p style={{color: "grey"}}>You: {lastMessage.content}</p>
                                    :
                                    <p style={{color: "grey"}}>{receiver.display_name}: {lastMessage.content}</p>
                                }
                            </div>
                        )
                    })
                }
            <NavBar />
        </>
    )
}