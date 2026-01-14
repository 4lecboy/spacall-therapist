import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

let locationSubscription: Location.LocationSubscription | null = null;
let updateInterval: NodeJS.Timeout | null = null;

interface LocationServiceConfig {
    bookingId: string;
    updateIntervalSeconds?: number; // How often to update (default 10 seconds)
}

/**
 * Start tracking therapist location and updating it to the database
 * Updates happen at specified intervals during active bookings
 */
export const startLocationTracking = async ({ bookingId, updateIntervalSeconds = 10 }: LocationServiceConfig) => {
    try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Location permission not granted');
        }

        console.log('📍 Starting location tracking for booking:', bookingId);

        // Start watching position with high accuracy
        locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: updateIntervalSeconds * 1000,
                distanceInterval: 10, // Update if moved at least 10 meters
            },
            async (location) => {
                const { latitude, longitude } = location.coords;

                console.log('📍 Location update:', { latitude, longitude });

                // Update location in database
                const { error } = await supabase
                    .from('bookings')
                    .update({
                        therapist_latitude: latitude,
                        therapist_longitude: longitude,
                        therapist_location_updated_at: new Date().toISOString(),
                    })
                    .eq('id', bookingId);

                if (error) {
                    console.error('❌ Failed to update location:', error);
                } else {
                    console.log('✅ Location updated successfully');
                }
            }
        );

        return true;
    } catch (error) {
        console.error('❌ Error starting location tracking:', error);
        return false;
    }
};

/**
 * Stop location tracking
 * Call this when the booking is completed or cancelled
 */
export const stopLocationTracking = async (bookingId?: string) => {
    console.log('🛑 Stopping location tracking');

    // Remove location subscription
    if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
    }

    // Clear any intervals
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    // Optionally clear the location from the database
    if (bookingId) {
        await supabase
            .from('bookings')
            .update({
                therapist_latitude: null,
                therapist_longitude: null,
                therapist_location_updated_at: null,
            })
            .eq('id', bookingId);
    }

    console.log('✅ Location tracking stopped');
};

/**
 * Get current location once without starting tracking
 */
export const getCurrentLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Location permission not granted');
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('❌ Error getting current location:', error);
        return null;
    }
};

/**
 * Check if location services are enabled
 */
export const checkLocationServices = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
};
