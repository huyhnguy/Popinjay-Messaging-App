import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "./Message";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCircleChevronUp, faGear} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "./FileMessageInput";

export default function GroupDm() {
    const {state} = useLocation();
    const { sender, group } = state;

    const [messageHistory, setMessageHistory] = useState(group.history);
    const [base64Pic, setBase64Pic] = useState(null);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const messageHistoryDiv = document.querySelector(".message-history");
        if (messageHistoryDiv.lastChild) {
            messageHistoryDiv.lastChild.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
                alignToTop: false
              });
        }
    }, [messageHistory]);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file); 
            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];

        const base64 = await convertToBase64(file);
        setBase64Pic(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const image = document.getElementById("image-upload");
        let dataPackage;

        if (image) {
            dataPackage = {
                new_message:  document.getElementById("new-message").value,
                conversation_id: urlParams.groupId,
                image: image.src,
            }
        } else {
            dataPackage = {
                new_message:  document.getElementById("new-message").value,
                conversation_id: urlParams.groupId,
            }
        }
        console.log(dataPackage);
        
        fetch('http://localhost:3000/api/messages/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataPackage)
          })
        .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
        .then(res => {
            setMessageHistory(res.conversation.history);
            document.getElementById("new-message").value = "";
            setBase64Pic(null);
        })
        .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }

    const handleDelete = () => {
        setBase64Pic(null);
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

    const handleDeleteMessage = (info) => {
        console.log(info);
        console.log(urlParams.groupId);
            fetch('http://localhost:3000/api/messages/' + info, {
                method: 'DELETE',
                credentials: "include",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation_id: urlParams.groupId
                })
              })
              .then(res => {
                console.log(res);
                if (res.ok) { 
                    return res.json() 
                }

                const error = new Error(res.message);
                error.code = res.status;
                throw error
              })
              .then(res => {
                console.log(res);
                setMessageHistory(res.conversation.history);
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
            <div className="group-header">
                <div className="receiver-container">
                    <ProfilePic imageSrc={group.profile_picture} size="2.5rem"/>
                    <h1>{group.display_name != "" ? group.display_name : displayUsersNamesInGroup(group.users)}</h1>
                </div>
                <button className="group-settings-button">
                    <FontAwesomeIcon icon={faGear} style={{height: "2rem"}}/>
                </button>
            </div>

            <main className="message-history" >
                { messageHistory && 
                    messageHistory.map(message => {
                        if (message.user._id === sender) {
                            return(
                                <Message key={message._id} info={message} person="sender" deleteMessage={() => {handleDeleteMessage(message._id)}}/>
                            )
                        }
                        return(
                            <Message key={message._id} info={message} person="receiver" />
                        )
                    })
                }
            </main>
            <form method="POST" className="message-form">
                <label htmlFor="message-files" >
                    <FontAwesomeIcon icon={faCircleChevronUp} className="file-upload-icon" style={{ }}/>
                </label>
                <input style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: '0px', height: '0px'}} id="message-files" type="file" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                <div style={{width: "100%"}}>
                { base64Pic &&
                    <FileMessageInput imgSrc={base64Pic} deleteFunction={handleDelete}/>
                }
                    <input type="text" id="new-message" required className="input" placeholder="Message"/>

                </div>
                <button type="submit" onClick={(e) => {handleSubmit(e)}} className="submit" style={{ width: "auto", paddingInline: "1.5rem" }}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    )
}