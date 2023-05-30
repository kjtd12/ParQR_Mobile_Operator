import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../config'
import React, { useState, useEffect } from 'react'
import { getStorage, ref, uploadBytes, getDownloadURL   } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const EditProfile = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { 
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setName(snapshot.get('name'));
        setAddress(snapshot.get('address'));
        setContactNumber(snapshot.get('phone_number'));
        setEmail(snapshot.get('email'));
        setProfilePicture(snapshot.get('profile_picture'));
      } else {
        console.log('user does not exist');
      }
    })
  }, []);

  const handleUpdateProfile = async () => {
    // Check if the new email is different from the current one
    if (email !== firebase.auth().currentUser.email) {
      try {
        // Update the email in Firebase Authentication
        await firebase.auth().currentUser.updateEmail(email);
      } catch (error) {
        // Error occurred while updating the email in Firebase Authentication
        alert('Error updating email: ', error.message);
        return;
      }
    }
  
    // Update the profile in Firestore
    const currentUser = firebase.auth().currentUser;
    const operatorRef = firebase.firestore().collection('operators');

    // Check if the email already exists in other user accounts
    const operatorSnapshot = await operatorRef
      .where('email', '==', email)
      .where(firebase.firestore.FieldPath.documentId(), '!=', currentUser.uid)
      .get();

    if (!operatorSnapshot.empty) {
      // Email already exists in a different operator
      alert('Email already exists and is already in use on another account.');
      return;
    }

    if (selectedImage) {
      // Upload the image and update the profile picture
      const storage = getStorage();
      const imageRef = ref(storage, `operator_profiles/${currentUser.uid}.jpg`);
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      const photoUrl = await getDownloadURL(imageRef);

      // Update the user's profile picture URL in Firestore
      const userRef = firebase.firestore().collection('operators').doc(currentUser.uid);
      await userRef.update({ profile_picture: photoUrl });

      // Update the local state to trigger a re-render
      setProfilePicture(photoUrl);
    }
  
    operatorRef
      .doc(firebase.auth().currentUser.uid)
      .update({
        name: name,
        address: address,
        phone_number: contactNumber,
        email: email
      })
      .then(() => {
        alert('Updated successfully');
      })
      .catch((error) => {
        alert('Error updating: ', error);
      });
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (result.canceled) {
        return;
      }
  
      setSelectedImage(result.assets[0].uri);
    } catch (error) {
      // Handle the error
      console.log(error);
    }
  };

  const profileImage = profilePicture ? { uri: profilePicture } : { uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.cardTop}>
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row',  alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => navigation.replace('App', { screen: 'Profile' })} style={{ flex: 1, alignItems: 'flex-start' }}>
              <Image
                source={ require('../assets/icons/ArrowLeft.png') }
              />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#213A5C', fontSize: 16, fontWeight: 'bold' }}>Edit Profile</Text>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 30 }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleUploadPhoto}>
            <Image
              source={profileImage && { uri: profileImage.uri }}
              style={{ width: 140, height: 140, borderRadius: 70 }}
            />
            <Image
              source={ require('../assets/icons/ProfileEdit.png') }
              style={{ width: 24, height: 18.75, position: 'absolute', top: 0, right: 5 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.editContainer]}>
        <View style={styles.cards}>
          <Text style={styles.editTitle}>Name</Text>
          <TextInput
            style={styles.editInput}
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </View>
        <View style={styles.cards}>
          <Text style={styles.editTitle}>Address</Text>
          <TextInput
            style={styles.editInput}
            value={address}
            onChangeText={(text) => setAddress(text)}
          />
        </View>
        <View style={styles.cards}>
          <Text style={styles.editTitle}>Contact Number</Text>
          <TextInput
            style={styles.editInput}
            value={contactNumber}
            onChangeText={(text) => setContactNumber(text)}
          />
        </View>
        <View style={styles.cards}>
          <Text style={styles.editTitle}>E-Mail Address</Text>
          <TextInput
            style={styles.editInput}
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
        </View>
      </View>
      <View style={{ alignItems: 'center'}}>
        <TouchableOpacity onPress={handleUpdateProfile} style={{ backgroundColor: "#213A5C", paddingVertical: 20, paddingHorizontal: 90, borderRadius: 10, marginTop: 10 }}>
          <Text style={{ color: 'white' }}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default EditProfile

const scalingFactor = 0.7; // Adjust the scaling factor value as needed

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    // Apply scaling to margin and padding
    marginVertical: 10 * scalingFactor,
    paddingHorizontal: 7 * scalingFactor,
  },
  editContainer: {
    marginVertical: 20 * scalingFactor,
    paddingHorizontal: 7 * scalingFactor,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10 * scalingFactor,
  },
  editTitle: {
    color: '#777',
    fontSize: 20 * scalingFactor,
  },
  cardTop: {
    marginTop: 40 * scalingFactor,
    borderRadius: 7 * scalingFactor,
    padding: 16 * scalingFactor,
    width: '100%',
  },
  cards: {
    backgroundColor: '#fff',
    borderRadius: 7 * scalingFactor,
    padding: 16 * scalingFactor,
    marginVertical: 10 * scalingFactor,
    borderWidth: 0.5 * scalingFactor,
    borderColor: '#ddd',
    width: '100%',
  },
});
