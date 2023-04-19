import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { firebase } from '../config';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [operatorUid, setOperatorUid] = useState(null);

  useEffect(() => { //get operator's name
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setOperatorUid(firebase.auth().currentUser.uid)
      } else {
        console.log(firebase.auth().currentUser.uid)
        console.log('user does not exist')
      }
    })
  }, [firebase.auth().currentUser.uid]);

  useEffect(() => {
    const operatorTransactionsRef = firebase.database().ref(`operators/${operatorUid}/transactions`);
    
    const handleData = (snapshot) => {
      const data = snapshot.val();
  
      if (data) {
        const transactionsArray = Object.entries(data).map(([key, value]) => {
          return { key, ...value };
        });
        setTransactions(transactionsArray);
      }
    };
  
    operatorTransactionsRef.on('value', handleData);
  
    // Cleanup function to detach the listener when the component unmounts
    return () => {
      operatorTransactionsRef.off('value', handleData);
    };
  }, [operatorUid]);
  

  const renderTransactionItem = ({ item }) => {
    const formattedPayment = item.payment ? `₱${parseFloat(item.payment).toFixed(2)}` : 'N/A';
  
    const date = new Date(item.start_time);
    console.log(date);
    const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.transactionItemHeader}>
          <Image
            source={{ uri: 'https://via.placeholder.com/30x30' }}
            style={{ width: 40, height: 40, marginRight: 10 }}
          />
          <View style={styles.transactionItemInfo}>
            <Text style={styles.transactionItemTitle}>{item.user_name}</Text>
            <Text style={styles.transactionItemSubtitle}>{item.plate_no}</Text>
          </View>
        </View>
        <View style={styles.transactionItemDetails}>
          <Text style={styles.transactionItemDate}>{formattedDate}</Text>
          <Text style={styles.transactionItemTime}>{formattedTime}</Text>
          <Text style={styles.transactionItemAmount}>{formattedPayment}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
 
  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { marginTop: 30 }]}>
        <Image
          source={{ uri: 'https://www.freeiconspng.com/uploads/search-icon-png-7.png' }}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          // onChangeText={handleSearch}
          // value={searchQuery}
        />
      </View>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.key}
        style={styles.transactionsList}
      />
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  transactionsList: {
    flex: 1,
    width: '100%',
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },  
  transactionItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between', // Align the header to the left and right edges
    marginBottom: 10,
  },
  transactionItemInfo: {
    alignItems: 'flex-end', // Align the info to the left edge
  },
  transactionItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  transactionItemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionItemSubtitle: {
    color: '#777',
    fontSize: 14,
  },
  transactionItemDivider: {
    backgroundColor: '#ccc',
    height: 1,
    width: '100%',
    marginVertical: 10,
  },
  transactionItemDate: {
    fontSize: 14,
    color: '#777',
  },
  transactionItemTime: {
    fontSize: 14,
    color: '#777',
  },
  transactionItemAmount: {
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
});
