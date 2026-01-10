# Spacall Therapist App - Implementation Plan

## 🎯 Objective
Upgrade the Therapist App from a raw prototype to a professional tool using the "Gilded Ivory" design system. Implement the full "Job Lifecycle" (Arrived -> Timer -> Complete) to ensure service quality and safety.

## 🎨 Design System ("Gilded Ivory")
We will mirror the Client App's aesthetic to maintain brand consistency.
* **Background:** Warm Cream (`#FAFAF9`)
* **Primary:** Metallic Gold (`#C5A059`) for key actions (Accept, Start Timer).
* **Text:** Deep Charcoal (`#2B2A29`) with **Playfair Display** headings.
* **Status Colors:**
    * *Green:* Active/Online
    * *Red:* Offline/Busy
    * *Blue:* Navigation

## 🏗️ Architecture & Flow

### 1. The "Shift" Logic (Home Screen)
* **Offline State:** Large "GO ONLINE" button. No location tracking.
* **Online State:** "Scanning for jobs..." animation. Tracking GPS in background (throttled).
* **Job Alert:** When a `PENDING` booking appears within range, a card pops up.

### 2. The Job State Machine (The Core Loop)
We need to expand the simple "Accept" logic into distinct phases:
1.  **ACCEPTED:** Job is locked. Show "Navigate" button.
2.  **ARRIVED:** Therapist is at the door. Notify Client.
3.  **IN_SESSION:** Massage has started. Show **Countdown Timer**.
4.  **COMPLETED:** Payment collected. Update Wallet.

### 3. Data Structure Updates
* **Bookings Table:** Needs `started_at` and `ended_at` timestamps to calculate actual duration.
* **Profiles Table:** Needs `verification_status` (Pending/Verified) to prevent unvetted therapists from going online.

---

## 🔄 User Stories

### Story A: Starting the Day
> "As a therapist, I want to toggle 'Online' so I can start receiving bookings. I want to see my total earnings for the day at the top."

### Story B: Performing the Service
> "As a therapist, I want to signal when I have arrived so the client opens the gate. I want a timer on my screen so I ensure I give the full 60 minutes."

### Story C: Getting Paid
> "As a therapist, I want to see clearly if the client is paying Cash or GCash so I know if I need to ask for money."