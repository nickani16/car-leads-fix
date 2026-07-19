import type { MarketplaceCategorySlug } from './marketplace'
import { translatePublic, type PublicLocale } from './public-i18n'

export type EquipmentGroupKey =
  | 'comfort'
  | 'technology_media'
  | 'safety'
  | 'parking_cameras'
  | 'exterior'
  | 'interior'
  | 'drivetrain'
  | 'electric_hybrid'
  | 'van_load'
  | 'recreation'
  | 'motorcycle'
  | 'machinery'

export type EquipmentOption = {
  key: string
  sv: string
  en: string
  de: string
}

export type EquipmentGroup = {
  key: EquipmentGroupKey
  sv: string
  en: string
  de: string
  categories: MarketplaceCategorySlug[]
  options: EquipmentOption[]
}

const allVehicleCategories: MarketplaceCategorySlug[] = [
  'cars',
  'vans',
  'motorcycles',
  'motorhomes',
  'caravans',
  'trucks',
  'agriculture',
  'construction',
  'electric-bikes',
]

const roadVehicleCategories: MarketplaceCategorySlug[] = [
  'cars',
  'vans',
  'motorhomes',
  'trucks',
]

const carLikeCategories: MarketplaceCategorySlug[] = ['cars', 'vans', 'motorhomes']
const leisureCategories: MarketplaceCategorySlug[] = ['motorhomes', 'caravans']
const machineCategories: MarketplaceCategorySlug[] = ['agriculture', 'construction']

function option(key: string, sv: string, en = sv, de = en): EquipmentOption {
  return { key, sv, en, de }
}

function group(
  key: EquipmentGroupKey,
  sv: string,
  en: string,
  de: string,
  categories: MarketplaceCategorySlug[],
  options: EquipmentOption[],
): EquipmentGroup {
  return { key, sv, en, de, categories, options }
}

