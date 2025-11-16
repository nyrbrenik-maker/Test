# GreenGrow - Cannabis Cultivation Tracking System

A professional, mobile-responsive web application for tracking cannabis cultivation operations. Built with vanilla JavaScript and Google Sheets as a backend database.

![GreenGrow](https://img.shields.io/badge/Version-1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

### 📊 Dashboard
- Real-time overview of active grows
- Upcoming harvest predictions
- Environmental monitoring
- Key metrics at a glance

### 🌿 Strain Management
- Comprehensive strain database
- Track THC/CBD percentages
- Effects, terpenes, and medical use cases
- Vegetative and flowering timelines

### 🏭 Bay/Location Tracking
- Temperature and humidity monitoring
- Environmental status alerts
- Multiple growing locations

### 📦 Tray Management
- Assign strains to trays
- Mixed-strain tray support
- Track growth stages
- Date-based progress tracking

### 🌱 Plant Tracking
- Individual plant IDs (400+ plants)
- Growth stage monitoring
- Bulk plant operations
- Advanced filtering

### 👥 User Roles
- **Admin**: Full access to all features
- **Grower**: Data entry and cultivation management
- **Client**: Read-only access to upcoming strains

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Sheets API
- **Deployment**: GitHub Pages
- **Icons**: Font Awesome 6.4.0

## Quick Start

### 1. Set Up Google Sheets

1. Create a new Google Spreadsheet
2. Create the following sheets (tabs):
   - `Bays`
   - `Trays`
   - `Plants`
   - `Strains`
   - `Effects`
   - `Terpenes`
   - `UseCases`

3. Add headers to each sheet:

**Strains Sheet:**
```
id | name | type | vegDays | flowerDays | thcPercent | cbdPercent | effects | terpenes | useCases | notes
```

**Bays Sheet:**
```
id | name | temperature | humidity | location | notes
```

**Trays Sheet:**
```
id | name | bayId | strainIds | dateStarted | status | notes
```

**Plants Sheet:**
```
id | trayId | bayId | strainId | stage | datePlanted | dateStageChanged | notes
```

**Effects, Terpenes, UseCases Sheets:**
```
name
```

### 2. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Sheets API**
4. Create credentials → API Key
5. Restrict the API key (recommended):
   - Application restrictions: HTTP referrers
   - Add your GitHub Pages URL: `https://YOUR-USERNAME.github.io/*`
   - API restrictions: Google Sheets API only

### 3. Deploy to GitHub Pages

1. This repository is already set up
2. Go to Settings → Pages
3. Source: Deploy from branch
4. Select `main` branch
5. Save and wait for deployment

### 4. Configure the Application

1. Visit your deployed app
2. Select your role and enter your name
3. Navigate to Settings
4. Enter your Google Sheets API Key and Spreadsheet ID
5. Click "Save Configuration"
6. Click "Test Connection" to verify

**Finding your Spreadsheet ID:**
Your Google Sheets URL looks like this:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

## Usage Guide

### Adding Your First Strain

1. Navigate to **Strains** page
2. Click **Add Strain**
3. Fill in strain details
4. Click **Save**

### Setting Up a Bay

1. Navigate to **Bays** page
2. Click **Add Bay**
3. Enter bay name and environmental data
4. Temperature range: 60-90°F
5. Humidity range: 30-80%

### Creating a Tray

1. Navigate to **Trays** page
2. Click **Add Tray**
3. Select bay location
4. Select strain(s)
5. Set date started

### Adding Plants

**Single Plant:**
1. Navigate to **Plants** page
2. Click **Add Plant**
3. Fill in details

**Bulk Add:**
1. Click **Bulk Add**
2. Select tray, bay, and strain
3. Enter number of plants
4. Plants auto-numbered

## Troubleshooting

### "Failed to fetch data" Error
- Check API key is correct
- Verify spreadsheet ID
- Ensure API key allows your domain
- Check sheet names match exactly

### Data Not Updating
- Click **Refresh** button
- Clear browser cache
- Check Google Sheets permissions

## Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## License

MIT License

---

**Disclaimer**: This software is intended for legal cannabis cultivation operations only. Users are responsible for compliance with local laws and regulations.
