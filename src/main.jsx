import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sprout,
  MapPin,
  PackageCheck,
  ShoppingCart,
  Mic,
  BrainCircuit,
  Warehouse,
  Truck,
  ShieldCheck,
  ArrowUpRight,
  ScanLine,
  Check,
  Languages,
  X,
  ChevronRight,
  Leaf,
  Clock3,
  UserRound,
  LockKeyhole,
  Mail,
  Phone,
  MapPinned,
  Users,
  BarChart3,
  LogOut,
  ClipboardList,
  ArrowUp,
} from "lucide-react";
import "./styles.css";
import "./auth.css";
import "./workflows.css";
import "./checkout.css";
import "./crop-images.css";
import "./intake-pipeline.css";
import "./route-planner.css";
import { isSupabaseConfigured, supabase } from "./supabase";

const initialLots = [];
const INDIA_CROPS = [
  ["Cereals & millets", "Rice"],
  ["Cereals & millets", "Wheat"],
  ["Cereals & millets", "Maize"],
  ["Cereals & millets", "Barley"],
  ["Cereals & millets", "Sorghum (Jowar)"],
  ["Cereals & millets", "Pearl millet (Bajra)"],
  ["Cereals & millets", "Finger millet (Ragi)"],
  ["Cereals & millets", "Foxtail millet (Kangni)"],
  ["Cereals & millets", "Little millet (Kutki)"],
  ["Cereals & millets", "Kodo millet"],
  ["Cereals & millets", "Proso millet (Cheena)"],
  ["Cereals & millets", "Barnyard millet (Sanwa)"],
  ["Cereals & millets", "Browntop millet"],
  ["Cereals & millets", "Buckwheat"],
  ["Cereals & millets", "Amaranth (Rajgira)"],
  ["Pulses", "Chickpea (Gram)"],
  ["Pulses", "Pigeon pea (Arhar/Tur)"],
  ["Pulses", "Green gram (Moong)"],
  ["Pulses", "Black gram (Urad)"],
  ["Pulses", "Lentil (Masur)"],
  ["Pulses", "Field pea"],
  ["Pulses", "Cowpea"],
  ["Pulses", "Moth bean"],
  ["Pulses", "Horse gram"],
  ["Pulses", "Lathyrus (Khesari)"],
  ["Pulses", "Rice bean"],
  ["Pulses", "French bean"],
  ["Pulses", "Cluster bean (Guar)"],
  ["Pulses", "Rajma"],
  ["Pulses", "Soybean"],
  ["Oilseeds", "Groundnut"],
  ["Oilseeds", "Rapeseed & mustard"],
  ["Oilseeds", "Sesame (Til)"],
  ["Oilseeds", "Sunflower"],
  ["Oilseeds", "Safflower"],
  ["Oilseeds", "Niger seed"],
  ["Oilseeds", "Linseed (Alsi)"],
  ["Oilseeds", "Castor"],
  ["Oilseeds", "Cottonseed"],
  ["Oilseeds", "Taramira"],
  ["Oilseeds", "Camelina"],
  ["Oilseeds", "Oil palm"],
  ["Oilseeds", "Coconut"],
  ["Commercial & fibre", "Cotton"],
  ["Commercial & fibre", "Jute"],
  ["Commercial & fibre", "Mesta"],
  ["Commercial & fibre", "Kenaf"],
  ["Commercial & fibre", "Sunn hemp"],
  ["Commercial & fibre", "Flax"],
  ["Commercial & fibre", "Ramie"],
  ["Commercial & fibre", "Sugarcane"],
  ["Commercial & fibre", "Sugar beet"],
  ["Commercial & fibre", "Tobacco"],
  ["Commercial & fibre", "Tea"],
  ["Commercial & fibre", "Coffee"],
  ["Commercial & fibre", "Rubber"],
  ["Commercial & fibre", "Cocoa"],
  ["Vegetables", "Potato"],
  ["Vegetables", "Sweet potato"],
  ["Vegetables", "Tomato"],
  ["Vegetables", "Onion"],
  ["Vegetables", "Garlic"],
  ["Vegetables", "Brinjal (Eggplant)"],
  ["Vegetables", "Okra (Bhindi)"],
  ["Vegetables", "Capsicum"],
  ["Vegetables", "Chilli"],
  ["Vegetables", "Cauliflower"],
  ["Vegetables", "Cabbage"],
  ["Vegetables", "Broccoli"],
  ["Vegetables", "Carrot"],
  ["Vegetables", "Radish"],
  ["Vegetables", "Beetroot"],
  ["Vegetables", "Turnip"],
  ["Vegetables", "Peas"],
  ["Vegetables", "French bean"],
  ["Vegetables", "Broad bean"],
  ["Vegetables", "Cowpea vegetable"],
  ["Vegetables", "Bottle gourd"],
  ["Vegetables", "Bitter gourd"],
  ["Vegetables", "Ridge gourd"],
  ["Vegetables", "Sponge gourd"],
  ["Vegetables", "Snake gourd"],
  ["Vegetables", "Ash gourd"],
  ["Vegetables", "Pumpkin"],
  ["Vegetables", "Cucumber"],
  ["Vegetables", "Muskmelon"],
  ["Vegetables", "Watermelon"],
  ["Vegetables", "Pointed gourd"],
  ["Vegetables", "Ivy gourd"],
  ["Vegetables", "Drumstick (Moringa)"],
  ["Vegetables", "Spinach"],
  ["Vegetables", "Amaranthus greens"],
  ["Vegetables", "Fenugreek greens"],
  ["Vegetables", "Coriander greens"],
  ["Vegetables", "Lettuce"],
  ["Vegetables", "Celery"],
  ["Vegetables", "Mushroom"],
  ["Vegetables", "Tapioca (Cassava)"],
  ["Vegetables", "Elephant foot yam"],
  ["Vegetables", "Colocasia (Arbi)"],
  ["Vegetables", "Yam"],
  ["Fruits", "Mango"],
  ["Fruits", "Banana"],
  ["Fruits", "Guava"],
  ["Fruits", "Papaya"],
  ["Fruits", "Pomegranate"],
  ["Fruits", "Grapes"],
  ["Fruits", "Apple"],
  ["Fruits", "Pear"],
  ["Fruits", "Peach"],
  ["Fruits", "Plum"],
  ["Fruits", "Apricot"],
  ["Fruits", "Litchi"],
  ["Fruits", "Citrus"],
  ["Fruits", "Orange"],
  ["Fruits", "Mandarin"],
  ["Fruits", "Lemon"],
  ["Fruits", "Lime"],
  ["Fruits", "Sapota (Chikoo)"],
  ["Fruits", "Jackfruit"],
  ["Fruits", "Pineapple"],
  ["Fruits", "Coconut"],
  ["Fruits", "Cashew"],
  ["Fruits", "Amla"],
  ["Fruits", "Ber"],
  ["Fruits", "Jamun"],
  ["Fruits", "Custard apple"],
  ["Fruits", "Fig"],
  ["Fruits", "Date palm"],
  ["Fruits", "Dragon fruit"],
  ["Fruits", "Kiwi"],
  ["Fruits", "Strawberry"],
  ["Fruits", "Passion fruit"],
  ["Fruits", "Avocado"],
  ["Fruits", "Karonda"],
  ["Fruits", "Phalsa"],
  ["Spices & condiments", "Black pepper"],
  ["Spices & condiments", "Cardamom"],
  ["Spices & condiments", "Ginger"],
  ["Spices & condiments", "Turmeric"],
  ["Spices & condiments", "Coriander seed"],
  ["Spices & condiments", "Cumin"],
  ["Spices & condiments", "Fennel"],
  ["Spices & condiments", "Fenugreek"],
  ["Spices & condiments", "Ajwain"],
  ["Spices & condiments", "Dill"],
  ["Spices & condiments", "Caraway"],
  ["Spices & condiments", "Celery seed"],
  ["Spices & condiments", "Saffron"],
  ["Spices & condiments", "Vanilla"],
  ["Spices & condiments", "Tamarind"],
  ["Spices & condiments", "Kokum"],
  ["Spices & condiments", "Nutmeg"],
  ["Spices & condiments", "Clove"],
  ["Spices & condiments", "Cinnamon"],
  ["Spices & condiments", "Bay leaf"],
  ["Spices & condiments", "Curry leaf"],
  ["Spices & condiments", "Mint"],
  ["Spices & condiments", "Basil (Tulsi)"],
  ["Plantation & medicinal", "Arecanut"],
  ["Plantation & medicinal", "Betel leaf"],
  ["Plantation & medicinal", "Aloe vera"],
  ["Plantation & medicinal", "Ashwagandha"],
  ["Plantation & medicinal", "Isabgol"],
  ["Plantation & medicinal", "Senna"],
  ["Plantation & medicinal", "Safed musli"],
  ["Plantation & medicinal", "Kalmegh"],
  ["Plantation & medicinal", "Lemongrass"],
  ["Plantation & medicinal", "Citronella"],
  ["Plantation & medicinal", "Palmarosa"],
  ["Plantation & medicinal", "Vetiver (Khus)"],
  ["Plantation & medicinal", "Patchouli"],
  ["Plantation & medicinal", "Rosemary"],
  ["Flowers & fodder", "Rose"],
  ["Flowers & fodder", "Marigold"],
  ["Flowers & fodder", "Jasmine"],
  ["Flowers & fodder", "Chrysanthemum"],
  ["Flowers & fodder", "Tuberose"],
  ["Flowers & fodder", "Gladiolus"],
  ["Flowers & fodder", "Gerbera"],
  ["Flowers & fodder", "Carnation"],
  ["Flowers & fodder", "Berseem"],
  ["Flowers & fodder", "Lucerne"],
  ["Flowers & fodder", "Napier grass"],
  ["Flowers & fodder", "Fodder maize"],
  ["Flowers & fodder", "Fodder sorghum"],
  ["Flowers & fodder", "Oats fodder"],
  ["Flowers & fodder", "Guinea grass"],
].map(([category, name]) => ({ category, name }));
const cropEmoji = (crop = "", category = "") => {
  const name = String(crop).toLowerCase();
  const exact = {
    tomato: "🍅", potato: "🥔", onion: "🧅", garlic: "🧄", carrot: "🥕", beetroot: "🫜", radish: "🌶️",
    "sweet potato": "🍠", ginger: "🫚", turmeric: "🫚", chilli: "🌶️", capsicum: "🫑", cucumber: "🥒",
    pumpkin: "🎃", "bitter gourd": "🥒", "bottle gourd": "🥒", "ridge gourd": "🥒", "snake gourd": "🥒",
    "drumstick (moringa)": "🌿", okra: "🫛", "brinjal (eggplant)": "🍆", mushroom: "🍄", cauliflower: "🥦", broccoli: "🥦", cabbage: "🥬", spinach: "🥬",
    lettuce: "🥬", peas: "🫛", "french bean": "🫛", corn: "🌽", maize: "🌽", rice: "🍚", wheat: "🌾", barley: "🌾", oats: "🌾",
    mango: "🥭", banana: "🍌", apple: "🍎", orange: "🍊", mandarin: "🍊", lemon: "🍋", lime: "🍋", grapes: "🍇",
    watermelon: "🍉", muskmelon: "🍈", papaya: "🥭", pineapple: "🍍", guava: "🍐", pomegranate: "🍎", coconut: "🥥", avocado: "🥑",
    strawberry: "🍓", jackfruit: "🍈", litchi: "🍒", coffee: "☕", tea: "🍵", sugarcane: "🎋", cotton: "☁️", jute: "🧵",
    coriander: "🌿", mint: "🌿", basil: "🌿", curry: "🌿", cumin: "🌿", fennel: "🌿", mustard: "🌿", sesame: "🌿", groundnut: "🥜", soybean: "🫘",
    rose: "🌹", marigold: "🌼", jasmine: "🌸", chrysanthemum: "🌼", tuberose: "🌸", gladiolus: "🌷", gerbera: "🌸", carnation: "🌸",
  };
  const key = Object.keys(exact).find((item) => name.includes(item));
  if (key) return exact[key];
  const group = String(category).toLowerCase();
  if (group.includes("fruit")) return "🍎";
  if (group.includes("vegetable")) return "🥬";
  if (group.includes("cereal") || group.includes("millet")) return "🌾";
  if (group.includes("pulse")) return "🫘";
  if (group.includes("oilseed")) return "🌻";
  if (group.includes("spice") || group.includes("herb")) return "🌿";
  if (group.includes("flower")) return "🌼";
  if (group.includes("plantation")) return "🌴";
  return "🌱";
};
const FLOWER_CROPS = new Set(["Rose", "Marigold", "Jasmine", "Chrysanthemum", "Tuberose", "Gladiolus", "Gerbera", "Carnation"]);
const freshnessForListing = (grade, harvestDate, category, crop) => {
  const ageDays = harvestDate ? Math.max(0, Math.floor((Date.now() - new Date(`${harvestDate}T00:00:00`).getTime()) / 86400000)) : 0;
  const perishable = String(category).toLowerCase().includes("fruit") || String(category).toLowerCase().includes("vegetable") || FLOWER_CROPS.has(crop);
  const gradeIndex = ["A", "B", "C"].indexOf(String(grade || "").toUpperCase());
  const adjustedGrade = perishable && gradeIndex >= 0 ? ["A", "B", "C"][Math.min(2, gradeIndex + Math.floor(ageDays / 7))] : grade;
  return { grade: adjustedGrade || "Intake verified", ageDays, perishable };
};
const normalizeIndianPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  if (
    String(value || "").startsWith("+") &&
    digits.length >= 10 &&
    digits.length <= 15
  )
    return "+" + digits;
  return "";
};
const translations = {
  en: {
    tag: "From farm to table, fairly.",
    hero: "Better value for every harvest.",
    sub: "Live local produce, transparent grading, and fair market access - built around farmer choice.",
    shop: "Shop fresh produce",
    farmer: "Farmer portal",
    stock: "Live stock",
    how: "How FarmLink works",
    why: "Why FarmLink",
    voice: "Voice access",
    ai: "AI insight",
  },
  hi: {
    tag: "खेत से घर तक, उचित मूल्य पर।",
    hero: "हर फसल का बेहतर मूल्य।",
    sub: "लाइव स्थानीय उपज, पारदर्शी ग्रेडिंग और किसान की पसंद के साथ निष्पक्ष बाजार।",
    shop: "ताजी उपज खरीदें",
    farmer: "किसान पोर्टल",
    stock: "लाइव स्टॉक",
    how: "FarmLink कैसे काम करता है",
    why: "FarmLink क्यों",
    voice: "वॉइस एक्सेस",
    ai: "AI सुझाव",
  },
};
const hindiUI = {
  Marketplace: "बाज़ार",
  Wholesale: "थोक बाज़ार",
  Warehouse: "गोदाम",
  Farmer: "किसान",
  "Sign in": "लॉग इन",
  Logout: "लॉग आउट",
  "Retail marketplace": "खुदरा बाज़ार",
  "Continue shopping": "खरीदारी जारी रखें",
  "Open wholesale marketplace": "थोक बाज़ार खोलें",
  Checkout: "चेकआउट",
  Save: "सहेजें",
  "Saved to wishlist": "पसंदीदा में सहेजा गया",
  "Save to wishlist": "पसंदीदा में सहेजें",
  "Quality report": "गुणवत्ता रिपोर्ट",
  "AI smart ranking": "एआई स्मार्ट रैंकिंग",
  "Lowest price": "सबसे कम कीमत",
  "Nearest first": "सबसे नज़दीक पहले",
  "Organic certified": "जैविक प्रमाणित",
  All: "सभी",
  Tomato: "टमाटर",
  Onion: "प्याज़",
  Potato: "आलू",
  "Consumer account": "उपभोक्ता खाता",
  "Orders, favourites & preferences": "ऑर्डर, पसंदीदा और प्राथमिकताएँ",
  "Order tracking": "ऑर्डर ट्रैकिंग",
  wishlist: "पसंदीदा",
  orders: "ऑर्डर",
  profile: "प्रोफ़ाइल",
  reviews: "समीक्षाएँ",
  "Profile & delivery preferences": "प्रोफ़ाइल और डिलीवरी प्राथमिकताएँ",
  "Primary address": "मुख्य पता",
  "Mobile number": "मोबाइल नंबर",
  "Preferred pickup window": "पसंदीदा पिकअप समय",
  "Save preferences": "प्राथमिकताएँ सहेजें",
  "Reviews & ratings": "समीक्षाएँ और रेटिंग",
  "Submit verified review": "सत्यापित समीक्षा भेजें",
  "VERIFIED WHOLESALE MARKETPLACE": "सत्यापित थोक बाज़ार",
  "Buy better, in bulk.": "थोक में बेहतर खरीदें।",
  discover: "खोजें",
  quotes: "कोटेशन",
  contracts: "अनुबंध",
  analytics: "विश्लेषण",
  invoices: "चालान",
  "Negotiation & quote workspace": "बातचीत और कोटेशन कार्यक्षेत्र",
  "Send negotiated quote": "बातचीत वाला कोटेशन भेजें",
  "Contract orders": "अनुबंध ऑर्डर",
  "Create contract order": "अनुबंध ऑर्डर बनाएँ",
  "GST-compliant invoice centre": "GST-अनुपालन चालान केंद्र",
  "Generate PDF": "पीडीएफ बनाएँ",
  "Farmer portal": "किसान पोर्टल",
  "Your produce. Your decision.": "आपकी उपज। आपका निर्णय।",
  "PICKUP & GRADING": "पिकअप और ग्रेडिंग",
  "Add produce request": "उपज अनुरोध जोड़ें",
  "Request type": "अनुरोध प्रकार",
  "Produce intake": "उपज प्राप्ति",
  "Cluster collection request": "क्लस्टर संग्रह अनुरोध",
  Produce: "उपज",
  "Gross weight at pickup (kg)": "पिकअप पर सकल वजन (किग्रा)",
  "Collection cluster": "संग्रह क्लस्टर",
  "Send request to warehouse": "गोदाम को अनुरोध भेजें",
  "Your produce & requests": "आपकी उपज और अनुरोध",
  "Need working capital?": "कार्यशील पूंजी चाहिए?",
  "Explore options": "विकल्प देखें",
  "How grading works": "ग्रेडिंग कैसे काम करती है",
  listings: "लिस्टिंग",
  logistics: "लॉजिस्टिक्स",
  payments: "भुगतान",
  performance: "प्रदर्शन",
  verification: "सत्यापन",
  "Produce listing management & AI grading":
    "उपज लिस्टिंग प्रबंधन और एआई ग्रेडिंग",
  "Listing title": "लिस्टिंग शीर्षक",
  "Listing image": "लिस्टिंग तस्वीर",
  Description: "विवरण",
  "Run AI grading & submit listing": "एआई ग्रेडिंग चलाएँ और लिस्टिंग भेजें",
  "Incoming order management": "आने वाले ऑर्डर प्रबंधन",
  "Accept order": "ऑर्डर स्वीकारें",
  "Logistics schedule": "लॉजिस्टिक्स समय-सारणी",
  "Available earnings": "उपलब्ध आय",
  "Pending settlement": "लंबित भुगतान",
  Transactions: "लेनदेन",
  "Sales trend": "बिक्री रुझान",
  "Repeat customers": "दोबारा आने वाले ग्राहक",
  "Average rating": "औसत रेटिंग",
  "Farmer profile verification": "किसान प्रोफ़ाइल सत्यापन",
  "Continue verification": "सत्यापन जारी रखें",
  "ADMIN-ONLY WAREHOUSE CONSOLE": "केवल एडमिन गोदाम कंसोल",
  "Warehouse intake & fulfillment": "गोदाम प्राप्ति और पूर्ति",
  "Admin access only": "केवल एडमिन पहुँच",
  "Confirm produce intake": "उपज प्राप्ति की पुष्टि करें",
  "Confirmed net weight (kg)": "पुष्ट शुद्ध वजन (किग्रा)",
  "Human-verified grade": "मानव-सत्यापित ग्रेड",
  "Confirm grade & create lot": "ग्रेड की पुष्टि करें और लॉट बनाएँ",
  "Live inventory ledger": "लाइव इन्वेंटरी लेजर",
  "Farmer produce & cluster requests": "किसान उपज और क्लस्टर अनुरोध",
  "Consumer pickup orders": "उपभोक्ता पिकअप ऑर्डर",
  "PLATFORM COMMAND CENTER": "प्लेटफ़ॉर्म कमांड सेंटर",
  "FarmLink Admin": "फार्मलिंक एडमिन",
  "Registered farmers": "पंजीकृत किसान",
  "Live inventory": "लाइव इन्वेंटरी",
  "Stock value": "स्टॉक मूल्य",
  "GOVERNANCE & MODERATION": "शासन और मॉडरेशन",
  "User management": "उपयोगकर्ता प्रबंधन",
  "Listing moderation": "लिस्टिंग मॉडरेशन",
  "Dispute resolution": "विवाद समाधान",
  "System configuration": "सिस्टम कॉन्फ़िगरेशन",
  "Review pending applications": "लंबित आवेदन देखें",
  Approve: "स्वीकृत करें",
  "Reject selected listing": "चयनित लिस्टिंग अस्वीकारें",
  Login: "लॉग इन",
  Register: "पंजीकरण",
  "WELCOME BACK": "वापसी पर स्वागत है",
  "CREATE YOUR ACCOUNT": "अपना खाता बनाएँ",
  "Sign in to FarmLink": "फार्मलिंक में लॉग इन करें",
  "Register as a user": "उपयोगकर्ता के रूप में पंजीकरण करें",
  Consumer: "उपभोक्ता",
  Admin: "एडमिन",
  "Full name": "पूरा नाम",
  "Full address": "पूरा पता",
  "Email address": "ईमेल पता",
  "Farmer ID": "किसान आईडी",
  "Admin username": "एडमिन उपयोगकर्ता नाम",
  Password: "पासवर्ड",
  "Create account": "खाता बनाएँ",
  "Resend email confirmation": "ईमेल पुष्टि फिर भेजें",
  "DIRECT FROM VERIFIED STORAGE": "सत्यापित भंडारण से सीधे",
  "FRESH PRODUCE MARKETPLACE": "ताज़ा उपज बाज़ार",
  "VERIFIED Grade": "सत्यापित ग्रेड",
  "Choose your pickup warehouse": "अपना पिकअप गोदाम चुनें",
  "Confirm pickup order": "पिकअप ऑर्डर की पुष्टि करें",
  "Pickup warehouse": "पिकअप गोदाम",
  "Ready for pickup": "पिकअप के लिए तैयार",
  "Back to marketplace": "बाज़ार पर वापस",
  "LOCAL MARKET, LIVE STOCK.": "स्थानीय बाज़ार, लाइव स्टॉक।",
  "Voice access": "वॉइस एक्सेस",
  "Try voice demo": "वॉइस डेमो आज़माएँ",
  "Start speaking": "बोलना शुरू करें",
  "AI insight": "एआई सुझाव",
  "Farmer-first aggregation • Transparent grade • Better choices":
    "किसान-प्रथम एकत्रीकरण • पारदर्शी ग्रेड • बेहतर विकल्प",
  "Live local produce, transparent grading, and fair market access - built around farmer choice.":
    "लाइव स्थानीय उपज, पारदर्शी ग्रेडिंग और किसान की पसंद पर बना निष्पक्ष बाज़ार।",
  "Smart-ranked by quality, proximity and price competitiveness. Every live lot has a traceable quality record.":
    "गुणवत्ता, निकटता और मूल्य प्रतिस्पर्धा के आधार पर एआई रैंकिंग। हर लाइव लॉट का पता लगाने योग्य गुणवत्ता रिकॉर्ड है।",
  "Search produce, farmer or location": "उपज, किसान या स्थान खोजें",
  "No lots match these filters. Try clearing the organic or grade filter.":
    "इन फ़िल्टरों से कोई लॉट नहीं मिला। जैविक या ग्रेड फ़िल्टर हटाकर देखें।",
  "Request GST-ready quotes, negotiate with verified farmers, and arrange recurring contracts.":
    "GST-तैयार कोटेशन माँगें, सत्यापित किसानों से बातचीत करें और नियमित अनुबंध बनाएँ।",
  "Track pickup status, maintain delivery preferences, and share verified purchase feedback.":
    "पिकअप स्थिति ट्रैक करें, डिलीवरी प्राथमिकताएँ रखें और सत्यापित खरीद प्रतिक्रिया साझा करें।",
  "Discover verified suppliers, request quality samples, negotiate transparent quotes, and manage recurring contracts.":
    "सत्यापित आपूर्तिकर्ता खोजें, गुणवत्ता नमूने माँगें, पारदर्शी कोटेशन पर बातचीत करें और नियमित अनुबंध संभालें।",
  "Monitor farmer collection requests, consumer pickup orders, warehouse stock and market operations.":
    "किसान संग्रह अनुरोध, उपभोक्ता पिकअप ऑर्डर, गोदाम स्टॉक और बाज़ार संचालन की निगरानी करें।",
  "Demo platform for SIH 2026 PS 26033. AI recommendations are illustrative, not guarantees.":
    "SIH 2026 PS 26033 के लिए डेमो प्लेटफ़ॉर्म। एआई सुझाव केवल उदाहरण हैं, गारंटी नहीं।",
  "Traceable lots": "ट्रैक करने योग्य लॉट",
  "Human-verified grades": "मानव-सत्यापित ग्रेड",
  "MARKET SIGNAL": "बाज़ार संकेत",
  "High demand nearby": "पास में अधिक मांग",
  "available today": "आज उपलब्ध",
  "LIVE FROM NEARBY WAREHOUSES": "नज़दीकी गोदामों से लाइव",
  "View marketplace": "बाज़ार देखें",
  "Grade ": "ग्रेड ",
  "kg available": "किग्रा उपलब्ध",
  "day old": "दिन पुराना",
  "ONE CONNECTED FLOW": "एक जुड़ा हुआ प्रवाह",
  "Less uncertainty.": "कम अनिश्चितता।",
  "More choice.": "अधिक विकल्प।",
  "FarmLink joins physical aggregation with market intelligence so produce moves with clarity, not pressure.":
    "फार्मलिंक भौतिक एकत्रीकरण को बाज़ार की जानकारी से जोड़ता है ताकि उपज दबाव से नहीं, स्पष्टता से आगे बढ़े।",
  "Cluster pickup": "क्लस्टर पिकअप",
  "Village & FPO collection": "गाँव और FPO संग्रह",
  "Weigh, grade & store": "वजन, ग्रेड और भंडारण",
  "AI guidance": "एआई मार्गदर्शन",
  "Price, demand & stock-age": "मूल्य, मांग और स्टॉक आयु",
  "Market access": "बाज़ार पहुँच",
  "Consumer & bulk buyers": "उपभोक्ता और थोक खरीदार",
  "Ask in your own language.": "अपनी भाषा में पूछें।",
  "Call, speak, and get guided help with stock, prices or pickups.":
    "कॉल करें, बोलें और स्टॉक, मूल्य या पिकअप में मार्गदर्शित सहायता पाएँ।",
  "Reserve 10 kg": "10 किग्रा आरक्षित करें",
  "Human-verified grade": "मानव-सत्यापित ग्रेड",
  kg: "किग्रा",
  "/kg": "/किग्रा",
  km: "किमी",
  intake: "प्राप्ति",
  "Mark received": "प्राप्ति दर्ज करें",
  Received: "प्राप्त हुआ",
  "Mark ready": "तैयार करें",
  Ready: "तैयार",
  "Total payable at pickup": "पिकअप पर कुल देय",
  "Consumer checkout": "उपभोक्ता चेकआउट",
  "Your items are reserved. Select a verified FarmLink warehouse, then confirm your pickup order.":
    "आपकी वस्तुएँ आरक्षित हैं। सत्यापित फार्मलिंक गोदाम चुनें और पिकअप ऑर्डर की पुष्टि करें।",
  "Firebase OTP sent to your registered mobile number.": "आपके पंजीकृत मोबाइल नंबर पर Firebase OTP भेजा गया है।",
  "Start recording": "रिकॉर्डिंग शुरू करें",
  "Stop & transcribe": "रोकें और लिप्यंतरित करें",
  Engine: "इंजन",
  Language: "भाषा",
  "Jaipur North": "जयपुर उत्तर",
  "Sanganer Hub": "सांगानेर हब",
};
function localizeUI(root, language) {
  const pairs =
    language === "hi"
      ? Object.entries(hindiUI)
      : Object.entries(hindiUI).map(([en, hi]) => [hi, en]);
  const replace = (value) =>
    pairs
      .sort((a, b) => b[0].length - a[0].length)
      .reduce((text, [from, to]) => text.split(from).join(to), value);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const next = replace(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
  root.querySelectorAll("[placeholder],[aria-label]").forEach((element) =>
    ["placeholder", "aria-label"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) {
        const next = replace(value);
        if (next !== value) element.setAttribute(attribute, next);
      }
    }),
  );
}
const CONSTITUTIONAL_LANGUAGES = [
  ["as", "অসমীয়া"],
  ["bn", "বাংলা"],
  ["brx", "बड़ो"],
  ["doi", "डोगरी"],
  ["gu", "ગુજરાતી"],
  ["hi", "हिन्दी"],
  ["kn", "ಕನ್ನಡ"],
  ["ks", "کٲشُر"],
  ["kok", "कोंकणी"],
  ["mai", "मैथिली"],
  ["ml", "മലയാളം"],
  ["mni", "মেইতেই লোন্"],
  ["mr", "मराठी"],
  ["ne", "नेपाली"],
  ["or", "ଓଡ଼ିଆ"],
  ["pa", "ਪੰਜਾਬੀ"],
  ["sa", "संस्कृतम्"],
  ["sat", "ᱥᱟᱱᱛᱟᱲᱤ"],
  ["sd", "سنڌي"],
  ["ta", "தமிழ்"],
  ["te", "తెలుగు"],
  ["ur", "اردو"],
];

