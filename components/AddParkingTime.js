import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { firebase } from '../config';
import { database } from 'firebase/compat/database';

const auth = firebase.auth()

export default function AddParkingTime({ userId }){
    const [operator_name, setOperatorName] = useState('')
  const [parkingTime, setParkingTime] = useState('');

  useEffect(() => { //Get User's Name
    firebase.firestore().collection('operators')
    .doc(auth.currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setOperatorName(snapshot.data().name)
      } else {
        console.log('user does not exist')
      }
    })
  })

  const handleAddParkingTime = () => {
    const now = Date.now();
    const userRef = firebase.database().ref('users/' + userId);
    
    // Add new parking time to history
    userRef.child('parking_time_history').push({
        operator_name: operator_name,
        start_time: now,
        duration: parkingTime
    });
  
    // Update current parking time
    userRef.update({ parking_time: { start_time: now, duration: parkingTime } });
  
    // Alert user that parking time has been added
    alert('Parking time added successfully');
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Duration (minutes)"
        value={parkingTime}
        onChangeText={setParkingTime}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
      />
      <TouchableOpacity onPress={handleAddParkingTime} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Start Parking</Text>
      </TouchableOpacity>
    </View>
  );
};