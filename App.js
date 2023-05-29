import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import LoginStack from './navigation/loginStack';


export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <LoginStack/>
    </NavigationContainer>
  );
}