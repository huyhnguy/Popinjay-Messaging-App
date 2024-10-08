import NavBar from "../components/NavBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "../components/ProfilePic";
import UserProfile from "../components/UserProfile";
import { UserType } from "../types";

type ProfilePopUp = string | null
type Users = UserType[] | null

export default function UserTab() {
    const [users, setUsers] = useState<Users>(null);
    const [profilePopUp, setProfilePopUp] = useState<ProfilePopUp>(null);

    const navigate = useNavigate();
    
    useEffect(() => {
        fetch('/api/users', {
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
            setUsers(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])


   
    const handleUser = (user: UserType) => {
      setProfilePopUp(user._id);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.toLowerCase();
      
      users?.forEach(user => {
        const isVisible = user.display_name.toLowerCase().includes(value);
        const userCard = document.getElementById(`${user._id}`);
        userCard?.classList.toggle("hide", !isVisible);
      })
    }

    return(
        <div className="users-page">
          <div className="users-header">
            <h1 style={{ margin: 0 }}>Users</h1>
            <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)}></input>
          </div>

            <div className="flexible-section">
                <div className="users-container">
                { users &&
                    users.map(user => 
                        <div className="user-card" onClick={() => {handleUser(user)}} key={user._id} id= {`${user._id}`}>
                            <ProfilePic imageSrc={user.profile_picture} size="4rem"/>
                            <p >{user.display_name}</p>
                        </div>
                    )
                }
                </div>
            </div>
            { profilePopUp &&
              <>
                <UserProfile userId={profilePopUp} />
                <div className="shadow" onClick={() => {setProfilePopUp(null)}}></div>
              </>
            }
            <NavBar active='Users'/>
        </div>
    )
}