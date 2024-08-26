import { Link } from "react-router-dom";


export default function NavBar() {
    return(
        <nav>
            <Link>Groups</Link>
            <Link to="/dms">DMs</Link>
            <Link to="/users">Users</Link>
            <Link to="/settings">Settings</Link>
        </nav>
    )
}