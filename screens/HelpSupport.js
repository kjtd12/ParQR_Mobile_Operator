import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React from 'react'

const HelpSupport = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.replace('App', {screen: 'Profile'})}>
        <Text>Back</Text>
      </TouchableOpacity>
      <Text>HelpSupport</Text>
    </View>
  )
}

export default HelpSupport

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})