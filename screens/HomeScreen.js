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
      <View style={styles.card}>
        <Text style={styles.cardText}>{maxSpaces - occupiedSpaces}</Text>
        <View style={styles.cardLine}></View>
        <Text style={styles.cardTitle}>Available Parking Space</Text>
      </View>
      <View style={styles.spacesContainer}>
        <View style={styles.space}>
          <Text style={styles.spaceText}>{occupiedSpaces}</Text>
          <View style={styles.spaceLine}></View>
          <Text style={styles.spaceTitle}>Occupied Parking Space</Text>
        </View>
      </View>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    padding: 10
  },
  card: {
    backgroundColor: '#213A5C',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
    height: 'auto'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 40,
    color: 'white',
  },
  cardText: {
    marginTop: 70,
    fontSize: 100,
    fontWeight: 'bold',
    color: 'white',
    paddingBottom: 20,
  },
  cardLine: {
    borderBottomWidth: 1,
    borderColor: '#F3BB01',
    width: '100%',
    marginBottom: 10,
  },
  spaceLine: {
    borderBottomWidth: 1,
    borderColor: '#213A5C',
    width: '100%',
    marginBottom: 10,
  },
  spacesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  space: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    height: 'auto'
  },
  spaceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#213A5C',
    marginTop: 15,
    marginBottom: 5
  },
  spaceText: {
    fontSize: 100,
    fontWeight: 'bold',
    marginTop: 20,
    paddingBottom: 20,
    color: '#213A5C'
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
})
