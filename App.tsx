import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import * as Location from 'expo-location';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // 1. Fetch "Pending" Bookings
  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'PENDING') // Only show jobs nobody has taken yet
      .order('created_at', { ascending: false });

    if (error) Alert.alert('Error fetching jobs', error.message);
    else setJobs(data || []);
    setLoading(false);
  }

  // 2. Accept a Job
  async function acceptJob(bookingId: string) {
    if (!session?.user) return;

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'ACCEPTED', 
        therapist_id: session.user.id 
      })
      .eq('id', bookingId);

    if (error) {
      Alert.alert('Failed to accept', error.message);
    } else {
      Alert.alert('Success', 'You have accepted the job! Navigate to client.');
      fetchJobs(); // Refresh the list
    }
  }

  // 3. Toggle Online Status (and update GPS)
  async function toggleOnline(value: boolean) {
    setIsOnline(value);
    if (value && session) {
      // Get location to show "Therapist is here" on the map later
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        
        await supabase.from('profiles').update({
          is_online: true,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        }).eq('id', session.user.id);
      }
    }
  }

  // --- RENDER ---

  if (!session) return <Auth />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Therapist Dashboard</Text>
        <View style={styles.switchRow}>
          <Text style={{ marginRight: 10 }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
          <Switch value={isOnline} onValueChange={toggleOnline} />
        </View>
      </View>

      {/* Job Feed */}
      <View style={styles.feed}>
        <View style={styles.feedHeader}>
          <Text style={styles.subTitle}>Available Jobs</Text>
          <TouchableOpacity onPress={fetchJobs}>
            <Text style={{ color: 'blue' }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.serviceName}>{item.service_type}</Text>
                <Text>Price: ₱{item.total_price}</Text>
                <Text style={styles.address}>Loc: {item.location?.address || 'Unknown'}</Text>
                
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => acceptJob(item.id)}
                >
                  <Text style={styles.acceptText}>ACCEPT JOB</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No jobs available.</Text>}
          />
        )}
      </View>
      
      {/* Logout */}
      <TouchableOpacity style={styles.logout} onPress={() => supabase.auth.signOut()}>
         <Text style={{color: 'red'}}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  header: { padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  
  feed: { flex: 1, padding: 20 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: '600' },
  
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  serviceName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  address: { color: '#555', marginVertical: 5 },
  acceptButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  acceptText: { color: 'white', fontWeight: 'bold' },

  logout: { alignItems: 'center', padding: 20 }
});