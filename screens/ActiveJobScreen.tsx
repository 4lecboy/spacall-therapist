import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomText from '../components/CustomText';

interface Props {
  job: any;
  onComplete: () => void; // Go back to dashboard when done
}

export default function ActiveJobScreen({ job, onComplete }: Props) {
  const [status, setStatus] = useState(job.status);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 1. Timer Logic (Robust)
  useEffect(() => {
    let interval: any;

    if (status === 'IN_SESSION' && job.started_at) {
      // Calculate seconds between NOW and WHEN WE STARTED
      const startTime = new Date(job.started_at).getTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(diff);
      };

      updateTimer(); // Run once immediately
      interval = setInterval(updateTimer, 1000); // Update every second
    }

    return () => clearInterval(interval);
  }, [status, job.started_at]);

  // 2. Helper: Open Maps
  const openMaps = () => {
    const lat = job.location?.latitude;
    const lng = job.location?.longitude;
    if (!lat || !lng) return Alert.alert('Error', 'No location data');

    const label = 'Client Location';
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    });
    Linking.openURL(url!);
  };

  // 3. State Machine Actions
  async function updateStatus(newStatus: string) {
    const updates: any = { status: newStatus };

    // If starting, save the timestamp
    if (newStatus === 'IN_SESSION') updates.started_at = new Date().toISOString();
    // If ending, save end time
    if (newStatus === 'COMPLETED') updates.ended_at = new Date().toISOString();

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', job.id);

    if (error) {
      Alert.alert('Update Failed', error.message);
    } else {
      setStatus(newStatus);
      // If we just started, we need to update the local 'job' object too so the timer hook sees 'started_at'
      if (newStatus === 'IN_SESSION') job.started_at = updates.started_at;
      if (newStatus === 'COMPLETED') {
        Alert.alert('Job Done!', 'Payment recorded.');
        onComplete();
      }
    }
  }

  // 4. Format Timer (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenWrapper>
      {/* HEADER: Client Info */}
      <View style={styles.header}>
        <View>
          <CustomText variant="caption">Current Job</CustomText>
          <CustomText variant="h2">{job.service_type}</CustomText>
          <CustomText variant="body" color={COLORS.muted}>{job.location?.address || 'Unknown Address'}</CustomText>
        </View>
        <View style={styles.priceTag}>
           <CustomText variant="h3" color={COLORS.primary}>₱{job.total_price}</CustomText>
           <CustomText variant="caption" style={{textAlign: 'center'}}>{job.payment_method}</CustomText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* BODY: Dynamic Content based on Status */}
      <View style={styles.content}>
        
        {/* PHASE 1: TRAVEL */}
        {status === 'ACCEPTED' && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="car-sport-outline" size={80} color={COLORS.secondary} />
            <CustomText variant="h3" style={{ marginTop: 20 }}>Travel to Client</CustomText>
            
            <TouchableOpacity style={styles.secondaryBtn} onPress={openMaps}>
              <Ionicons name="map" size={20} color={COLORS.primary} />
              <CustomText variant="h3" color={COLORS.primary} style={{ marginLeft: 10 }}>Open Maps</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainBtn} onPress={() => updateStatus('ARRIVED')}>
              <CustomText variant="h3" color={COLORS.white}>I Have Arrived</CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* PHASE 2: ARRIVED */}
        {status === 'ARRIVED' && (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="home-outline" size={80} color={COLORS.success} />
            <CustomText variant="h3" style={{ marginTop: 20, textAlign: 'center' }}>
              You are at the location.{'\n'}Prepare for session.
            </CustomText>
            
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: COLORS.success }]} onPress={() => updateStatus('IN_SESSION')}>
              <CustomText variant="h3" color={COLORS.white}>START TIMER</CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* PHASE 3: IN SESSION (TIMER) */}
        {status === 'IN_SESSION' && (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <CustomText variant="caption">Session in Progress</CustomText>
            <CustomText style={{ fontSize: 60, fontFamily: 'Lato_700Bold', color: COLORS.secondary }}>
              {formatTime(elapsedSeconds)}
            </CustomText>
            
            <View style={{ marginTop: 50, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: COLORS.secondary }]} 
                onPress={() => Alert.alert('Finish?', 'Are you sure the session is done?', [
                  { text: 'Cancel' },
                  { text: 'Yes, Complete', onPress: () => updateStatus('COMPLETED') }
                ])}
              >
                <CustomText variant="h3" color={COLORS.white}>COMPLETE SESSION</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceTag: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center'
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 30 },
  content: { flex: 1, justifyContent: 'center' },
  
  mainBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    padding: 20,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 30,
    ...SHADOWS.medium
  },
  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  }
});