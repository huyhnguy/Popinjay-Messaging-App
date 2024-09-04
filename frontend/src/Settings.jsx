import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faLock } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [base64Pic, setBase64Pic] = useState(null);
    const [guest, setGuest] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/api/users/settings', {
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
            setDisplayName(res.display_name);
            setBase64Pic(res.profile_picture);
            if(res.guest) {
                setGuest(true);
            }
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

        fetch('http://localhost:3000/api/users/settings', {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile_picture: base64Pic,
                display_name: newDisplayName
            })
          })
          .then(res => res.json())
          .then(res => {
            alert(res.message);
          })
          .catch(err => {
            console.log(err);
            navigate('/login');
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

    return(
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-card">
                    <h1 style={{marginBottom: 0}}>Settings</h1>
                    {guest &&
                        <p style={{color: "red", marginTop: 0}}>**Create an account to change settings!**</p>
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
                            <input style={{ cursor: !guest && "pointer", color: guest && "grey" }} className="input" type="file" id="profile-picture" accept="image/*" defaultValue={ base64Pic && base64Pic } onChange={(e) => {handleFileUpload(e)}} disabled={guest ? true : false}/>
                        </div>
                        <div className="form-section" style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">
                                {guest && 
                                    <FontAwesomeIcon icon={faLock} style={{ height: "1rem", marginRight: "0.5rem" }}/>
                                }
                                Display Name
                            </label>
                            <input className="input" id="display-name" type="text" defaultValue={displayName} disabled={guest ? true : false} style={{ color: guest && "grey" }}/>
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