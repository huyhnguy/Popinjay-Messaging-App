import Logo from '../components/Logo'
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';

type Errors = {
    username?: {
        msg: string
    },
    password?: {
        msg: string
    }
} | null

export default function LogIn() {
    const [errors, setErrors] = useState<Errors>(null);

    const navigate = useNavigate();

    const handleSubmit = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();

        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        fetch('/api/login', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                const usernameErrors = res.errors.filter((error: { path: string }) => error.path === "username");
                const passwordErrors = res.errors.filter((error: { path: string }) => error.path === "password");
                setErrors({
                    username: usernameErrors[0],
                    password: passwordErrors[0]
                })
            } else if(res.status === 200) {
                navigate("/groups")
            }
          })
    }

    const handleGuest = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();

        const username = "guest"
        const password = "guestnguyen1"

        fetch('/api/login', {
            method: 'POST',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
          })
          .then(res => res.json())
          .then(res => {
            if (res.status === 200) {
                navigate("/groups")
            }
          })
    }

    

    return(
        <>
            <div className='login-page'>
                <main className="login">
                    <Logo />
                    <h2>Welcome back!</h2>
                    <form action="" method="POST" >
                        <div className="input-containers">
                            <input className="input" type="text" name="username" id="username" placeholder='Username' style={{ borderColor: errors && errors.username ? "red" : "solid #00000033" }} />
                            { errors && errors.username &&
                                <p className="error-message">{errors.username.msg}</p>
                            }
                        </div>
                        <div className="input-containers">
                            <input className="input" type="password" name="password" id="password" placeholder='Password' style={{ borderColor: errors && errors.password ? "red" : "solid #00000033" }} />
                            { errors && errors.password &&
                                <p className="error-message">{errors.password.msg}</p>
                            }
                        </div>
                        <div className="login-buttons">
                            <input type="button" value="Log in as guest" className="submit" onClick={(e) => {handleGuest(e)}}/>
                            <input type="submit" value="Log in" className="submit" onClick={handleSubmit}/>
                        </div>

                        <Link to="/signup">Create an account</Link>
                    </form>
                </main>
            </div>

        </>

    )
}