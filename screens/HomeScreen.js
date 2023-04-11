import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { firebase } from '../config'

const auth = firebase.auth()

const HomeScreen = () => {

  return (
    <View style={styles.container}>
      <Text>HomeScreen</Text>
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
})