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

  return (
    <div className='container'>
      <br />
      <nav>
        <h1 style={{
          backgroundImage: 'linear-gradient(90deg, #d92662, #2060df)',
          backgroundClip: 'text',
          color: 'transparent'
        }}>To-do list app</h1>

        <button onClick={() => netlifyIdentity.open()}>
          {userName ? 'Logout' : 'Login / Signup'}
        </button>
      </nav>
      <br />

      {netlifyIdentity.currentUser() ?
        (
          <>
            <form onSubmit={e => handleCreate(e)}>
              <fieldset role='group'>
                <input type="text"
                  value={createTodoField}
                  onChange={e => setCreateTodoField(e.target.value)}
                />
                <input type="submit" value="Create" />
              </fieldset>
            </form>

            <dialog ref={updateRef}>
              <article>
                <header>
                  <button aria-label="Close" rel="prev"
                    onClick={() => handleUpdateModalClose()}
                  ></button>
                </header>

                <form onSubmit={e => handleUpdate(e)}>
                  <input type="text"
                    value={updateTodoField}
                    onChange={e => setUpdateTodoField(e.target.value)}
                  />
                  <label>
                    <span>Finished </span>
                    <input type="checkbox"
                      checked={updateFinishedField}
                      onChange={() => setUpdateFinishedField(!updateFinishedField)}
                    />
                  </label>
                  <input type="submit" value="Update" />
                </form>
              </article>
            </dialog>
          </>
        ) : (
          <>
            <br />
            <br />
            <h2 style={{ textAlign: 'center' }}>Hello! Please login to see your to-do</h2>
          </>
        )
      }

      {isLoadingTodo ?
        (
          <p>Loading...</p>
        ) :
        (
          <table>
            <tbody>
              {allTodo?.map(todo => (
                <tr key={todo.ref['@ref'].id}>
                  <td>
                    <p>Todo: {todo.data.todo}</p>
                    <p>Finished: {JSON.stringify(todo.data.finished)}</p>
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
        )
      }
    </div>
  )
}

export default App
