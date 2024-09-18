import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'

export default function Message({ info, person, deleteMessage, editMessage, deletePower }) {

    let options = {
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
    }
    const readableDate = new Date(info.createdAt)
    const formatter = new Intl.DateTimeFormat("en-US", options)
    const formattedDate = formatter.format(readableDate, options)

    if (person === "sender") {
        return(
            <div style={{ alignSelf: "end", alignItems: "end" }} className="message-container">
                { info.image &&
                    <img src={info.image} alt="" style={{ height: "200px", borderRadius: "10px" }} loading="lazy"/>
                }
                { info.content &&
                    <p className="message" style={{ backgroundColor: "#007BFF" }}>{info.content}</p>
                }
                { formattedDate &&
                    <p className="timestamp">{formattedDate}</p>
                }
                <section className="message-buttons">
                    <button className="single-message-button" onClick={editMessage}>
                        <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="single-message-button" onClick={deleteMessage}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </section>

            </div>
        )
    } else if (person === "receiver") {
        return(
            <div className="message-container">
                { info.image &&
                    <img src={info.image} alt="" style={{ height: "200px", borderRadius: "10px" }} loading="lazy"/>
                }
                { info.content &&
                    <p  className="message" style={{ backgroundColor: "#6b6b6b"}}>{info.content}</p>
                }
                { formattedDate &&
                    <p className="timestamp">{formattedDate}</p>
                }
            </div>
        )
    } else if (person === "group-receiver") {
        return(
            <div className="message-container">
                <p style={{ margin: 0, fontSize: "0.75rem" }}>{info.user.display_name}</p>
                <div style={{ width: "fit-content", position: "relative"}}>
                    { info.image &&
                        <img src={info.image} alt="" style={{ height: "200px", borderRadius: "10px" }} loading="lazy"/>
                    }
                    { info.content &&
                        <p  className="message" style={{ backgroundColor: "#6b6b6b"}}>{info.content}</p>
                    }
                    { deletePower &&
                        <section className="message-buttons" >
                            <button className="single-message-button" onClick={deleteMessage}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </section>
                    }
                </div>
                { formattedDate &&
                    <p className="timestamp">{formattedDate}</p>
                }
             
            </div>
        )
    }else {
        return (
            <p className="message" style={{backgroundColor: "red"}}>ERROR</p>
        )
    }

}