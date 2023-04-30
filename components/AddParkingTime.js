import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { firebase } from '../config';
import { database } from 'firebase/compat/database';

const auth = firebase.auth()

export default function AddParkingTime({ userId }){
  const [startTime, setStartTime] = useState(new Date());
  const [discount, setDiscount] = useState(false);
  const [userName, setUserName] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(userId).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setContactNumber(snapshot.data().number);
        setUserName(snapshot.data().name);
        const car = snapshot.data().vehicles.find((v) => v.isDefault)
        setCarPlate(car ? car.plateNo : '');
      } else {
        console.log('user does not exist')
      }
    })
  })

  const handleDiscount = () => {
    if (discount){
      setDiscount(false);
      return;
    }
    setDiscount(true);
  }

  const handleAddParkingTime = () => {
    const userRef = firebase.database().ref('users/' + userId);
    
    // Update current parking time
    userRef.update({ parking_time: { start_time: startTime.getTime() } });

    const parkingRef = firebase.database().ref('parking_availability');

    parkingRef.update({ occupied_spaces: firebase.database.ServerValue.increment(+1) }, (error) => {
      if (error) {
        alert('Error decrementing occupied_spaces:', error.message);
      } else {
        console.log('Occupied spaces incremented successfully.');
      }
    });

    const customerRef = firebase.database().ref('activeCustomer/' + userId);
    customerRef.update({ 
                        name: userName,  
                        check_in_time: startTime.getTime(), 
                        contact_number: contactNumber , 
                        discount: discount,
                        plate: carPlate
                       })

    // Alert user that parking time has been added
    alert('Parking time added successfully');
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity onPress={() => setStartTime(new Date())} style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}>
        <Text>{startTime.toLocaleString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDiscount} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Discount</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleAddParkingTime} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Start Parking</Text>
      </TouchableOpacity>
    </View>
  );
};