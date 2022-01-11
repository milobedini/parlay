import React, { useState, useEffect, useContext } from 'react'
import { Text, View, LogBox } from 'react-native'
import { useAssets } from 'expo-asset'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import SignIn from './screens/SignIn'
import ContextWrapper from './context/ContextWrapper'
import Context from './context/Context'
import Profile from './screens/Profile'
import Chats from './screens/Chats'
import Photo from './screens/Photo'
import { Ionicons } from '@expo/vector-icons'
import Contacts from './screens/Contacts'
import Chat from './screens/Chat'
import ChatHeader from './components/ChatHeader'
import signOut from './components/SignOut'

LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native core and will be removed in a future release.',
])

const Stack = createStackNavigator()
const Tab = createMaterialTopTabNavigator()

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const {
    theme: { colors },
  } = useContext(Context)

  useEffect(() => {
    // unsubscribe from listener when component unmounts
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false)
      if (user) {
        setCurrentUser(user)
      }
    })
    // clean up function
    return () => unsubscribe()
  }, [])

  if (loading) {
    return <Text>Loading...</Text>
  }

  return (
    <NavigationContainer>
      {!currentUser ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="signIn" component={SignIn} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.foreground,
              shadowOpacity: 0,
              elevation: 0,
            },
            headerTintColor: colors.white,
          }}
        >
          {!currentUser.displayName && (
            <Stack.Screen
              name="profile"
              component={Profile}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="home"
            options={{ title: 'Parlay' }}
            component={Home}
          />

          <Stack.Screen
            name="contacts"
            options={{
              title: 'Select Recipient',
            }}
            component={Contacts}
          />
          <Stack.Screen
            name="chat"
            component={Chat}
            options={{
              headerTitle: (props) => <ChatHeader {...props} />,
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}

function Home({}) {
  const {
    theme: { colors },
  } = useContext(Context)
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // so we can have different logic depending on route
        return {
          tabBarLabel: () => {
            if (route.name === 'photo') {
              return <Ionicons name="camera" size={20} color={colors.white} />
            } else {
              return (
                <Text style={{ color: colors.white }}>
                  {route.name.toLocaleUpperCase()}
                </Text>
              )
            }
          },
          tabBarShowIcon: true,
          tabBarLabelStyle: {
            color: colors.white,
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.white,
          },
          tabBarStyle: {
            backgroundColor: colors.foreground,
          },
        }
      }}
      initialRouteName="chats"
    >
      {/* tab for photo and chats */}
      <Tab.Screen name="photo" component={Photo} />
      <Tab.Screen name="chats" component={Chats} />
    </Tab.Navigator>
  )
}

// preload assets using hook
function Main() {
  const [assets] = useAssets(
    require('./assets/icon-square.png'),
    require('./assets/chatbg.png'),
    require('./assets/user-icon.png'),
    require('./assets/welcome-img.png')
  )
  if (!assets) {
    return <Text>Loading...</Text>
  }

  return (
    <ContextWrapper>
      <App />
    </ContextWrapper>
  )
}

export default Main
