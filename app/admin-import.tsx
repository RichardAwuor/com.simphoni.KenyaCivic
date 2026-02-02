
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { apiPost } from "@/utils/api";

// Polling station data from Port Reitz, Kipevu, Airport, and Changamwe Wards, Changamwe Constituency, Mombasa County
const POLLING_STATION_DATA = [
  // PORT REITZ WARD (0001)
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100113",
    pollingStationName: "BOMU PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100114",
    pollingStationName: "BOMU PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100201",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 620,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100202",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 620,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100203",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 620,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100204",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 620,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100205",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 619,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100206",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 619,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100207",
    pollingStationName: "MWIJABU PRIMARY SCHOOL",
    registeredVoters: 619,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100301",
    pollingStationName: "LILONGWE GARDEN",
    registeredVoters: 617,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100302",
    pollingStationName: "LILONGWE GARDEN",
    registeredVoters: 617,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100303",
    pollingStationName: "LILONGWE GARDEN",
    registeredVoters: 617,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100304",
    pollingStationName: "LILONGWE GARDEN",
    registeredVoters: 617,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000100305",
    pollingStationName: "LILONGWE GARDEN",
    registeredVoters: 617,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000102501",
    pollingStationName: "BOMU STADIUM",
    registeredVoters: 628,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000102601",
    pollingStationName: "BOMU SECONDARY SCHOOL",
    registeredVoters: 283,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0001",
    wardName: "PORT REITZ",
    pollingStationCode: "001001000102701",
    pollingStationName: "FULL GOSPEL CHURCH GROUND",
    registeredVoters: 73,
  },
  // KIPEVU WARD (0002)
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200401",
    pollingStationName: "UMOJA PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200402",
    pollingStationName: "UMOJA PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200403",
    pollingStationName: "UMOJA PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200404",
    pollingStationName: "UMOJA PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200405",
    pollingStationName: "UMOJA PRIMARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200501",
    pollingStationName: "KISUMU NDOGO GROUND",
    registeredVoters: 684,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200502",
    pollingStationName: "KISUMU NDOGO GROUND",
    registeredVoters: 684,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200503",
    pollingStationName: "KISUMU NDOGO GROUND",
    registeredVoters: 684,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200504",
    pollingStationName: "KISUMU NDOGO GROUND",
    registeredVoters: 684,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200505",
    pollingStationName: "KISUMU NDOGO GROUND",
    registeredVoters: 683,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200601",
    pollingStationName: "KWA HOLA PRIMARY SCHOOL",
    registeredVoters: 618,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200602",
    pollingStationName: "KWA HOLA PRIMARY SCHOOL",
    registeredVoters: 618,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200603",
    pollingStationName: "KWA HOLA PRIMARY SCHOOL",
    registeredVoters: 618,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200604",
    pollingStationName: "KWA HOLA PRIMARY SCHOOL",
    registeredVoters: 618,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200605",
    pollingStationName: "KWA HOLA PRIMARY SCHOOL",
    registeredVoters: 618,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200701",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 642,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200702",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 642,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200703",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200704",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200705",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200706",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200707",
    pollingStationName: "CAPE TOWN GROUND",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200801",
    pollingStationName: "KALOLENI GROUND",
    registeredVoters: 478,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200802",
    pollingStationName: "KALOLENI GROUND",
    registeredVoters: 478,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000200803",
    pollingStationName: "KALOLENI GROUND",
    registeredVoters: 478,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0002",
    wardName: "KIPEVU",
    pollingStationCode: "001001000202801",
    pollingStationName: "AKAMBA HANDCRAFT COOP. SOCIETY",
    registeredVoters: 340,
  },
  // AIRPORT WARD (0003)
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000300901",
    pollingStationName: "BOKOLE NURSERY SCHOOL",
    registeredVoters: 621,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000300902",
    pollingStationName: "BOKOLE NURSERY SCHOOL",
    registeredVoters: 621,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000300903",
    pollingStationName: "BOKOLE NURSERY SCHOOL",
    registeredVoters: 621,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000300904",
    pollingStationName: "BOKOLE NURSERY SCHOOL",
    registeredVoters: 621,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000300905",
    pollingStationName: "BOKOLE NURSERY SCHOOL",
    registeredVoters: 621,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000300906",
    pollingStationName: "BOKOLE NURSERY SCHOOL",
    registeredVoters: 621,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301001",
    pollingStationName: "BARAKA VILLAGE",
    registeredVoters: 693,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301002",
    pollingStationName: "BARAKA VILLAGE",
    registeredVoters: 693,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301003",
    pollingStationName: "BARAKA VILLAGE",
    registeredVoters: 693,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301004",
    pollingStationName: "BARAKA VILLAGE",
    registeredVoters: 693,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301005",
    pollingStationName: "BARAKA VILLAGE",
    registeredVoters: 692,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301006",
    pollingStationName: "BARAKA VILLAGE",
    registeredVoters: 692,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301101",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 651,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301102",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 651,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301103",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 651,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301104",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 650,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301105",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 650,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301106",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 650,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301107",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 650,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301108",
    pollingStationName: "AL-IRSHADI NURSERY SCHOOL",
    registeredVoters: 650,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301201",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301202",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301203",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301204",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301205",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301206",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301207",
    pollingStationName: "MWIDANI SOCIAL HALL",
    registeredVoters: 610,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301301",
    pollingStationName: "PORTREITZ NURSERY SCHOOL",
    registeredVoters: 598,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0003",
    wardName: "AIRPORT",
    pollingStationCode: "001001000301302",
    pollingStationName: "PORTREITZ NURSERY SCHOOL",
    registeredVoters: 598,
  },
  // CHANGAMWE WARD (0004) - NEW DATA
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401401",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401402",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401403",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401404",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401405",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401406",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401407",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401408",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401409",
    pollingStationName: "CHANGAMWE SOCIAL HALL",
    registeredVoters: 687,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401501",
    pollingStationName: "CHANGAMWE PRIMARY SCHOOL",
    registeredVoters: 675,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401502",
    pollingStationName: "CHANGAMWE PRIMARY SCHOOL",
    registeredVoters: 675,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401601",
    pollingStationName: "ST. LWANGA PRIMARY SCHOOL",
    registeredVoters: 642,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401602",
    pollingStationName: "ST. LWANGA PRIMARY SCHOOL",
    registeredVoters: 642,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401603",
    pollingStationName: "ST. LWANGA PRIMARY SCHOOL",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401604",
    pollingStationName: "ST. LWANGA PRIMARY SCHOOL",
    registeredVoters: 641,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401701",
    pollingStationName: "CHANGAMWE SECONDARY SCHOOL",
    registeredVoters: 515,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401702",
    pollingStationName: "CHANGAMWE SECONDARY SCHOOL",
    registeredVoters: 514,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401801",
    pollingStationName: "GOME PRIMARY SCHOOL",
    registeredVoters: 605,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401802",
    pollingStationName: "GOME PRIMARY SCHOOL",
    registeredVoters: 604,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401803",
    pollingStationName: "GOME PRIMARY SCHOOL",
    registeredVoters: 604,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401901",
    pollingStationName: "MAGONGO PRIMARY SCHOOL",
    registeredVoters: 532,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401902",
    pollingStationName: "MAGONGO PRIMARY SCHOOL",
    registeredVoters: 531,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401903",
    pollingStationName: "MAGONGO PRIMARY SCHOOL",
    registeredVoters: 531,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000401904",
    pollingStationName: "MAGONGO PRIMARY SCHOOL",
    registeredVoters: 531,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000402001",
    pollingStationName: "BAPTIST CHURCH PRIMARY SCHOOL",
    registeredVoters: 583,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000402002",
    pollingStationName: "BAPTIST CHURCH PRIMARY SCHOOL",
    registeredVoters: 583,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000402003",
    pollingStationName: "BAPTIST CHURCH PRIMARY SCHOOL",
    registeredVoters: 583,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000402004",
    pollingStationName: "BAPTIST CHURCH PRIMARY SCHOOL",
    registeredVoters: 583,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000402901",
    pollingStationName: "BISHOP MKALA ACADEMY",
    registeredVoters: 172,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000403001",
    pollingStationName: "KIMBILIO ACADEMY",
    registeredVoters: 556,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "001",
    constituencyName: "CHANGAMWE",
    wardCode: "0004",
    wardName: "CHANGAMWE",
    pollingStationCode: "001001000403201",
    pollingStationName: "AIC CHURCH HALL",
    registeredVoters: 56,
  },
];

