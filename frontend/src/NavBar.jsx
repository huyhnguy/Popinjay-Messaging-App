import { Link } from "react-router-dom";


export default function NavBar() {
    return(
        <nav>
            <Link>Group</Link>
            <Link>DMs</Link>
            <Link>Users</Link>
            <Link>Settings</Link>
        </nav>
    )
}