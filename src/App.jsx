import './App.css'
import netlifyIdentity from 'netlify-identity-widget';
import { useEffect, useRef, useState } from 'react';

function App() {
  const [userId, setUserId] = useState()
  const [userName, setUserName] = useState()
  const [allTodo, setAllTodo] = useState()
  const [isLoadingTodo, setIsLoadingTodo] = useState(false)
  const [createTodoField, setCreateTodoField] = useState('')
  const [updateId, setUpdateId] = useState()
  const [updateTodoField, setUpdateTodoField] = useState('')
  const [updateFinishedField, setUpdateFinishedField] = useState(false)
  const [page, setPage] = useState('timeline')
  const [timelineOutline, setTimelineOutline] = useState('')
  const [profileOutline, setProfileOutline] = useState('outline')

  const updateRef = useRef()

  const fetchTodo = async () => {
    setIsLoadingTodo(true)

    try {
      const response = await fetch('/.netlify/functions/todosRead', {
        method: 'POST',
        body: JSON.stringify({
          userId: netlifyIdentity.currentUser().id
        })
      })

      const data = await response.json()
      setAllTodo(data.data)

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoadingTodo(false)
    }
  }

  useEffect(() => {
    if (netlifyIdentity.currentUser() != null) {
      setUserId(netlifyIdentity.currentUser().id);
      setUserName(netlifyIdentity.currentUser().user_metadata.full_name)
      fetchTodo()
    }

    netlifyIdentity.on('login', user => {
      setUserId(netlifyIdentity.currentUser().id);
      setUserName(user.user_metadata.full_name)
      fetchTodo()
      netlifyIdentity.close()
    })

    netlifyIdentity.on('logout', () => {
      setUserId(null)
      setUserName(null)
      setAllTodo(null)
      netlifyIdentity.close()
    })
  }, [])

  const handleOpenTimeline = () => {
    setPage('timeline')
    setTimelineOutline('')
    setProfileOutline('outline')
  }

  const handleOpenProfile = () => {
    setPage('profile')
    setTimelineOutline('outline')
    setProfileOutline('')
  }

  const handleCreate = async e => {
    e.preventDefault()

    try {
      await fetch('.netlify/functions/todosCreate', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          todo: createTodoField
        })
      })

      fetchTodo()
      setCreateTodoField('')

    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async todo => {
    try {
      await fetch('.netlify/functions/todosDelete', {
        method: 'DELETE',
        body: JSON.stringify({
          todoId: todo.ref['@ref'].id
        })
      })

      fetchTodo()

    } catch (error) {
      console.error(error);
    }
  }

  const handleUpdate = async e => {
    e.preventDefault()

    try {
      await fetch('.netlify/functions/todosUpdate', {
        method: 'PUT',
        body: JSON.stringify({
          todoId: updateId,
          todo: updateTodoField,
          finished: updateFinishedField
        })
      })

      fetchTodo()
      handleUpdateModalClose()

    } catch (error) {
      console.error(error);
    }
  }

  const handleUpdateInfo = todo => {
    setUpdateId(todo.ref['@ref'].id)
    setUpdateTodoField(todo.data.todo)
    setUpdateFinishedField(todo.data.finished)

    handleUpdateModalOpen()
  }

  const handleUpdateModalOpen = () => {
    updateRef.current.showModal()
  }

  const handleUpdateModalClose = () => {
    console.log('close');
    updateRef.current.close()
  }

  const postForm = <>
    <form onSubmit={e => handleCreate(e)}>
      <textarea
        style={{ height: "50vh" }}
        value={createTodoField}
        onChange={e => setCreateTodoField(e.target.value)}
      />
      <input type="submit" value="Post" />
    </form>

    <dialog ref={updateRef}>
      <article>
        <header>
          <button aria-label="Close" rel="prev"
            onClick={() => handleUpdateModalClose()}
          ></button>
        </header>

        <form onSubmit={e => handleUpdate(e)}>
          <textarea
            style={{ height: "70vh" }}
            value={updateTodoField}
            onChange={e => setUpdateTodoField(e.target.value)}
          />
          <input type="submit" value="Update" />
        </form>
      </article>
    </dialog>
  </>

  const postContent = <table>
    <tbody>
      {allTodo?.map(todo => (
        <tr key={todo.ref['@ref'].id}>
          <td>
            <p>{todo.data.todo}</p>
          </td>

          <td style={{
            textAlign: 'right',
            paddingTop: '0',
            paddingBottom: '1rem'
          }}>
            <button onClick={() => handleUpdateInfo(todo)}>Update</button>
            <button onClick={() => handleDelete(todo)}>Delete</button>
          </td>
        </tr>
      )).slice().reverse()}
    </tbody>
  </table>

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

      {page == 'timeline' ?
        (
          <p>timeline</p>

        ) : null
      }

      {page == 'profile' ? (
        <>
          {netlifyIdentity.currentUser() ?
            (<>{postForm}</>) :
            (<h2 style={{ textAlign: 'center' }}>Please login to see your post</h2>)
          }

          {isLoadingTodo ?
            (<p>Loading...</p>) :
            (<>{postContent}</>)
          }
        </>

      ) : null
      }

    </div>
  )
}

export default App
