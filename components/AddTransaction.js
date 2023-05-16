import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../config';

const auth = firebase.auth()

export default function AddTransaction({ userId }){
  const [amount, setAmount] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [userName, setUserName] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [number, setNumber] = useState(null);
  const [carPlate, setCarPlate] = useState('');

  useEffect(() => {
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if (snapshot.exists) {
        setOperatorName(snapshot.get('name'));
      } else {
        console.log('Operator does not exist.');
      }
    })
  },[]);

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(userId).get()
    .then((snapshot) => {
      if(snapshot.exists){
        const data = snapshot.data().vehicles;
        setUserName(snapshot.get('name'))
        setProfilePicture(snapshot.get('profile_picture'));
        setNumber(snapshot.get('number'));
        if (data != undefined) {
          const car = data.find((v) => v.isDefault) 
          if (car) {
            setCarPlate(car ? car.plateNo : '');
          }
        } else {
          alert("User does not have a default car or haven't created a vehicle.");
        }
      } else {
        console.log(userId)
        console.log('user does not exist')
      }
    })
  }, []);

  const generateReferenceNumber = () => {
    const length = 10;
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddTransaction = async () => {
    console.log(amount);
    if (amount === "") {
      return;
    }
    
    const userRef = firebase.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const currentEwallet = userDoc.data().e_wallet;
    const updatedEwallet = currentEwallet + parseFloat(amount);
    
    const now = new Date();
    const date = now.toISOString();
    const formattedDate = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const datetime = [formattedDate, formattedTime];
    
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
  
    const referenceNumber = '800' + generateReferenceNumber();
  
    const operatorTransactionsRef = firebase.database().ref(`operators/${firebase.auth().currentUser.uid}/transactions`);
    
    await operatorTransactionsRef.push({
      operator_name: operatorName,
      number: number,
      user_name: userName,
      plate_no: carPlate,
      payment: parseFloat(amount),
      reference_number: referenceNumber,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
      top_up: true
    });
  
    const generalTransactionsRef = firebase.database().ref(`transactions`);
  
    await generalTransactionsRef.push({
      operator_name: operatorName,
      number: number,
      user_name: userName,
      plate_no: carPlate,
      payment: parseFloat(amount),
      reference_number: referenceNumber,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
      top_up: true
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
