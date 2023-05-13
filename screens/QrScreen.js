import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal, TouchableOpacity, Image  } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { firebase } from '../config';
import AddTransaction from '../components/AddTransaction';
import AddParkingTime from '../components/AddParkingTime';
import AddParkingPayment from '../components/AddParkingPayment';

export default function ScanAndAddTransaction() {
  const [hasPermission, setHasPermission] = useState(null);
  const [userId, setUserId] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [operatorName, setOperatorName] = useState(null);
  const [operatorUid, setOperatorUid] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showParking, setShowParking] = useState(false);
  const [showParkingPay, setShowParkingPay] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const db = firebase.firestore();

  useEffect(() => { //get operator's name
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setOperatorName(snapshot.data().name)
        setOperatorUid(firebase.auth().currentUser.uid)
      } else {
        console.log(firebase.auth().currentUser.uid)
        console.log('user does not exist')
      }
    })
  })

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setUserId(data);
    const docRef = db.collection('users').doc(data);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      setResult('No matching documents found');
      setScanned(false);
    } else {
      const resultData = docSnapshot.data();
      setResult(resultData);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { borderColor: '#213A5C', borderWidth: 1.5 }]}
          onPress={() => {setQrVisible(true), setShowTopUp(true)}}
        >
          <Text style={styles.buttonText}>Top-up Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: '#213A5C', borderWidth: 1.5 }]}
          onPress={() => {setQrVisible(true), setShowParking(true)}}
        >
          <Text style={styles.buttonText}>Park Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderColor: '#213A5C', borderWidth: 1.5 }]}
          onPress={() => {setQrVisible(true), setShowParkingPay(true)}}
        >
          <Text style={styles.buttonText}>Customer Parking Pay</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={qrVisible}
        animationType="slide"
      >
        <View style={styles.modal}>
          <TouchableOpacity onPress={() => {setQrVisible(false), setShowParkingPay(false), setShowTopUp(false), setShowParking(false)}} style={{ position: 'absolute', top: 40, left: 40 }}>
            <Image
              source={require('../assets/icons/ArrowLeft.png')}
              style={{ tintColor: 'white' }}
            />
          </TouchableOpacity>
          <View ></View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',  }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F3BB01' }}>Scan QR Code</Text>
            <Text style={{ fontSize: 16, color: 'white' }}>Align the QR Code within the</Text>
            <Text style={{ fontSize: 16, color: 'white' }}>the frame to scan.</Text>
          </View>
          <View style={[styles.barcodebox]}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ height: '200%', width: '200%' }}
            />
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        <View style={styles.overlay} />
      </Modal>
      {scanned && (
        <View>
          <Modal visible={showTopUp} animationType={'slide'} transparent={true}>
              <View style={styles.operationModal}>
                <View style={[styles.card, {height: "auto", paddingVertical: 20}]}>
                  <AddTransaction userId={userId} />
                </View>
                <TouchableOpacity onPress={() => {setScanned(false), setQrVisible(false), setShowTopUp(false)}} style={{ backgroundColor: '#F3BB01', paddingHorizontal: 60, paddingVertical: 10 , borderRadius: 5, marginTop: 40 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', color: '#213A5C' }}>Proceed</Text>
                </TouchableOpacity>
              </View>
          </Modal>
          <Modal visible={showParking} animationType={'slide'} transparent={true}>
            <View style={styles.operationModal}>
              <View style={styles.card}>
                <AddParkingTime userId={userId} />
              </View>
              <TouchableOpacity onPress={() => {setScanned(false), setQrVisible(false), setShowParking(false)}} style={{ backgroundColor: '#F3BB01', paddingHorizontal: 60, paddingVertical: 10 , borderRadius: 5, marginTop: 40 }}>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', color: '#213A5C' }}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal visible={showParkingPay} animationType={'slide'} transparent={true}>
            <View style={styles.operationModal}>
              <View style={styles.card}>
                <AddParkingPayment userId={userId} operatorName={operatorName} operatorUid={operatorUid}/>
              </View>
              <TouchableOpacity onPress={() => {setScanned(false), setQrVisible(false), setShowParkingPay(false)}} style={{ backgroundColor: '#F3BB01', paddingHorizontal: 60, paddingVertical: 10 , borderRadius: 5, marginTop: 40 }}>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', color: '#213A5C' }}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato'
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#213A5C',
  },
  operationModal:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    marginTop: 10,
    marginBottom: 20,
    borderColor: '#213A5C',
    borderWidth: 2,
    paddingHorizontal: 30,
    paddingVertical: 40,
    borderRadius: 10
  },
  button: {
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    color: '#213A5C',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
});