import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../config';
import { database } from 'firebase/compat/database';
import DropDownPicker from 'react-native-dropdown-picker';

const auth = firebase.auth()

export default function AddParkingTime({ userId }){
  const [startTime, setStartTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [discount, setDiscount] = useState('none');
  const [vehicleType, setVehicleType] = useState('car');
  const [contactNumber, setContactNumber] = useState('');
  const [configVisible, setConfigVisibile] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [discountIsOpen, setDiscountIsOpen] = useState(false);
  const [vehicleTypeOpen, setVehicleTypeOpen] = useState(false);

  useEffect(() => {
    firebase.firestore().collection('users')
    .doc(userId).get()
    .then((snapshot) => {
      if(snapshot.exists){
        const data = snapshot.data().vehicles;
        setProfilePicture(snapshot.get('profile_picture'));
        setContactNumber(snapshot.data().number);
        setUserName(snapshot.data().name);
        if (data != undefined) {
          const car = data.find((v) => v.isDefault) 
          if (car) {
            setCarPlate(car ? car.plateNo : '');
          }
        } 
      } else {
        console.log('user does not exist')
      }
    })
  })

  const handleAddParkingTime = async () => {
    try {
      if (!carPlate) {
        alert("User does not have a default car or haven't created a vehicle.");
        return;
      } else {
        const userRef = firebase.database().ref('users/' + userId);
        const parkingTimeRef = userRef.child('parking_time');
    
        const snapshot = await parkingTimeRef.once('value');
        const startTime = snapshot.val()?.start_time;
    
        if (startTime !== 0 && startTime !== undefined) {
          alert("The customer has already parked.");
          return;
        } else {
          userRef.update({ parking_time: { start_time: Date.now() } });
    
          const parkingRef = firebase.database().ref('parking_availability');
          await parkingRef.child('occupied_spaces').transaction((currentValue) => {
            return (currentValue || 0) + 1;
          });

          const customerRef = firebase.database().ref('activeCustomer/' + userId);
            await customerRef.update({ 
              name: userName,  
              check_in_time: Date.now(), 
              contact_number: contactNumber, 
              discount: discount,
              plate: carPlate,
              vehicle_type: vehicleType
          });
        }
      }
  
      setConfigVisibile(false);
      setDetailVisible(true);
    } catch (error) {
      // Handle any potential errors here
      console.error('Error:', error);
      // Display an error message or handle the error in an appropriate way
      alert('An error occurred: ' + error.message);
    }
  };

  const profileImage = profilePicture ? { uri: profilePicture } : { uri: 'https://via.placeholder.com/150x150.png?text=Profile+Image' };
  const spacer = (n) => [...Array(n)].map(() => ' ').join('');
  let space = spacer(50)

  return (
    <View style={{ width: '50%' }}>
      {configVisible && (
      <View>
        <View>
          <TouchableOpacity onPress={() => setStartTime(new Date())} style={{ borderWidth: 1, borderColor: '#213A5C', padding: 15, marginVertical: 20, borderRadius: 10 }}>
            <Text>{startTime.toLocaleString([], { hour: 'numeric', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ position: "relative", zIndex: 15,  marginBottom: 20 }}>
          <DropDownPicker
            items={[ { label: 'PWD', value: 'pwd' }, { label: 'Senior Citizen', value: 'senior_citizen' }, { label: 'Student', value: 'student' }, { label: 'Pregnant', value: 'pregnant' }, { label: 'None', value: 'none' } ]}
            defaultValue={'none'}
            placeholder="Select a discount"
            style={{ backgroundColor: '#fafafa' }}
            itemStyle={{
              justifyContent: 'flex-start'
            }}
            containerStyle={{ 
                backgroundColor: '#213A5C',
                borderRadius: 10,
            }}
            dropDownStyle={{ // add this to remove the default border of the DropDownPicker dropdown
                borderWidth: 0,
                color: '#213A5C',
            }}
            setValue={(value) => setDiscount(value)}
            value={discount}
            open={discountIsOpen}
            setOpen={setDiscountIsOpen}
          />
        </View>
        <View style={{ position: "relative", zIndex: 10 }}>
          <DropDownPicker
              items={[ { label: 'Car', value: 'car' }, { label: 'Motorcycle', value: 'motorcycle' } ]}
              defaultValue={'car'}
              placeholder="Select Vehicle Type"
              style={{ backgroundColor: '#fafafa' }}
              itemStyle={{
                justifyContent: 'flex-start'
              }}
              containerStyle={{ 
                  backgroundColor: '#213A5C',
                  borderRadius: 10,
              }}
              dropDownStyle={{ // add this to remove the default border of the DropDownPicker dropdown
                  borderWidth: 0,
                  color: '#213A5C',
              }}
              setValue={(value) => setVehicleType(value)}
              value={vehicleType}
              open={vehicleTypeOpen}
              setOpen={setVehicleTypeOpen}
            />
        </View>
        <TouchableOpacity onPress={handleAddParkingTime} style={{ backgroundColor: '#F3BB01', padding: 15, borderRadius: 10, marginVertical: 20 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Start Parking</Text>
        </TouchableOpacity>
      </View>
      )}
      {detailVisible && (
        <View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ paddingBottom: 10, color: '#213A5C' }}>Scanned Successfully</Text>
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
              <Text style={{ color: 'gray' }}>Check-in time:</Text>
              <Text style={{ color: '#213A5C' }}>{startTime.toLocaleString([], { hour: 'numeric', minute: '2-digit' })}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
              <Text style={{ color: 'gray' }}>Plate Number:</Text>
              <Text style={{ color: '#213A5C' }}>{carPlate}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
              <Text style={{ color: 'gray' }}>Discount:</Text>
              <Text style={{ color: '#213A5C' }}>{discount}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};