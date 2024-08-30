import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [base64Pic, setBase64Pic] = useState(null);

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
            console.log(res);
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
        setBase64Pic(base64);
        console.log(base64);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDisplayName = document.getElementById("display-name").value;
        console.log(base64Pic);

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
            console.log(res);
            alert(res.message);
          })
          .catch(err => {
            console.log(err);
            navigate('/login');
        })

    }

    return(
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-card">
                    <h1>Settings</h1>
                    <form action="" method="POST">
                        <div>
                            { base64Pic ?
                                <ProfilePic imageSrc={base64Pic} size="10rem"/>
                                :
                                <ProfilePic size="10rem"/>
                            }
                            <label htmlFor="profile-picture" style={{ alignSelf: "start" }}>Profile Picture</label>
                            <input style={{ cursor: "pointer" }} className="input" type="file" id="profile-picture" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                        </div>
                        <div style={{ alignItems: "start" }}>
                            <label htmlFor="display-name">Display Name</label>
                            <input className="input" id="display-name" type="text" defaultValue={displayName}/>
                        </div>
                        <button className="submit" onClick={handleSubmit}>Save</button>
                    </form>
                </div>
            </div>
            <NavBar active='Settings' />
        </div>
    )
}