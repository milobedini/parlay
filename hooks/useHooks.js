// custom hook using other react hooks
import { useEffect, useState } from 'react'
import * as Contacts from 'expo-contacts'

export default function useContacts() {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    //   self invoking function syntax. First bracket is where the function goes.
    ;(async () => {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails],
        })
        if (data.length > 0) {
          setContacts(
            data
              .filter(
                // checking structure of expo contacts to make sure it has some.
                (c) =>
                  c.firstName && c.emails && c.emails[0] && c.emails[0].email
              )
              .map(mapContactToUser)
          )
        }
      }
    })()
  }, [])
  return contacts //value that hook returns
}

function mapContactToUser(contact) {
  return {
    contactName:
      contact.firstName && contact.lastName
        ? `${contact.firstName} ${contact.lastName}`
        : contact.firstName,
    email: contact.emails[0].email,
  }
}
