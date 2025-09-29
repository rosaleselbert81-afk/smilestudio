import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { FontAwesome } from '@expo/vector-icons';
import React, { useRef } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  });

  const scrollRef = useRef<ScrollView>(null);

  // Refs for sections
  const sectionRefs = {
    start: useRef<View>(null),
    benefits: useRef<View>(null),
    concept: useRef<View>(null),
    topics: useRef<View>(null),
    purpose: useRef<View>(null),
    testimonials: useRef<View>(null),
    contact: useRef<View>(null),
  };

  type SectionKey = keyof typeof sectionRefs;

  const scrollToSection = (key: SectionKey) => {
    sectionRefs[key]?.current?.measureLayout(
      scrollRef.current!.getInnerViewNode(),
      (x, y) => {
        scrollRef.current?.scrollTo({ y, animated: true });
      }
    );
  };

  

  const login = () => {
    router.replace('/login');
  };

  if (!fontsLoaded) return <AppLoading />;

  const isMobile = width < 768;

  return (
    <ScrollView style={styles.container} ref={scrollRef}>
      {/* Header */}
      <LinearGradient colors={['#80c4c4ff', '#009b84ff']} style={{...styles.header}}>
        
        <Text style={styles.logo}> Smile Studio</Text>
        {!isMobile && (
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => scrollToSection('start')}>
            <Text style={styles.navItem}>Get Start</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('benefits')}>
            <Text style={styles.navItem}>Benefits</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('concept')}>
            <Text style={styles.navItem}>Concept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('topics')}>
            <Text style={styles.navItem}>Topics</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('purpose')}>
            <Text style={styles.navItem}>Purpose</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('testimonials')}>
            <Text style={styles.navItem}>Testimonials</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('contact')}>
            <Text style={styles.navItem}>Contact</Text>
          </TouchableOpacity>
        </View>
      )}
      </LinearGradient>

      {/* Hero Section */}
      <View ref={sectionRefs.start} style={styles.hero}>
        <LinearGradient colors={['#ffffffff', '#6ce2ffff']} style={styles.objects}> 
        <Text style={{ ...styles.heroTitle, fontSize: 36 }}>
          Explore Dental Clinics Around San Jose Delmonte Bulacan!
        </Text>
        <Text style={styles.heroSubtitle}>
          We believe that a confident smile and healthy teeth are best achieved
          when guided by expertise.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={login}>
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.trusted}>
          Trusted by 7+ Dental Clinics around San Jose Delmonte Bulacan
        </Text>
        <View style={styles.logos}>
          <Text style={styles.logoItem}>🦷 Care</Text>
          <Text style={styles.logoItem}>🥗 Eat</Text>
          <Text style={styles.logoItem}>😁 Confidence</Text>
        </View>
        </LinearGradient>
      </View>

      {/* Benefits Section */}
      <View ref={sectionRefs.benefits} style={styles.section}>
        <LinearGradient colors={['#ffffffff', '#6ce2ffff']} style={styles.objects}> 
        <Text style={{ ...styles.sectionTitle, fontSize: 36 }}>
          Dental Central Hub Benefits?
        </Text>
        <Text style={styles.sectionSubtitle}>
          Appointments are designed to improve your overall oral health,
          strengthen dental wellness, and enhance the appearance of your smile.
        </Text>
        <View style={[styles.cardContainer, isMobile && { flexDirection: 'column', alignItems: 'center' }]}>
          <View style={[styles.card, isMobile && { width: '90%' }]}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.cardTitle}>
              Streamline Dental Appointment Scheduling
            </Text>
            <Text style={styles.cardDesc}>
              Provide a seamless, user-friendly platform for patients to book,
              reschedule, and cancel dental appointments anytime, anywhere,
              reducing scheduling conflicts and administrative workload.
            </Text>
          </View>
          <View style={[styles.card, isMobile && { width: '90%' }]}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardTitle}>
              Improve Patient Experience Through Accessible Services
            </Text>
            <Text style={styles.cardDesc}>
              Offer features like instant booking confirmation, automated
              reminders, and easy access to dental records, ensuring convenience
              and reducing patient wait times.
            </Text>
          </View>
          <View style={[styles.card, isMobile && { width: '90%' }]}>
            <Text style={styles.cardIcon}>🖥️</Text>
            <Text style={styles.cardTitle}>
              Integrate Modern Digital & AR Features for Patient Engagement
            </Text>
            <Text style={styles.cardDesc}>
              Offer augmented reality (AR) tools for dental education and
              treatment previews, fostering patient understanding and trust
              while promoting a more interactive and engaging healthcare
              experience.
            </Text>
          </View>
        </View>
        </LinearGradient>
      </View>

      {/* Concept Section */}
      <View ref={sectionRefs.concept} style={styles.statsSection}>
        <LinearGradient colors={['#ffffffff', '#6ce2ffff']} style={styles.objects}> 
        <Text style={{ ...styles.statsTitle, fontSize: 36 }}>
          Capstone Prototype (STI)
        </Text>
        <View style={[styles.statsContainer, isMobile && { flexDirection: 'column', alignItems: 'center' }]}>
          <View style={[styles.statCard, isMobile && { width: '90%' }]}>
            <Text style={{...styles.statValue, fontSize: isMobile ? 20 : 34, textAlign: 'center'}}>30+ (expect example)</Text>
            <Text style={styles.statLabel}>Clinics</Text>
          </View>
          <View style={[styles.statCard, isMobile && { width: '90%' }]}>
            <Text style={{...styles.statValue, fontSize: isMobile ? 20 : 34, textAlign: 'center'}}>300+ (expect example)</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={[styles.statCard, isMobile && { width: '90%' }]}>
            <Text style={{...styles.statValue, fontSize: isMobile ? 20 : 34, textAlign: 'center'}}>4</Text>
            <Text style={styles.statLabel}>Only Developers</Text>
          </View>
        </View>
        </LinearGradient>
      </View>

      {/* Topics Section */}
      <View ref={sectionRefs.topics} style={{ ...styles.section }}>
        <LinearGradient colors={['#ffffffff', '#6ce2ffff']} style={styles.objects}> 
        <Text style={{ ...styles.sectionTitle, fontSize: 36 }}>Topics</Text>
        <View style={[styles.cardContainer, isMobile && { flexDirection: 'column', alignSelf: 'center' }]}>
          <View style={[styles.card, isMobile && { width: '90%' }]}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardTitle}>Finding the Right Clinic Near You</Text>
            <Text style={styles.cardDesc}>
              Searching for a trusted clinic in San Jose Del Monte Bulacan? Our
              hub makes it easy. Explore a variety of dental clinics conveniently
              located near you. See their profiles, services, and availability
              all in one place.
            </Text>
          </View>
          <View style={[styles.card, isMobile && { width: '90%' }]}>
            <Text style={styles.cardIcon}>🦷</Text>
            <Text style={styles.cardTitle}>Common Dental Concerns, Easy Solutions</Text>
            <Text style={styles.cardDesc}>
              Many people in San Jose Del Monte Bulacan experience similar
              dental issues, from toothaches to the need for routine check-ups.
            </Text>
          </View>
          <View style={[styles.card, isMobile && { width: '90%' }]}>
            <Text style={styles.cardIcon}>📲</Text>
            <Text style={styles.cardTitle}>Book Your Appointment Online</Text>
            <Text style={styles.cardDesc}>
              Say goodbye to long phone calls! Our dental hub empowers you to
              easily schedule appointments.
            </Text>
          </View>
        </View>
        </LinearGradient>
      </View>

      {/* Purpose Section */}
      <View ref={sectionRefs.purpose} style={styles.heroAlt}>
        <LinearGradient colors={['#ffffffff', '#6ce2ffff']} style={styles.objects}> 
        <Text style={styles.heroTitle}>Our Purpose</Text>
        <Text style={styles.heroSubtitle}>
          This platform was created to bridge the gap between patients and
          trusted dental clinics in SJDM, Caloocan, and Metro Manila.
        </Text>
        <TouchableOpacity style={styles.ctaBtnAlt}>
          <Text style={styles.ctaText} onPress={login}>Wanna get Started?</Text>
        </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Testimonials */}
      <View ref={sectionRefs.testimonials} style={[styles.sectionTestimonials, isMobile && { flexDirection: 'column', alignItems: 'center' }]}>
        <LinearGradient colors={['#ffffffff', '#6ce2ffff']} style={styles.objects}> 
        <Text style={{ ...styles.sectionTitle, fontSize: 36 }}>Patient Testimonials</Text>
        <View style={styles.testimonials}>
          <View style={[styles.testimonial, isMobile && { width: '90%' }]}>
            <Text style={styles.testimonialText}>
              "I’ve never felt more confident in my smile."
            </Text>
            <Text style={styles.testimonialAuthor}>— Emily Johnson</Text>
          </View>
          <View style={[styles.testimonial, isMobile && { width: '90%' }]}>
            <Text style={styles.testimonialText}>
              "The staff was so friendly, and the entire process was pain-free."
            </Text>
            <Text style={styles.testimonialAuthor}>— James Carter</Text>
          </View>
        </View>
        </LinearGradient>
      </View>

      {/* Footer */}
      <LinearGradient colors={['#80c4c4ff', '#009b84ff']} style={styles.footer}>
        <Text style={styles.footerText}>© SmileStudio 2025</Text>
        <Text style={styles.footerText}>smilestudiohub@gmail.com</Text>
        <Text style={styles.footerText}>09218881835</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacy</Text>
          <Text style={styles.footerLink}>Terms</Text>
          <Text style={styles.footerLink}>Help</Text>
          <Text style={styles.footerLink}>Contact</Text>
        </View>
        <View style={styles.socialIcons}>
          <FontAwesome name="google" size={24} color="#ffffffff" />
          <FontAwesome name="facebook" size={24} color="#ffffffff" />
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f7',
  },
  header: {
    padding: 38,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
  },
  logo: {
    fontSize: 30,
    color: '#ffffffff',
    fontFamily: 'Poppins-Bold',
  },
  nav: {
    flexDirection: 'row',
    gap: 20,
  },
  navItem: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#ffffffff',
    marginHorizontal: 8,
  },

  hero: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 700,
    backgroundColor: '#ccf0ebff',
  },
  heroAlt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 700,
    backgroundColor: '#ccf0ebff',
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaBtn: {
    backgroundColor: '#ff416c',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 40,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ff6f91',
    shadowColor: '#ff416c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaBtnAlt: {
    backgroundColor: '#416cff',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 40,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#6f91ff',
    shadowColor: '#416cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  trusted: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  logos: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  logoItem: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#999',
  },

  section: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 700,
    backgroundColor: '#ccf0ebff',
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#444',
    textAlign: 'center',
    marginBottom: 28,
  },

  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#bbb',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  statsSection: {
    backgroundColor: '#ccf0ebff',
    paddingVertical: 48,
    paddingHorizontal: 30,
    alignItems: 'center',
    minHeight: 700,
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 34,
    fontFamily: 'Poppins-Bold',
    color: '#ff416c',
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333',
  },

  sectionTestimonials: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 700,
    backgroundColor: '#ccf0ebff',
  },
  testimonials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 20,
    flexWrap: 'wrap',
  },
  testimonial: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  testimonialText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#888',
  },

  footer: {
    backgroundColor: '#ffffffff',
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#ffffffff',
    marginBottom: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#ffffffff'
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  logo1: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 50,
    resizeMode: 'contain',
  },
  objects: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 700,
    borderRadius: 25,
    width: "100%",
    backgroundColor: '#ffe0ec',
  }
});
