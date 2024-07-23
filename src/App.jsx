import './App.css'
import netlifyIdentity from 'netlify-identity-widget';
import { useEffect, useRef, useState } from 'react';

function App() {
  const [userId, setUserId] = useState()
  const [userName, setUserName] = useState()

  const [post, setPost] = useState()
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [timeline, setTimeline] = useState()
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false)

  const [createTitleField, setCreateTitleField] = useState('')
  const [createContentField, setCreateContentField] = useState('')
  const [updateId, setUpdateId] = useState()
  const [updateTitleField, setUpdateTitleField] = useState('')
  const [updateContentField, setUpdateContentField] = useState('')
  const [replyId, setReplyId] = useState()

  const [outline, setOutline] = useState('timeline')
  const [timelineOutline, setTimelineOutline] = useState('')
  const [profileOutline, setProfileOutline] = useState('outline')

  const updateRef = useRef()
  const replyRef = useRef()

  const fetchPost = async () => {
    setIsLoadingPost(true)

    try {
      const response = await fetch('/.netlify/functions/postRead', {
        method: 'POST',
        body: JSON.stringify({
          userId: netlifyIdentity.currentUser().id
        })
      })

      const data = await response.json()
      setPost(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingPost(false)
    }
  }

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

  useEffect(() => {
    fetchTimeline()

    if (netlifyIdentity.currentUser() != null) {
      setUserId(netlifyIdentity.currentUser().id);
      setUserName(netlifyIdentity.currentUser().user_metadata.full_name)
      fetchPost()
    }

    netlifyIdentity.on('login', user => {
      setUserId(netlifyIdentity.currentUser().id);
      setUserName(user.user_metadata.full_name)
      fetchPost()
      netlifyIdentity.close()
    })

    netlifyIdentity.on('logout', () => {
      setUserId(null)
      setUserName(null)
      setPost(null)
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

      fetchPost()
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

      fetchPost()
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

  const handleReplyInfo = posts => {
    setReplyId(posts.ref['@ref'].id)
    // setUpdateTitleField(posts.data.title)
    // setUpdateContentField(posts.data.content)

    handleReplyModalOpen()
  }

  const handleReplyModalOpen = () => {
    replyRef.current.showModal()
  }

  const handleReplyModalClose = () => {
    replyRef.current.close()
  }

  const handleDelete = async posts => {
    try {
      await fetch('.netlify/functions/postDelete', {
        method: 'DELETE',
        body: JSON.stringify({
          postId: posts.ref['@ref'].id
        })
      })

      fetchPost()

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
          <button onClick={() => handleReplyInfo(posts)}>Reply</button>
        </div>

        <hr />

      </div>
    )).slice().reverse()}
  </>

  const postForm = <>
    <p>Silakan buat posting di sini; posting Anda akan muncul di Timeline setelah disetujui oleh admin.</p>

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

  const postContent = <>
    {post?.map(posts => (
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

      <br />
      <br />

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
              (<>{postForm}</>) :
              (<p style={{
                fontWeight: 'bold',
                textAlign: 'center'
              }}>Please login to see your post</p>)
            }

            {isLoadingPost ?
              (<p>Loading...</p>) :
              (<>{postContent}</>)
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
              onClick={() => handleReplyModalClose()}
            >Close</button>
          </header>

          <p>{replyId}</p>

          {/* <form onSubmit={e => handleUpdate(e)}>
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
          </form> */}
        </article>
      </dialog>

    </div>
  )
}

export default App
