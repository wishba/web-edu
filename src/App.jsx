import './App.css'
import netlifyIdentity from 'netlify-identity-widget';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';

function App() {
  const [userId, setUserId] = useState()
  const [userName, setUserName] = useState()

  const [profile, setProfile] = useState()
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [timeline, setTimeline] = useState()
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false)
  const [reply, setReply] = useState()
  const [isLoadingReply, setIsLoadingReply] = useState(false)

  const [createTitleField, setCreateTitleField] = useState('')
  const [createContentField, setCreateContentField] = useState('')
  const [updateId, setUpdateId] = useState()
  const [updateTitleField, setUpdateTitleField] = useState('')
  const [updateContentField, setUpdateContentField] = useState('')
  const [replyId, setReplyId] = useState()
  const [replyContentField, setReplyContentField] = useState('')

  const [outline, setOutline] = useState('timeline')
  const [timelineOutline, setTimelineOutline] = useState('')
  const [profileOutline, setProfileOutline] = useState('outline')

  const updateRef = useRef()
  const replyRef = useRef()
  const replyButtonRef = useRef()

  const fetchTimeline = async () => {
    setIsLoadingTimeline(true)

    try {
      const response = await fetch('/.netlify/functions/postReadApproved', {
        method: 'POST'
      })

      const data = await response.json()
      setTimeline(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingTimeline(false)
    }
  }

  const fetchReply = async (posts) => {
    setReplyId(posts.ref['@ref'].id)
    replyRef.current.showModal()
    setIsLoadingReply(true)

    try {
      const response = await fetch('/.netlify/functions/postReadReply', {
        method: 'POST',
        body: JSON.stringify({
          replyTo: posts.ref['@ref'].id
        })
      })

      const data = await response.json()
      setReply(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingReply(false)
    }
  }

  const fetchProfile = async () => {
    setIsLoadingProfile(true)

    try {
      const response = await fetch('/.netlify/functions/postRead', {
        method: 'POST',
        body: JSON.stringify({
          userId: netlifyIdentity.currentUser().id
        })
      })

      const data = await response.json()
      setProfile(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    fetchTimeline()

    if (netlifyIdentity.currentUser() != null) {
      setUserId(netlifyIdentity.currentUser().id)
      setUserName(netlifyIdentity.currentUser().user_metadata.full_name)
      fetchProfile()
    }

    netlifyIdentity.on('login', user => {
      setUserId(netlifyIdentity.currentUser().id)
      setUserName(user.user_metadata.full_name)
      fetchProfile()

      netlifyIdentity.close()
    })

    netlifyIdentity.on('logout', () => {
      setUserId(null)
      setUserName(null)
      setProfile(null)

      netlifyIdentity.close()
    })
  }, [])

  const handleOpenTimeline = () => {
    setOutline('timeline')
    setTimelineOutline('')
    setProfileOutline('outline')

    fetchTimeline()
  }

  const handleOpenProfile = () => {
    setOutline('profile')
    setTimelineOutline('outline')
    setProfileOutline('')

    fetchProfile()
  }

  const handleCreate = async e => {
    e.preventDefault()

    try {
      await fetch('.netlify/functions/postCreate', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          userName,
          title: createTitleField,
          content: createContentField
        })
      })

      fetchProfile()
      setCreateTitleField('')
      setCreateContentField('')

    } catch (error) {
      console.error(error);
    }
  }

  const handleUpdate = async e => {
    e.preventDefault()

    try {
      await fetch('.netlify/functions/postUpdate', {
        method: 'PUT',
        body: JSON.stringify({
          postId: updateId,
          title: updateTitleField,
          content: updateContentField
        })
      })

      fetchProfile()
      handleUpdateModalClose()

    } catch (error) {
      console.error(error);
    }
  }

  const handleUpdateInfo = posts => {
    setUpdateId(posts.ref['@ref'].id)
    setUpdateTitleField(posts.data.title)
    setUpdateContentField(posts.data.content)

    handleUpdateModalOpen()
  }

  const handleUpdateModalOpen = () => {
    updateRef.current.showModal()
  }

  const handleUpdateModalClose = () => {
    updateRef.current.close()
  }

  const handleDelete = async posts => {
    try {
      await fetch('.netlify/functions/postDelete', {
        method: 'DELETE',
        body: JSON.stringify({
          postId: posts.ref['@ref'].id
        })
      })

      fetchProfile()

    } catch (error) {
      console.error(error);
    }
  }

  const handleReply = async e => {
    e.preventDefault()

    try {
      await fetch('.netlify/functions/postCreate', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          userName,
          replyTo: replyId,
          content: replyContentField
        })
      })

      setReplyContentField('')
      replyButtonRef.current.click()

    } catch (error) {
      console.error(error);
    }
  }

  const timelineContent = <>
    {timeline?.map(posts => (
      <div key={posts.ref['@ref'].id}>
        <p>&#9786; {posts.data.userName}</p>
        <p style={{ fontWeight: 'bold' }}>{posts.data.title}</p>
        <p>{posts.data.content}</p>

        <div style={{
          textAlign: 'right',
          paddingTop: '0',
          paddingBottom: '1rem'
        }}>
          <button ref={replyButtonRef} onClick={() => fetchReply(posts)}>Reply</button>
        </div>

        <hr />

      </div>
    )).slice().reverse()}
  </>

  const timelineReply = <>
    {reply?.map(posts => (
      <div key={posts.ref['@ref'].id}>
        <p>&#9786; {posts.data.userName}</p>
        <p>{posts.data.content}</p>

        <hr />

      </div>
    )).slice().reverse()}
  </>

  const profileForm = <>
    <p>Silakan buat posting di sini; posting Anda akan muncul di Timeline setelah disetujui oleh admin</p>

    <form onSubmit={e => handleCreate(e)}>
      <input type="text"
        value={createTitleField}
        onChange={e => setCreateTitleField(e.target.value)}
      />
      <textarea
        style={{ height: "30vh" }}
        value={createContentField}
        onChange={e => setCreateContentField(e.target.value)}
      />
      <input type="submit" value="Post" />
    </form>
  </>

  const profileContent = <>
    {profile?.map(posts => (
      <div key={posts.ref['@ref'].id}>
        <p style={{ fontWeight: 'bold' }}>{posts.data.title}</p>
        <p>{posts.data.content}</p>

        <div style={{
          textAlign: 'right',
          paddingTop: '0',
          paddingBottom: '1rem'
        }}>
          <button onClick={() => handleUpdateInfo(posts)}>Update</button>
          <button onClick={() => handleDelete(posts)}>Delete</button>
        </div>

        <hr />

      </div>
    )).slice().reverse()}
  </>

  const home = <div className='container'>
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

    <button
      className={timelineOutline}
      style={{ width: '50%' }}
      onClick={handleOpenTimeline}
    >Timeline</button>

    <button
      className={profileOutline}
      style={{ width: '50%' }}
      onClick={handleOpenProfile}
    >Profile</button>

    <br /><br />

    {outline == 'timeline' ?
      (
        <>
          {isLoadingTimeline ?
            (<p>Loading...</p>) :
            (<>{timelineContent}</>)
          }
        </>

      ) : null
    }

    {outline == 'profile' ?
      (
        <>
          {netlifyIdentity.currentUser() ?
            (<>{profileForm}</>) :
            (<p style={{
              fontWeight: 'bold',
              textAlign: 'center'
            }}>Silakan login untuk melihat posting Anda</p>)
          }

          {isLoadingProfile ?
            (<p>Loading...</p>) :
            (<>{profileContent}</>)
          }
        </>

      ) : null
    }

    <dialog ref={updateRef}>
      <article>
        <header style={{ textAlign: 'right' }}>
          <button
            onClick={() => handleUpdateModalClose()}
          >Close</button>
        </header>

        <form onSubmit={e => handleUpdate(e)}>
          <input type="text"
            value={updateTitleField}
            onChange={e => setUpdateTitleField(e.target.value)}
          />
          <textarea
            style={{ height: "50vh" }}
            value={updateContentField}
            onChange={e => setUpdateContentField(e.target.value)}
          />
          <input type="submit" value="Update" />
        </form>
      </article>
    </dialog>

    <dialog ref={replyRef}>
      <article>
        <header style={{ textAlign: 'right' }}>
          <button
            onClick={() => replyRef.current.close()}
          >Close</button>
        </header>

        {isLoadingReply ?
          (<p>Loading...</p>) :
          (<>
            <div style={{
              height: '30vw',
              overflow: 'auto'
            }}>{timelineReply}</div>

            {
              netlifyIdentity.currentUser() != null ? (
                <form onSubmit={e => handleReply(e)}>
                  <hr />

                  <textarea
                    value={replyContentField}
                    onChange={e => setReplyContentField(e.target.value)}
                  />
                  <input type="submit" value="Reply" />
                </form>
              ) : (
                <p style={{ textAlign: 'center' }}>Silahkan login untuk dapat melakukan reply</p>
              )
            }
          </>)
        }

      </article>
    </dialog>
  </div>

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={home} />
        <Route path='admin' element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
