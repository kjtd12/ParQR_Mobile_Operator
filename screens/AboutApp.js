import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React from 'react'

const AboutApp = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.replace('App', {screen: 'Profile'})}>
            <Text>Back</Text>
        </TouchableOpacity>
        <Text>AboutApp</Text>
    </View>
  )
}

export default AboutApp

const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
  })