import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";

export default function AddUserPopUp({ groupMembersArray, addUserFunction }) {
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
            const allUsersArray = res;
            for (let i = 0; i < groupMembersArray.length; i++) {
                const index = allUsersArray.findIndex((user) => user._id === groupMembersArray[i]._id);
                allUsersArray.splice(index, 1);
            }
            setUsers(allUsersArray);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    const handleSearch = (e) => {
        let value = e.target.value.toLowerCase();
        
        users.forEach(user => {
          const isVisible = user.display_name.toLowerCase().includes(value);
          const userCard = document.getElementById(`invite-${user._id}`);
          userCard.classList.toggle("hide", !isVisible);
        })
      }

    return(
        <>
            <div className="add-group-container">
                <input type="search" placeholder="Search name" className="user-list-search" style={{ padding: "0.25rem", marginBottom: "1rem", width: "100%" }} onChange={(e) => handleSearch(e)}></input>
                <div className="user-list-invite">
                    { users &&
                        users.map((user) => {
                            return (
                                    <div id={`invite-${user._id}`} key={`${user._id}`} onClick={() => {addUserFunction(user)}}>
                                        <div className="member-card" >
                                            <ProfilePic imageSrc={user.profile_picture} size="4rem"/>
                                            <div className="name-role">
                                                <h2>{user.display_name}</h2>
                                            </div>
                                        </div>
                                        <hr style={{ margin: 0 }}/>
                                    </div>    
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
}