import Logo from "./Logo"
import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";

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
          .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
          .then(res => {
            console.log(res);
            setUsers(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    const handleDM = (user) => {

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
            navigate(route, { state: {
                receiver: user,
                history: res.dm.history
            } });
          })
          .catch(err => {
            console.log(err);
            navigate('/login');
        })
    }

    return(
        <div className="users-page">
            <h1>Users</h1>
            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="users-container">
                { users &&
                    users.map(user => 
                        <div className="user-card" onClick={() => {handleDM(user)}} key={user._id}>
                            <ProfilePic imageSrc={user.profile_picture} size="5rem"/>
                            <p>{user.display_name}</p>
                        </div>
                    )
                }
                </div>
            </div>
            <NavBar active='Users'/>
        </div>
    )
}