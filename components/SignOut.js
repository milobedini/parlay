import React, { useContext } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Context from '../context/Context'
import { useNavigation } from '@react-navigation/native'
import { auth } from '../firebase'

const SignOut = () => {
  const navigation = useNavigation()
  const {
    theme: { colors },
  } = useContext(Context)
  return (
    <TouchableOpacity
      onPress={async () => {
        console.log(auth.currentUser)
        await auth.signOut()
        console.log(auth.currentUser)
      }}
      style={{
        marginTop: '99%',
        marginLeft: 20,
        borderRadius: 60,
        width: 60,
        height: 60,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons
        name="logout"
        size={30}
        color="white"
        style={{ transform: [{ scaleX: -1 }] }}
      />
    </TouchableOpacity>
  )
}

export default SignOut
