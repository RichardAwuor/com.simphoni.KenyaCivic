
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
2. Replace the sample data with your actual data from the batch files

**Option B: Copy and Paste**
1. Open one of the batch files (e.g., `registration-data-batch-3.json`)
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
- `countyCode`: 3-digit county code (e.g., "016" for MACHAKOS)
- `countyName`: Full county name (e.g., "MACHAKOS")
- `constituencyCode`: 3-digit constituency code (e.g., "001")
- `constituencyName`: Full constituency name (e.g., "KANGUNDO")
- `wardCode`: 3-digit ward code (e.g., "001")
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
  "wardCode": "001",
  "wardName": "KANGUNDO CENTRAL"
}
```

## Available Data Batches

### Batch 1 (registration-data-batch-1.json)
Contains data for MOMBASA, BUNGOMA, BUSIA, and DIASPORA counties.

### Batch 2 (registration-data-batch-2.json)
Contains data for:
- **ELGEYO/MARAKWET County** (1 ward)
- **EMBU County** (21 wards)
- **GARISSA County** (30 wards)
- **HOMA BAY County** (40 wards)
- **ISIOLO County** (10 wards)
- **KAJIADO County** (15 wards)

**Total: 117 ward records across 6 counties**

### Batch 3 (registration-data-batch-3.json) - NEW!
Contains data for:

1. **KWALE County** (8 wards)
   - MATUGA constituency: 4 wards (MKONGANI, TIWI, TSIMBA GOLINI, WAA)
   - MSAMBWENI constituency: 4 wards (GOMBATO BONGWE, KINONDO, RAMISI, UKUNDA)

2. **LAIKIPIA County** (11 wards)
   - LAIKIPIA EAST constituency: 3 wards (THINGITHU, TIGITHI, UMANDE)
   - LAIKIPIA NORTH constituency: 3 wards (MUGOGODO EAST, MUGOGODO WEST, SOSIAN)
   - LAIKIPIA WEST constituency: 5 wards (GITHIGA, IGWAMITI, MARMANET, RUMURUTI TOWNSHIP, SALAMA)

3. **LAMU County** (7 wards)
   - LAMU EAST constituency: 3 wards (BASUBA, FAZA, KIUNGA)
   - LAMU WEST constituency: 4 wards (BAHARI, MKOMANI, MKUNUMBI, SHELLA)

4. **MACHAKOS County** (40 wards)
   - KANGUNDO constituency: 4 wards
   - KATHIANI constituency: 4 wards
   - MACHAKOS TOWN constituency: 7 wards
   - MASINGA constituency: 5 wards
   - MATUNGULU constituency: 5 wards
   - MAVOKO constituency: 4 wards
   - MWALA constituency: 6 wards
   - YATTA constituency: 5 wards

5. **MAKUENI County** (30 wards)
   - KAITI constituency: 4 wards
   - KIBWEZI EAST constituency: 4 wards
   - KIBWEZI WEST constituency: 6 wards
   - KILOME constituency: 3 wards
   - MAKUENI constituency: 7 wards
   - MBOONI constituency: 6 wards

6. **MANDERA County** (23 wards)
   - BANISSA constituency: 5 wards
   - LAFEY constituency: 5 wards
   - MANDERA EAST constituency: 5 wards
   - MANDERA NORTH constituency: 5 wards
   - MANDERA SOUTH constituency: 3 wards

**Total: 119 ward records across 6 counties**

## Importing Multiple Batches

You can import data in batches:
1. Import batch 1 first
2. Then import batch 2
3. Then import batch 3
4. The system will handle duplicates and merge the data

Or you can combine all batches into a single JSON array and import at once.

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

**Note:** Import all three batches to have complete coverage of the electoral locations. Each batch can be imported independently, and the system will handle any duplicates automatically.
