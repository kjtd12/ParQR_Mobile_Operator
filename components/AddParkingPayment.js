import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { firebase } from '../config';

export default function AddParkingPayment({ userId, operatorName}) {
  const [amount, setAmount] = useState('');
  const [start_time, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
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
      const parkingRef = firebase.database().ref('users/' + userId);
      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        const { e_wallet } = userData;
        if (e_wallet >= amount) {
          await userRef.update({
            e_wallet: e_wallet - amount,
          });
          parkingRef.child('parking_time').once('value', (snapshot) => {
            const parkingTimeData = snapshot.val();
            parkingRef.child('parking_time_history').push({
                operator_name: operatorName,
                start_time: parkingTimeData.start_time,
                duration: parkingTimeData.duration,
                payment: amount
              });
          })
          alert('Parking Paid');
        } else {
          setError('Insufficient funds');
        }
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Parking Payment</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        onChangeText={(text) => setAmount(text)}
        value={amount}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Add Payment" onPress={handleAddPayment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
