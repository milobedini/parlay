import React from 'react'
import { View, Text } from 'react-native'
import useContacts from '../hooks/useHooks'

const Contacts = () => {
  const contacts = useContacts()

  return (
    <View>
      <Text>{JSON.stringify(contacts)}</Text>
    </View>
  )
}

export default Contacts
