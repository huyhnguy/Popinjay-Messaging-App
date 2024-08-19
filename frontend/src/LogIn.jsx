import './index.css'
import Logo from './Logo'
import { Link } from "react-router-dom";

export default function LogIn() {

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const handleGuest = (e) => {
        e.preventDefault();
    }

    return(
        <>
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
        </>

    )
}