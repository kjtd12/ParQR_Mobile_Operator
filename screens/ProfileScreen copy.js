import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { firebase } from '../config'
import {useNavigation} from '@react-navigation/core'

const auth = firebase.auth()

const ProfileScreen = () => {
  const [name, setName] = useState('')
  const navigation = useNavigation()

  const changePassword = () => {
    firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
    .then(() => {
      alert('Password reset email sent');
    }).catch((error) => {
      alert(error)
    })
  }

  useEffect(() => { //get operator's name
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setName(snapshot.data())
      } else {
        console.log(firebase.auth().currentUser.uid)
        console.log('user does not exist')
      }
    })
  })

  const handleSignout = () => {
      auth
      .signOut()
      .then(() => {
            navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  };

  const menuItems = [
    { id: '1', label: 'Edit Profile', description: 'Make changes to your profile', onPress: () => navigation.replace('Profiles',{screen: 'Edit Profile'}) },
    { id: '2', label: 'Security', description: 'Change Password', onPress: changePassword },
    { id: '3', label: 'Log out', description: 'Log out your account', onPress: handleSignout },
  ];

  const moreItems = [
    { id: '1', label: 'Help & Support', onPress: () => navigation.navigate('Profiles',{screen: 'Help & Support'}) },
    { id: '2', label: 'About App', onPress: () => navigation.navigate('Profiles',{screen: 'About App'}) },
  ];

  const renderMenuItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
        <Text style={styles.menuItemLabel}>{item.label}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  const renderMoreItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
        <Text style={styles.menuItemLabel}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
    <View style={styles.menuContainer}>
      <Text style={styles.title}>Profile</Text>
      <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' }}
          style={{ width: 80, height: 80, borderRadius: 40, marginRight: 25 }}
        />
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.email}>{data.number}</Text>
        </View>
      </View>
      <View style={{ borderBottomWidth: 1.5, borderColor: '#213A5C', marginBottom: 25 }} />
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        style={styles.menuList}
      />
    </View>
    <View style={styles.moreContainer}>
    <Text style={styles.moreTitle}>More</Text>
      <FlatList
        data={moreItems}
        renderItem={renderMoreItem}
        keyExtractor={(item) => item.id}
        style={styles.moreList}
      />
    </View>
  </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#213A5C'
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginBottom: 30,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
    elevation: 3,
    padding: 15,
    width: '95%',
    marginBottom: 10,
  },
  menuList: {
    width: '100%',
  },
  menuItem: {
    padding: 10,
    backgroundColor: '#fff',
  },
  menuItemLabel: {
    fontSize: 18,
  },
  menuItemDescription: {
    fontSize: 16,
    color: '#aaa', // set color to light gray
  },
  moreContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
    elevation: 3,
    padding: 15,
    width: '95%',
  },
  moreList: {
    width: '100%',
  },
  moreTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  moreItemLabel: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
});