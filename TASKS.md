# Spacall Therapist - Task List

## Phase 1: Foundation & UI Upgrade
- [ ] **Dependencies**
    - [ ] Install fonts: `npx expo install expo-font @expo-google-fonts/playfair-display @expo-google-fonts/lato`
    - [ ] Install vector icons: `npm install @expo/vector-icons`
- [ ] **Copy Shared Assets (From Client App)**
    - [ ] Copy `constants/theme.ts`.
    - [ ] Copy `components/ScreenWrapper.tsx`.
    - [ ] Copy `components/CustomText.tsx`.
    - [ ] Copy `lib/supabase.ts`.
- [ ] **Setup App.tsx**
    - [ ] Update to load Fonts before rendering.
    - [ ] Apply `ScreenWrapper` and "Gilded Ivory" colors.

## Phase 2: Database Schema
- [ ] **Run SQL Migration**
    - [ ] Add columns to `bookings`: `started_at`, `ended_at`.
    - [ ] Add columns to `profiles`: `verification_status`.
    - [ ] Create `transactions` table (optional for now, but good for planning).

## Phase 3: The "Shift" Dashboard
- [ ] **Header Component**
    - [ ] Show Therapist Name & Photo.
    - [ ] Show "Today's Earnings" (Mocked or Real).
- [ ] **Online Toggle**
    - [ ] Create a large, beautiful "Go Online" switch/button.
    - [ ] Logic: Only update `is_online` in DB if `verification_status` is 'VERIFIED'.
- [ ] **Job Feed**
    - [ ] Style the Job Card (White card, Gold border, Shadow).
    - [ ] Show "Distance" (Calculate distance between Therapist & Client).

## Phase 4: The Job Lifecycle (Active Mode)
- [ ] **State Manager**
    - [ ] Create a `JobSessionScreen.tsx` that appears when a job is active.
- [ ] **Step 1: Navigation**
    - [ ] Show Map snippet.
    - [ ] "Navigate" button (Links to Waze/Google Maps).
    - [ ] "I've Arrived" button (Updates status to `ARRIVED`).
- [ ] **Step 2: The Session**
    - [ ] Show Client Name & Service Type.
    - [ ] "Start Massage" button (Updates status to `IN_SESSION` + saves timestamp).
    - [ ] **Timer UI:** Big countdown clock (e.g., 60:00).
- [ ] **Step 3: Completion**
    - [ ] "Complete Job" button.
    - [ ] Payment Prompt: "Collect ₱500 Cash" vs "Payment Verified".

## Phase 5: Polish
- [ ] **Sounds/Haptics:** Vibrate when a new job appears.
- [ ] **Empty States:** "No jobs nearby? Try moving to a hotspot."