import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "../components/Message";
import ProfilePic from "../components/ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCircleChevronUp, faGear, faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "../components/FileMessageInput";
import NavBar from "../components/NavBar";
import { ConversationType, MessageType, UserType } from "../types";

type Base64 = string | null
type Dm = ConversationType | null
type Edit = MessageType | null
type Sender = string | null

export default function GroupDm() {
    const [dm, setDm] = useState<Dm>(null);
    const [base64Pic, setBase64Pic] = useState<Base64>(null);
    const [sender, setSender] = useState<Sender>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState(false);
    const [edit, setEdit] = useState<Edit>(null);

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
            throw Error
          })
          .then(res => {
            setDm(res.group);
            setSender(res.sender);
            setLoading(false);
          })
          .catch(err => {
            console.log(err);
            console.log(err.code);
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
            messageHistoryDiv?.lastElementChild?.scrollIntoView({
                block: "end",
                inline: "nearest",
                behavior: "smooth",
            });
            setNewMessage(false);

    }

    const convertToBase64 = (file: File) => {
        const base64String = new Promise<string>((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file); 
            fileReader.onload = () => {
                if (typeof fileReader.result === 'string')
                    resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
        return base64String
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const base64 = await convertToBase64(file);
        setBase64Pic(base64);
    }

    const clearUserInputs = () => {
        (document.getElementById("new-message") as HTMLInputElement).value = "";
        (document.getElementById("message-files") as HTMLInputElement).value = "";
        setBase64Pic(null);
    }

    const appendNewMessageToForm = () => {
        const formData = new FormData();

        const imageArray = (document.getElementById("message-files") as HTMLInputElement).files;
        const newMessage = (document.getElementById("new-message") as HTMLInputElement).value;
        const conversationId = urlParams.groupId;

        if (!imageArray![0] && !newMessage) {
            return undefined
        }

        if (imageArray) {
            const image = imageArray[0];
            if (image) {
                formData.append("image", image)
            } else {
                formData.append("image", null!)
            }
        }

        formData.append("conversation_id", conversationId!);
        
        formData.append("new_message", newMessage)
        
        console.log(...formData)
        return formData
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();

        const formData = appendNewMessageToForm();

        if (edit) {
            if (base64Pic && !(document.getElementById("message-files") as HTMLInputElement).files) 
                formData!.append("image_same", "true");
                submitEditMessage(edit, formData!);
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
            throw Error
          })
        .then(res => {
            const newDm = dm;
            newDm?.history.push(res.new_message);
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

    const displayUsersNamesInGroup = (users: UserType[]) => {
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

    const removeMessageOnClient = (message: MessageType) => {
        const newDmHistory: MessageType[] = dm!.history.filter(element => element != message);
        const cloneDm = structuredClone(dm)
        cloneDm!.history = newDmHistory
        setDm(cloneDm);
    }

    const handleDeleteMessage = (message: MessageType) => {
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

                throw Error
                })
            .then(res => {
                if (res.message === "message successfully deleted") {
                    removeMessageOnClient(message);
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

    const startEditMessage = (message: MessageType) => {
        setEdit(message);
        const messageInput = document.getElementById("new-message") as HTMLInputElement;
        if (message.content) messageInput.value = message.content;
        if (message.image) setBase64Pic(message.image);
    }

    const updateEditedMessageOnClient = (oldMessage: MessageType, updatedMessage: MessageType) => {
        const indexOfOldMessage = dm?.history.findIndex((element) => element === oldMessage);
        if (indexOfOldMessage) {
            setDm(prevDm => {
                const cloneDm = structuredClone(prevDm);
                cloneDm?.history.splice(indexOfOldMessage, 1, updatedMessage);
                return cloneDm;
            });
        }
    }

    const submitEditMessage = (oldMessage: MessageType, newMessageInputs: FormData) => {
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
                throw Error
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement> ) => {
        if (e.key === 'Enter') {
          handleSubmit(e)
        }
      }

    const handleSettingsClick = () => {
        navigate('settings')
    }

    return(
        <>
            { dm &&   
                <div className="dm-page" onKeyDown={(e) => {handleKeyDown(e)}}>
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
                                    <Message key={message._id} info={message} person="group-receiver" deleteMessage={() => {handleDeleteMessage(message)}} deletePower={ sender === dm.owner || (dm.admins.includes(sender!) && dm.admin_permissions.delete_messages) ? true : false } />
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