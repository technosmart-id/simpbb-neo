import { rand } from "@ngneat/falso";

const FIRST_NAMES = [
  "Budi", "Agus", "Ahmad", "Siti", "Sri", "Nur", "Andi", "Eko", "Yudi", "Heri",
  "Rini", "Rina", "Iwan", "Bambang", "Supriyanto", "Dwi", "Tri", "Joko", "Wahyu",
  "Muhammad", "Abdul", "Hassan", "Arief", "Tari", "Maya", "Dewi", "Indra", "Hendra",
  "Rizky", "Fitri", "Tini", "Wati", "Sari", "Rahmat", "Anton", "Rian", "Dian", "Eka",
  "Slamet", "Tatang", "Dadang", "Asep", "Cecep", "Ujang", "Komar", "Maman", "Yanti", 
  "Lukman", "Mimi", "Jono", "Kardi", "Darsiti", "Sukiman", "Paijo", "Painem"
];

const FUNNY_NOUNS = [
  "Karet", "Tusuk", "Gayung", "Ember", "Panci", "Sandal", "Gelas", "Piring", "Sendok", 
  "Sapu", "Kipas", "Kabel", "Kasur", "Bantal", "Gigi", "Perut", "Hidung", "Mata",
  "Knalpot", "Spion", "Obeng", "Garpu", "Helm", "Topi", "Karpet", "Baut", "Wajan", 
  "Kompor", "Galon", "Sikat", "Kendi", "Botol", "Jendela", "Genteng", "Paku", "Mur",
  "Tang", "Palu", "Kunci", "Obor", "Ban", "Busi", "Stang", "Jok", "Lampu", "Kabel",
  "Rem", "Gas", "Klakson", "Kaca", "Solder", "Mic", "Speaker", "Remote"
];

const FUNNY_ADJECTIVES = [
  "Molor", "Gigi", "Bocor", "Melotot", "Gepeng", "Gosong", "Bolong", "Penyok", 
  "Terbang", "Miring", "Jebol", "Putus", "Ompong", "Buncit", "Pesek", "Cempreng", 
  "Tonggos", "Kribo", "Botak", "Njungkel", "Ngompol", "Kesambet", "Kececer", "Keseleo",
  "Cadel", "Cadok", "Jabrik", "Plontos", "Ubanan", "Ketombean", "Pincang", "Picek", 
  "Juling", "Rabun", "Budeg", "Tuli", "Bisu", "Gagap", "Bengong", "Melongo", "Nyasar", 
  "Nyungsep", "Ndlosor", "Jepit", "Buntung", "Keder", "Kempot", "Loyo", "Mletre", "Ambyar"
];

const FUNNY_STREET_BASES = [
  "Kenangan", "Masa Lalu", "Harapan", "Jomblo", "Mantan", "Tikungan", "Tanjakan", 
  "Turunan", "Perempatan", "Gang", "Pojokan", "Kuburan", "Pasar", "Warung", "Kebon",
  "Empang", "Kali", "Sawah", "Lorong", "Jalanan"
];

const FUNNY_STREET_SUFFIXES = [
  "Pahit", "Palsu", "Sirna", "Tajam", "Ambyar", "Buntu", "Mumet", "Galau", "Ngenes", 
  "Curhat", "Sepi", "Kelam", "Suram", "Kandas", "Loyo", "Rusak", "Hancur", "Berisik",
  "Bau", "Licin", "Berlubang", "Angker", "Goyang", "Miring"
];

export function randIdName() {
  const firstName = rand(FIRST_NAMES);
  const includeMiddle = Math.random() > 0.4; // 60% chance of middle name
  
  if (includeMiddle) {
    const middleName = rand(FUNNY_NOUNS);
    const lastName = rand(FUNNY_ADJECTIVES);
    return `${firstName} ${middleName} ${lastName}`;
  } else {
    const lastName = rand(FUNNY_ADJECTIVES);
    return `${firstName} ${lastName}`;
  }
}

export function randIdStreetAddress() {
  const num = Math.floor(Math.random() * 200) + 1;
  const formatSelector = Math.random();
  
  let streetName = "";
  if (formatSelector < 0.4) {
    // Format: Jl. Kenangan Pahit
    streetName = `Jl. ${rand(FUNNY_STREET_BASES)} ${rand(FUNNY_STREET_SUFFIXES)}`;
  } else if (formatSelector < 0.8) {
    // Format: Jl. Ember Bocor
    streetName = `Jl. ${rand(FUNNY_NOUNS)} ${rand(FUNNY_ADJECTIVES)}`;
  } else {
    // Format: Jl. Kucing Garong (Manual specific funny combinations)
    const specificFunny = [
      "Ikan Goreng", "Ayam Penyet", "Kucing Garong", "Bebek Njungkel", "Sate Padang",
      "Nasi Kucing", "Es Teh Manis", "Kopi Hitam", "Udut Dulu", "Cari Jodoh",
      "Gak Jadi Kawin", "Hati Terluka", "Dompet Kering", "Gaji Buta", "Admin Ganteng"
    ];
    streetName = `Jl. ${rand(specificFunny)}`;
  }

  return `${streetName} No. ${num}`;
}
