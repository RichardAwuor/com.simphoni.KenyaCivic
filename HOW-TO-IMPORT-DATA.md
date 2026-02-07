
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
1. Open one of the batch files (e.g., `registration-data-batch-4.json`)
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

### Batch 3 (registration-data-batch-3.json)
Contains comprehensive data for:

1. **MANDERA County** (5 wards - continuation)
   - MANDERA SOUTH constituency: 2 wards (SHIMBIR FATUMA, WARGADUD)
   - MANDERA WEST constituency: 5 wards (DANDU, GITHER, LAGSURE, TAKABA, TAKABA SOUTH)

2. **MARSABIT County** (20 wards)
   - LAISAMIS constituency: 5 wards (KARGI/SOUTH HORR, KORR/NGURUNIT, LAISAMIS, LOGO LOGO, LOIYANGALANI)
   - MOYALE constituency: 7 wards (BUTIYE, GOLBO, HEILLU/MANYATTA, MOYALE TOWNSHIP, OBBU, SOLOLO, URAN)
   - NORTH HORR constituency: 5 wards (DUKANA, ILLERET, MAIKONA, NORTH HORR, TURBI)
   - SAKU constituency: 3 wards (KARARE, MARSABIT CENTRAL, SAGANTE/JALDESA)

3. **MERU County** (41 wards)
   - BUURI constituency: 5 wards
   - CENTRAL IMENTI constituency: 4 wards
   - IGEMBE CENTRAL constituency: 5 wards
   - IGEMBE NORTH constituency: 5 wards
   - IGEMBE SOUTH constituency: 5 wards
   - NORTH IMENTI constituency: 5 wards
   - SOUTH IMENTI constituency: 6 wards
   - TIGANIA EAST constituency: 5 wards
   - TIGANIA WEST constituency: 5 wards

4. **MIGORI County** (35 wards)
   - AWENDO constituency: 4 wards
   - KURIA EAST constituency: 5 wards
   - KURIA WEST constituency: 7 wards
   - NYATIKE constituency: 7 wards
   - RONGO constituency: 4 wards
   - SUNA EAST constituency: 4 wards
   - SUNA WEST constituency: 4 wards
   - URIRI constituency: 5 wards

