import { useLocation, useParams } from "react-router-dom"
import { useState } from "react";
import Message from "./Message";

export default function Dm() {
    const {state} = useLocation();
    const { receiver, history } = state;

    const [messageHistory, setMessageHistory] = useState(history);

    const urlParams = useParams();

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
                new_message: document.getElementById("new-message").value,
                conversation_id: urlParams.dmId
            })
          })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            setMessageHistory(res.conversation.history);
        })
    }

    return(
        <>
            <h1>{receiver}</h1>
            <main>
                { messageHistory && 
                    messageHistory.map(message => <Message info={message} />)
                }
            </main>
            <form method="POST" className="message-form">
                <input type="text" id="new-message" required/>
                <button type="submit" onClick={handleSubmit}>Submit</button>
            </form>
        </>
    )
}