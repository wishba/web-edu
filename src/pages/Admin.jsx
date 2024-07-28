import React, { useEffect, useState } from 'react'

function Admin() {
  const [userId, setUserId] = useState()
  const [userName, setUserName] = useState()

  useEffect(() => {
    if (netlifyIdentity.currentUser() != null) {
      setUserId(netlifyIdentity.currentUser().id)
      setUserName(netlifyIdentity.currentUser().user_metadata.full_name)
    }

    netlifyIdentity.on('login', user => {
      setUserId(netlifyIdentity.currentUser().id)
      setUserName(user.user_metadata.full_name)

      netlifyIdentity.close()
    })

    netlifyIdentity.on('logout', () => {
      setUserId(null)
      setUserName(null)

      netlifyIdentity.close()
    })
  }, [])


  return (
    <div className='container'>
      <br />
      <nav>
        <h1 style={{
          backgroundImage: 'linear-gradient(90deg, #d92662, #2060df)',
          backgroundClip: 'text',
          color: 'transparent'
        }}>Forum Edukasi</h1>

        <button onClick={() => netlifyIdentity.open()}>
          {userName ? 'Logout' : 'Login / Signup'}
        </button>
      </nav>
      <br />

      {userId === import.meta.env.VITE_ADMIN_USER_ID ?
        (<>
          <p>tes</p>
          <p>{userId}</p>
          <p>{userName}</p>
        </>) :

        (<p style={{
          fontWeight: 'bold',
          textAlign: 'center'
        }}>Harap login sebagai admin</p>)
      }
    </div>
  )
}

export default Admin