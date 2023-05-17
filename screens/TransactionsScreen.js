import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import React, { useState, useEffect } from 'react';
import DateModal from '../components/DateModal';
import DetailsModal from '../components/DetailsModal';

import { firebase } from '../config';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [operatorUid, setOperatorUid] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortCurrentValue, setSortCurrentValue] = useState();
  const [filterCurrentValue, setFilterCurrentValue] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [operatorName, setOperatorName] = useState('');

  useEffect(() => {
    const operatorTransactionsRef = firebase.database().ref(`operators/${operatorUid}/transactions`);
    
    const handleData = (snapshot) => {
      const data = snapshot.val();
  
      if (data) {
        const transactionsArray = Object.entries(data).map(([key, value]) => {
          return { key, ...value };
        });
        setTransactions(Object.values(transactionsArray.reverse()));
      }
    };
  
    const handleChildRemoved = (oldChildSnapshot) => {
      // Remove the transaction from the state
      setTransactions((transactions) =>
        transactions.filter((transaction) => transaction.key !== oldChildSnapshot.key)
      );
    };
  
    operatorTransactionsRef.on('value', handleData);
    operatorTransactionsRef.on('child_removed', handleChildRemoved);
  
    return () => {
      operatorTransactionsRef.off('value', handleData);
      operatorTransactionsRef.off('child_removed', handleChildRemoved);
    };
  }, [operatorUid]);
  

  function filterAndSortTransactions(transactions, filterCurrentValue, sortCurrentValue, startDate, endDate) {
    let filteredTransactions = [...transactions];
    
    switch (filterCurrentValue) {
      case 'today':
        filteredTransactions = filteredTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.start_time);
          const today = new Date();
          return transactionDate.toDateString() === today.toDateString();
        });
        break;
      case 'sevenDays':
        filteredTransactions = filteredTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.start_time);
          const today = new Date();
          const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
          return transactionDate >= sevenDaysAgo;
        });
        break;
      case 'thirtyDays':
        filteredTransactions = filteredTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.start_time);
          const today = new Date();
          const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
          return transactionDate >= thirtyDaysAgo;
        });
        break;
      case 'custom':
        setModalVisible(true)
        filteredTransactions = filteredTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.start_time);
          const start = startDate ? new Date(startDate.setDate(startDate.getDate())) : '';
          const end = endDate ? new Date(endDate.setDate(endDate.getDate())) : '';
          return transactionDate >= start && transactionDate <= end;
        });
        break;
      default:
        break;
    }
  
    switch (sortCurrentValue) {
      case 'ascending':
        filteredTransactions.sort((a, b) => a.user_name.localeCompare(b.user_name));
        break;
      case 'descending':
        filteredTransactions.sort((a, b) => b.user_name.localeCompare(a.user_name));
        break;
      case 'newest':
        filteredTransactions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        break;
      case 'oldest':
        filteredTransactions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        break;
      default:
        break;
    }
    
    return filteredTransactions;
  }
  
  function formatTransactions(transactions, searchQuery) {
    return transactions
      .filter((transaction) =>
        transaction.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.plate_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(transaction.start_time).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).includes(searchQuery) ||
        new Date(transaction.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}).includes(searchQuery)
      )
      .map((transaction) => ({
        ...transaction,
        date: new Date(transaction.start_time),
      }));
  }

  useEffect(() => {
    const filteredAndSortedTransactions = filterAndSortTransactions(transactions, filterCurrentValue, sortCurrentValue, startDate, endDate);
    setFilteredTransactions(filteredAndSortedTransactions);
  }, [transactions, filterCurrentValue, sortCurrentValue, startDate, endDate]);
  
  const formattedTransactions = formatTransactions(filteredTransactions, searchQuery);

  const handleSubmit = (value1, value2) => {
    setStartDate(value1);
    setEndDate(value2);
  }

  useEffect(() => { //get operator's name
    firebase.firestore().collection('operators')
    .doc(firebase.auth().currentUser.uid).get()
    .then((snapshot) => {
      if(snapshot.exists){
        setOperatorUid(firebase.auth().currentUser.uid);
        setOperatorName(snapshot.get('name'));
      } else {
        console.log(firebase.auth().currentUser.uid);
        console.log('user does not exist');
      }
    })
  }, [firebase.auth().currentUser.uid]);
  
  const renderTransactionItem = ({ item }) => {
    const formattedPayment = item.payment ? `₱${parseFloat(item.payment).toFixed(2)}` : 'N/A';
    let formattedDate;
    let formattedTime;

  
    if (item.top_up) {
      formattedDate = item.formattedDate;
      formattedTime = item.formattedTime;
    } else {
      formattedDate = item.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      formattedTime = item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  
    const handlePress = () => {
      setDetailData(item);
      setDetailModalVisible(true);
    };
  
    return (
      <>
        <TouchableOpacity onPress={handlePress} style={styles.transactionItem}>
          <View style={styles.transactionItemHeader}>
            <Text style={styles.transactionItemTitle}>{item.user_name}</Text>
            <Text style={styles.transactionItemSubtitle}>{item.plate_no}</Text>
          </View>
          <View style={styles.transactionItemDetails}>
            <Text style={styles.transactionItemDate}>{formattedDate}</Text>
            <Text style={styles.transactionItemTime}>{formattedTime}</Text>
            <Text style={styles.transactionItemAmount}>{formattedPayment}</Text>
          </View>
        </TouchableOpacity>
        <DetailsModal
          isVisible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setDetailData([]);
          }}
          item={detailData}
          operator={operatorName}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#213A5C', fontSize: 20, fontWeight: 'bold', paddingBottom: 20, marginTop: 40 }}>Transaction History</Text>
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginVertical: 5, position: "relative", zIndex: 10 }}>
        <View>
          <DropDownPicker 
            items={[
              { label: 'A-Z', value: 'ascending'},
              { label: 'Z-A', value: 'descending'},
              { label: 'Newest', value: 'newest'},
              { label: 'Oldest', value: 'oldest'}
            ]}
            containerStyle={{ 
              backgroundColor: '#fff',
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            placeholder="Sort"
            defaultValue={'newest'}
            setValue={(value) => setSortCurrentValue(value)}
            value={sortCurrentValue}
            open={isSortOpen}
            setOpen={setIsSortOpen}
            onChangeItem={item => console.log(item.label, item.value)}
            showTickIcon={true}
            style={{ // add this to remove the default border of the DropDownPicker
              borderWidth: 0,
              width: 100 // add this to set the width
            }}
            dropDownStyle={{ // add this to remove the default border of the DropDownPicker dropdown
              borderWidth: 0,
              color: '#213A5C',
            }}
            labelStyle={{ // add this to style the label text
              fontSize: 16,
              color: '#213A5C',
            }}
            arrowIconStyle={{ // add this to style the arrow icon
              tintColor: '#213A5C',
            }}
          />
        </View>
        <View>
          <DropDownPicker 
            items={[
              { label: 'Today', value: 'today'},
              { label: 'Last 7 days', value: 'sevenDays'},
              { label: 'Last 30 Days', value: 'thirtyDays'},
              { label: 'Custom', value: 'custom'},
            ]}
            containerStyle={{ 
              backgroundColor: '#fff',
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            placeholder="Filter"
            defaultValue={'today'}
            setValue={(value) => setFilterCurrentValue(value)}
            value={filterCurrentValue}
            open={isFilterOpen}
            setOpen={setIsFilterOpen}
            onChangeItem={item => console.log(item.label, item.value)}
            showTickIcon={true}
            style={{ // add this to remove the default border of the DropDownPicker
              borderWidth: 0,
              width: 100  // add this to set the width
            }}
            dropDownStyle={{ // add this to remove the default border of the DropDownPicker dropdown
              borderWidth: 0,
              color: '#213A5C',
            }}
            labelStyle={{ // add this to style the label text
              fontSize: 16,
              color: '#213A5C',
            }}
            arrowIconStyle={{ // add this to style the arrow icon
              tintColor: '#213A5C',
            }}
          />
        </View>
      </View>
      <DateModal isVisible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={handleSubmit} />
      <FlatList
        data={formattedTransactions}
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
