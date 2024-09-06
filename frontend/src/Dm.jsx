import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCircleChevronUp} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "./FileMessageInput";

export default function Dm() {
    const [dm, setDm] = useState(null);
    const [base64Pic, setBase64Pic] = useState(null);
    const [sender, setSender] = useState(null);
    const [loading, setLoading] = useState(true);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/dms/' + urlParams.dmId , {
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
            console.log(res.dm);
            setDm(res.dm);
            setSender(res.sender);
            setLoading(false);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    useEffect(() => {
        if (dm) {
            const messageHistoryDiv = document.querySelector(".message-history");
            messageHistoryDiv.lastChild.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
                alignToTop: false
            });
        }
    }, [dm]);

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
                conversation_id: urlParams.dmId,
                image: image.src,
            }
        } else {
            dataPackage = {
                new_message:  document.getElementById("new-message").value,
                conversation_id: urlParams.dmId,
            }
        }
        
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
            setDm(res.conversation);
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

    const handleDeleteMessage = (info) => {
        fetch('http://localhost:3000/api/messages/' + info, {
            method: 'DELETE',
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: urlParams.dmId
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
            setDm(res.conversation);
            })
            .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }

    return(
        <>
            { dm &&
                <div className="dm-page">
                        <div className="receiver-container">
                            <ProfilePic imageSrc={dm.users[0].profile_picture} size="2.5rem"/>
                            <h1>{dm.users[0].display_name}</h1>
                        </div>
                    <main className="message-history">
                        {
                            dm.history.map(message => {
                                if (message.user === dm.users[0]._id) {
                                    return(
                                        <Message key={message._id} info={message} person="receiver" />
                                    )
                                } else if (message.user === sender) {
                                    return(
                                        <Message key={message._id} info={message} person="sender" deleteMessage={() => {handleDeleteMessage(message._id)}}/>
                                    )
                                } else {
                                    return(
                                        <Message key={message._id} info={message}/>
                                    )
                                }
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
            }
            { loading &&
                <h1>Loading...</h1>
            }
        </>

    )
}