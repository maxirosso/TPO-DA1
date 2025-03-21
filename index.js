/**
 * @format
 */

// index.js
import {AppRegistry} from 'react-native';
import App from './src/App'; // Update path to point to the correct location
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
