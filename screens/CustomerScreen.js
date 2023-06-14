import {  View, Text, FlatList, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { firebase } from '../config';
import { database } from 'firebase/compat/database';

const CustomerScreen = () => {
  const [activeData, setActiveData] = useState([]);
  const [activeKeys, setActiveKeys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const customerRef = firebase.database().ref('activeCustomer/');
    const valueListener = customerRef.on('value', (snapshot) => {
      const activeCustomer = snapshot.val();
      if (activeCustomer) {
        setActiveData(activeCustomer);
        setActiveKeys(Object.keys(activeCustomer));
      }
    });
    const removedListener = customerRef.on('child_removed', (removedCustomer) => {
      setActiveData(prevActiveData => {
        const activeCustomer = { ...prevActiveData };
        delete activeCustomer[removedCustomer.key];
        setActiveKeys(Object.keys(activeCustomer));
        return activeCustomer;
      });
    }); 
    return () => {
      customerRef.off('value', valueListener);
      customerRef.off('child_removed', removedListener);
    };
  }, []);

  const filteredData = activeKeys.filter(key => {
    const item = activeData[key];
    const name = item.name.toLowerCase();
    const plate = item.plate.toLowerCase();
    const searchQueryLowerCase = searchQuery.toLowerCase();
    return name.includes(searchQueryLowerCase) || plate.includes(searchQueryLowerCase);
  });
  
  const renderItem = ({ item }) => {
    const dataItem = activeData[item];
    let vehicleText;
    const vehicleTypeTable = {
        "car": "Car",
        "motorcycle": "Motorcycle"
    }

    for (const key in vehicleTypeTable) {
        if (key === dataItem.vehicle_type) {
            vehicleText = vehicleTypeTable[key];
            break;
        }
    }
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.customerItemTitle}>
          <Text style={styles.customerItemTitleText}>{dataItem.name}</Text>
          <Text style={styles.customerItemSubTitleText}>{dataItem.plate}</Text>
        </View>
        <View style={{ borderTopColor: '#ccc',
                        borderTopWidth: 1,
                        paddingTop: 10, }}>
          <View style={styles.customerItemDescription}>
            <Text style={styles.customerItemDescriptionText}>Check-in Time: </Text>
            <Text style={styles.customerItemDescriptionText_1}>{new Date(dataItem.check_in_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.customerItemDescription}>
            <Text style={styles.customerItemDescriptionText}>Contact No: </Text>
            <Text style={styles.customerItemDescriptionText_1}>{dataItem.contact_number}</Text>
          </View>
          <View style={styles.customerItemDescription}>
            <Text style={styles.customerItemDescriptionText}>Discount: </Text>
            <Text style={styles.customerItemDescriptionText_1}>{dataItem.discount}</Text>
          </View>
          <View style={styles.customerItemDescription}>
            <Text style={styles.customerItemDescriptionText}>Vehicle Type: </Text>
            <Text style={styles.customerItemDescriptionText_1}>{vehicleText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#213A5C', fontSize: 20, fontWeight: 'bold', paddingBottom: 20, marginTop: 40 }}>Checked-In Customers</Text>
      </View>
       <View style={[styles.searchContainer]}>
       <Image
          source={ require('../assets/transactionIcons/Search.png') }
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          onChangeText={(query) => setSearchQuery(query)}
          value={searchQuery}
        />
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
      <View style={{ marginVertical: 50 }}></View>
    </View>
  )
}

export default CustomerScreen

const scalingFactor = 0.8; // Adjust the scaling factor as needed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10 * scalingFactor,
    padding: 16 * scalingFactor,
    marginVertical: 8 * scalingFactor,
    marginHorizontal: 16 * scalingFactor,
    elevation: 2,
    borderWidth: 1 * scalingFactor,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2 * scalingFactor,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84 * scalingFactor,
    elevation: 5,
  },
  customerItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerItemTitleText: {
    fontWeight: 'bold',
    fontSize: 18 * scalingFactor,
  },
  customerItemSubTitleText: {
    color: '#777',
    fontSize: 16 * scalingFactor,
  },
  customerItemDescription: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerItemDescriptionText: {
    color: '#777',
    fontSize: 16 * scalingFactor,
  },
  customerItemDescriptionText_1: {
    fontWeight: 'bold',
    fontSize: 16 * scalingFactor,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF1F8',
    borderRadius: 15 * scalingFactor,
    paddingHorizontal: 10 * scalingFactor,
    marginHorizontal: 10 * scalingFactor,
    marginVertical: 5 * scalingFactor,
  },
  searchInput: {
    flex: 1,
    fontSize: 16 * scalingFactor,
    paddingVertical: 10 * scalingFactor,
    paddingHorizontal: 10 * scalingFactor,
  },
  searchIcon: {
    width: 20 * scalingFactor,
    height: 20 * scalingFactor,
    tintColor: 'black',
  },
});
