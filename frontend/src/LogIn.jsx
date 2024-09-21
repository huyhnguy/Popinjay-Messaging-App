import './index.css'
import Logo from './Logo'
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';

export default function LogIn() {
    const [errors, setErrors] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('https://popinjay-7457d2787149.herokuapp.com/api/login', {
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
          .then(res => res.json(res))
          .then(res => {
            if (res.errors) {
                console.log(res.errors);
                const usernameErrors = res.errors.filter(error => error.path === "username");
                const passwordErrors = res.errors.filter(error => error.path === "password");
                setErrors({
                    username: usernameErrors[0],
                    password: passwordErrors[0]
                })
            } else if(res.status === 200) {
                navigate("/groups")
            }
          })
    }

    const handleGuest = (e) => {
        e.preventDefault();
        console.log(e.key);
        const username = "guest"
        const password = "guestnguyen1"

        fetch('https://popinjay-7457d2787149.herokuapp.com/api/login', {
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
          .then(res => res.json(res))
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
                            <input className="input" type="text" name="username" id="username" placeholder='Username'style={{ borderColor: errors && errors.username && "red" }} />
                            { errors && errors.username &&
                                <p className="error-message">{errors.username.msg}</p>
                            }
                        </div>
                        <div className="input-containers">
                            <input className="input" type="password" name="password" id="password" placeholder='Password' style={{ borderColor: errors && errors.password && "red" }} />
                            { errors && errors.password &&
                                <p className="error-message">{errors.password.msg}</p>
                            }
                        </div>
                        <div className="login-buttons">
                            <input type="button" value="Log in as guest" className="submit" onClick={handleGuest}/>
                            <input type="submit" value="Log in" className="submit" onClick={handleSubmit}/>
                        </div>

                        <Link to="/signup">Create an account</Link>
                    </form>
                </main>
            </div>

        </>

    )
}