import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";

type UserArray = { _id: string, display_name: string, profile_picture?: string }[] 

export default function AddUserPopUp({ groupMembersArray, addUserFunction }: { groupMembersArray: UserArray, addUserFunction: (user: object) => void }) {
    const [users, setUsers] = useState<UserArray>([]);
    
    const navigate = useNavigate();

    const removeGroupMembersFromUsersArray = (usersArray: UserArray) => {
        
        for (let i = 0; i < groupMembersArray.length; i++) {
            const index = usersArray.findIndex((user) => user._id === groupMembersArray[i]._id);
            usersArray.splice(index, 1);
        }
    }
    
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
            const allUsersArray = res;
            removeGroupMembersFromUsersArray(allUsersArray);
            setUsers(allUsersArray);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })    }, [])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toLowerCase();
        
        users.forEach(user => {
          const isVisible = user.display_name.toLowerCase().includes(value);
          const userCard = document.getElementById(`invite-${user._id}`);
          userCard?.classList.toggle("hide", !isVisible);
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