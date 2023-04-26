import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { firebase } from '../config'
import { database } from 'firebase/compat/database';

const db = firebase.database().ref('parking_availability')

const HomeScreen = () => {
  const [occupiedSpaces, setOccupiedSpaces] = useState(null)
  const [maxSpaces, setMaxSpaces] = useState(null)

  useEffect(() => {
    db.on('value', (snapshot) => {
      const data = snapshot.val()
      setOccupiedSpaces(data.occupied_spaces)
      setMaxSpaces(data.max_spaces)
    })
  }, [])

  return (
    <View style={styles.container}>
      <Text>Available Spaces: {maxSpaces - occupiedSpaces}</Text>
      <Text>Occupied Spaces: {occupiedSpaces}</Text>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#213A5C",
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: '700',
    fontSize: 16
  }
});