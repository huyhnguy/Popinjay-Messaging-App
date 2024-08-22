

export default function Message({ info }) {
    return(
        <article key={info._id}>
            <h1>{info.user.display_name}</h1>
            <p>{info.content}</p>
        </article>
    )
}