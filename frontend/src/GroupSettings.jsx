import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faUserGear, faCrown, faCirclePlus, faLock } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate, useParams } from "react-router-dom";
import MemberDropDown from "./MemberDropDown";
import UserProfile from "./UserProfile";
import AddUserPopUp from "./AddUserPopUp";

export default function GroupSettings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [pic, setPic] = useState(null);
    const [adminPermissions, setAdminPermissions] = useState(null);
    const [users, setUsers] = useState(null);
    const [dropDown, setDropDown] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [adminIds, setAdminIds] = useState(null);
    const [masterId, setMasterId] = useState(null);
    const [sender, setSender] = useState(null); 
    const [addUserPopUp, setAddUserPopUp] = useState(false);
    const [scrollToBottomOfMemberList, setScrollToBottomOfMemberList] = useState(false);
    const [errors, setErrors] = useState(null);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/settings`, {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          })
          .then(res => {
            if (res.ok) { return res.json() }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
          })
          .then(res => {
            console.log(res);
            setDisplayName(res.group.display_name);
            setPic(res.group.profile_picture);
            setAdminIds(res.group.admins);
            setMasterId(res.group.master);
            const sortedMembersList = sortMembers(res.group.users, res.group.admins, res.group.master, res.sender)
            console.log(sortedMembersList);
            setUsers(sortedMembersList);
            setAdminPermissions(res.group.admin_permissions);
            setSender(res.sender);

          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }, [])

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file); 
            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setPic(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const checkedBoxesNodeList = document.querySelectorAll('input[name=admin-permissions]:checked');
        const checkedBoxesArray = Array.from(checkedBoxesNodeList);
        const checkedBoxes = checkedBoxesArray.map((element) => element.value);

        console.log(checkedBoxes);
        
        const newDisplayName = document.getElementById("display-name").value;

        const formData = new FormData();
        formData.append("display_name", newDisplayName);

        //formData.append('admin_permissions', checkedBoxes);
        if (checkedBoxes.length > 0) {
            for (let i = 0; i < checkedBoxes.length; i++) {
                formData.append(`admin_permissions[${i}]`, checkedBoxes[i]);
              }
        } else {
                formData.append(`admin_permissions`, checkedBoxes);
        }


        if (!pic && !document.getElementById("profile-picture").files[0]) {
            // no previous picture and no picturer uploaded
            formData.append("profile_picture", null);
            formData.append("picture_status", "delete")
        } else if (pic && document.getElementById("profile-picture").files[0]) { 
            //if the user doesn't have a picture yet and they upload a picture
            const profilePic = document.getElementById("profile-picture").files[0];
            formData.append("profile_picture", profilePic);
        } else if (pic && !document.getElementById("profile-picture").files[0]) {
            //if the user does have a picture and they dont upload any picture, dont do anything
            formData.append("profile_picture", null);
        }

        console.log([...formData])
        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/settings`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                const displayNameErrors = res.errors.filter(error => error.path === "display_name");
                setErrors({
                    display_name: displayNameErrors[0],
                })
            } else {
                console.log(res);
                alert(res.message);
                setErrors(null);
            }
          })
          .catch(err => {
            console.log(err);
        })

    }

    const handleDropdown = (userId) => {
        console.log(document.getElementById(`${userId}-dropdown`));
        const currentDropdown = document.getElementById(`${userId}-dropdown`);
        
        if (currentDropdown.classList.contains('invisible')) {
            currentDropdown.classList.remove('invisible');
            if (dropDown) {
                const previousDropDown = document.getElementById(`${dropDown}-dropdown`);
                previousDropDown.classList.add('invisible');
            }
            setDropDown(userId)
        } 
    }

    const closeDropDown = () => {
        const previousDropDown = document.getElementById(`${dropDown}-dropdown`);
        previousDropDown.classList.add('invisible');
        setDropDown(null);
    }

    const openUserProfile = (e, userId) => {
        e.preventDefault();
        setUserProfile(userId);
        closeDropDown();
    }

    const handleDeleteGroup = (e) => {
        e.preventDefault();

        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/settings`, {
            method: 'DELETE',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            }
          })
          .then(res => res.json())
          .then(res => {
            if (res.error) {
                console.log(res.error);
            } else {
                console.log(res);
                alert(res.message);
                navigate('/groups');
            }
          })
          .catch(err => {
            console.log(err);
        })
    }

    const kickUser = (e, userId) => {
        e.preventDefault();

        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/users/${userId}`, {
            method: 'DELETE',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                console.log(res.errors);
            } else {
                console.log(res);
                const newUsersArray = users.filter(user => user._id != userId);
                closeDropDown();
                setUsers(newUsersArray);

            }
          })
          .catch(err => {
            console.log(err);
        })

    }

    const adminUser = (e, userId, action) => {
        e.preventDefault();
        if (action === "Make admin") {
            fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/users/${userId}`, {
                method: 'PUT',
                credentials: "include",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "Make admin"
                })
              })
              .then(res => res.json())
              .then(res => {
                if (res.errors) {
                    console.log(res.errors);
                } else {
                    console.log(res);
                    closeDropDown();
                    setAdminIds([...adminIds, userId])
                }
              })
              .catch(err => {
                console.log(err);
            })
        } else if (action === "Remove admin") {
            fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/users/${userId}`, {
                method: 'PUT',
                credentials: "include",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: "Remove admin"
                })
              })
              .then(res => res.json())
              .then(res => {
                if (res.errors) {
                    console.log(res.errors);
                } else {
                    console.log(res);
                    closeDropDown();
                    const indexOfAdmin = adminIds.indexOf(userId);
                    console.log(`index ${indexOfAdmin}`)
                    const newAdminIds = adminIds.toSpliced(indexOfAdmin, 1);
                    console.log(`newAdminIds ${newAdminIds}`)
                    setAdminIds(newAdminIds);
                }
              })
              .catch(err => {
                console.log(err);
            })
        } else {
            console.log("error, no action received");
        }
    }

    const masterUser = (e, userId) => {
        e.preventDefault();

        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/users/${userId}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: "Make master"
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                console.log(res.errors);
            } else {
                console.log(res);
                setMasterId(userId);
                closeDropDown();
            }
          })
          .catch(err => {
            console.log(err);
        })
    }

    function sortMembers(usersArray, adminsArray, master, sender) {
        console.log(sender);
        usersArray.sort((a,b) => {
            if (a._id === sender) {
                return -1
            } else if (b._id === sender) {
                return 1
            } else if (a._id === master) { 
                return -1
            } else if (b._id === master) {
                return 1
            } else if (adminsArray.includes(a._id) && !adminsArray.includes(b._id)) {
                return -1
            } else if (!adminsArray.includes(a._id) && adminsArray.includes(b._id)) {
                return 1
            } else {
                return 0
            }
        })
        
        return usersArray
    }

    function sortNewMember(membersArray, newMemberId) {
        membersArray.sort((a,b) => {
            if (a._id === newMemberId) {
                return 1
            } else if (b._id === newMemberId) {
                return -1
            } else {
                return 0
            }
        })

        return membersArray
    }

    const handleSearch = (e) => {
        let value = e.target.value.toLowerCase();
        
        users.forEach(user => {
          const isVisible = user.display_name.toLowerCase().includes(value);
          const userCard = document.getElementById(`${user._id}`);
          userCard.classList.toggle("hide", !isVisible);
        })
      }

    const handleAddUserPopUp = (e) => {
        e.preventDefault();

        if (!addUserPopUp) {
            setAddUserPopUp(true);
        } else {
            setAddUserPopUp(false);
        }
    }

    const addUserToGroup = (user) => {
        fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/users/${user._id}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: "Add user"
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                console.log(res.errors);
            } else {
                console.log(res);
                const newMembersList = [...users, user]
                const sortedNewMembersList = sortNewMember(newMembersList, user._id);
                setUsers(sortedNewMembersList);
                setAddUserPopUp(false);
                setScrollToBottomOfMemberList(true)
            }
          })
          .catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        if (scrollToBottomOfMemberList) {
            scrollToBottom();
            setScrollToBottomOfMemberList(false);
        }
    }, [scrollToBottomOfMemberList]);

    function scrollToBottom () {
        
        const membersDiv = document.querySelector(".members-container");
        if (users) {
            membersDiv.lastChild.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
                alignToTop: false
            });
        }

    }

    const handleLeaveGroup = (e) => {
        e.preventDefault();

        if (sender === masterId) {
            alert("You must give the master role to someone else before leaving")
        } else {
            fetch(`http://localhost:3000/api/groups/${urlParams.groupId}/users/${sender}`, {
                method: 'DELETE',
                credentials: "include",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
              })
              .then(res => res.json())
              .then(res => {
                if (res.errors) {
                    console.log(res.errors);
                } else {
                    console.log(res);
                    navigate('/groups');
                }
              })
              .catch(err => {
                console.log(err);
            })
        }
    } 

    return(
        <div className="settings-page">
            { dropDown &&
                <div style={{ height: "100vh", width: "100vw", position: "absolute", zIndex: "98",}} onClick={closeDropDown}></div>
            }
            { userProfile || addUserPopUp &&
                <>
                    <div className="shadow" onClick={() => {
                        setUserProfile(null);
                        setAddUserPopUp(false);
                        closeDropDown();
                        }}></div>
                </>
            }
            { userProfile &&
                <UserProfile userId={userProfile} />
            }
            {addUserPopUp &&
                <AddUserPopUp groupMembersArray={users} addUserFunction={addUserToGroup}/>
            }
            <div className="settings-container">
                <div className="settings-card">
                    <h1 style={{margin: "0 0 1rem 0"}}>Group Settings</h1>
                    <form action="" method="PUT">
                        <div className="form-section">
                            <div style={{position: "relative"}} className="pic-container-x">
                                { pic ?
                                    <>
                                        <label htmlFor="profile-picture" style={{ cursor: sender === masterId && "pointer" }}>
                                            <ProfilePic imageSrc={pic} size="10rem"/>
                                        </label>
                                        { sender === masterId &&
                                            <button className="x-button-pfp" onClick={(e) => {
                                                e.preventDefault();
                                                setPic(null);
                                            }}>
                                                <FontAwesomeIcon icon={faCircleXmark} className="x-icon" style={{height: "3rem"}}/>
                                            </button>
                                        }
                                    </>
                                    :
                                    <label htmlFor="profile-picture" style={{ cursor: sender === masterId && "pointer" }}>
                                        <ProfilePic size="10rem"/>
                                    </label>
                                }
                            </div>
                            <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>
                                {sender != masterId && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Profile Picture 
                            </label>
                            <input style={{ cursor: sender === masterId && "pointer", color: "grey" }} className="input" type="file" id="profile-picture" name="profile-picture" accept="image/*" defaultValue={ pic && pic } onChange={(e) => {handleFileUpload(e)}} disabled={sender != masterId  ? true : false}/>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">
                                {sender != masterId && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Display Name
                            </label>
                            <div className="input-containers">
                                <input className="input" id="display-name" type="text" defaultValue={displayName} style={{ cursor: sender === masterId && "pointer", borderColor: errors && errors.display_name && "red", color: sender != masterId && "grey"}} disabled={sender != masterId  ? true : false}/>
                                { errors && errors.display_name &&
                                    <p className="error-message">{errors.display_name.msg}</p>
                                }
                            </div>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <p style={{ margin: 0 }}>
                                {sender != masterId && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Admin Permissions
                            </p>
                            { adminPermissions &&
                                <div className="form-section-container" style={{ backgroundColor: sender != masterId && "light-dark(rgba(239, 239, 239, 0.3), rgba(59, 59, 59, 0.3))", color: sender != masterId && "grey"}}>
                                    <div className="checkbox-container">
                                        <label htmlFor="delete-messages">Can delete messages</label>
                                        <input  id="delete-messages" name="admin-permissions" value="delete-messages" type="checkbox" defaultChecked= {adminPermissions.delete_messages ? true : false} disabled={sender != masterId  ? true : false} />
                                    </div>
                                    <div className="checkbox-container">
                                        <label htmlFor="invite-users">Can invite users</label>
                                        <input  id="invite-users" name="admin-permissions" value="invite-users" type="checkbox" defaultChecked= {adminPermissions.invite_users ? true : false} disabled={sender != masterId  ? true : false} />
                                    </div>
                                    <div className="checkbox-container">
                                        <label htmlFor="kick-users">Can kick users</label>
                                        <input  id="kick-users" name="admin-permissions" value="kick-users" type="checkbox" defaultChecked= {adminPermissions.kick_users ? true : false} disabled={sender != masterId  ? true : false} />
                                    </div>
                                </div>
                            }

                        </div>
                        <button className="submit" onClick={handleSubmit} style={{ backgroundColor: sender != masterId && "grey", pointerEvents: sender != masterId && "none" }}>Save</button>
                        <div className="form-section" style={{ alignItems: "start" , position: "relative"}}>
                            <div className="users-header" style={{ margin: 0, width: "100%" }}>
                                <p style={{ margin: 0 }}>Members</p>
                                <input type="search" placeholder="Search name" className="user-list-search" style={{ padding: "0.25rem" }}onChange={(e) => handleSearch(e)}></input>
                            </div>
                            <div className="members-container">
                                { users &&
                                    users.map((user) => {
                                        return (
                                            <div id={`${user._id}`}key={user._id} style={{position: "relative", pointerEvents: sender === user._id && "none"}} onClick={() => {handleDropdown(user._id)}}>
                                                <div>
                                                    <div className="member-card" >
                                                        <ProfilePic imageSrc={user.profile_picture} size="4rem"/>
                                                        <div className="name-role">
                                                            <h2>{sender === user._id ? "You" : user.display_name}</h2>
                                                            { adminIds.includes(user._id) && 
                                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center"}}>
                                                                    <FontAwesomeIcon icon={faUserGear} style={{color: "#007BFF", height: "1.5rem"}}/>
                                                                    <p style={{margin: 0}}>Admin</p>
                                                                </div>
                                                            }
                                                            { masterId === user._id &&
                                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center"}}>
                                                                    <FontAwesomeIcon icon={faCrown} style={{color: "gold", height: "1.5rem"}}/>
                                                                    <p style={{margin: 0}}>Master</p>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                    <hr style={{ margin: 0 }}/>
                                                </div>
                                                { sender === masterId &&
                                                    <MemberDropDown 
                                                        user={user} 
                                                        profileFunction={openUserProfile} 
                                                        kickFunction={kickUser} 
                                                        adminFunction={adminUser} 
                                                        admin={adminIds.includes(user._id) ? true : false}
                                                        masterFunction={masterUser}
                                                    />
                                                }
                                                { adminIds.includes(sender) && adminPermissions.kick_users &&
                                                    <MemberDropDown 
                                                        user={user} 
                                                        profileFunction={openUserProfile} 
                                                        kickFunction={kickUser} 
                                                    />
                                                }
                                                { (sender != masterId && !adminIds.includes(sender) || 
                                                adminIds.includes(sender) && !adminPermissions.kick_users) &&
                                                    <MemberDropDown 
                                                        user={user} 
                                                        profileFunction={openUserProfile} 
                                                    />
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            { (sender === masterId || adminIds.includes(sender) && adminPermissions.invite_users) &&
                                <button className="add-user-button" onClick={(e) => {handleAddUserPopUp(e)}}>
                                    <FontAwesomeIcon icon={faCirclePlus} className="file-upload-icon" style={{ height: "3rem" }}/>
                                </button>
                            }
                        </div>
                        { sender === masterId &&
                            <button className="submit" style={{backgroundColor: "red"}} onClick={(e) => {handleDeleteGroup(e)}} >Delete Group</button>
                        }
                        <button className="submit" style={{backgroundColor: "red"}}onClick={(e) => {handleLeaveGroup(e)}} >Leave Group</button>
                    </form>
                </div>
            </div>
            <NavBar active='Groups' />
        </div>
    )
}