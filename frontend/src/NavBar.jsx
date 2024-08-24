import { Link } from "react-router-dom";


export default function NavBar() {
    return(
        <nav>
            <Link>Group</Link>
            <Link>DMs</Link>
            <Link to="/users">Users</Link>
            <Link to="/settings">Settings</Link>
        </nav>
    )
}