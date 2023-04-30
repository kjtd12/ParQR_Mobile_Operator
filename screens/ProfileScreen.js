import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { firebase } from '../config'
import {useNavigation} from '@react-navigation/core'

const auth = firebase.auth()

const ProfileScreen = () => {
  const [data, setData] = useState('')
  const [profilePicture, setProfilePicture] = useState(null);
  const navigation = useNavigation()

  const changePassword = () => {
    firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
    .then(() => {
      alert('Password reset email sent');
    }).catch((error) => {
      alert(error)
    })
  };

  useEffect(() => {
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setData(snapshot.data())
        setProfilePicture(snapshot.get('profile_picture'));
      } else {
        console.log(firebase.auth().currentUser.uid)
        console.log('user does not exist')
      }
    })
  }, []);

  const handleSignout = () => {
      auth
      .signOut()
      .then(() => {
            navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  };

  const menuItems = [
    { id: '1', label: 'Edit Profile', description: 'Make changes to your profile', onPress: () => navigation.navigate('Profiles',{screen: 'Edit Profile'}), imagePath: require('../assets/profileIcons/EditProfile.png') },
    { id: '2', label: 'Security', description: 'Change Password', onPress: changePassword, imagePath: require('../assets/profileIcons/Security.png') },
    { id: '3', label: 'Log out', description: 'Log out your account', onPress: handleSignout, imagePath: require('../assets/profileIcons/Logout.png') },
  ];

  const moreItems = [
    { id: '1', label: 'Help & Support', onPress: () => navigation.navigate('Profiles',{screen: 'Help & Support'}), imagePath: require('../assets/profileIcons/Help.png') },
    { id: '2', label: 'About App', onPress: () => navigation.navigate('Profiles',{screen: 'About App'}), imagePath: require('../assets/profileIcons/AboutApp.png') },
  ];

  const renderMenuItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: '#F5F5F5', borderRadius: 25, padding: 10 }}>
              <Image 
                source={ item.imagePath }
                style={{ tintColor: '#213A5C', width: 20, height: 20 }}
              />
            </View>
            <View style={{ padding: 5 }}>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
          </View>
          <Image
            source={require('../assets/profileIcons/rightArrow.png')}
            style={{ margin: 5 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMoreItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: '#F5F5F5', borderRadius: 25, padding: 10 }}>
              <Image 
                source={ item.imagePath }
                style={{ tintColor: '#213A5C', width: 20, height: 20 }}
              />
            </View>
            <View style={{ alignItems: 'center', paddingHorizontal: 5, paddingVertical: 10 }}>
              <Text style={[styles.menuItemLabel, { alignItems: 'center'  }]}>{item.label}</Text>
            </View>
          </View>
          <Image
            source={require('../assets/profileIcons/rightArrow.png')}
            style={{ margin: 5 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const profileImage = profilePicture ? { uri: profilePicture } : { uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Text style={styles.title}>Profile</Text>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 }}>
          <Image
            source={profileImage && { uri: profileImage.uri }}
            style={{ width: 100, height: 100, borderRadius: 50, marginRight: 40 }}
          />
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.email}>OPERATOR</Text>
          </View>
        </View>
        <View style={{ borderBottomWidth: 1.5, borderColor: '#213A5C', marginBottom: 15 }} />
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
    marginTop: 40,
  },
  menuList: {
    width: '100%',
  },
  menuItem: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  menuItemLabel: {
    fontSize: 16,
  },
  menuItemDescription: {
    fontSize: 10,
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