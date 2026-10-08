# Government Officer Dashboard & Burning Statistics

## 1. Government Role Purpose
The Government Officer role serves as a read-only monitoring and decision-support portal. Government users can view operational intelligence across the platform, including stubble availability, marketplace trends, and satellite-detected fire activity. Government users cannot modify users, approve marketplace transactions, or access administrative settings.

## 2. Dashboard Sections
- **Overview:** High-level summary of marketplace activity and stubble availability.
- **Burning Risk:** Predictive risk assessment based on NASA FIRMS data and ML models.
- **Burning Statistics:** Historical and real-time statistics derived from actual satellite observations.
- **Stubble Availability:** Real-time visibility into available farmer listings.
- **Marketplace Monitoring:** Aggregated tracking of active buyers, listings, and reserved stubble.
- **Priority Areas:** Decision-support engine highlighting districts with high stubble volume needing intervention.
- **Reports:** Portal to generate and export data-backed CSV/PDF reports.
- **My Profile:** View official account details and verification status.

## 3. Burning Risk (Model 3)
The Burning Risk portal utilizes the existing Model 3 to predict the "probability of observing stubble-burning activity in a geographic grid cell on a selected date."

## 4. Burning Statistics
The Burning Statistics page focuses on describing *historical observed* satellite-detected fire activity.
- The pipeline processes real NASA FIRMS VIIRS 375 m active fire data (2023 dataset included).
- Displays annual and monthly trends.
- **IMPORTANT**: FIRMS active-fire detections are satellite-derived observations and should be treated as a monitoring proxy rather than a one-to-one count of confirmed stubble-burning incidents.

## 5. Security and RBAC
All backend routes (`/api/government/*`) enforce the `require_verified_government` dependency. 
- 401 Unauthorized for missing tokens.
- 403 Forbidden for FARMER or BUYER roles attempting to access Government routes.

## 6. Limitations
- Current historical fire dataset is restricted to the 2023 season. Year-over-year percentage change features report "N/A / Insufficient historical data" until multi-year datasets are imported.
- "Model Information" has been fully removed from the Government dashboard as per the strict non-administrative requirements.