export default function AdminImportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    console.log("Admin Import Alert:", title, message);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleImport = async () => {
    console.log("User tapped Import Polling Stations button");
    setLoading(true);

    try {
      console.log("Importing polling station data:", POLLING_STATION_DATA.length, "stations");
      
      const response = await apiPost("/api/polling-stations/bulk-import", {
        stations: POLLING_STATION_DATA,
      });

      console.log("Import response:", response);

      const successCount = response.summary?.successful || 0;
      const failedCount = response.summary?.failed || 0;
      const totalCount = response.summary?.processed || 0;

      const successMessage = `Successfully imported ${successCount} out of ${totalCount} polling stations.`;
      const failureMessage = failedCount > 0 ? ` ${failedCount} failed.` : "";
      const fullMessage = successMessage + failureMessage;

      showAlert("Import Complete", fullMessage);
    } catch (error: any) {
      console.error("Import error:", error);
      const errorMessage = error?.message || "Failed to import polling stations. Please try again.";
      showAlert("Import Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalStations = POLLING_STATION_DATA.length;
  const uniqueLocations = new Set(POLLING_STATION_DATA.map(s => s.pollingStationName)).size;
  const wards = new Set(POLLING_STATION_DATA.map(s => s.wardName));
  const wardsList = Array.from(wards).join(", ");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log("User tapped back button");
            router.back();
          }}
          style={styles.backButton}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Import</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <IconSymbol
            ios_icon_name="square.and.arrow.down"
            android_material_icon_name="cloud-download"
            size={64}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Polling Station Data Import</Text>
        <Text style={styles.subtitle}>
          Import polling station data for Changamwe Constituency, Mombasa County
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>County:</Text>
            <Text style={styles.infoValue}>MOMBASA (001)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Constituency:</Text>
            <Text style={styles.infoValue}>CHANGAMWE (001)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wards:</Text>
            <Text style={styles.infoValue}>{wardsList}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Stations:</Text>
            <Text style={styles.infoValueBold}>{totalStations}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unique Locations:</Text>
            <Text style={styles.infoValueBold}>{uniqueLocations}</Text>
          </View>
        </View>

        <View style={styles.stationsList}>
          <Text style={styles.stationsListTitle}>Polling Stations to Import:</Text>
          {POLLING_STATION_DATA.map((station, index) => {
            const stationCode = station.pollingStationCode;
            const stationName = station.pollingStationName;
            const voters = station.registeredVoters;
            const wardName = station.wardName;
            
            return (
              <View key={index} style={styles.stationItem}>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{stationName}</Text>
                  <View style={styles.stationMetaRow}>
                    <Text style={styles.stationWard}>{wardName}</Text>
                    <Text style={styles.stationCode}>{stationCode}</Text>
                  </View>
                </View>
                <Text style={styles.stationVoters}>{voters}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.importButton, loading && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="arrow.down.circle.fill"
                android_material_icon_name="cloud-download"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.importButtonText}>Import Polling Stations</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                console.log("User dismissed modal");
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  infoValueBold: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  stationsList: {
    marginBottom: 24,
  },
  stationsListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  stationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  stationMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stationWard: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    backgroundColor: colors.primaryLight || colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stationCode: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stationVoters: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: 12,
  },
  importButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
