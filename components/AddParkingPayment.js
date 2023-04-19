import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../config';

export default function AddParkingPayment({ userId, operatorName, operatorUid }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [userName, setUserName] = useState(null);

  const generateReferenceNumber = () => {
    const length = 10;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddPayment = async () => {
    if (!amount) {
      setError('Please enter a valid amount');
      return;
    }

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

      // Get default vehicle and user name
      const defaultVehicle = vehicles.find((v) => v.isDefault);
      const plateNo = defaultVehicle ? defaultVehicle.plateNo : '';
      setVehicle(defaultVehicle);
      setUserName(name);

      if (e_wallet < amount) {
        setError('Insufficient funds');
        return;
      }

      await userRef.update({
        e_wallet: e_wallet - amount,
      });

      const parkingRef = firebase.database().ref(`users/${userId}`);
      const parkingTimeSnapshot = await parkingRef.child('parking_time').once('value');
      const parkingTimeData = parkingTimeSnapshot.val();

      const referenceNumber = generateReferenceNumber();

      await parkingRef.child('parking_time_history').push({
        operator_name: operatorName,
        user_name: userName,
        plate_no: plateNo,
        start_time: parkingTimeData.start_time,
        duration: parkingTimeData.duration,
        payment: amount,
        reference_number: referenceNumber,
      });

      const operatorTransactionsRef = firebase.database().ref(`operators/${operatorUid}/transactions`);
      const date = new Date().toISOString();

      await operatorTransactionsRef.push({
        user_name: userName,
        plate_no: plateNo,
        start_time: parkingTimeData.start_time,
        duration: parkingTimeData.duration,
        payment: amount,
        reference_number: referenceNumber,
        date: date,
      });

      alert('Parking Paid');
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        onChangeText={(text) => setAmount(text)}
        value={amount}
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
      />
      <TouchableOpacity onPress={handleAddPayment} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Add Payment</Text>
      </TouchableOpacity>
    </View>
  );
}
