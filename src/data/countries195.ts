export interface CountryItem {
  code: string;
  flag: string;
  englishName: string;
  nativeName: string; // Native mother-tongue script (India is kept in English as requested)
  region: 'Asia' | 'Middle East' | 'Europe' | 'Americas' | 'Africa' | 'Oceania';
  isHQ?: boolean;
}

export const COUNTRIES_195: CountryItem[] = [
  {
    "code": "IN",
    "flag": "🇮🇳",
    "englishName": "India",
    "nativeName": "India",
    "region": "Asia",
    "isHQ": true
  },
  {
    "code": "JP",
    "flag": "🇯🇵",
    "englishName": "Japan",
    "nativeName": "日本",
    "region": "Asia"
  },
  {
    "code": "CN",
    "flag": "🇨🇳",
    "englishName": "China",
    "nativeName": "中国",
    "region": "Asia"
  },
  {
    "code": "KR",
    "flag": "🇰🇷",
    "englishName": "South Korea",
    "nativeName": "대한민국",
    "region": "Asia"
  },
  {
    "code": "KP",
    "flag": "🇰🇵",
    "englishName": "North Korea",
    "nativeName": "조선민주주의인민공화국",
    "region": "Asia"
  },
  {
    "code": "NP",
    "flag": "🇳🇵",
    "englishName": "Nepal",
    "nativeName": "नेपाल",
    "region": "Asia"
  },
  {
    "code": "BD",
    "flag": "🇧🇩",
    "englishName": "Bangladesh",
    "nativeName": "বাংলাদেশ",
    "region": "Asia"
  },
  {
    "code": "LK",
    "flag": "🇱🇰",
    "englishName": "Sri Lanka",
    "nativeName": "ශ්‍රී ලංකාව",
    "region": "Asia"
  },
  {
    "code": "PK",
    "flag": "🇵🇰",
    "englishName": "Pakistan",
    "nativeName": "پاکستان",
    "region": "Asia"
  },
  {
    "code": "AF",
    "flag": "🇦🇫",
    "englishName": "Afghanistan",
    "nativeName": "افغانستان",
    "region": "Asia"
  },
  {
    "code": "BT",
    "flag": "🇧🇹",
    "englishName": "Bhutan",
    "nativeName": "འབྲུག",
    "region": "Asia"
  },
  {
    "code": "MV",
    "flag": "🇲🇻",
    "englishName": "Maldives",
    "nativeName": "ދިވެހިރާއްޖެ",
    "region": "Asia"
  },
  {
    "code": "SG",
    "flag": "🇸🇬",
    "englishName": "Singapore",
    "nativeName": "Singapore",
    "region": "Asia"
  },
  {
    "code": "MY",
    "flag": "🇲🇾",
    "englishName": "Malaysia",
    "nativeName": "Malaysia",
    "region": "Asia"
  },
  {
    "code": "ID",
    "flag": "🇮🇩",
    "englishName": "Indonesia",
    "nativeName": "Indonesia",
    "region": "Asia"
  },
  {
    "code": "TH",
    "flag": "🇹🇭",
    "englishName": "Thailand",
    "nativeName": "ประเทศไทย",
    "region": "Asia"
  },
  {
    "code": "VN",
    "flag": "🇻🇳",
    "englishName": "Vietnam",
    "nativeName": "Việt Nam",
    "region": "Asia"
  },
  {
    "code": "PH",
    "flag": "🇵🇭",
    "englishName": "Philippines",
    "nativeName": "Pilipinas",
    "region": "Asia"
  },
  {
    "code": "MM",
    "flag": "🇲🇲",
    "englishName": "Myanmar",
    "nativeName": "မြန်မာ",
    "region": "Asia"
  },
  {
    "code": "KH",
    "flag": "🇰🇭",
    "englishName": "Cambodia",
    "nativeName": "កម្ពុជា",
    "region": "Asia"
  },
  {
    "code": "LA",
    "flag": "🇱🇦",
    "englishName": "Laos",
    "nativeName": "ລາວ",
    "region": "Asia"
  },
  {
    "code": "BN",
    "flag": "🇧🇳",
    "englishName": "Brunei",
    "nativeName": "Brunei",
    "region": "Asia"
  },
  {
    "code": "TL",
    "flag": "🇹🇱",
    "englishName": "Timor-Leste",
    "nativeName": "Timor-Leste",
    "region": "Asia"
  },
  {
    "code": "MN",
    "flag": "🇲🇳",
    "englishName": "Mongolia",
    "nativeName": "Монгол улс",
    "region": "Asia"
  },
  {
    "code": "KZ",
    "flag": "🇰🇿",
    "englishName": "Kazakhstan",
    "nativeName": "Қазақстан",
    "region": "Asia"
  },
  {
    "code": "UZ",
    "flag": "🇺🇿",
    "englishName": "Uzbekistan",
    "nativeName": "Oʻzbekiston",
    "region": "Asia"
  },
  {
    "code": "TM",
    "flag": "🇹🇲",
    "englishName": "Turkmenistan",
    "nativeName": "Türkmenistan",
    "region": "Asia"
  },
  {
    "code": "KG",
    "flag": "🇰🇬",
    "englishName": "Kyrgyzstan",
    "nativeName": "Кыргызстан",
    "region": "Asia"
  },
  {
    "code": "TJ",
    "flag": "🇹🇯",
    "englishName": "Tajikistan",
    "nativeName": "Тоҷикистон",
    "region": "Asia"
  },
  {
    "code": "AE",
    "flag": "🇦🇪",
    "englishName": "United Arab Emirates",
    "nativeName": "الإمارات العربية المتحدة",
    "region": "Middle East"
  },
  {
    "code": "SA",
    "flag": "🇸🇦",
    "englishName": "Saudi Arabia",
    "nativeName": "المملكة العربية السعودية",
    "region": "Middle East"
  },
  {
    "code": "QA",
    "flag": "🇶🇦",
    "englishName": "Qatar",
    "nativeName": "قطر",
    "region": "Middle East"
  },
  {
    "code": "OM",
    "flag": "🇴🇲",
    "englishName": "Oman",
    "nativeName": "عُمان",
    "region": "Middle East"
  },
  {
    "code": "KW",
    "flag": "🇰🇼",
    "englishName": "Kuwait",
    "nativeName": "الكويت",
    "region": "Middle East"
  },
  {
    "code": "BH",
    "flag": "🇧🇭",
    "englishName": "Bahrain",
    "nativeName": "البحرين",
    "region": "Middle East"
  },
  {
    "code": "IL",
    "flag": "🇮🇱",
    "englishName": "Israel",
    "nativeName": "ישראל",
    "region": "Middle East"
  },
  {
    "code": "PS",
    "flag": "🇵🇸",
    "englishName": "Palestine",
    "nativeName": "فلسطين",
    "region": "Middle East"
  },
  {
    "code": "JO",
    "flag": "🇯🇴",
    "englishName": "Jordan",
    "nativeName": "الأردن",
    "region": "Middle East"
  },
  {
    "code": "LB",
    "flag": "🇱🇧",
    "englishName": "Lebanon",
    "nativeName": "لبنان",
    "region": "Middle East"
  },
  {
    "code": "SY",
    "flag": "🇸🇾",
    "englishName": "Syria",
    "nativeName": "سورية",
    "region": "Middle East"
  },
  {
    "code": "IQ",
    "flag": "🇮🇶",
    "englishName": "Iraq",
    "nativeName": "العراق",
    "region": "Middle East"
  },
  {
    "code": "IR",
    "flag": "🇮🇷",
    "englishName": "Iran",
    "nativeName": "ایران",
    "region": "Middle East"
  },
  {
    "code": "TR",
    "flag": "🇹🇷",
    "englishName": "Turkey",
    "nativeName": "Türkiye",
    "region": "Middle East"
  },
  {
    "code": "YE",
    "flag": "🇾🇪",
    "englishName": "Yemen",
    "nativeName": "اليمن",
    "region": "Middle East"
  },
  {
    "code": "CY",
    "flag": "🇨🇾",
    "englishName": "Cyprus",
    "nativeName": "Κύπρος",
    "region": "Middle East"
  },
  {
    "code": "AM",
    "flag": "🇦🇲",
    "englishName": "Armenia",
    "nativeName": "Հայաստան",
    "region": "Middle East"
  },
  {
    "code": "AZ",
    "flag": "🇦🇿",
    "englishName": "Azerbaijan",
    "nativeName": "Azərbaycan",
    "region": "Middle East"
  },
  {
    "code": "GE",
    "flag": "🇬🇪",
    "englishName": "Georgia",
    "nativeName": "საქართველო",
    "region": "Middle East"
  },
  {
    "code": "GB",
    "flag": "🇬🇧",
    "englishName": "United Kingdom",
    "nativeName": "United Kingdom",
    "region": "Europe"
  },
  {
    "code": "DE",
    "flag": "🇩🇪",
    "englishName": "Germany",
    "nativeName": "Deutschland",
    "region": "Europe"
  },
  {
    "code": "FR",
    "flag": "🇫🇷",
    "englishName": "France",
    "nativeName": "France",
    "region": "Europe"
  },
  {
    "code": "IT",
    "flag": "🇮🇹",
    "englishName": "Italy",
    "nativeName": "Italia",
    "region": "Europe"
  },
  {
    "code": "ES",
    "flag": "🇪🇸",
    "englishName": "Spain",
    "nativeName": "España",
    "region": "Europe"
  },
  {
    "code": "PT",
    "flag": "🇵🇹",
    "englishName": "Portugal",
    "nativeName": "Portugal",
    "region": "Europe"
  },
  {
    "code": "NL",
    "flag": "🇳🇱",
    "englishName": "Netherlands",
    "nativeName": "Nederland",
    "region": "Europe"
  },
  {
    "code": "BE",
    "flag": "🇧🇪",
    "englishName": "Belgium",
    "nativeName": "België",
    "region": "Europe"
  },
  {
    "code": "CH",
    "flag": "🇨🇭",
    "englishName": "Switzerland",
    "nativeName": "Schweiz",
    "region": "Europe"
  },
  {
    "code": "AT",
    "flag": "🇦🇹",
    "englishName": "Austria",
    "nativeName": "Österreich",
    "region": "Europe"
  },
  {
    "code": "SE",
    "flag": "🇸🇪",
    "englishName": "Sweden",
    "nativeName": "Sverige",
    "region": "Europe"
  },
  {
    "code": "NO",
    "flag": "🇳🇴",
    "englishName": "Norway",
    "nativeName": "Norge",
    "region": "Europe"
  },
  {
    "code": "DK",
    "flag": "🇩🇰",
    "englishName": "Denmark",
    "nativeName": "Danmark",
    "region": "Europe"
  },
  {
    "code": "FI",
    "flag": "🇫🇮",
    "englishName": "Finland",
    "nativeName": "Suomi",
    "region": "Europe"
  },
  {
    "code": "IE",
    "flag": "🇮🇪",
    "englishName": "Ireland",
    "nativeName": "Éire",
    "region": "Europe"
  },
  {
    "code": "PL",
    "flag": "🇵🇱",
    "englishName": "Poland",
    "nativeName": "Polska",
    "region": "Europe"
  },
  {
    "code": "CZ",
    "flag": "🇨🇿",
    "englishName": "Czechia",
    "nativeName": "Česko",
    "region": "Europe"
  },
  {
    "code": "SK",
    "flag": "🇸🇰",
    "englishName": "Slovakia",
    "nativeName": "Slovensko",
    "region": "Europe"
  },
  {
    "code": "HU",
    "flag": "🇭🇺",
    "englishName": "Hungary",
    "nativeName": "Magyarország",
    "region": "Europe"
  },
  {
    "code": "RO",
    "flag": "🇷🇴",
    "englishName": "Romania",
    "nativeName": "România",
    "region": "Europe"
  },
  {
    "code": "BG",
    "flag": "🇧🇬",
    "englishName": "Bulgaria",
    "nativeName": "България",
    "region": "Europe"
  },
  {
    "code": "GR",
    "flag": "🇬🇷",
    "englishName": "Greece",
    "nativeName": "Ελλάδα",
    "region": "Europe"
  },
  {
    "code": "HR",
    "flag": "🇭🇷",
    "englishName": "Croatia",
    "nativeName": "Hrvatska",
    "region": "Europe"
  },
  {
    "code": "RS",
    "flag": "🇷🇸",
    "englishName": "Serbia",
    "nativeName": "Србија",
    "region": "Europe"
  },
  {
    "code": "SI",
    "flag": "🇸🇮",
    "englishName": "Slovenia",
    "nativeName": "Slovenija",
    "region": "Europe"
  },
  {
    "code": "BA",
    "flag": "🇧🇦",
    "englishName": "Bosnia and Herzegovina",
    "nativeName": "Bosna i Hercegovina",
    "region": "Europe"
  },
  {
    "code": "AL",
    "flag": "🇦🇱",
    "englishName": "Albania",
    "nativeName": "Shqipëria",
    "region": "Europe"
  },
  {
    "code": "MK",
    "flag": "🇲🇰",
    "englishName": "North Macedonia",
    "nativeName": "Северна Македонија",
    "region": "Europe"
  },
  {
    "code": "ME",
    "flag": "🇲🇪",
    "englishName": "Montenegro",
    "nativeName": "Crna Gora",
    "region": "Europe"
  },
  {
    "code": "UA",
    "flag": "🇺🇦",
    "englishName": "Ukraine",
    "nativeName": "Україна",
    "region": "Europe"
  },
  {
    "code": "BY",
    "flag": "🇧🇾",
    "englishName": "Belarus",
    "nativeName": "Беларусь",
    "region": "Europe"
  },
  {
    "code": "MD",
    "flag": "🇲🇩",
    "englishName": "Moldova",
    "nativeName": "Moldova",
    "region": "Europe"
  },
  {
    "code": "RU",
    "flag": "🇷🇺",
    "englishName": "Russia",
    "nativeName": "Россия",
    "region": "Europe"
  },
  {
    "code": "LT",
    "flag": "🇱🇹",
    "englishName": "Lithuania",
    "nativeName": "Lietuva",
    "region": "Europe"
  },
  {
    "code": "LV",
    "flag": "🇱🇻",
    "englishName": "Latvia",
    "nativeName": "Latvija",
    "region": "Europe"
  },
  {
    "code": "EE",
    "flag": "🇪🇪",
    "englishName": "Estonia",
    "nativeName": "Eesti",
    "region": "Europe"
  },
  {
    "code": "IS",
    "flag": "🇮🇸",
    "englishName": "Iceland",
    "nativeName": "Ísland",
    "region": "Europe"
  },
  {
    "code": "LU",
    "flag": "🇱🇺",
    "englishName": "Luxembourg",
    "nativeName": "Lëtzebuerg",
    "region": "Europe"
  },
  {
    "code": "MT",
    "flag": "🇲🇹",
    "englishName": "Malta",
    "nativeName": "Malta",
    "region": "Europe"
  },
  {
    "code": "MC",
    "flag": "🇲🇨",
    "englishName": "Monaco",
    "nativeName": "Monaco",
    "region": "Europe"
  },
  {
    "code": "AD",
    "flag": "🇦🇩",
    "englishName": "Andorra",
    "nativeName": "Andorra",
    "region": "Europe"
  },
  {
    "code": "LI",
    "flag": "🇱🇮",
    "englishName": "Liechtenstein",
    "nativeName": "Liechtenstein",
    "region": "Europe"
  },
  {
    "code": "SM",
    "flag": "🇸🇲",
    "englishName": "San Marino",
    "nativeName": "San Marino",
    "region": "Europe"
  },
  {
    "code": "VA",
    "flag": "🇻🇦",
    "englishName": "Vatican City",
    "nativeName": "Città del Vaticano",
    "region": "Europe"
  },
  {
    "code": "US",
    "flag": "🇺🇸",
    "englishName": "United States",
    "nativeName": "United States",
    "region": "Americas"
  },
  {
    "code": "CA",
    "flag": "🇨🇦",
    "englishName": "Canada",
    "nativeName": "Canada",
    "region": "Americas"
  },
  {
    "code": "MX",
    "flag": "🇲🇽",
    "englishName": "Mexico",
    "nativeName": "México",
    "region": "Americas"
  },
  {
    "code": "BR",
    "flag": "🇧🇷",
    "englishName": "Brazil",
    "nativeName": "Brasil",
    "region": "Americas"
  },
  {
    "code": "AR",
    "flag": "🇦🇷",
    "englishName": "Argentina",
    "nativeName": "Argentina",
    "region": "Americas"
  },
  {
    "code": "CO",
    "flag": "🇨🇴",
    "englishName": "Colombia",
    "nativeName": "Colombia",
    "region": "Americas"
  },
  {
    "code": "CL",
    "flag": "🇨🇱",
    "englishName": "Chile",
    "nativeName": "Chile",
    "region": "Americas"
  },
  {
    "code": "PE",
    "flag": "🇵🇪",
    "englishName": "Peru",
    "nativeName": "Perú",
    "region": "Americas"
  },
  {
    "code": "VE",
    "flag": "🇻🇪",
    "englishName": "Venezuela",
    "nativeName": "Venezuela",
    "region": "Americas"
  },
  {
    "code": "EC",
    "flag": "🇪🇨",
    "englishName": "Ecuador",
    "nativeName": "Ecuador",
    "region": "Americas"
  },
  {
    "code": "BO",
    "flag": "🇧🇴",
    "englishName": "Bolivia",
    "nativeName": "Bolivia",
    "region": "Americas"
  },
  {
    "code": "PY",
    "flag": "🇵🇾",
    "englishName": "Paraguay",
    "nativeName": "Paraguay",
    "region": "Americas"
  },
  {
    "code": "UY",
    "flag": "🇺🇾",
    "englishName": "Uruguay",
    "nativeName": "Uruguay",
    "region": "Americas"
  },
  {
    "code": "GY",
    "flag": "🇬🇾",
    "englishName": "Guyana",
    "nativeName": "Guyana",
    "region": "Americas"
  },
  {
    "code": "SR",
    "flag": "🇸🇷",
    "englishName": "Suriname",
    "nativeName": "Suriname",
    "region": "Americas"
  },
  {
    "code": "PA",
    "flag": "🇵🇦",
    "englishName": "Panama",
    "nativeName": "Panamá",
    "region": "Americas"
  },
  {
    "code": "CR",
    "flag": "🇨🇷",
    "englishName": "Costa Rica",
    "nativeName": "Costa Rica",
    "region": "Americas"
  },
  {
    "code": "NI",
    "flag": "🇳🇮",
    "englishName": "Nicaragua",
    "nativeName": "Nicaragua",
    "region": "Americas"
  },
  {
    "code": "HN",
    "flag": "🇭🇳",
    "englishName": "Honduras",
    "nativeName": "Honduras",
    "region": "Americas"
  },
  {
    "code": "SV",
    "flag": "🇸🇻",
    "englishName": "El Salvador",
    "nativeName": "El Salvador",
    "region": "Americas"
  },
  {
    "code": "GT",
    "flag": "🇬🇹",
    "englishName": "Guatemala",
    "nativeName": "Guatemala",
    "region": "Americas"
  },
  {
    "code": "BZ",
    "flag": "🇧🇿",
    "englishName": "Belize",
    "nativeName": "Belize",
    "region": "Americas"
  },
  {
    "code": "CU",
    "flag": "🇨🇺",
    "englishName": "Cuba",
    "nativeName": "Cuba",
    "region": "Americas"
  },
  {
    "code": "DO",
    "flag": "🇩🇴",
    "englishName": "Dominican Republic",
    "nativeName": "República Dominicana",
    "region": "Americas"
  },
  {
    "code": "HT",
    "flag": "🇭🇹",
    "englishName": "Haiti",
    "nativeName": "Ayiti",
    "region": "Americas"
  },
  {
    "code": "JM",
    "flag": "🇯🇲",
    "englishName": "Jamaica",
    "nativeName": "Jamaica",
    "region": "Americas"
  },
  {
    "code": "TT",
    "flag": "🇹🇹",
    "englishName": "Trinidad and Tobago",
    "nativeName": "Trinidad and Tobago",
    "region": "Americas"
  },
  {
    "code": "BS",
    "flag": "🇧🇸",
    "englishName": "Bahamas",
    "nativeName": "The Bahamas",
    "region": "Americas"
  },
  {
    "code": "BB",
    "flag": "🇧🇧",
    "englishName": "Barbados",
    "nativeName": "Barbados",
    "region": "Americas"
  },
  {
    "code": "LC",
    "flag": "🇱🇨",
    "englishName": "Saint Lucia",
    "nativeName": "Saint Lucia",
    "region": "Americas"
  },
  {
    "code": "VC",
    "flag": "🇻🇨",
    "englishName": "Saint Vincent & Grenadines",
    "nativeName": "Saint Vincent",
    "region": "Americas"
  },
  {
    "code": "GD",
    "flag": "🇬🇩",
    "englishName": "Grenada",
    "nativeName": "Grenada",
    "region": "Americas"
  },
  {
    "code": "AG",
    "flag": "🇦🇬",
    "englishName": "Antigua and Barbuda",
    "nativeName": "Antigua and Barbuda",
    "region": "Americas"
  },
  {
    "code": "DM",
    "flag": "🇩🇲",
    "englishName": "Dominica",
    "nativeName": "Dominica",
    "region": "Americas"
  },
  {
    "code": "KN",
    "flag": "🇰🇳",
    "englishName": "Saint Kitts and Nevis",
    "nativeName": "Saint Kitts and Nevis",
    "region": "Americas"
  },
  {
    "code": "EG",
    "flag": "🇪🇬",
    "englishName": "Egypt",
    "nativeName": "مصر",
    "region": "Africa"
  },
  {
    "code": "ZA",
    "flag": "🇿🇦",
    "englishName": "South Africa",
    "nativeName": "South Africa",
    "region": "Africa"
  },
  {
    "code": "NG",
    "flag": "🇳🇬",
    "englishName": "Nigeria",
    "nativeName": "Nigeria",
    "region": "Africa"
  },
  {
    "code": "KE",
    "flag": "🇰🇪",
    "englishName": "Kenya",
    "nativeName": "Kenya",
    "region": "Africa"
  },
  {
    "code": "ET",
    "flag": "🇪🇹",
    "englishName": "Ethiopia",
    "nativeName": "ኢትዮጵያ",
    "region": "Africa"
  },
  {
    "code": "MA",
    "flag": "🇲🇦",
    "englishName": "Morocco",
    "nativeName": "المغرب",
    "region": "Africa"
  },
  {
    "code": "DZ",
    "flag": "🇩🇿",
    "englishName": "Algeria",
    "nativeName": "الجزائر",
    "region": "Africa"
  },
  {
    "code": "TN",
    "flag": "🇹🇳",
    "englishName": "Tunisia",
    "nativeName": "تونس",
    "region": "Africa"
  },
  {
    "code": "GH",
    "flag": "🇬🇭",
    "englishName": "Ghana",
    "nativeName": "Ghana",
    "region": "Africa"
  },
  {
    "code": "CI",
    "flag": "🇨🇮",
    "englishName": "Ivory Coast",
    "nativeName": "Côte d’Ivoire",
    "region": "Africa"
  },
  {
    "code": "SN",
    "flag": "🇸🇳",
    "englishName": "Senegal",
    "nativeName": "Sénégal",
    "region": "Africa"
  },
  {
    "code": "TZ",
    "flag": "🇹🇿",
    "englishName": "Tanzania",
    "nativeName": "Tanzania",
    "region": "Africa"
  },
  {
    "code": "UG",
    "flag": "🇺🇬",
    "englishName": "Uganda",
    "nativeName": "Uganda",
    "region": "Africa"
  },
  {
    "code": "RW",
    "flag": "🇷🇼",
    "englishName": "Rwanda",
    "nativeName": "Rwanda",
    "region": "Africa"
  },
  {
    "code": "CM",
    "flag": "🇨🇲",
    "englishName": "Cameroon",
    "nativeName": "Cameroun",
    "region": "Africa"
  },
  {
    "code": "AO",
    "flag": "🇦🇴",
    "englishName": "Angola",
    "nativeName": "Angola",
    "region": "Africa"
  },
  {
    "code": "MZ",
    "flag": "🇲🇿",
    "englishName": "Mozambique",
    "nativeName": "Moçambique",
    "region": "Africa"
  },
  {
    "code": "ZW",
    "flag": "🇿🇼",
    "englishName": "Zimbabwe",
    "nativeName": "Zimbabwe",
    "region": "Africa"
  },
  {
    "code": "ZM",
    "flag": "🇿🇲",
    "englishName": "Zambia",
    "nativeName": "Zambia",
    "region": "Africa"
  },
  {
    "code": "BW",
    "flag": "🇧🇼",
    "englishName": "Botswana",
    "nativeName": "Botswana",
    "region": "Africa"
  },
  {
    "code": "NA",
    "flag": "🇳🇦",
    "englishName": "Namibia",
    "nativeName": "Namibia",
    "region": "Africa"
  },
  {
    "code": "MU",
    "flag": "🇲🇺",
    "englishName": "Mauritius",
    "nativeName": "Maurice",
    "region": "Africa"
  },
  {
    "code": "SC",
    "flag": "🇸🇨",
    "englishName": "Seychelles",
    "nativeName": "Sesel",
    "region": "Africa"
  },
  {
    "code": "MG",
    "flag": "🇲🇬",
    "englishName": "Madagascar",
    "nativeName": "Madagasikara",
    "region": "Africa"
  },
  {
    "code": "SD",
    "flag": "🇸🇩",
    "englishName": "Sudan",
    "nativeName": "السودان",
    "region": "Africa"
  },
  {
    "code": "SS",
    "flag": "🇸🇸",
    "englishName": "South Sudan",
    "nativeName": "South Sudan",
    "region": "Africa"
  },
  {
    "code": "LY",
    "flag": "🇱🇾",
    "englishName": "Libya",
    "nativeName": "ليبيا",
    "region": "Africa"
  },
  {
    "code": "CD",
    "flag": "🇨🇩",
    "englishName": "DR Congo",
    "nativeName": "RD Congo",
    "region": "Africa"
  },
  {
    "code": "CG",
    "flag": "🇨🇬",
    "englishName": "Republic of the Congo",
    "nativeName": "Congo",
    "region": "Africa"
  },
  {
    "code": "GA",
    "flag": "🇬🇦",
    "englishName": "Gabon",
    "nativeName": "Gabon",
    "region": "Africa"
  },
  {
    "code": "GQ",
    "flag": "🇬🇶",
    "englishName": "Equatorial Guinea",
    "nativeName": "Guinea Ecuatorial",
    "region": "Africa"
  },
  {
    "code": "ML",
    "flag": "🇲🇱",
    "englishName": "Mali",
    "nativeName": "Mali",
    "region": "Africa"
  },
  {
    "code": "BF",
    "flag": "🇧🇫",
    "englishName": "Burkina Faso",
    "nativeName": "Burkina Faso",
    "region": "Africa"
  },
  {
    "code": "NE",
    "flag": "🇳🇪",
    "englishName": "Niger",
    "nativeName": "Niger",
    "region": "Africa"
  },
  {
    "code": "TD",
    "flag": "🇹🇩",
    "englishName": "Chad",
    "nativeName": "Tchad",
    "region": "Africa"
  },
  {
    "code": "MR",
    "flag": "🇲🇷",
    "englishName": "Mauritania",
    "nativeName": "موريتانيا",
    "region": "Africa"
  },
  {
    "code": "SO",
    "flag": "🇸🇴",
    "englishName": "Somalia",
    "nativeName": "Soomaaliya",
    "region": "Africa"
  },
  {
    "code": "DJ",
    "flag": "🇩🇯",
    "englishName": "Djibouti",
    "nativeName": "Jabuuti",
    "region": "Africa"
  },
  {
    "code": "ER",
    "flag": "🇪🇷",
    "englishName": "Eritrea",
    "nativeName": "ኤርትራ",
    "region": "Africa"
  },
  {
    "code": "MW",
    "flag": "🇲🇼",
    "englishName": "Malawi",
    "nativeName": "Malawi",
    "region": "Africa"
  },
  {
    "code": "BI",
    "flag": "🇧🇮",
    "englishName": "Burundi",
    "nativeName": "Burundi",
    "region": "Africa"
  },
  {
    "code": "BJ",
    "flag": "🇧🇯",
    "englishName": "Benin",
    "nativeName": "Bénin",
    "region": "Africa"
  },
  {
    "code": "TG",
    "flag": "🇹🇬",
    "englishName": "Togo",
    "nativeName": "Togo",
    "region": "Africa"
  },
  {
    "code": "SL",
    "flag": "🇸🇱",
    "englishName": "Sierra Leone",
    "nativeName": "Sierra Leone",
    "region": "Africa"
  },
  {
    "code": "LR",
    "flag": "🇱🇷",
    "englishName": "Liberia",
    "nativeName": "Liberia",
    "region": "Africa"
  },
  {
    "code": "GN",
    "flag": "🇬🇳",
    "englishName": "Guinea",
    "nativeName": "Guinée",
    "region": "Africa"
  },
  {
    "code": "GW",
    "flag": "🇬🇼",
    "englishName": "Guinea-Bissau",
    "nativeName": "Guiné-Bissau",
    "region": "Africa"
  },
  {
    "code": "GM",
    "flag": "🇬🇲",
    "englishName": "Gambia",
    "nativeName": "The Gambia",
    "region": "Africa"
  },
  {
    "code": "CV",
    "flag": "🇨🇻",
    "englishName": "Cape Verde",
    "nativeName": "Cabo Verde",
    "region": "Africa"
  },
  {
    "code": "ST",
    "flag": "🇸🇹",
    "englishName": "Sao Tome and Principe",
    "nativeName": "São Tomé e Príncipe",
    "region": "Africa"
  },
  {
    "code": "CF",
    "flag": "🇨🇫",
    "englishName": "Central African Republic",
    "nativeName": "Centrafrique",
    "region": "Africa"
  },
  {
    "code": "LS",
    "flag": "🇱🇸",
    "englishName": "Lesotho",
    "nativeName": "Lesotho",
    "region": "Africa"
  },
  {
    "code": "SZ",
    "flag": "🇸🇿",
    "englishName": "Eswatini",
    "nativeName": "eSwatini",
    "region": "Africa"
  },
  {
    "code": "KM",
    "flag": "🇰🇲",
    "englishName": "Comoros",
    "nativeName": "Komori",
    "region": "Africa"
  },
  {
    "code": "AU",
    "flag": "🇦🇺",
    "englishName": "Australia",
    "nativeName": "Australia",
    "region": "Oceania"
  },
  {
    "code": "NZ",
    "flag": "🇳🇿",
    "englishName": "New Zealand",
    "nativeName": "Aotearoa",
    "region": "Oceania"
  },
  {
    "code": "FJ",
    "flag": "🇫🇯",
    "englishName": "Fiji",
    "nativeName": "Viti",
    "region": "Oceania"
  },
  {
    "code": "PG",
    "flag": "🇵🇬",
    "englishName": "Papua New Guinea",
    "nativeName": "Papua Niugini",
    "region": "Oceania"
  },
  {
    "code": "WS",
    "flag": "🇼🇸",
    "englishName": "Samoa",
    "nativeName": "Sāmoa",
    "region": "Oceania"
  },
  {
    "code": "TO",
    "flag": "🇹🇴",
    "englishName": "Tonga",
    "nativeName": "Tonga",
    "region": "Oceania"
  },
  {
    "code": "VU",
    "flag": "🇻🇺",
    "englishName": "Vanuatu",
    "nativeName": "Vanuatu",
    "region": "Oceania"
  },
  {
    "code": "SB",
    "flag": "🇸🇧",
    "englishName": "Solomon Islands",
    "nativeName": "Solomon Islands",
    "region": "Oceania"
  },
  {
    "code": "FM",
    "flag": "🇫🇲",
    "englishName": "Micronesia",
    "nativeName": "Micronesia",
    "region": "Oceania"
  },
  {
    "code": "KI",
    "flag": "🇰🇮",
    "englishName": "Kiribati",
    "nativeName": "Kiribati",
    "region": "Oceania"
  },
  {
    "code": "MH",
    "flag": "🇲🇭",
    "englishName": "Marshall Islands",
    "nativeName": "Aorōkin M̧ajeļ",
    "region": "Oceania"
  },
  {
    "code": "PW",
    "flag": "🇵🇼",
    "englishName": "Palau",
    "nativeName": "Belau",
    "region": "Oceania"
  },
  {
    "code": "NR",
    "flag": "🇳🇷",
    "englishName": "Nauru",
    "nativeName": "Naoero",
    "region": "Oceania"
  },
  {
    "code": "TV",
    "flag": "🇹🇻",
    "englishName": "Tuvalu",
    "nativeName": "Tuvalu",
    "region": "Oceania"
  }
];
