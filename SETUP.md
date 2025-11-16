# GreenGrow Setup Guide

Complete step-by-step instructions for setting up your GreenGrow cultivation tracking system.

## Prerequisites

- Google Account
- GitHub Account
- Modern web browser
- Basic familiarity with Google Sheets

## Part 1: Google Sheets Setup

### Step 1: Create Your Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Rename it to "GreenGrow Database" (or your preferred name)

### Step 2: Create Required Sheets

Create 7 sheets (tabs) at the bottom of your spreadsheet:

1. Right-click on "Sheet1" → Rename to **Strains**
2. Click **+** to add new sheets and name them:
   - **Bays**
   - **Trays**
   - **Plants**
   - **Effects**
   - **Terpenes**
   - **UseCases**

### Step 3: Add Headers to Each Sheet

Copy these headers exactly as shown (case-sensitive):

**Strains Sheet (Row 1):**
```
id	name	type	vegDays	flowerDays	thcPercent	cbdPercent	effects	terpenes	useCases	notes
```

**Bays Sheet (Row 1):**
```
id	name	temperature	humidity	location	notes
```

**Trays Sheet (Row 1):**
```
id	name	bayId	strainIds	dateStarted	status	notes
```

**Plants Sheet (Row 1):**
```
id	trayId	bayId	strainId	stage	datePlanted	dateStageChanged	notes
```

**Effects Sheet (Row 1):**
```
name
```

**Terpenes Sheet (Row 1):**
```
name
```

**UseCases Sheet (Row 1):**
```
name
```

### Step 4: (Optional) Add Sample Data

You can add sample effects, terpenes, and use cases:

**Effects Sheet:**
```
name
Uplifted
Energetic
Relaxed
Sleepy
Happy
Creative
Focused
```

**Terpenes Sheet:**
```
name
Myrcene
Limonene
Caryophyllene
Pinene
Linalool
Humulene
```

**UseCases Sheet:**
```
name
Insomnia
Stress
Anxiety
Pain
Depression
```

### Step 5: Get Your Spreadsheet ID

1. Look at the URL of your Google Sheet
2. It looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copy the `SPREADSHEET_ID` part (between `/d/` and `/edit`)
4. Save this somewhere - you'll need it later

## Part 2: Google Cloud API Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it "GreenGrow" (or your choice)
4. Click **Create**

### Step 2: Enable Google Sheets API

1. In the left menu, click **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on **Google Sheets API**
4. Click **Enable**

### Step 3: Create API Key

1. Click **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Your API key is created! Copy it immediately.
4. Click **Restrict Key** to secure it (recommended)

### Step 4: Restrict Your API Key (Important for Security)

1. Under **Application restrictions**, select **HTTP referrers**
2. Click **+ ADD AN ITEM**
3. Add your GitHub Pages URL:
   ```
   https://nyrbrenik-maker.github.io/*
   ```
4. Under **API restrictions**, select **Restrict key**
5. Check **Google Sheets API**
6. Click **Save**

## Part 3: GitHub Pages Deployment

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Select branch: **main** or **claude/build-greengrow-app-01Gg7NCpXGRrSaZ8hdGDmozr**
6. Select folder: **/ (root)**
7. Click **Save**

### Step 2: Wait for Deployment

1. Wait 1-2 minutes for deployment
2. A green box will appear with your site URL:
   ```
   Your site is live at https://nyrbrenik-maker.github.io/Test/
   ```
3. Click the URL to visit your app

## Part 4: Configure GreenGrow

### Step 1: First Login

1. Visit your deployed GreenGrow site
2. You'll see the login screen
3. Select your role:
   - **Admin** - Full access (recommended for setup)
   - **Grower** - Data entry access
   - **Client** - Read-only access
4. Enter your name
5. Click **Access GreenGrow**

### Step 2: Configure Google Sheets Connection

1. You'll automatically be directed to **Settings**
2. Enter your **Google Sheets API Key** (from Part 2, Step 3)
3. Enter your **Spreadsheet ID** (from Part 1, Step 5)
4. Click **Save Configuration**

### Step 3: Test Connection

1. Click **Test Connection** button
2. You should see a success message showing:
   - Your spreadsheet title
   - List of sheets
3. If successful, you're ready to use GreenGrow!

## Part 5: Adding Your First Data

### Add a Bay

1. Click **Bays** in the sidebar
2. Click **+ Add Bay**
3. Fill in:
   - Name: "Bay A1"
   - Location: "North Wing"
   - Temperature: 75
   - Humidity: 60
4. Click **Save**

### Add a Strain

1. Click **Strains** in the sidebar
2. Click **+ Add Strain**
3. Fill in:
   - Name: "Blue Dream"
   - Type: Hybrid
   - Veg Days: 30
   - Flower Days: 60
   - THC %: 20
   - CBD %: 0.5
   - Select some effects and terpenes
