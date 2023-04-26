import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '../config';
import { database } from 'firebase/compat/database';

const auth = firebase.auth()

export default function AddParkingTime({ userId }){
  const [parkingTime, setParkingTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleAddParkingTime = () => {
    const now = Date.now();
    const userRef = firebase.database().ref('users/' + userId);
  
    // Update current parking time
    userRef.update({ parking_time: { start_time: now, duration: parkingTime } });

    const parkingRef = firebase.database().ref('parking_availability');

    parkingRef.update({ occupied_spaces: firebase.database.ServerValue.increment(+1) }, (error) => {
      if (error) {
        alert('Error decrementing occupied_spaces:', error.message);
      } else {
        console.log('Occupied spaces incremented successfully.');
      }
    });


  
    // Alert user that parking time has been added
    alert('Parking time added successfully');
  };

  const handleTimePicker = (event, selectedDate) => {
    const currentDate = selectedDate || selectedDate;
    setShowPicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    const parkingTime = (currentDate.getTime() - new Date().getTime()) / (1000 * 60);
    setParkingTime(Math.ceil(parkingTime));
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}>
        <Text>{selectedDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimePicker}
        />
      )}
      <TouchableOpacity onPress={handleAddParkingTime} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Start Parking</Text>
      </TouchableOpacity>
    </View>
  );
};