export const equipmentGroups: EquipmentGroup[] = [
  group('comfort', 'Komfort', 'Comfort', 'Komfort', carLikeCategories, [
    option('air_conditioning', 'Aircondition', 'Air conditioning', 'Klimaanlage'),
    option('automatic_climate_control', 'Automatisk klimatanläggning', 'Automatic climate control', 'Klimaautomatik'),
    option('dual_zone_climate', '2-zons klimatanläggning', '2-zone climate control', '2-Zonen-Klimaautomatik'),
    option('three_zone_climate', '3-zons klimatanläggning', '3-zone climate control', '3-Zonen-Klimaautomatik'),
    option('four_zone_climate', '4-zons klimatanläggning', '4-zone climate control', '4-Zonen-Klimaautomatik'),
    option('parking_heater', 'Parkeringsvärmare', 'Parking heater', 'Standheizung'),
    option('remote_parking_heater', 'Fjärrstyrd parkeringsvärmare', 'Remote parking heater', 'Fernbediente Standheizung'),
    option('cabin_heater', 'Kupévärmare', 'Cabin heater', 'Innenraumheizung'),
    option('ventilated_seats', 'Ventilerade säten', 'Ventilated seats', 'Belüftete Sitze'),
    option('heated_front_seats', 'Eluppvärmda säten fram', 'Heated front seats', 'Sitzheizung vorne'),
    option('heated_rear_seats', 'Eluppvärmda säten bak', 'Heated rear seats', 'Sitzheizung hinten'),
    option('heated_steering_wheel', 'Eluppvärmd ratt', 'Heated steering wheel', 'Lenkradheizung'),
    option('seat_massage', 'Massagefunktion i säten', 'Seat massage function', 'Sitzmassage'),
    option('electric_driver_seat', 'Elstol förare', 'Electric driver seat', 'Elektrischer Fahrersitz'),
    option('electric_passenger_seat', 'Elstol passagerare', 'Electric passenger seat', 'Elektrischer Beifahrersitz'),
    option('driver_seat_memory', 'Minnesfunktion för förarstol', 'Driver seat memory', 'Memory-Fahrersitz'),
    option('comfort_seats', 'Komfortstolar', 'Comfort seats', 'Komfortsitze'),
    option('sport_seats', 'Sportstolar', 'Sport seats', 'Sportsitze'),
    option('adjustable_lumbar_support', 'Justerbart svankstöd', 'Adjustable lumbar support', 'Verstellbare Lordosenstütze'),
    option('front_armrest', 'Armstöd fram', 'Front armrest', 'Armlehne vorne'),
    option('rear_armrest', 'Armstöd bak', 'Rear armrest', 'Armlehne hinten'),
    option('keyless_entry', 'Keyless entry', 'Keyless entry', 'Keyless Entry'),
    option('keyless_start', 'Keyless start', 'Keyless start', 'Keyless Start'),
    option('start_stop_system', 'Start/stopp-system', 'Start/stop system', 'Start-Stopp-System'),
    option('electric_tailgate', 'Elektrisk baklucka', 'Electric tailgate', 'Elektrische Heckklappe'),
    option('handsfree_tailgate', 'Handsfree baklucka', 'Hands-free tailgate', 'Freihändige Heckklappe'),
    option('soft_close_doors', 'Soft close dörrar', 'Soft-close doors', 'Soft-Close-Türen'),
    option('tinted_windows', 'Tonade rutor', 'Tinted windows', 'Getönte Scheiben'),
    option('rear_sun_blinds', 'Solgardiner bak', 'Rear sun blinds', 'Sonnenrollos hinten'),
    option('panoramic_glass_roof', 'Panoramaglastak', 'Panoramic glass roof', 'Panoramaglasdach'),
    option('sunroof', 'Taklucka', 'Sunroof', 'Schiebedach'),
    option('front_power_windows', 'Elhissar fram', 'Front power windows', 'Elektrische Fensterheber vorne'),
    option('rear_power_windows', 'Elhissar bak', 'Rear power windows', 'Elektrische Fensterheber hinten'),
    option('power_folding_mirrors', 'Elektriskt infällbara sidospeglar', 'Power folding side mirrors', 'Elektrisch anklappbare Außenspiegel'),
    option('heated_side_mirrors', 'Eluppvärmda sidospeglar', 'Heated side mirrors', 'Beheizbare Außenspiegel'),
    option('auto_dimming_rearview_mirror', 'Automatisk avbländande backspegel', 'Auto-dimming rear-view mirror', 'Automatisch abblendender Innenspiegel'),
    option('rain_sensor', 'Regnsensor', 'Rain sensor', 'Regensensor'),
    option('light_sensor', 'Ljussensor', 'Light sensor', 'Lichtsensor'),
  ]),
  group('technology_media', 'Teknik & media', 'Technology & media', 'Technik & Medien', allVehicleCategories, [
    option('navigation', 'Navigation', 'Navigation', 'Navigation'),
    option('gps', 'GPS', 'GPS', 'GPS'),
    option('digital_instrument_cluster', 'Digital instrumentpanel', 'Digital instrument cluster', 'Digitales Kombiinstrument'),
    option('head_up_display', 'Head-up display', 'Head-up display', 'Head-up-Display'),
    option('trip_computer', 'Färddator', 'Trip computer', 'Bordcomputer'),
    option('touchscreen', 'Pekskärm', 'Touchscreen', 'Touchscreen'),
    option('apple_carplay', 'Apple CarPlay', 'Apple CarPlay', 'Apple CarPlay'),
    option('android_auto', 'Android Auto', 'Android Auto', 'Android Auto'),
    option('bluetooth', 'Bluetooth', 'Bluetooth', 'Bluetooth'),
    option('usb', 'USB', 'USB', 'USB'),
    option('usb_c', 'USB-C', 'USB-C', 'USB-C'),
    option('aux', 'AUX', 'AUX', 'AUX'),
    option('wireless_phone_charging', 'Trådlös mobilladdning', 'Wireless phone charging', 'Kabelloses Laden'),
    option('wifi_hotspot', 'WiFi hotspot', 'WiFi hotspot', 'WLAN-Hotspot'),
    option('voice_control', 'Röststyrning', 'Voice control', 'Sprachsteuerung'),
    option('premium_sound_system', 'Premium ljudsystem', 'Premium sound system', 'Premium-Soundsystem'),
    option('harman_kardon', 'Harman Kardon', 'Harman Kardon', 'Harman Kardon'),
    option('bang_olufsen', 'Bang & Olufsen', 'Bang & Olufsen', 'Bang & Olufsen'),
    option('bose', 'Bose', 'Bose', 'Bose'),
    option('burmester', 'Burmester', 'Burmester', 'Burmester'),
    option('meridian', 'Meridian', 'Meridian', 'Meridian'),
    option('dab_radio', 'DAB-radio', 'DAB radio', 'DAB-Radio'),
    option('cd_player', 'CD-spelare', 'CD player', 'CD-Player'),
    option('tv_screen', 'TV-skärm', 'TV screen', 'TV-Bildschirm'),
    option('rear_entertainment_system', 'Underhållningssystem bak', 'Rear entertainment system', 'Fond-Entertainment-System'),
    option('app_control', 'Appstyrning', 'App control', 'App-Steuerung'),
    option('ota_updates', 'OTA-uppdateringar', 'OTA updates', 'OTA-Updates'),
    option('digital_key', 'Digital nyckel', 'Digital key', 'Digitaler Schlüssel'),
  ]),
  group('safety', 'Säkerhet', 'Safety', 'Sicherheit', roadVehicleCategories.concat(['motorcycles']), [
    option('abs', 'ABS', 'ABS', 'ABS'),
    option('stability_control', 'Antisladdsystem', 'Stability control', 'Stabilitätskontrolle'),
    option('traction_control', 'Antispinn', 'Traction control', 'Traktionskontrolle'),
    option('esp', 'ESP', 'ESP', 'ESP'),
    option('driver_airbag', 'Airbag förare', 'Driver airbag', 'Fahrerairbag'),
    option('passenger_airbag', 'Airbag passagerare', 'Passenger airbag', 'Beifahrerairbag'),
    option('side_airbags', 'Sidokrockkuddar', 'Side airbags', 'Seitenairbags'),
    option('curtain_airbags', 'Krockgardiner', 'Curtain airbags', 'Kopfairbags'),
    option('isofix', 'Isofix', 'Isofix', 'Isofix'),
    option('emergency_brake_assist', 'Nödbromsassistans', 'Emergency brake assist', 'Notbremsassistent'),
    option('automatic_emergency_braking', 'Autobroms', 'Automatic emergency braking', 'Automatische Notbremsung'),
    option('adaptive_cruise_control', 'Adaptiv farthållare', 'Adaptive cruise control', 'Adaptiver Tempomat'),
    option('cruise_control', 'Farthållare', 'Cruise control', 'Tempomat'),
    option('lane_keep_assist', 'Filhållningsassistans', 'Lane keeping assist', 'Spurhalteassistent'),
    option('lane_change_warning', 'Filbytesvarnare', 'Lane change warning', 'Spurwechselwarner'),
    option('blind_spot_monitor', 'Döda-vinkel-varnare', 'Blind spot monitor', 'Totwinkelwarner'),
    option('traffic_sign_recognition', 'Trafikskyltsigenkänning', 'Traffic sign recognition', 'Verkehrszeichenerkennung'),
    option('driver_fatigue_warning', 'Trötthetsvarnare', 'Driver fatigue warning', 'Müdigkeitswarner'),
    option('collision_warning', 'Kollisionsvarning', 'Collision warning', 'Kollisionswarnung'),
    option('pedestrian_detection', 'Fotgängarigenkänning', 'Pedestrian detection', 'Fußgängererkennung'),
    option('cyclist_detection', 'Cyklistigenkänning', 'Cyclist detection', 'Radfahrererkennung'),
    option('hill_start_assist', 'Backstartshjälp', 'Hill start assist', 'Berganfahrassistent'),
    option('hill_descent_control', 'Nedförsassistans', 'Hill descent control', 'Bergabfahrhilfe'),
    option('cornering_lights', 'Kurvljus', 'Cornering lights', 'Kurvenlicht'),
    option('matrix_led', 'Matrix LED', 'Matrix LED', 'Matrix LED'),
    option('led_headlights', 'LED-strålkastare', 'LED headlights', 'LED-Scheinwerfer'),
    option('xenon_headlights', 'Xenonstrålkastare', 'Xenon headlights', 'Xenon-Scheinwerfer'),
    option('halogen_headlights', 'Halogenstrålkastare', 'Halogen headlights', 'Halogenscheinwerfer'),
    option('fog_lights', 'Dimljus', 'Fog lights', 'Nebelscheinwerfer'),
    option('automatic_high_beam', 'Automatiskt helljus', 'Automatic high beam', 'Fernlichtassistent'),
    option('tire_pressure_monitoring', 'Däcktrycksövervakning', 'Tyre pressure monitoring', 'Reifendruckkontrolle'),
    option('alarm', 'Larm', 'Alarm', 'Alarmanlage'),
    option('immobilizer', 'Immobilizer', 'Immobilizer', 'Wegfahrsperre'),
    option('sos_ecall', 'SOS/eCall', 'SOS/eCall', 'SOS/eCall'),
  ]),
  group('parking_cameras', 'Parkering & kameror', 'Parking & cameras', 'Parken & Kameras', roadVehicleCategories, [
    option('front_parking_sensors', 'Parkeringssensorer fram', 'Front parking sensors', 'Parksensoren vorne'),
    option('rear_parking_sensors', 'Parkeringssensorer bak', 'Rear parking sensors', 'Parksensoren hinten'),
    option('rear_view_camera', 'Backkamera', 'Rear-view camera', 'Rückfahrkamera'),
    option('camera_360', '360-kamera', '360 camera', '360-Grad-Kamera'),
    option('front_parking_camera', 'Parkeringskamera fram', 'Front parking camera', 'Frontkamera'),
    option('automatic_parking', 'Automatisk parkering', 'Automatic parking', 'Automatisches Parken'),
    option('remote_parking', 'Fjärrstyrd parkering', 'Remote parking', 'Ferngesteuertes Parken'),
    option('trailer_assist', 'Trailer assist', 'Trailer assist', 'Trailer Assist'),
  ]),
  group('exterior', 'Exteriör', 'Exterior', 'Exterieur', roadVehicleCategories, [
    option('metallic_paint', 'Metalliclack', 'Metallic paint', 'Metallic-Lackierung'),
    option('matte_paint', 'Matt lack', 'Matte paint', 'Mattlack'),
    option('special_paint', 'Speciallack', 'Special paint', 'Sonderlackierung'),
    option('sport_package', 'Sportpaket', 'Sport package', 'Sportpaket'),
    option('m_package', 'M-paket', 'M package', 'M-Paket'),
    option('amg_package', 'AMG-paket', 'AMG package', 'AMG-Paket'),
    option('s_line', 'S line', 'S line', 'S line'),
    option('r_line', 'R-line', 'R-line', 'R-Line'),
    option('chrome_package', 'Krompaket', 'Chrome package', 'Chrompaket'),
    option('black_optics_package', 'Svart optikpaket', 'Black optics package', 'Schwarz-Optik-Paket'),
    option('roof_rails', 'Takrails', 'Roof rails', 'Dachreling'),
    option('towbar', 'Dragkrok', 'Towbar', 'Anhängerkupplung'),
    option('detachable_towbar', 'Avtagbar dragkrok', 'Detachable towbar', 'Abnehmbare Anhängerkupplung'),
    option('electric_towbar', 'Elektrisk dragkrok', 'Electric towbar', 'Elektrische Anhängerkupplung'),
    option('spoiler', 'Spoiler', 'Spoiler', 'Spoiler'),
    option('side_steps', 'Sidosteg', 'Side steps', 'Trittbretter'),
    option('mud_flaps', 'Stänkskydd', 'Mud flaps', 'Schmutzfänger'),
    option('alloy_wheels', 'Alufälgar', 'Alloy wheels', 'Alufelgen'),
    option('steel_wheels', 'Stålfälgar', 'Steel wheels', 'Stahlfelgen'),
    option('winter_wheels', 'Vinterhjul', 'Winter wheels', 'Winterräder'),
    option('summer_wheels', 'Sommarhjul', 'Summer wheels', 'Sommerräder'),
    option('all_season_tires', 'Helårsdäck', 'All-season tyres', 'Ganzjahresreifen'),
    option('spare_wheel', 'Reservhjul', 'Spare wheel', 'Reserverad'),
    option('puncture_repair_kit', 'Punkteringskit', 'Puncture repair kit', 'Pannenset'),
  ]),
  group('interior', 'Interiör', 'Interior', 'Interieur', carLikeCategories, [
    option('leather_upholstery', 'Skinnklädsel', 'Leather upholstery', 'Lederausstattung'),
    option('half_leather', 'Halvskinn', 'Half leather', 'Teilleder'),
    option('alcantara', 'Alcantara', 'Alcantara', 'Alcantara'),
    option('cloth_upholstery', 'Tygklädsel', 'Cloth upholstery', 'Stoffausstattung'),
    option('velour', 'Velour', 'Velour', 'Velours'),
    option('wood_trim', 'Träpaneler', 'Wood trim', 'Holzdekor'),
    option('aluminium_trim', 'Aluminiumdetaljer', 'Aluminium trim', 'Aluminiumdekor'),
    option('carbon_fiber_trim', 'Kolfiberdetaljer', 'Carbon fibre trim', 'Carbondekor'),
    option('ambient_lighting', 'Ambient lighting', 'Ambient lighting', 'Ambientebeleuchtung'),
    option('black_headliner', 'Svart innertak', 'Black headliner', 'Schwarzer Dachhimmel'),
    option('split_rear_seat', 'Delbart baksäte', 'Split rear seat', 'Teilbare Rückbank'),
    option('folding_rear_seat', 'Fällbart baksäte', 'Folding rear seat', 'Umklappbare Rückbank'),
    option('ski_hatch', 'Genomlastningslucka', 'Ski hatch', 'Durchlade'),
    option('cargo_net', 'Lastnät', 'Cargo net', 'Gepäcknetz'),
    option('parcel_shelf', 'Insynsskydd', 'Parcel shelf', 'Laderaumabdeckung'),
    option('boot_mat', 'Bagagerumsmatta', 'Boot mat', 'Kofferraummatte'),
    option('rubber_mats', 'Gummimattor', 'Rubber mats', 'Gummimatten'),
    option('textile_mats', 'Textilmattor', 'Textile mats', 'Textilmatten'),
  ]),
  group('drivetrain', 'Drivlina & körning', 'Drivetrain & driving', 'Antrieb & Fahrwerk', roadVehicleCategories.concat(['motorcycles']), [
    option('automatic_transmission', 'Automat', 'Automatic transmission', 'Automatik'),
    option('manual_transmission', 'Manuell', 'Manual transmission', 'Schaltgetriebe'),
    option('all_wheel_drive', 'Fyrhjulsdrift', 'All-wheel drive', 'Allradantrieb'),
    option('rear_wheel_drive', 'Bakhjulsdrift', 'Rear-wheel drive', 'Hinterradantrieb'),
    option('front_wheel_drive', 'Framhjulsdrift', 'Front-wheel drive', 'Frontantrieb'),
    option('air_suspension', 'Luftfjädring', 'Air suspension', 'Luftfederung'),
    option('adaptive_chassis', 'Adaptivt chassi', 'Adaptive chassis', 'Adaptives Fahrwerk'),
    option('sport_chassis', 'Sportchassi', 'Sport chassis', 'Sportfahrwerk'),
    option('comfort_chassis', 'Komfortchassi', 'Comfort chassis', 'Komfortfahrwerk'),
    option('drive_modes', 'Körlägen', 'Drive modes', 'Fahrmodi'),
    option('eco_mode', 'Eco-läge', 'Eco mode', 'Eco-Modus'),
    option('sport_mode', 'Sportläge', 'Sport mode', 'Sportmodus'),
    option('offroad_mode', 'Offroad-läge', 'Off-road mode', 'Offroad-Modus'),
    option('differential_lock', 'Differentialspärr', 'Differential lock', 'Differenzialsperre'),
    option('launch_control', 'Launch control', 'Launch control', 'Launch Control'),
    option('shift_paddles', 'Växelpaddlar', 'Shift paddles', 'Schaltwippen'),
    option('power_steering', 'Servostyrning', 'Power steering', 'Servolenkung'),
  ]),
  group('electric_hybrid', 'Elbil & hybrid', 'Electric & hybrid', 'Elektro & Hybrid', ['cars', 'vans', 'motorhomes', 'trucks', 'motorcycles'], [
    option('fast_charging', 'Snabbladdning', 'Fast charging', 'Schnellladen'),
    option('ccs_charging', 'CCS-laddning', 'CCS charging', 'CCS-Laden'),
    option('type_2_charging', 'Typ 2-laddning', 'Type 2 charging', 'Typ-2-Laden'),
    option('charging_cable', 'Laddkabel', 'Charging cable', 'Ladekabel'),
    option('wallbox_included', 'Laddbox inkluderad', 'Wallbox included', 'Wallbox inklusive'),
    option('battery_heating', 'Batterivärmning', 'Battery heating', 'Batterieheizung'),
    option('app_preconditioning', 'Förvärmning via app', 'App preconditioning', 'Vorklimatisierung per App'),
    option('heat_pump', 'Värmepump', 'Heat pump', 'Wärmepumpe'),
    option('regenerative_braking', 'Regenerativ bromsning', 'Regenerative braking', 'Rekuperation'),
    option('one_pedal_drive', 'One pedal drive', 'One pedal drive', 'One-Pedal-Drive'),
    option('range_optimization', 'Räckviddsoptimering', 'Range optimization', 'Reichweitenoptimierung'),
    option('plug_in_hybrid', 'Plug-in hybrid', 'Plug-in hybrid', 'Plug-in-Hybrid'),
    option('mild_hybrid', 'Mildhybrid', 'Mild hybrid', 'Mildhybrid'),
    option('electric_mode', 'Elbilsläge', 'Electric mode', 'Elektromodus'),
  ]),
  group('van_load', 'Transportbil / last', 'Van / load', 'Transporter / Ladung', ['vans', 'trucks'], [
    option('van_racking', 'Skåpinredning', 'Van racking', 'Fahrzeugeinrichtung'),
    option('shelving_system', 'Hyllsystem', 'Shelving system', 'Regalsystem'),
    option('workshop_interior', 'Verkstadsinredning', 'Workshop interior', 'Werkstatteinrichtung'),
    option('load_bulkhead', 'Lastgaller', 'Load bulkhead', 'Laderaumgitter'),
    option('load_hooks', 'Lastkrokar', 'Load hooks', 'Ladehaken'),
    option('load_rails', 'Lastskenor', 'Load rails', 'Ladeschienen'),
    option('right_sliding_door', 'Skjutdörr höger', 'Right sliding door', 'Schiebetür rechts'),
    option('left_sliding_door', 'Skjutdörr vänster', 'Left sliding door', 'Schiebetür links'),
    option('dual_sliding_doors', 'Dubbla skjutdörrar', 'Dual sliding doors', 'Doppelte Schiebetüren'),
    option('tail_lift', 'Bakgavellyft', 'Tail lift', 'Ladebordwand'),
    option('ramp', 'Ramp', 'Ramp', 'Rampe'),
    option('refrigeration_unit', 'Kylaggregat', 'Refrigeration unit', 'Kühlaggregat'),
    option('freezer_unit', 'Frysaggregat', 'Freezer unit', 'Tiefkühlaggregat'),
    option('cargo_area_heating', 'Värme i lastutrymme', 'Cargo area heating', 'Laderaumheizung'),
    option('extra_high_load_volume', 'Extra hög lastvolym', 'Extra high load volume', 'Extra hohes Ladevolumen'),
    option('long_wheelbase', 'Lång hjulbas', 'Long wheelbase', 'Langer Radstand'),
    option('double_cab', 'Dubbelhytt', 'Double cab', 'Doppelkabine'),
    option('flatbed', 'Flak', 'Flatbed', 'Pritsche'),
    option('tipper_bed', 'Tippflak', 'Tipper bed', 'Kipppritsche'),
    option('crane', 'Kran', 'Crane', 'Kran'),
    option('tow_package', 'Dragpaket', 'Towing package', 'Anhängelastpaket'),
  ]),
  group('recreation', 'Husbil / husvagn', 'Motorhome / caravan', 'Wohnmobil / Wohnwagen', leisureCategories, [
    option('awning', 'Markis', 'Awning', 'Markise'),
    option('solar_panels', 'Solceller', 'Solar panels', 'Solaranlage'),
    option('lpg', 'Gasol', 'LPG', 'Gas'),
    option('fridge', 'Kylskåp', 'Fridge', 'Kühlschrank'),
    option('freezer', 'Frys', 'Freezer', 'Gefrierfach'),
    option('stove', 'Spis', 'Stove', 'Herd'),
    option('oven', 'Ugn', 'Oven', 'Backofen'),
    option('microwave', 'Mikrovågsugn', 'Microwave', 'Mikrowelle'),
    option('shower', 'Dusch', 'Shower', 'Dusche'),
    option('wc', 'WC', 'WC', 'WC'),
    option('hot_water', 'Varmvatten', 'Hot water', 'Warmwasser'),
    option('heating_system', 'Värmesystem', 'Heating system', 'Heizungssystem'),
    option('floor_heating', 'Golvvärme', 'Floor heating', 'Fußbodenheizung'),
    option('living_area_ac', 'AC bodel', 'Living area AC', 'Klimaanlage Wohnbereich'),
    option('tv', 'TV', 'TV', 'TV'),
    option('satellite', 'Satellit', 'Satellite', 'Satellit'),
    option('bike_rack', 'Cykelställ', 'Bike rack', 'Fahrradträger'),
    option('motorhome_rear_camera', 'Backkamera husbil', 'Motorhome rear-view camera', 'Wohnmobil-Rückfahrkamera'),
    option('support_legs', 'Stödben', 'Support legs', 'Stützen'),
    option('tent_awning', 'Förtält', 'Awning tent', 'Vorzelt'),
    option('mover', 'Mover', 'Mover', 'Mover'),
    option('extra_battery', 'Extra batteri', 'Extra battery', 'Zusatzbatterie'),
    option('inverter', 'Inverter', 'Inverter', 'Wechselrichter'),
    option('water_tank', 'Vattentank', 'Water tank', 'Wassertank'),
    option('grey_water_tank', 'Gråvattentank', 'Grey water tank', 'Grauwassertank'),
  ]),
  group('motorcycle', 'Motorcykel', 'Motorcycle', 'Motorrad', ['motorcycles'], [
    option('quickshifter', 'Quickshifter', 'Quickshifter', 'Quickshifter'),
    option('slipper_clutch', 'Slipper clutch', 'Slipper clutch', 'Anti-Hopping-Kupplung'),
    option('heated_grips', 'Värmehandtag', 'Heated grips', 'Heizgriffe'),
    option('led_lighting', 'LED-belysning', 'LED lighting', 'LED-Beleuchtung'),
    option('panniers', 'Packväskor', 'Panniers', 'Koffer'),
    option('top_box', 'Toppbox', 'Top box', 'Topcase'),
    option('side_cases', 'Sidoväskor', 'Side cases', 'Seitenkoffer'),
    option('windshield', 'Vindruta', 'Windshield', 'Windschutzscheibe'),
    option('skid_plate', 'Hasplåt', 'Skid plate', 'Motorschutzplatte'),
    option('crash_bars', 'Motorbågar', 'Crash bars', 'Sturzbügel'),
    option('center_stand', 'Centralstöd', 'Centre stand', 'Hauptständer'),
    option('gps_mount', 'GPS-fäste', 'GPS mount', 'GPS-Halterung'),
    option('usb_charging', 'USB-laddning', 'USB charging', 'USB-Laden'),
  ]),
  group('machinery', 'Lantbruk / entreprenad', 'Agriculture / construction', 'Landwirtschaft / Bau', machineCategories, [
    option('gps_steering', 'GPS-styrning', 'GPS steering', 'GPS-Lenkung'),
    option('rototilt', 'Rotortilt', 'Rototilt', 'Rototilt'),
    option('tiltrotator', 'Tiltrotator', 'Tiltrotator', 'Tiltrotator'),
    option('quick_coupler', 'Snabbfäste', 'Quick coupler', 'Schnellwechsler'),
    option('hydraulic_quick_coupler', 'Hydrauliskt snabbfäste', 'Hydraulic quick coupler', 'Hydraulischer Schnellwechsler'),
    option('extra_hydraulics', 'Extra hydraulik', 'Extra hydraulics', 'Zusatzhydraulik'),
    option('grading_bucket', 'Planeringsskopa', 'Grading bucket', 'Planierlöffel'),
    option('digging_bucket', 'Grävskopa', 'Digging bucket', 'Tieflöffel'),
    option('pallet_forks', 'Pallgafflar', 'Pallet forks', 'Palettengabeln'),
    option('loader', 'Lastare', 'Loader', 'Lader'),
    option('front_loader', 'Frontlastare', 'Front loader', 'Frontlader'),
    option('three_point_hitch', 'Trepunktslyft', 'Three-point hitch', 'Dreipunktaufnahme'),
    option('pto', 'Kraftuttag', 'Power take-off', 'Zapfwelle'),
    option('climate_cab', 'Klimathytt', 'Climate cab', 'Klimakabine'),
    option('air_suspended_seat', 'Luftfjädrad stol', 'Air-suspended seat', 'Luftgefederter Sitz'),
    option('work_lights_led', 'Arbetsbelysning LED', 'LED work lights', 'LED-Arbeitsscheinwerfer'),
    option('central_lubrication', 'Centralsmörjning', 'Central lubrication', 'Zentralschmierung'),
    option('diesel_heater', 'Dieselvärmare', 'Diesel heater', 'Dieselheizung'),
    option('tracks', 'Larvband', 'Tracks', 'Raupenketten'),
    option('dual_wheels', 'Dubbelmontage', 'Dual wheels', 'Zwillingsbereifung'),
    option('slope_bucket', 'Släntskopa', 'Slope bucket', 'Böschungslöffel'),
    option('grapple', 'Grip', 'Grapple', 'Greifer'),
    option('crane_arm', 'Kranarm', 'Crane arm', 'Kranarm'),
  ]),
]

