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

const scalingFactor = 0.8; // Adjust the scaling factor as needed

const styles = StyleSheet.create({
  container: {
    padding: 10 * scalingFactor,
  },
  card: {
    backgroundColor: '#213A5C',
    borderRadius: 15 * scalingFactor,
    padding: 20 * scalingFactor,
    alignItems: 'center',
    marginTop: 30 * scalingFactor,
    width: '100%',
    height: 'auto',
  },
  cardTitle: {
    fontSize: 18 * scalingFactor,
    fontWeight: 'bold',
    marginTop: 15 * scalingFactor,
    marginBottom: 40 * scalingFactor,
    color: 'white',
  },
  cardText: {
    marginTop: 70 * scalingFactor,
    fontSize: 100 * scalingFactor,
    fontWeight: 'bold',
    color: 'white',
    paddingBottom: 20 * scalingFactor,
  },
  cardLine: {
    borderBottomWidth: 1 * scalingFactor,
    borderColor: '#F3BB01',
    width: '100%',
    marginBottom: 10 * scalingFactor,
  },
  spaceLine: {
    borderBottomWidth: 1 * scalingFactor,
    borderColor: '#213A5C',
    width: '100%',
    marginBottom: 10 * scalingFactor,
  },
  spacesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30 * scalingFactor,
  },
  space: {
    borderRadius: 15 * scalingFactor,
    padding: 20 * scalingFactor,
    alignItems: 'center',
    width: '100%',
    height: 'auto',
  },
  spaceTitle: {
    fontSize: 18 * scalingFactor,
    fontWeight: 'bold',
    color: '#213A5C',
    marginTop: 15 * scalingFactor,
    marginBottom: 5 * scalingFactor,
  },
  spaceText: {
    fontSize: 100 * scalingFactor,
    fontWeight: 'bold',
    marginTop: 20 * scalingFactor,
    paddingBottom: 20 * scalingFactor,
    color: '#213A5C',
  },
  button: {
    backgroundColor: '#213A5C',
    width: '60%',
    padding: 15 * scalingFactor,
    borderRadius: 10 * scalingFactor,
    alignItems: 'center',
    marginTop: 40 * scalingFactor,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16 * scalingFactor,
  },
});

