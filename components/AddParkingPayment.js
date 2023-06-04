import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../config';

export default function AddParkingPayment({ userId, operatorName, operatorUid }) {
  let  [payment, setPayment] = useState(40);
  let [duration, setDuration] = useState(0);
  const [start_time, setStartTime] = useState(0);
  const [error, setError] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [configVisible, setConfigVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [userName, setUserName] = useState(null);
  const [byCash, setByCash] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [startTime, setStartingTime] = useState(0);
  const [endTime, setEndingTime] = useState(0);
  const [userNotParked, setUserNotParked] = useState(false);


  useEffect(() => {
    const parkingRef = firebase.database().ref(`users/${userId}/parking_time/start_time`);
    parkingRef.on('value', (snapshot) => {
      setStartTime(snapshot.val());
      setDuration((new Date().getTime() - snapshot.val())/1000);
    });

    handleDelayedAddPayment();
  
    return () => {
      parkingRef.off();
    };
  }, []);

  const handleDelayedAddPayment = () => {
    setTimeout(() => {
      handleAddPayment();
    }, 2000); // Delay of 2000 milliseconds (2 seconds)
  };

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
    setByCash(true)
    handleFailedPayment();
    setDetailVisible(true);
    setConfigVisible(false);
  };
  
  const handleFailedPayment = async () => {
    try {
      const customerRef = firebase.database().ref('activeCustomer/' + userId);
      const customerSnapshot = await customerRef.once('value');
      const exists = customerSnapshot.exists();

      if (!exists) {
        setUserNotParked(true);
        return;
      } else {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);
        const userSnapshot = await userRef.get();
    
        if (!userSnapshot.exists) {
          setError('User does not exist');
          return;
        } else {
          const userData = userSnapshot.data();
          const { name, vehicles, number } = userData;
      
          setUserName(name);
      
          if (name == null) {
            setError('User name is null');
            return;
          }
      
          const defaultVehicle = vehicles.find((v) => v.isDefault);
          const plateNo = defaultVehicle ? defaultVehicle.plateNo : '';
          setVehicle(defaultVehicle);

          const paymentSettingsRef = firebase.database().ref('parking_payment_settings');
          let initialHours;
          let initialPayment;
          let incrementalPayment;

          await paymentSettingsRef.once('value', (snapshot) => {
            const parkingPaymentData = snapshot.val();
            initialHours = parseInt(parkingPaymentData.initial_hours);
            initialPayment = parseInt(parkingPaymentData.initial_payment);
            incrementalPayment = parseInt(parkingPaymentData.incremental_payment);

            // Use the updated values of initialHours, initialPayment, and incrementalPayment within this listener if needed
          });
      
          const parkingRef = firebase.database().ref(`users/${userId}`);
          const parkingTimeSnapshot = await parkingRef.child('parking_time').once('value');
          const parkingTimeData = parkingTimeSnapshot.val();

          const discountRef = firebase.database().ref('activeCustomer/' + userId + '/discount');
          const discountSnapshot = await discountRef.once('value');
          const discountType = discountSnapshot.val();
      
          const durationInHours = Math.floor(duration / (60 * 60));
          let additionalHoursWithCostFree;

          let paymentAmount = parseInt(initialPayment);

          await paymentSettingsRef.once('value', (snapshot) => {
            const parkingSettingsData = snapshot.val();

            const discountSettings = parkingSettingsData[discountType];

            console.log('Discount: ', discountSettings);

            additionalHoursWithCostFree = Math.max(Math.max(durationInHours - parseInt(discountSettings.costfree_amount), 0) - parseInt(initialHours), 0);
            console.log("Hours: " + additionalHoursWithCostFree);

            if (additionalHoursWithCostFree == 0) {
              if (discountSettings.costfree_amount == 0) {
                if (duration == 0) {
                  paymentAmount = parseInt(0);
                }
              }
            }

            if (additionalHoursWithCostFree > 0) {
              paymentAmount += additionalHoursWithCostFree * parseInt(incrementalPayment);
            }

            console.log('Amount:' + paymentAmount);

            if (discountSettings) {
              if (discountSettings.discount_by === 'Percentage') {
                const discountPercentage = parseFloat(discountSettings.amount) / 100;
                let discountablePaymentAmount = paymentAmount;
                discountablePaymentAmount -= discountablePaymentAmount * discountPercentage;
                paymentAmount = parseInt(Math.max(discountablePaymentAmount, 0));
              } else if (discountSettings.discount_by === 'Deduct') {
                const discountAmount = parseFloat(discountSettings.amount);
                let discountablePaymentAmount = paymentAmount;
                discountablePaymentAmount -= discountAmount;
                paymentAmount = parseInt(Math.max(discountablePaymentAmount, 0));
              }
            }
            console.log('Amount:' + paymentAmount);
          });
          
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
            discount: discountType
          });
      
          const operatorTransactionsRef = firebase.database().ref(`operators/${operatorUid}/transactions`);
          const generalTransactionsRef = firebase.database().ref(`transactions`);
          const date = new Date().toISOString();

          if(profilePicture == null) {
            await operatorTransactionsRef.push({
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });

            await generalTransactionsRef.push({
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });

          } else {
            await operatorTransactionsRef.push({
              profile_picture: profilePicture,
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });

            await generalTransactionsRef.push({
              profile_picture: profilePicture,
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });
          }
      
          parkingRef.child('parking_time').update({
            start_time: 0,
          });
      
          const parkingAvailabilityRef = firebase.database().ref('parking_availability');
          parkingAvailabilityRef.update({ occupied_spaces: firebase.database.ServerValue.increment(-1) }, (error) => {
            if (error) {
              alert('Error decrementing occupied_spaces:', error.message);
            } else {
              console.log('Occupied spaces decremented successfully.');
            }
          });
      
          customerRef.remove();

          const transactionsCountAndRevenue = firebase.database().ref('transaction_count_revenue');
          const today = new Date().toISOString().slice(0, 10);

          transactionsCountAndRevenue.child(today).transaction((data) => {
            if (data === null) {
              return {
                count: 1,
                revenue: paymentAmount
              };
            } else {
              return {
                count: data.count + 1,
                revenue: data.revenue + paymentAmount
              };
            }
          });
          setPayment(paymentAmount);
        }
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
  };
  
  const handleAddPayment = async () => {
    try {
      const customerRef = firebase.database().ref('activeCustomer/' + userId);
      const customerSnapshot = await customerRef.once('value');
      const exists = customerSnapshot.exists();

      if (!exists) {
        setUserNotParked(true);
        return;
      } else {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);
        const userSnapshot = await userRef.get();
    
        if (!userSnapshot.exists) {
          setError('User does not exist');
          return;
        } else {
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
    
          const paymentSettingsRef = firebase.database().ref('parking_payment_settings');
          let initialHours;
          let initialPayment;
          let incrementalPayment;
    
          await paymentSettingsRef.once('value', (snapshot) => {
            const parkingPaymentData = snapshot.val();
            initialHours = parseInt(parkingPaymentData.initial_hours);
            initialPayment = parseInt(parkingPaymentData.initial_payment);
            incrementalPayment = parseInt(parkingPaymentData.incremental_payment);
    
            // Use the updated values of initialHours, initialPayment, and incrementalPayment within this listener if needed
          });
    
          const parkingRef = firebase.database().ref(`users/${userId}`);
          const parkingTimeSnapshot = await parkingRef.child('parking_time').once('value');
          const parkingTimeData = parkingTimeSnapshot.val();

          const discountRef = firebase.database().ref('activeCustomer/' + userId + '/discount');
          const discountSnapshot = await discountRef.once('value');
          const discountType = discountSnapshot.val();

          duration = (new Date().getTime() - parkingTimeData.start_time)/1000;
      
          const durationInHours = Math.floor(duration / (60 * 60));
          let additionalHoursWithCostFree;

          let paymentAmount = parseInt(initialPayment);

          await paymentSettingsRef.once('value', (snapshot) => {
            const parkingSettingsData = snapshot.val();

            const discountSettings = parkingSettingsData[discountType];

            console.log('Discount_1: ', discountSettings);

            additionalHoursWithCostFree = Math.max(Math.max(durationInHours - parseInt(discountSettings.costfree_amount), 0) - parseInt(initialHours), 0);
            console.log("Hours_1: " + additionalHoursWithCostFree);

            if (additionalHoursWithCostFree == 0) {
              if (discountSettings.costfree_amount == 0) {
                if (duration == 0) {
                  paymentAmount = parseInt(0);
                }
              }
            }

            if (additionalHoursWithCostFree > 0) {
              paymentAmount += additionalHoursWithCostFree * parseInt(incrementalPayment);
            }

            console.log('Amount_1:' + paymentAmount);

            if (discountSettings) {
              if (discountSettings.discount_by === 'Percentage') {
                const discountPercentage = parseFloat(discountSettings.amount) / 100;
                let discountablePaymentAmount = paymentAmount;
                discountablePaymentAmount -= discountablePaymentAmount * discountPercentage;
                paymentAmount = parseInt(Math.max(discountablePaymentAmount, 0));
              } else if (discountSettings.discount_by === 'Deduct') {
                const discountAmount = parseFloat(discountSettings.amount);
                let discountablePaymentAmount = paymentAmount;
                discountablePaymentAmount -= discountAmount;
                paymentAmount = parseInt(Math.max(discountablePaymentAmount, 0));
              }
            }
            console.log('Amount_1:' + paymentAmount);
          });

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

          console.log('Amount_1:' + paymentAmount);
    
          const referenceNumber = '800' + generateReferenceNumber();
      
          await parkingRef.child('parking_time_history').push({
            operator_name: operatorName,
            user_name: name,
            plate_no: plateNo,
            start_time: parkingTimeData.start_time,
            duration: duration,
            payment: paymentAmount,
            reference_number: referenceNumber,
            discount: discountType
          });
      
          const operatorTransactionsRef = firebase.database().ref(`operators/${operatorUid}/transactions`);
          const generalTransactionsRef = firebase.database().ref(`transactions`);
          const date = new Date().toISOString();

          if(profilePicture == null) {
            await operatorTransactionsRef.push({
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });

            await generalTransactionsRef.push({
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });

          } else {
            await operatorTransactionsRef.push({
              profile_picture: profilePicture,
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });

            await generalTransactionsRef.push({
              profile_picture: profilePicture,
              operator_name: operatorName,
              number: number,
              user_name: name,
              plate_no: plateNo,
              start_time: parkingTimeData.start_time,
              duration: duration,
              payment: paymentAmount,
              reference_number: referenceNumber,
              date: date,
              top_up: false,
              discount: discountType
            });
          }
    
          parkingRef.child('parking_time').update({
            start_time: 0,
          });
    
          const parkingAvailabilityRef = firebase.database().ref('parking_availability');
          parkingAvailabilityRef.update({ occupied_spaces: firebase.database.ServerValue.increment(-1) }, (error) => {
            if (error) {
              alert('Error decrementing occupied_spaces:', error.message);
            } else {
              console.log('Occupied spaces decremented successfully.');
            }
          });
    
          customerRef.remove();
    
          const transactionsCountAndRevenue = firebase.database().ref('transaction_count_revenue');
          const today = new Date().toISOString().slice(0, 10);
    
          transactionsCountAndRevenue.child(today).transaction((data) => {
            if (data === null) {
              return {
                count: 1,
                revenue: paymentAmount
              };
            } else {
              return {
                count: data.count + 1,
                revenue: data.revenue + paymentAmount
              };
            }
          });

          setPayment(paymentAmount);
        }
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding payment');
    }
  };

  useEffect(() => {
    const parkingRef = firebase.database().ref(`users/${userId}/parking_time_history`);
    const query = parkingRef.orderByChild('start_time').limitToLast(1);

    const handleChildAdded = (snapshot) => {
      const parkingTimeData = snapshot.val();
      setStartingTime((new Date(parkingTimeData.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })));
      setEndingTime((new Date(parkingTimeData.start_time + parkingTimeData.duration * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })));
    };

    query.on('child_added', handleChildAdded);

    return () => {
      query.off('child_added', handleChildAdded);
    };
  }, []);

  const profileImage = profilePicture ? { uri: profilePicture } : { uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' };
  const spacer = (n) => [...Array(n)].map(() => ' ').join('');
  let space = spacer(50)

  return (
    <View style={{ padding: 20, width: '95%' }}>
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
          <Text style={{ fontSize: 24, color: '#213A5C' }}>Received Payment? </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
          <Text style={{ padding: 10 }}>Total Bill:</Text>
          <Text>₱ {payment}</Text>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={handlePayNow} style={{ backgroundColor: '#F3BB01', paddingVertical: 5, paddingHorizontal: 35, borderRadius: 20 }}>
            <Text style={{ color: '#213A5C', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>Yes</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20, alignItems: 'center', width: "100%" }}>
            <Text style={{ color: 'lightgray' }}>Click the button to verify the customer's payment</Text>
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
              <Text style={{ color: 'lightgray' }}>Check-In Time:</Text>
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
      {userNotParked && (
        <View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ paddingBottom: 10, color: '#213A5C', fontSize: 32 }}>User Not parked yet.</Text>
            <Text style={{ paddingBottom: 10, color: '#213A5C' }}>Press the Proceed below to scan again.</Text>
            <View style={{ alignItems: 'center' }}>
            </View>
          </View>
          <View>
          </View>
        </View>
      )}
    </View>
  );
}