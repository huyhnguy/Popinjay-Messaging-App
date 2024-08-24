import NavBar from "./NavBar"
import { useState } from "react"
import { useEffect } from "react";

export default function Settings() {
    const [displayName, setDisplayName] = useState(undefined);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const displayName = document.getElementById("display-name").value;
        console.log(displayName);
        console.log(document.getElementById("profile-picture").value);

        fetch('http://localhost:3000/api/users/settings', {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                display_name: displayName
            })
          })
          .then(res => res.json())
          .then(res => console.log(res))

    }

    return(
        <>
            <form action="" method="POST">
                <input type="file" id="profile-picture" accept="image/*"/>
                <label htmlFor="display-name">Display Name</label>
                <input id="display-name" type="text" defaultValue={displayName}/>
                <button onClick={handleSubmit}>Submit</button>
            </form>
            <NavBar />
        </>
    )
}