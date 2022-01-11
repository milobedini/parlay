import { useRoute } from '@react-navigation/native'
import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import Avatar from './Avatar'
import Context from '../context/Context'

const ChatHeader = () => {
  const route = useRoute()
  const {
    theme: { colors },
  } = useContext(Context)

  return (
    <View style={{ flexDirection: 'row' }}>
      <View>
        <Avatar size={40} user={route.params.user} />
      </View>
      <View
        style={{
          marginLeft: 15,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.white, fontSize: 18 }}>
          {route.params.user.contactName || route.params.user.displayName}
        </Text>
      </View>
    </View>
  )
}

export default ChatHeader
