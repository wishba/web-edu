import React from 'react'

export default function hello({ userName }) {
  return (
    <a href={`/.netlify/functions/hello?name=${userName}`} target="_blank" rel="noopener noreferrer">test netlify function</a>
  )
}
