
# How to Import Registration Data into CIVIC App

This guide explains how to import the County/Constituency/Ward data into the CIVIC electoral app.

## Method 1: Using the JSON Import Feature (Recommended)

### Step 1: Access the Admin Import Screen
1. Open the CIVIC app
2. From the Registration screen, if you see "No constituencies available" or "No wards available", tap the "Go to Import" button
3. Alternatively, navigate directly to the Admin Import screen from the app menu

### Step 2: Switch to JSON Import Tab
1. On the Admin Import screen, you'll see two tabs: "OneDrive" and "JSON Data"
2. Tap on the "JSON Data" tab

### Step 3: Load the Data
You have two options:

**Option A: Use the Sample Data Button**
1. Tap the "Load Sample" button to see the format
2. Replace the sample data with your actual data from `registration-data-batch-2.json`

**Option B: Copy and Paste**
1. Open the `registration-data-batch-2.json` file
2. Copy all the JSON content
3. Paste it into the JSON Data text area in the app

### Step 4: Import
1. Review the data to ensure it's correct
2. Tap the "Import JSON Data" button
3. Wait for the import to complete
4. You'll see a success message showing how many records were imported

## Data Format

Each record in the JSON file must have these fields:

### Required Fields:
- `countyCode`: 3-digit county code (e.g., "014" for EMBU)
- `countyName`: Full county name (e.g., "EMBU")
- `constituencyCode`: 3-digit constituency code (e.g., "001")
- `constituencyName`: Full constituency name (e.g., "RUNYENJES")
- `wardCode`: 3-digit ward code (e.g., "001")
- `wardName`: Full ward name (e.g., "CENTRAL WARD")

### Optional Fields (auto-generated if missing):
- `pollingStationCode`: Will be auto-generated as countyCode + constituencyCode + wardCode + "001"
- `pollingStationName`: Will be auto-generated as "WardName - Default Station"
- `registeredVoters`: Defaults to 0 if not provided

## Example Record

```json
{
  "countyCode": "014",
  "countyName": "EMBU",
  "constituencyCode": "001",
  "constituencyName": "RUNYENJES",
  "wardCode": "001",
  "wardName": "CENTRAL WARD"
}
```

## What This Data Includes

The `registration-data-batch-2.json` file contains registration data for:

1. **ELGEYO/MARAKWET County** (1 ward)
   - MARAKWET WEST constituency: SENGWER ward

2. **EMBU County** (21 wards)
   - MANYATTA constituency: 6 wards
   - MBEERE NORTH constituency: 3 wards
   - MBEERE SOUTH constituency: 5 wards
   - RUNYENJES constituency: 6 wards

3. **GARISSA County** (30 wards)
   - BALAMBALA constituency: 5 wards
   - DADAAB constituency: 6 wards
   - FAFI constituency: 5 wards
   - GARISSA TOWNSHIP constituency: 4 wards
   - IJARA constituency: 4 wards
   - LAGDERA constituency: 6 wards

4. **HOMA BAY County** (40 wards)
   - HOMA BAY TOWN constituency: 4 wards
   - KABONDO KASIPUL constituency: 4 wards
   - KARACHUONYO constituency: 7 wards
   - KASIPUL constituency: 5 wards
   - NDHIWA constituency: 7 wards
   - RANGWE constituency: 4 wards
   - SUBA NORTH constituency: 5 wards
   - SUBA SOUTH constituency: 4 wards

5. **ISIOLO County** (10 wards)
   - ISIOLO NORTH constituency: 7 wards
   - ISIOLO SOUTH constituency: 3 wards

6. **KAJIADO County** (15 wards)
   - KAJIADO CENTRAL constituency: 5 wards
   - KAJIADO EAST constituency: 5 wards
   - KAJIADO NORTH constituency: 5 wards

**Total: 117 ward records across 6 counties**

## After Import

Once the data is imported:
1. Agents can now register and select these counties, constituencies, and wards
2. The registration form will show the proper hierarchical selection (County → Constituency → Ward)
3. Agent codes will be generated based on the selected location

## Troubleshooting

### "Invalid JSON" Error
- Make sure you copied the entire JSON content
- Check that all brackets `[]` and braces `{}` are properly closed
- Ensure there are no trailing commas

### "No Data Available" Error
- Verify that the JSON is an array (starts with `[` and ends with `]`)
- Check that each record has all required fields

### Import Partially Successful
- Check the error message for details on which records failed
- Common issues: duplicate codes, missing required fields
- Fix the problematic records and re-import

## Need Help?

If you encounter any issues during import:
1. Check the error message displayed in the app
2. Verify your JSON format matches the example above
3. Ensure all required fields are present
4. Try importing a smaller batch first to test

---

**Note:** This is batch 2 of the registration data. Make sure you've also imported batch 1 (BUNGOMA, BUSIA, DIASPORA counties) if you haven't already.
