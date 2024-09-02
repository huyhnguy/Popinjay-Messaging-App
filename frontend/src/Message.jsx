export default function Message({ info, person }) {

    let options = {
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        year: "numeric"
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