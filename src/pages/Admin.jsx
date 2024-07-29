import React, { useEffect, useState } from 'react'

function Admin() {
  const [userId, setUserId] = useState()
  const [userName, setUserName] = useState()

  const [outline, setOutline] = useState('pending')
  const [approvedOutline, setApprovedOutline] = useState('')
  const [pendingOutline, setPendingOutline] = useState('outline')

  const [approved, setApproved] = useState()
  const [isLoadingApproved, setIsLoadingApproved] = useState(false)
  const [pending, setPending] = useState()
  const [isLoadingPending, setIsLoadingPending] = useState(false)

  const fetchApproved = async () => {
    setIsLoadingApproved(true)

    try {
      const response = await fetch('/.netlify/functions/postReadApproved', {
        method: 'POST',
        body: JSON.stringify({
          isApproved: 'true'
        })
      })

      const data = await response.json()
      setApproved(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingApproved(false)
    }
  }

  const fetchPending = async () => {
    setIsLoadingPending(true)

    try {
      const response = await fetch('/.netlify/functions/postReadApproved', {
        method: 'POST',
        body: JSON.stringify({
          isApproved: 'false'
        })
      })

      const data = await response.json()
      setPending(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingPending(false)
    }
  }

  useEffect(() => {
    fetchApproved()
    fetchPending()

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

    fetchApproved()
  }

  const handleOpenPending = () => {
    setOutline('pending')
    setPendingOutline('outline')
    setApprovedOutline('')

    fetchPending()
  }

  const approvedContent = <>
    {approved?.map(posts => (
      <div key={posts.ref['@ref'].id}>
        <p>&#9786; {posts.data.userName}</p>
        <p style={{ fontWeight: 'bold' }}>{posts.data.title}</p>
        <p>{posts.data.content}</p>
        <hr />
      </div>
    )).slice().reverse()}
  </>

  const pendingContent = <>
    {pending?.map((posts) => {
      if (!posts.data.title) {
        return null;
      }

      return (
        <div key={posts.ref['@ref'].id}>
          <p>&#9786; {posts.data.userName}</p>
          <p style={{ fontWeight: 'bold' }}>{posts.data.title}</p>
          <p>{posts.data.content}</p>
          <hr />
        </div>
      );
    }).slice().reverse()}
  </>

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
                {isLoadingApproved ?
                  (<p>Loading...</p>) :
                  (<>{approvedContent}</>)
                }
              </>

            ) : null
          }

          {outline == 'approved' ?
            (
              <>
                {isLoadingPending ?
                  (<p>Loading...</p>) :
                  (<>{pendingContent}</>)
                }
              </>

            ) : null
          }
        </>)
      }
    </div>
  )
}

export default Admin