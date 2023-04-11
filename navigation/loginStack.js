import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import Tabs from './tabs';
import ProfileStack from './profileStack';

const Stack = createNativeStackNavigator();

function LoginStack() {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen options={{ headerShown: false }} name="Landing" component={LandingScreen} /> */}
      <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
      <Stack.Screen options={{ headerShown: false }} name="App" component={Tabs} />
      <Stack.Screen options={{ headerShown: false }} name="Profiles" component={ProfileStack} />
    </Stack.Navigator>
  );
}

export default LoginStack;