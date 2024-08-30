import './index.css'
import Logo from './Logo'
import { Link, useNavigate } from "react-router-dom";

export default function LogIn() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:3000/api/login', {
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
                console.log(res);
                navigate("/users")
            }
          })
    }

    const handleGuest = (e) => {
        e.preventDefault();

        const username = "guest"
        const password = "guestguest123"

        fetch('http://localhost:3000/api/login', {
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
                console.log(res);
                navigate("/users")
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
                        <input className="input" type="text" name="username" id="username" placeholder='Username'/>
                        <input className="input" type="password" name="password" id="password" placeholder='Password'/>
                        <div className="login-buttons">
                            <input type="submit" value="Log in as guest" className="submit" onClick={handleGuest}/>
                            <input type="submit" value="Log in" className="submit" onClick={handleSubmit}/>
                        </div>

                        <Link to="/signup">Create an account</Link>
                    </form>
                </main>
            </div>

        </>

    )
}