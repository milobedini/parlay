import Context from './Context'
import React, { useState } from 'react'
import { theme } from '../utils'

export default function ContextWrapper(props) {
  // control rooms
  const [rooms, setRooms] = useState([])

  return (
    <Context.Provider value={{ theme, rooms, setRooms }}>
      {props.children}
    </Context.Provider>
  )
}
