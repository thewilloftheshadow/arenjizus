/* eslint-disable @next/next/no-img-element */

export default function User({ userData }) {
    return (
        userData ? <>
            <h1>{userData.name}</h1>
            <h3>{userData.email}</h3>
            <p>Admin: {`${userData.admin}`}</p>
            <p>Approved: {`${userData.approved}`}</p>
        </> : <></>
    )
}
