import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";

export default function Settings() {
    const [displayName, setDisplayName] = useState(undefined);
    const [base64Pic, setBase64Pic] = useState("");

    useEffect(() => {
        fetch('http://localhost:3000/api/users/settings', {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          })
          .then(res => res.json())
          .then(res => setDisplayName(res.display_name))
    })

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const displayName = document.getElementById("display-name").value;
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
                display_name: displayName
            })
          })
          .then(res => res.json())
          .then(res => console.log(res))
          .catch(console.error);

    }

    return(
        <>
            <form action="" method="POST">
                <img src={base64Pic} alt="" style={{ height: "10rem" }}/>
                <input type="file" id="profile-picture" accept="image/*" onChange={(e) => {handleFileUpload(e)}}/>
                <label htmlFor="display-name">Display Name</label>
                <input id="display-name" type="text" defaultValue={displayName}/>
                <button onClick={handleSubmit}>Submit</button>
            </form>
            <NavBar />
        </>
    )
}