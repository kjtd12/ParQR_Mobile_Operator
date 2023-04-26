import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal, TouchableOpacity, StatusBar  } from 'react-native';
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
          style={[styles.button, { backgroundColor: '#F3BB01' }]}
          onPress={() => {setQrVisible(true), setShowTopUp(true)}}
        >
          <Text style={styles.buttonText}>Top-up Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#F3BB01' }]}
          onPress={() => {setQrVisible(true), setShowParking(true)}}
        >
          <Text style={styles.buttonText}>Park Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#F3BB01' }]}
          onPress={() => {setQrVisible(true), setShowParkingPay(true)}}
        >
          <Text style={styles.buttonText}>Customer Parking Pay</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={!scanned && qrVisible}
        animationType="slide"
      >
        <View style={styles.modal}>
          <View style={styles.barcodebox}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ height: '200%', width: '200%' }}
            />
          </View>
        </View>
        <View style={styles.overlay} />
      </Modal>
      {scanned && (
        <View>
          <Modal visible={showTopUp} animationType={'slide'}>
            <View style={styles.modal}>
              <View style={styles.card}>
                <AddTransaction userId={userId} />
                <Button title={'Close'} onPress={() => {setScanned(false), setQrVisible(false), setShowTopUp(false)}} />
              </View>
            </View>
          </Modal>
          <Modal visible={showParking} animationType={'slide'}>
            <View style={styles.modal}>
              <View style={styles.card}>
                <AddParkingTime userId={userId} />
                <Button title={'Close'} onPress={() => {setScanned(false), setQrVisible(false), setShowParking(false)}} />
              </View>
            </View>
          </Modal>
          <Modal visible={showParkingPay} animationType={'slide'}>
            <View style={styles.modal}>
              <View style={styles.card}>
                <AddParkingPayment userId={userId} operatorName={operatorName} operatorUid={operatorUid}/>
                <Button title={'Close'} onPress={() => {setScanned(false), setQrVisible(false), setShowParkingPay(false)}} />
              </View>
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
  card: {
    width: '80%',
    height: '50%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    borderRadius: 7,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});