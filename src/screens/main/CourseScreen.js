import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import Colors from '../../themes/colors';
import Metrics from '../../themes/metrics';

// Dummy data for courses
const featuredCourses = [
  {
    id: '1',
    title: 'Italian Cuisine Basics',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    level: 'Beginner',
    description: 'Learn the fundamentals of Italian cooking from authentic pasta to classic sauces.',
    instructor: {
      name: 'Chef Marco',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    },
    price: 49.99,
  },
  {
    id: '2',
    title: 'Plant-Based Cooking',
    imageUrl: 'https://images.unsplash.com/photo-1516685018646-549198525c1b',
    level: 'All Levels',
    description: 'Master the art of creating delicious and nutritious plant-based meals.',
    instructor: {
      name: 'Chef Sarah',
      avatar: 'https://images.unsplash.com/photo-1611432579699-484f7990b127',
    },
    price: 39.99,
  },
];

const workshops = [
  {
    id: '3',
    title: 'Sushi Making Workshop',
    date: 'June 15',
    time: '2:00 PM - 5:00 PM',
    tag: 'Limited Seats',
  },
  {
    id: '4',
    title: 'Bread Baking Basics',
    date: 'June 22',
    time: '10:00 AM - 1:00 PM',
    tag: 'Beginner Friendly',
  },
];

const myLearning = {
  id: '5',
  title: 'French Pastry Techniques',
  progress: 45,
  nextClass: 'Tomorrow, 7 PM',
  status: 'In Progress',
};

// Category filters
const courseCategories = [
  'All',
  'Beginners',
  'Advanced',
  'Master Class',
  'Workshops',
  'Pastry',
  'Baking',
];

const CourseScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.gradientStart} barStyle="dark-content" />
      
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-left" size={24} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cooking Courses</Text>
          </View>
        </View>
        
        <FlatList
          data={courseCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </LinearGradient>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Courses</Text>
          
          {featuredCourses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <Image
                source={{ uri: course.imageUrl }}
                style={styles.courseImage}
                resizeMode="cover"
              />
              <View style={styles.courseContent}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={[
                    styles.levelBadge,
                    course.level === 'Beginner' ? styles.beginnerBadge : styles.allLevelsBadge
                  ]}>
                    <Text style={styles.levelText}>{course.level}</Text>
                  </View>
                </View>
                <Text style={styles.courseDescription}>{course.description}</Text>
                <View style={styles.courseFooter}>
                  <View style={styles.instructorContainer}>
                    <Image
                      source={{ uri: course.instructor.avatar }}
                      style={styles.instructorAvatar}
                    />
                    <Text style={styles.instructorName}>{course.instructor.name}</Text>
                  </View>
                  <Text style={styles.coursePrice}>${course.price}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Workshops</Text>
          
          {workshops.map((workshop) => (
            <View key={workshop.id} style={styles.workshopCard}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateDay}>{workshop.date.split(' ')[1]}</Text>
                <Text style={styles.dateMonth}>{workshop.date.split(' ')[0]}</Text>
              </View>
              <View style={styles.workshopInfo}>
                <Text style={styles.workshopTitle}>{workshop.title}</Text>
                <View style={styles.workshopTimeContainer}>
                  <Icon name="clock" size={14} color={Colors.textDark} />
                  <Text style={styles.workshopTime}>{workshop.time}</Text>
                </View>
                <View style={styles.workshopTagContainer}>
                  <Text style={styles.workshopTag}>{workshop.tag}</Text>
                </View>
              </View>
              <Button
                title="Enroll"
                size="small"
                onPress={() => {}}
                style={styles.enrollButton}
              />
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Learning</Text>
          
          <View style={styles.learningCard}>
            <View style={styles.learningHeader}>
              <Text style={styles.learningTitle}>{myLearning.title}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{myLearning.status}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${myLearning.progress}%` }]} 
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>{myLearning.progress}% completed</Text>
                <Text style={styles.nextClassText}>Next class: {myLearning.nextClass}</Text>
              </View>
            </View>
            
            <View style={styles.learningActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="clipboard" size={16} color={Colors.textDark} style={styles.actionIcon} />
                <Text style={styles.actionText}>Notes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="calendar" size={16} color={Colors.textDark} style={styles.actionIcon} />
                <Text style={styles.actionText}>Attendance</Text>
              </TouchableOpacity>
              
              <Button
                title="Continue"
                size="small"
                iconName="play-circle"
                onPress={() => {}}
                style={styles.continueButton}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
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
    paddingBottom: Metrics.mediumSpacing,
  },
  headerContent: {
    marginVertical: Metrics.mediumSpacing,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Metrics.baseSpacing,
  },
  headerTitle: {
    fontSize: Metrics.xxLargeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  categoriesContainer: {
    paddingRight: Metrics.mediumSpacing,
  },
  categoryTab: {
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.smallSpacing,
    marginRight: Metrics.mediumSpacing,
  },
  selectedCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  categoryTabText: {
    color: Colors.textMedium,
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Metrics.mediumSpacing,
    paddingTop: Metrics.mediumSpacing,
  },
  section: {
    marginBottom: Metrics.largeSpacing,
  },
  sectionTitle: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.mediumSpacing,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    marginBottom: Metrics.mediumSpacing,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseContent: {
    padding: Metrics.mediumSpacing,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Metrics.baseSpacing,
  },
  courseTitle: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  levelBadge: {
    paddingVertical: Metrics.smallSpacing / 2,
    paddingHorizontal: Metrics.baseSpacing,
    borderRadius: Metrics.baseBorderRadius,
  },
  beginnerBadge: {
    backgroundColor: Colors.info + '20', // 20% opacity
  },
  allLevelsBadge: {
    backgroundColor: Colors.success + '20', // 20% opacity
  },
  levelText: {
    fontSize: Metrics.xSmallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  courseDescription: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
    marginBottom: Metrics.baseSpacing,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Metrics.baseSpacing,
  },
  instructorName: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
  coursePrice: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
  },
  workshopCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  dateContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.gradientStart,
    borderRadius: Metrics.baseBorderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Metrics.mediumSpacing,
  },
  dateDay: {
    fontSize: Metrics.largeFontSize,
    fontWeight: '700',
    color: Colors.textDark,
  },
  dateMonth: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textDark,
  },
  workshopInfo: {
    flex: 1,
  },
  workshopTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Metrics.smallSpacing,
  },
  workshopTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.baseSpacing,
  },
  workshopTime: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textDark,
    marginLeft: Metrics.smallSpacing,
  },
  workshopTagContainer: {
    backgroundColor: Colors.tag,
    borderRadius: Metrics.roundedFull,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  workshopTag: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textDark,
  },
  enrollButton: {
    marginLeft: Metrics.baseSpacing,
  },
  learningCard: {
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  learningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.mediumSpacing,
  },
  learningTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  statusBadge: {
    backgroundColor: Colors.warning + '20', // 20% opacity
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Metrics.baseBorderRadius,
  },
  statusText: {
    fontSize: Metrics.xSmallFontSize,
    fontWeight: '500',
    color: Colors.textDark,
  },
  progressContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    marginBottom: Metrics.baseSpacing,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Metrics.roundedFull,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textDark,
  },
  nextClassText: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.textDark,
  },
  learningActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: Colors.background,
    paddingVertical: Metrics.baseSpacing,
    paddingHorizontal: Metrics.mediumSpacing,
    borderRadius: Metrics.roundedFull,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: Metrics.smallSpacing,
  },
  actionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
  continueButton: {
    minWidth: 100,
  },
  bottomPadding: {
    height: Metrics.xxLargeSpacing,
  },
});

export default CourseScreen;