import Logo from "./Logo"
import NavBar from "./NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";
import UserProfile from "./UserProfile";

export default function UserTab() {
    const [users, setUsers] = useState(null);
    const [profilePopUp, setProfilePopUp] = useState(null);

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
            setUsers(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])


   
    const handleUser = (user) => {
      setProfilePopUp(user._id);
    }

    const handleSearch = (e) => {
      let value = e.target.value.toLowerCase();
      
      users.forEach(user => {
        const isVisible = user.display_name.toLowerCase().includes(value);
        const userCard = document.getElementById(`${user._id}`);
        userCard.classList.toggle("hide", !isVisible);
      })
    }

    return(
        <div className="users-page">
          <div className="users-header">
            <h1 style={{ margin: 0 }}>Users</h1>
            <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)}></input>
          </div>

            <div style={{width: "100%", height: "100%", overflow: "scroll"}}>
                <div className="users-container">
                { users &&
                    users.map(user => 
                        <div className="user-card" onClick={() => {handleUser(user)}} key={user._id} id= {`${user._id}`}>
                            <ProfilePic imageSrc={user.profile_picture} size="5rem"/>
                            <p>{user.display_name}</p>
                        </div>
                    )
                }
                </div>
            </div>
            { profilePopUp &&
              <>
                <UserProfile userId={profilePopUp} />
                <div className="shadow" onClick={() => {setProfilePopUp(false)}}></div>
              </>
            }
            <NavBar active='Users'/>
        </div>
    )
}