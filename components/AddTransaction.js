import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../config';

const auth = firebase.auth()

export default function AddTransaction({ userId }){
  const [amount, setAmount] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(userId).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setUserName(snapshot.get('name'))
        setProfilePicture(snapshot.get('profile_picture'));
      } else {
        console.log(userId)
        console.log('user does not exist')
      }
    })
  }, []);

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

  const profileImage = profilePicture ? { uri: profilePicture } : { uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' };

  return (
    <View 
      style={{ 
        alignItems: 'center',
        justifyContent: 'center', 
        }}
      >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ paddingBottom: 10, color: '#213A5C' }}>Scanned Successfully</Text>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={profileImage}
            style={{ width: 100, height: 100, borderRadius: 50}}
          />
        </View>
        <Text style={{ padding: 10, color: '#213A5C' }}>{userName}</Text>
        <Text style={{ padding: 10, color: '#213A5C' }}>Enter the amount bellow</Text>
      </View>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ padding: 10, marginBottom: 10, width: 200, borderColor: '#213A5C', borderWidth: 0.7, borderRadius: 5 }}
      />
      <TouchableOpacity onPress={handleAddTransaction} style={{ backgroundColor: '#F3BB01', padding: 10, borderRadius: 5, width: 200 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Top-up</Text>
      </TouchableOpacity>
    </View>
  );
};
