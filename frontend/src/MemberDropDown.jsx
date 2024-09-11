import { useNavigate } from "react-router-dom";

export default function MemberDropDown({ user, profileFunction }) {
    const navigate = useNavigate();

    const handleMessage = (e) => {
        e.preventDefault();


        fetch('http://localhost:3000/api/dms/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                other_user_id: user._id
            })
          })
          .then(res => res.json())
          .then(res => {
            const route = `/dms/${res.dm._id}`;
            navigate(route);
          })
          .catch(err => {
            console.log(err);
        })
    }

    return (
        <>
            <div id={`${user._id}-dropdown`} className="member-button-container invisible">
                <button onClick={(e) => {handleMessage(e)}} className="member-button">Message</button>
                <button onClick={(e) => {profileFunction(e, user._id)}} className="member-button">View Profile</button>
                <button className="member-button">Make admin</button>
                <button className="member-button-red">Kick from group</button>
            </div>
        </>


    )
}