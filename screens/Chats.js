import { collection, onSnapshot, query, where } from 'firebase/firestore'
import React, { useContext, useEffect } from 'react'
import Context from '../context/Context'
import { View, Text } from 'react-native'
import { auth, db } from '../firebase'
import ContactsFloatingIcon from '../components/ContactsFloatingIcon'

const Chats = () => {
  const { currentUser } = auth
  const { rooms, setRooms } = useContext(Context)

  // query for chat rooms in firestore
  const chatsQuery = query(
    collection(db, 'rooms'),
    where('participantsArray', 'array-contains', currentUser.email)
  )

  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      //   only display conversations containing messages
      const parsedChats = querySnapshot.docs
        .filter((doc) => doc.data().lastMessage)
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          //   set the other user in the chat
          otherUser: doc
            .data()
            .participants.find((u) => u.email != currentUser.email),
        }))
      setRooms(parsedChats)
    })
    // exit realtime listener
    return () => unsubscribe()
  }, [])

  return (
    <View style={{ flex: 1, padding: 5, paddingRight: 10 }}>
      <Text></Text>
      <ContactsFloatingIcon />
    </View>
  )
}

export default Chats
