import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "./Message";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons'

export default function Dm() {
    const {state} = useLocation();
    const { receiver, history } = state;

    const [messageHistory, setMessageHistory] = useState(history);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const messageHistoryDiv = document.querySelector(".message-history");
        messageHistoryDiv.lastChild.scrollIntoView();
    }, [messageHistory])

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(urlParams);
        
        fetch('http://localhost:3000/api/messages/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_message:  document.getElementById("new-message").value,
                conversation_id: urlParams.dmId
            })
          })
        .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
        .then(res => {
            console.log(res);
            setMessageHistory(res.conversation.history);
            document.getElementById("new-message").value = "";
        })
        .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }

    return(
        <div className="dm-page">
            <div className="receiver-container">
                <ProfilePic imageSrc={receiver.profile_picture} size="2.5rem"/>
                <h1>{receiver.display_name}</h1>
            </div>
            <main className="message-history">
                { messageHistory && 
                    messageHistory.map(message => {
                        if (message.user._id === receiver._id) {
                            return(
                                <Message key={message._id} info={message} person="receiver" />
                            )
                        }
                        return(
                            <Message key={message._id} info={message} person="sender" />
                        )
                    })
                }
            </main>
            <form method="POST" className="message-form">
                <input type="text" id="new-message" required className="input" placeholder="Message"/>
                <button type="submit" onClick={handleSubmit} className="submit" style={{ width: "auto", paddingInline: "1.5rem" }}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    )
}