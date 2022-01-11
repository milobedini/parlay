import Context from './Context'
import React, { useState } from 'react'
import { theme } from '../utils'

export default function ContextWrapper(props) {
  // control rooms
  const [rooms, setRooms] = useState([])
  const [unfilteredRooms, setUnfilteredRooms] = useState([])

  return (
    <Context.Provider
      value={{ theme, rooms, setRooms, unfilteredRooms, setUnfilteredRooms }}
    >
      {props.children}
    </Context.Provider>
  )
}
