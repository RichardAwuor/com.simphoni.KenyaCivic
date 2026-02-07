
# How to Import Registration Data into CIVIC App

This guide explains how to import the County/Constituency/Ward data into the CIVIC electoral app.

## ⚡ Quick Import (Recommended - Easiest Method)

### Step 1: Access the Admin Import Screen
1. Open the CIVIC app
2. From the Registration screen, if you see "No constituencies available" or "No wards available", tap the "Go to Import" button
3. Alternatively, navigate directly to the Admin Import screen from the app menu

### Step 2: Use Quick Import
1. On the Admin Import screen, you'll see three tabs: "Quick Import", "OneDrive", and "JSON Data"
2. The "Quick Import" tab should be selected by default
3. You'll see a list of all 24 counties that will be imported (480+ location records)
4. Simply tap the **"Import All Data Now"** button
5. Wait about 30 seconds for the import to complete
6. You'll see a success message when done!

**That's it!** All Counties, Constituencies, and Wards are now available for agent registration.

---

## Alternative Methods

### Method 1: Using the JSON Import Feature

#### Step 1: Access the Admin Import Screen
1. Open the CIVIC app
2. From the Registration screen, if you see "No constituencies available" or "No wards available", tap the "Go to Import" button
3. Alternatively, navigate directly to the Admin Import screen from the app menu

#### Step 2: Switch to JSON Import Tab
1. On the Admin Import screen, you'll see three tabs: "Quick Import", "OneDrive", and "JSON Data"
2. Tap on the "JSON Data" tab

#### Step 3: Load the Data
You have two options:

**Option A: Use the Sample Data Button**
1. Tap the "Load Sample" button to see the format
2. Replace the sample data with your actual data from the batch files

**Option B: Copy and Paste**
1. Open one of the batch files (e.g., `registration-data-batch-4.json`)
2. Copy all the JSON content
3. Paste it into the JSON Data text area in the app

#### Step 4: Import
1. Review the data to ensure it's correct
2. Tap the "Import JSON Data" button
3. Wait for the import to complete
4. You'll see a success message showing how many records were imported

---

## Data Format

Each record in the JSON file must have these fields:

### Required Fields:
- `countyCode`: 3-digit county code (e.g., "016" for MACHAKOS)
- `countyName`: Full county name (e.g., "MACHAKOS")
- `constituencyCode`: 3-digit constituency code (e.g., "001")
- `constituencyName`: Full constituency name (e.g., "KANGUNDO")
- `wardCode`: 4-digit ward code (e.g., "0001")
- `wardName`: Full ward name (e.g., "KANGUNDO CENTRAL")

### Optional Fields (auto-generated if missing):
- `pollingStationCode`: Will be auto-generated as countyCode + constituencyCode + wardCode + "001"
- `pollingStationName`: Will be auto-generated as "WardName - Default Station"
- `registeredVoters`: Defaults to 0 if not provided

## Example Record

```json
{
  "countyCode": "016",
  "countyName": "MACHAKOS",
  "constituencyCode": "001",
  "constituencyName": "KANGUNDO",
  "wardCode": "0001",
  "wardName": "KANGUNDO CENTRAL"
}
```

---

## Available Data Batches

The Quick Import feature automatically imports all of the following batches:

### Batch 2 (registration-data-batch-2.json)
Contains data for:
- **ELGEYO/MARAKWET County** (1 ward)
- **EMBU County** (21 wards)
- **GARISSA County** (30 wards)
- **HOMA BAY County** (40 wards)
- **ISIOLO County** (10 wards)
- **KAJIADO County** (15 wards)

**Total: 117 ward records across 6 counties**

### Batch 3 (registration-data-batch-3.json)
Contains comprehensive data for:

1. **MANDERA County** (5 wards - continuation)
2. **MARSABIT County** (20 wards)
3. **MERU County** (41 wards)
4. **MIGORI County** (35 wards)
5. **MOMBASA County** (24 wards - COMPLETE)
6. **MURANG'A County** (28 wards)
7. **NAIROBI CITY County** (85 wards - COMPLETE)

**Total: 238 ward records across 7 counties**

### Batch 4 (registration-data-batch-4.json)
Contains comprehensive data for:

1. **SAMBURU County** (9 wards - COMPLETE)
2. **SIAYA County** (33 wards - COMPLETE)
3. **TAITA TAVETA County** (17 wards - COMPLETE)
4. **TANA RIVER County** (15 wards - COMPLETE)
5. **THARAKA-NITHI County** (15 wards - COMPLETE)
6. **TRANS NZOIA County** (25 wards - COMPLETE)
7. **TURKANA County** (30 wards - COMPLETE)
8. **UASIN GISHU County** (30 wards - COMPLETE)
9. **VIHIGA County** (25 wards - COMPLETE)
10. **WAJIR County** (28 wards - COMPLETE)
11. **WEST POKOT County** (20 wards - COMPLETE)

**Total: 247 ward records across 11 counties**

---

## Complete County Coverage

After importing all batches, agents can register from the following **24 counties**:

1. ELGEYO/MARAKWET
2. EMBU
3. GARISSA
4. HOMA BAY
5. ISIOLO
6. KAJIADO
7. MANDERA
8. MARSABIT
9. MERU
10. MIGORI
11. MOMBASA
12. MURANG'A
13. NAIROBI CITY
14. SAMBURU
15. SIAYA
16. TAITA TAVETA
17. TANA RIVER
18. THARAKA-NITHI
19. TRANS NZOIA
20. TURKANA
21. UASIN GISHU
22. VIHIGA
23. WAJIR
24. WEST POKOT

**Total: 480+ location records (Counties, Constituencies, and Wards)**

---

## After Import

Once the data is imported:
1. Agents can now register and select these counties, constituencies, and wards
2. The registration form will show the proper hierarchical selection (County → Constituency → Ward)
3. Agent codes will be generated based on the selected location

---

## Troubleshooting

### "Invalid JSON" Error (Manual JSON Import)
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

### Quick Import Not Working
- Check your internet connection
- Make sure the backend server is running
- Try the manual JSON import method instead

---

## Need Help?

If you encounter any issues during import:
1. Check the error message displayed in the app
2. Verify your JSON format matches the example above (if using manual import)
3. Ensure all required fields are present
4. Try the Quick Import feature first - it's the easiest method!

---

**Note:** The Quick Import feature automatically imports all three batch files (Batch 2, 3, and 4) with a single tap, providing comprehensive coverage of 24 counties and 480+ location records.
