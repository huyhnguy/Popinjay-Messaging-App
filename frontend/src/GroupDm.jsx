import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "./Message";
import ProfilePic from "./ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCircleChevronUp, faGear, faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "./FileMessageInput";

export default function GroupDm() {
    const [dm, setDm] = useState(null);
    const [base64Pic, setBase64Pic] = useState(null);
    const [sender, setSender] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState(false);
    const [edit, setEdit] = useState(null);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/groups/' + urlParams.groupId , {
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
            setDm(res.group);
            setSender(res.sender);
            setLoading(false);
            scrollToBottom();
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    useEffect(() => {
        if (newMessage) {
            scrollToBottom();
        }
    }, [newMessage]);

    function scrollToBottom () {
        const messageHistoryDiv = document.querySelector(".message-history");
        messageHistoryDiv.lastChild.scrollIntoView({
            block: "start",
            inline: "nearest",
            behavior: "smooth",
            alignToTop: false
        });
        setNewMessage(false);
    }

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
                image: null
            }
        }

        if (edit) {
            submitEditMessage(edit, dataPackage);

            return
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
            const newDm = dm;
            newDm.history.push(res.new_message);
            setDm(newDm);
            document.getElementById("new-message").value = "";
            setBase64Pic(null);
            setNewMessage(true);
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
        console.log(users);
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

    const handleDeleteMessage = (message) => {
        fetch('http://localhost:3000/api/messages/' + message._id, {
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
                if (res.message === "message successfully deleted") {
                    const newDmHistory= dm.history.filter(element => element != message);
                    const cloneDm = { ...dm }
                    cloneDm.history = newDmHistory;
                    setDm(cloneDm);
                } else {
                    console.log(res);
                }
            })
            .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/login');
                }
            })
    }

    const startEditMessage = (message) => {
        setEdit(message);
        const messageInput = document.getElementById("new-message");

        if (message.content) messageInput.value = message.content;
        if (message.image) setBase64Pic(message.image);
    }

    const submitEditMessage = (oldMessage, newMessageInputs) => {

        fetch('http://localhost:3000/api/messages/' + oldMessage._id, {
            method: 'PUT',
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMessageInputs)
        })
            .then(res => {
                if (res.ok) { 
                    return res.json() 
                }

                const error = new Error(res.message);
                error.code = res.status;
                throw error
                })
            .then(res => {
                if (res.message === "message successfully updated") {
                    const indexOfOldMessage = dm.history.findIndex((element) => element === oldMessage);
                    console.log(oldMessage);
                    console.log(res.updated_message);
                    setDm(prevDm => {
                        const cloneDm = structuredClone(prevDm);
                        cloneDm.history.splice(indexOfOldMessage, 1, res.updated_message);
                        return cloneDm;
                    });
                    document.getElementById("new-message").value = "";
                    setBase64Pic(null);
                    setEdit(null);
                } else {
                    console.log(res);
                }
            })
            .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/login');
                }
            })
    }

    const handleSettings = () => {
        navigate('settings')
    }

    return(
        <>
            { dm &&   
                <div className="dm-page">
                    <div className="group-header">
                        <div className="receiver-container">
                            <ProfilePic imageSrc={dm.profile_picture} size="2.5rem"/>
                            <h1>{dm.display_name != "" ? dm.display_name : displayUsersNamesInGroup(dm.users)}</h1>
                        </div>
                        <button className="group-settings-button" onClick={handleSettings}>
                            <FontAwesomeIcon icon={faGear} style={{height: "2rem"}}/>
                        </button>
                    </div>

                    <main className="message-history" >
                        { 
                            dm.history.map(message => {
                                if (message.user._id === sender) {
                                    return(
                                        <Message key={message._id} info={message} person="sender" deleteMessage={() => {handleDeleteMessage(message)}} editMessage={() => {startEditMessage(message)}}/>
                                    )
                                }
                                return(
                                    <Message key={message._id} info={message} person="group-receiver" />
                                )
                            })
                        }
                    </main>
                    { edit &&
                        <div className="edit-div">
                            <button className="x-button" style={{ position: "static" }} onClick={() => {
                                document.getElementById("new-message").value = "";
                                setBase64Pic(null);
                                setEdit(null)
                                }}>
                                <FontAwesomeIcon icon={faCircleXmark} className="x-icon"/>
                            </button>
                            <p style={{ margin: 0 }}>Editing Message</p>
                        </div>
                    }
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