5. **MOMBASA County** (24 wards - COMPLETE)
   - CHANGAMWE constituency: 5 wards (AIRPORT, CHAANI, CHANGAMWE, KIPEVU, PORT REITZ)
   - JOMVU constituency: 3 wards (JOMVU KUU, MIKINDANI, MIRITINI)
   - KISAUNI constituency: 7 wards (BAMBURI, JUNDA, MAGOGONI, MJAMBERE, MTOPANGA, MWAKIRUNGE, SHANZU)
   - LIKONI constituency: 5 wards (BOFU, LIKONI, MTONGWE, SHIKA ADABU, TIMBWANI)
   - MVITA constituency: 4 wards (MJI WA KALE/MAKADARA, SHIMANZI/GANJONI, TONONOKA, TUDOR)
   - NYALI constituency: 4 wards (FRERE TOWN, KONGOWEA, MKOMANI, ZIWA LA NG'OMBE)

6. **MURANG'A County** (28 wards)
   - GATANGA constituency: 4 wards (GATANGA, ITHANGA, KIHUMBU-INI, MUGUMO-INI)
   - KANDARA constituency: 5 wards (GAICHANJIRU, ITHIRU, KAGUNDU-INI, MURUKA, RUCHU)
   - KANGEMA constituency: 3 wards (KANYENYA-INI, MUGURU, RWATHIA)
   - KIGUMO constituency: 4 wards (KAHUMBU, KANGARI, KINYONA, MUTHITHI)
   - KIHARU constituency: 5 wards (GATURI, MUGOIRI, MURARANDIA, TOWNSHIP, WANGU)
   - MARAGWA constituency: 5 wards (ICHAGAKI, KAMBITI, KIMORORI/WEMPA, MAKUYU, NGINDA)
   - MATHIOYA constituency: 2 wards (GITUGI, KAMACHARIA)

7. **NAIROBI CITY County** (85 wards - COMPLETE)
   - DAGORETTI NORTH constituency: 5 wards (GATINA, KABIRO, KAWANGWARE, KILELESHWA, KILIMANI)
   - DAGORETTI SOUTH constituency: 4 wards (MUTU-INI, RIRUTA, UTHIRU/RUTHIMITU, WAITHAKA)
   - EMBAKASI CENTRAL constituency: 3 wards (KAYOLE SOUTH, KOMAROCK, MATOPENI/SPRING VALLEY)
   - EMBAKASI EAST constituency: 4 wards (EMBAKASI, LOWER SAVANNAH, UPPER SAVANNAH, UTAWALA)
   - EMBAKASI NORTH constituency: 4 wards (DANDORA AREA I, II, III, KARIOBANGI NORTH)
   - EMBAKASI SOUTH constituency: 4 wards (IMARA DAIMA, KWA NJENGA, KWA REUBEN, KWARE)
   - EMBAKASI WEST constituency: 4 wards (KARIOBANGI SOUTH, MOWLEM, UMOJA I, UMOJA II)
   - KAMUKUNJI constituency: 4 wards (AIRBASE, EASTLEIGH NORTH, EASTLEIGH SOUTH, PUMWANI)
   - KASARANI constituency: 3 wards (KASARANI, MWIKI, RUAI)
   - KIBRA constituency: 4 wards (LAINI SABA, MAKINA, SARANGOMBE, WOODLEY/KENYATTA GOLF COU)
   - LANGATA constituency: 3 wards (MUGUMU-INI, NYAYO HIGHRISE, SOUTH C)
   - MAKADARA constituency: 2 wards (HARAMBEE, MARINGO/HAMZA)
   - MATHARE constituency: 4 wards (HOSPITAL, HURUMA, KIAMAIKO, MABATINI)
   - ROYSAMBU constituency: 5 wards (GITHURAI, KAHAWA, KAHAWA WEST, ROYSAMBU, ZIMMERMAN)
   - RUARAKA constituency: 3 wards (LUCKY SUMMER, MATHARE NORTH, UTALII)
   - STAREHE constituency: 4 wards (LANDIMAWE, NAIROBI SOUTH, PANGANI, ZIWANI/KARIOKOR)
   - WESTLANDS constituency: 1 ward (KANGEMI)

**Total: 238 ward records across 7 counties**

### Batch 4 (registration-data-batch-4.json) - NEW!
Contains comprehensive data for:

1. **SAMBURU County** (9 wards - COMPLETE)
   - SAMBURU EAST constituency: 1 ward (WASO)
   - SAMBURU NORTH constituency: 4 wards (EL-BARTA, NACHOLA, NDOTO, NYIRO)
   - SAMBURU WEST constituency: 4 wards (LOOSUK, MARALAL, PORO, SUGUTA MARMAR)

2. **SIAYA County** (33 wards - COMPLETE)
   - ALEGO USONGA constituency: 5 wards (CENTRAL ALEGO, NORTH ALEGO, SOUTH EAST ALEGO, USONGA, WEST ALEGO)
   - BONDO constituency: 5 wards (CENTRAL SAKWA, SOUTH SAKWA, WEST SAKWA, WEST YIMBO, YIMBO EAST)
   - GEM constituency: 5 wards (CENTRAL GEM, EAST GEM, SOUTH GEM, WEST GEM, YALA TOWNSHIP)
   - RARIEDA constituency: 4 wards (EAST ASEMBO, NORTH UYOMA, SOUTH UYOMA, WEST UYOMA)
   - UGENYA constituency: 3 wards (EAST UGENYA, NORTH UGENYA, UKWALA)
   - UGUNJA constituency: 2 wards (SIGOMERE, UGUNJA)

3. **TAITA TAVETA County** (17 wards - COMPLETE)
   - MWATATE constituency: 4 wards (BURA, CHAWIA, RONG'E, WUSI/KISHAMBA)
   - TAVETA constituency: 4 wards (BOMANI, CHALA, MAHOO, MATA)
   - VOI constituency: 5 wards (KALOLENI, KASIGAU, MARUNGU, MBOLOLO, NGOLIA)
   - WUNDANYI constituency: 4 wards (MWANDA/MGANGE, WERUGHA, WUMINGU/KISHUSHE, WUNDANYI/MBALE)

4. **TANA RIVER County** (15 wards - COMPLETE)
   - BURA constituency: 5 wards (BANGALE, CHEWELE, HIRIMANI, MADOGO, SALA)
   - GALOLE constituency: 4 wards (CHEWANI, KINAKOMBA, MIKINDUNI, WAYU)
   - GARSEN constituency: 6 wards (GARSEN CENTRAL, GARSEN NORTH, GARSEN SOUTH, GARSEN WEST, KIPINI EAST, KIPINI WEST)

5. **THARAKA-NITHI County** (15 wards - COMPLETE)
   - CHUKA/IGAMBANG'OMBE constituency: 5 wards (IGAMBANG'OMBE, KARINGANI, MAGUMONI, MARIANI, MUGWE)
   - MAARA constituency: 5 wards (CHOGORIA, MAARA, MITHERU, MUTHAMBI, MWIMBI)
   - THARAKA constituency: 5 wards (CHIAKARIGA, GATUNGA, MARIMANTI, MUKOTHIMA, NKONDI)

6. **TRANS NZOIA County** (25 wards - COMPLETE)
   - CHERANGANY constituency: 7 wards (CHEPSIRO/KIPTOROR, CHERANGANY/SUWERWA, KAPLAMAI, MAKUTANO, MOTOSIET, SINYERERE, SITATUNGA)
   - ENDEBESS constituency: 3 wards (CHEPCHOINA, ENDEBESS, MATUMBEI)
   - KIMININI constituency: 6 wards (HOSPITAL, KIMININI, NABISWA, SIKHENDU, SIRENDE, WAITALUK)
   - KWANZA constituency: 4 wards (BIDII, KAPOMBOI, KEIYO, KWANZA)
   - SABOTI constituency: 5 wards (KINYORO, MACHEWA, MATISI, SABOTI, TUWANI)

7. **TURKANA County** (11 wards - PARTIAL)
   - LOIMA constituency: 4 wards (KOTARUK/LOBEI, LOIMA, LOKIRIAMA/LORENGIPPI, TURKWEL)
   - TURKANA CENTRAL constituency: 5 wards (KALOKOL, KANAMKEMER, KANG'ATOTHA, KERIO DELTA, LODWAR TOWNSHIP)
   - TURKANA EAST constituency: 1 ward (KAPEDO/NAPEITOM)

**Total: 125 ward records across 7 counties**

This batch includes complete coverage for SAMBURU, SIAYA, TAITA TAVETA, TANA RIVER, THARAKA-NITHI, and TRANS NZOIA counties, plus partial data for TURKANA county.

## Importing Multiple Batches

You can import data in batches:
1. Import batch 1 first
2. Then import batch 2
3. Then import batch 3
4. Then import batch 4
5. The system will handle duplicates and merge the data

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

**Note:** Import all four batches to have comprehensive coverage of the electoral locations. Each batch can be imported independently, and the system will handle any duplicates automatically.
