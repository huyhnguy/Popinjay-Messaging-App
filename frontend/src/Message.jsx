import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'

export default function Message({ info, person, deleteMessage }) {

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
                    <img src={info.image} alt="" style={{ height: "200px", borderRadius: "10px" }}/>
                }
                { info.content &&
                    <p className="message" style={{ backgroundColor: "#007BFF" }}>{info.content}</p>
                }
                { formattedDate &&
                    <p className="timestamp">{formattedDate}</p>
                }
                <button className="trash-button" onClick={deleteMessage}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        )
    } else if (person === "receiver") {
        return(
            <div className="message-container">
                { info.image &&
                    <img src={info.image} alt="" style={{ height: "200px", borderRadius: "10px" }}/>
                }
                { info.content &&
                    <p  className="message" style={{ backgroundColor: "#6b6b6b"}}>{info.content}</p>
                }
                { formattedDate &&
                    <p className="timestamp">{formattedDate}</p>
                }
            </div>
        )
    } else {
        return (
            <p className="message" style={{backgroundColor: "red"}}>ERROR</p>
        )
    }

}