4. Click **Save**

### Add a Tray

1. Click **Trays** in the sidebar
2. Click **+ Add Tray**
3. Fill in:
   - Name: "Tray 1A"
   - Bay: Select "Bay A1"
   - Strain: Select "Blue Dream"
   - Date Started: Today's date
   - Status: vegetative
4. Click **Save**

### Add Plants

**Option 1: Single Plant**
1. Click **Plants** in the sidebar
2. Click **+ Add Plant**
3. Fill in details
4. Click **Save**

**Option 2: Bulk Add (Recommended for multiple plants)**
1. Click **Plants** in the sidebar
2. Click **Bulk Add**
3. Fill in:
   - Tray: "Tray 1A"
   - Bay: "Bay A1"
   - Strain: "Blue Dream"
   - Number of Plants: 10
   - ID Prefix: PLT
   - Stage: seedling
4. Click **Save**
5. 10 plants will be created with IDs: PLT-001, PLT-002, etc.

## Part 6: Daily Usage

### Checking Dashboard

1. Click **Dashboard**
2. View:
   - Total plants
   - Active strains
   - Active trays
   - Upcoming harvests
   - Environmental status

### Updating Plant Stages

1. Go to **Plants**
2. Click the eye icon to view a plant
3. Click **Edit**
4. Change the growth stage
5. Save

### Monitoring Environment

1. Go to **Bays**
2. View temperature and humidity
3. Status badges show if values are in range:
   - Green = Good
   - Yellow = Warning
   - Red = Alert

## Troubleshooting

### "Failed to fetch data"

**Problem**: Can't connect to Google Sheets

**Solutions**:
1. Verify API key is correct (check for typos)
2. Verify Spreadsheet ID is correct
3. Make sure Google Sheets API is enabled in Google Cloud Console
4. Check API key restrictions allow your GitHub Pages domain
5. Ensure spreadsheet is not private (share with "Anyone with the link")

### "Sheet not found"

**Problem**: One or more sheets are missing

**Solutions**:
1. Check all sheet names are spelled exactly: Strains, Bays, Trays, Plants, etc.
2. Sheet names are case-sensitive
3. Remove any extra spaces in sheet names

### Changes not saving

**Problem**: Data not appearing in Google Sheets

**Solutions**:
1. Google Sheets API requires **API Key** for reading and **OAuth** for writing
2. For now, updates must be done manually in Google Sheets
3. Future version will include OAuth for write access

### Mobile menu not showing

**Problem**: Can't navigate on mobile

**Solutions**:
1. Tap the hamburger menu icon (☰) in top left
2. Swipe from left edge of screen

## Advanced Configuration

### Changing Sheet Names

If you want different sheet names, edit `js/config.js`:

```javascript
SHEET_NAMES: {
    BAYS: 'YourBaysSheetName',
    TRAYS: 'YourTraysSheetName',
    // ... etc
}
```

### Customizing Colors

Edit `css/styles.css` to change the color scheme:

```css
:root {
    --primary-color: #2d5f3f;  /* Main green color */
    --accent-color: #8fbc8f;   /* Light green */
    /* ... etc */
}
```

### Adding More Effects/Terpenes

1. Go to **Settings**
2. Click **Manage Effects** (or Terpenes/Use Cases)
3. Type new item in the input
4. Click **Add**
5. Click **Save Changes**

Note: These are stored locally. Add them to your Google Sheet to persist.

## Security Best Practices

1. **Never share your API key publicly**
2. Always use API key restrictions
3. Limit API key to Google Sheets API only
4. Use HTTP referrer restrictions
5. Consider separate API keys for different users
6. Regularly review Google Cloud Console audit logs
7. Keep your spreadsheet private or shared only with authorized users

## Backup Recommendations

1. Google Sheets auto-saves, but create manual backups:
   - File → Download → Excel (.xlsx)
   - Save weekly or after major data entry
2. Consider Google Sheets version history:
   - File → Version history → See version history
3. Export plant data periodically

## Next Steps

1. **Import your existing data** from GreenBook.ods to Google Sheets
2. **Set up all your bays** with current environmental readings
3. **Add all your strains** to the database
4. **Create trays** for your current grows
5. **Add all plants** using bulk add feature
6. **Train your team** on using the system
7. **Set up client access** for your outlet

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify Google Sheets API quota (free tier: 100 requests/100 seconds/user)
3. Review this guide step-by-step
4. Check that all sheets have the correct headers

## Migrating from Glide

If you're coming from Glide:

1. Export your Glide data to CSV
2. Import each CSV into the corresponding Google Sheet
3. Ensure column names match the headers above
4. Add the `id` column if it doesn't exist (use GreenGrow to generate IDs)

---

**Congratulations!** Your GreenGrow system is now set up and ready to track your cultivation operation.
