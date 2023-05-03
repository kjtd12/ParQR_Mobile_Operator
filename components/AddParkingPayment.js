import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../config';

export default function AddParkingPayment({ userId, operatorName, operatorUid }) {
  let [payment, setPayment] = useState(40);
  const [start_time, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [configVisible, setConfigVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [userName, setUserName] = useState(null);
  const [byCash, setByCash] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

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
}, []);


  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(userId).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setProfilePicture(snapshot.get('profile_picture'));
      } else {
        console.log('user does not exist')
      }
    })
  })
  
  const generateReferenceNumber = () => {
    const length = 10;
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handlePayNow = () => {
    console.log("cash: " + byCash)
    setByCash(true)
    handlePayment();
    setDetailVisible(true);
    setConfigVisible(false);
  };
  
  const handlePayment = async () => {
    try {
      const db = firebase.firestore();
      const userRef = db.collection('users').doc(userId);
      const userSnapshot = await userRef.get();
  
      if (!userSnapshot.exists) {
        setError('User does not exist');
        return;
      }
  
      const userData = userSnapshot.data();
      const { e_wallet, name, vehicles, number } = userData;
  
      setUserName(name);
  
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

      await userRef.update({
        paymentStatus: true,
      });  
  
      setPayment(paymentAmount);
  
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
        number: number,
        user_name: name,
        plate_no: plateNo,
        start_time: parkingTimeData.start_time,
        duration: duration,
        payment: paymentAmount,
        reference_number: referenceNumber,
        date: date,
      });
  
      const generalTransactionsRef = firebase.database().ref(`transactions/${operatorUid}`);
  
      await generalTransactionsRef.push({
        number: number,
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
        duration: 0,
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

    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
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
      const { e_wallet, name, vehicles, number } = userData;

      setUserName(name);

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
        if (byCash == false) {
          await userRef.update({
            paymentStatus: false,
            balance: paymentAmount
          });  
          setDetailVisible(false);
          setConfigVisible(true);
        }
        setError('Insufficient funds');
        return;
      }

      setDetailVisible(true);

      await userRef.update({
        paymentStatus: true,
      });  

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
        number: number,
        user_name: name,
        plate_no: plateNo,
        start_time: parkingTimeData.start_time,
        duration: duration,
        payment: paymentAmount,
        reference_number: referenceNumber,
        date: date,
      });

      const generalTransactionsRef = firebase.database().ref(`transactions/${operatorUid}`);
  
      await generalTransactionsRef.push({
        number: number,
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
      
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
  };

  const parkingRef = firebase.database().ref(`users/${userId}/parking_time_history`);

  let startTime = '00:00';
  let endTime = '00:00';

  parkingRef.orderByChild('end_time').limitToLast(1).on('child_added', (snapshot) => {
    const parkingTimeData = snapshot.val();
    startTime = new Date(parkingTimeData.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    endTime = new Date(parkingTimeData.start_time + parkingTimeData.duration * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  });

  useEffect(() => {
    handleAddPayment();
  }, []);

  const profileImage = profilePicture ? { uri: profilePicture } : { uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' };
  const spacer = (n) => [...Array(n)].map(() => ' ').join('');
  let space = spacer(50)

  return (
    <View style={{ padding: 20 }}>
      {configVisible && (
      <View>
        <View style={{ flowDirection: 'row', alignItems: 'center' }}>
          <Image
              source={ require('../assets/icons/red.png') }
              style={{ borderRadius: 50 }}
            />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ paddingBottom: 10, color: '#213A5C', fontSize: 20, fontWeight: 'bold' }}>Payment Unsucessful</Text>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={profileImage}
              style={{ width: 100, height: 100, borderRadius: 50}}
            />
          </View>
          <Text style={{ padding: 10, color: '#213A5C', fontSize: 16 }}>{userName}</Text>
        </View>
        <View style={{ flexDirection: 'row' ,justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, color: '#213A5C' }}>Recieved Payment? </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ padding: 10 }}>Total Bill: {space}</Text>
          <Text>₱ {payment}</Text>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={handlePayNow} style={{ backgroundColor: '#F3BB01', paddingVertical: 5, paddingHorizontal: 35, borderRadius: 20 }}>
            <Text style={{ color: '#213A5C', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>Yes</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: 'lightgray' }}>Click the button to verify the customer's</Text>
            <Text style={{ color: 'lightgray' }}>payment</Text>
        </View>
      </View>
      )}
      {detailVisible && (
        <View>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flowDirection: 'row', alignItems: 'center' }}>
              <Image
                  source={ require('../assets/icons/green.png') }
                  style={{ borderRadius: 50 }}
                />
            </View>
            <Text style={{ paddingBottom: 10, color: '#213A5C' }}>Payment Successful</Text>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={profileImage}
                style={{ width: 100, height: 100, borderRadius: 50}}
              />
            </View>
            <Text style={{ padding: 10, color: '#213A5C' }}>{userName}</Text>
            <Text style={{ padding: 10, color: '#213A5C' }}>Details</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
              <Text style={{ color: 'lightgray' }}>Check-In Time:{space}</Text>
              <Text style={{ color: '#213A5C' }}>{startTime}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
              <Text style={{ color: 'lightgray' }}>Check-out Time: </Text>
              <Text style={{ color: '#213A5C' }}>{endTime}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
              <Text style={{ color: 'lightgray' }}>Payment Status: </Text>
              <Text style={{ color: '#213A5C' }}>{byCash ? 'Paid by Cash' : 'Paid'}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
