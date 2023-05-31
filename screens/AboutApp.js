import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React from 'react'

const AboutApp = () => {
    const navigation = useNavigation();

  return (
    <View style={styles.container}>
        <Image
          source={ require('../assets/PARQRABOUT.png') }
        />
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.aboutApp}>About App</Text>
            <View style={{ width: 'auto' }} />
            <View style={{ backgroundColor: '#213A5C', borderRadius: 30, padding: 10, margin: 10 }}>
              <Image
                source={ require('../assets/icons/aboutSharp.png') }
              />
            </View>
          </View>
          <View style={{ width: '85%', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
            <Text style={{ fontSize: 18, }}>
                ParQR (Parker) is a mobile app designed to inform users about available parking spaces in a parking area. It streamlines the parking entry and exit process using QR codes and gathers data on which can be analyzed to make informed business decisions.
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center', backgroundColor: '#F3BB01', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 70 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Okay</Text>
          </TouchableOpacity>
        </View>
    </View>
  )
}

export default AboutApp

const styles = StyleSheet.create({
    container: {
      flex:1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#213A5C',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      marginTop: 30
    },
    aboutApp: {
      color: '#213A5C',
      fontSize: 28,
      fontWeight: 'bold',
      margin: 10
    }
})