function App() {
  const [lang, setLang] = useState("en"),
    [view, setView] = useState("home"),
    [authRole, setAuthRole] = useState("consumer"),
    [lots, setLots] = useState(initialLots),
    [cart, setCart] = useState([]),
    [wishlist, setWishlist] = useState([]),
    [selectedLot, setSelectedLot] = useState(null),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [session, setSession] = useState(null),
    [produceRequests, setProduceRequests] = useState([]),
    [orders, setOrders] = useState([]),
    [bulkRequests, setBulkRequests] = useState([]),
    [logisticsJobs, setLogisticsJobs] = useState([]),
    [warehouses, setWarehouses] = useState([
      { name: "Jaipur North", address: "Jaipur North, Rajasthan" },
      { name: "Sanganer Hub", address: "Sanganer, Jaipur, Rajasthan" },
    ]),
    [liveTick, setLiveTick] = useState(0),
    [now, setNow] = useState(Date.now()),
    [placingOrder, setPlacingOrder] = useState(false),
    placingOrderRef = useRef(false);
  const t = translations[lang] || translations.en;
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth
      .getSession()
      .then(async ({ data: { session: authSession } }) => {
        if (!authSession) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role,full_name,farmer_id")
          .eq("id", authSession.user.id)
          .single();
        if (profile)
          setSession({
            role: profile.role,
            label: profile.full_name,
            name: profile.full_name,
            farmerId: profile.farmer_id,
            userId: authSession.user.id,
          });
      });
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    supabase
      .from("produce_lots")
      .select(
        "id,lot_code,crop,grade,quantity_kg,price_per_kg,warehouses(name)",
      )
      .eq("marketplace_visible", true)
      .then(({ data }) => {
        if (data)
          setLots(
            data.map((lot, index) => ({
              id: lot.lot_code,
              dbId: lot.id,
              crop: lot.crop,
              hi: lot.crop,
              grade: lot.grade,
              qty: Number(lot.quantity_kg),
              price: Number(lot.price_per_kg),
              old: 1,
              warehouse: lot.warehouses?.name || "Warehouse",
              farmer: "",
              dist: "Nearby",
              trend: index === 0 ? 8 : 3,
            })),
          );
      });
  }, [session?.userId, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("farmer_listings")
      .select("id,produce_lot_id,crop,category,description,quantity_kg,price_per_kg,image_url,warehouse_image_url,warehouse_grade,grading_confidence,harvest_date,created_at,warehouses(name)")
      .eq("status", "published")
      .then(({ data }) => {
        if (data)
          setLots((current) => [
            ...current.filter((lot) => !lot.listing && !data.some((listing) => listing.produce_lot_id === lot.dbId)),
            ...data.map((listing, index) => {
              const freshness = freshnessForListing(listing.warehouse_grade, listing.harvest_date, listing.category, listing.crop);
              return {
              id: "LIST-" + listing.id.slice(-6).toUpperCase(),
              listing: true,
              listingId: listing.id,
              dbId: listing.produce_lot_id,
              crop: listing.crop,
              hi: listing.crop,
              grade: freshness.grade,
              qty: Number(listing.quantity_kg),
              price: Number(listing.price_per_kg),
              old: freshness.ageDays,
              warehouse: listing.warehouses?.name || "Verified warehouse intake",
              farmer: "Verified farmer",
              dist: "Direct",
              trend: 0,
              imageUrl: listing.image_url,
              warehouseImageUrl: listing.warehouse_image_url,
              gradingConfidence: listing.grading_confidence,
              description: listing.description,
              category: listing.category,
              harvestDate: listing.harvest_date,
              uploadedAt: listing.created_at,
              freshnessGradeChanged: freshness.perishable && freshness.grade !== listing.warehouse_grade,
            }; }),
          ]);
      });
  }, [session?.userId, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    const requestQuery =
      session.role === "admin"
        ? supabase
            .from("produce_requests")
            .select(
              "id,crop,gross_weight_kg,collection_cluster,request_type,status,profiles(full_name)",
            )
        : supabase
            .from("produce_requests")
            .select(
              "id,crop,gross_weight_kg,collection_cluster,request_type,status",
            )
            .eq("farmer_id", session.userId);
    requestQuery.then(({ data }) => {
      if (data)
        setProduceRequests(
          data.map((r) => ({
            id: r.id,
            crop: r.crop,
            grossWeight: Number(r.gross_weight_kg),
            cluster: r.collection_cluster,
            type:
              r.request_type === "cluster_collection"
                ? "Cluster collection request"
                : "Produce intake",
            status: r.status,
            farmer: r.profiles?.full_name || session.name || "Farmer",
          })),
        );
    });
  }, [session?.userId, session?.role, liveTick]);
  useEffect(() => {
    if (
      !isSupabaseConfigured ||
      !session?.userId ||
      !["admin", "consumer"].includes(session.role)
    )
      return;
    const query =
      session.role === "admin"
        ? supabase
            .from("consumer_orders")
            .select(
              "id,order_code,total_kg,status,cancellation_expires_at,warehouses(name)",
            ).order("created_at", { ascending: false })
        : supabase
            .from("consumer_orders")
            .select(
              "id,order_code,total_kg,status,cancellation_expires_at,warehouses(name)",
            )
            .eq("consumer_id", session.userId)
            .order("created_at", { ascending: false });
    query.then(({ data, error }) => {
      if (error) { notify(`Orders could not be loaded: ${error.message}`); return; }
      if (data)
        setOrders(
          data.map((order) => ({
            id: order.order_code,
            dbId: order.id,
            quantity: Number(order.total_kg),
            items: 0,
            status: (order.status || "pending_verification")
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            cancellationDeadline: order.cancellation_expires_at
              ? new Date(order.cancellation_expires_at).getTime()
              : null,
            pickupWarehouse: order.warehouses?.name || "Warehouse",
          })),
        );
    });
  }, [session?.role, session?.userId, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    const admin = session.role === "admin";
    const bulkQuery = admin
      ? supabase.from("bulk_requests").select("id,crop,quantity_kg,buyer_name,farmer_id,msp_per_kg,status,created_at").order("created_at", { ascending: false })
      : supabase.from("bulk_requests").select("id,crop,quantity_kg,buyer_name,farmer_id,msp_per_kg,status,created_at").or(`buyer_id.eq.${session.userId},farmer_id.eq.${session.userId}`).order("created_at", { ascending: false });
    bulkQuery.then(({ data }) => setBulkRequests(data || []));
    supabase.from("warehouses").select("id,name,address,active").eq("active", true).order("name").then(({ data }) => {
      if (data?.length) setWarehouses(data);
    });
    if (admin) {
      supabase.from("logistics_jobs").select("id,source_type,source_id,details,status,created_at").order("created_at", { ascending: false }).then(({ data }) => setLogisticsJobs(data || []));
    }
  }, [session?.userId, session?.role, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    const channel = supabase
      .channel("farmlink-live-operations")
      .on("postgres_changes", { event: "*", schema: "public", table: "produce_requests" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "consumer_orders" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "bulk_requests" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "logistics_jobs" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "farmer_listings" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "warehouses" }, () => setLiveTick((tick) => tick + 1))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.userId]);
  useEffect(() => {
    const root = document.body;
    if (!root) return;
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
    let pending = false;
    const translate = () => {
      if (!pending) {
        pending = true;
        localizeUI(root, lang);
        pending = false;
      }
    };
    translate();
    const observer = new MutationObserver(translate);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [lang, view]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };
  const reserve = (lot) => {
    if (lot.listing && !lot.warehouseImageUrl) {
      notify(
        "This farmer photo listing is awaiting warehouse intake. Checkout opens once a live grading photo confirms the stock.",
      );
      return;
    }
    const alreadyReserved = cart.reduce((sum, item) => sum + item.quantityKg, 0);
    const quantityKg = Math.min(10, 50 - alreadyReserved, Number(lot.qty));
    if (quantityKg <= 0) {
      notify("A consumer order can contain up to 50 kg. Adjust your cart to add more.");
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.id === lot.id);
      return existing
        ? current.map((item) =>
            item.id === lot.id
              ? { ...item, quantityKg: item.quantityKg + quantityKg }
              : item,
          )
        : [...current, { ...lot, quantityKg }];
    });
    setLots((ls) =>
      ls.map((x) =>
        x.id === lot.id ? { ...x, qty: x.qty - quantityKg } : x,
      ),
    );
    notify(`${quantityKg} kg reserved. Adjust quantity in checkout anytime.`);
  };
  const updateCartQuantity = (lotId, requestedQuantity) => {
    const item = cart.find((entry) => entry.id === lotId);
    if (!item) return;
    const nextQuantity = Math.max(0, Math.floor(Number(requestedQuantity) || 0));
    const otherQuantity = cart
      .filter((entry) => entry.id !== lotId)
      .reduce((sum, entry) => sum + entry.quantityKg, 0);
    if (nextQuantity > 0 && otherQuantity + nextQuantity > 50) {
      notify("The maximum order quantity is 50 kg.");
      return;
    }
    const difference = nextQuantity - item.quantityKg;
    const available = lots.find((lot) => lot.id === lotId)?.qty || 0;
    if (difference > available) {
      notify("That quantity is no longer available in this lot.");
      return;
    }
    setCart((current) =>
      nextQuantity === 0
        ? current.filter((entry) => entry.id !== lotId)
        : current.map((entry) =>
            entry.id === lotId
              ? { ...entry, quantityKg: nextQuantity }
              : entry,
          ),
    );
    setLots((current) =>
      current.map((lot) =>
        lot.id === lotId ? { ...lot, qty: lot.qty - difference } : lot,
      ),
    );
  };
  useEffect(() => {
    const expired = orders.filter(
      (order) =>
        String(order.status).toLowerCase() === "pending verification" &&
        order.cancellationDeadline &&
        now >= order.cancellationDeadline,
    );
    if (!expired.length) return;
    setOrders((current) =>
      current.map((order) =>
        expired.some((item) => item.id === order.id)
          ? { ...order, status: "Confirmed" }
          : order,
      ),
    );
    expired.forEach((order) => {
      if (isSupabaseConfigured && order.dbId)
        supabase.rpc("confirm_expired_consumer_order", { p_order_id: order.dbId }).then(({ error }) => {
          if (!error) setLiveTick((tick) => tick + 1);
        });
    });
  }, [now, orders]);
  const placeOrder = async (pickupWarehouse) => {
    if (placingOrderRef.current || placingOrder || !cart.length) return;
    placingOrderRef.current = true;
    setPlacingOrder(true);
    try {
      const id = `ORD-${String(Date.now()).slice(-6)}`,
        cancellationDeadline = Date.now() + 10 * 60 * 1000;
      const order = {
        id,
        pickupWarehouse,
        items: cart.length,
        quantity: cart.reduce((sum, lot) => sum + lot.quantityKg, 0),
        status: "Pending verification",
        cancellationDeadline,
        lineItems: cart,
      };
      if (isSupabaseConfigured && session?.userId) {
        const { data: warehouse, error: warehouseError } = await supabase
          .from("warehouses")
          .select("id")
          .eq("name", pickupWarehouse)
          .single();
        if (warehouseError) {
          notify("Pickup warehouse could not be found.");
          return;
        }
        const items = cart.map((lot) => ({ lotId: lot.dbId, quantityKg: lot.quantityKg }));
        if (items.some((item) => !item.lotId)) {
          notify("A cart item has not completed warehouse intake yet. Please refresh the marketplace and try again.");
          return;
        }
        const { data: createdId, error } = await supabase.rpc("place_consumer_order", {
          p_order_code: id,
          p_warehouse_id: warehouse.id,
          p_items: items,
          p_cancellation_expires_at: new Date(cancellationDeadline).toISOString(),
        });
        if (error) { notify(error.message); return; }
        order.dbId = createdId;
      }
      setOrders((existing) => [order, ...existing]);
      setCart([]);
      setModal(null);
      notify(
        `Order ${id} is pending verification. You can cancel it for 10 minutes.`,
      );
    } finally {
      placingOrderRef.current = false;
      setPlacingOrder(false);
    }
  };
  const setOrderStatus = async (id, status) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return false;
    if (isSupabaseConfigured && order.dbId) {
      const normalisedStatus = status.toLowerCase().replaceAll(" ", "_");
      const { error } = session?.role === "admin"
        ? await supabase.rpc("admin_set_consumer_order_status", { p_order_id: order.dbId, p_status: normalisedStatus })
        : normalisedStatus === "cancelled"
          ? await supabase.rpc("cancel_consumer_order", { p_order_id: order.dbId })
          : { error: new Error("Only an administrator can update this order status.") };
      if (error) {
        notify(error.message);
        return false;
      }
    }
    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setLiveTick((tick) => tick + 1);
    return true;
  };
  const cancelOrder = async (id) => {
    const order = orders.find((item) => item.id === id);
    if (
      !order ||
      String(order.status).toLowerCase() !== "pending verification" ||
      now >= order.cancellationDeadline
    ) {
      notify("This cancellation window has closed.");
      return;
    }
    if (await setOrderStatus(id, "Cancelled")) {
      notify("Order cancelled. Stock was returned to the live inventory.");
    }
  };
  const confirmOrder = (id) => setOrderStatus(id, "Confirmed");
  const confirmOrderNow = async (id) => {
    const order = orders.find((item) => item.id === id);
    if (!order || String(order.status).toLowerCase() !== "pending verification") return false;
    if (isSupabaseConfigured && order.dbId) {
      const { error } = await supabase.rpc("confirm_consumer_order_now", { p_order_id: order.dbId });
      if (error) { notify(error.message); return false; }
    }
    setOrders((current) => current.map((item) => item.id === id ? { ...item, status: "Confirmed", cancellationDeadline: null } : item));
    setLiveTick((tick) => tick + 1);
    notify("Order confirmed. The cancellation window has been closed and warehouse fulfillment can begin.");
    return true;
  };
  const orderAgain = (id) => {
    const order = orders.find((item) => item.id === id);
    if (!order?.lineItems?.length) {
      notify(
        "This order's items are no longer available. Please choose current marketplace items.",
      );
      return;
    }
    setCart(order.lineItems);
    setView("market");
    notify(
      "Confirmed order added to your cart. Review it and place a new order.",
    );
  };
  const access = (role, destination) => {
    if (destination === "farmer" && !["farmer", "admin"].includes(session?.role)) {
      setAuthRole("farmer");
      setView("auth");
      notify("Please log in with your Farmer ID and OTP to access the farmer dashboard.");
      return;
    }
    if (
      session?.role === "consumer" &&
      ["farmer", "warehouse", "admin"].includes(destination)
    ) {
      setView("market");
      notify("Consumer accounts cannot access farmer or warehouse systems.");
      return;
    }
    if (session?.role === role || session?.role === "admin")
      setView(destination);
    else {
      setView("auth");
      setAuthRole(role);
      notify(`Please sign in as ${role}.`);
    }
  };
  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setCart([]);
    setModal(null);
    setView("home");
    notify("You have logged out.");
  };
  const total = cart.reduce((sum, lot) => sum + lot.quantityKg, 0);
  return (
    <>
      <header>
        <button className="brand" onClick={() => setView("home")}>
          <span>
            <Sprout size={24} />
          </span>
          Farm<span>Link</span>
        </button>
        <nav>
          <button onClick={() => access("consumer", "market")}>
            Marketplace
          </button>
          <button onClick={() => access("consumer", "bulk")}>Wholesale</button>
          {session?.role !== "consumer" && (
            <button onClick={() => access("admin", "warehouse")}>
              Warehouse
            </button>
          )}
          <button onClick={() => access("farmer", "farmer")}>Farmer</button>
        </nav>
        <div className="head-actions">
          <label className="language">
            <Languages size={16} />
            <select
              aria-label="Interface language"
              value={lang}
              onChange={(event) => setLang(event.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
          {session ? (
            <button
              className="profile-btn"
              onClick={() =>
                session.role === "admin"
                  ? setView("admin")
                  : setView(session.role === "farmer" ? "farmer" : "consumer")
              }
            >
              <UserRound size={17} />
              {session.label}
            </button>
          ) : (
            <button className="login-btn" onClick={() => setView("auth")}>
              <UserRound size={17} />
              Sign in
            </button>
          )}
          <span className="logout-wrap">
            {session && (
              <button className="login-btn" onClick={logout}>
                <LogOut size={17} />
                Logout
              </button>
            )}
          </span>
          <button
            className="cart"
            onClick={() => access("consumer", "consumer")}
          >
            <ShoppingCart size={18} />
            {cart.length || ""}
          </button>
        </div>
      </header>
      <main>
        {view === "home" && (
          <Home
            t={t}
            lots={lots}
            setView={setView}
            access={access}
            reserve={reserve}
            setModal={setModal}
          />
        )}{" "}
        {view === "market" && (
          <Market
            lots={lots}
            reserve={reserve}
            cart={cart}
            total={total}
            onCheckout={() => setModal("checkout")}
            notify={notify}
            wishlist={wishlist}
            setWishlist={setWishlist}
            setSelectedLot={setSelectedLot}
            setView={setView}
          />
        )}{" "}
        {view === "detail" && (
          <ProductDetail
            lot={selectedLot}
            reserve={reserve}
            wishlist={wishlist}
            setWishlist={setWishlist}
            setView={setView}
            notify={notify}
          />
        )}{" "}
        {view === "consumer" && (
          <ConsumerHub
            cart={cart}
            wishlist={wishlist}
            lots={lots}
            orders={orders}
            now={now}
            cancelOrder={cancelOrder}
            confirmOrderNow={confirmOrderNow}
            orderAgain={orderAgain}
            setView={setView}
            notify={notify}
          />
        )}{" "}
        {view === "bulk" && (
          <BulkMarket lots={lots} setView={setView} notify={notify} session={session} liveTick={liveTick} setLiveTick={setLiveTick} />
        )}{" "}
        {view === "warehouse" && session?.role === "admin" && (
          <WarehouseView
            session={session}
            lots={lots}
            setLots={setLots}
            produceRequests={produceRequests}
            setProduceRequests={setProduceRequests}
            orders={orders}
            setOrderStatus={setOrderStatus}
            warehouses={warehouses}
            setWarehouses={setWarehouses}
            liveTick={liveTick}
            setLiveTick={setLiveTick}
            notify={notify}
          />
        )}{" "}
        {view === "farmer" && ["farmer", "admin"].includes(session?.role) && (
          <FarmerView
            session={session}
            lots={lots}
            setModal={setModal}
            produceRequests={produceRequests}
            setProduceRequests={setProduceRequests}
            liveTick={liveTick}
            notify={notify}
          />
        )}{" "}
        {view === "auth" && (
          <AuthView initialRole={authRole} setSession={setSession} setView={setView} notify={notify} />
        )}{" "}
        {["privacy", "terms", "disclaimer"].includes(view) && <LegalPage type={view} setView={setView} />}
        {view === "admin" && (
          <>
            <AdminView
              session={session}
              lots={lots}
              orders={orders}
              produceRequests={produceRequests}
              bulkRequests={bulkRequests}
              logisticsJobs={logisticsJobs}
              warehouses={warehouses}
              setOrderStatus={setOrderStatus}
              liveTick={liveTick}
              setLiveTick={setLiveTick}
              setView={setView}
              logout={logout}
              notify={notify}
            />
            <AdminOrderConfirmation
              orders={orders}
              confirmOrder={confirmOrder}
            />
          </>
        )}
      </main>
      <SiteFooter setView={setView} notify={notify} />
      {modal === "voice" && (
        <Voice close={() => setModal(null)} notify={notify} />
      )}{" "}
      {modal === "ai" && <AI close={() => setModal(null)} />}{" "}
      {modal === "checkout" && (
          <Checkout
            cart={cart}
            warehouses={warehouses}
            updateCartQuantity={updateCartQuantity}
            close={() => setModal(null)}
          placeOrder={placeOrder}
          placingOrder={placingOrder}
        />
      )}{" "}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )} 
    </>
  );
}

