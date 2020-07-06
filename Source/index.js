import React from 'react';
import { StyleSheet, Platform } from 'react-native';


export const homeStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "black",
    },
    mainText: {
        paddingTop: 250,
        color: 'white',
        fontSize: 30
    },
    input: { 
        marginTop: 100,
        height: 40, 
        maxWidth: 300, 
        backgroundColor: 'white', 
        borderRadius: 20
    }
});
