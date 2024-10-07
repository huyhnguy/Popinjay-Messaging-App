import NavBar from "../components/NavBar";
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faUserGear, faCrown, faCirclePlus, faLock } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "../components/ProfilePic";
import { useNavigate, useParams } from "react-router-dom";
import MemberDropDown from "../components/MemberDropDown";
import UserProfile from "../components/UserProfile";
import AddUserPopUp from "../components/AddUserPopUp";
import { UserType } from "../types";

type AdminAction = "Make admin" | "Remove admin";
type Errors = {
    display_name?: {
        msg: string
    }
} | null

type StringOrNull = string | null
type Users = UserType[] | null
type AdminIds = string[] | null
type AdminPermissions = {
    delete_messages?: boolean,
    invite_users?: boolean,
    kick_users?: boolean,
} | null



export default function GroupSettings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [pic, setPic] = useState<StringOrNull>(null);
    const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>(null);
    const [users, setUsers] = useState<Users>(null);
    const [dropDown, setDropDown] = useState<StringOrNull>(null);
    const [userProfile, setUserProfile] = useState<StringOrNull>(null);
    const [adminIds, setAdminIds] = useState<AdminIds>(null);
    const [ownerId, setOwnerId] = useState<StringOrNull>(null);
    const [sender, setSender] = useState<StringOrNull>(null); 
    const [addUserPopUp, setAddUserPopUp] = useState(false);
    const [scrollToBottomOfMemberList, setScrollToBottomOfMemberList] = useState(false);
    const [errors, setErrors] = useState<Errors>(null);

    const urlParams = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/api/groups/${urlParams.groupId}/settings`, {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          })
          .then(res => {
            if (res.ok) { return res.json() }
            throw Error
          })
          .then(res => {
            setDisplayName(res.group.display_name);
            setPic(res.group.profile_picture);
            setAdminIds(res.group.admins);
            setOwnerId(res.group.owner);
            const sortedMembersList = sortMembers(res.group.users, res.group.admins, res.group.owner, res.sender)
            setUsers(sortedMembersList);
            setAdminPermissions(res.group.admin_permissions);
            setSender(res.sender);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    const convertToBase64 = (file: File) => {
        const base64String = new Promise<string>((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file); 
            fileReader.onload = () => {
                if (typeof fileReader.result === 'string')
                    resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
        return base64String
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const base64 = await convertToBase64(file);
        setPic(base64);
}


    const handleSubmit = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const checkedBoxesNodeList = document.querySelectorAll<HTMLInputElement>('input[name=admin-permissions]:checked');
        const checkedBoxesArray = Array.from(checkedBoxesNodeList);
        const checkedBoxes = checkedBoxesArray.map((element) => element.value);        
        const newDisplayName = (document.getElementById("display-name") as HTMLInputElement).value;

        const formData = new FormData();
        formData.append("display_name", newDisplayName);

        if (checkedBoxes.length > 0) {
            for (let i = 0; i < checkedBoxes.length; i++) {
                formData.append(`admin_permissions[${i}]`, checkedBoxes[i]);
              }
        } else {
                formData.append(`admin_permissions`, "");
        }

        const profilePicArray = (document.getElementById("profile-picture") as HTMLInputElement).files

        const profilePic = profilePicArray![0]

        if (!pic && !profilePic) {
            // no previous picture and no picturer uploaded
            formData.append("profile_picture", null!);
            formData.append("picture_status", "delete")
        } else if (pic && profilePic) { 
            //if the user doesn't have a picture yet and they upload a picture
            formData.append("profile_picture", profilePic);
        } else if (pic && profilePic) {
            //if the user does have a picture and they dont upload any picture, dont do anything
            formData.append("profile_picture", null!);
        }

        fetch(`/api/groups/${urlParams.groupId}/settings`, {
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
                const displayNameErrors = res.errors.filter((error: { path: string}) => error.path === "display_name");
                setErrors({
                    display_name: displayNameErrors[0],
                })
            } else {
                alert(res.message);
                setErrors(null);
            }
          })
          .catch(err => {
            console.log(err);
        })

    }

    const handleDropdown = (userId: string) => {
        const currentDropdown = document.getElementById(`${userId}-dropdown`);
        
        if (currentDropdown?.classList.contains('invisible')) {
            currentDropdown.classList.remove('invisible');
            if (dropDown) {
                const previousDropDown = document.getElementById(`${dropDown}-dropdown`);
                previousDropDown?.classList.add('invisible');
            }
            setDropDown(userId)
        } else {
            currentDropdown?.classList.add('invisible');
            setDropDown(null);
        }
    }

    const closeDropDown = () => {
        const previousDropDown = document.getElementById(`${dropDown}-dropdown`);
        previousDropDown?.classList.add('invisible');
        setDropDown(null);
    }

    const openUserProfile = (userId: string) => {
        setUserProfile(userId);
        closeDropDown();
    }

    const handleDeleteGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        fetch(`/api/groups/${urlParams.groupId}/settings`, {
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

    const kickUser = (userId: string) => {
        if (users!.length > 3) {
            fetch(`/api/groups/${urlParams.groupId}/users/${userId}`, {
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
                    const newUsersArray = users!.filter(user => user._id != userId);
                    closeDropDown();
                    setUsers(newUsersArray);
                }
              })
              .catch(err => {
                console.log(err);
            })
        } else {
            alert("Groups can't have less than 3 people") 
        }


    }


    const adminUser = (userId: string, action: AdminAction) => {
        if (action === "Make admin") {
            fetch(`/api/groups/${urlParams.groupId}/users/${userId}`, {
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
                    setAdminIds([...(adminIds as []), userId])
                }
              })
              .catch(err => {
                console.log(err);
            })
        } else if (action === "Remove admin") {
            fetch(`/api/groups/${urlParams.groupId}/users/${userId}`, {
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
                    closeDropDown();
                    const indexOfAdmin = adminIds?.indexOf(userId);
                    const newAdminIds = adminIds?.toSpliced(indexOfAdmin, 1);
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

    const ownerUser = (userId: string) => {
        fetch(`/api/groups/${urlParams.groupId}/users/${userId}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: "Make owner"
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                console.log(res.errors);
            } else {
                console.log(res);
                setOwnerId(userId);
                closeDropDown();
            }
          })
          .catch(err => {
            console.log(err);
        })
    }

    function sortMembers(usersArray: UserType[], adminsArray: string[], owner: string, sender: string) {
        usersArray.sort((a,b) => {
            if (a._id === sender) {
                return -1
            } else if (b._id === sender) {
                return 1
            } else if (a._id === owner) { 
                return -1
            } else if (b._id === owner) {
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

    function sortNewMember(membersArray: UserType[], newMemberId: string) {
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

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toLowerCase();
        
        users?.forEach(user => {
          const isVisible = user.display_name.toLowerCase().includes(value);
          const userCard = document.getElementById(`${user._id}`);
          userCard?.classList.toggle("hide", !isVisible);
        })
      }

    const handleAddUserPopUp = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!addUserPopUp) {
            setAddUserPopUp(true);
        } else {
            setAddUserPopUp(false);
        }
    }

    const addUserToGroup = (user: UserType) => {
        fetch(`/api/groups/${urlParams.groupId}/users/${user._id}`, {
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
                const newMembersList = [...(users as UserType[]), user]
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
            membersDiv?.lastElementChild?.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
            });
        }

    }

    const handleLeaveGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (sender === ownerId) {
            alert("You must give the owner role to someone else before leaving")
        } else {
            fetch(`/api/groups/${urlParams.groupId}/users/${sender}`, {
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
            { (userProfile || addUserPopUp) &&
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
                <AddUserPopUp groupMembersArray={users!} addUserFunction={addUserToGroup}/>
            }
            <div className="settings-container">
                <div className="settings-card">
                    <h1 style={{margin: "0 0 1rem 0"}}>Group Settings</h1>
                    <form action="" method="PUT">
                        <div className="form-section">
                            <div style={{position: "relative"}} className="pic-container-x">
                                { pic ?
                                    <>
                                        <label htmlFor="profile-picture" style={{ cursor: sender === ownerId ? "pointer" : "default" }}>
                                            <ProfilePic imageSrc={pic} size="10rem" />
                                        </label>
                                        { sender === ownerId &&
                                            <button className="x-button-pfp" onClick={(e) => {
                                                e.preventDefault();
                                                setPic(null);
                                            }}>
                                                <FontAwesomeIcon icon={faCircleXmark} className="x-icon" style={{height: "3rem"}}/>
                                            </button>
                                        }
                                    </>
                                    :
                                    <label htmlFor="profile-picture" style={{ cursor: sender === ownerId ? "pointer" : "default" }}>
                                        <ProfilePic size="10rem" group={true}/>
                                    </label>
                                }
                            </div>
                            <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>
                                {sender != ownerId && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Profile Picture 
                            </label>
                            <input style={{ cursor: sender === ownerId ? "pointer" : "default" , color: "grey" }} className="input" type="file" id="profile-picture" name="profile-picture" accept="image/*" defaultValue={ pic ? pic : undefined } onChange={(e) => {handleFileUpload(e)}} disabled={sender != ownerId  ? true : false}/>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">
                                {sender != ownerId && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Display Name
                            </label>
                            <div className="input-containers">
                                <input className="input" id="display-name" type="text" defaultValue={displayName} style={{ cursor: sender === ownerId ? "pointer" : "default", borderColor: errors && errors.display_name ? "red" : "solid #00000033", color: sender != ownerId ? "grey" : "black"}} disabled={sender != ownerId  ? true : false}/>
                                { errors && errors.display_name &&
                                    <p className="error-message">{errors.display_name.msg}</p>
                                }
                            </div>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <p style={{ margin: 0 }}>
                                {sender != ownerId && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Admin Permissions
                            </p>
                            { adminPermissions &&
                                <div className="form-section-container" style={{ backgroundColor: sender != ownerId ? "light-dark(rgba(239, 239, 239, 0.3), rgba(59, 59, 59, 0.3))" : "transparent", color: sender != ownerId ? "grey" : "black"}}>
                                    <div className="checkbox-container">
                                        <label htmlFor="delete-messages">Can delete messages</label>
                                        <input  id="delete-messages" name="admin-permissions" value="delete-messages" type="checkbox" defaultChecked= {adminPermissions.delete_messages ? true : false} disabled={sender != ownerId  ? true : false} />
                                    </div>
                                    <div className="checkbox-container">
                                        <label htmlFor="invite-users">Can invite users</label>
                                        <input  id="invite-users" name="admin-permissions" value="invite-users" type="checkbox" defaultChecked= {adminPermissions.invite_users ? true : false} disabled={sender != ownerId  ? true : false} />
                                    </div>
                                    <div className="checkbox-container">
                                        <label htmlFor="kick-users">Can kick users</label>
                                        <input  id="kick-users" name="admin-permissions" value="kick-users" type="checkbox" defaultChecked= {adminPermissions.kick_users ? true : false} disabled={sender != ownerId  ? true : false} />
                                    </div>
                                </div>
                            }

                        </div>
                        <button className="submit" onClick={handleSubmit} style={{ backgroundColor: sender != ownerId ? "grey" : "#007BFF", pointerEvents: sender != ownerId ? "none" : "auto" }}>Save</button>
                        <div className="form-section" style={{ alignItems: "start" , position: "relative"}}>
                            <div className="users-header" style={{ margin: 0, width: "100%" }}>
                                <p style={{ margin: 0 }}>Members</p>
                                <input type="search" placeholder="Search name" className="user-list-search" style={{ padding: "0.25rem" }}onChange={(e) => handleSearch(e)}></input>
                            </div>
                            <div className="members-container">
                                { users &&
                                    users.map((user) => {
                                        return (
                                            <div id={`${user._id}`}key={user._id} style={{position: "relative", pointerEvents: sender === user._id ? "none" : "auto"}} onClick={() => {handleDropdown(user._id)}}>
                                                <div>
                                                    <div className="member-card" >
                                                        <ProfilePic imageSrc={user.profile_picture} size="4rem"/>
                                                        <div className="name-role">
                                                            <h2>{sender === user._id ? "You" : user.display_name}</h2>
                                                            { adminIds?.includes(user._id) && 
                                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center"}}>
                                                                    <FontAwesomeIcon icon={faUserGear} style={{color: "#007BFF", height: "1.5rem"}}/>
                                                                    <p style={{margin: 0}}>Admin</p>
                                                                </div>
                                                            }
                                                            { ownerId === user._id &&
                                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center"}}>
                                                                    <FontAwesomeIcon icon={faCrown} style={{color: "gold", height: "1.5rem"}}/>
                                                                    <p style={{margin: 0}}>Owner</p>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                    <hr style={{ margin: 0 }}/>
                                                </div>
                                                { sender === ownerId &&
                                                    <MemberDropDown 
                                                        user={user} 
                                                        profileFunction={openUserProfile} 
                                                        kickFunction={kickUser} 
                                                        adminFunction={adminUser} 
                                                        admin={adminIds?.includes(user._id) ? true : false}
                                                        ownerFunction={ownerUser}
                                                    />
                                                }
                                                { adminIds?.includes(sender!) && adminPermissions?.kick_users &&
                                                    <MemberDropDown 
                                                        user={user} 
                                                        profileFunction={openUserProfile} 
                                                        kickFunction={kickUser} 
                                                    />
                                                }
                                                { (sender != ownerId && !adminIds!.includes(sender!) || 
                                                adminIds?.includes(sender!) && !adminPermissions!.kick_users) &&
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
                            { (sender === ownerId || adminIds?.includes(sender!) && adminPermissions?.invite_users) &&
                                <button className="add-user-button" onClick={(e) => {handleAddUserPopUp(e)}}>
                                    <FontAwesomeIcon icon={faCirclePlus} className="file-upload-icon" style={{ height: "3rem" }}/>
                                </button>
                            }
                        </div>
                        { sender === ownerId &&
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