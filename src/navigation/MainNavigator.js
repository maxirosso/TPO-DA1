import DatabaseTablesScreen from '../screens/main/DatabaseTablesScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DatabaseTables" component={DatabaseTablesScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator; 