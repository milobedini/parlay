// @refresh reset
import { useRoute } from '@react-navigation/native'
import 'react-native-get-random-values'
import { nanoid } from 'nanoid'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native'
import { auth, db } from '../firebase'
import Context from '../context/Context'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import {
  Actions,
  Bubble,
  GiftedChat,
  InputToolbar,
} from 'react-native-gifted-chat'
import { pickImage, uploadImage } from '../utils'
import ImageView from 'react-native-image-viewing'

const Chat = () => {
  // security
  const [roomHash, setRoomHash] = useState('')
  const [messages, setMessages] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedImageView, setSelectedImageView] = useState('')
  const {
    theme: { colors },
  } = useContext(Context)
  const { currentUser } = auth
  const route = useRoute()
  const room = route.params.room
  const selectedImage = route.params.image
  const otherUser = route.params.user
  //   console.log(otherUser)
  const randomId = nanoid()

  const senderUser = currentUser.photoURL
    ? //   conditional object
      {
        name: currentUser.displayName,
        _id: currentUser.uid,
        avatar: currentUser.photoURL,
      }
    : { name: currentUser.displayName, _id: currentUser.uid }

  // if room exists, get that id, otherwise generate a random id
  const roomId = room ? room.id : randomId

  //   firestore reference
  const roomRef = doc(db, 'rooms', roomId)

  // reference the messages sub-collection in the room collection
  const roomMessagesRef = collection(db, 'rooms', roomId, 'messages')

  useEffect(() => {
    ;(async () => {
      if (!room) {
        //   if no room, create a room
        const currentUserData = {
          displayName: currentUser.displayName,
          email: currentUser.email,
        }
        if (currentUser.photoURL) {
          currentUserData.photoURL = currentUser.photoURL
        }
        const otherUserData = {
          displayName: otherUser.contactName || otherUser.displayName || '',
          email: otherUser.email,
        }
        if (otherUser.photoURL) {
          otherUserData.photoURL = otherUser.photoURL
        }
        const roomData = {
          participants: [currentUserData, otherUserData],
          participantsArray: [currentUser.email, otherUser.email],
        }
        try {
          await setDoc(roomRef, roomData)
        } catch (error) {
          console.log(error)
        }
      }
      const emailHash = `${currentUser.email}:${otherUser.email}`
      setRoomHash(emailHash)
      if (selectedImage && selectedImage.uri) {
        await sendImage(selectedImage.uri, emailHash)
      }
    })()
  }, [])

  useEffect(() => {
    //   fetch the room messages
    const unsubscribe = onSnapshot(roomMessagesRef, (querySnapshot) => {
      // listens for when the doc changes. Only for when messages added.
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === 'added')
        .map(({ doc }) => {
          const message = doc.data()
          //   add timestamp to the messages
          return { ...message, createdAt: message.createdAt.toDate() }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  //   below hook returns a memorised version of the callback unless the inputs change
  const appendMessages = useCallback(
    (messages) => {
      setMessages((prevMessages) => GiftedChat.append(prevMessages, messages))
    },
    [messages]
  )

  const onSend = async (messages = []) => {
    //   adds message to room
    const writes = messages.map((message) => addDoc(roomMessagesRef, message))
    const lastMessage = messages[messages.length - 1]
    // updates the room with the last message
    writes.push(updateDoc(roomRef, { lastMessage }))
    await Promise.all(writes)
  }

  const sendImage = async (uri, roomPath) => {
    const { url, fileName } = await uploadImage(
      uri,
      `images/rooms/${roomPath || roomHash}`
    )
    // send a new message
    const message = {
      _id: fileName,
      text: '',
      createdAt: new Date(),
      user: senderUser,
      image: url,
    }
    const lastMessage = { ...message, text: 'Image' }
    await Promise.all([
      addDoc(roomMessagesRef, message),
      updateDoc(roomRef, { lastMessage }),
    ])
  }

  const handlePhotoPicker = async () => {
    const result = await pickImage()
    if (!result.cancelled) {
      await sendImage(result.uri)
    }
  }

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../assets/chatbg.png')}
      style={{
        flex: 1,
      }}
    >
      <GiftedChat
        messages={messages}
        user={senderUser}
        renderAvatar={null}
        onSend={onSend}
        renderActions={(props) => (
          <Actions
            {...props}
            containerStyle={{
              position: 'absolute',
              right: 50,
              bottom: 5,
              zIndex: 9999,
            }}
            onPressActionButton={handlePhotoPicker}
            icon={() => (
              <Ionicons name="camera" size={30} color={colors.iconGray} />
            )}
          />
        )}
        timeTextStyle={{ right: { color: colors.iconGray } }}
        renderSend={(props) => {
          const { text, messageIdGenerator, user, onSend } = props
          return (
            <TouchableOpacity
              style={{
                height: 40,
                width: 40,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 5,
              }}
              onPress={() => {
                if (text && onSend) {
                  onSend(
                    {
                      text: text.trim(),
                      user,
                      _id: messageIdGenerator(),
                    },
                    true
                  )
                }
              }}
            >
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          )
        }}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              marginLeft: 10,
              marginRight: 10,
              marginBottom: 2,
              borderRadius: 20,
              paddingTop: 5,
            }}
          />
        )}
        renderBubble={(props) => (
          <Bubble
            {...props}
            textStyle={{ right: { color: colors.text } }}
            wrapperStyle={{
              left: { backgroundColor: colors.white },
              right: { backgroundColor: colors.tertiary },
            }}
          />
        )}
        renderMessageImage={(props) => (
          <View style={{ borderRadius: 15, padding: 2 }}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true)
                setSelectedImageView(props.currentMessage.image)
              }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: 200,
                  height: 200,
                  padding: 6,
                  borderRadius: 15,
                  resizeMode: 'cover',
                }}
                source={{ uri: props.currentMessage.image }}
              />
              {selectedImageView ? (
                <ImageView
                  imageIndex={0}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                  images={[{ uri: selectedImageView }]}
                />
              ) : null}
            </TouchableOpacity>
          </View>
        )}
      />
    </ImageBackground>
  )
}

export default Chat
