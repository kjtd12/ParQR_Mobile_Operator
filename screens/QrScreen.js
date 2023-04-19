import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
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
      {!scanned && (
        <View style={styles.barcodebox}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ height: '200%', width: '200%' }}
          />
          <View style={styles.overlay} />
        </View>
      )}
      {scanned && (
        <View>
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
          <AddTransaction userId={userId} />
          <AddParkingTime userId={userId} />
          <AddParkingPayment userId={userId} operatorName={operatorName} operatorUid={operatorUid}/>
        </View>
      )}
      {result && <Text>{result.name}</Text>}
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
  }
});