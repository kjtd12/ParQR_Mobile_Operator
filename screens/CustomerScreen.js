import {  View, Text, FlatList, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { firebase } from '../config';
import { database } from 'firebase/compat/database';

const CustomerScreen = () => {
  const [activeData, setActiveData] = useState([]);
  const [activeKeys, setActiveKeys] = useState([]);

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
  

  const renderItem = ({ item }) => {
    const dataItem = activeData[item];
    console.log("data item: " + dataItem);
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
            <Text style={styles.customerItemDescriptionText_1}>{dataItem.discount ? 'Yes' : 'No'}</Text>
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
          // onChangeText={handleSearch}
          // value={searchQuery}
        />
      </View>
      <FlatList
        data={activeKeys}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </View>
  )
}

export default CustomerScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerItemTitleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  customerItemSubTitleText: {
    color: '#777',
    fontSize: 16,
  },
  customerItemDescription: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerItemDescriptionText: {
    color: '#777',
    fontSize: 16,
  },
  customerItemDescriptionText_1: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF1F8',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: 'black',
  },
})