export const equipmentOptions = equipmentGroups.flatMap((item) => item.options)
export const equipmentOptionByKey = new Map(equipmentOptions.map((item) => [item.key, item]))

export function equipmentGroupsForCategory(category: MarketplaceCategorySlug) {
  return equipmentGroups.filter((group) => group.categories.includes(category))
}

export function normalizeEquipmentKeys(values: unknown) {
  const rawValues = Array.isArray(values)
    ? values
    : typeof values === 'string'
      ? values.split(',')
      : []
  return [
    ...new Set(
      rawValues
        .map((value) => String(value).trim())
        .filter((value) => equipmentOptionByKey.has(value)),
    ),
  ]
}

export function equipmentLabel(option: EquipmentOption, locale: PublicLocale) {
  if (locale === 'sv') return option.sv
  if (locale === 'de' || locale === 'at') return option.de
  if (locale === 'en') return option.en
  return translatePublic(locale, option.en)
}

export function equipmentGroupLabel(group: EquipmentGroup, locale: PublicLocale) {
  if (locale === 'sv') return group.sv
  if (locale === 'de' || locale === 'at') return group.de
  if (locale === 'en') return group.en
  return translatePublic(locale, group.en)
}

export function selectedEquipmentGroups(keys: string[], locale: PublicLocale) {
  const selected = new Set(keys)
  return equipmentGroups
    .map((group) => ({
      key: group.key,
      label: equipmentGroupLabel(group, locale),
      options: group.options
        .filter((option) => selected.has(option.key))
        .map((option) => ({
          key: option.key,
          label: equipmentLabel(option, locale),
        })),
    }))
    .filter((group) => group.options.length)
}
