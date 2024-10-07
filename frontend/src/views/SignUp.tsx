import Logo from "../components/Logo"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Errors = {
    display_name?: {
        msg: string
    },
    username?: {
        msg: string
    },
    password?: {
        msg: string
    },
    confirm_password?: {
        msg: string
    }
} | null

export default function SignUp() {
    const [errors, setErrors] = useState<Errors>(null);

    const navigate = useNavigate();

    const handleSubmit = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();

        const username = (document.getElementById('username') as HTMLInputElement).value;
        const displayName =(document.getElementById('displayname')as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('confirmpassword') as HTMLInputElement).value;
        
        const userInputs = {
            display_name: displayName,
            username: username,
            password: password,
            confirm_password: confirmPassword
        }

        fetch('/api/signup', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInputs)
          })
          .then(res => res.json())
          .then(res => {
            if (res.errors) {
                const displayNameErrors = res.errors.filter((error: { path: string}) => error.path === "display_name");
                const usernameErrors = res.errors.filter((error: { path: string}) => error.path === "username");
                const passwordErrors = res.errors.filter((error: { path: string}) => error.path === "password");
                const confirmPasswordErrors = res.errors.filter((error: { path: string}) => error.path === "confirm_password");

                setErrors({
                    display_name: displayNameErrors[0],
                    username: usernameErrors[0],
                    password: passwordErrors[0],
                    confirm_password: confirmPasswordErrors[0]
                })
            } else {
                alert(res.message);
                navigate('/');
            }
          })
    }

    return(
        <div className="signup-page">
            <main className="login">
                <Logo />
                <h2>Create An Account</h2>
                <form action="" method="POST" >
                    <div className="input-containers">
                        <input className="input" type="text" name="displayname" id="displayname" placeholder='Display Name' required style={{ borderColor: errors && errors.display_name ? "red" : "solid #00000033" }}/>
                        { errors && errors.display_name &&
                        <p className="error-message">{errors.display_name.msg}</p>
                        }
                    </div>

                    <div className="input-containers">
                        <input className="input" type="text" name="username" id="username" placeholder='Username' required style={{ borderColor: errors && errors.username ? "red" : "solid #00000033" }}/>
                        { errors && errors.username &&
                        <p className="error-message">{errors.username.msg}</p>
                        }
                    </div>

                    <div className="input-containers">
                    <input className="input" type="password" name="password" id="password" placeholder='Password' required style={{ borderColor: errors && errors.password ? "red" : "solid #00000033"}}/>
                    { errors && errors.password &&
                        <p className="error-message">{errors.password.msg}</p>
                    }
                    </div>

                    <div className="input-containers">
                    <input className="input" type="password" name="confirmpassword" id="confirmpassword" placeholder='Confirm Password' required style={{ borderColor: errors && errors.confirm_password ? "red" : "solid #00000033" }}/>
                    { errors && errors.confirm_password &&
                        <p className="error-message">{errors.confirm_password.msg}</p>
                    }
                    </div>

                    <input type="submit" value="Sign Up" className="submit" onClick={handleSubmit}/>
                </form>
            </main>
        </div>

    )
}