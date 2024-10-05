import NavBar from "../components/NavBar"
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faLock } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "../components/ProfilePic";
import { useNavigate } from "react-router-dom";

type Base64 = string | null
type Errors = {
    display_name?: {
        msg: string
    },
    about_me?: {
        msg: string
    }
} | null

type AboutMe = string | undefined 

export default function Settings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [base64Pic, setBase64Pic] = useState<Base64>(null);
    const [aboutMe, setAboutMe] = useState<AboutMe>(undefined);
    const [guest, setGuest] = useState(false);
    const [aboutMeRemainingCharacters, setAboutMeRemainingCharacters] = useState(150);
    const [errors, setErrors] = useState<Errors>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/users/settings', {
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
            console.log(res.profile_picture);
            setDisplayName(res.display_name);
            setBase64Pic(res.profile_picture);
            setAboutMe(res.about_me);
            if(res.guest) {
                setGuest(true);
            }
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
        if (guest) {
            e.preventDefault();
            return
        }
        const file = e.target.files![0];
        const base64 = await convertToBase64(file);
        setBase64Pic(base64);
    }

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newDisplayName = (document.getElementById("display-name") as HTMLInputElement).value;
        const aboutMe = (document.querySelector(".about-me-input") as HTMLInputElement).value;

        const formData = new FormData();
        formData.append("display_name", newDisplayName);
        formData.append("about_me", aboutMe);

        const profilePictureInput = (document.getElementById("profile-picture") as HTMLInputElement).files

        if (!base64Pic && !profilePictureInput![0]) {
            // no previous picture and no picturer uploaded
            formData.append("profile_picture", null!);
            formData.append("picture_status", "delete")
        } else if (base64Pic && profilePictureInput![0]) { 
            //if the user doesn't have a picture yet and they upload a picture
            formData.append("profile_picture", profilePictureInput![0]);
        } else if (base64Pic && !profilePictureInput![0]) {
            //if the user does have a picture and they dont upload any picture, dont do anything
            formData.append("profile_picture", null!);
        }

        fetch('/api/users/settings', {
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
                const displayNameErrors = res.errors.filter((error: { path: string }) => error.path === "display_name");
                const aboutMeErrors = res.errors.filter((error: { path: string}) => error.path === "about_me");
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

    const handleLogOut = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        fetch('/api/logout', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
        }).then(res => {
            if (res.ok) {
                navigate('/');
            }
            throw Error
        }).catch(err => {
            console.log(err);
        })
    }

    const countRemainingCharacters = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const characters = text.length;
        const remainingCharacters = 150 - characters;
        const remainingCharactersText = document.querySelector('.about-me-remaining-characters');
        if (remainingCharactersText) {
            if (remainingCharacters >= 0) {
                remainingCharactersText.classList.add("green")
                remainingCharactersText.classList.remove("red")
            } else {
                remainingCharactersText.classList.add("red")
                remainingCharactersText.classList.remove("green")
            }
        }
        setAboutMeRemainingCharacters(remainingCharacters);

        return
    }

    return(
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-card">
                    <h1 style={{margin: "0 0 1rem 0"}}>Settings</h1>
                    {guest &&
                        <p style={{color: "red", marginTop: 0, textAlign: "center"}}>Guest users cannot change settings!</p>
                    }
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
                                    <label htmlFor="profile-picture" style={{ cursor: !guest ? "pointer" : "default" }}>
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
                            <input style={{ cursor: !guest ? "pointer" : "default", color: guest ? "grey" : "black" }} className="input" type="file" id="profile-picture" name="profile-picture" accept="image/*" defaultValue={ base64Pic ? base64Pic : undefined } onChange={(e) => {handleFileUpload(e)}} disabled={guest ? true : false}/>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">
                                {guest && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Display Name
                            </label>
                            <div className="input-containers">
                                <input className="input" id="display-name" type="text" defaultValue={displayName} disabled={guest ? true : false} style={{ color: guest ? "grey" : "black", borderColor: errors && errors.display_name ? "red" : "black" }}/>
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
                                <textarea className="about-me-input" name="about-me" id="about-me" rows={4} disabled={guest ? true : false} style={{ color: guest ? "grey" : "black", borderColor: errors && errors.about_me ? "red" : "black" }} onChange={(e) => {countRemainingCharacters(e)}} defaultValue={aboutMe}></textarea>
                                <p className='about-me-remaining-characters green'>{aboutMeRemainingCharacters}</p>
                            
                                { errors && errors.about_me &&
                                    <p className="error-message">{errors.about_me.msg}</p>
                                }   
                            </div>

                        </div>
                        <button className="submit" style={{ backgroundColor: guest ? "grey" : "#007BFF", pointerEvents: guest ? "none" : "auto" }}onClick={handleSubmit}>Save</button>
                        <button className="submit" style={{backgroundColor: "red"}} onClick={handleLogOut}>Log out</button>
                    </form>
                </div>
            </div>
            <NavBar active='Settings' />
        </div>
    )
}