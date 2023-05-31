import { KeyboardAvoidingView, StyleSheet, Text, View, Image, TextInput, TouchableOpacity} from 'react-native'
import {useNavigation} from '@react-navigation/core'
import React, {useState, useEffect} from 'react'
import { firebase } from '../config'

const auth = firebase.auth()
const usersCollection = firebase.firestore().collection('operators')

const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsgEmail, setErrorMsgEmail] = useState(null)
    const [errorMsgPassword, setErrorMsgPassword] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigation = useNavigation()

    //Check if the accoutn is an operator
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setLoading(true)
                usersCollection.doc(user.uid).get()
                .then(doc => {
                    setLoading(false)
                    if (doc.exists) {
                        setUser(user)
                        navigation.replace("App")
                    } else {
                        auth.signOut()
                        alert('Operator does not exist')
                    }
                })
                .catch(error => {
                    setLoading(false)
                    alert(error.message)
                })
            }
        })

        return unsubscribe
    }, [])

    //Forget Passwrod function
    const forgetPassword = () => {
        if (email != null && email != '') {
            firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent');
            }).catch((error) => {
                alert(error)
            })
        } else {
            alert("Please enter email address on the email address field to reset password.")
        }
    }

    //Log in Function
    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMsgEmail(!email ? 'Email is required' : '');
            setErrorMsgPassword(!password ? 'Password is required' : '');
            return;
        } else {
            setErrorMsgEmail('');
            setErrorMsgPassword('');

            setLoading(true)
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password)
                setUser(userCredential.user)
            } catch (error) {
                alert(error.message)
            }
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
        >
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Image 
                    source={require('../assets/login.png')}
                    style={{width: 220, height: 200}}
                />
            </View>
            <View style={styles.inputContainer}>
                <View>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        style={styles.input}
                        autoCapitalize="none"
                    />
                    <Text>
                        {errorMsgEmail && <Text style={styles.error}>{errorMsgEmail}</Text>}
                    </Text>
                </View>
                <View>
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={text => setPassword(text)}
                        style={styles.input}
                        secureTextEntry
                    />
                    <Text>
                        {errorMsgPassword && <Text style={styles.error}>{errorMsgPassword}</Text>}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={forgetPassword}>
                <Text style={[styles.signUpText, {alignItems: 'flex-end'}]}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    onPress={handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%'
    },
    input :{
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 5,
        borderWidth: 2,
        borderColor: '#213A5C'
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    button: {
        backgroundColor: '#F3BB01',
        width: '100%',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    line: {
        height: 1,
        width: '80%',
        backgroundColor: 'gray',
        marginVertical: 10,
    },
    signUpText: {
        marginTop: 20,
        fontSize: 16,
        color: '#888888',
    },
    error: {
        color: 'red'
    }
});