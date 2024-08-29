

export default function Message({ info, person }) {

    if (person === "sender") {
        return(
            <p className="message" style={{ backgroundColor: "#007BFF", alignSelf: "end"}}>{info.content}</p>
        )
    } else if (person === "receiver") {
        return(
            <p  className="message" style={{ backgroundColor: "#6b6b6b"}}>{info.content}</p>
        )
    }

}