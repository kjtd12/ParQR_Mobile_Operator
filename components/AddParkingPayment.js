import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../config';

export default function AddParkingPayment({ userId, operatorName}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

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
      const { e_wallet } = userData;

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

      await parkingRef.child('parking_time_history').push({
        operator_name: operatorName,
        start_time: parkingTimeData.start_time,
        duration: parkingTimeData.duration,
        payment: amount,
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
