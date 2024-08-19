import Logo from "./Logo"
import { useState } from "react";

export default function SignUp() {
    const [errors, setErrors] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const displayName = document.getElementById('displayname').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmpassword').value;
        
        const userInputs = {
            display_name: displayName,
            username: username,
            password: password,
            confirm_password: confirmPassword
        }

        fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInputs)
          })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            if (res.errors) {
                const displayNameErrors = res.errors.filter(error => error.path === "display_name");
                const usernameErrors = res.errors.filter(error => error.path === "username");
                const passwordErrors = res.errors.filter(error => error.path === "password");
                const confirmPasswordErrors = res.errors.filter(error => error.path === "confirm_password");

                console.log({
                    display_name: displayNameErrors,
                    username: usernameErrors,
                    password: passwordErrors,
                    confirm_password: confirmPasswordErrors
                });
                setErrors({
                    display_name: displayNameErrors,
                    username: usernameErrors,
                    password: passwordErrors,
                    confirm_password: confirmPasswordErrors
                })
            }
          })
    }

    return(
        <>
            <main className="login">
                <Logo />
                <h2>Create An Account</h2>
                <form action="" method="POST" >
                    <div className="input-containers">
                        <input className="input" type="text" name="displayname" id="displayname" placeholder='Display Name' required style={{ borderColor: errors && errors.display_name.length > 0 && "red" }}/>
                        { errors &&
                        errors.display_name.map(error => <p className="error-message">{error.msg}</p>)
                        }
                    </div>

                    <div className="input-containers">
                        <input className="input" type="text" name="username" id="username" placeholder='Username' required style={{ borderColor: errors && errors.username.length > 0 && "red" }}/>
                        { errors &&
                        errors.username.map(error => <p className="error-message">{error.msg}</p>)
                        }
                    </div>

                    <div className="input-containers">
                    <input className="input" type="password" name="password" id="password" placeholder='Password' required style={{ borderColor: errors && errors.password.length > 0 && "red" }}/>
                    { errors &&
                    errors.password.map(error => <p className="error-message">{error.msg}</p>)
                    }
                    </div>

                    <div className="input-containers">
                    <input className="input" type="password" name="confirmpassword" id="confirmpassword" placeholder='Confirm Password' required style={{ borderColor: errors && errors.confirm_password.length > 0 && "red" }}/>
                    { errors &&
                    errors.confirm_password.map(error => <p className="error-message">{error.msg}</p>)
                    }
                    </div>

                    <input type="submit" value="Sign Up" className="submit" onClick={handleSubmit}/>
                </form>
            </main>
        </>

    )
}