function SiteFooter({ setView, notify }) {
  const [email, setEmail] = useState("");
  const go = (view) => { setView(view); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const subscribe = (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return notify("Enter a valid email address to subscribe.");
    notify("Thanks — your FarmLink updates subscription has been recorded.");
    setEmail("");
  };
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><div className="brand light"><span><Sprout size={22}/></span>Farm<span>Link</span></div><p>Farm-to-market infrastructure for transparent, traceable trade.</p><div className="footer-socials"><a href="https://www.instagram.com/farmlink_30?stkn=MW5nZGM1NjYzdXh4cw==" target="_blank" rel="noreferrer" aria-label="FarmLink on Instagram">IG</a><a href="https://youtube.com/@farmlink_30?si=q0HJLuXgeHG6ggsb" target="_blank" rel="noreferrer" aria-label="FarmLink on YouTube">▶</a></div></div>
      <div><h3>Explore</h3><button onClick={() => go("market")}>Marketplace</button><button onClick={() => go("bulk")}>Wholesale marketplace</button><button onClick={() => go("farmer")}>Farmer portal</button><button onClick={() => go("warehouse")}>Warehouse operations</button></div>
      <div><h3>Contact</h3><a href="mailto:farmlink30@gmail.com">farmlink30@gmail.com</a><a href="tel:+918209193509">+91 82091 93509</a><p>India · FarmLink SIH 26033</p><button onClick={() => go("disclaimer")}>Platform disclaimer</button></div>
      <div className="newsletter"><h3>Market updates</h3><p>Get updates on FarmLink features, fresh stock and farmer-first initiatives.</p><form onSubmit={subscribe}><input aria-label="Email for FarmLink updates" type="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)}/><button type="submit">Subscribe</button></form></div>
    </div>
    <div className="footer-bottom"><small>© 2026 FarmLink. All rights reserved.</small><div><button onClick={() => go("privacy")}>Privacy Policy</button><button onClick={() => go("terms")}>Terms of Service</button><button onClick={() => go("disclaimer")}>Disclaimer</button></div><button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top <ArrowUp size={15}/></button></div>
  </footer>;
}
function LegalPage({ type, setView }) {
  const content = {
    privacy: { title: "Privacy Policy", intro: "FarmLink collects only the information needed to provide marketplace, fulfillment, and account services.", sections: [["Information we use", "Account details, contact information, farm and listing data, orders, and operational records are used to run the platform and maintain traceability."], ["How we protect it", "Access is role-based, operational data is stored in Supabase, and sensitive actions are restricted to authenticated users."], ["Your choices", "You may request access, correction, or deletion of eligible personal information by contacting farmlink30@gmail.com."]] },
    terms: { title: "Terms of Service", intro: "By using FarmLink, you agree to use the platform lawfully and provide accurate account, listing, and transaction information.", sections: [["Marketplace conduct", "Farmers must provide accurate crop, harvest, price, and quality information. Buyers must submit genuine orders and quotations."], ["Pricing and fulfillment", "MSP or verified price floors are enforced where configured. Final grade, quantity, availability, and fulfillment remain subject to warehouse verification."], ["Accounts", "Keep your login credentials secure. FarmLink may restrict accounts that misuse the platform or compromise marketplace integrity."]] },
    disclaimer: { title: "Platform Disclaimer", intro: "FarmLink is an SIH 2026 demonstration platform and not a lender, insurer, government procurement body, or legal adviser.", sections: [["AI guidance", "AI grading, ranking, route, and price insights are decision-support tools. They are not guarantees of quality, market outcome, delivery, or financial return."], ["Market data", "MSP and price-floor information must be verified against the cited official source. Administrators are responsible for source-backed reference floors for crops without an official MSP."], ["External services", "Maps, social sites, and third-party services are governed by their own terms and availability."]] },
  }[type];
  return <section className="page legal-page"><button className="secondary" onClick={() => setView("home")}>← Back to FarmLink</button><p className="eyebrow green">FARMLINK LEGAL</p><h1>{content.title}</h1><p className="legal-intro">{content.intro}</p>{content.sections.map(([heading, body]) => <article key={heading}><h2>{heading}</h2><p>{body}</p></article>)}<p className="legal-contact">Questions? Contact <a href="mailto:farmlink30@gmail.com">farmlink30@gmail.com</a>.</p></section>;
}
function Home({ t, lots, setView, access, reserve, setModal }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Leaf size={15} />
            {t.tag}
          </p>
          <h1>{t.hero}</h1>
          <p>{t.sub}</p>
          <div className="cta">
            <button
              className="primary"
              onClick={() => access("consumer", "market")}
            >
              {t.shop}
              <ArrowUpRight size={18} />
            </button>
            <button
              className="secondary"
              onClick={() => access("farmer", "farmer")}
            >
              {t.farmer}
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="trust">
            <span>
              <ShieldCheck />
              Traceable lots
            </span>
            <span>
              <ScanLine />
              Human-verified grades
            </span>
          </div>
        </div>
        <div className="hero-card">
          <div className="sun"></div>
          <div className="field">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="floating price">
            <small>MARKET SIGNAL</small>
            <b>Tomato +8%</b>
            <em>High demand nearby</em>
          </div>
          <div className="floating stock">
            <PackageCheck />
            <div>
              <b>2,510 kg</b>
              <small>available today</small>
            </div>
          </div>
          <div className="produce tomato">●</div>
          <div className="produce onion">●</div>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow green">LIVE FROM NEARBY WAREHOUSES</p>
            <h2>{t.stock}</h2>
          </div>
          <button
            className="text-btn"
            onClick={() => access("consumer", "market")}
          >
            View marketplace <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="cards">
          {lots.map((l) => (
            <LotCard key={l.id} lot={l} onClick={() => reserve(l)} />
          ))}
        </div>
      </section>
      <section className="impact">
        <div>
          <p className="eyebrow">ONE CONNECTED FLOW</p>
          <h2>
            Less uncertainty.
            <br />
            More choice.
          </h2>
          <p>
            FarmLink joins physical aggregation with market intelligence so
            produce moves with clarity, not pressure.
          </p>
          <button className="outline" onClick={() => setModal("ai")}>
            <BrainCircuit size={18} />
            {t.ai}
          </button>
        </div>
        <div className="flow">
          <Flow
            n="1"
            icon={<Truck />}
            title="Cluster pickup"
            text="Village & FPO collection"
          />
          <Flow
            n="2"
            icon={<Warehouse />}
            title="Warehouse intake"
            text="Weigh, grade & store"
          />
          <Flow
            n="3"
            icon={<BrainCircuit />}
            title="AI guidance"
            text="Price, demand & stock-age"
          />
          <Flow
            n="4"
            icon={<ShoppingCart />}
            title="Market access"
            text="Consumer & bulk buyers"
          />
        </div>
      </section>
      <section className="voice-banner">
        <div className="mic">
          <Mic size={34} />
        </div>
        <div>
          <p className="eyebrow">{t.voice.toUpperCase()}</p>
          <h2>Ask in your own language.</h2>
          <p>Call, speak, and get guided help with stock, prices or pickups.</p>
        </div>
        <button className="primary pale" onClick={() => setModal("voice")}>
          Try voice demo <Mic size={18} />
        </button>
      </section>
    </>
  );
}
function LotCard({ lot, onClick }) {
  return (
    <article className="lot">
      <div className={"lot-img " + lot.crop.toLowerCase()}>
        {lot.imageUrl ? (
          <img src={lot.imageUrl} alt={lot.crop + " grown by " + lot.farmer} />
        ) : (
          <span>{cropEmoji(lot.crop, lot.category)}</span>
        )}
        <i className="crop-emoji-badge" aria-label={`${lot.crop} crop icon`}>{cropEmoji(lot.crop, lot.category)}</i>
        <b>{lot.listing ? "Farmer photo" : "Grade " + lot.grade}</b>
      </div>
      <div className="lot-body">
        <div className="lot-title">
          <div>
            <h3>{lot.crop}</h3>
            <p>
              <MapPin size={14} />
              {lot.warehouse} · {lot.dist}
            </p>
          </div>
          <span className={lot.trend >= 0 ? "up" : "down"}>
            {lot.trend >= 0 ? "↑" : ""}
            {lot.trend}%
          </span>
        </div>
        <div className="lot-meta">
          <span>{lot.qty} kg available</span>
          <span>
            <Clock3 size={14} />
            {lot.harvestDate ? `Harvested ${new Date(`${lot.harvestDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${lot.old} day${lot.old === 1 ? "" : "s"} fresh` : `${lot.old} day old`}
          </span>
        </div>
        {lot.harvestDate && <small className="freshness-metric">Freshness: Grade {lot.grade}{lot.freshnessGradeChanged ? " · adjusted by harvest age" : " · intake verified"}</small>}
        <div className="buy">
          <b>
            ₹{lot.price}
            <small>/kg</small>
          </b>
          <button onClick={onClick}>Reserve 10 kg</button>
        </div>
      </div>
    </article>
  );
}
function Flow({ n, icon, title, text }) {
  return (
    <div className="flow-item">
      <span>{n}</span>
      <i>{icon}</i>
      <div>
        <b>{title}</b>
        <small>{text}</small>
      </div>
    </div>
  );
}
function Market({
  lots,
  reserve,
  cart,
  total,
  onCheckout,
  notify,
  wishlist,
  setWishlist,
  setSelectedLot,
  setView,
}) {
  const [filter, setFilter] = useState("All"),
    [grade, setGrade] = useState("Any"),
    [organic, setOrganic] = useState(false),
    [sort, setSort] = useState("smart"),
    [query, setQuery] = useState("");
  const cropCategories = useMemo(
    () => [...new Set(lots.map((lot) => lot.crop).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [lots],
  );
  useEffect(() => {
    if (filter !== "All" && !cropCategories.includes(filter)) setFilter("All");
  }, [cropCategories, filter]);
  const visible = useMemo(
    () =>
      lots
        .filter(
          (l) =>
            (filter === "All" || l.crop === filter) &&
            (grade === "Any" || l.grade === grade) &&
            (!query || l.crop.toLowerCase().includes(query.toLowerCase())),
        )
        .sort((a, b) =>
          sort === "price"
            ? a.price - b.price
            : sort === "distance"
              ? parseInt(a.dist) - parseInt(b.dist)
              : b.trend * 3 +
                a.qty / 100 -
                a.price / 10 -
                (a.trend * 3 + b.qty / 100 - b.price / 10),
        ),
    [lots, filter, grade, sort, query],
  );
  const favorite = (lot) => {
    setWishlist((items) =>
      items.some((x) => x.id === lot.id)
        ? items.filter((x) => x.id !== lot.id)
        : [...items, lot],
    );
    notify(
      wishlist.some((x) => x.id === lot.id)
        ? "Removed from wishlist."
        : "Saved to wishlist.",
    );
  };
  return (
    <section className="page">
      <div className="page-top">
        <div>
          <p className="eyebrow green">FRESH PRODUCE MARKETPLACE</p>
          <h1>Local market, live stock.</h1>
          <p>
            Smart-ranked by quality, proximity and price competitiveness. Every
            live lot has a traceable quality record.
          </p>
        </div>
        <div className="checkout">
          <b>
            {cart.length} items · {total} kg
          </b>
          <button
            className="primary"
            disabled={!cart.length}
            onClick={onCheckout}
          >
            Checkout
          </button>
        </div>
      </div>
      <div className="market-tools">
        <input
          aria-label="Search produce"
          placeholder="Search produce, farmer or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option>Any</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="smart">AI smart ranking</option>
          <option value="price">Lowest price</option>
          <option value="distance">Nearest first</option>
        </select>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={organic}
            onChange={(e) => setOrganic(e.target.checked)}
          />{" "}
          Organic certified
        </label>
      </div>
      <div className="filters crop-category-bar" aria-label="Produce categories">
        {["All", ...cropCategories].map((x) => (
          <button
            key={x}
            className={filter === x ? "selected" : ""}
            onClick={() => setFilter(x)}
          >
            {x === "All" ? <><span className="category-all">✦</span> All produce <small>{lots.length}</small></> : <><span className="category-icon">{cropEmoji(x)}</span><span>{x}</span><small>{lots.filter((lot) => lot.crop === x).length}</small></>}
          </button>
        ))}
      </div>
      <p className="search-note">
        <BrainCircuit size={16} /> AI ranking considers verified grade,
        distance, price and stock freshness.{" "}
        {organic && " No organic-certified demo lots are currently available."}
      </p>
      <div className="cards">
        {visible
          .filter(() => !organic)
          .map((l) => (
            <div className="product-wrap" key={l.id}>
              <LotCard lot={l} onClick={() => reserve(l)} />
              <div className="product-actions">
                <button
                  onClick={() => {
                    setSelectedLot(l);
                    setView("detail");
                  }}
                >
                  Quality report
                </button>
                <button
                  className={
                    wishlist.some((x) => x.id === l.id)
                      ? "favorite active"
                      : "favorite"
                  }
                  onClick={() => favorite(l)}
                >
                  ♡ Save
                </button>
              </div>
            </div>
          ))}
      </div>
      {!visible.filter(() => !organic).length && (
        <p className="empty-state">
          No lots match these filters. Try clearing the organic or grade filter.
        </p>
      )}
      <div className="bulk">
        <div>
          <PackageCheck />
          <div>
            <h3>Buying in bulk?</h3>
            <p>
              Request GST-ready quotes, negotiate with verified farmers, and
              arrange recurring contracts.
            </p>
          </div>
        </div>
        <button className="primary" onClick={() => setView("bulk")}>
          Open wholesale marketplace
        </button>
      </div>
    </section>
  );
}
function ProductDetail({
  lot,
  reserve,
  wishlist,
  setWishlist,
  setView,
  notify,
}) {
  if (!lot)
    return (
      <section className="page">
        <button className="secondary" onClick={() => setView("market")}>
          Back to marketplace
        </button>
      </section>
    );
  const saved = wishlist.some((x) => x.id === lot.id);
  return (
    <section className="page product-detail">
      <button className="text-btn" onClick={() => setView("market")}>
        ← Back to marketplace
      </button>
      <div className="detail-grid">
        <div className={"detail-visual " + lot.crop.toLowerCase()}>
          {lot.imageUrl ? (
            <img src={lot.imageUrl} alt={lot.crop + " listing"} />
          ) : (
            cropEmoji(lot.crop, lot.category)
          )}
          <i className="crop-emoji-badge detail-crop-emoji" aria-label={`${lot.crop} crop icon`}>{cropEmoji(lot.crop, lot.category)}</i>
          <span>
            {lot.listing
              ? "Farmer photo listing"
              : "Verified Grade " + lot.grade}
          </span>
        </div>
        <div>
          <p className="eyebrow green">TRACEABLE LOT {lot.id}</p>
          <h1>
            {lot.crop} · Grade {lot.grade}
          </h1>
          <p>
            Harvested locally and human-verified at {lot.warehouse}. Available
            for scheduled pickup.
          </p>
          <h2>
            ₹{lot.price}
            <small>/kg</small>
          </h2>
          <div className="quality-report">
            <div>
              <b>91%</b>
              <small>AI grade confidence</small>
            </div>
            <div>
              <b>{lot.dist}</b>
              <small>From warehouse</small>
            </div>
            <div>
              <b>{lot.harvestDate ? `${lot.old} day${lot.old === 1 ? "" : "s"}` : `${lot.old} day`}</b>
              <small>{lot.harvestDate ? `Fresh since ${new Date(`${lot.harvestDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Stock age"}</small>
            </div>
          </div>
          {lot.uploadedAt && <p className="freshness-detail">Listed on {new Date(lot.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. {lot.freshnessGradeChanged ? "This perishable item’s displayed grade has been adjusted for harvest age." : "Freshness grade is monitored from the recorded harvest date."}</p>}
          <div className="detail-actions">
            <button className="primary" onClick={() => reserve(lot)}>
              Add 10 kg to cart
            </button>
            <button
              className="secondary"
              onClick={() => {
                setWishlist((items) =>
                  saved
                    ? items.filter((x) => x.id !== lot.id)
                    : [...items, lot],
                );
                notify(saved ? "Removed from wishlist." : "Saved to wishlist.");
              }}
            >
              {saved ? "Saved to wishlist" : "Save to wishlist"}
            </button>
          </div>
        </div>
      </div>
      <div className="detail-sections">
          <article>
            <h3>Quality report</h3>
            <p>
              Visual defects: low · Size uniformity: high · Maturity: optimal.
              This AI-assisted report is reviewed by the intake operator before
              listing.
            </p>
            {lot.warehouseImageUrl && <><img className="intake-proof-photo" src={lot.warehouseImageUrl} alt={`${lot.crop} photographed during warehouse grading`} /><small>Live warehouse intake photo · Grade {lot.grade}{lot.gradingConfidence ? ` · ${lot.gradingConfidence}% AI confidence` : ""}</small></>}
          </article>
        <article>
          <h3>Farmer profile</h3>
          <p>
            {lot.farmer || "Verified FarmLink producer"} · Nearby farmer cluster
            · Produce handled through transparent warehouse grading.
          </p>
        </article>
        <article>
          <h3>Nutritional information</h3>
          <p>
            Fresh {lot.crop.toLowerCase()} is a source of fibre and essential
            micronutrients. Store cool and consume promptly.
          </p>
        </article>
      </div>
    </section>
  );
}
function ConsumerHub({
  cart,
  wishlist,
  lots,
  orders,
  now,
  cancelOrder,
  confirmOrderNow,
  orderAgain,
  setView,
  notify,
}) {
  const [tab, setTab] = useState("orders"),
    [review, setReview] = useState(""),
    [confirmingOrder, setConfirmingOrder] = useState(null);
  const countdown = (deadline) => {
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };
  return (
    <section className="page">
      <div className="page-top">
        <div>
          <p className="eyebrow green">CONSUMER ACCOUNT</p>
          <h1>Orders, favourites & preferences</h1>
          <p>
            Track pickup status, maintain delivery preferences, and share
            verified purchase feedback.
          </p>
        </div>
        <button className="secondary" onClick={() => setView("market")}>
          Continue shopping
        </button>
      </div>
      <div className="tabs">
        {["orders", "wishlist", "profile", "reviews"].map((x) => (
          <button
            className={tab === x ? "selected" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      {tab === "orders" && (
        <div className="account-panel">
          <h3>Order tracking</h3>
          {orders.length ? (
            orders.map((order) => {
              const canCancel =
                String(order.status).toLowerCase() === "pending verification" &&
                order.cancellationDeadline &&
                now < order.cancellationDeadline;
              return (
                <div className="tracking" key={order.id}>
                  <b>{order.id}</b>
                  <span>{order.status}</span>
                  <span>Pickup at {order.pickupWarehouse}</span>
                  {canCancel ? (
                    <>
                      <strong>
                        Cancel within {countdown(order.cancellationDeadline)}
                      </strong>
                      <small>
                        Your order is pending verification. You can cancel it
                        during this 10-minute window.
                      </small>
                      <button onClick={() => cancelOrder(order.id)}>
                        Cancel order
                      </button>
                      <button className="primary" onClick={() => setConfirmingOrder(order)}>
                        Confirm now
                      </button>
                    </>
                  ) : (
                    <>
                      <strong>
                        {order.status === "Confirmed"
                          ? "Order confirmed"
                          : order.status}
                      </strong>
                      {order.status === "Confirmed" && (
                        <button onClick={() => orderAgain(order.id)}>
                          Order again
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p className="empty-state">
              No orders yet. Your pickup orders will appear here.
            </p>
          )}
        </div>
      )}
      {tab === "wishlist" && (
        <div className="cards">
          {wishlist.length ? (
            wishlist.map((l) => (
              <LotCard
                key={l.id}
                lot={l}
                onClick={() =>
                  notify("Open the product page to add this lot to cart.")
                }
              />
            ))
          ) : (
            <p className="empty-state">
              Your wishlist is empty. Save products from the marketplace to find
              them here.
            </p>
          )}
        </div>
      )}
      {tab === "profile" && (
        <div className="account-panel form-grid">
          <h3>Profile & delivery preferences</h3>
          <label>
            Primary address
            <input defaultValue="Jaipur, Rajasthan" />
          </label>
          <label>
            Mobile number
            <input defaultValue="+91 98XXXXXX12" />
          </label>
          <label>
            Preferred pickup window
            <select>
              <option>10 AM – 1 PM</option>
              <option>2 PM – 6 PM</option>
            </select>
          </label>
          <button
            className="primary"
            onClick={() =>
              notify(
                "Profile preferences saved locally. Connect this form to the Supabase profile update in the next backend iteration.",
              )
            }
          >
            Save preferences
          </button>
        </div>
      )}
      {tab === "reviews" && (
        <div className="account-panel">
          <h3>Reviews & ratings</h3>
          <p>
            Only verified purchasers can submit a review. Your feedback is shown
            after moderation.
          </p>
          <textarea
            placeholder="Share feedback about your recent produce order"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button
            className="primary"
            onClick={() => {
              setReview("");
              notify("Review submitted for moderation.");
            }}
          >
            Submit verified review
          </button>
        </div>
      )}
      {confirmingOrder && <div className="confirm-order-back" role="dialog" aria-modal="true" aria-labelledby="confirm-order-title"><div className="confirm-order-card"><p className="eyebrow green">CONFIRM ORDER NOW</p><h2 id="confirm-order-title">Skip the cancellation window?</h2><p>You are confirming <b>{confirmingOrder.id}</b> for pickup at <b>{confirmingOrder.pickupWarehouse}</b>. Once confirmed, this order cannot be cancelled from your account and fulfillment can begin immediately.</p><div><button className="secondary" onClick={() => setConfirmingOrder(null)}>Keep cancellation window</button><button className="primary" onClick={async () => { if (await confirmOrderNow(confirmingOrder.id)) setConfirmingOrder(null); }}>Yes, confirm order</button></div></div></div>}
    </section>
  );
}
function AdminOrderConfirmation({ orders, confirmOrder }) {
  const pending = orders.filter(
    (order) => order.status === "Pending verification",
  );
  return (
    <section className="page">
      <div className="account-panel">
        <p className="eyebrow green">ORDER VERIFICATION</p>
        <h2>Consumer orders pending verification</h2>
        {pending.length ? (
          pending.map((order) => (
            <div className="tracking" key={order.id}>
              <b>{order.id}</b>
              <span>
                {order.quantity} kg · {order.pickupWarehouse}
              </span>
              <strong>Pending verification</strong>
              <button
                className="primary"
                onClick={() => confirmOrder(order.id)}
              >
                Confirm order
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">
            No orders are awaiting manual verification.
          </p>
        )}
      </div>
    </section>
  );
}
function BulkMarket({ lots, setView, notify, session, liveTick, setLiveTick }) {
  const [tab, setTab] = useState("discover"),
    [quote, setQuote] = useState(false),
    [cropQuery, setCropQuery] = useState(""),
    [quantity, setQuantity] = useState(250),
    [offer, setOffer] = useState(""),
    [myQuotes, setMyQuotes] = useState([]),
    [contract, setContract] = useState({ crop: "Tomato", quantity: 250, frequency: "Weekly", delivery: "Monday · 10 AM – 1 PM", price: "" }),
    [contracts, setContracts] = useState([]);
  const visibleLots = lots.filter((lot) =>
    lot.crop.toLowerCase().includes(cropQuery.trim().toLowerCase()),
  );
  useEffect(() => {
    if (!session?.userId || !isSupabaseConfigured) return;
    supabase.from("bulk_requests").select("id,crop,quantity_kg,status,created_at,bulk_quotes(offered_price_per_kg,proposed_by,status)").eq("buyer_id", session.userId).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error) setMyQuotes(data || []);
    });
  }, [session?.userId, liveTick]);
  const openQuote = (lot) => {
    setQuote(lot); setQuantity(Math.max(250, Math.min(Number(lot.qty) || 250, 1000))); setOffer(String(lot.price)); setTab("quotes");
  };
  const sendQuote = async () => {
    if (!quote) return;
    const kg = Number(quantity), price = Number(offer || quote.price);
    if (kg < 250) return notify("Bulk requests must be at least 250 kg.");
    if (!session?.userId || !isSupabaseConfigured) return notify("Sign in with a wholesale buyer account to send a live quote.");
    try {
      const { data: request, error } = await supabase.from("bulk_requests").insert({
        buyer_id: session.userId, buyer_name: session.name || session.label || "Bulk buyer",
        crop: quote.crop, quantity_kg: kg, status: "pending",
        ...(quote.listingId ? { listing_id: quote.listingId } : {}),
      }).select("id").single();
      if (error) throw error;
      const { error: offerError } = await supabase.from("bulk_quotes").insert({ request_id: request.id, offered_price_per_kg: price, proposed_by: "buyer" });
      if (offerError) throw offerError;
      notify(`Quote request for ${kg} kg and your ₹${price}/kg offer were sent for admin verification.`);
      setQuote(false); setTab("quotes"); setLiveTick((tick) => tick + 1);
    } catch (error) { notify(error.message || "Unable to create the bulk request."); }
  };
  const createContract = async (event) => {
    event.preventDefault();
    const kg = Number(contract.quantity), price = Number(contract.price);
    if (kg < 250) return notify("Recurring contract quantities must be at least 250 kg.");
    if (!price || price <= 0) return notify("Enter a proposed price per kg for the contract.");
    if (!session?.userId || !isSupabaseConfigured) return notify("Sign in before creating a contract request.");
    try {
      const { data: request, error } = await supabase.from("bulk_requests").insert({ buyer_id: session.userId, buyer_name: `${session.name || session.label || "Bulk buyer"} · ${contract.frequency} contract`, crop: contract.crop, quantity_kg: kg, status: "pending" }).select("id").single();
      if (error) throw error;
      const { error: quoteError } = await supabase.from("bulk_quotes").insert({ request_id: request.id, offered_price_per_kg: price, proposed_by: "buyer" });
      if (quoteError) throw quoteError;
      setContracts((current) => [{ id: request.id, ...contract, status: "Awaiting admin verification & farmer approval" }, ...current]);
      notify("Recurring contract request created. Admin will assign it to a farmer for approval."); setLiveTick((tick) => tick + 1);
    } catch (error) { notify(error.message || "Unable to create the contract request."); }
  };
  return (
    <section className="page">
      <div className="page-top">
        <div>
          <p className="eyebrow green">VERIFIED WHOLESALE MARKETPLACE</p>
          <h1>Buy better, in bulk.</h1>
          <p>
            Discover verified suppliers, request quality samples, negotiate
            transparent quotes, and manage recurring contracts.
          </p>
        </div>
        <button className="secondary" onClick={() => setView("market")}>
          Retail marketplace
        </button>
      </div>
      <div className="tabs">
        {["discover", "quotes", "contracts", "analytics", "invoices"].map(
          (x) => (
            <button
              className={tab === x ? "selected" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ),
        )}
      </div>
      {tab === "discover" && (
        <>
          <div className="market-tools">
            <input
              aria-label="Search wholesale crops"
              placeholder="Search crop"
              value={cropQuery}
              onChange={(event) => setCropQuery(event.target.value)}
            />
            <select>
              <option>All regions</option>
              <option>Jaipur region</option>
            </select>
            <select>
              <option>All certifications</option>
              <option>Organic</option>
              <option>Grade A verified</option>
            </select>
          </div>
          <div className="cards">
            {visibleLots.map((l) => (
              <div className="product-wrap" key={l.id}>
                <LotCard lot={l} onClick={() => openQuote(l)} />
                <div className="product-actions">
                  <button onClick={() => openQuote(l)}>
                    Request sample / quote
                  </button>
                  <button
                    onClick={() =>
                      notify("AI grading report opened for buyer review.")
                    }
                  >
                    AI quality report
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!visibleLots.length && (
            <p className="empty-state">No wholesale crops match this search.</p>
          )}
        </>
      )}
      {tab === "quotes" && (
        <div className="account-panel">
          <h3>Negotiation & quote workspace</h3>
          {quote ? (
            <div className="quote-card">
              <b>
                {quote.crop}, Grade {quote.grade} · {quote.qty} kg available
              </b>
              <p>
                Suggested opening quote: ₹{quote.price - 2}/kg for 100 kg+.
                Farmer receives every offer and remains free to accept, counter,
                or decline.
              </p>
              <label>
                Quantity (minimum 250 kg)
                <input type="number" min="250" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </label>
              <label>
                Your proposed price per kg
                <input type="number" min="0" value={offer} placeholder={String(quote.price)} onChange={(e) => setOffer(e.target.value)} />
              </label>
              <button
                className="primary"
                onClick={sendQuote}
              >
                Send negotiated quote
              </button>
            </div>
          ) : (
            <div><p className="empty-state">Choose a produce listing from Discover to start an RFQ.</p>{myQuotes.map((item) => { const buyerOffer = item.bulk_quotes?.filter((entry) => entry.proposed_by === "buyer").at(-1); const farmerCounter = item.bulk_quotes?.filter((entry) => entry.proposed_by === "farmer" && entry.status === "proposed").at(-1); return <div className="tracking" key={item.id}><b>{item.crop} · {item.quantity_kg} kg</b><span>Your offer: {buyerOffer ? `₹${buyerOffer.offered_price_per_kg}/kg` : "pending"}{farmerCounter ? ` · Farmer counter: ₹${farmerCounter.offered_price_per_kg}/kg` : ""}</span><strong>{item.status}</strong></div>; })}</div>
          )}
        </div>
      )}
      {tab === "contracts" && (
        <div className="account-panel">
          <h3>Contract orders</h3>
          <p>
            Create recurring purchase agreements with clear quantity, grade,
            delivery window, pricing method and cancellation terms.
          </p>
          <form className="form-grid" onSubmit={createContract}>
            <label>Crop<select value={contract.crop} onChange={(e) => setContract({ ...contract, crop: e.target.value })}>{INDIA_CROPS.map((crop) => <option key={crop.name}>{cropEmoji(crop.name, crop.category)} {crop.name}</option>)}</select></label>
            <label>Quantity per delivery (minimum 250 kg)<input required type="number" min="250" value={contract.quantity} onChange={(e) => setContract({ ...contract, quantity: e.target.value })}/></label>
            <label>Frequency<select value={contract.frequency} onChange={(e) => setContract({ ...contract, frequency: e.target.value })}><option>Weekly</option><option>Fortnightly</option><option>Monthly</option></select></label>
            <label>Delivery window<input required value={contract.delivery} onChange={(e) => setContract({ ...contract, delivery: e.target.value })}/></label>
            <label>Proposed price per kg<input required type="number" min="1" value={contract.price} onChange={(e) => setContract({ ...contract, price: e.target.value })}/></label>
            <button className="primary" type="submit">Create contract request</button>
          </form>
          {contracts.map((item) => <div className="contract-row" key={item.id}><b>{item.frequency} {item.crop} supply</b><span>{item.quantity} kg per delivery · ₹{item.price}/kg</span><span>{item.status}</span></div>)}
        </div>
      )}
      {tab === "analytics" && (
        <div className="metric-grid">
          <Metric
            icon={<BarChart3 />}
            label="30-day spend"
            value="₹48,600"
            note="8% lower than previous period"
          />
          <Metric
            icon={<Users />}
            label="Active suppliers"
            value="6"
            note="4 high-performing suppliers"
          />
          <Metric
            icon={<PackageCheck />}
            label="Orders fulfilled"
            value="28"
            note="96% on-time performance"
          />
          <Metric
            icon={<BrainCircuit />}
            label="Cost saving insight"
            value="₹4,120"
            note="From negotiated seasonal lots"
          />
        </div>
      )}
      {tab === "invoices" && (
        <div className="account-panel">
          <h3>GST-compliant invoice centre</h3>
          <p>
            Generated invoices include supplier and buyer GSTIN, line items, tax
            breakdown, warehouse handoff and order references.
          </p>
          <div className="contract-row">
            <b>INV-FL-2026-0148</b>
            <span>₹18,750</span>
            <span>GST ready</span>
            <button
              onClick={() => notify("GST invoice generated for download.")}
            >
              Generate PDF
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
function WarehouseView({
  session,
  lots,
  setLots,
  produceRequests,
  setProduceRequests,
  orders,
  setOrderStatus,
  warehouses,
  setWarehouses,
  liveTick,
  setLiveTick,
  notify,
}) {
  const [form, setForm] = useState({
    crop: "Tomato",
    weight: "350",
    grade: "A",
    warehouse: warehouses[0]?.name || "Jaipur North",
    listingId: "",
  });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", address: "" });
  const [scheduledListings, setScheduledListings] = useState([]);
  const [warehousePhoto, setWarehousePhoto] = useState(null);
  const [warehousePreview, setWarehousePreview] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingListing, setRejectingListing] = useState(false);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from("farmer_listings").select("id,farmer_id,crop,category,description,quantity_kg,price_per_kg,image_url,intake_warehouse_id,harvest_date,warehouses(name),profiles(full_name)").eq("status", "scheduled").order("scheduled_at", { ascending: true }).then(({ data, error }) => {
      if (error) notify(error.message); else setScheduledListings(data || []);
    });
  }, [liveTick]);
  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => {
    if (cameraActive && cameraVideoRef.current && cameraStreamRef.current) cameraVideoRef.current.srcObject = cameraStreamRef.current;
  }, [cameraActive]);
  const stopLiveCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
  };
  const startLiveCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return notify("Live camera is not supported in this browser. Use the camera upload field instead.");
    try {
      stopLiveCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) { notify("Camera access is needed for a live warehouse grading photo. You can use the camera upload field if permission is unavailable."); }
  };
  const captureLivePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video?.videoWidth) return notify("Wait for the camera preview, then capture the live photo.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return notify("Live photo could not be captured.");
      const photo = new File([blob], `warehouse-live-${Date.now()}.jpg`, { type: "image/jpeg" });
      setWarehousePhoto(photo); setWarehousePreview(URL.createObjectURL(photo)); stopLiveCamera();
    }, "image/jpeg", 0.9);
  };
  const submit = async (e) => {
    e.preventDefault();
    let id = `FL-${24094 + lots.length}`;
    const newLot = {
      id,
      crop: form.crop,
      hi: form.crop,
      grade: form.grade,
      qty: +form.weight,
      price: form.crop === "Tomato" ? 27 : 25,
      old: 0,
      warehouse: form.warehouse,
      farmer: "Demo Farmer",
      dist: "0 km",
      trend: 4,
    };
    if (isSupabaseConfigured && session?.userId) {
      const { data: warehouse, error: warehouseError } = await supabase
        .from("warehouses")
        .select("id")
        .eq("name", form.warehouse)
        .single();
      if (warehouseError) {
        notify("Warehouse could not be found.");
        return;
      }
      const { data, error } = await supabase
        .from("produce_lots")
        .insert({
          lot_code: id,
          crop: form.crop,
          grade: form.grade,
          quantity_kg: newLot.qty,
          price_per_kg: newLot.price,
          warehouse_id: warehouse.id,
        })
        .select("id")
        .single();
      if (error) {
        notify(error.message);
        return;
      }
      newLot.dbId = data.id;
    }
    setLots([...lots, newLot]);
    notify(`Lot ${id} recorded with an immutable intake event.`);
  };
  const receiveRequest = async (request) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("produce_requests")
        .update({ status: "received" })
        .eq("id", request.id);
      if (error) return notify(error.message);
    }
    setProduceRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? { ...item, status: "Received at warehouse" }
          : item,
      ),
    );
    notify(`${request.crop} intake marked received.`);
  };
  const confirmScheduledIntake = async () => {
    const listing = scheduledListings.find((item) => item.id === form.listingId);
    if (!listing) return notify("Select a scheduled farmer listing.");
    if (!warehousePhoto) { await startLiveCamera(); return notify("Capture the required live warehouse photo before confirming intake."); }
    try {
      const extension = (warehousePhoto.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
      const path = `${session.userId}/warehouse-intake/${listing.id}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("produce-photos").upload(path, warehousePhoto, { contentType: warehousePhoto.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("produce-photos").getPublicUrl(path);
      const { data: lot, error: lotError } = await supabase.from("produce_lots").insert({ lot_code: `FL-${String(Date.now()).slice(-8)}`, farmer_id: listing.farmer_id, crop: listing.crop, grade: form.grade, quantity_kg: listing.quantity_kg, price_per_kg: listing.price_per_kg, warehouse_id: listing.intake_warehouse_id }).select("id").single();
      if (lotError) throw lotError;
      const { error } = await supabase.from("farmer_listings").update({ status: "published", produce_lot_id: lot.id, warehouse_image_url: urlData.publicUrl, warehouse_grade: form.grade, grading_confidence: 91, intake_confirmed_at: new Date().toISOString(), reviewed_at: new Date().toISOString() }).eq("id", listing.id);
      if (error) throw error;
      setScheduledListings((current) => current.filter((item) => item.id !== listing.id));
      setForm({ ...form, listingId: "", grade: "A" }); setWarehousePhoto(null); setWarehousePreview(""); setLiveTick((tick) => tick + 1);
      notify(`${listing.crop} intake confirmed. The farmer photo and warehouse AI-grade photo are now live in the marketplace.`);
    } catch (error) { notify(error.message || "Warehouse intake confirmation failed."); }
  };
  const rejectScheduledIntake = async () => {
    const listing = scheduledListings.find((item) => item.id === form.listingId);
    if (!listing) return notify("Select a scheduled farmer listing before rejecting it.");
    if (!rejectionReason.trim()) return notify("Enter a clear rejection reason for the farmer.");
    const { error } = await supabase.from("farmer_listings").update({ status: "rejected", warehouse_rejection_reason: rejectionReason.trim(), warehouse_rejected_at: new Date().toISOString() }).eq("id", listing.id);
    if (error) return notify(error.message);
    stopLiveCamera();
    setScheduledListings((current) => current.filter((item) => item.id !== listing.id));
    setForm({ ...form, listingId: "" }); setRejectionReason(""); setRejectingListing(false); setWarehousePhoto(null); setWarehousePreview(""); setLiveTick((tick) => tick + 1);
    notify(`${listing.crop} intake was rejected. The farmer has been notified with the warehouse reason.`);
  };
  return (
    <section className="page warehouse-page">
      <div className="page-top">
        <div>
          <p className="eyebrow green">ADMIN-ONLY WAREHOUSE CONSOLE</p>
          <h1>Warehouse intake & fulfillment</h1>
          <p>
            Confirm collection weight, complete grading, manage stock and
            prepare consumer pickup orders.
          </p>
        </div>
        <div className="secure">
          <ShieldCheck /> Admin access only
        </div>
      </div>
      <section className="warehouse-command">
        <div><small>INTAKE QUEUE</small><b>{scheduledListings.length}</b><span>farmer listings awaiting inspection</span></div>
        <div><small>LIVE INVENTORY</small><b>{lots.reduce((sum, lot) => sum + Number(lot.qty || 0), 0)} kg</b><span>visible verified warehouse stock</span></div>
        <div><small>PICKUP ORDERS</small><b>{orders.filter((order) => !["Cancelled", "Completed"].includes(order.status)).length}</b><span>active consumer fulfillment tasks</span></div>
        <div><small>OPERATOR STANDARD</small><b>Photo + grade</b><span>every intake gets a live proof image</span></div>
      </section>
      <div className="warehouse-grid">
        <div className="intake warehouse-intake-panel">
          <div className="warehouse-panel-head"><div><p className="eyebrow green">SCHEDULED FARMER LISTINGS</p><h3>Live intake verification</h3><small>Compare the farmer’s original image with a required live warehouse capture.</small></div><span>Step 1 of 3</span></div>
          <label>Listing scheduled by admin
            <select value={form.listingId} onChange={(event) => {
              const listing = scheduledListings.find((item) => item.id === event.target.value);
              setForm({ ...form, listingId: event.target.value, crop: listing?.crop || form.crop, weight: listing?.quantity_kg || form.weight, warehouse: listing?.warehouses?.name || form.warehouse });
              setWarehousePhoto(null); setWarehousePreview(""); setRejectingListing(false); setRejectionReason("");
              if (event.target.value) startLiveCamera(); else stopLiveCamera();
            }}>
              <option value="">Choose scheduled listing</option>
              {scheduledListings.map((listing) => <option key={listing.id} value={listing.id}>{cropEmoji(listing.crop, listing.category)} {listing.crop} · {listing.quantity_kg} kg · {listing.warehouses?.name || "Warehouse"}</option>)}
            </select>
          </label>
          {form.listingId && <div className="intake-image-compare"><figure><img className="intake-photo-preview" src={scheduledListings.find((item) => item.id === form.listingId)?.image_url} alt="Farmer submitted produce"/><figcaption>Farmer listing photo</figcaption></figure><figure>{warehousePreview ? <img className="intake-photo-preview" src={warehousePreview} alt="Warehouse grading capture preview"/> : cameraActive ? <video ref={cameraVideoRef} className="intake-photo-preview live-camera" autoPlay playsInline muted/> : <div className="camera-empty"><ScanLine size={24}/><span>Live camera capture required</span></div>}<figcaption>{warehousePreview ? "Live warehouse photo captured" : "Warehouse live photo"}</figcaption></figure></div>}
          {form.listingId && !warehousePreview && <div className="camera-actions"><button className="secondary" type="button" onClick={startLiveCamera}>{cameraActive ? "Restart camera" : "Open live camera"}</button>{cameraActive && <button className="primary" type="button" onClick={captureLivePhoto}><ScanLine size={16}/>Capture live photo</button>}<label className="camera-upload">Fallback camera upload<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => { const file = event.target.files?.[0] || null; setWarehousePhoto(file); setWarehousePreview(file ? URL.createObjectURL(file) : ""); stopLiveCamera(); }} /></label></div>}
          <label>Confirmed grade<select value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}><option>A</option><option>B</option><option>C</option></select></label>
          <div className="intake-final-actions"><button className="primary" type="button" onClick={confirmScheduledIntake}><BrainCircuit size={18}/>Confirm grade & publish</button><button className="danger" type="button" onClick={() => setRejectingListing((current) => !current)}>Reject intake</button></div>
          {rejectingListing && <div className="rejection-box"><b>Tell the farmer why this intake is rejected</b><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Example: Visible spoilage and damaged packaging observed at intake."/><button className="danger" type="button" onClick={rejectScheduledIntake}>Send rejection to farmer</button></div>}
        </div>
        <form className="intake" onSubmit={submit}>
          <h3>Confirm produce intake</h3>
          <label>
            Intake warehouse
            <select value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
              {warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}
            </select>
          </label>
          <label>
            Crop
            <select
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
            >
              {INDIA_CROPS.map((item) => (
                <option key={item.name}>{cropEmoji(item.name, item.category)} {item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Confirmed net weight (kg)
            <input
              type="number"
              min="1"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </label>
          <label>
            Human-verified grade
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </label>
          <div className="grade-ai">
            <BrainCircuit />
            <div>
              <b>Camera-assisted result: Grade A</b>
              <small>Confidence 91% · visual defects: low</small>
            </div>
            <span>Review</span>
          </div>
          <button className="primary" type="submit">
            <ScanLine size={18} />
            Confirm grade & create lot
          </button>
        </form>
        <div className="ledger">
          <h3>Live inventory ledger</h3>
          {lots.map((l) => (
            <div key={l.id} className="ledger-row">
              <span className="dot"></span>
              <div>
                <b>
                  {l.id} · {l.crop}
                </b>
                <small>
                  Received today · Grade {l.grade} · {l.warehouse}
                </small>
              </div>
              <strong>{l.qty} kg</strong>
            </div>
          ))}
          <p className="notice">
            Every intake, correction, reservation and dispatch is an auditable
            inventory event.
          </p>
        </div>
      </div>
      <form className="account-panel form-grid" onSubmit={async (event) => {
        event.preventDefault();
        if (!newWarehouse.name.trim() || !newWarehouse.address.trim()) return notify("Enter a warehouse name and location.");
        if (!isSupabaseConfigured) { setWarehouses((current) => [...current, { ...newWarehouse }]); setNewWarehouse({ name: "", address: "" }); return notify("Warehouse added in demo mode."); }
        const { data, error } = await supabase.from("warehouses").insert({ name: newWarehouse.name.trim(), address: newWarehouse.address.trim() }).select("id,name,address").single();
        if (error) return notify(error.message);
        setWarehouses((current) => [...current, data]); setNewWarehouse({ name: "", address: "" }); setLiveTick((tick) => tick + 1); notify("Warehouse added and available across checkout and admin operations.");
      }}>
        <h3>Add warehouse location</h3>
        <label>Warehouse name<input value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} placeholder="e.g. Ajmer Collection Hub" /></label>
        <label>Location / address<input value={newWarehouse.address} onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })} placeholder="District, state, PIN" /></label>
        <button className="primary" type="submit">Add warehouse</button>
      </form>
      <div className="ops-grid">
        <QueuePanel
          title="Farmer produce & cluster requests"
          empty="No new farmer requests."
          items={produceRequests}
          render={(r) => (
            <>
              <b>
                {r.crop} · {r.grossWeight} kg gross
              </b>
              <small>
                {r.type} · {r.farmer} · {r.cluster} · Grade requested
              </small>
            </>
          )}
          action={(request) => (
            <button
              className="queue-action"
              disabled={String(request.status).toLowerCase().includes("received")}
              onClick={() => receiveRequest(request)}
            >
              {String(request.status).toLowerCase().includes("received")
                ? "Received"
                : "Mark received"}
            </button>
          )}
        />
        <QueuePanel
          title="Consumer pickup orders"
          empty="No pickup orders yet."
          items={orders}
          render={(o) => (
            <>
              <b>
                {o.id} · {o.quantity} kg
              </b>
              <small>
                {o.pickupWarehouse} · {o.items} lot(s) · {o.status}
              </small>
            </>
          )}
          action={(order) => (
            <button
              className="queue-action"
              disabled={String(order.status).toLowerCase() === "ready for pickup"}
              onClick={async () => {
                if (await setOrderStatus(order.id, "Ready for pickup")) {
                  notify(`${order.id} is ready for consumer pickup.`);
                }
              }}
            >
              {String(order.status).toLowerCase() === "ready for pickup"
                ? "Ready"
                : "Mark ready"}
            </button>
          )}
        />
      </div>
    </section>
  );
}
function QueuePanel({ title, items, empty, render, action }) {
  return (
    <div className="queue-panel">
      <h3>{title}</h3>
      {items.length ? (
        items.map((item) => (
          <div className="admin-row" key={item.id}>
            <span className="dot"></span>
            <div>{render(item)}{action?.(item)}</div>
          </div>
        ))
      ) : (
        <p className="empty-state">{empty}</p>
      )}
    </div>
  );
}
function FarmerView({
  session,
  lots,
  setModal,
  produceRequests,
  setProduceRequests,
  liveTick,
  notify,
}) {
  const [form, setForm] = useState({
    crop: "Tomato",
    grossWeight: "",
    cluster: "Jaipur North cluster",
    type: "Produce intake",
  });
  const [cropSearch, setCropSearch] = useState("");
  const matchingCrops = useMemo(
    () =>
      INDIA_CROPS.filter((item) =>
        (item.name + " " + item.category)
          .toLowerCase()
          .includes(cropSearch.toLowerCase()),
      ).slice(0, 80),
    [cropSearch],
  );
  const myLots = lots.filter(
    (l) => l.farmer === "Ramesh Kumar" || l.farmer === session?.name,
  );
  const myRequests = produceRequests.filter((request) => request.farmer === (session?.name || "Farmer"));
  const activeRequestCount = myRequests.filter((request) => !["received", "cancelled"].includes(String(request.status).toLowerCase())).length;
  const listedValue = myLots.reduce((sum, lot) => sum + Number(lot.qty || 0) * Number(lot.price || 0), 0);
  const submit = async (e) => {
    e.preventDefault();
    const id = `REQ-${String(Date.now()).slice(-6)}`;
    const request = {
      ...form,
      id,
      farmer: session?.name || "Farmer",
      status: "Awaiting pickup and grade",
    };
    if (isSupabaseConfigured && session?.userId) {
      const { data, error } = await supabase
        .from("produce_requests")
        .insert({
          farmer_id: session.userId,
          crop: form.crop,
          gross_weight_kg: Number(form.grossWeight),
          collection_cluster: form.cluster,
          request_type:
            form.type === "Cluster collection request"
              ? "cluster_collection"
              : "produce_intake",
        })
        .select("id")
        .single();
      if (error) {
        notify(error.message);
        return;
      }
      request.id = data.id;
    }
    setProduceRequests((current) => [request, ...current]);
    setForm({ ...form, grossWeight: "" });
    notify(`${form.type} ${id} sent to the warehouse admin.`);
  };
  return (
    <section className="page farmer-page">
      <div className="farmer-welcome">
        <div>
          <p className="eyebrow">
            NAMASTE{session?.name ? `, ${session.name}` : ""}
          </p>
          <h1>Your produce. Your decision.</h1>
          <p>
            Add produce for a grade request, or create a cluster collection
            request. The collector will confirm final weight and grade at
            pickup.
          </p>
          <button className="primary" onClick={() => setModal("ai")}>
            <BrainCircuit size={18} />
            View price guidance
          </button>
        </div>
        <div className="balance">
          <small>ESTIMATED STOCK VALUE</small>
          <b>₹22,140</b>
          <span>820 kg in storage</span>
        </div>
      </div>
      <section className="farmer-overview" aria-label="Farmer dashboard summary">
        <div><span className="overview-icon"><PackageCheck size={18}/></span><small>Live produce lots</small><b>{myLots.length}</b><em>Warehouse-verified inventory</em></div>
        <div><span className="overview-icon"><Truck size={18}/></span><small>Collection requests</small><b>{activeRequestCount}</b><em>Awaiting pickup or grading</em></div>
        <div><span className="overview-icon"><BarChart3 size={18}/></span><small>Indicative stock value</small><b>₹{listedValue.toLocaleString("en-IN")}</b><em>Based on live listed quantity</em></div>
        <div><span className="overview-icon"><ShieldCheck size={18}/></span><small>Next action</small><b>{activeRequestCount ? "Track request" : "Add produce"}</b><em>{activeRequestCount ? "Collection is in progress" : "Start an intake request"}</em></div>
      </section>
      <div className="farmer-grid workflow-grid">
        <form className="intake farmer-request" onSubmit={submit}>
          <p className="eyebrow green">PICKUP & GRADING</p>
          <h3>Add produce request</h3>
          <label>
            Request type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>Produce intake</option>
              <option>Cluster collection request</option>
            </select>
          </label>
          <label>
            Search India crop
            <input
              value={cropSearch}
              onChange={(e) => setCropSearch(e.target.value)}
              placeholder="Search crop or category"
            />
          </label>
          <label>
            Crop selection
            <select
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
            >
              {matchingCrops.length ? (
                matchingCrops.map((item) => (
                  <option key={item.name} value={item.name}>
                    {cropEmoji(item.name, item.category)} {item.name} · {item.category}
                  </option>
                ))
              ) : (
                <option>{form.crop}</option>
              )}
            </select>
            <small>
              {INDIA_CROPS.length}+ Indian crop species across field,
              horticulture, spice, plantation, medicinal, flower and fodder
              groups.
            </small>
          </label>
          <label>
            Gross weight at pickup (kg)
            <input
              required
              min="1"
              type="number"
              placeholder="e.g. 250"
              value={form.grossWeight}
              onChange={(e) =>
                setForm({ ...form, grossWeight: e.target.value })
              }
            />
          </label>
          <label>
            Collection cluster
            <select
              value={form.cluster}
              onChange={(e) => setForm({ ...form, cluster: e.target.value })}
            >
              <option>Jaipur North cluster</option>
              <option>Sanganer cluster</option>
              <option>Village / FPO pickup point</option>
            </select>
          </label>
          <div className="grade-ai">
            <ScanLine />
            <div>
              <b>Grade requested</b>
              <small>
                Final weight and grade are confirmed by the pickup operator.
              </small>
            </div>
          </div>
          <button className="primary" type="submit">
            <Truck size={18} />
            Send request to warehouse
          </button>
        </form>
        <div className="my-lots">
          <h3>Your produce & requests</h3>
          {myLots.map((l) => (
            <div className="my-lot" key={l.id}>
              <span>{cropEmoji(l.crop, l.category)}</span>
              <div>
                <b>
                  {l.id} · {l.crop}, Grade {l.grade}
                </b>
                <small>
                  {l.qty} kg · {l.warehouse}
                </small>
              </div>
              <strong>₹{l.price}/kg</strong>
            </div>
          ))}
          {myRequests
            .map((r) => (
              <div className="my-lot" key={r.id}>
                <span>{cropEmoji(r.crop)}</span>
                <div>
                  <b>
                    {r.crop} · {r.grossWeight} kg gross
                  </b>
                  <small>
                    {r.type} · {r.cluster} · {r.status}
                  </small>
                </div>
                <strong>Pending</strong>
              </div>
            ))}
          {!myLots.length && !produceRequests.length && (
            <p className="empty-state">
              Your approved lots and pending requests will appear here.
            </p>
          )}
        </div>
      </div>
      <FarmerOperations notify={notify} session={session} liveTick={liveTick} />
      <div className="farmer-grid">
        <div className="finance">
          <p className="eyebrow">STORED STOCK FINANCE</p>
          <h3>Need working capital?</h3>
          <p>
            Start a consent-based eligibility enquiry for your stored produce.
          </p>
          <button
            onClick={() =>
              notify(
                "Consent-first finance enquiry started. No credit decision has been made.",
              )
            }
          >
            Explore options <ArrowUpRight size={16} />
          </button>
          <small>
            Subject to warehouse, partner and lender eligibility. Not a loan
            offer.
          </small>
        </div>
        <div className="farmer-help">
          <h3>How grading works</h3>
          <p>
            Enter your gross amount and request collection. At pickup, the
            operator verifies weight, captures quality details, and confirms the
            final grade before it becomes live stock.
          </p>
        </div>
      </div>
    </section>
  );
}
function FarmerOperations({ notify, session, liveTick }) {
  const [tab, setTab] = useState("listings"),
    [cropSearch, setCropSearch] = useState(""),
    [image, setImage] = useState(null),
    [preview, setPreview] = useState(""),
    [saving, setSaving] = useState(false),
    [published, setPublished] = useState(null),
    [quotes, setQuotes] = useState([]),
    [counterOffers, setCounterOffers] = useState({}),
    [farmerListings, setFarmerListings] = useState([]),
    [farmerOrders, setFarmerOrders] = useState([]),
    [farmerJobs, setFarmerJobs] = useState([]),
    [listingFloor, setListingFloor] = useState(null),
    [listing, setListing] = useState({
      crop: "Tomato",
      description: "Fresh produce from our verified farm cluster.",
      quantity: "100",
      price: "25",
      harvestDate: new Date().toISOString().slice(0, 10),
    });
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    supabase.from("bulk_requests").select("id,crop,quantity_kg,buyer_name,msp_per_kg,status,bulk_quotes(id,offered_price_per_kg,proposed_by,status)").eq("farmer_id", session.userId).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) notify(error.message); else setQuotes(data || []);
    });
  }, [session?.userId, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !listing.crop) return;
    let active = true;
    Promise.all([
      supabase.from("msp_rates").select("msp_per_kg,source_url").eq("crop", listing.crop).maybeSingle(),
      supabase.from("crop_price_floors").select("floor_price_per_kg,floor_type,source_url").eq("crop", listing.crop).maybeSingle(),
    ]).then(([mspResult, referenceResult]) => {
      if (!active) return;
      if (mspResult.data) setListingFloor({ price: Number(mspResult.data.msp_per_kg), label: "Official MSP", source: mspResult.data.source_url });
      else if (referenceResult.data) setListingFloor({ price: Number(referenceResult.data.floor_price_per_kg), label: referenceResult.data.floor_type === "official_msp" ? "Official MSP" : "Verified reference floor", source: referenceResult.data.source_url });
      else setListingFloor(null);
    });
    return () => { active = false; };
  }, [listing.crop]);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    Promise.all([
      supabase.from("farmer_listings").select("id,crop,quantity_kg,price_per_kg,status,image_url,warehouse_image_url,warehouse_grade,grading_confidence,warehouse_rejection_reason,warehouse_rejected_at,created_at,warehouses(name)").eq("farmer_id", session.userId).order("created_at", { ascending: false }),
      supabase.from("order_items").select("id,quantity_kg,unit_price,produce_lots!inner(farmer_id,crop),consumer_orders(order_code,status,created_at,warehouses(name))").eq("produce_lots.farmer_id", session.userId).order("id", { ascending: false }),
      supabase.from("logistics_jobs").select("id,source_type,details,status,created_at").order("created_at", { ascending: false }),
    ]).then(([listingResult, orderResult, jobsResult]) => {
      if (listingResult.error) notify(listingResult.error.message); else setFarmerListings(listingResult.data || []);
      if (orderResult.error) notify(orderResult.error.message); else setFarmerOrders(orderResult.data || []);
      if (jobsResult.error) notify(jobsResult.error.message); else setFarmerJobs(jobsResult.data || []);
    });
  }, [session?.userId, liveTick]);
  const respondToQuote = async (request, quote, action) => {
    const { error } = await supabase.rpc("respond_to_bulk_quote", { p_request_id: request.id, p_quote_id: quote.id, p_action: action });
    if (error) return notify(error.message);
    notify(action === "accept" ? "Sale confirmed. Buyer and warehouse workflow have been updated." : "Offer declined. The buyer has been notified.");
    setQuotes((current) => current.map((item) => item.id === request.id ? { ...item, status: action === "accept" ? "confirmed" : "declined" } : item));
  };
  const sendCounterOffer = async (request) => {
    const offeredPrice = Number(counterOffers[request.id]);
    const mspFloor = Number(request.msp_per_kg || 0);
    if (!Number.isFinite(offeredPrice) || offeredPrice <= 0) {
      return notify("Enter a valid counter-offer price per kg.");
    }
    if (offeredPrice < mspFloor) {
      return notify(`A counter-offer cannot be below the MSP floor of ₹${mspFloor.toFixed(2)}/kg.`);
    }
    const { data, error } = await supabase
      .from("bulk_quotes")
      .insert({ request_id: request.id, offered_price_per_kg: offeredPrice, proposed_by: "farmer", status: "proposed" })
      .select("id,offered_price_per_kg,proposed_by,status")
      .single();
    if (error) return notify(error.message);
    setQuotes((current) => current.map((item) => item.id === request.id ? {
      ...item,
      bulk_quotes: [...(item.bulk_quotes || []), data],
    } : item));
    setCounterOffers((current) => ({ ...current, [request.id]: "" }));
    notify("Your counter-offer has been sent to the wholesale buyer. You remain in control of the final sale.");
  };
  const matches = useMemo(
    () =>
      INDIA_CROPS.filter((item) =>
        (item.name + " " + item.category)
          .toLowerCase()
          .includes(cropSearch.toLowerCase()),
      ).slice(0, 80),
    [cropSearch],
  );
  const activeOrders = farmerOrders.filter((item) => String(item.consumer_orders?.status || "").toLowerCase() !== "cancelled");
  const grossEarnings = activeOrders.reduce((sum, item) => sum + Number(item.quantity_kg || 0) * Number(item.unit_price || 0), 0);
  const fulfilledOrders = activeOrders.filter((item) => ["ready_for_pickup", "completed"].includes(String(item.consumer_orders?.status || "").toLowerCase()));
  const selectPhoto = (file) => {
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  };
  const submitListing = async (event) => {
    event.preventDefault();
    if (!image) {
      notify("Attach at least one produce photo before publishing.");
      return;
    }
    if (!session?.userId || !isSupabaseConfigured) {
      notify("Sign in as a farmer to publish a listing.");
      return;
    }
    if (!listingFloor) return notify(`No verified price floor exists for ${listing.crop}. Ask an admin to configure it before listing.`);
    if (Number(listing.price) < listingFloor.price) return notify(`Your listing price cannot be below the ${listingFloor.label.toLowerCase()} of ₹${listingFloor.price.toFixed(2)}/kg.`);
    setSaving(true);
    try {
      const cropMeta = INDIA_CROPS.find((item) => item.name === listing.crop);
      const extension = (image.name.split(".").pop() || "jpg").replace(
        /[^a-z0-9]/gi,
        "",
      );
      const path = session.userId + "/" + crypto.randomUUID() + "." + extension;
      const { error: uploadError } = await supabase.storage
        .from("produce-photos")
        .upload(path, image, { contentType: image.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("produce-photos")
        .getPublicUrl(path);
      const record = {
        farmer_id: session.userId,
        crop: listing.crop,
        category: cropMeta?.category || "Other",
        description: listing.description,
        quantity_kg: Number(listing.quantity),
        price_per_kg: Number(listing.price),
        harvest_date: listing.harvestDate,
        image_url: urlData.publicUrl,
        status: "pending",
      };
      const { data, error } = await supabase
        .from("farmer_listings")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      setPublished(data);
      notify(
        "Photo listing submitted to the admin for verification. It will appear to consumers only after approval.",
      );
    } catch (error) {
      notify(error.message || "Photo listing could not be published.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="farmer-operations">
      <div className="tabs">
        {[
          "listings",
          "orders",
          "logistics",
          "payments",
          "performance",
          "verification", "quotes",
        ].map((x) => (
          <button
            key={x}
            className={tab === x ? "selected" : ""}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {tab === "listings" && (
        <>
        <div className="account-panel">
          <h3>Live listing status</h3>
          {farmerListings.length ? farmerListings.map((item) => <div className="contract-row" key={item.id}><span>{cropEmoji(item.crop)}</span><div><b>{item.crop} · {item.quantity_kg} kg</b><small>{item.warehouses?.name || "Awaiting warehouse"} · {item.warehouse_grade ? `Grade ${item.warehouse_grade} · ${item.grading_confidence || 0}% AI confidence` : "Farmer photo received"}</small>{item.status === "rejected" && <small className="listing-rejection">Warehouse decision: {item.warehouse_rejection_reason || "The intake could not be accepted. Please contact the warehouse."}</small>}</div><strong>{String(item.status).replaceAll("_", " ")}</strong></div>) : <p className="empty-state">Your submitted listings will update here live.</p>}
        </div>
        <form
          className="account-panel form-grid photo-listing"
          onSubmit={submitListing}
        >
          <h3>Produce listing management & photo grading</h3>
          <label>
            Search crop catalogue
            <input
              value={cropSearch}
              onChange={(e) => setCropSearch(e.target.value)}
              placeholder="Search any Indian crop"
            />
          </label>
          <label>
            Crop selection
            <select
              value={listing.crop}
              onChange={(e) => setListing({ ...listing, crop: e.target.value })}
            >
              {matches.map((item) => (
                <option key={item.name} value={item.name}>
                  {cropEmoji(item.name, item.category)} {item.name} · {item.category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity available (kg)
            <input
              required
              type="number"
              min="1"
              value={listing.quantity}
              onChange={(e) =>
                setListing({ ...listing, quantity: e.target.value })
              }
            />
          </label>
          <label>
            Exact harvest date
            <input required type="date" max={new Date().toISOString().slice(0, 10)} value={listing.harvestDate} onChange={(e) => setListing({ ...listing, harvestDate: e.target.value })} />
            <small>This is shown to consumers and drives freshness grading for fruits, vegetables and flowers.</small>
          </label>
          <label>
            Expected price per kg
            <input
              required
              type="number"
              min={listingFloor?.price || 1}
              step="0.01"
              value={listing.price}
              onChange={(e) =>
                setListing({ ...listing, price: e.target.value })
              }
            />
            <small className={listingFloor ? "floor-note" : "floor-note missing"}>{listingFloor ? <>{listingFloor.label}: <b>₹{listingFloor.price.toFixed(2)}/kg</b>{listingFloor.source ? <a href={listingFloor.source} target="_blank" rel="noreferrer"> View source</a> : ""}</> : "No verified floor configured yet — this crop cannot be submitted."}</small>
          </label>
          <label>
            Description
            <textarea
              value={listing.description}
              onChange={(e) =>
                setListing({ ...listing, description: e.target.value })
              }
            />
          </label>
          <label>
            Produce photos
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => selectPhoto(e.target.files?.[0])}
            />
            <small>
              JPEG, PNG or WebP. Your photo is stored securely and displayed to
              consumers.
            </small>
          </label>
          {preview && (
            <img
              className="listing-preview"
              src={preview}
              alt="Selected produce preview"
            />
          )}
          <button className="primary" disabled={saving} type="submit">
            {saving ? "Publishing…" : "Publish listing with photo"}
          </button>
          {published && (
            <div className="published-note">
              <ShieldCheck size={18} />
              <span>
                <b>{published.crop} is awaiting review.</b> Its photo will be
                visible in the consumer marketplace after admin approval.
              </span>
            </div>
          )}
        </form>
        </>
      )}
      {tab === "orders" && (
        <div className="account-panel">
          <h3>Live incoming orders</h3>
          {farmerOrders.length ? farmerOrders.map((item) => <div className="tracking" key={item.id}><b>{item.consumer_orders?.order_code || "Order"}</b><span>{item.produce_lots?.crop} · {item.quantity_kg} kg</span><span>{item.consumer_orders?.warehouses?.name || "Warehouse pickup"}</span><strong>{String(item.consumer_orders?.status || "pending").replaceAll("_", " ")}</strong></div>) : <p className="empty-state">Orders for your warehouse-confirmed lots will appear here live.</p>}
        </div>
      )}
      {tab === "logistics" && (
        <div className="account-panel">
          <h3>Live logistics schedule</h3>
          {farmerJobs.length ? farmerJobs.map((job) => <div className="tracking" key={job.id}><b>{job.source_type.replaceAll("_", " ")}</b><span>{job.details}</span><span>{new Date(job.created_at).toLocaleString()}</span><strong>{job.status.replaceAll("_", " ")}</strong></div>) : <p className="empty-state">Collection and warehouse intake jobs linked to your produce will appear here.</p>}
          <LiveRoutePlanner notify={notify} />
        </div>
      )}
      {tab === "payments" && (
        <div className="metric-grid">
          <Metric
            icon={<BarChart3 />}
            label="Live order value"
            value={`₹${grossEarnings.toFixed(2)}`}
            note={`${activeOrders.length} non-cancelled order line(s)`}
          />
          <Metric
            icon={<Clock3 />}
            label="Ready / completed value"
            value={`₹${fulfilledOrders.reduce((sum, item) => sum + Number(item.quantity_kg || 0) * Number(item.unit_price || 0), 0).toFixed(2)}`}
            note="Based on live warehouse order status"
          />
          <Metric
            icon={<ClipboardList />}
            label="Transactions"
            value={String(farmerOrders.length)}
            note="Order lines from your verified lots"
          />
        </div>
      )}
      {tab === "performance" && (
        <div className="metric-grid">
          <Metric
            icon={<BarChart3 />}
            label="Published listings"
            value={String(farmerListings.filter((item) => item.status === "published").length)}
            note="Live marketplace-ready produce"
          />
          <Metric
            icon={<Users />}
            label="Fulfilled orders"
            value={String(fulfilledOrders.length)}
            note="Ready for pickup or completed"
          />
          <Metric
            icon={<ShieldCheck />}
            label="Intake confirmations"
            value={String(farmerListings.filter((item) => item.warehouse_image_url).length)}
            note="Listings with a live warehouse AI-grade photo"
          />
        </div>
      )}
      {tab === "verification" && (
        <div className="account-panel">
          <h3>Farmer profile verification</h3>
          <p>
            Identity, farm location, bank account and FPO details are reviewed
            before trust status is displayed to buyers.
          </p>
          <button
            className="primary"
            onClick={() =>
              notify("Verification checklist opened for document upload.")
            }
          >
            Continue verification
          </button>
        </div>
      )}
      {tab === "quotes" && (
        <div className="account-panel">
          <h3>Wholesale quote desk</h3>
          <p>Every offer is protected by the applicable MSP floor. You alone decide whether a sale is confirmed.</p>
          {quotes.length ? quotes.map((request) => {
            const offer = (request.bulk_quotes || []).filter((item) => item.proposed_by === "buyer" && item.status === "proposed").at(-1);
            const counter = (request.bulk_quotes || []).filter((item) => item.proposed_by === "farmer" && item.status === "proposed").at(-1);
            return <div className="contract-row quote-request" key={request.id}><div><b>{request.crop} · {request.quantity_kg} kg</b><small>{request.buyer_name} · MSP floor ₹{Number(request.msp_per_kg || 0).toFixed(2)}/kg · {request.status}</small>{offer && <strong>Buyer offer: ₹{Number(offer.offered_price_per_kg).toFixed(2)}/kg</strong>}{counter && <strong>Your counter: ₹{Number(counter.offered_price_per_kg).toFixed(2)}/kg</strong>}</div>{offer ? <div className="quote-actions"><label>Counter ₹/kg<input type="number" min={request.msp_per_kg || 0} step="0.01" value={counterOffers[request.id] || ""} onChange={(event) => setCounterOffers({ ...counterOffers, [request.id]: event.target.value })} placeholder={`Min ₹${request.msp_per_kg || 0}`} /></label><button onClick={() => sendCounterOffer(request)}>Send counter</button><button className="primary" onClick={() => respondToQuote(request, offer, "accept")}>Accept sale</button> <button className="secondary" onClick={() => respondToQuote(request, offer, "reject")}>Decline</button></div> : <span>Waiting for buyer offer</span>}</div>;
          }) : <p className="empty-state">No wholesale quote requests have been assigned to you yet.</p>}
        </div>
      )}
    </section>
  );
}
function AuthView({ initialRole = "consumer", setSession, setView, notify }) {
  const [mode, setMode] = useState("login"),
    [role, setRole] = useState(initialRole),
    [farmerId, setFarmerId] = useState(""),
    [resendEmail, setResendEmail] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);
  const resendConfirmation = async () => {
    if (!resendEmail) {
      notify("Enter your consumer email address first.");
      return;
    }
    if (!isSupabaseConfigured) {
      notify("Email confirmation is available after Supabase is configured.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail,
        options: { emailRedirectTo: window.location.origin + "/" },
      });
      if (error) throw error;
      notify(
        "Confirmation email resent. Open the new link to return to FarmLink.",
      );
    } catch (error) {
      notify(error.message || "Unable to resend confirmation email.");
    } finally {
      setBusy(false);
    }
  };
  const finishLogin = async (user, requestedRole) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role,full_name,farmer_id")
      .eq("id", user.id)
      .single();
    if (error || !profile) {
      notify("Your FarmLink profile could not be loaded.");
      return;
    }
    if (profile.role !== requestedRole) {
      await supabase.auth.signOut();
      notify("This account does not have access to that portal.");
      return;
    }
    setSession({
      role: profile.role,
      label: profile.full_name,
      name: profile.full_name,
      farmerId: profile.farmer_id,
      userId: user.id,
    });
    setView(
      profile.role === "consumer"
        ? "market"
        : profile.role === "farmer"
          ? "farmer"
          : "admin",
    );
    notify(`Signed in as ${profile.role}.`);
  };
  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (mode === "register" && role !== "admin" && !name) {
      notify("Please enter your full name.");
      return;
    }
    if (!isSupabaseConfigured) {
      const label =
        role === "farmer"
          ? farmerId || `FLR-${String(Date.now()).slice(-6)}`
          : role === "admin"
            ? "FarmLink Admin"
            : name || "Consumer";
      if (mode === "register" && role === "farmer" && !farmerId) {
        setFarmerId(label);
        notify(
          `Registration complete. Your Farmer ID is ${label}. Use it with your password to sign in.`,
        );
        return;
      }
      setSession({
        role,
        label: name || label,
        name,
        farmerId: role === "farmer" ? label : undefined,
      });
      setView(
        role === "consumer" ? "market" : role === "farmer" ? "farmer" : "admin",
      );
      notify(`Signed in as ${role}.`);
      return;
    }
    setBusy(true);
    try {
      const password = String(data.get("password"));
      const mobile = String(data.get("mobile") || "");
      const address = String(data.get("address") || "");
      if (mode === "register" && role === "admin") {
        notify("Admin accounts must be created by an existing administrator.");
        return;
      }
      if (mode === "login" && role === "farmer") {
        const farmerLoginId = String(data.get("farmerId") || "").trim().toLowerCase();
        if (!/^flr-[a-z0-9-]+$/.test(farmerLoginId)) throw new Error("Enter the Farmer ID issued during registration (for example, FLR-AB12CD34).");
        const { data: login, error } = await supabase.auth.signInWithPassword({ email: `${farmerLoginId}@farmer.farmlink.local`, password });
        if (error || !login.user) throw error || new Error("Farmer ID or password is incorrect.");
        await finishLogin(login.user, "farmer");
        return;
      }
      if (mode === "register" && role === "consumer") {
        const { data: signup, error } = await supabase.auth.signUp({
          email: String(data.get("email")),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/",
            data: { full_name: name, mobile, address },
          },
        });
        if (error) throw error;
        let signedInUser = signup.session?.user;
        if (!signedInUser) {
          const { data: login, error: loginError } =
            await supabase.auth.signInWithPassword({
              email: String(data.get("email")),
              password,
            });
          if (loginError || !login.user) {
            throw loginError || new Error("Account was created but sign-in did not complete.");
          }
          signedInUser = login.user;
        }
        await finishLogin(signedInUser, "consumer");
        return;
      }
      if (mode === "register" && role === "farmer") {
        const phone = normalizeIndianPhone(mobile);
        if (!phone)
          throw new Error("Enter a valid 10-digit Indian mobile number.");
        const { data, error } = await supabase.functions.invoke(
          "register-farmer",
          { body: { fullName: name, mobile: phone, address, password } },
        );
        if (error) throw error;
        setFarmerId(data.farmerId);
        setMode("login");
        notify(
          `Farmer ID issued: ${data.farmerId}. Use it with the password you just set to sign in.`,
        );
        return;
      }
      const loginName = String(data.get("email") || "")
        .trim()
        .toLowerCase();
      const email =
        role === "admin"
          ? loginName.includes("@")
            ? loginName
            : loginName + "@farmlink.admin"
          : loginName;
      const { data: login, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      await finishLogin(login.user, role);
    } catch (error) {
      notify(error.message || "Unable to complete this request.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="auth-page">
      <div className="auth-aside">
        <div className="brand light">
          <span>
            <Sprout size={24} />
          </span>
          Farm<span>Link</span>
        </div>
        <div>
          <p className="eyebrow">FARMER-FIRST ACCESS</p>
          <h1>
            One platform.
            <br />
            Three clear roles.
          </h1>
          <p>
            Consumers shop trusted local stock. Farmers manage their harvest.
            Admins monitor the full connected flow.
          </p>
        </div>
        <div className="role-list">
          <span>
            <ShoppingCart />
            Consumer marketplace only
          </span>
          <span>
            <Sprout />
            Farmer dashboard & Farmer ID
          </span>
          <span>
            <ShieldCheck />
            Admin monitoring controls
          </span>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-switch">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setFarmerId("");
            }}
          >
            Register
          </button>
        </div>
        <p className="eyebrow green">
          {mode === "login" ? "WELCOME BACK" : "CREATE YOUR ACCOUNT"}
        </p>
        <h2>
          {mode === "login" ? "Sign in to FarmLink" : "Register as a user"}
        </h2>
        <div className="role-tabs">
          {[
            ["consumer", "Consumer", ShoppingCart],
            ["farmer", "Farmer", Sprout],
            ["admin", "Admin", ShieldCheck],
          ].map(([key, label, Icon]) => (
            <button
              type="button"
              key={key}
              className={role === key ? "role-active" : ""}
              onClick={() => {
                setRole(key);
                setFarmerId("");
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          {mode === "register" && role !== "admin" && (
            <Field
              icon={<UserRound />}
              label="Full name"
              name="name"
              type="text"
            />
          )}
          {mode === "register" && role !== "admin" && (
            <Field
              icon={<MapPinned />}
              label="Full address"
              name="address"
              type="text"
            />
          )}
          {role === "consumer" && (
            <Field
              icon={<Mail />}
              label="Email address"
              name="email"
              type="email"
              onChange={(e) => setResendEmail(e.target.value)}
            />
          )}{" "}
          {role === "farmer" && mode === "login" && (
            <Field icon={<Sprout />} label="Farmer ID (e.g. FLR-AB12CD34)" name="farmerId" type="text" />
          )}
          {mode === "register" && role !== "admin" && (
            <Field
              icon={<Phone />}
              label="Mobile number"
              name="mobile"
              type="tel"
            />
          )}
          {role === "admin" && (
            <Field
              icon={<UserRound />}
              label="Admin username"
              name="email"
              type="text"
            />
          )}
          <Field
            icon={<LockKeyhole />}
            label="Password"
            name="password"
            type="password"
          />
          {farmerId && (
            <div className="farmer-id">
              <Sprout />
              <div>
                <small>YOUR FARMER ID</small>
                <b>{farmerId}</b>
                <span>Keep this ID safe for future logins.</span>
              </div>
            </div>
          )}
          <button className="primary auth-submit" disabled={busy} type="submit">
            {busy
              ? "Please wait…"
              : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            <ArrowUpRight size={17} />
          </button>
        </form>
        {role === "admin" && (
          <p className="admin-note">
            <ShieldCheck />
            Admin accounts are provisioned by FarmLink. This demo mode accepts
            an administrator-provisioned username.
          </p>
        )}
        <small className="auth-note">
          {isSupabaseConfigured
            ? "Supabase Auth is active."
            : "Demo mode: configure Supabase environment variables to enable secure account storage."}
        </small>
      </div>
    </section>
  );
}
function Field({ icon, label, name, type, onChange }) {
  return (
    <label className="auth-field">
      <span>{icon}</span>
      <input
        aria-label={label}
        name={name}
        placeholder={label}
        type={type}
        onChange={onChange}
        required
      />
    </label>
  );
}
function LegacyAdminView({ lots, orders, produceRequests, setView, logout, notify }) {
  const value = lots.reduce((sum, l) => sum + l.qty * l.price, 0);
  const [tab, setTab] = useState("users");
  return (
    <section className="page admin-page">
      <div className="page-top">
        <div>
          <p className="eyebrow green">PLATFORM COMMAND CENTER</p>
          <h1>FarmLink Admin</h1>
          <p>
            Monitor farmer collection requests, consumer pickup orders,
            warehouse stock and market operations.
          </p>
        </div>
        <button className="secondary" onClick={logout}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>
      <div className="metric-grid">
        <Metric
          icon={<Users />}
          label="Registered farmers"
          value="152"
          note={produceRequests.length + " new collection request(s)"}
        />
        <Metric
          icon={<ShoppingCart />}
          label="Consumer pickup orders"
          value={String(orders.length)}
          note="Awaiting warehouse fulfillment"
        />
        <Metric
          icon={<PackageCheck />}
          label="Live inventory"
          value={lots.reduce((s, l) => s + l.qty, 0).toLocaleString() + " kg"}
          note="Across 2 warehouses"
        />
        <Metric
          icon={<BarChart3 />}
          label="Stock value"
          value={"₹" + value.toLocaleString()}
          note="Indicative live value"
        />
      </div>
      <div className="admin-grid">
        <QueuePanel
          title="New farmer collection requests"
          empty="No new farmer produce or cluster requests."
          items={produceRequests}
          render={(r) => (
            <>
              <b>
                {r.crop} · {r.grossWeight} kg gross
              </b>
              <small>
                {r.type} · {r.farmer} · {r.cluster}
              </small>
            </>
          )}
        />
        <QueuePanel
          title="Consumer pickup orders"
          empty="No consumer pickup orders yet."
          items={orders}
          render={(o) => (
            <>
              <b>
                {o.id} · {o.quantity} kg
              </b>
              <small>
                Pickup at {o.pickupWarehouse} · {o.status}
              </small>
            </>
          )}
        />
      </div>
      <div className="admin-grid">
        <div className="admin-panel">
          <h3>Warehouse & inventory events</h3>
          {lots.map((l, i) => (
            <div key={l.id} className="admin-row">
              <span className="dot"></span>
              <div>
                <b>
                  {l.id} · {l.crop}
                </b>
                <small>
                  {i === 0
                    ? "Grade verified and available to buy"
                    : "Live inventory record · " + l.warehouse}
                </small>
              </div>
              <strong>{l.qty} kg</strong>
            </div>
          ))}
          <button className="wide-btn" onClick={() => setView("warehouse")}>
            Open admin warehouse console
          </button>
        </div>
        <div className="admin-panel">
          <h3>Operations queue</h3>
          <div className="queue">
            <span className="warn">3</span>
            <div>
              <b>Buyer verification</b>
              <small>Bulk buyer accounts pending review</small>
            </div>
          </div>
          <div className="queue">
            <span className="ok">2</span>
            <div>
              <b>Finance enquiries</b>
              <small>Consent received; partner follow-up needed</small>
            </div>
          </div>
          <div className="queue">
            <span className="neutral">5</span>
            <div>
              <b>Stock-age alerts</b>
              <small>Review markdown / redistribution action</small>
            </div>
          </div>
          <button
            className="primary"
            onClick={() => notify("Operations report generated for review.")}
          >
            Generate report
          </button>
        </div>
      </div>
      <section className="admin-control">
        <p className="eyebrow green">GOVERNANCE & MODERATION</p>
        <div className="tabs">
          {[
            "users",
            "verification",
            "listings",
            "disputes",
            "configuration",
          ].map((x) => (
            <button
              key={x}
              className={tab === x ? "selected" : ""}
              onClick={() => setTab(x)}
            >
              {x}
            </button>
          ))}
        </div>
        {tab === "users" && (
          <div className="account-panel">
            <h3>User management</h3>
            <div className="contract-row">
              <b>Ramesh Kumar</b>
              <span>Farmer · verified</span>
              <span>Active</span>
              <button onClick={() => notify("User moderation profile opened.")}>
                Manage
              </button>
            </div>
            <div className="contract-row">
              <b>Metro Fresh Foods</b>
              <span>Bulk buyer · GST pending</span>
              <span>Review required</span>
              <button
                onClick={() => notify("Bulk buyer GST verification opened.")}
              >
                Verify GST
              </button>
            </div>
          </div>
        )}
        {tab === "verification" && (
          <div className="account-panel">
            <h3>Farmer & buyer verification queue</h3>
            <p>
              Review document uploads, farm/FPO details and GST credentials
              before enabling trust badges and wholesale purchasing.
            </p>
            <button
              className="primary"
              onClick={() =>
                notify("Verification queue assigned to current administrator.")
              }
            >
              Review pending applications
            </button>
          </div>
        )}
        {tab === "listings" && (
          <div className="account-panel">
            <h3>Listing moderation</h3>
            <div className="contract-row">
              <b>Organic onion – 500 kg</b>
              <span>AI grade B</span>
              <span>Awaiting moderation</span>
              <button onClick={() => notify("Listing approved and published.")}>
                Approve
              </button>
            </div>
            <button
              className="secondary"
              onClick={() =>
                notify("Listing rejected with farmer-visible reason request.")
              }
            >
              Reject selected listing
            </button>
          </div>
        )}
        {tab === "disputes" && (
          <div className="account-panel">
            <h3>Dispute resolution</h3>
            <p>
              Record customer complaints, evidence, warehouse findings, remedies
              and final outcome in an auditable resolution timeline.
            </p>
            <button
              className="primary"
              onClick={() => notify("New dispute case created.")}
            >
              Create resolution case
            </button>
          </div>
        )}
        {tab === "configuration" && (
          <div className="account-panel form-grid">
            <h3>System configuration</h3>
            <label>
              Marketplace category
              <input defaultValue="Vegetables" />
            </label>
            <label>
              AI grade confidence threshold
              <input type="number" defaultValue="85" />
            </label>
            <label>
              Stock freshness alert (days)
              <input type="number" defaultValue="3" />
            </label>
            <button
              className="primary"
              onClick={() => notify("Configuration draft saved for review.")}
            >
              Save configuration
            </button>
          </div>
        )}
      </section>
    </section>
  );
}
function AdminView({ session, lots, orders, produceRequests, bulkRequests, logisticsJobs, warehouses, setOrderStatus, liveTick, setLiveTick, setView, logout, notify }) {
  const [tab, setTab] = useState("action");
  const [listings, setListings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [clusterSelections, setClusterSelections] = useState({});
  const [listingWarehouses, setListingWarehouses] = useState({});
  const [floorForm, setFloorForm] = useState({ crop: "Tomato", price: "", source: "" });
  const [priceFloors, setPriceFloors] = useState([]);
  const [route, setRoute] = useState({ origin: warehouses[0]?.name || "", destination: warehouses[1]?.name || "" });
  const refresh = () => setLiveTick((tick) => tick + 1);
  useEffect(() => {
    if (!isSupabaseConfigured || tab !== "listings") return;
    supabase.from("farmer_listings").select("id,crop,category,description,quantity_kg,price_per_kg,image_url,harvest_date,status,created_at,profiles(full_name)").in("status", ["pending", "published"]).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) notify(error.message); else setListings(data || []);
    });
  }, [tab, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || tab !== "price floors") return;
    supabase.from("crop_price_floors").select("crop,floor_price_per_kg,floor_type,source_url,updated_at").order("crop").then(({ data, error }) => {
      if (error) notify(error.message); else setPriceFloors(data || []);
    });
  }, [tab, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || tab !== "wholesale") return;
    supabase.from("produce_lots").select("farmer_id,crop,quantity_kg,profiles(full_name,farmer_id)").gt("quantity_kg", 0).then(({ data, error }) => {
      if (error) return notify(error.message);
      const indexed = new Map();
      (data || []).forEach((lot) => {
        if (!lot.farmer_id) return;
        const current = indexed.get(lot.farmer_id) || { id: lot.farmer_id, full_name: lot.profiles?.full_name || "Farmer", farmer_id: lot.profiles?.farmer_id || "", stock: {} };
        current.stock[lot.crop] = (current.stock[lot.crop] || 0) + Number(lot.quantity_kg || 0);
        indexed.set(lot.farmer_id, current);
      });
      setFarmers([...indexed.values()].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    });
  }, [tab, liveTick]);
  const update = async (table, id, status, message) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) return notify(error.message);
    refresh(); notify(message);
  };
  const reviewListing = async (id, status) => {
    const { error } = await supabase.from("farmer_listings").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) return notify(error.message);
    notify(status === "published" ? "Listing verified and published with the farmer photo." : "Listing rejected; the farmer can correct it and resubmit."); refresh();
  };
  const removeMarketplaceListing = async (listing) => {
    if (!window.confirm(`Remove ${listing.crop} from the marketplace? The traceable intake record will be retained.`)) return;
    const { error } = await supabase.rpc("remove_marketplace_listing", { p_listing_id: listing.id });
    if (error) return notify(error.message);
    notify(`${listing.crop} has been removed from the marketplace. The underlying traceability record was retained.`);
    refresh();
  };
  const scheduleListing = async (listing) => {
    const warehouseId = listingWarehouses[listing.id] || warehouses[0]?.id;
    const warehouse = warehouses.find((item) => item.id === warehouseId);
    if (!warehouseId || !warehouse) return notify("Choose a warehouse before scheduling this listing.");
    const { error } = await supabase.from("farmer_listings").update({ status: "scheduled", intake_warehouse_id: warehouseId, scheduled_at: new Date().toISOString() }).eq("id", listing.id);
    if (error) return notify(error.message);
    const { error: jobError } = await supabase.from("logistics_jobs").insert({ requested_by: session.userId, source_type: "farmer_listing_intake", source_id: listing.id, details: `${listing.crop} · ${listing.quantity_kg} kg → ${warehouse.name}` });
    if (jobError) notify(`Listing scheduled, but logistics job needs review: ${jobError.message}`);
    else notify(`Listing scheduled to ${warehouse.name}. It is now visible in warehouse intake.`);
    refresh();
  };
  const scheduleClusterRequest = async (request) => {
    const { error } = await supabase
      .from("produce_requests")
      .update({ status: "collection_scheduled" })
      .eq("id", request.id);
    if (error) return notify(error.message);
    const { error: jobError } = await supabase.from("logistics_jobs").insert({
      requested_by: session.userId,
      source_type: "cluster_collection",
      source_id: request.id,
      details: `${request.crop} · ${request.grossWeight} kg · ${request.cluster || "Farm cluster"} → collection scheduled`,
    });
    if (jobError) {
      notify(`Collection was verified, but the linked logistics job needs attention: ${jobError.message}`);
    } else {
      notify("Cluster collection verified and scheduled. The job is now live in farmer, warehouse and admin dashboards.");
    }
    refresh();
  };
  const assignFarmer = async (request) => {
    const farmerId = assignments[request.id] || request.farmer_id;
    if (!farmerId) return notify("Choose a farmer before connecting this quote.");
    const { error } = await supabase.rpc("assign_bulk_request_farmer", { p_request_id: request.id, p_farmer_id: farmerId });
    if (error) return notify(error.message);
    notify("Quote connected to a farmer with enough verified stock in this crop. Only that farmer can accept the sale."); refresh();
  };
  const eligibleFarmers = (request) => farmers.filter((farmer) => Number(farmer.stock[request.crop] || 0) > 0);
  const toggleClusterFarmer = (requestId, farmerId) => setClusterSelections((current) => {
    const selected = current[requestId] || [];
    return { ...current, [requestId]: selected.includes(farmerId) ? selected.filter((id) => id !== farmerId) : [...selected, farmerId] };
  });
  const assignCluster = async (request) => {
    const selectedIds = clusterSelections[request.id] || [];
    const selected = eligibleFarmers(request).filter((farmer) => selectedIds.includes(farmer.id));
    if (selected.length < 2) return notify("Select at least two farmers with this crop to create a cluster.");
    let remaining = Number(request.quantity_kg);
    const allocations = selected.map((farmer) => {
      const allocated = Math.min(Number(farmer.stock[request.crop] || 0), remaining);
      remaining -= allocated;
      return { farmer_id: farmer.id, allocated_quantity_kg: allocated };
    }).filter((item) => item.allocated_quantity_kg > 0);
    if (remaining > 0) return notify(`Selected farmers can supply only ${Number(request.quantity_kg) - remaining} kg; choose more farmers for this ${request.quantity_kg} kg request.`);
    const { error } = await supabase.rpc("assign_bulk_request_cluster", { p_request_id: request.id, p_allocations: allocations });
    if (error) return notify(error.message);
    notify(`Cluster created from ${allocations.length} eligible farmers. The lead farmer can now negotiate the MSP-protected quote.`);
    refresh();
  };
  const addRoute = async (event) => {
    event.preventDefault();
    if (!route.origin || !route.destination || route.origin === route.destination) return notify("Choose two different warehouses.");
    const { error } = await supabase.from("logistics_routes").insert({ created_by: session.userId, route_type: "inter_warehouse", origin: route.origin, destination: route.destination, stops: [route.origin, route.destination] });
    if (error) return notify(error.message);
    notify("Inter-warehouse transfer route created."); refresh();
  };
  const savePriceFloor = async (event) => {
    event.preventDefault();
    const price = Number(floorForm.price);
    if (!floorForm.crop || !Number.isFinite(price) || price <= 0) return notify("Choose a crop and enter a valid verified price floor.");
    const { error } = await supabase.from("crop_price_floors").upsert({ crop: floorForm.crop, floor_price_per_kg: price, floor_type: "admin_verified_reference", source_url: floorForm.source || null, updated_at: new Date().toISOString() }, { onConflict: "crop" });
    if (error) return notify(error.message);
    notify(`Verified floor saved for ${floorForm.crop}. Farmers and buyers are now protected by it.`);
    setFloorForm({ ...floorForm, price: "", source: "" }); refresh();
  };
  const pending = produceRequests.filter((item) => !["collection_scheduled", "received"].includes(item.status)).length + orders.filter((item) => !["verified", "ready for pickup"].includes(String(item.status).toLowerCase())).length + logisticsJobs.filter((item) => item.status !== "scheduled").length;
  return <section className="page admin-page">
    <div className="page-top"><div><p className="eyebrow green">LIVE OPERATIONS COMMAND CENTER</p><h1>FarmLink Admin</h1><p>Verify listings, coordinate collection and warehouse work, connect wholesale buyers, and map the route for every handoff.</p></div><button className="secondary" onClick={logout}><LogOut size={17}/>Sign out</button></div>
    <div className="metric-grid"><Metric icon={<Users/>} label="Farmer requests" value={String(produceRequests.length)} note={`${pending} item(s) require attention`}/><Metric icon={<ShoppingCart/>} label="Consumer orders" value={String(orders.length)} note="Live pickup fulfilment"/><Metric icon={<Truck/>} label="Logistics jobs" value={String(logisticsJobs.length)} note="Route and schedule tracking"/><Metric icon={<PackageCheck/>} label="Live inventory" value={`${lots.reduce((sum, lot) => sum + lot.qty, 0)} kg`} note="Verified warehouse stock"/></div>
    <section className="admin-control"><div className="tabs">{[["action","Action centre"],["listings","Listing approvals"],["wholesale","Wholesale desk"],["warehouses","Warehouse inspector"],["routes","Route map"],["price floors","Price floors"]].map(([key,label]) => <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === "action" && <div className="admin-grid">
      <QueuePanel title="Newest farmer & cluster requests" empty="No open farmer requests." items={produceRequests.slice(0, 8)} render={(item) => <><b>{item.crop} · {item.grossWeight} kg</b><small>{item.farmer} · {item.cluster} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={["collection_scheduled","received"].includes(item.status)} onClick={() => scheduleClusterRequest(item)}>{["collection_scheduled","received"].includes(item.status) ? "Scheduled" : "Verify & schedule"}</button>}/>
      <QueuePanel title="Newest consumer orders" empty="No pending consumer orders." items={orders.slice(0, 8)} render={(item) => <><b>{item.id} · {item.quantity} kg</b><small>{item.pickupWarehouse} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={["verified","ready for pickup"].includes(String(item.status).toLowerCase())} onClick={async () => { if (await setOrderStatus(item.id, "Verified")) notify("Consumer order verified across admin, consumer and warehouse queues."); }}>{["verified","ready for pickup"].includes(String(item.status).toLowerCase()) ? "Verified" : "Verify order"}</button>}/>
      <QueuePanel title="Logistics scheduling" empty="No logistics jobs awaiting action." items={logisticsJobs.slice(0, 8)} render={(item) => <><b>{item.source_type.replaceAll("_", " ")}</b><small>{item.details} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={item.status === "scheduled"} onClick={() => update("logistics_jobs", item.id, "scheduled", "Logistics job scheduled across live dashboards.")}>{item.status === "scheduled" ? "Scheduled ✓" : "Schedule job"}</button>}/>
    </div>}
    {tab === "listings" && <div className="admin-work-panel"><h3>Farmer listings & marketplace controls</h3><p>Inspect submitted photos, schedule warehouse intake, and remove any live listing from the marketplace while retaining its traceability record.</p>{listings.length ? listings.map((item) => <article className="listing-review" key={item.id}><img src={item.image_url} alt={`${item.crop} submitted by farmer`}/><div><b>{item.crop} · {item.quantity_kg} kg · ₹{item.price_per_kg}/kg</b><small>{item.profiles?.full_name || "Farmer"} · {item.category} · harvested {item.harvest_date ? new Date(`${item.harvest_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "not recorded"}</small><p>{item.description}</p>{item.status === "published" ? <><span className="listing-live">● Live in marketplace</span><button className="danger" onClick={() => removeMarketplaceListing(item)}>Remove listing</button></> : <><select value={listingWarehouses[item.id] || warehouses[0]?.id || ""} onChange={(event) => setListingWarehouses({ ...listingWarehouses, [item.id]: event.target.value })}><option value="">Choose intake warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} · {warehouse.address}</option>)}</select><button className="primary" onClick={() => scheduleListing(item)}>Schedule warehouse intake</button> <button className="secondary" onClick={() => reviewListing(item.id, "rejected")}>Reject</button></>}</div></article>) : <p className="empty-state">No farmer listings are awaiting scheduling or live in the marketplace.</p>}</div>}
    {tab === "wholesale" && <div className="admin-work-panel"><h3>Connect wholesale requests to crop-matched farmers</h3><p>Only farmers with live, verified stock of the requested crop can receive a quote. If no one farmer can fulfil it, create a capacity-checked farmer cluster.</p>{bulkRequests.length ? bulkRequests.filter((request) => !["confirmed","declined"].includes(request.status)).map((request) => { const eligible = eligibleFarmers(request); const selected = clusterSelections[request.id] || []; const clusterCapacity = eligible.filter((farmer) => selected.includes(farmer.id)).reduce((sum, farmer) => sum + Number(farmer.stock[request.crop] || 0), 0); return <div className="quote-assignment" key={request.id}><div className="assignment-row"><div><b>{request.crop} · {request.quantity_kg} kg</b><small>{request.buyer_name} · MSP floor ₹{Number(request.msp_per_kg || 0).toFixed(2)}/kg · {request.status}</small><small>{eligible.length} crop-matched farmer(s) · {eligible.reduce((sum, farmer) => sum + Number(farmer.stock[request.crop] || 0), 0)} kg live capacity</small></div><select value={assignments[request.id] || request.farmer_id || ""} onChange={(event) => setAssignments({ ...assignments, [request.id]: event.target.value })}><option value="">Choose an eligible farmer</option>{eligible.filter((farmer) => Number(farmer.stock[request.crop] || 0) >= Number(request.quantity_kg)).map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.full_name}{farmer.farmer_id ? ` · ${farmer.farmer_id}` : ""} · {farmer.stock[request.crop]} kg</option>)}</select><button className="primary" disabled={!eligible.some((farmer) => Number(farmer.stock[request.crop] || 0) >= Number(request.quantity_kg))} onClick={() => assignFarmer(request)}>Assign single farmer</button></div><div className="cluster-picker"><b>Or create a farmer cluster</b><small>Select contributors with {request.crop}; capacity is allocated automatically up to the buyer requirement.</small>{eligible.map((farmer) => <label key={farmer.id}><input type="checkbox" checked={selected.includes(farmer.id)} onChange={() => toggleClusterFarmer(request.id, farmer.id)}/><span>{farmer.full_name}{farmer.farmer_id ? ` · ${farmer.farmer_id}` : ""}</span><strong>{farmer.stock[request.crop]} kg available</strong></label>)}{eligible.length ? <div><span>Selected capacity: <b>{clusterCapacity} / {request.quantity_kg} kg</b></span><button className="secondary" disabled={selected.length < 2 || clusterCapacity < Number(request.quantity_kg)} onClick={() => assignCluster(request)}>Create cluster & assign quote</button></div> : <p className="empty-state">No farmer currently has published live stock of {request.crop}.</p>}</div></div>; }) : <p className="empty-state">No wholesale requests are awaiting review.</p>}</div>}
    {tab === "warehouses" && <div className="admin-work-panel"><h3>Warehouse inspection menu</h3><p>Open a warehouse to handle intake, consumer pickups, and its associated live queue.</p>{warehouses.map((warehouse) => <div className="contract-row" key={warehouse.id || warehouse.name}><div><b>{warehouse.name}</b><small>{warehouse.address}</small></div><span>{orders.filter((order) => order.pickupWarehouse === warehouse.name).length} pickup order(s)</span><button className="primary" onClick={() => setView("warehouse")}>Inspect</button></div>)}</div>}
    {tab === "routes" && <div className="admin-work-panel"><h3>Farm-to-warehouse route mapping</h3><p>Map collection → intake warehouse → inter-warehouse transfer → pickup fulfilment.</p><LiveRoutePlanner notify={notify} initialOrigin={warehouses[0]?.address || ""} initialDestination={warehouses[1]?.address || warehouses[0]?.address || ""}/><form className="route-form" onSubmit={addRoute}><select value={route.origin} onChange={(event) => setRoute({ ...route, origin: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><span>→</span><select value={route.destination} onChange={(event) => setRoute({ ...route, destination: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><button className="primary" type="submit">Save transfer route</button></form><button className="secondary" onClick={() => setView("warehouse")}>Open warehouse operations</button></div>}
    {tab === "price floors" && <div className="admin-work-panel"><h3>MSP and verified crop price floors</h3><p>Official MSP entries take priority automatically. For crops without a government MSP, add a source-backed verified reference floor before farmers can list or buyers can quote.</p><form className="floor-form" onSubmit={savePriceFloor}><label>Crop<select value={floorForm.crop} onChange={(event) => setFloorForm({ ...floorForm, crop: event.target.value })}>{INDIA_CROPS.map((crop) => <option key={crop.name} value={crop.name}>{cropEmoji(crop.name, crop.category)} {crop.name}</option>)}</select></label><label>Verified floor ₹/kg<input required type="number" min="0.01" step="0.01" value={floorForm.price} onChange={(event) => setFloorForm({ ...floorForm, price: event.target.value })}/></label><label>Official/reference source URL<input type="url" value={floorForm.source} onChange={(event) => setFloorForm({ ...floorForm, source: event.target.value })} placeholder="https://…"/></label><button className="primary" type="submit">Save protected floor</button></form><div className="floor-list">{priceFloors.length ? priceFloors.map((floor) => <div key={floor.crop}><b>{floor.crop}</b><span>₹{Number(floor.floor_price_per_kg).toFixed(2)}/kg · verified reference</span>{floor.source_url && <a href={floor.source_url} target="_blank" rel="noreferrer">Source <ArrowUpRight size={13}/></a>}</div>) : <p className="empty-state">No reference floors have been added yet. Official MSP crops continue to use their existing official rate.</p>}</div></div>}
    </section>
  </section>;
}
function LiveRoutePlanner({ notify, initialOrigin = "", initialDestination = "" }) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (initialOrigin) setOrigin(initialOrigin); }, [initialOrigin]);
  useEffect(() => { if (initialDestination) setDestination(initialDestination); }, [initialDestination]);
  const calculateRoute = async (event) => {
    event.preventDefault();
    if (!origin.trim() || !destination.trim()) return notify("Enter both pickup and destination locations.");
    setLoading(true);
    try {
      const geocode = async (place) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(place)}`);
        if (!response.ok) throw new Error("Location search is temporarily unavailable.");
        const result = await response.json();
        if (!result[0]) throw new Error(`We could not find “${place}”. Try a fuller village, city or warehouse address.`);
        return result[0];
      };
      const [from, to] = await Promise.all([geocode(origin), geocode(destination)]);
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`);
      if (!response.ok) throw new Error("Road-route service is temporarily unavailable.");
      const result = await response.json();
      const drivingRoute = result.routes?.[0];
      if (!drivingRoute) throw new Error("No drivable route was found between these locations.");
      const mapUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.lat}%2C${from.lon}%3B${to.lat}%2C${to.lon}`;
      setRoute({
        distanceKm: (drivingRoute.distance / 1000).toFixed(1),
        durationMinutes: Math.max(1, Math.round(drivingRoute.duration / 60)),
        from: from.display_name,
        to: to.display_name,
        mapUrl,
      });
    } catch (error) {
      notify(error.message || "Route could not be calculated right now.");
      setRoute(null);
    } finally { setLoading(false); }
  };
  return <section className="route-planner" aria-label="Live distance and route planner"><div><p className="eyebrow green"><MapPinned size={14}/> LIVE ROAD ROUTE</p><h4>Calculate collection distance</h4><p>Uses OpenStreetMap road data to estimate driving distance and time.</p></div><form onSubmit={calculateRoute}><label>Pickup / farm cluster<input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Village, district or farm address"/></label><label>Warehouse / destination<input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Warehouse or delivery address"/></label><button className="primary" type="submit" disabled={loading}>{loading ? "Calculating…" : "Calculate live route"}</button></form>{route && <div className="route-result"><div><small>Driving distance</small><b>{route.distanceKm} km</b></div><div><small>Estimated travel</small><b>{route.durationMinutes} min</b></div><p><MapPin size={15}/><span>{route.from} → {route.to}</span></p><a className="secondary" href={route.mapUrl} target="_blank" rel="noreferrer">Open interactive map <ArrowUpRight size={15}/></a></div>}</section>;
}
function Metric({ icon, label, value, note }) {
  return (
    <div className="metric">
      <i>{icon}</i>
      <small>{label}</small>
      <b>{value}</b>
      <span>{note}</span>
    </div>
  );
}
function Checkout({ cart, warehouses, updateCartQuantity, close, placeOrder, placingOrder }) {
  const [warehouse, setWarehouse] = useState(warehouses[0]?.name || "");
  useEffect(() => {
    if (!warehouses.some((item) => item.name === warehouse)) setWarehouse(warehouses[0]?.name || "");
  }, [warehouses, warehouse]);
  const total = cart.reduce((sum, l) => sum + l.price * l.quantityKg, 0);
  const totalKg = cart.reduce((sum, l) => sum + l.quantityKg, 0);
  return (
    <div className="modal-back">
      <div className="modal checkout-modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <p className="eyebrow green">CONSUMER CHECKOUT</p>
        <h2>Choose your pickup warehouse</h2>
        <p className="checkout-copy">
          Your items are reserved. Select a verified FarmLink warehouse, then
          confirm your pickup order.
        </p>
        <div className="checkout-lines">
          {cart.map((lot) => (
            <div className="checkout-line" key={lot.id}>
              <span>{cropEmoji(lot.crop, lot.category)}</span>
              <div>
                <b>
                  {lot.crop}, Grade {lot.grade}
                </b>
                <small>Lot {lot.id} · ₹{lot.price}/kg</small>
              </div>
              <div className="checkout-quantity" aria-label={`${lot.crop} quantity`}>
                <button
                  type="button"
                  aria-label={`Decrease ${lot.crop} quantity`}
                  onClick={() => updateCartQuantity(lot.id, lot.quantityKg - 1)}
                >
                  −
                </button>
                <input
                  aria-label={`${lot.crop} kilograms`}
                  type="number"
                  min="1"
                  max="50"
                  value={lot.quantityKg}
                  onChange={(event) => updateCartQuantity(lot.id, event.target.value)}
                />
                <button
                  type="button"
                  aria-label={`Increase ${lot.crop} quantity`}
                  onClick={() => updateCartQuantity(lot.id, lot.quantityKg + 1)}
                >
                  +
                </button>
              </div>
              <strong>₹{lot.price * lot.quantityKg}</strong>
              <button
                type="button"
                className="checkout-remove"
                aria-label={`Remove ${lot.crop} from checkout`}
                onClick={() => updateCartQuantity(lot.id, 0)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <label className="pickup-choice">
          Pickup warehouse
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
          >
            {warehouses.map((item) => <option key={item.id || item.name} value={item.name}>{item.name}{item.address ? ` · ${item.address}` : ""}</option>)}
          </select>
          <small>
            Your order will appear in this warehouse's admin fulfillment queue.
          </small>
        </label>
        <div className="checkout-total">
          <span>Total payable at pickup · {totalKg} / 50 kg</span>
          <b>₹{total.toFixed(2)}</b>
        </div>
        <button
          className="primary checkout-confirm"
          disabled={placingOrder}
          onClick={() => placeOrder(warehouse)}
        >
          <PackageCheck size={18} />
          {placingOrder ? "Placing order…" : "Confirm pickup order"}
        </button>
      </div>
    </div>
  );
}
function AI({ close }) {
  return (
    <div className="modal-back">
      <div className="modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <p className="eyebrow green">EXPLAINABLE FARM ADVISORY</p>
        <h2>Tomato: consider selling this week</h2>
        <div className="recommend">
          <div>
            <small>SUGGESTED RANGE</small>
            <b>₹26 - ₹29/kg</b>
          </div>
          <div>
            <small>CONFIDENCE</small>
            <b>78%</b>
          </div>
          <div>
            <small>DATA FRESHNESS</small>
            <b>Today, 9:00 AM</b>
          </div>
        </div>
        <h3>Why this guidance?</h3>
        <ul>
          <li>Nearby demand is up 8% this week.</li>
          <li>Grade A availability is moderate.</li>
          <li>Your lot is 1 day old; shelf-life risk is low.</li>
        </ul>
        <div className="disclaimer">
          <ShieldCheck />
          This is a recommendation, not a guaranteed price. You remain in
          control of your sale decision.
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            I’ll hold
          </button>
          <button className="primary" onClick={close}>
            List for buyers
          </button>
        </div>
      </div>
    </div>
  );
}
function Voice({ close, notify }) {
  const [provider, setProvider] = useState("bhashini"),
    [language, setLanguage] = useState("hi"),
    [recording, setRecording] = useState(false),
    [status, setStatus] = useState(
      "Record a Hindi or English request to transcribe it.",
    ),
    [transcript, setTranscript] = useState("");
  const recorderRef = useRef(null),
    chunksRef = useRef([]);
  const transcribe = async (blob) => {
    if (!isSupabaseConfigured) {
      setStatus("Connect Supabase to use secure transcription.");
      return;
    }
    setStatus("Transcribing securely…");
    try {
      const form = new FormData();
      form.append(
        "audio",
        new File([blob], "farmlink-recording.webm", { type: "audio/webm" }),
      );
      form.append("provider", provider);
      form.append("language", language);
      const { data, error } = await supabase.functions.invoke(
        "transcribe-audio",
        { body: form },
      );
      if (error) {
        let detail;
        try {
          detail = await error.context?.json();
        } catch {
          // Fall back to the provider error when no JSON error is available.
        }
        throw new Error(detail?.error || error.message);
      }
      if (!data?.text)
        throw new Error(data?.error || "No transcript returned.");
      setTranscript(data.text);
      setStatus(
        "Transcript ready via " +
          (data.provider === "bhashini" ? "BHASHINI" : "Whisper") +
          ".",
      );
      notify("Voice request transcribed successfully.");
    } catch (error) {
      setStatus(error.message || "Transcription failed.");
      notify(error.message || "Transcription failed.");
    }
  };
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        transcribe(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setTranscript("");
      setStatus("Recording… tap Stop & transcribe when finished.");
    } catch (error) {
      setStatus("Microphone access is required to record voice input.");
    }
  };
  const stop = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setRecording(false);
    }
  };
  return (
    <div className="modal-back">
      <div className="modal voice-modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="voice-orb">
          <Mic size={42} />
        </div>
        <p className="eyebrow green">MULTILINGUAL VOICE INPUT</p>
        <h2>Speak in Hindi or English</h2>
        <p>
          Choose an engine, record a short request, and FarmLink securely sends
          the audio to the selected speech-to-text provider.
        </p>
        <div className="voice-options">
          <label>
            Engine
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="bhashini">BHASHINI ASR</option>
              <option value="whisper">OpenAI Whisper</option>
            </select>
          </label>
          <label>
            Language
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <button className="primary" onClick={recording ? stop : start}>
          <Mic size={18} />
          {recording ? "Stop & transcribe" : "Start recording"}
        </button>
        <p className="voice-status">{status}</p>
        {transcript && (
          <div className="transcript">
            <small>TRANSCRIPT</small>
            <b>{transcript}</b>
          </div>
        )}
        <small>
          Audio is sent only after you tap Stop. Credentials remain on the
          server; do not speak financial or identity secrets.
        </small>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
