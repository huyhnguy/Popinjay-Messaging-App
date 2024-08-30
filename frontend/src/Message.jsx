

export default function Message({ info, person }) {

    if (person === "sender") {
        return(
            <div style={{ alignSelf: "end" }} className="message-container">
                { info.image &&
                    <img src={info.image} alt="" style={{ height: "200px", borderRadius: "10px" }}/>
                }
                { info.content &&
                    <p className="message" style={{ backgroundColor: "#007BFF" }}>{info.content}</p>
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
            </div>
        )
    } else {
        return (
            <p className="message" style={{backgroundColor: "red"}}>ERROR</p>
        )
    }

}