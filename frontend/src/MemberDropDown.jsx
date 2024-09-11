

export default function MemberDropDown({ user }) {

    return (
        <>
            <div id={`${user._id}-dropdown`} className="member-button-container invisible">
                <button className="member-button">Message</button>
                <button className="member-button">View Profile</button>
                <button className="member-button">Make admin</button>
                <button className="member-button-red">Kick from group</button>
            </div>
        </>


    )
}