import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfile from '../screens/EditProfile';
import HelpSupport from '../screens/HelpSupport';
import AboutApp from '../screens/AboutApp';
// import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function ProfileStack(){
    return (
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="Edit Profile" component={EditProfile}/>
            <Stack.Screen options={{ headerShown: false }} name="Help & Support" component={HelpSupport}/>
            <Stack.Screen options={{ headerShown: false }} name="About App" component={AboutApp}/>
        </Stack.Navigator>
    )
}

export default ProfileStack;