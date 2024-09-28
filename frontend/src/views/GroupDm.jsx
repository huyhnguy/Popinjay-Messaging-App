import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "../components/Message";
import ProfilePic from "../components/ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCircleChevronUp, faGear, faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "../components/FileMessageInput";
import NavBar from "../components/NavBar";

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
        fetch('/api/groups/' + urlParams.groupId , {
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
            setDm(res.group);
            setSender(res.sender);
            setLoading(false);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    useEffect(() => {
        if (newMessage || !loading) {
            scrollToBottom();
        }
    }, [newMessage, loading]);

    function scrollToBottom () {
        const messageHistoryDiv = document.querySelector(".message-history");
        if (messageHistoryDiv.lastChild) {
            messageHistoryDiv.lastChild.scrollIntoView({
                block: "end",
                inline: "nearest",
                behavior: "smooth",
                alignToTop: false
            });
            setNewMessage(false);
        }

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

    const clearUserInputs = () => {
        document.getElementById("new-message").value = "";
        document.getElementById("message-files").value = null;
        setBase64Pic(null);
    }

    const appendNewMessageToForm = () => {
        const image = document.getElementById("message-files").files[0];
        const newMessage = document.getElementById("new-message").value;
        const conversationId = urlParams.groupId;
        const formData = new FormData();

        formData.append("conversation_id", conversationId);
        formData.append("conversation_type", "Group");

        if (image) {
            formData.append("image", image)
        } else {
            formData.append("image", null)
        }

        if (newMessage) {
            formData.append("new_message", newMessage)
        } 

        return formData
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = appendNewMessageToForm();

        if (edit) {
            if (base64Pic && !document.getElementById("message-files").value) formData.append("image_same", true);
            submitEditMessage(edit, formData);

            return
        }
        
        fetch('/api/messages/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            },
            body: formData
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
            clearUserInputs();
            setNewMessage(true);
        })
        .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }

    const handleDelete = () => {
        setBase64Pic(null);
    }

    const displayUsersNamesInGroup = (users) => {
        let names = "";

        for (let i = 0; i < users.length ; i++) {
            if (i === 6) { 
                break 
            }else if (i === 0) {
                names = users[i].display_name;
            } else {
                names = names + ", " + users[i].display_name;
            }
        }
        return names
    }

    const removeMessageOnClient = (message) => {
        const newDmHistory= dm.history.filter(element => element != message);
        const cloneDm = structuredClone(dm)
        cloneDm.history = newDmHistory
        setDm(cloneDm);
    }

    const handleDeleteMessage = (message) => {
        fetch('/api/messages/' + message._id, {
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
                if (res.ok) { 
                    return res.json() 
                }

                const error = new Error(res.message);
                error.code = res.status;
                throw error
                })
            .then(res => {
                if (res.message === "message successfully deleted") {
                    removeMessageOnClient(message);
                    setDm(cloneDm);
                } else {
                    console.log(res);
                }
            })
            .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/');
                }
            })
    }

    const startEditMessage = (message) => {
        setEdit(message);
        const messageInput = document.getElementById("new-message");

        if (message.content) messageInput.value = message.content;
        if (message.image) setBase64Pic(message.image);
    }

    const updateEditedMessageOnClient = (oldMessage, updatedMessage) => {
        const indexOfOldMessage = dm.history.findIndex((element) => element === oldMessage);
        setDm(prevDm => {
            const cloneDm = structuredClone(prevDm);
            cloneDm.history.splice(indexOfOldMessage, 1, updatedMessage);
            return cloneDm;
        });
    }

    const submitEditMessage = (oldMessage, newMessageInputs) => {
        fetch('/api/messages/' + oldMessage._id, {
            method: 'PUT',
            credentials: "include",
            headers: {
                'Accept': 'application/json',
            },
            body: newMessageInputs
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
                    updateEditedMessageOnClient(oldMessage, res.updated_message);
                    clearUserInputs();
                    setEdit(null);
                } else {
                    console.log(res);
                }
            })
            .catch(err => {
                console.log(err);
                if (err.code === 401) {
                    navigate('/');
                }
            })
    }

    const handleSettingsClick = () => {
        navigate('settings')
    }

    return(
        <>
            { dm &&   
                <div className="dm-page">
                    <div className="group-header">
                            <ProfilePic imageSrc={dm.profile_picture} size="2.5rem"/>
                            <h1>{dm.display_name != "" ? dm.display_name : displayUsersNamesInGroup(dm.users)}</h1>
                            <button className="group-settings-button" onClick={handleSettingsClick}>
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
                                    <Message key={message._id} info={message} person="group-receiver" deleteMessage={() => {handleDeleteMessage(message)}} deletePower={ sender === dm.owner || (dm.admins.includes(sender) && dm.admin_permissions.delete_messages) ? true : false } />
                                )
                            })
                        }
                    </main>
                    { edit &&
                        <div className="edit-div">
                            <button className="x-button" style={{ position: "static" }} onClick={() => {
                                clearUserInputs();
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
                    <NavBar active='Groups' />
                </div>
            }
            { loading &&
                <h1>Loading...</h1>
            }
        </>
    )
}