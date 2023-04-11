import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { firebase } from '../config';

const AddTransaction = ({ userId }) => {
  const [datetime, setDatetime] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddTransaction = async  () => {
    const userRef = firebase.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const currentEwallet = userDoc.data().e_wallet;
    const updatedEwallet = currentEwallet + parseFloat(amount);
    const now = new Date();
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const datetime = [date, time];

    firebase.firestore().collection('users')
      .doc(userId)
      .update({
        e_wallet: updatedEwallet,
        top_up_history: firebase.firestore.FieldValue.arrayUnion({
          datetime,
          amount: parseFloat(amount),
        })
      })
      .then(() => {
        alert('Transaction added successfully');
      })
      .catch((error) => {
        alert('Error adding transaction: ', error);
      });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
      />
      <TouchableOpacity onPress={handleAddTransaction} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Top-up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTransaction;