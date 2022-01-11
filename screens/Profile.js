import { StatusBar } from 'expo-status-bar'
import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
} from 'react-native'
import Constants from 'expo-constants'
import GlobalContext from '../context/Context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { askForPermission, pickImage, uploadImage } from '../utils'
import { auth, db } from '../firebase'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'

const Profile = () => {
  const [displayName, setDisplayName] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState(null)

  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      const status = await askForPermission()
      setPermissionStatus(status)
    })()
  }, [])

  const {
    theme: { colors },
  } = useContext(GlobalContext)

  const handlePress = async () => {
    const user = auth.currentUser
    let photoURL
    if (selectedImage) {
      const { url } = await uploadImage(
        selectedImage,
        `images/${user.uid}`,
        'profilePicture'
      )
      photoURL = url
    }
    const userData = {
      displayName,
      email: user.email,
    }

    if (photoURL) {
      userData.photoURL = photoURL
    }
    // allows awaiting parallel tasks
    await Promise.all([
      updateProfile(user, userData),
      // create new Firestore Doc
      setDoc(doc(db, 'users', user.uid), { ...userData, uid: user.uid }),
    ])
    // then navigate away
    navigation.navigate('home')
  }

  const handleProfilePicture = async () => {
    const result = await pickImage()
    if (!result.cancelled) {
      setSelectedImage(result.uri)
    }
  }

  if (!permissionStatus) {
    return <Text>Loading...</Text>
  }
  if (permissionStatus != 'granted') {
    return <Text>Please allow permissions.</Text>
  }

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          //   make padding relevant to phone status bar
          paddingTop: Constants.statusBarHeight + 20,
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 22, color: colors.foreground }}>
          Profile Info
        </Text>
        <Text style={{ fontSize: 14, color: colors.text, marginTop: 20 }}>
          Please provide your name and a profile picture.
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            borderRadius: 120,
            width: 120,
            height: 120,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!selectedImage ? (
            <MaterialCommunityIcons
              name="camera-plus"
              color={colors.iconGray}
              size={45}
            />
          ) : (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: '100%', borderRadius: 120 }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Choose your display name"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            borderBottomColor: colors.primary,
            marginTop: 40,
            borderBottomWidth: 2,
            width: '100%',
          }}
        />
        <View style={{ marginTop: 'auto', width: 80 }}>
          <Button
            title="Next"
            color={colors.secondary}
            onPress={handlePress}
            disabled={!displayName}
          />
        </View>
      </View>
    </React.Fragment>
  )
}

export default Profile
