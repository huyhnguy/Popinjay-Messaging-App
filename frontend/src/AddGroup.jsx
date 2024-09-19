import ProfilePic from "./ProfilePic"
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleLeft, faCircleRight, faCircleXmark, faSquarePlus} from '@fortawesome/free-solid-svg-icons'

export default function AddGroup({ closePopUp }) {
    const [base64Pic, setBase64Pic] = useState(null);
    const [usersList, setUsersList] = useState(null);
    const [chosenUsers, setChosenUsers] = useState([]);
    const [next, setNext] = useState(false);

    const fetchAllUsers = () => {
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
            setUsersList(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/login');
            }
        })
    }

    useEffect(() => {
        fetchAllUsers();
    }, [])

    const scrollToNewChosenUser = () => {
        const chosenUsersContainer = document.querySelector(".chosen-users");
        if (chosenUsersContainer) {
            chosenUsersContainer.lastChild.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth",
                alignToTop: false
              });
        }
    }

    useEffect(() => {
        scrollToNewChosenUser();
    }, [chosenUsers]);

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
        setBase64Pic(base64);
    }

    const appendDataToForm = () => {
        const groupName = document.getElementById("group-name").value;
        const groupPicture = document.getElementById("group-picture").files[0];
        const chosenUsersIdArray = Array.from(chosenUsers, user => user._id);

        const formData = new FormData();
        formData.append("display_name", groupName);
        formData.append("group_picture", groupPicture);
        for (let i = 0; i < chosenUsersIdArray.length; i++) {
            formData.append(`users[${i}]`, chosenUsersIdArray[i]);
        }

        return formData
    }

    const createNewGroup = (formData) => {
        fetch('http://localhost:3000/api/groups/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          })
          .then(res => res.json())
          .then(res => {
            console.log(res.conversation);
            closePopUp("completed");
          })
          .catch(err => {
            console.log(err);
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = appendDataToForm();
        createNewGroup(formData);
    }

    const findUserInUserList = (userId) => {
        return usersList.find(user => user._id === userId);
    }

    const updateChosenUsers = (userId, shouldAdd) => {
        const userCard = document.getElementById(userId + "-label");
        userCard.classList.toggle("chosen-user");

        if (shouldAdd) {
            const newChosenUser = findUserInUserList(userId);
            setChosenUsers([...chosenUsers, newChosenUser]);
        } else {
            const newChosenUsers = chosenUsers.filter(chosenUser => chosenUser._id != userId);
            setChosenUsers(newChosenUsers);
        }
    } 

    const handleClickedUser = (e) => {
        const clickedUser = e.target;

        if (clickedUser.checked) {
            updateChosenUsers(clickedUser.id, true);
        } else {
            updateChosenUsers(clickedUser.id, false);
        }
    }

    const handleXClick = (userId) => {
        updateChosenUsers(userId, false);
    }

    const handleSearch = (e) => {
        const inputValue = e.target.value.toLowerCase();
        
        usersList.forEach(user => {
          const isVisible = user.display_name.toLowerCase().includes(inputValue);
          const userCard = document.getElementById(`card-${user._id}`);
          userCard.classList.toggle("hide", !isVisible);
        })
      }

    const handleNextClick = (goNext) => {
        if (goNext) setNext(true);
        else setNext(false);
    }

    return(
        <>
            <div className="shadow" onClick={() => {closePopUp("close")}}></div>
            <div className="add-group-container">
                { !next ?
                    <>
                        <h1>Add Users</h1>
                        <button className="next-button" onClick={() => {handleNextClick(true)}}>
                            <FontAwesomeIcon icon={faCircleRight} className="next-icon"/>
                        </button>
                        <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)} style={{ width: "100%", marginBottom: "1rem" }}></input>
                        <form action="" method="POST">
                            <section className="add-users-section">
                                { chosenUsers.length > 0 &&
                                    <div className="chosen-users">
                                        {chosenUsers.map(user => 
                                            <div className="chosen-user-card" key={user._id}>
                                                <div style={{position: "relative"}}>
                                                    <ProfilePic imageSrc={user.profile_picture} size="3rem"/>
                                                    <button className="x-button" onClick={() => {handleXClick(user._id)}}>
                                                        <FontAwesomeIcon icon={faCircleXmark} className="x-icon"/>
                                                    </button>
                                                </div>
                                                <p>{user.display_name}</p>
                                            </div>
                                        )}
                                    </div>
                                }
                                <div className="form-user-list">
                                    { usersList &&
                                        usersList.map(user => {
                                            return(
                                                <div key={user._id} id={`card-${user._id}`}>
                                                    <label className={`user-card ${chosenUsers.includes(user) && 'chosen-user'}`} htmlFor={user._id} id={user._id + "-label"}>
                                                        <ProfilePic imageSrc={user.profile_picture} size="3rem"/>
                                                        <p>{user.display_name}</p>
                                                    </label>
                                                    <input type="checkbox" id={user._id} name={user._id} value={user._id} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: '0px', height: '0px'}} onChange={(e) => {handleClickedUser(e)}} checked={chosenUsers.includes(user) ? true : false}/>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </section>
                        </form>
                    </>
                    :
                    <>
                        <h1>New Group</h1>
                        <button className="back-button" onClick={() => {handleNextClick(false)}}>
                            <FontAwesomeIcon icon={faCircleLeft} className="next-icon"/>
                        </button>
                        <button className="next-button" onClick={handleSubmit}>
                            <FontAwesomeIcon icon={faSquarePlus} className="next-icon"/>
                        </button>
                        <form action="" method="POST">
                            <section className="picture-section">
                                { base64Pic ?
                                    <ProfilePic imageSrc={base64Pic} size="10rem"/>
                                    :
                                    <ProfilePic size="10rem" group={true}/>
                                }
                                <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>Group Picture <span style={{color: "grey"}}>(optional)</span></label>
                                <input style={{ cursor: "pointer" }} className="input" type="file" id="group-picture" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                            </section>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label htmlFor="group-name">Group Name <span style={{color: "grey"}}>(optional)</span></label>
                                <input className="input" id="group-name" type="text" />
                            </div>
                        </form>
                    </>         
                }
            </div>
        </>
    )
}