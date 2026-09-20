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
} from "lucide-react";
import "./styles.css";
import "./auth.css";
import "./workflows.css";
import "./checkout.css";
import { isSupabaseConfigured, supabase } from "./supabase";
import { firebaseAuth, isFirebaseConfigured } from "./firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  useDeviceLanguage,
} from "firebase/auth";

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
    if (!isSupabaseConfigured || !session?.userId) return;
    supabase
      .from("farmer_listings")
      .select("id,crop,category,description,quantity_kg,price_per_kg,image_url")
      .eq("status", "published")
      .then(({ data }) => {
        if (data)
          setLots((current) => [
            ...current.filter((lot) => !lot.listing),
            ...data.map((listing, index) => ({
              id: "LIST-" + listing.id.slice(-6).toUpperCase(),
              listing: true,
              listingId: listing.id,
              crop: listing.crop,
              hi: listing.crop,
              grade: "Farmer listed",
              qty: Number(listing.quantity_kg),
              price: Number(listing.price_per_kg),
              old: 0,
              warehouse: "Direct farmer listing",
              farmer: "Verified farmer",
              dist: "Direct",
              trend: 0,
              imageUrl: listing.image_url,
              description: listing.description,
              category: listing.category,
            })),
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
            )
        : supabase
            .from("consumer_orders")
            .select(
              "id,order_code,total_kg,status,cancellation_expires_at,warehouses(name)",
            )
            .eq("consumer_id", session.userId);
    query.then(({ data }) => {
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
    if (admin) {
      supabase.from("logistics_jobs").select("id,source_type,source_id,details,status,created_at").order("created_at", { ascending: false }).then(({ data }) => setLogisticsJobs(data || []));
      supabase.from("warehouses").select("id,name,address").order("name").then(({ data }) => {
        if (data?.length) setWarehouses(data);
      });
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
    if (lot.listing) {
      notify(
        "This farmer photo listing is visible now; warehouse intake will enable checkout after stock verification.",
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
        order.status === "Pending verification" &&
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
        supabase
          .from("consumer_orders")
          .update({ status: "confirmed" })
          .eq("id", order.dbId);
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
        const { data: created, error } = await supabase
          .from("consumer_orders")
          .insert({
            order_code: id,
            consumer_id: session.userId,
            pickup_warehouse_id: warehouse.id,
            total_kg: order.quantity,
            total_amount: cart.reduce(
              (sum, lot) => sum + lot.price * lot.quantityKg,
              0,
            ),
            status: "pending_verification",
            cancellation_expires_at: new Date(
              cancellationDeadline,
            ).toISOString(),
          })
          .select("id")
          .single();
        if (error) {
          notify(error.message);
          return;
        }
        order.dbId = created.id;
        const items = cart
          .filter((lot) => lot.dbId)
          .map((lot) => ({
            order_id: created.id,
            lot_id: lot.dbId,
            quantity_kg: lot.quantityKg,
            unit_price: lot.price,
          }));
        if (items.length) {
          const { error: itemError } = await supabase
            .from("order_items")
            .insert(items);
          if (itemError) {
            notify(itemError.message);
            return;
          }
        }
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
      const { error } = await supabase
        .from("consumer_orders")
        .update({ status: status.toLowerCase().replaceAll(" ", "_") })
        .eq("id", order.dbId);
      if (error) {
        notify(error.message);
        return false;
      }
    }
    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    return true;
  };
  const cancelOrder = async (id) => {
    const order = orders.find((item) => item.id === id);
    if (
      !order ||
      order.status !== "Pending verification" ||
      now >= order.cancellationDeadline
    ) {
      notify("This cancellation window has closed.");
      return;
    }
    if (await setOrderStatus(id, "Cancelled")) {
      setLots((current) =>
        current.map((lot) => {
          const reserved = (order.lineItems || [])
            .filter((item) => item.id === lot.id)
            .reduce((sum, item) => sum + item.quantityKg, 0);
          return reserved ? { ...lot, qty: lot.qty + reserved } : lot;
        }),
      );
      notify("Order cancelled. Reserved stock was returned.");
    }
  };
  const confirmOrder = (id) => setOrderStatus(id, "Confirmed");
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
      <footer>
        <div className="brand light">
          <span>
            <Sprout size={22} />
          </span>
          Farm<span>Link</span>
        </div>
        <p>Farmer-first aggregation • Transparent grade • Better choices</p>
        <small>
          Demo platform for SIH 2026 PS 26033. AI recommendations are
          illustrative, not guarantees.
        </small>
      </footer>
      {modal === "voice" && (
        <Voice close={() => setModal(null)} notify={notify} />
      )}{" "}
      {modal === "ai" && <AI close={() => setModal(null)} />}{" "}
      {modal === "checkout" && (
          <Checkout
            cart={cart}
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
          <span>
            {lot.crop === "Tomato" ? "🍅" : lot.crop === "Onion" ? "🧅" : "🥔"}
          </span>
        )}
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
            {lot.old} day old
          </span>
        </div>
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
      <div className="filters">
        {["All", "Tomato", "Onion", "Potato"].map((x) => (
          <button
            key={x}
            className={filter === x ? "selected" : ""}
            onClick={() => setFilter(x)}
          >
            {x}
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
          ) : lot.crop === "Tomato" ? (
            "🍅"
          ) : lot.crop === "Onion" ? (
            "🧅"
          ) : (
            "🥔"
          )}
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
              <b>{lot.old} day</b>
              <small>Stock age</small>
            </div>
          </div>
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
  orderAgain,
  setView,
  notify,
}) {
  const [tab, setTab] = useState("orders"),
    [review, setReview] = useState("");
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
                order.status === "Pending verification" &&
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
            <div><p className="empty-state">Choose a produce listing from Discover to start an RFQ.</p>{myQuotes.map((item) => <div className="tracking" key={item.id}><b>{item.crop} · {item.quantity_kg} kg</b><span>Your offer: {item.bulk_quotes?.find((entry) => entry.proposed_by === "buyer") ? `₹${item.bulk_quotes.find((entry) => entry.proposed_by === "buyer").offered_price_per_kg}/kg` : "pending"}</span><strong>{item.status}</strong></div>)}</div>
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
            <label>Crop<select value={contract.crop} onChange={(e) => setContract({ ...contract, crop: e.target.value })}>{INDIA_CROPS.map((crop) => <option key={crop.name}>{crop.name}</option>)}</select></label>
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
  setLiveTick,
  notify,
}) {
  const [form, setForm] = useState({
    crop: "Tomato",
    weight: "350",
    grade: "A",
    warehouse: warehouses[0]?.name || "Jaipur North",
  });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", address: "" });
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
      <div className="warehouse-grid">
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
                <option key={item.name}>{item.name}</option>
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
                    {item.name} · {item.category}
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
              <span>🍅</span>
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
          {produceRequests
            .filter((r) => r.farmer === (session?.name || "Farmer"))
            .map((r) => (
              <div className="my-lot" key={r.id}>
                <span>📋</span>
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
    [listing, setListing] = useState({
      crop: "Tomato",
      description: "Fresh produce from our verified farm cluster.",
      quantity: "100",
      price: "25",
    });
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    supabase.from("bulk_requests").select("id,crop,quantity_kg,buyer_name,msp_per_kg,status,bulk_quotes(id,offered_price_per_kg,proposed_by,status)").eq("farmer_id", session.userId).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) notify(error.message); else setQuotes(data || []);
    });
  }, [session?.userId, liveTick]);
  const respondToQuote = async (request, quote, action) => {
    const { error } = await supabase.rpc("respond_to_bulk_quote", { p_request_id: request.id, p_quote_id: quote.id, p_action: action });
    if (error) return notify(error.message);
    notify(action === "accept" ? "Sale confirmed. Buyer and warehouse workflow have been updated." : "Offer declined. The buyer has been notified.");
    setQuotes((current) => current.map((item) => item.id === request.id ? { ...item, status: action === "accept" ? "confirmed" : "declined" } : item));
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
                  {item.name} · {item.category}
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
            Expected price per kg
            <input
              required
              type="number"
              min="1"
              value={listing.price}
              onChange={(e) =>
                setListing({ ...listing, price: e.target.value })
              }
            />
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
      )}
      {tab === "orders" && (
        <div className="account-panel">
          <h3>Incoming order management</h3>
          <div className="tracking">
            <b>ORD-FL-1029</b>
            <span>25 kg tomato</span>
            <span>Consumer pickup</span>
            <button
              onClick={() => notify("Order accepted and warehouse notified.")}
            >
              Accept order
            </button>
          </div>
          <p>
            Accept, pack and hand off orders to the assigned warehouse/logistics
            partner.
          </p>
        </div>
      )}
      {tab === "logistics" && (
        <div className="account-panel">
          <h3>Logistics schedule</h3>
          <div className="tracking">
            <b>Pickup run JP-N-03</b>
            <span>Tomorrow, 09:30</span>
            <span>Jaipur North cluster</span>
            <strong>Collector assigned</strong>
          </div>
        </div>
      )}
      {tab === "payments" && (
        <div className="metric-grid">
          <Metric
            icon={<BarChart3 />}
            label="Available earnings"
            value="₹12,450"
            note="Released after completed pickup"
          />
          <Metric
            icon={<Clock3 />}
            label="Pending settlement"
            value="₹4,700"
            note="2 orders in quality confirmation"
          />
          <Metric
            icon={<ClipboardList />}
            label="Transactions"
            value="18"
            note="Full payment history available"
          />
        </div>
      )}
      {tab === "performance" && (
        <div className="metric-grid">
          <Metric
            icon={<BarChart3 />}
            label="Sales trend"
            value="+18%"
            note="Compared with last month"
          />
          <Metric
            icon={<Users />}
            label="Repeat customers"
            value="38%"
            note="Healthy return rate"
          />
          <Metric
            icon={<ShieldCheck />}
            label="Average rating"
            value="4.7 / 5"
            note="From verified buyer reviews"
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
            return <div className="contract-row" key={request.id}><div><b>{request.crop} · {request.quantity_kg} kg</b><small>{request.buyer_name} · MSP floor ₹{Number(request.msp_per_kg || 0).toFixed(2)}/kg · {request.status}</small>{offer && <strong>Buyer offer: ₹{Number(offer.offered_price_per_kg).toFixed(2)}/kg</strong>}</div>{offer ? <span><button className="primary" onClick={() => respondToQuote(request, offer, "accept")}>Accept sale</button> <button className="secondary" onClick={() => respondToQuote(request, offer, "reject")}>Decline</button></span> : <span>Waiting for buyer offer</span>}</div>;
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
    [otpStep, setOtpStep] = useState(false),
    [farmerPhone, setFarmerPhone] = useState(""),
    [busy, setBusy] = useState(false);
  const firebaseConfirmation = useRef(null);
  const firebaseVerifier = useRef(null);
  useEffect(() => {
    setRole(initialRole);
    setOtpStep(false);
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
        const phone = otpStep ? farmerPhone : normalizeIndianPhone(mobile);
        if (!phone)
          throw new Error("Enter a valid 10-digit Indian mobile number.");
        if (!otpStep) {
          if (!isFirebaseConfigured) {
            throw new Error(
              "Firebase Phone Authentication is not configured yet. Add the Firebase web configuration in Vercel first.",
            );
          }
          const auth = firebaseAuth();
          useDeviceLanguage(auth);
          if (!firebaseVerifier.current) {
            firebaseVerifier.current = new RecaptchaVerifier(
              auth,
              "firebase-recaptcha",
              { size: "invisible" },
            );
          }
          try {
            firebaseConfirmation.current = await signInWithPhoneNumber(
              auth,
              phone,
              firebaseVerifier.current,
            );
          } catch (error) {
            firebaseVerifier.current.clear();
            firebaseVerifier.current = null;
            throw error;
          }
          setFarmerPhone(phone);
          setOtpStep(true);
          notify("Firebase OTP sent to your registered mobile number.");
          return;
        }
        if (!firebaseConfirmation.current) {
          throw new Error("Request a new Firebase OTP first.");
        }
        const firebaseResult = await firebaseConfirmation.current.confirm(
          String(data.get("otp") || "").trim(),
        );
        const idToken = await firebaseResult.user.getIdToken();
        const { data: otp, error: otpError } = await supabase.functions.invoke(
          "firebase-phone-session",
          { body: { idToken } },
        );
        if (otpError) {
          let detail;
          try {
            detail = await otpError.context?.json();
          } catch {
            // Use the provider error below when no structured response exists.
          }
          throw new Error(detail?.error || otpError.message);
        }
        if (otp?.error) throw new Error(otp.error);
        const { data: verified, error } = await supabase.auth.verifyOtp({
          token_hash: otp.tokenHash,
          type: "magiclink",
        });
        if (error || !verified.user)
          throw error || new Error("OTP verification failed.");
        await finishLogin(verified.user, "farmer");
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
          { body: { fullName: name, mobile: phone, address } },
        );
        if (error) throw error;
        setFarmerId(data.farmerId);
        setMode("login");
        setFarmerPhone(phone);
        setOtpStep(false);
        notify(
          `Farmer ID issued: ${data.farmerId}. Request an OTP to sign in.`,
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
              setOtpStep(false);
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
                setOtpStep(false);
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
          {role === "farmer" && mode === "login" && otpStep && (
            <Field
              icon={<LockKeyhole />}
              label="6-digit OTP"
              name="otp"
              type="text"
            />
          )}
          {((mode === "register" && role !== "admin") ||
            (mode === "login" && role === "farmer")) && (
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
          {role !== "farmer" && (
            <Field
              icon={<LockKeyhole />}
              label="Password"
              name="password"
              type="password"
            />
          )}
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
          {role === "farmer" && mode === "login" && !otpStep && (
            <div id="firebase-recaptcha" className="firebase-recaptcha" />
          )}
          <button className="primary auth-submit" disabled={busy} type="submit">
            {busy
              ? "Please wait…"
              : role === "farmer" && mode === "login"
                ? otpStep
                  ? "Verify OTP"
                  : "Send OTP"
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
function AdminView({ session, lots, orders, produceRequests, bulkRequests, logisticsJobs, warehouses, liveTick, setLiveTick, setView, logout, notify }) {
  const [tab, setTab] = useState("action");
  const [listings, setListings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [route, setRoute] = useState({ origin: warehouses[0]?.name || "", destination: warehouses[1]?.name || "" });
  const refresh = () => setLiveTick((tick) => tick + 1);
  useEffect(() => {
    if (!isSupabaseConfigured || tab !== "listings") return;
    supabase.from("farmer_listings").select("id,crop,category,description,quantity_kg,price_per_kg,image_url,created_at,profiles(full_name)").eq("status", "pending").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) notify(error.message); else setListings(data || []);
    });
  }, [tab, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || tab !== "wholesale") return;
    supabase.from("profiles").select("id,full_name,farmer_id").eq("role", "farmer").order("full_name").then(({ data, error }) => {
      if (error) notify(error.message); else setFarmers(data || []);
    });
  }, [tab]);
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
  const assignFarmer = async (request) => {
    const farmerId = assignments[request.id] || request.farmer_id;
    if (!farmerId) return notify("Choose a farmer before connecting this quote.");
    const { error } = await supabase.from("bulk_requests").update({ farmer_id: farmerId, status: "negotiation" }).eq("id", request.id);
    if (error) return notify(error.message);
    notify("Quote connected to the selected farmer. Only the farmer can accept the sale."); refresh();
  };
  const addRoute = async (event) => {
    event.preventDefault();
    if (!route.origin || !route.destination || route.origin === route.destination) return notify("Choose two different warehouses.");
    const { error } = await supabase.from("logistics_routes").insert({ created_by: session.userId, route_type: "inter_warehouse", origin: route.origin, destination: route.destination, stops: [route.origin, route.destination] });
    if (error) return notify(error.message);
    notify("Inter-warehouse transfer route created."); refresh();
  };
  const pending = produceRequests.filter((item) => !["collection_scheduled", "received"].includes(item.status)).length + orders.filter((item) => !["verified", "ready for pickup"].includes(String(item.status).toLowerCase())).length + logisticsJobs.filter((item) => item.status !== "scheduled").length;
  return <section className="page admin-page">
    <div className="page-top"><div><p className="eyebrow green">LIVE OPERATIONS COMMAND CENTER</p><h1>FarmLink Admin</h1><p>Verify listings, coordinate collection and warehouse work, connect wholesale buyers, and map the route for every handoff.</p></div><button className="secondary" onClick={logout}><LogOut size={17}/>Sign out</button></div>
    <div className="metric-grid"><Metric icon={<Users/>} label="Farmer requests" value={String(produceRequests.length)} note={`${pending} item(s) require attention`}/><Metric icon={<ShoppingCart/>} label="Consumer orders" value={String(orders.length)} note="Live pickup fulfilment"/><Metric icon={<Truck/>} label="Logistics jobs" value={String(logisticsJobs.length)} note="Route and schedule tracking"/><Metric icon={<PackageCheck/>} label="Live inventory" value={`${lots.reduce((sum, lot) => sum + lot.qty, 0)} kg`} note="Verified warehouse stock"/></div>
    <section className="admin-control"><div className="tabs">{[["action","Action centre"],["listings","Listing approvals"],["wholesale","Wholesale desk"],["warehouses","Warehouse inspector"],["routes","Route map"]].map(([key,label]) => <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === "action" && <div className="admin-grid">
      <QueuePanel title="Newest farmer & cluster requests" empty="No open farmer requests." items={produceRequests.slice(0, 8)} render={(item) => <><b>{item.crop} · {item.grossWeight} kg</b><small>{item.farmer} · {item.cluster} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={["collection_scheduled","received"].includes(item.status)} onClick={() => update("produce_requests", item.id, "collection_scheduled", "Collection request verified and scheduled.")}>{["collection_scheduled","received"].includes(item.status) ? "Scheduled" : "Verify & schedule"}</button>}/>
      <QueuePanel title="Newest consumer orders" empty="No pending consumer orders." items={orders.slice(0, 8)} render={(item) => <><b>{item.id} · {item.quantity} kg</b><small>{item.pickupWarehouse} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={["verified","ready for pickup"].includes(String(item.status).toLowerCase())} onClick={() => update("consumer_orders", item.dbId, "verified", "Consumer order verified across admin and warehouse queues.")}>{["verified","ready for pickup"].includes(String(item.status).toLowerCase()) ? "Verified" : "Verify order"}</button>}/>
      <QueuePanel title="Logistics scheduling" empty="No logistics jobs awaiting action." items={logisticsJobs.slice(0, 8)} render={(item) => <><b>{item.source_type.replaceAll("_", " ")}</b><small>{item.details} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={item.status === "scheduled"} onClick={() => update("logistics_jobs", item.id, "scheduled", "Logistics job scheduled across live dashboards.")}>{item.status === "scheduled" ? "Scheduled ✓" : "Schedule job"}</button>}/>
    </div>}
    {tab === "listings" && <div className="admin-work-panel"><h3>Farmer photo listing verification</h3><p>Only approved images and produce data become visible in the consumer marketplace.</p>{listings.length ? listings.map((item) => <article className="listing-review" key={item.id}><img src={item.image_url} alt={`${item.crop} submitted listing`}/><div><b>{item.crop} · {item.quantity_kg} kg · ₹{item.price_per_kg}/kg</b><small>{item.profiles?.full_name || "Farmer"} · {item.category}</small><p>{item.description}</p><button className="primary" onClick={() => reviewListing(item.id, "published")}>Verify & publish</button> <button className="secondary" onClick={() => reviewListing(item.id, "rejected")}>Reject</button></div></article>) : <p className="empty-state">No photo listings are awaiting review.</p>}</div>}
    {tab === "wholesale" && <div className="admin-work-panel"><h3>Connect verified wholesale requests to farmers</h3><p>The MSP-protected offer is sent to the chosen farmer, who can accept, decline, or counter it.</p>{bulkRequests.length ? bulkRequests.filter((request) => !["confirmed","declined"].includes(request.status)).map((request) => <div className="assignment-row" key={request.id}><div><b>{request.crop} · {request.quantity_kg} kg</b><small>{request.buyer_name} · MSP floor ₹{Number(request.msp_per_kg || 0).toFixed(2)}/kg · {request.status}</small></div><select value={assignments[request.id] || request.farmer_id || ""} onChange={(event) => setAssignments({ ...assignments, [request.id]: event.target.value })}><option value="">Choose farmer</option>{farmers.map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.full_name}{farmer.farmer_id ? ` · ${farmer.farmer_id}` : ""}</option>)}</select><button className="primary" onClick={() => assignFarmer(request)}>Connect quote</button></div>) : <p className="empty-state">No wholesale requests are awaiting review.</p>}</div>}
    {tab === "warehouses" && <div className="admin-work-panel"><h3>Warehouse inspection menu</h3><p>Open a warehouse to handle intake, consumer pickups, and its associated live queue.</p>{warehouses.map((warehouse) => <div className="contract-row" key={warehouse.id || warehouse.name}><div><b>{warehouse.name}</b><small>{warehouse.address}</small></div><span>{orders.filter((order) => order.pickupWarehouse === warehouse.name).length} pickup order(s)</span><button className="primary" onClick={() => setView("warehouse")}>Inspect</button></div>)}</div>}
    {tab === "routes" && <div className="admin-work-panel"><h3>Farm-to-warehouse route mapping</h3><p>Map collection → intake warehouse → inter-warehouse transfer → pickup fulfilment.</p><form className="route-form" onSubmit={addRoute}><select value={route.origin} onChange={(event) => setRoute({ ...route, origin: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><span>→</span><select value={route.destination} onChange={(event) => setRoute({ ...route, destination: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><button className="primary" type="submit">Add transfer route</button></form><button className="secondary" onClick={() => setView("warehouse")}>Open warehouse operations</button></div>}
    </section>
  </section>;
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
function Checkout({ cart, updateCartQuantity, close, placeOrder, placingOrder }) {
  const [warehouse, setWarehouse] = useState("Jaipur North");
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
              <span>
                {lot.crop === "Tomato"
                  ? "🍅"
                  : lot.crop === "Onion"
                    ? "🧅"
                    : "🥔"}
              </span>
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
            <option>Jaipur North</option>
            <option>Sanganer Hub</option>
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
