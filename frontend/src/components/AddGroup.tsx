import ProfilePic from "./ProfilePic"
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleLeft, faCircleRight, faCircleXmark, faSquarePlus} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";

type Action = "completed" | "open" | "close";
type StringOrUndefined = string | undefined;
type UsersList = { _id: string, display_name: string, profile_picture?: string }[] | null;
type ChosenUsers = { _id: string, display_name: string, profile_picture?: string }[];
type Errors = { add_users?: string, display_name?: string } | null;

export default function AddGroup({ closePopUp }: { closePopUp: (action: Action) => void }) {
    
    const [base64Pic, setBase64Pic] = useState<StringOrUndefined>(undefined);
    const [displayName, setDisplayName] = useState<StringOrUndefined>(undefined);
    const [usersList, setUsersList] = useState<UsersList>(null);
    const [chosenUsers, setChosenUsers] = useState<ChosenUsers>([]);
    const [next, setNext] = useState(false);
    const [errors, setErrors] = useState<Errors>(null);

    const navigate = useNavigate();

    const fetchAllUsers = () => {
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
            console.log(res);
            setUsersList(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }

    useEffect(() => {
        fetchAllUsers();
    }, [])

    const scrollToNewChosenUser = () => {
        const chosenUsersContainer = document.querySelector(".chosen-users");

        if (chosenUsersContainer && chosenUsersContainer.lastElementChild) {
            chosenUsersContainer.lastElementChild.scrollIntoView({
                block: "nearest",
                inline: "nearest",
                behavior: "smooth",
              });
        }
    }

    useEffect(() => {
        scrollToNewChosenUser();
    }, [chosenUsers]);

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
            console.log(typeof base64);
            console.log(base64);
            setBase64Pic(base64);
    }

    const appendDataToForm = () => {
        const formData = new FormData();

        const groupName: string = (document.getElementById("group-name") as HTMLInputElement).value;
        formData.append("display_name", groupName);

        const groupPictureArray = (document.getElementById("group-picture") as HTMLInputElement).files
        if (groupPictureArray) {
            const groupPicture: File = groupPictureArray[0];
            formData.append("group_picture", groupPicture);
        }

        const chosenUsersIdArray: string[] = Array.from(chosenUsers, user => user._id);
        for (let i = 0; i < chosenUsersIdArray.length; i++) {
            formData.append(`users[${i}]`, chosenUsersIdArray[i]);
        }

        return formData
    }

    const createNewGroup = (formData: FormData) => {
        fetch('/api/groups/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          })
          .then(res => res.json())
          .then(res => {
            console.log(res)
            if (res.errors) {
                setErrors({
                    display_name: res.errors[0].msg
                })
            } else {
                closePopUp("completed");
            }
          })
          .catch(err => {
            console.log(err);
        })
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();

        const formData = appendDataToForm();
        createNewGroup(formData);
    }

    const updateChosenUsers = (userId: string, shouldAdd: boolean) => {
        const userCard = document.getElementById(userId + "-label");
        userCard!.classList.toggle("chosen-user");

        if (shouldAdd) {
            const newChosenUser = usersList!.find(user => user._id === userId);
            setChosenUsers([...chosenUsers, newChosenUser!]);
        } else {
            const newChosenUsers = chosenUsers.filter(chosenUser => chosenUser._id != userId);
            setChosenUsers(newChosenUsers);
        }
    } 

    const handleClickedUser = (e: React.ChangeEvent<HTMLInputElement>) => {
        const clickedUser = e.target;

        if (clickedUser.checked) {
            updateChosenUsers(clickedUser.id, true);
        } else {
            updateChosenUsers(clickedUser.id, false);
        }
    }

    const handleXClick = (userId: string) => {
        updateChosenUsers(userId, false);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.toLowerCase();
        if (usersList) 
            usersList.forEach(user => {
            const isVisible = user.display_name.toLowerCase().includes(inputValue);
            const userCard = document.getElementById(`card-${user._id}`);
            userCard!.classList.toggle("hide", !isVisible);
            })
      }

    const handleNextClick = (goNext: boolean) => {
        if (goNext) {
            if (chosenUsers.length >= 2) {
                setNext(true);
                setErrors(null);
            } else {
                setErrors({ 
                    add_users: "Choose atleast two users"
                })
            }
        } else {
            const groupName: StringOrUndefined = (document.getElementById("group-name") as HTMLInputElement).value;
            setDisplayName(groupName);
            setNext(false)
            setBase64Pic(undefined);
        };
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
                        { errors && errors.add_users &&
                            <p style={{margin: "0 0 1rem 0", color: "red"}}>{errors.add_users}</p>
                        }
                        <input type="search" placeholder="Search name" className="user-list-search" onChange={(e) => handleSearch(e)} style={{ width: "100%", marginBottom: "1rem" }}></input>
                        <form action="" method="POST">
                            <section className="add-users-section" >
                                { chosenUsers.length > 0 &&
                                    <div className="chosen-users" data-testid="chosen-users">
                                        {chosenUsers.map(user => 
                                            <div className="chosen-user-card" key={`${user._id}-chosen`}>
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
                                                <div key={user._id} id={`card-${user._id}`} data-testid={`test-card-${user._id}`}>
                                                    <label className={`user-card ${chosenUsers.includes(user) && 'chosen-user'}`} htmlFor={user._id} id={user._id + "-label"} >
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
                        <form action="" method="" onSubmit={handleSubmit}>
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
                                <div className="input-containers">
                                    <input className="input" id="group-name" type="text" defaultValue={displayName && displayName}/>
                                    { errors && errors.display_name &&
                                        <p className="error-message" style={{position: "static"}}>{errors.display_name}</p>
                                    }
                                </div>
      
                            </div>
                        </form>
                    </>         
                }
            </div>
        </>
    )
}