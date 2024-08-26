import Logo from "./Logo"
import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

export default function UserTab() {
    const [users, setUsers] = useState(null);

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('http://localhost:3000/api/users', {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setUsers(res);
          })
    }, [])

    const handleDM = (e) => {
        const otherUser = users.find(user => user.display_name === e.target.textContent);
        console.log(otherUser._id);

        fetch('http://localhost:3000/api/dms/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                other_user_id: otherUser._id
            })
          })
          .then(res => res.json())
          .then(res => {
            const route = `/dms/${res.dm._id}`;
            navigate(route, { state: {
                receiver: e.target.textContent,
                history: res.dm.history
            } });
          })
    }

    return(
        <>
            <Logo />
                { users &&
                    users.map(user => 
                        <div onClick={handleDM} key={user._id}>
                            {user.display_name}
                        </div>
                    )
                }
            <NavBar />
        </>
    )
}