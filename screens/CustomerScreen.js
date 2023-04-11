import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const CustomerScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Customer Screen</Text>
    </View>
  )
}

export default CustomerScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
})