import { useState } from "react"
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import ProfilePic from "./ProfilePic";
import { useNavigate } from "react-router-dom";

type User = { 
    _id: string, 
    profile_picture?: string, 
    display_name: string, 
    about_me?: string, 
    createdAt: Date
} | null

export default function UserProfile({ userId, messageButton = true }: { userId: string, messageButton: boolean }) {
    const [user, setUser] = useState<User>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/users/' + userId, {
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
            console.log(res);
            setUser(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }, [])

    const convertDate = (date: Date) => {
        if (!date) {
            return "N/A"
        }

        const readableDate = new Date(date);
        let options: object = {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
        const formatter = new Intl.DateTimeFormat("en-US", options);
        const formattedDate = formatter.format(readableDate);

        return formattedDate
    
    }

    const handleDM = (user: User) => {

        fetch('/api/dms/create', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                other_user_id: user!._id
            })
          })
          .then(res => res.json())
          .then(res => {
            const route = `/dms/${res.dm._id}`;
            navigate(route);
          })
          .catch(err => {
            console.log(err);
            navigate('/');
        })
    }

            return(
                <div className="user-profile-container">
                    { user &&
                        <>
                            <ProfilePic imageSrc={user.profile_picture} size="10rem" />
                            <div className="user-profile-info">
                                <h1 style={{ margin: 0, overflowWrap: "break-word", maxWidth: "300px" }}>{user.display_name}</h1>
                                <button className={'submit message-button'} onClick={() => {handleDM(user)}} style={{ backgroundColor: !messageButton ? "grey" : "#007bff", pointerEvents: !messageButton ? "none" : "auto" }}>
                                    <FontAwesomeIcon icon={faMessage} style={{ height: "1rem" }}/>
                                    <p style={{ margin: 0 }}>Message</p>
                                </button>
                                { user.about_me &&
                                    <p className="user-about-me">{user.about_me}</p>
                                }
                                <p>Member since: {convertDate(user.createdAt)}</p>
                            </div>
    
                        </>
                    }
                </div>
        )
}