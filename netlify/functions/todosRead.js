import 'dotenv/config'
import faunadb from 'faunadb'

const q = faunadb.query
const adminClient = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

export async function handler(event) {
  const { userId } = JSON.parse(event.body)

  try {
    const results = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Match(q.Index('todo-by-userId'), userId)
        ),
        (todoRef) => q.Get(todoRef)
      )
    )

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    }

  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}