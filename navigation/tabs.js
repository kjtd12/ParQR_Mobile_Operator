import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../screens/HomeScreen";
import QrScreen from "../screens/QrScreen";
import CustomerScreen from "../screens/CustomerScreen";
import TransactionsScreen from '../screens/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { StyleSheet, Text, Image, View, ScrollableOpacity } from 'react-native';
import { TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({children, onPress}) => (
    <TouchableOpacity
        style={{
            top: -45,
            justifyContent: 'center',
            alignItemsLeft: 'center',
            ...StyleSheet.shadow
        }}
        onPress={onPress}
    >
        <View
            style={{width: 80,
                height: 80,
                borderRadius: 45,
                backgroundColor: 'white',
                alignItems: 'center', 
                justifyContent: 'center'
            }}
        >
            <View
                style={{width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: '#213A5C',
                }}
            >    
                {children}
            </View>
        </View>
        
    </TouchableOpacity>
)

const Tabs = () => {
    return(
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 15,
                    left: 10,
                    right: 10,
                    elevation: 0,
                    backgroundColor: '#213A5C',
                    borderRadius: 15,
                    height: 90,
                },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen}
                options={{ 
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Image
                            source={require('../assets/icons/Home.png')}
                            style={{ 
                                width: 40, 
                                height: 40, 
                                tintColor: focused ? "#F3BB01" : "white"
                            }}
                        />
                        <Text style={{color: focused ? "#F3BB01" : "white", fontSize: 10}}>Home</Text>
                    </View>
                )
                }}
            />
            <Tab.Screen name="Customer" component={CustomerScreen}
                options={{ 
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Image
                            source={require('../assets/icons/Customers.png')}
                            style={{ 
                                width: 40, 
                                height: 40,
                                tintColor: focused ? "#F3BB01" : "white"
                            }}
                        />
                        <Text style={{color: focused ? "#F3BB01" : "white", fontSize: 10}}>Customers</Text>
                    </View>
                )
                }}
            />
            <Tab.Screen name="Qr" component={QrScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <Image
                            source={require('../assets/icons/Qr.png')}
                            style={{ 
                                width: 30, 
                                height: 30,
                                tintColor: focused ? "#F3BB01" : "white"
                            }}
                        />  
                    ),
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props}/>
                    )
                }}
            />
            <Tab.Screen name="Transaction" component={TransactionsScreen}
                options={{ 
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Image
                            source={require('../assets/icons/Transactions.png')}
                            style={{ 
                                width: 40, 
                                height: 40,
                                tintColor: focused ? "#F3BB01" : "white"
                            }}
                        />
                        <Text style={{color: focused ? "#F3BB01" : "white", fontSize: 10}}>Transactions</Text>
                    </View>
                )
                }}
            />
            <Tab.Screen name="Profile" component={ProfileScreen}
                options={{ 
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Image
                            source={require('../assets/icons/Profile.png')}
                            style={{ 
                                width: 40, 
                                height: 40,
                                tintColor: focused ? "#F3BB01" : "white"
                            }}
                        />
                        <Text style={{color: focused ? "#F3BB01" : "white", fontSize: 10}}>Profile</Text>
                    </View>
                )
                }}
            />
        </Tab.Navigator>
    )
}

const style = StyleSheet.create({
    shadow: {
        shadowColor: "#7F5DF0",
        shadowOffset: {
            width: 0,
            height: 10
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5
    }
})


export default Tabs;