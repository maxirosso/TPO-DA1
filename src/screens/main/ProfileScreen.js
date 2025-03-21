import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { signOut } = React.useContext(AuthContext);

  // Mock user data
  const user = {
    name: 'Sarah Johnson',
    username: '@sarahjcook',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    bio: 'Food enthusiast and home chef. Love to experiment with new flavors and share my recipes.',
    location: 'San Francisco, CA',
    recipeCount: 42,
    followers: 1253,
    following: 384,
  };

  const menuItems = [
    {
      id: 'my_recipes',
      icon: 'book-open',
      title: 'My Recipes',
      description: 'View and manage your recipes',
    },
    {
      id: 'my_courses',
      icon: 'briefcase',
      title: 'My Courses',
      description: 'Track your learning progress',
    },
    {
      id: 'saved_recipes',
      icon: 'bookmark',
      title: 'Saved Recipes',
      description: 'Recipes youve saved for later',
    },
    {
      id: 'shopping_list',
      icon: 'shopping-cart',
      title: 'Shopping List',
      description: 'Your ingredients shopping list',
    },
    {
      id: 'settings',
      icon: 'settings',
      title: 'Settings',
      description: 'App preferences and account settings',
    },
    {
      id: 'help',
      icon: 'help-circle',
      title: 'Help & Support',
      description: 'FAQs and contact information',
    },
  ];

  const handleMenuItemPress = (id) => {
    if (id === 'saved_recipes') {
      navigation.navigate('SavedTab');
    } else if (id === 'settings') {
      // Navigate to Settings
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="settings" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={16} color={Colors.card} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>{user.username}</Text>

          <Text style={styles.userBio}>{user.bio}</Text>

          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={14} color={Colors.textMedium} />
            <Text style={styles.locationText}>{user.location}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.recipeCount}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              title="Edit Profile"
              type="outline"
              style={styles.editButton}
            />
            <Button
              title="Share Profile"
              type="primary"
              iconName="share-2"
              style={styles.shareButton}
            />
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.id)}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>
                  {item.description}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.textMedium} />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Sign Out"
          type="outline"
          onPress={signOut}
          style={styles.signOutButton}
        />

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: Metrics.mediumSpacing,
    paddingVertical: Metrics.mediumSpacing,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    marginHorizontal: Metrics.mediumSpacing,
    marginTop: -20,
    padding: Metrics.mediumSpacing,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -50,
    marginBottom: Metrics.baseSpacing,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.card,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  userName: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.baseSpacing,
  },
  userBio: {
    fontSize: Metrics.baseFontSize,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Metrics.baseSpacing,
    lineHeight: Metrics.mediumLineHeight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  locationText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
    paddingVertical: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.border,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  editButton: {
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  shareButton: {
    flex: 1,
    marginLeft: Metrics.baseSpacing,
  },
  menuContainer: {
    marginHorizontal: Metrics.mediumSpacing,
    marginVertical: Metrics.mediumSpacing,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Metrics.baseBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.baseSpacing,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10', // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  signOutButton: {
    marginHorizontal: Metrics.mediumSpacing,
    marginTop: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: Metrics.xxLargeSpacing,
  },
  versionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
});

export default ProfileScreen;