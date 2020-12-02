import React, {Component} from 'react';
import {View, Platform} from 'react-native';
import Home from './HomeComponent'
import Menu from './MenuComponent';
import Dishdetail from './DishdetailComponent';
import {createStackNavigator, createDrawerNavigator} from 'react-navigation';

const MenuNavigator = createStackNavigator ({ 
    Menu: { screen: Menu },
    Dishdetail: { screen: Dishdetail }
},{
    initialRouteName: 'Menu',
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#512DA8'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            color: '#fff'
        }
    }
}
)

const HomeNavigator = createStackNavigator ({ 
    Home: { screen: Home }
},{
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#512DA8'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            color: '#fff'
        }
    }
}
)

const MainNavigator = createDrawerNavigator ({ 
    Home: { 
        screen: HomeNavigator, 
        navigationOptions: {
            title: 'Home',
            drawerLabel: 'Home'
        }
    },
    Menu: { 
        screen: MenuNavigator, 
        navigationOptions: {
            title: 'Menu',
            drawerLabel: 'Menu'
        }
    }
},{
    drawerBackgroundColor: '#D1C4E9'
})

export default class Main extends Component {
    constructor(props){
        super(props);
    }

    render () {
        return (
            <View style={ {flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : Expo.Constants.statusBarHeight} }>
                <MainNavigator/>
            </View>
        )
    }
}