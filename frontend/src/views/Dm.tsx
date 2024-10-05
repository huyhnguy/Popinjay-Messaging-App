import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import Message from "../components/Message";
import ProfilePic from "../components/ProfilePic";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPaperPlane, faCircleChevronUp, faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import FileMessageInput from "../components/FileMessageInput";
import UserProfile from "../components/UserProfile";
import NavBar from "../components/NavBar";
import { MessageType, ConversationType } from "../types";

type Base64 = string | null;
type Dm = ConversationType| null
type Edit = MessageType | null
type ProfilePopUp = string | false;

export default function Dm() {
    const [dm, setDm] = useState<Dm>(null);
    const [base64Pic, setBase64Pic] = useState<Base64>(null);
    const [sender, setSender] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState(false);
    const [edit, setEdit] = useState<Edit>(null);
    const [profilePopUp, setProfilePopUp] = useState<ProfilePopUp>(false);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/dms/' + urlParams.dmId , {
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
            console.log(res);
            setDm(res.dm);
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
        messageHistoryDiv?.lastElementChild?.scrollIntoView({
            block: "nearest",
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

    const appendNewMessageToForm = () => {
        const formData = new FormData();

        const imageArray = (document.getElementById("message-files") as HTMLInputElement).files
        if (imageArray) {
            const image = imageArray[0];
            if (image) {
                formData.append("image", image)
            } else {
                formData.append("image", null!)
            }
        }

        const newMessage = (document.getElementById("new-message") as HTMLInputElement).value;
        const conversationId = urlParams.dmId;

        if (conversationId) {
            formData.append("conversation_id", conversationId);
        }

        if (newMessage) {
            formData.append("new_message", newMessage)
        } 

        return formData
    }

    const clearUserInputs = () => {
        (document.getElementById("new-message") as HTMLInputElement).value = "";
        (document.getElementById("message-files") as HTMLInputElement).value = "";
        setBase64Pic(null);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();

        const formData = appendNewMessageToForm();

        if (edit) {
            if (base64Pic && !(document.getElementById("message-files") as HTMLInputElement).files) 
                formData.append("image_same", "true");
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

    const handleDeletePictureInput = () => {
        setBase64Pic(null);
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
                conversation_id: urlParams.dmId
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
                    removeMessageOnClient(message)
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

    return(
        < >
            { profilePopUp &&
              <>
                <UserProfile userId={profilePopUp} messageButton={false}/>
                <div className="shadow" onClick={() => {setProfilePopUp(false)}}></div>
              </>
            }
            { dm &&
                <div className="dm-page" onKeyDown={(e) => {handleKeyDown(e)}}>
                        <div className="receiver-container" style={{ cursor: "pointer" }}onClick={() => {setProfilePopUp(dm.users[0]._id)}}>
                            <ProfilePic imageSrc={dm.users[0].profile_picture} size="2.5rem"/>
                            <h1>{dm.users[0].display_name}</h1>
                        </div>
                    <main className="message-history">
                        {   
                            dm.history.map(message => {
                                if (message.user._id === dm.users[0]._id) {
                                    return(
                                        <Message key={message._id} info={message} person="receiver" />
                                    )
                                } else if (message.user._id === sender) {
                                    return(
                                        <Message key={message._id} info={message} person="sender" deleteMessage={() => {handleDeleteMessage(message)}} editMessage={() => {startEditMessage(message)}}/>
                                    )
                                } else {
                                    return(
                                        <Message key={message._id} info={message}/>
                                    )
                                }
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
                    <form method="POST" className="message-form" onSubmit={(e) => {handleSubmit(e)}}>
                        <label htmlFor="message-files" >
                            <FontAwesomeIcon icon={faCircleChevronUp} className="file-upload-icon" style={{ }}/>
                        </label>
                        <input style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: '0px', height: '0px'}} id="message-files" type="file" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                        <div style={{width: "100%"}}>
                        { base64Pic &&
                            <FileMessageInput imgSrc={base64Pic} deleteFunction={handleDeletePictureInput} />
                        }
                            <input type="text" id="new-message" required className="input" placeholder="Message"/>

                        </div>
                        <button className="submit" onClick={(e) => {handleSubmit(e)}} style={{ width: "auto", paddingInline: "1.5rem" }}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </form>
                    <NavBar active='Messages' />
                </div>
            }
            { loading &&
                <h1>Loading...</h1>
            }


        </>

    )
}