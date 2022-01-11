import { collection, onSnapshot, query, where } from 'firebase/firestore'
import React, { useContext, useEffect } from 'react'
import Context from '../context/Context'
import { View, Text } from 'react-native'
import { auth, db } from '../firebase'
import ContactsFloatingIcon from '../components/ContactsFloatingIcon'
import ListItem from '../components/ListItem'
import useContacts from '../hooks/useHooks'
import SignOut from '../components/SignOut'

const Chats = () => {
  const { currentUser } = auth
  const { rooms, setRooms, setUnfilteredRooms } = useContext(Context)
  const contacts = useContacts()

  // query for chat rooms in firestore
  const chatsQuery = query(
    collection(db, 'rooms'),
    where('participantsArray', 'array-contains', currentUser.email)
  )

  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      //   only display conversations containing messages
      const parsedChats = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        //   set the other user in the chat
        otherUser: doc
          .data()
          .participants.find((u) => u.email != currentUser.email),
      }))
      setUnfilteredRooms(parsedChats)
      setRooms(parsedChats.filter((doc) => doc.lastMessage))
    })
    // exit realtime listener
    return () => unsubscribe()
  }, [])

  const getOtherUser = (user, contacts) => {
    const userContact = contacts.find((c) => c.email === user.email)
    if (userContact && userContact.contactName) {
      return { ...user, contactName: userContact.contactName }
    }
    return user
  }

  return (
    <View style={{ flex: 1, padding: 5, paddingRight: 10 }}>
      {rooms.map((room) => (
        <ListItem
          type="chat"
          description={room.lastMessage.text}
          key={room.id}
          room={room}
          time={room.lastMessage.createdAt}
          user={getOtherUser(room.otherUser, contacts)}
        />
      ))}
      {/* <SignOut /> */}
      <ContactsFloatingIcon />
    </View>
  )
}

export default Chats
