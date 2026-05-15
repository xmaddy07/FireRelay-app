import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, Image } from 'react-native';
import { styles } from './styles';
import Header from '../../../components/Header';
import CountyDetailScreen from '../CountyDetailScreen';
import LinearGradient from 'react-native-linear-gradient';
import { images } from '../../../constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
type County = { name: string; code: string; est: string };

type Props = {
  onOpenDrawer?: () => void;
};

const counties: County[] = [
  { name: 'Travis', code: 'TX-TRA', est: '1840' },
  { name: 'Wilco', code: 'TX-WIL', est: '1848' },
  { name: 'McLennan', code: 'TX-MCL', est: '1850' },
];

const CountiesScreen = ({ onOpenDrawer }: Props) => {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const transitionAnim = useRef(new Animated.Value(0)).current;

  // Entrance animations
  const listEntranceAnim = useRef(new Animated.Value(0)).current;
  const cardFades = useRef(counties.map(() => new Animated.Value(0))).current;
  const cardSlides = useRef(counties.map(() => new Animated.Value(20))).current;

  useEffect(() => {
    // Initial entrance sequence
    Animated.sequence([
      Animated.timing(listEntranceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        ...cardFades.map((fade, i) =>
          Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(cardSlides[i], { toValue: 0, duration: 400, useNativeDriver: true })
          ])
        )
      ])
    ]).start();
  }, []);

  const handleSelectCounty = (county: County) => {
    setSelectedCounty(county);
    setIsDetailVisible(true);
    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    Animated.timing(transitionAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDetailVisible(false);
      setSelectedCounty(null);
    });
  };

  const listOpacity = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const listTranslateX = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const detailOpacity = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const detailTranslateX = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[StyleSheet.absoluteFill, {
        opacity: listOpacity,
        transform: [{ translateX: listTranslateX }],
        zIndex: isDetailVisible ? 0 : 1,
      }]}>
        <Animated.View style={{ opacity: listEntranceAnim }}>
          <Header title="Counties" onMenuPress={onOpenDrawer} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.statusCard, {
            opacity: listEntranceAnim,
            transform: [{
              translateY: listEntranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }]}>
            <Text style={styles.statusTitle}>Welcome back, steve!</Text>
            <Text style={styles.statusSubtitle}>
              System status: <Text style={styles.statusLive}>Operational</Text>
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: listEntranceAnim }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Counties</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{counties.length} TOTAL</Text>
              </View>
            </View>
            <Text style={styles.sectionCaption}>LIST OF ALL COUNTIES IN THE SYSTEM</Text>
          </Animated.View>

          {counties.map((county, index) => (
            <TouchableOpacity
              key={county.name}
              onPress={() => handleSelectCounty(county)}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.card, {
                opacity: cardFades[index],
                transform: [{ translateY: cardSlides[index] }]
              }]}>
                <View style={styles.cardRow}>
                  <View style={styles.cardIconWrapper}>
                    <Image source={images.map} style={styles.cardIconImage} />
                  </View>
                  <View style={styles.cardText}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{county.name}</Text>
                      <View style={styles.dotWrapper}>
                        <View style={styles.dot} />
                      </View>
                    </View>
                    <Text style={styles.cardMeta}>CODE: {county.code} | EST. {county.est}</Text>
                  </View>
                  <View style={styles.cardEnd}>
                    <AntDesign name="right" size={14} color="#fff" />
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}

          <Animated.View style={{
            opacity: listEntranceAnim,
            transform: [{
              translateY: listEntranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }]
          }}>
            <LinearGradient
              colors={['#07101d', '#0d1728']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureCard}
            >
              <Text style={styles.featureTitle}>System Health</Text>
              <Text style={styles.featureSubtitle}>ALL NODES SYNCHRONIZED</Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {(isDetailVisible || selectedCounty) && (
        <Animated.View style={[StyleSheet.absoluteFill, {
          opacity: detailOpacity,
          transform: [{ translateX: detailTranslateX }],
          zIndex: isDetailVisible ? 1 : 0,
        }]}>
          {selectedCounty && (
            <CountyDetailScreen
              county={selectedCounty}
              onBack={handleBack}
            />
          )}
        </Animated.View>
      )}
    </LinearGradient>
  );
};

export default CountiesScreen;
