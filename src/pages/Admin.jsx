import React, { useEffect, useState } from 'react'

function Admin() {
  const [userId, setUserId] = useState()
  const [userName, setUserName] = useState()

  const [outline, setOutline] = useState('approved')
  const [approvedOutline, setApprovedOutline] = useState('')
  const [pendingOutline, setPendingOutline] = useState('outline')

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

  const handleOpenApproved = () => {
    setOutline('approved')
    setPendingOutline('')
    setApprovedOutline('outline')

    // fetchTimeline()
  }

  const handleOpenPending = () => {
    setOutline('pending')
    setPendingOutline('outline')
    setApprovedOutline('')

    // fetchProfile()
  }

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

      {!userId === import.meta.env.VITE_ADMIN_USER_ID ?
        (<p style={{
          fontWeight: 'bold',
          textAlign: 'center'
        }}>Harap login sebagai admin</p>) :

        (<>
          <button
            className={approvedOutline}
            style={{ width: '50%' }}
            onClick={handleOpenPending}
          >Approved</button>

          <button
            className={pendingOutline}
            style={{ width: '50%' }}
            onClick={handleOpenApproved}
          >Pending</button>

          <br /> <br />

          {outline == 'pending' ?
            (
              <>
                approvedContent
                {/* {isLoadingTimeline ? */}
                {/* (<p>Loading...</p>) : */}
                {/* (<>{timelineContent}</>) */}
                {/* } */}
              </>

            ) : null
          }

          {outline == 'approved' ?
            (
              <>
                pendingContent
                {/* {isLoadingTimeline ? */}
                {/* (<p>Loading...</p>) : */}
                {/* (<>{timelineContent}</>) */}
                {/* } */}
              </>

            ) : null
          }
        </>)
      }
    </div>
  )
}

export default Admin