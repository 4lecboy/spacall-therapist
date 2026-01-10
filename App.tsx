import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Session } from '@supabase/supabase-js';

import { supabase } from './lib/supabase';
import { COLORS, SIZES, SHADOWS } from './constants/theme';
import ScreenWrapper from './components/ScreenWrapper';
import CustomText from './components/CustomText';
import Auth from './components/Auth'; // Make sure this component uses the new theme too!
import ActiveJobScreen from './screens/ActiveJobScreen';

export default function App() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold, Lato_400Regular, Lato_700Bold });
  const [session, setSession] = useState<Session | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null); // New state to hold current job

  // 1. Session Management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // Check for any active job when session becomes available
  useEffect(() => {
    if (session) checkActiveJob();
  }, [session]);

  // 2. Toggle Online Status
  async function toggleOnline(value: boolean) {
    if (!session?.user) return;
    
    setIsOnline(value);
    
    if (value) {
      // Go Online: Get Location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow location to receive jobs.');
        setIsOnline(false);
        return;
      }
      
      let loc = await Location.getCurrentPositionAsync({});
      
      // Update DB
      await supabase.from('profiles').update({
        is_online: true,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      }).eq('id', session.user.id);
      
      fetchJobs(); // Check for jobs immediately
    } else {
      // Go Offline
      await supabase.from('profiles').update({ is_online: false }).eq('id', session.user.id);
    }
  }

  // 3. Fetch Jobs
  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) Alert.alert('Error', error.message);
    else setJobs(data || []);
    setLoading(false);
  }

  async function checkActiveJob() {
    if (!session) return;
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('therapist_id', session.user.id)
      .in('status', ['ACCEPTED', 'ARRIVED', 'IN_SESSION']) // Check all active states
      .maybeSingle();

    if (data) setActiveJob(data);
  }

  // 4. Accept Job
  async function acceptJob(bookingId: string) {
    if (!session?.user) return;
    
    const { data: updated, error } = await supabase
      .from('bookings')
      .update({ status: 'ACCEPTED', therapist_id: session.user.id })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) Alert.alert('Error', error.message);
    else {
      // Fetch the full job details again to be safe
      const { data: job } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      setActiveJob(job); // <--- SWITCH SCREEN
    }
  }

  // -- RENDER HELPERS --

  if (!fontsLoaded) return <ActivityIndicator size="large" color={COLORS.primary} />;

  if (!session) return <Auth />; // You might need to style Auth.tsx later

  // NEW: If active job, show that screen ONLY
  if (activeJob) {
    return (
      <ActiveJobScreen 
        job={activeJob} 
        onComplete={() => {
          setActiveJob(null); // Clear state
          fetchJobs();        // Refresh feed
        }} 
      />
    );
  }

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <CustomText variant="caption">Welcome back,</CustomText>
          <CustomText variant="h2">Therapist</CustomText>
        </View>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* EARNINGS CARD */}
      <View style={styles.earningsCard}>
        <CustomText variant="caption" color={COLORS.white} style={{opacity: 0.8}}>Today's Earnings</CustomText>
        <CustomText variant="h1" color={COLORS.white}>₱0.00</CustomText>
        <View style={styles.earningsRow}>
           <CustomText variant="caption" color={COLORS.white}>0 Jobs Completed</CustomText>
           <CustomText variant="caption" color={COLORS.white}>0h Online</CustomText>
        </View>
      </View>

      {/* ONLINE TOGGLE */}
      <View style={styles.statusContainer}>
        <CustomText variant="h3">
            Status: <CustomText variant="h3" color={isOnline ? COLORS.success : COLORS.muted}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
            </CustomText>
        </CustomText>
        <Switch 
            trackColor={{ false: "#767577", true: COLORS.goldLight }}
            thumbColor={isOnline ? COLORS.primary : "#f4f3f4"}
            onValueChange={toggleOnline}
            value={isOnline}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
        />
      </View>

      {/* JOB FEED */}
      <View style={{ flex: 1, marginTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <CustomText variant="h3">Available Jobs</CustomText>
            <TouchableOpacity onPress={fetchJobs}>
                <Ionicons name="refresh" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color={COLORS.primary} /> : (
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
                        <Ionicons name="documents-outline" size={50} color={COLORS.muted} />
                        <CustomText style={{ marginTop: 10 }}>No jobs nearby.</CustomText>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.jobCard}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                             <CustomText variant="h3">{item.service_type}</CustomText>
                             <CustomText variant="h3" color={COLORS.primary}>₱{item.total_price}</CustomText>
                        </View>
                        <CustomText variant="caption" style={{marginVertical: 5}}>
                            <Ionicons name="location-outline" size={12} /> {item.location?.address || 'Client Location'}
                        </CustomText>
                        
                        <View style={styles.divider} />
                        
                        <TouchableOpacity 
                            style={styles.acceptBtn}
                            onPress={() => acceptJob(item.id)}
                        >
                            <CustomText variant="h3" color={COLORS.white}>ACCEPT JOB</CustomText>
                        </TouchableOpacity>
                    </View>
                )}
            />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  earningsCard: {
    backgroundColor: COLORS.secondary, // Dark card for contrast
    borderRadius: SIZES.radius,
    padding: 25,
    ...SHADOWS.medium,
    marginBottom: 20,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.primary, // Gold border for jobs
    ...SHADOWS.light,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.light,
  }
});