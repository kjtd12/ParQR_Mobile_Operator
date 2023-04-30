import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { firebase } from '../config';

export default function AddParkingPayment({ userId, operatorName, operatorUid }) {
  let [payment, setPayment] = useState(40);
  const [start_time, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const parkingRef = firebase.database().ref(`users/${userId}/parking_time`);
    parkingRef.on('value', (snapshot) => {
      const parkingTimeData = snapshot.val();
      setStartTime(parkingTimeData.start_time);
      setDuration((new Date().getTime() - parkingTimeData.start_time)/1000);
    });
  
    return () => {
      parkingRef.off();
    };
  }, [userId]);
  
  const generateReferenceNumber = () => {
    const length = 10;
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddPayment = async () => {
    try {
      const db = firebase.firestore();
      const userRef = db.collection('users').doc(userId);
      const userSnapshot = await userRef.get();
  
      if (!userSnapshot.exists) {
        setError('User does not exist');
        return;
      }
  
      const userData = userSnapshot.data();
      const { e_wallet, name, vehicles } = userData;

      if (name == null) {
        setError('User name is null');
        return;
      }
  
      const defaultVehicle = vehicles.find((v) => v.isDefault);
      const plateNo = defaultVehicle ? defaultVehicle.plateNo : '';
      setVehicle(defaultVehicle);

      const parkingRef = firebase.database().ref(`users/${userId}`);
      const parkingTimeSnapshot = await parkingRef.child('parking_time').once('value');
      const parkingTimeData = parkingTimeSnapshot.val();
  
      const durationInHours = Math.ceil(parkingTimeData.duration / (60 * 60 * 1000));
      const additionalHours = durationInHours - 3;
  
      let paymentAmount = 40;
  
      if (additionalHours > 0) {
        paymentAmount += additionalHours * 20;
      }
  
      setPayment(paymentAmount);
  
      if (e_wallet < paymentAmount) {
        setError('Insufficient funds');
        return;
      }
  
      await userRef.update({
        e_wallet: e_wallet - paymentAmount,
      });
  
      const referenceNumber = '800' + generateReferenceNumber();
  
      await parkingRef.child('parking_time_history').push({
        operator_name: operatorName,
        user_name: name,
        plate_no: plateNo,
        start_time: parkingTimeData.start_time,
        duration: duration,
        payment: paymentAmount,
        reference_number: referenceNumber,
      });
  
      const operatorTransactionsRef = firebase.database().ref(`operators/${operatorUid}/transactions`);
      const date = new Date().toISOString();
  
      await operatorTransactionsRef.push({
        user_name: name,
        plate_no: plateNo,
        start_time: parkingTimeData.start_time,
        duration: duration,
        payment: paymentAmount,
        reference_number: referenceNumber,
        date: date,
      });

      parkingRef.child('parking_time').update({
        start_time: 0,
        duration: 0
      });

      const parkingAvailabilityRef = firebase.database().ref('parking_availability');
      parkingAvailabilityRef.update({ occupied_spaces: firebase.database.ServerValue.increment(-1) }, (error) => {
        if (error) {
          alert('Error decrementing occupied_spaces:', error.message);
        } else {
          console.log('Occupied spaces decremented successfully.');
        }
      });

      const customerRef = firebase.database().ref('activeCustomer/' + userId);
      customerRef.remove();
      
  
      alert('Parking Paid');
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
  };

  let startTime = '00:00';
  let endTime = '00:00';

  if (start_time !== 0 && duration !== 0) {
    startTime = new Date(start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    endTime = new Date(start_time + duration * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  if (startTime === '00:00'){
    payment = 0;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16 }}>Start: {startTime}</Text>
      <Text style={{ fontSize: 16 }}>End: {endTime}</Text>
      <Text style={{ fontSize: 16 }}>Payment: PHP {payment}</Text>
      <TouchableOpacity onPress={handleAddPayment} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}
