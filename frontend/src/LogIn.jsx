import './index.css'

export default function LogIn() {
    return(
        <main className="login">
            <h2>Welcome back!</h2>
            <form action="" method="POST" >
                <input className="input" type="text" name="username" id="username" placeholder='Username'/>
                <input className="input" type="password" name="password" id="password" placeholder='Password'/>
                <input type="submit" value="Log in" className="submit" />
            </form>
        </main>
    )
}