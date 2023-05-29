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
    { id: '1', label: 'About App', onPress: () => navigation.navigate('Profiles',{screen: 'About App'}), imagePath: require('../assets/profileIcons/AboutApp.png') },
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

const scalingFactor = 0.8;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Math.round(24 * scalingFactor),
    fontWeight: 'bold',
    marginBottom: Math.round(15 * scalingFactor),
    color: '#213A5C',
  },
  name: {
    fontSize: Math.round(22 * scalingFactor),
    fontWeight: 'bold',
    marginBottom: Math.round(10 * scalingFactor),
  },
  email: {
    fontSize: Math.round(18 * scalingFactor),
    marginBottom: Math.round(30 * scalingFactor),
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
    padding: Math.round(15 * scalingFactor),
    width: '95%',
    marginBottom: Math.round(10 * scalingFactor),
    marginTop: Math.round(60 * scalingFactor),
  },
  menuList: {
    width: '100%',
  },
  menuItem: {
    paddingVertical: Math.round(10 * scalingFactor),
    backgroundColor: '#fff',
  },
  menuItemLabel: {
    fontSize: Math.round(18 * scalingFactor),
  },
  menuItemDescription: {
    fontSize: Math.round(12 * scalingFactor),
    color: '#aaa',
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
    padding: Math.round(15 * scalingFactor),
    width: '95%',
  },
  moreList: {
    width: '100%',
  },
  moreTitle: {
    fontSize: Math.round(15 * scalingFactor),
    fontWeight: 'bold',
    marginBottom: Math.round(10 * scalingFactor),
  },
  moreItemLabel: {
    fontSize: Math.round(16 * scalingFactor),
    color: '#aaa',
    marginTop: Math.round(5 * scalingFactor),
  },
});