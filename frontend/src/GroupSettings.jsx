import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faLock } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate, useParams } from "react-router-dom";

export default function GroupSettings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [base64Pic, setBase64Pic] = useState(null);
    const [aboutMe, setAboutMe] = useState(null);
    const [aboutMeRemainingCharacters, setAboutMeRemainingCharacters] = useState(150);
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
            console.log(res.profile_picture);
            setDisplayName(res.display_name);
            setBase64Pic(res.profile_picture);
            setUsers(res.users);

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
        if (guest) {
            e.preventDefault();
            return
        }
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setBase64Pic(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDisplayName = document.getElementById("display-name").value;
        const aboutMe = document.querySelector(".about-me-input").value;

        const formData = new FormData();
        formData.append("display_name", newDisplayName);
        formData.append("about_me", aboutMe);

        if (!base64Pic && !document.getElementById("profile-picture").files[0]) {
            // no previous picture and no picturer uploaded
            formData.append("profile_picture", null);
            formData.append("picture_status", "delete")
        } else if (base64Pic && document.getElementById("profile-picture").files[0]) { 
            //if the user doesn't have a picture yet and they upload a picture
            const profilePic = document.getElementById("profile-picture").files[0];
            formData.append("profile_picture", profilePic);
        } else if (base64Pic && !document.getElementById("profile-picture").files[0]) {
            //if the user does have a picture and they dont upload any picture, dont do anything
            formData.append("profile_picture", null);
        }

        fetch('http://localhost:3000/api/users/settings', {
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
                const aboutMeErrors = res.errors.filter(error => error.path === "about_me");
                setErrors({
                    display_name: displayNameErrors[0],
                    about_me: aboutMeErrors[0]
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

    const handleLogOut = (e) => {
        e.preventDefault();

        fetch('http://localhost:3000/api/logout', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
        }).then(res => {
            if (res.ok) {
                navigate('/login');
            }
            const error = new Error(res.message);
            error.code = res.status;
            throw error
        }).catch(err => {
            console.log(err);
        })
    }

    const countRemainingCharacters = (e) => {
        const text = e.target.value;
        const characters = text.length;
        const remainingCharacters = 150 - characters;
        const remainingCharactersText = document.querySelector('.about-me-remaining-characters');
        if (remainingCharacters >= 0) {
            remainingCharactersText.classList.add("green")
            remainingCharactersText.classList.remove("red")
        } else {
            remainingCharactersText.classList.add("red")
            remainingCharactersText.classList.remove("green")
        }
        setAboutMeRemainingCharacters(remainingCharacters);
        return
    }

    return(
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-card">
                    <h1 style={{margin: "0 0 1rem 0"}}>Group Settings</h1>

                    <form action="" method="POST">
                        <div className="form-section">
                            <div style={{position: "relative"}} className="pic-container-x">
                                { base64Pic ?
                                    <>
                                        <label htmlFor="profile-picture" style={{ cursor: "pointer" }}>
                                            <ProfilePic imageSrc={base64Pic} size="10rem"/>
                                        </label>
                                        <button className="x-button-pfp" onClick={(e) => {
                                            e.preventDefault();
                                            setBase64Pic(null);
                                        }}>
                                            <FontAwesomeIcon icon={faCircleXmark} className="x-icon" style={{height: "3rem"}}/>
                                        </button>
                                    </>
                                    :
                                    <label htmlFor="profile-picture" style={{ cursor: !guest && "pointer" }}>
                                        <ProfilePic size="10rem"/>
                                    </label>
                                }

                            </div>

                            <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>
                                {guest && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Profile Picture 
                            </label>
                            <input style={{ cursor: !guest && "pointer", color: guest && "grey" }} className="input" type="file" id="profile-picture" name="profile-picture" accept="image/*" defaultValue={ base64Pic && base64Pic } onChange={(e) => {handleFileUpload(e)}} disabled={guest ? true : false}/>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">
                                {guest && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Display Name
                            </label>
                            <div className="input-containers">
                                <input className="input" id="display-name" type="text" defaultValue={displayName} disabled={guest ? true : false} style={{ color: guest && "grey", borderColor: errors && errors.display_name && "red" }}/>
                                { errors && errors.display_name &&
                                    <p className="error-message">{errors.display_name.msg}</p>
                                }
                            </div>

                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="about-me">
                                {guest && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                About Me
                            </label>
                            <div style={{position: "relative", width: "100%"}}>
                                <textarea className="about-me-input" name="about-me" id="about-me" rows="4" disabled={guest ? true : false} style={{ color: guest && "grey", borderColor: errors && errors.about_me && "red" }} onChange={(e) => {countRemainingCharacters(e)}} defaultValue={aboutMe}></textarea>
                                <p className='about-me-remaining-characters green'>{aboutMeRemainingCharacters}</p>
                            
                                { errors && errors.about_me &&
                                    <p className="error-message">{errors.about_me.msg}</p>
                                }   
                            </div>

                        </div>
                        <button className="submit" style={{ backgroundColor: guest && "grey", pointerEvents: guest && "none" }}onClick={handleSubmit}>Save</button>
                        <button className="submit" style={{backgroundColor: "red"}} onClick={handleLogOut}>Log out</button>
                    </form>
                </div>
            </div>
            <NavBar active='Settings' />
        </div>
    )
}