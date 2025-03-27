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

const featuredCourses = [
  {
    id: '1',
    title: 'Cocina Italiana Básica',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    level: 'Principiante',
    description: 'Aprende los fundamentos de la cocina italiana, desde pastas auténticas hasta salsas clásicas.',
    instructor: {
      name: 'Chef Marco',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    },
    price: 49.99,
  },
  {
    id: '2',
    title: 'Cocina Basada en Plantas',
    imageUrl: 'https://images.unsplash.com/photo-1516685018646-549198525c1b',
    level: 'Todos los Niveles',
    description: 'Domina el arte de crear comidas deliciosas y nutritivas basadas en plantas.',
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
    title: 'Taller de Elaboración de Sushi',
    date: '15 de Junio',
    time: '2:00 PM - 5:00 PM',
    tag: 'Asientos Limitados',
  },
  {
    id: '4',
    title: 'Panificación Básica',
    date: '22 de Junio',
    time: '10:00 AM - 1:00 PM',
    tag: 'Apto para Principiantes',
  },
];

const myLearning = {
  id: '5',
  title: 'Técnicas de Pastelería Francesa',
  progress: 45,
  nextClass: 'Mañana, 7 PM',
  status: 'En Progreso',
};

const courseCategories = [
  'Todos',
  'Principiantes',
  'Avanzado',
  'Clase Magistral',
  'Talleres',
  'Pastelería',
  'Panificación',
];

const CourseScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

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
            <Text style={styles.headerTitle}>Cursos de Cocina</Text>
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
          <Text style={styles.sectionTitle}>Cursos Destacados</Text>
          
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
                    course.level === 'Principiante' ? styles.beginnerBadge : styles.allLevelsBadge
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
          <Text style={styles.sectionTitle}>Próximos Talleres</Text>
          
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
                title="Inscribirse"
                size="small"
                onPress={() => {}}
                style={styles.enrollButton}
              />
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Aprendizaje</Text>
          
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
                <Text style={styles.progressText}>{myLearning.progress}% completado</Text>
                <Text style={styles.nextClassText}>Próxima clase: {myLearning.nextClass}</Text>
              </View>
            </View>
            
            <View style={styles.learningActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="clipboard" size={16} color={Colors.textDark} style={styles.actionIcon} />
                <Text style={styles.actionText}>Notas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="calendar" size={16} color={Colors.textDark} style={styles.actionIcon} />
                <Text style={styles.actionText}>Asistencia</Text>
              </TouchableOpacity>
              
              <Button
                title="Continuar"
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
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Metrics.baseSpacing,
  },
  instructorName: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
  },
  coursePrice: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  workshopCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Metrics.mediumBorderRadius,
    padding: Metrics.mediumSpacing,
    marginBottom: Metrics.mediumSpacing,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: Metrics.baseBorderRadius,
    marginRight: Metrics.mediumSpacing,
  },
  dateDay: {
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.card,
  },
  dateMonth: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.card,
  },
  workshopInfo: {
    flex: 1,
    marginRight: Metrics.mediumSpacing,
  },
  workshopTitle: {
    fontSize: Metrics.baseFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: Metrics.smallSpacing,
  },
  workshopTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Metrics.smallSpacing,
  },
  workshopTime: {
    fontSize: Metrics.smallFontSize,
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
    height: 36,
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
    fontSize: Metrics.mediumFontSize,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: Metrics.baseSpacing,
  },
  statusBadge: {
    backgroundColor: Colors.success + '20', // 20% opacity
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Metrics.baseBorderRadius,
  },
  statusText: {
    fontSize: Metrics.xSmallFontSize,
    color: Colors.success,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: Metrics.mediumSpacing,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Metrics.roundedFull,
    overflow: 'hidden',
    marginBottom: Metrics.baseSpacing,
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
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    fontWeight: '500',
  },
  nextClassText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textMedium,
  },
  learningActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Metrics.baseSpacing,
    backgroundColor: Colors.background,
    borderRadius: Metrics.baseBorderRadius,
  },
  actionIcon: {
    marginRight: Metrics.smallSpacing,
  },
  actionText: {
    fontSize: Metrics.smallFontSize,
    color: Colors.textDark,
    fontWeight: '500',
  },
  continueButton: {
    height: 36,
  },
  bottomPadding: {
    height: Metrics.largeSpacing,
  },
});

export default CourseScreen;