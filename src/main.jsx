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
  Sparkles,
  Sun,
  Moon,
  Zap,
  Shield,
  Store,
  TrendingUp,
  Coins,
  Scale,
  Building2,
  Bot,
  CheckCircle2,
  DollarSign,
  Percent,
  ShoppingBag,
  Volume2,
  Square,
  Send,
  RefreshCw,
} from "lucide-react";
import "./styles.css";
import "./auth.css";
import "./workflows.css";
import "./checkout.css";
import "./crop-images.css";
import "./intake-pipeline.css";
import "./route-planner.css";
import "./refinements.css";
import "./jivexa-theme.css";
import { isSupabaseConfigured, supabase } from "./supabase";
import FreeAdvisory from "./ai/FreeAdvisory";
import GradeReview from "./ai/GradeReview";
import AppBoundary from "./components/AppBoundary";
import PasswordRecovery from "./components/PasswordRecovery";
import IntegrationCenter, { FarmerServices } from "./operations/IntegrationCenter";
import MarketDataAdmin from "./operations/MarketDataAdmin";
import DemandForecastEngine from "./operations/DemandForecastEngine";
import AdminAnalyticsEngine from "./operations/AdminAnalyticsEngine";
import LogisticsWorkflowHub from "./operations/LogisticsWorkflowHub";
import { availableToAdd, rankAndFilter, updateQuantity } from "./lib/marketplace.js";
import { CONSTITUTIONAL_LANGUAGES, translateText } from "./translations/constitutional22.js";
import AgenticCopilot, { AgenticDockLauncher } from "./ai/AgenticCopilot.jsx";
import { transcribeWithSarvam, speakHybrid, stopAllSpeech, DEFAULT_SARVAM_KEY } from "./ai/speechEngine.js";

const initialLots = [
  {
    id: "FL-24091",
    crop: "Tomato",
    hi: "टमाटर",
    grade: "A",
    qty: 820,
    price: 27,
    old: 1,
    warehouse: "Jaipur North",
    farmer: "Ramesh Kumar",
    dist: "12 km",
    trend: 8,
    category: "Vegetables",
    harvestDate: "2026-09-21",
    organicCertified: false,
    gradingConfidence: 94,
    description: "Firm, sun-ripened Grade A tomatoes with uniform color and zero rot.",
  },
  {
    id: "FL-24092",
    crop: "Onion",
    hi: "प्याज",
    grade: "A",
    qty: 1150,
    price: 31,
    old: 2,
    warehouse: "Jaipur North",
    farmer: "Meena Devi",
    dist: "12 km",
    trend: 3,
    category: "Vegetables",
    harvestDate: "2026-09-20",
    organicCertified: true,
    gradingConfidence: 91,
    description: "Cured red onions, dry papery skin, storage-grade quality.",
  },
  {
    id: "FL-24093",
    crop: "Potato",
    hi: "आलू",
    grade: "B",
    qty: 540,
    price: 22,
    old: 3,
    warehouse: "Sanganer Hub",
    farmer: "Sita Ram",
    dist: "18 km",
    trend: -2,
    category: "Vegetables",
    harvestDate: "2026-09-19",
    organicCertified: false,
    gradingConfidence: 86,
    description: "Medium-size table potatoes, clean skin, ideal for cooking.",
  },
  {
    id: "FL-24094",
    crop: "Wheat",
    hi: "गेहूं",
    grade: "A",
    qty: 2400,
    price: 25,
    old: 5,
    warehouse: "Jaipur North",
    farmer: "Ramesh Kumar",
    dist: "12 km",
    trend: 5,
    category: "Cereals & millets",
    harvestDate: "2026-09-17",
    organicCertified: false,
    gradingConfidence: 95,
    description: "Sharbati golden wheat, low moisture (10.8%), premium milling grade.",
  },
  {
    id: "FL-24095",
    crop: "Rapeseed & mustard",
    hi: "सरसों",
    grade: "A",
    qty: 950,
    price: 58,
    old: 4,
    warehouse: "Alwar Mandi Hub",
    farmer: "Kailash Chand",
    dist: "35 km",
    trend: 6,
    category: "Oilseeds",
    harvestDate: "2026-09-18",
    organicCertified: true,
    gradingConfidence: 92,
    description: "High oil-content (41.2%) black mustard seeds, lab-verified purity.",
  },
  {
    id: "FL-24096",
    crop: "French bean",
    hi: "फ्रेंच बीन",
    grade: "A",
    qty: 320,
    price: 45,
    old: 1,
    warehouse: "Jaipur North",
    farmer: "Anita Sharma",
    dist: "14 km",
    trend: 4,
    category: "Vegetables",
    harvestDate: "2026-09-21",
    organicCertified: true,
    gradingConfidence: 89,
    description: "Tender, hand-picked green beans, stringless, freshly crated.",
  },
];
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
  let ageDays = 0;
  if (harvestDate) {
    try {
      const rawStr = String(harvestDate);
      const parsed = new Date(rawStr.includes("T") ? rawStr : `${rawStr}T00:00:00`);
      if (!isNaN(parsed.getTime())) {
        ageDays = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86400000));
      }
    } catch {
      ageDays = 0;
    }
  }
  const perishable = String(category || "").toLowerCase().includes("fruit") || String(category || "").toLowerCase().includes("vegetable") || FLOWER_CROPS.has(crop);
  const gradeIndex = ["A", "B", "C"].indexOf(String(grade || "").toUpperCase());
  const adjustedGrade = perishable && gradeIndex >= 0 ? ["A", "B", "C"][Math.min(2, gradeIndex + Math.floor(ageDays / 7))] : (grade || "A");
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
  if (!root) return;
  const isHindi = language === "hi";
  const hindiPairs = Object.entries(hindiUI).sort((a, b) => b[0].length - a[0].length);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    // Preserve base English text on the node object to prevent cross-language drift
    if (node.__origText === undefined) {
      node.__origText = node.nodeValue;
    }
    const baseText = node.__origText;
    if (!baseText || !baseText.trim()) return;

    if (language === "en") {
      if (node.nodeValue !== baseText) node.nodeValue = baseText;
    } else if (isHindi) {
      let next = baseText;
      for (const [from, to] of hindiPairs) {
        if (next.includes(from)) next = next.split(from).join(to);
      }
      next = translateText(next, "hi");
      if (next !== node.nodeValue) node.nodeValue = next;
    } else {
      const translated = translateText(baseText, language);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    }
  });

  root.querySelectorAll("[placeholder],[aria-label]").forEach((element) => {
    ["placeholder", "aria-label"].forEach((attribute) => {
      const origKey = `__orig_${attribute}`;
      if (element[origKey] === undefined) {
        element[origKey] = element.getAttribute(attribute);
      }
      const baseValue = element[origKey];
      if (!baseValue) return;

      if (language === "en") {
        if (element.getAttribute(attribute) !== baseValue) element.setAttribute(attribute, baseValue);
      } else if (isHindi) {
        let next = baseValue;
        for (const [from, to] of hindiPairs) {
          if (next.includes(from)) next = next.split(from).join(to);
        }
        next = translateText(next, "hi");
        if (next !== element.getAttribute(attribute)) element.setAttribute(attribute, next);
      } else {
        const translated = translateText(baseValue, language);
        if (translated !== element.getAttribute(attribute)) element.setAttribute(attribute, translated);
      }
    });
  });
}

function useSpeechDictation(onResult, notify, lang = "hi") {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      if (notify) notify("Speech recognition is not active in this browser. Please type directly.");
      return;
    }
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    const langEntry = CONSTITUTIONAL_LANGUAGES.find((l) => l.code === lang);
    recognition.lang = langEntry?.speechCode || "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      if (text) onResult(text);
    };
    recognition.onerror = (event) => {
      console.warn("Search dictation notice:", event.error);
      setIsListening(false);
      if (notify && event.error !== "no-speech") {
        notify(`Speech notice (${event.error}). You can also type directly.`);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
      if (notify) notify("Listening… बोलिए… Speak your crop name now.");
    } catch {
      setIsListening(false);
    }
  };

  return { isListening, toggle };
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <section className="page" style={{ padding: "48px 24px", textAlign: "center", maxWidth: "680px", margin: "40px auto" }}>
          <h2>Something went wrong displaying this view</h2>
          <p style={{ color: "#666", margin: "12px 0 24px", fontSize: "15px" }}>
            {this.props.fallbackMessage || "An unexpected error occurred while rendering this page."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              className="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
            >
              {this.props.resetText || "Reload view"}
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [lang, setLang] = useState("en"),
    [view, setView] = useState("home"),
    [authRole, setAuthRole] = useState("consumer"),
    [lots, setLots] = useState(initialLots),
    [selectedLot, setSelectedLot] = useState(null),
    [farmerVerification, setFarmerVerification] = useState(() => {
      try {
        const saved = localStorage.getItem("farmlink_farmer_verification");
        if (saved) return JSON.parse(saved);
      } catch {}
      return {
        status: "verified",
        id: "KYC-RJ-2026-9812",
        farmerName: "Ramesh Kumar",
        mobile: "+91 98290 14820",
        idType: "Aadhaar Card",
        idNumber: "4920-8812-7741",
        landState: "Rajasthan",
        landDistrict: "Jaipur",
        village: "Phulera",
        landAcres: "4.5",
        khasraNumber: "412/1 & 412/2",
        cropsGrown: "Mustard, Tomato, Wheat",
        bankName: "State Bank of India (Phulera)",
        accountNumber: "30984920112",
        ifsc: "SBIN0031129",
        upiId: "ramesh.kisan@sbi",
        fpoName: "Kisan Samriddhi FPO",
        submittedAt: "2026-09-18T10:30:00.000Z",
        reviewedAt: "2026-09-19T14:15:00.000Z",
        reviewerNote: "Land survey record and Aadhaar verified with Phulera cluster officer."
      };
    }),
    [cart, setCart] = useState([]),
    [wishlist, setWishlist] = useState([]),
    [modal, setModal] = useState(null),
    [aiInitialCrop, setAiInitialCrop] = useState(null),
    [farmerListingPrefill, setFarmerListingPrefill] = useState(null),
    [toast, setToast] = useState(""),
    [session, setSession] = useState(null),
    [passwordRecovery, setPasswordRecovery] = useState(() => new URLSearchParams(window.location.search).has("reset-password") || window.location.hash.includes("type=recovery")),
    [produceRequests, setProduceRequests] = useState([]),
    [orders, setOrders] = useState([]),
    [notifications, setNotifications] = useState([]),
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
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("farmlink_theme") || "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      if (document.body) document.body.setAttribute("data-theme", theme);
      localStorage.setItem("farmlink_theme", theme);
    } catch {}
  }, [theme]);
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const tUI = (text) => {
    if (!text) return "";
    if (lang === "en") return text;
    return translateText(text, lang);
  };
  useEffect(() => {
    try {
      localStorage.setItem("farmlink_farmer_verification", JSON.stringify(farmerVerification));
    } catch {}
  }, [farmerVerification]);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    let generation = 0;
    const restore = async (authSession) => {
      const requestGeneration = ++generation;
      if (!authSession) { if (active) setSession(null); return; }
      const { data: profile } = await supabase.from("profiles").select("role,full_name,farmer_id").eq("id", authSession.user.id).single();
      if (active && requestGeneration === generation && profile) setSession({ role: profile.role, label: profile.full_name, name: profile.full_name, farmerId: profile.farmer_id, userId: authSession.user.id });
    };
    supabase.auth.getSession().then(({ data }) => restore(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      // Supabase calls this inside its auth lock; database work must run later.
      window.setTimeout(() => { if (active) restore(authSession); }, 0);
      if (event === "SIGNED_OUT") { setCart([]); setOrders([]); setNotifications([]); setModal(null); setView("home"); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    supabase.rpc("get_marketplace_inventory").then(({ data, error }) => {
      if (error || !active || !data || !Array.isArray(data) || data.length === 0) return;
      setLots(data.map((listing) => {
        const freshness = freshnessForListing(listing.warehouse_grade, listing.harvest_date, listing.category, listing.crop);
        const rawId = listing.id != null ? String(listing.id) : Math.random().toString(36).slice(2, 8);
        return {
          id: "LIST-" + rawId.slice(-6).toUpperCase(),
          listing: true,
          listingId: listing.id,
          dbId: listing.produce_lot_id,
          crop: listing.crop || "Produce",
          hi: listing.crop || "उपज",
          grade: freshness.grade,
          qty: Number(listing.quantity_kg || 0),
          price: Number(listing.price_per_kg || 0),
          old: freshness.ageDays,
          warehouse: listing.warehouse_name || "Verified warehouse intake",
          farmer: listing.farmer_name || "FarmLink farmer",
          dist: "Not calculated",
          trend: 0,
          imageUrl: listing.image_url || listing.warehouse_image_url,
          farmerImageUrl: listing.image_url,
          farmerImageUrls: listing.image_urls?.length ? listing.image_urls : [listing.image_url].filter(Boolean),
          warehouseImageUrl: listing.warehouse_image_url,
          gradingConfidence: listing.grading_confidence,
          description: listing.description,
          category: listing.category,
          harvestDate: listing.harvest_date,
          uploadedAt: listing.created_at,
          freshnessGradeChanged: freshness.perishable && freshness.grade !== listing.warehouse_grade
        };
      }));
    });
    return () => { active = false; };
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
    let active = true;
    const loadOrders = async (showError = false) => {
      // Makes an expired cancellation window durable even on projects where
      // database cron is unavailable, before reading the live order state.
      try {
        await supabase.rpc("expire_consumer_cancellation_windows");
      } catch (err) {
        console.warn("expire_consumer_cancellation_windows notice:", err);
      }
      try {
        const result = session.role === "admin"
          ? await supabase.rpc("get_admin_consumer_orders")
          : await supabase
              .from("consumer_orders")
              .select("id,order_code,total_kg,total_amount,status,cancellation_expires_at,created_at,warehouses(name)")
              .eq("consumer_id", session.userId)
              .order("created_at", { ascending: false });
        const { data, error } = result;
        if (error) {
          console.warn("Orders could not be loaded:", error.message);
          if (showError && !error.message.includes("recursion")) {
            notify(`Orders could not be loaded: ${error.message}`);
          }
          return;
        }
        if (active && data) {
          setOrders(data.map((order) => ({
            id: order.order_code,
            dbId: order.id,
            quantity: Number(order.total_kg || 0),
            totalAmount: Number(order.total_amount || 0),
            items: 0,
            status: (order.status || "pending_verification")
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            cancellationDeadline: order.cancellation_expires_at
              ? new Date(order.cancellation_expires_at).getTime()
              : null,
            pickupWarehouse: order.warehouse_name || order.warehouses?.name || "Warehouse",
            consumerName: order.consumer_name || "",
            consumerAddress: order.consumer_address || "",
            consumerMobile: order.consumer_mobile || "",
            createdAt: order.created_at,
          })));
        }
      } catch (err) {
        console.warn("loadOrders exception:", err);
      }
    };
    loadOrders(false);
    // Covers an order made in another browser when a realtime event is missed.
    const refreshTimer = window.setInterval(() => loadOrders(false), 5000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, [session?.role, session?.userId, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || session?.role !== "consumer" || !session?.userId) return;
    supabase.from("consumer_notifications").select("id,title,body,created_at,read_at").eq("consumer_id", session.userId).order("created_at", { ascending: false }).limit(8).then(({ data, error }) => {
      if (!error) setNotifications(data || []);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "consumer_notifications" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "bulk_requests" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "logistics_jobs" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "farmer_listings" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "produce_lots" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "msp_rates" }, () => setLiveTick((tick) => tick + 1))
      .on("postgres_changes", { event: "*", schema: "public", table: "market_price_snapshots" }, () => setLiveTick((tick) => tick + 1))
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
  const toastTimerRef = useRef(null);
  const lastToastRef = useRef({ msg: "", time: 0 });
  const notify = (m) => {
    if (!m) return;
    const now = Date.now();
    if (lastToastRef.current.msg === m && now - lastToastRef.current.time < 1200) {
      return;
    }
    lastToastRef.current = { msg: m, time: now };
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(m);
    toastTimerRef.current = setTimeout(() => setToast(""), 3000);
  };
  const reserve = (lot) => {
    if (!lot) return;
    if (session?.role !== "consumer") {
      setAuthRole("consumer");
      setView("auth");
      notify("Please sign in as consumer to reserve produce.");
      return;
    }
    if (lot.listing && !lot.warehouseImageUrl) {
      notify(
        "This farmer photo listing is awaiting warehouse intake. Checkout opens once a live grading photo confirms the stock.",
      );
      return;
    }
    const alreadyReserved = (cart || []).reduce((sum, item) => sum + Number(item?.quantityKg || 0), 0);
    const liveLot = (lots || []).find((item) => String(item?.id) === String(lot.id));
    if (!liveLot) return notify("This listing is no longer available.");
    const quantityKg = Math.min(10, 50 - alreadyReserved, availableToAdd(liveLot, cart));
    if (quantityKg <= 0) {
      notify("A consumer order can contain up to 50 kg. Adjust your cart to add more.");
      return;
    }
    setCart((current) => {
      const safeCart = Array.isArray(current) ? current : [];
      const existing = safeCart.find((item) => String(item?.id) === String(lot.id));
      return existing
        ? safeCart.map((item) =>
            String(item?.id) === String(lot.id)
              ? { ...item, quantityKg: item.quantityKg + quantityKg }
              : item,
          )
        : [...safeCart, { ...liveLot, quantityKg }];
    });
    notify(`${quantityKg} kg added. Stock is reserved when you place the order.`);
  };
  const updateCartQuantity = (lotId, requestedQuantity) => {
    try { setCart(updateQuantity(cart, lots, lotId, requestedQuantity)); }
    catch (error) { notify(error.message); }
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
      if (!isSupabaseConfigured || session?.role !== "consumer" || !session?.userId) return notify("Please sign in as a consumer before placing an order.");
      const id = `ORD-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
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
      setLiveTick((tick) => tick + 1);
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
  const confirmOrderCollection = async (id) => {
    const order = orders.find((item) => item.id === id);
    if (!order || String(order.status).toLowerCase() !== "ready for pickup") return false;
    if (isSupabaseConfigured && order.dbId) {
      const { error } = await supabase.rpc("confirm_consumer_order_collection", { p_order_id: order.dbId });
      if (error) { notify(error.message); return false; }
    }
    setOrders((current) => current.map((item) => item.id === id ? { ...item, status: "Completed" } : item));
    setLiveTick((tick) => tick + 1);
    notify("Collection confirmed. The warehouse and admin teams have been updated.");
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
    if (destination === "market") {
      setView("market");
      return;
    }
    if (destination === "farmer" && !["farmer", "admin"].includes(session?.role)) {
      setAuthRole("farmer");
      setView("auth");
      notify("Please log in with your Farmer ID and password to access the farmer dashboard.");
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
  const openCart = () => {
    if (!session) return access("consumer", "consumer");
    if (session.role !== "consumer") return notify("The checkout cart is available only to consumer accounts.");
    if (!cart.length) { setView("market"); return notify("Your cart is empty. Add marketplace produce before checking out."); }
    setModal("checkout");
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
  if (passwordRecovery) return <PasswordRecovery onComplete={() => { setPasswordRecovery(false); window.history.replaceState({}, "", window.location.pathname); setView("auth"); notify("You can now sign in with your updated password."); }}/>;
  return (
    <>
      {/* Sleek Announcement Ribbon */}
      <div className="top-announcement-banner">
        <span className="banner-pulse"></span>
        <span className="banner-text">
          🌾 {tUI("Government e-NWR Integration: WDRA warehouse pledge finance at 50% MSP")}
        </span>
        <button type="button" onClick={() => setModal("agentic")} className="banner-action-btn">
          {tUI("Check Eligibility")} →
        </button>
      </div>

      {/* Main Glass Header */}
      <header className="glass-nav">
        {/* Left: Brand */}
        <button className="brand-jivexa" onClick={() => setView("home")}>
          <div className="brand-icon-box">
            <Sprout size={20} />
          </div>
          <span className="brand-name">
            Farm<span>Link</span>
            <span className="brand-os-badge">OS</span>
          </span>
        </button>

        {/* Center: Segmented Navigation Pills */}
        <nav className="nav-segmented">
          <button
            className={view === "market" ? "nav-pill active" : "nav-pill"}
            onClick={() => access("consumer", "market")}
          >
            {tUI("Marketplace")}
          </button>
          <button
            className={view === "bulk" ? "nav-pill active" : "nav-pill"}
            onClick={() => access("consumer", "bulk")}
          >
            {tUI("Wholesale")}
          </button>
          <button
            className={view === "analytics" ? "nav-pill active" : "nav-pill"}
            onClick={() => setView("analytics")}
          >
            {tUI("Analytics & Demand")}
          </button>
          <button
            className={view === "logistics" ? "nav-pill active" : "nav-pill"}
            onClick={() => setView("logistics")}
          >
            {tUI("Logistics")}
          </button>
          {session?.role !== "consumer" && (
            <button
              className={view === "warehouse" ? "nav-pill active" : "nav-pill"}
              onClick={() => access("admin", "warehouse")}
            >
              {tUI("Warehouse")}
            </button>
          )}
          <button
            className={view === "farmer" ? "nav-pill active" : "nav-pill"}
            onClick={() => access("farmer", "farmer")}
          >
            {tUI("Farmer")}
          </button>
        </nav>

        {/* Right: Consolidated Action Cluster */}
        <div className="head-actions-jivexa">
          {/* Compact 22-Language Selector Pill */}
          <div className="lang-pill" title="Translate into all 22 official Indian languages">
            <Languages size={14} className="lang-icon" />
            <select
              aria-label="Interface language"
              value={lang}
              onChange={(event) => {
                const newLang = event.target.value;
                setLang(newLang);
                const selected = CONSTITUTIONAL_LANGUAGES.find((l) => l.code === newLang);
                if (selected && newLang !== "en") {
                  notify(`Translated to ${selected.nativeName} (${selected.name})`);
                }
              }}
            >
              {CONSTITUTIONAL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Voice Assistant Mic Button */}
          <button
            type="button"
            className="top-icon-btn voice-trigger-btn"
            onClick={() => setModal("voice")}
            title="Multilingual Voice Assistant (22 Indic Languages)"
            aria-label="Open Voice AI"
          >
            <Mic size={16} />
          </button>

          {/* AI Copilot Launcher */}
          <button
            type="button"
            className="top-ai-copilot-btn"
            onClick={() => setModal("agentic")}
            title="Open FarmLink Dual-Engine AI Copilot"
          >
            <Sparkles size={14} />
            <span>{tUI("AI Copilot")}</span>
          </button>

          {/* Theme Toggle (☀️/🌙) */}
          <button
            type="button"
            className="top-icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Shopping Cart Button with Badge */}
          <button
            type="button"
            className="top-icon-btn cart-pill-btn"
            aria-label="Open shopping cart"
            onClick={openCart}
            title="Shopping Cart"
          >
            <ShoppingCart size={16} />
            {cart.length > 0 && <span className="cart-badge-count">{cart.length}</span>}
          </button>

          {/* Profile / Sign In */}
          {session ? (
            <div className="auth-cluster">
              <button
                className="top-auth-btn"
                onClick={() =>
                  session.role === "admin"
                    ? setView("admin")
                    : setView(session.role === "farmer" ? "farmer" : "consumer")
                }
                title={session.label}
              >
                <UserRound size={15} />
                <span>{session.label.split(" ")[0]}</span>
              </button>
              <button
                type="button"
                className="top-icon-btn logout-btn"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="top-auth-btn signin-btn" onClick={() => setView("auth")}>
              <UserRound size={15} />
              <span>{tUI("Sign in")}</span>
            </button>
          )}
        </div>
      </header>
      <main>
        <ErrorBoundary fallbackMessage="The application encountered an error loading this view. You can reload or return to the home screen." onReset={() => setView("home")}>
          {view === "home" && (
          <Home
            t={t}
            lots={lots}
            setView={setView}
            access={access}
            reserve={reserve}
            setModal={setModal}
            lang={lang}
            tUI={tUI}
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
            lang={lang}
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
            confirmOrderCollection={confirmOrderCollection}
            notifications={notifications}
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
            setAiInitialCrop={setAiInitialCrop}
            listingPrefill={farmerListingPrefill}
            produceRequests={produceRequests}
            setProduceRequests={setProduceRequests}
            liveTick={liveTick}
            notify={notify}
            farmerVerification={farmerVerification}
            setFarmerVerification={setFarmerVerification}
            lang={lang}
          />
        )}{" "}
        {view === "auth" && (
          <AuthView initialRole={authRole} setSession={setSession} setView={setView} notify={notify} />
        )}{" "}
        {["privacy", "terms", "disclaimer"].includes(view) && <LegalPage type={view} setView={setView} />}
        {view === "analytics" && (
          <section className="page">
            <div className="page-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p className="eyebrow green">REAL-TIME PLATFORM INTELLIGENCE</p>
                <h1 style={{ margin: '4px 0 8px' }}>Executive Analytics &amp; AI Demand Forecasting</h1>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Transparent economic KPIs, 36-month backtested SARIMAX forecasting, and farmer realization analytics.</p>
              </div>
              <button className="secondary" onClick={() => setView("home")}>← Back to Home</button>
            </div>
            <AdminAnalyticsEngine lots={lots} orders={orders} />
            <DemandForecastEngine initialCrop="Mustard" />
          </section>
        )}
        {view === "logistics" && (
          <section className="page">
            <div className="page-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p className="eyebrow green">CONNECTED AGRI SUPPLY CHAIN</p>
                <h1 style={{ margin: '4px 0 8px' }}>End-to-End Fleet Logistics &amp; Handoff Hub</h1>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Order ➔ Pickup Assignment ➔ Farmgate Weighment &amp; QR Tag ➔ WDRA Warehouse ➔ Final Buyer Delivery.</p>
              </div>
              <button className="secondary" onClick={() => setView("home")}>← Back to Home</button>
            </div>
            <LogisticsWorkflowHub notify={notify} />
          </section>
        )}
        {view === "admin" && session?.role === "admin" && (
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
              farmerVerification={farmerVerification}
              setFarmerVerification={setFarmerVerification}
            />
            <AdminOrderConfirmation
              orders={orders}
              confirmOrder={confirmOrder}
            />
          </>
        )}
        </ErrorBoundary>
      </main>
      {modal === "voice" && (
        <Voice close={() => setModal(null)} notify={notify} />
      )}{" "}
      {modal === "ai" && (
        <FreeAdvisory
          close={() => {
            setModal(null);
            setAiInitialCrop(null);
          }}
          initialCrop={aiInitialCrop}
          myLots={lots.filter(l => l.farmer === "Ramesh Kumar" || l.farmer === session?.name)}
          onListCrop={(cropName, suggestedPrice) => {
            setModal(null);
            setAiInitialCrop(null);
            setView("farmer");
            setFarmerListingPrefill({ crop: cropName, price: suggestedPrice });
            notify(`AI guidance applied: listing ${cropName} at ₹${suggestedPrice}/kg.`);
            setTimeout(() => {
              const el = document.querySelector(".photo-listing");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 180);
          }}
          onHoldCrop={(cropName) => {
            setModal(null);
            setAiInitialCrop(null);
            setView("farmer");
            notify(`Holding decision recorded for ${cropName}. e-NWR pledge section ready.`);
            setTimeout(() => {
              const el = document.querySelector(".integration-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 180);
          }}
          notify={notify}
        />
      )}{" "}
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
      {modal === "agentic" && (
        <AgenticCopilot
          isOpen={true}
          onClose={() => setModal(null)}
          session={session}
          lots={lots}
          cart={cart}
          updateCartQuantity={updateCartQuantity}
          setFarmerListingPrefill={setFarmerListingPrefill}
          setView={setView}
          notify={notify}
        />
      )}{" "}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
      <SiteFooter setView={setView} notify={notify} lang={lang} tUI={tUI} />
      <AgenticDockLauncher onOpen={() => setModal("agentic")} /> 
    </>
  );
}

function SiteFooter({ setView, notify, lang, tUI }) {
  const [email, setEmail] = useState("");
  const tr = tUI || ((x) => translateText(x, lang));
  const go = (view) => { setView(view); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const subscribe = (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return notify("Enter a valid email address to subscribe.");
    notify(tr("Thanks — your FarmLink updates subscription has been recorded."));
    setEmail("");
  };
  return (
    <footer className="jivexa-footer">
      <div className="footer-grid-jivexa">
        <div className="footer-col">
          <div className="brand" style={{ marginBottom: "16px", cursor: "pointer", display: "inline-flex", alignItems: "center" }} onClick={() => go("home")}>
            <span style={{ display: "inline-flex", background: "rgba(16, 185, 129, 0.2)", padding: "6px", borderRadius: "8px", color: "var(--primary)" }}>
              <Sprout size={22} />
            </span>
            <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginLeft: "8px" }}>
              Farm<span style={{ color: "var(--primary)" }}>Link</span> <span className="brand-badge">OS</span>
            </span>
          </div>
          <p>
            {tr("Next-generation farm-to-warehouse infrastructure combining WDRA-compliant storage, 50% pledge advances, live Mandi Agmarknet pricing, and multilingual AI voice copilot.")}
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <a href="https://www.instagram.com/farmlink_30?stkn=MW5nZGM1NjYzdXh4cw==" target="_blank" rel="noreferrer" aria-label="FarmLink on Instagram" style={{ color: "#94a3b8", fontSize: "0.85rem", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px" }}>Instagram</a>
            <a href="https://youtube.com/@farmlink_30?si=q0HJLuXgeHG6ggsb" target="_blank" rel="noreferrer" aria-label="FarmLink on YouTube" style={{ color: "#94a3b8", fontSize: "0.85rem", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px" }}>YouTube</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{tr("Ecosystem")}</h4>
          <ul>
            <li><button onClick={() => go("market")}>{tr("Marketplace")}</button></li>
            <li><button onClick={() => go("bulk")}>{tr("Wholesale")}</button></li>
            <li><button onClick={() => go("farmer")}>{tr("Farmer Portal")}</button></li>
            <li><button onClick={() => go("warehouse")}>{tr("Warehouse & e-NWR")}</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{tr("Support & Contact")}</h4>
          <ul>
            <li><a href="mailto:farmlink30@gmail.com">farmlink30@gmail.com</a></li>
            <li><a href="tel:+918209193509">+91 82091 93509</a></li>
            <li><span style={{ color: "#94a3b8", fontSize: "0.86rem" }}>{tr("India · FarmLink SIH 26033")}</span></li>
            <li><button onClick={() => go("disclaimer")}>{tr("Platform disclaimer")}</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{tr("Market Updates")}</h4>
          <p>{tr("Get updates on FarmLink features, fresh stock and farmer-first initiatives.")}</p>
          <form onSubmit={subscribe} style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            <input
              aria-label="Email for FarmLink updates"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                fontSize: "0.85rem"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 700,
                border: "0",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              {tr("Subscribe")}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom-jivexa">
        <small>© 2026 FarmLink OS. {tr("All rights reserved.")}</small>
        <div className="footer-bottom-links">
          <button onClick={() => go("privacy")}>{tr("Privacy Policy")}</button>
          <button onClick={() => go("terms")}>{tr("Terms of Service")}</button>
          <button onClick={() => go("disclaimer")}>{tr("Platform disclaimer")}</button>
        </div>
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ background: "transparent", border: "0", color: "#cbd5e1", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          {tr("Back to top")} <ArrowUp size={15} />
        </button>
      </div>
    </footer>
  );
}
function LegalPage({ type, setView }) {
  const content = {
    privacy: { title: "Privacy Policy", intro: "FarmLink collects only the information needed to provide marketplace, fulfillment, and account services.", sections: [["Information we use", "Account details, contact information, farm and listing data, orders, and operational records are used to run the platform and maintain traceability."], ["How we protect it", "Access is role-based, operational data is stored in Supabase, and sensitive actions are restricted to authenticated users."], ["Your choices", "You may request access, correction, or deletion of eligible personal information by contacting farmlink30@gmail.com."]] },
    terms: { title: "Terms of Service", intro: "By using FarmLink, you agree to use the platform lawfully and provide accurate account, listing, and transaction information.", sections: [["Marketplace conduct", "Farmers must provide accurate crop, harvest, price, and quality information. Buyers must submit genuine orders and quotations."], ["Pricing and fulfillment", "MSP or verified price floors are enforced where configured. Final grade, quantity, availability, and fulfillment remain subject to warehouse verification."], ["Accounts", "Keep your login credentials secure. FarmLink may restrict accounts that misuse the platform or compromise marketplace integrity."]] },
    disclaimer: { title: "Platform Disclaimer", intro: "FarmLink is an SIH 2026 demonstration platform and not a lender, insurer, government procurement body, or legal adviser.", sections: [["AI guidance", "AI grading, ranking, route, and price insights are decision-support tools. They are not guarantees of quality, market outcome, delivery, or financial return."], ["Market data", "MSP and price-floor information must be verified against the cited official source. Administrators are responsible for source-backed reference floors for crops without an official MSP."], ["External services", "Maps, social sites, and third-party services are governed by their own terms and availability."]] },
  }[type];
  return <section className="page legal-page"><button className="secondary" onClick={() => setView("home")}>← Back to FarmLink</button><p className="eyebrow green">FARMLINK LEGAL</p><h1>{content.title}</h1><p className="legal-intro">{content.intro}</p>{content.sections.map(([heading, body]) => <article key={heading}><h2>{heading}</h2><p>{body}</p></article>)}<p className="legal-contact">Questions? Contact <a href="mailto:farmlink30@gmail.com">farmlink30@gmail.com</a>.</p></section>;
}
function Home({ t, lots, setView, access, reserve, setModal, lang, tUI }) {
  const tr = tUI || ((x) => translateText(x, lang));
  return (
    <>
      <section className="hero-jivexa">
        <div className="hero-copy-jivexa">
          <div className="hero-tag">
            <span className="pulse-dot"></span>
            <span className="hero-tag-text">{tr("India's 1st Dual-Engine Agri Copilot & e-NWR Grid")}</span>
          </div>

          <h1 className="hero-title-jivexa">
            {tr("Agricultural Trade Works Better")} <br />
            <span className="text-gradient-emerald">{tr("When It's Connected")}</span>
          </h1>

          <p className="hero-subtitle-jivexa">
            {tr("Next-generation farm-to-warehouse infrastructure combining WDRA-compliant storage, 50% pledge advances, live Mandi Agmarknet pricing, and multilingual AI voice copilot.")}
          </p>

          <div className="hero-cta-row">
            <button className="hero-btn-primary" onClick={() => setModal("agentic")}>
              <Sparkles size={18} />
              {tr("Launch AI Copilot 🚀")}
            </button>
            <button className="hero-btn-secondary" onClick={() => access("consumer", "market")}>
              <Store size={18} />
              {tr("Explore Marketplace")}
            </button>
          </div>

          <div className="hero-trust-row">
            <div className="hero-trust-item">
              <ShieldCheck size={18} />
              <span>{tr("e-NWR Compliant")}</span>
            </div>
            <div className="hero-trust-item">
              <TrendingUp size={18} />
              <span>{tr("Real-time Mandi Sync")}</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={18} />
              <span>{tr("Zero Distress Sales")}</span>
            </div>
          </div>
        </div>

        <div className="hero-visual-container">
          <div className="pulse-slow-aura"></div>
          <div className="showcase-glass-card">
            <div className="showcase-header">
              <div className="showcase-title-row">
                <TrendingUp size={18} color="var(--primary)" />
                <b style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{tr("Live Mandi & e-NWR Pulse")}</b>
              </div>
              <span className="showcase-live-badge">
                <span className="pulse-dot"></span> {tr("Agmarknet Live")}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="ticker-item">
                <div className="ticker-crop-info">
                  <span style={{ fontSize: "1.2rem" }}>🌾</span>
                  <div>
                    <div>{tr("Wheat (Kanak)")}</div>
                    <small style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Jaipur North Mandi</small>
                  </div>
                </div>
                <div className="ticker-rate-info">
                  <div className="ticker-price">₹2,425/qtl</div>
                  <span className="ticker-trend">+4.2% {tr("Today")}</span>
                </div>
              </div>

              <div className="ticker-item">
                <div className="ticker-crop-info">
                  <span style={{ fontSize: "1.2rem" }}>🟡</span>
                  <div>
                    <div>{tr("Mustard (Sarson)")}</div>
                    <small style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Alwar Hub</small>
                  </div>
                </div>
                <div className="ticker-rate-info">
                  <div className="ticker-price">₹5,650/qtl</div>
                  <span className="ticker-trend">+2.8% {tr("Spread")}</span>
                </div>
              </div>

              <div className="ticker-item">
                <div className="ticker-crop-info">
                  <span style={{ fontSize: "1.2rem" }}>🍅</span>
                  <div>
                    <div>{tr("Tomato (Hybrid)")}</div>
                    <small style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Sanganer Cluster</small>
                  </div>
                </div>
                <div className="ticker-rate-info">
                  <div className="ticker-price">₹27/kg</div>
                  <span className="ticker-trend">+8.0% {tr("Today")}</span>
                </div>
              </div>
            </div>

            <div className="enwr-preview-box">
              <div className="enwr-preview-title">
                <span>{tr("e-NWR 50% Pledge Loan Advance")}</span>
                <Coins size={16} />
              </div>
              <p className="enwr-preview-text">
                {tr("Deposit harvest in certified warehouse. Avail instant 50% working capital advance against electronic negotiable warehouse receipts.")}
              </p>
              <button type="button" className="enwr-preview-action" onClick={() => setModal("agentic")}>
                {tr("Calculate Pledge Advance with Copilot")} →
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "4px" }}>
              <button
                type="button"
                onClick={() => setModal("voice")}
                style={{
                  fontSize: "0.78rem",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                  color: "var(--text-main)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <Mic size={13} color="var(--primary)" /> {tr("Voice AI Assistant")}
              </button>
              <button
                type="button"
                onClick={() => access("farmer", "farmer")}
                style={{
                  fontSize: "0.78rem",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                  color: "var(--text-main)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <Warehouse size={13} color="var(--primary)" /> {tr("Book Warehouse Intake")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* JIVEXA 4-PILLAR ECOSYSTEM */}
      <section className="ecosystem-section">
        <div className="section-header-jivexa">
          <span className="section-tag-jivexa">{tr("Connected Agri-Stack")}</span>
          <h2 className="section-title-jivexa">{tr("Four Pillars of Seamless Trade")}</h2>
          <p className="section-subtitle-jivexa">
            {tr("Uniting growers, certified warehouses, aggregators, and institutional buyers in one transparent, data-driven ecosystem.")}
          </p>
        </div>
        <div className="eco-grid-4">
          <div className="eco-card">
            <div className="eco-card-icon"><Leaf size={22} /></div>
            <h3 className="eco-card-title">{tr("Smallholder Farmers")}</h3>
            <p className="eco-card-desc">{tr("Zero distress sales. Get fair MSP price floors, door-step cluster pickup, and instant digital payments upon delivery.")}</p>
            <button className="eco-card-link" onClick={() => access("farmer", "farmer")}>
              {tr("Farmer Portal")} →
            </button>
          </div>
          <div className="eco-card">
            <div className="eco-card-icon"><Warehouse size={22} /></div>
            <h3 className="eco-card-title">{tr("Accredited Warehouses")}</h3>
            <p className="eco-card-desc">{tr("WDRA-certified storage with automated weight intake, sensor humidity tracking, and electronic e-NWR receipt generation.")}</p>
            <button className="eco-card-link" onClick={() => access("admin", "warehouse")}>
              {tr("Warehouse & e-NWR")} →
            </button>
          </div>
          <div className="eco-card">
            <div className="eco-card-icon"><Store size={22} /></div>
            <h3 className="eco-card-title">{tr("Direct Institutional Buyers")}</h3>
            <p className="eco-card-desc">{tr("Source lab-tested, human-verified Grade A produce directly from climate-controlled storage hubs with guaranteed provenance.")}</p>
            <button className="eco-card-link" onClick={() => access("consumer", "market")}>
              {tr("Explore Marketplace")} →
            </button>
          </div>
          <div className="eco-card">
            <div className="eco-card-icon"><Bot size={22} /></div>
            <h3 className="eco-card-title">{tr("Dual-Engine AI Copilot")}</h3>
            <p className="eco-card-desc">{tr("Real-time Agmarknet intelligence, multi-dialect Indic voice consultation via OpenAI Whisper + Sarvam AI, and freight route optimization.")}</p>
            <button className="eco-card-link" onClick={() => setModal("agentic")}>
              {tr("Launch AI Copilot 🚀")} →
            </button>
          </div>
        </div>
      </section>

      {/* VERIFIED WAREHOUSE INVENTORY */}
      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow green">{tr("LIVE FROM NEARBY WAREHOUSES")}</p>
            <h2>{t.stock}</h2>
          </div>
          <button
            className="text-btn"
            onClick={() => access("consumer", "market")}
          >
            {tr("View marketplace")} <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="cards">
          {(lots || []).map((l) => (
            <LotCard key={l?.id || Math.random()} lot={l} onClick={() => reserve(l)} />
          ))}
        </div>
      </section>

      {/* MODERN ONE CONNECTED FLOW PIPELINE */}
      <section className="flow-pipeline-section">
        <div className="flow-pipeline-header">
          <div className="flow-tag">
            <span className="pulse-dot"></span>
            <span className="flow-tag-text">{tr("SEAMLESS AGRI-STACK PIPELINE")}</span>
          </div>
          <h2 className="flow-pipeline-title">
            {tr("One Connected Flow.")}{" "}
            <span className="text-gradient-emerald">{tr("Complete Transparency.")}</span>
          </h2>
          <p className="flow-pipeline-subtitle">
            {tr("From farm-gate collection to digital e-NWR warehouse custody, real-time AI pricing, and direct institutional settlement.")}
          </p>
        </div>

        <div className="flow-pipeline-grid">
          <div className="pipeline-card">
            <div className="pipeline-card-top">
              <span className="pipeline-step-badge">01</span>
              <div className="pipeline-icon-box">
                <Truck size={22} />
              </div>
            </div>
            <h3 className="pipeline-card-title">{tr("Cluster Pickup & Logistics")}</h3>
            <p className="pipeline-card-desc">
              {tr("Doorstep village and FPO collection. AI-optimized routing groups farm harvests to eliminate middleman transport deductions.")}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div className="pipeline-pill-tag">
                <span>🌾 {tr("Farm-Gate Weighment")}</span>
              </div>
              <button
                type="button"
                className="text-btn"
                style={{ fontSize: '0.76rem', color: 'var(--primary)', padding: 0, fontWeight: 700 }}
                onClick={() => setView("logistics")}
              >
                Track Fleet ➔
              </button>
            </div>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-card-top">
              <span className="pipeline-step-badge">02</span>
              <div className="pipeline-icon-box">
                <Warehouse size={22} />
              </div>
            </div>
            <h3 className="pipeline-card-title">{tr("Warehouse Intake")}</h3>
            <p className="pipeline-card-desc">
              {tr("WDRA-certified weighment, multi-spectral camera assaying, and instant minting of electronic e-NWR negotiable warehouse receipts.")}
            </p>
            <div className="pipeline-pill-tag">
              <span>🏢 {tr("e-NWR Minted")}</span>
            </div>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-card-top">
              <span className="pipeline-step-badge">03</span>
              <div className="pipeline-icon-box">
                <BrainCircuit size={22} />
              </div>
            </div>
            <h3 className="pipeline-card-title">{tr("AI Demand & Price Guidance")}</h3>
            <p className="pipeline-card-desc">
              {tr("SARIMAX + LightGBM forecasting, 50% working capital pledge loan calculation, and multi-dialect voice consultation.")}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div className="pipeline-pill-tag">
                <span>⚡ {tr("50% Advance Ready")}</span>
              </div>
              <button
                type="button"
                className="text-btn"
                style={{ fontSize: '0.76rem', color: 'var(--primary)', padding: 0, fontWeight: 700 }}
                onClick={() => setView("analytics")}
              >
                Forecast Lab ➔
              </button>
            </div>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-card-top">
              <span className="pipeline-step-badge">04</span>
              <div className="pipeline-icon-box">
                <ShoppingCart size={22} />
              </div>
            </div>
            <h3 className="pipeline-card-title">{tr("Direct Market Access")}</h3>
            <p className="pipeline-card-desc">
              {tr("Verified institutional procurement and retail wholesale purchase with direct UPI settlement and end-to-end QR lot traceability.")}
            </p>
            <div className="pipeline-pill-tag">
              <span>💰 {tr("Zero Distress Sales")}</span>
            </div>
          </div>
        </div>

        <div className="flow-cta-banner">
          <div className="flow-cta-text">
            <h4>{tr("Explore FarmLink's Real-Time Intelligence & Fleet Network")}</h4>
            <p>{tr("Inspect quantitative AI demand predictions, real-time platform KPIs, and order-to-delivery logistics tracking.")}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="hero-btn-primary" onClick={() => setView("analytics")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <TrendingUp size={15} />
              <span>{tr("AI Demand & KPIs")}</span>
            </button>
            <button className="hero-btn-secondary" onClick={() => setView("logistics")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Truck size={15} />
              <span>{tr("Logistics Fleet Hub")}</span>
            </button>
            <button className="top-ai-copilot-btn" onClick={() => setModal("agentic")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Sparkles size={15} />
              <span>{tr("Launch Copilot 🚀")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MULTILINGUAL VOICE CONSULTATION BANNER */}
      <section className="voice-banner">
        <div className="mic">
          <Mic size={34} />
        </div>
        <div>
          <p className="eyebrow">{t.voice ? t.voice.toUpperCase() : "VOICE AI"}</p>
          <h2>{tr("Ask in your own language.")}</h2>
          <p>{tr("Call, speak, and get guided help with stock, prices or pickups.")}</p>
        </div>
        <button className="primary pale" onClick={() => setModal("voice")}>
          {tr("Try voice demo")} <Mic size={18} />
        </button>
      </section>
    </>
  );
}
function LotCard({ lot, onClick }) {
  if (!lot) return null;
  const cropName = String(lot.crop || "Produce");
  const cropClass = (lot.crop ? String(lot.crop) : "produce").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const farmerName = lot.farmer || "Direct Verified Farmer";
  const warehouseName = lot.warehouse || "Verified storage";
  const distText = lot.dist || "Nearby";
  const gradeText = lot.grade ? `Grade ${lot.grade}` : "Intake verified";
  const trend = Number(lot.trend || 0);
  const qty = Number(lot.qty || 0);
  const price = Number(lot.price || 0);
  const totalLotValue = qty * price;
  const ageDays = Number.isFinite(Number(lot.old)) ? Number(lot.old) : 0;
  let harvestDateFormatted = null;
  if (lot.harvestDate) {
    try {
      const rawDateStr = String(lot.harvestDate);
      const parsedDate = new Date(rawDateStr.includes("T") ? rawDateStr : `${rawDateStr}T00:00:00`);
      if (!isNaN(parsedDate.getTime())) {
        harvestDateFormatted = parsedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      }
    } catch {
      harvestDateFormatted = null;
    }
  }

  return (
    <article className="lot lot-card-modern">
      <div className={"lot-img " + cropClass}>
        {lot.imageUrl ? (
          <img src={lot.imageUrl} alt={`${cropName} grown by ${farmerName}`} />
        ) : (
          <span>{cropEmoji(cropName, lot.category)}</span>
        )}
        <div className="lot-img-badges">
          <span className="badge-grade">⭐ {gradeText}</span>
          <span className="badge-wdra">🛡️ WDRA Certified</span>
        </div>
        <i className="crop-emoji-badge" aria-label={`${cropName} crop icon`}>{cropEmoji(cropName, lot.category)}</i>
        <div className="lot-img-footer">
          <span className="badge-farmer">👨‍🌾 {farmerName}</span>
        </div>
      </div>

      <div className="lot-body">
        <div className="lot-title-row">
          <div>
            <h3 className="lot-crop-name">{cropName}</h3>
            <p className="lot-origin">
              <MapPin size={13} />
              {warehouseName} · {distText}
            </p>
          </div>
          <span className={`lot-trend-badge ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲ +" : "▼ "}
            {Math.abs(trend)}% vs MSP
          </span>
        </div>

        {/* Highlighted Price & Batch Value Section */}
        <div className="lot-pricing-block">
          <div className="lot-rate-primary">
            <span className="rate-currency">₹</span>
            <span className="rate-amount">{price}</span>
            <span className="rate-unit">/kg</span>
          </div>
          <div className="lot-total-val-badge">
            <span className="val-label">Lot Total:</span>
            <strong className="val-amount">₹{totalLotValue.toLocaleString("en-IN")}</strong>
            <span className="val-qty">({qty} kg)</span>
          </div>
        </div>

        {/* Freshness & Stock Metadata Bar */}
        <div className="lot-meta-bar">
          <div className="meta-item">
            <PackageCheck size={14} className="meta-icon" />
            <span><strong>{qty} kg</strong> in warehouse</span>
          </div>
          <div className="meta-item">
            <Clock3 size={14} className="meta-icon" />
            <span>{harvestDateFormatted ? `Harvested ${harvestDateFormatted} (${ageDays}d)` : `${ageDays} days fresh`}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="lot-action-row">
          <button type="button" className="lot-reserve-btn" onClick={onClick}>
            <ShoppingBag size={15} />
            <span>Reserve 10 kg · ₹{price * 10}</span>
          </button>
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
  lang = "en",
}) {
  const [filter, setFilter] = useState("All"),
    [grade, setGrade] = useState("Any"),
    [organic, setOrganic] = useState(false),
    [maxPrice, setMaxPrice] = useState(""),
    [sort, setSort] = useState("smart"),
    [query, setQuery] = useState("");
  const { isListening, toggle: toggleDictation } = useSpeechDictation(setQuery, notify, lang);
  const safeLots = Array.isArray(lots) ? lots.filter(Boolean) : [];
  const cropCategories = useMemo(
    () => [...new Set(safeLots.map((lot) => String(lot?.crop || "")).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [safeLots],
  );
  useEffect(() => {
    if (filter !== "All" && !cropCategories.includes(filter)) setFilter("All");
  }, [cropCategories, filter]);
  const visible = useMemo(
    () => rankAndFilter(safeLots, { crop: filter, grade, sort, query, organic, maxPrice }),
    [safeLots, filter, grade, sort, query, organic, maxPrice],
  );
  const favorite = (lot) => {
    if (!lot) return;
    setWishlist((items) => {
      const safeItems = Array.isArray(items) ? items : [];
      return safeItems.some((x) => String(x?.id) === String(lot.id))
        ? safeItems.filter((x) => String(x?.id) !== String(lot.id))
        : [...safeItems, lot];
    });
    notify(
      (wishlist || []).some((x) => String(x?.id) === String(lot.id))
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
            Ranked by verified quality, freshness and price. Every
            live lot has a traceable quality record.
          </p>
        </div>
        <div className="checkout">
          <b>
            {(cart || []).length} items · {total || 0} kg
          </b>
          <button
            className="primary"
            disabled={!(cart || []).length}
            onClick={onCheckout}
          >
            Checkout
          </button>
        </div>
      </div>
      <div className="market-tools">
        <div className="search-mic-wrap">
          <input
            aria-label="Search produce"
            placeholder="Search produce, farmer or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className={`search-mic-btn ${isListening ? "listening" : ""}`}
            onClick={toggleDictation}
            title={isListening ? "Listening… click to stop" : "Speak to search"}
            aria-label="Voice search dictation"
          >
            <Mic size={16} />
          </button>
        </div>
        <input className="price-filter" type="number" min="0" aria-label="Maximum price per kg" placeholder="Max ₹/kg" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}/>
        <select aria-label="Quality grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option>Any</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="smart">Smart ranking</option>
          <option value="price">Lowest price</option>
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
            {x === "All" ? <><span className="category-all">✦</span> All produce <small>{safeLots.length}</small></> : <><span className="category-icon">{cropEmoji(x)}</span><span>{x}</span><small>{safeLots.filter((lot) => lot?.crop === x).length}</small></>}
          </button>
        ))}
      </div>
      <p className="search-note">
        <BrainCircuit size={16} /> {visible.length} matching lots · Ranking uses verified grade, price within the same crop, and harvest age.
      </p>
      <div className="cards">
        {visible.map((l) => (
            <div className="product-wrap" key={l?.id || Math.random()}>
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
                    (wishlist || []).some((x) => String(x?.id) === String(l?.id))
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
      {!visible.length && (
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
  const saved = (wishlist || []).some((x) => String(x?.id) === String(lot.id));
  const cropName = String(lot.crop || "Produce");
  const cropClass = (lot.crop ? String(lot.crop) : "produce").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const galleryPhotos = [...new Set([lot.imageUrl, ...(lot.farmerImageUrls || []), lot.warehouseImageUrl].filter(Boolean))];
  const ageDays = Number.isFinite(Number(lot.old)) ? Number(lot.old) : 0;
  let harvestDateFormatted = null;
  if (lot.harvestDate) {
    try {
      const rawStr = String(lot.harvestDate);
      const d = new Date(rawStr.includes("T") ? rawStr : `${rawStr}T00:00:00`);
      if (!isNaN(d.getTime())) {
        harvestDateFormatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }
    } catch {
      harvestDateFormatted = null;
    }
  }
  let uploadedDateFormatted = null;
  if (lot.uploadedAt) {
    try {
      const d = new Date(lot.uploadedAt);
      if (!isNaN(d.getTime())) {
        uploadedDateFormatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }
    } catch {
      uploadedDateFormatted = null;
    }
  }
  const [selectedImage, setSelectedImage] = useState(lot.imageUrl);
  const activeImage = selectedImage || lot.imageUrl;
  return (
    <section className="page product-detail">
      <button className="text-btn" onClick={() => setView("market")}>
        ← Back to marketplace
      </button>
      <div className="detail-grid">
        <div className={"detail-visual " + cropClass}>
          {activeImage ? (
            <img src={activeImage} alt={`${cropName} listing`} />
          ) : (
            cropEmoji(cropName, lot.category)
          )}
          <i className="crop-emoji-badge detail-crop-emoji" aria-label={`${cropName} crop icon`}>{cropEmoji(cropName, lot.category)}</i>
          <span>{lot.listing ? "Farmer photo listing" : `Verified Grade ${lot.grade || "A"}`}</span>
          {galleryPhotos.length > 1 && (
            <div className="product-photo-gallery">
              {galleryPhotos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  className={`photo-thumbnail ${activeImage === photo ? "selected" : ""}`}
                  onClick={() => setSelectedImage(photo)}
                >
                  <img src={photo} alt={`${cropName} gallery image ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="eyebrow green">TRACEABLE LOT {lot.id}</p>
          <h1>
            {cropName} · Grade {lot.grade || "A"}
          </h1>
          <p>
            Harvested locally and human-verified at {lot.warehouse || "Verified storage"}. Available
            for scheduled pickup.
          </p>
          <h2>
            ₹{lot.price || 0}
            <small>/kg</small>
          </h2>
          <div className="quality-report">
            <div>
              <b>{lot.gradingConfidence ? `${lot.gradingConfidence}%` : "Human"}</b>
              <small>{lot.gradingConfidence ? "Model confidence" : "Operator-verified grade"}</small>
            </div>
            <div>
              <b>{lot.dist || "Nearby"}</b>
              <small>From warehouse</small>
            </div>
            <div>
              <b>{harvestDateFormatted ? `${ageDays} day${ageDays === 1 ? "" : "s"}` : `${ageDays} day`}</b>
              <small>{harvestDateFormatted ? `Fresh since ${harvestDateFormatted}` : "Stock age"}</small>
            </div>
          </div>
          {uploadedDateFormatted && <p className="freshness-detail">Listed on {uploadedDateFormatted}. {lot.freshnessGradeChanged ? "This perishable item’s displayed grade has been adjusted for harvest age." : "Freshness grade is monitored from the recorded harvest date."}</p>}
          <div className="detail-actions">
            <button className="primary" onClick={() => reserve(lot)}>
              Add 10 kg to cart
            </button>
            <button
              className="secondary"
              onClick={() => {
                setWishlist((items) =>
                  saved
                    ? (items || []).filter((x) => String(x?.id) !== String(lot.id))
                    : [...(items || []), lot],
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
            Grade {lot.grade || "A"} was confirmed by the warehouse intake operator using the live intake photo.
            A model result is shown only when a configured grading service produced a saved report.
          </p>
          {lot.farmerImageUrl && <><img className="intake-proof-photo" src={lot.farmerImageUrl} alt={`${cropName} photo submitted by the farmer`} /><small>Farmer uploaded listing photo</small></>}
          {lot.warehouseImageUrl && <><img className="intake-proof-photo" src={lot.warehouseImageUrl} alt={`${cropName} photographed during warehouse grading`} /><small>Live warehouse intake verification photo · Operator-confirmed Grade {lot.grade || "A"}{lot.gradingConfidence ? ` · ${lot.gradingConfidence}% model confidence` : ""}</small></>}
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
            Fresh {cropName.toLowerCase()} is a source of fibre and essential
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
  confirmOrderCollection,
  notifications,
  orderAgain,
  setView,
  notify,
}) {
  const [tab, setTab] = useState("orders"),
    [review, setReview] = useState(""),
    [confirmingOrder, setConfirmingOrder] = useState(null),
    [collectingOrder, setCollectingOrder] = useState(null);
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
          {notifications.filter((item) => !item.read_at).map((item) => <div className="published-note" key={item.id}><PackageCheck size={18}/><span><b>{item.title}</b>{item.body}</span></div>)}
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
                      {order.status === "Ready For Pickup" && <button className="primary" onClick={() => setCollectingOrder(order)}>Confirm collection</button>}
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
      {collectingOrder && <div className="confirm-order-back" role="dialog" aria-modal="true" aria-labelledby="collect-order-title"><div className="confirm-order-card"><p className="eyebrow green">PICKUP CONFIRMATION</p><h2 id="collect-order-title">Have you collected this order?</h2><p>Confirm only after receiving <b>{collectingOrder.id}</b> from <b>{collectingOrder.pickupWarehouse}</b>. This records the completed handoff for the warehouse and FarmLink admin team.</p><div><button className="secondary" onClick={() => setCollectingOrder(null)}>Not yet</button><button className="primary" onClick={async () => { if (await confirmOrderCollection(collectingOrder.id)) setCollectingOrder(null); }}>Yes, I collected it</button></div></div></div>}
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
    [quoteFloor, setQuoteFloor] = useState(null),
    [quoteMarket, setQuoteMarket] = useState(null),
    [myQuotes, setMyQuotes] = useState([]),
    [negotiation, setNegotiation] = useState(null),
    [replyPrice, setReplyPrice] = useState(""),
    [replyNote, setReplyNote] = useState(""),
    [contract, setContract] = useState({ crop: "Tomato", quantity: 250, frequency: "Weekly", delivery: "Monday · 10 AM – 1 PM", price: "" }),
    [contractFloor, setContractFloor] = useState(null),
    [contracts, setContracts] = useState([]);
  const visibleLots = lots.filter((lot) =>
    lot.crop.toLowerCase().includes(cropQuery.trim().toLowerCase()),
  );
  useEffect(() => {
    if (!session?.userId || !isSupabaseConfigured) return;
    supabase.from("bulk_requests").select("id,crop,quantity_kg,msp_per_kg,status,created_at,bulk_quotes(id,offered_price_per_kg,proposed_by,status,note,created_at)").eq("buyer_id", session.userId).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error) setMyQuotes(data || []);
    });
  }, [session?.userId, liveTick]);
  const openQuote = (lot) => {
    setQuote(lot); setQuantity(Math.max(250, Math.min(Number(lot.qty) || 250, 1000))); setOffer(String(lot.price)); setTab("quotes");
  };
  useEffect(() => {
    if (!isSupabaseConfigured || !quote?.crop) return;
    let active = true;
    supabase.from("msp_rates").select("msp_per_kg,marketing_season,source_url,updated_at").eq("crop", quote.crop).maybeSingle().then(({ data }) => {
      if (active) setQuoteFloor(data ? { price: Number(data.msp_per_kg), season: data.marketing_season, source: data.source_url, updatedAt: data.updated_at } : { price: 0 });
    });
    return () => { active = false; };
  }, [quote?.crop, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !quote?.crop) return;
    let active = true;
    supabase.from("market_price_snapshots").select("modal_price_per_kg,market,state,price_date,fetched_at").eq("crop", quote.crop).order("price_date", { ascending: false }).limit(1).maybeSingle().then(({ data }) => { if (active) setQuoteMarket(data || null); });
    return () => { active = false; };
  }, [quote?.crop, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !contract.crop) return;
    let active = true;
    supabase.from("msp_rates").select("msp_per_kg,marketing_season,source_url").eq("crop", contract.crop).maybeSingle().then(({ data }) => {
      if (active) setContractFloor(data ? { price: Number(data.msp_per_kg), season: data.marketing_season, source: data.source_url } : { price: 0 });
    });
    return () => { active = false; };
  }, [contract.crop, liveTick]);
  const sendQuote = async () => {
    if (!quote) return;
    const kg = Number(quantity), price = Number(offer || quote.price);
    if (kg < 250) return notify("Bulk requests must be at least 250 kg.");
    if (quoteFloor?.price > 0 && price < quoteFloor.price) return notify(`This crop's official MSP is ₹${quoteFloor.price.toFixed(2)}/kg. Your offer cannot be lower.`);
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
  const sendNegotiationReply = async () => {
    if (!negotiation || !session?.userId || !isSupabaseConfigured) return;
    const price = Number(replyPrice);
    const floor = Number(negotiation.msp_per_kg || 0);
    if (!Number.isFinite(price) || price <= 0) return notify("Enter a valid price for your counter-offer.");
    if (floor > 0 && price < floor) return notify(`Your counter-offer cannot be below the official MSP of ₹${floor.toFixed(2)}/kg.`);
    const { data, error } = await supabase.from("bulk_quotes").insert({ request_id: negotiation.id, offered_price_per_kg: price, proposed_by: "buyer", note: replyNote.trim() || null }).select("id,offered_price_per_kg,proposed_by,status,note,created_at").single();
    if (error) return notify(error.message || "Your counter-offer could not be sent.");
    const updated = { ...negotiation, status: "negotiation", bulk_quotes: [...(negotiation.bulk_quotes || []), data] };
    setNegotiation(updated);
    setMyQuotes((items) => items.map((item) => item.id === updated.id ? updated : item));
    setReplyPrice(""); setReplyNote(""); setLiveTick((tick) => tick + 1);
    notify("Your counter-offer was sent to the farmer. The farmer keeps final control of the sale.");
  };
  const createContract = async (event) => {
    event.preventDefault();
    const kg = Number(contract.quantity), price = Number(contract.price);
    if (kg < 250) return notify("Recurring contract quantities must be at least 250 kg.");
    if (!price || price <= 0) return notify("Enter a proposed price per kg for the contract.");
    if (contractFloor?.price > 0 && price < contractFloor.price) return notify(`This crop's official MSP is ₹${contractFloor.price.toFixed(2)}/kg. Your contract offer cannot be lower.`);
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
                Current lot price: ₹{quote.price}/kg. Farmer receives every offer and remains free to accept, counter,
                or decline.
              </p>
              <small className={quoteFloor?.price > 0 ? "floor-note" : "floor-note missing"}>{quoteFloor?.price > 0 ? <>Official MSP ({quoteFloor.season}): <b>₹{quoteFloor.price.toFixed(2)}/kg</b>{quoteFloor.updatedAt ? ` · verified ${new Date(quoteFloor.updatedAt).toLocaleDateString("en-IN")}` : ""}{quoteFloor.source ? <a href={quoteFloor.source} target="_blank" rel="noreferrer"> View Government notice</a> : ""}</> : "No official MSP is currently notified for this crop — you can make a market-based offer."}</small>
              <small className="floor-note">{quoteMarket ? <>Latest mandi modal price: <b>₹{Number(quoteMarket.modal_price_per_kg).toFixed(2)}/kg</b> · {quoteMarket.market}{quoteMarket.state ? `, ${quoteMarket.state}` : ""} · {new Date(`${quoteMarket.price_date}T00:00:00`).toLocaleDateString("en-IN")}</> : "Daily mandi market data will appear after the first Government-data refresh."}</small>
              <label>
                Quantity (minimum 250 kg)
                <input type="number" min="250" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </label>
              <label>
                Your proposed price per kg
                <input type="number" min={quoteFloor?.price || 0.01} value={offer} placeholder={String(quote.price)} onChange={(e) => setOffer(e.target.value)} />
              </label>
              <button
                className="primary"
                onClick={sendQuote}
              >
                Send negotiated quote
              </button>
            </div>
          ) : negotiation ? (
            <div className="quote-card"><button className="text-btn" onClick={() => setNegotiation(null)}>← All negotiations</button><h4>{negotiation.crop} · {negotiation.quantity_kg} kg</h4><small className="floor-note">{Number(negotiation.msp_per_kg || 0) > 0 ? `Official MSP floor: ₹${Number(negotiation.msp_per_kg).toFixed(2)}/kg` : "No official MSP is notified for this crop."}</small><div className="negotiation-thread">{[...(negotiation.bulk_quotes || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((entry) => <div className={"tracking " + (entry.proposed_by === "buyer" ? "buyer-offer" : "farmer-offer")} key={entry.id}><b>{entry.proposed_by === "buyer" ? "Your offer" : "Farmer counter-offer"} · ₹{Number(entry.offered_price_per_kg).toFixed(2)}/kg</b><span>{entry.note || "No note attached."}</span><small>{new Date(entry.created_at).toLocaleString("en-IN")}</small><strong>{entry.status}</strong></div>)}</div><label>Your revised price per kg<input type="number" min={negotiation.msp_per_kg || 0.01} step="0.01" value={replyPrice} onChange={(event) => setReplyPrice(event.target.value)} /></label><label>Message to farmer<textarea maxLength="500" value={replyNote} onChange={(event) => setReplyNote(event.target.value)} placeholder="Explain delivery, quality, or price expectations…" /></label><button className="primary" onClick={sendNegotiationReply}>Send counter-offer</button></div>
          ) : (
            <div><p className="empty-state">Choose a produce listing from Discover to start an RFQ.</p>{myQuotes.map((item) => { const buyerOffer = item.bulk_quotes?.filter((entry) => entry.proposed_by === "buyer").at(-1); const farmerCounter = item.bulk_quotes?.filter((entry) => entry.proposed_by === "farmer" && entry.status === "proposed").at(-1); return <div className="tracking" key={item.id}><b>{item.crop} · {item.quantity_kg} kg</b><span>Your offer: {buyerOffer ? `₹${buyerOffer.offered_price_per_kg}/kg` : "pending"}{farmerCounter ? ` · Farmer counter: ₹${farmerCounter.offered_price_per_kg}/kg` : ""}</span><strong>{item.status}</strong><button onClick={() => { setNegotiation(item); setReplyPrice(farmerCounter ? String(farmerCounter.offered_price_per_kg) : ""); }}>Open negotiation</button></div>; })}</div>
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
            <label>Proposed price per kg<input required type="number" min={contractFloor?.price || 0.01} value={contract.price} onChange={(e) => setContract({ ...contract, price: e.target.value })}/><small className={contractFloor?.price > 0 ? "floor-note" : "floor-note missing"}>{contractFloor?.price > 0 ? <>Official MSP ({contractFloor.season}): <b>₹{contractFloor.price.toFixed(2)}/kg</b>{contractFloor.source ? <a href={contractFloor.source} target="_blank" rel="noreferrer"> View Government notice</a> : ""}</> : "No official MSP is currently notified for this crop — market-based contract offers are allowed."}</small></label>
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
    price: "25",
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
  const [manualMsp, setManualMsp] = useState(0);
  const [gradingReport, setGradingReport] = useState(null);
  const [confirmingIntake, setConfirmingIntake] = useState(false);
  const confirmingIntakeRef = useRef(false);
  const lastIntakeConfirmRef = useRef(0);
  const [submittingManualIntake, setSubmittingManualIntake] = useState(false);
  const submittingManualIntakeRef = useRef(false);
  const lastManualIntakeRef = useRef(0);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from("farmer_listings").select("id,farmer_id,crop,category,description,quantity_kg,price_per_kg,image_url,intake_warehouse_id,harvest_date,warehouses(name),profiles(full_name)").eq("status", "scheduled").order("scheduled_at", { ascending: true }).then(({ data, error }) => {
      if (error) notify(error.message); else setScheduledListings(data || []);
    });
  }, [liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !form.crop) return;
    supabase.from("msp_rates").select("msp_per_kg").eq("crop", form.crop).maybeSingle().then(({ data }) => {
      const floor = Number(data?.msp_per_kg || 0);
      setManualMsp(floor);
      if (floor > 0 && Number(form.price) < floor) setForm((current) => ({ ...current, price: String(floor) }));
    });
  }, [form.crop]);
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
    const now = Date.now();
    if (submittingManualIntakeRef.current || submittingManualIntake || now - lastManualIntakeRef.current < 2000) {
      return;
    }
    submittingManualIntakeRef.current = true;
    lastManualIntakeRef.current = now;
    setSubmittingManualIntake(true);
    try {
      let id = `FL-${24094 + lots.length}`;
      const newLot = {
        id,
        crop: form.crop,
        hi: form.crop,
        grade: form.grade,
        qty: +form.weight,
        price: Number(form.price),
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
            // Manual stock has no farmer/gallery traceability, so it remains
            // warehouse-only instead of leaking into the consumer marketplace.
            marketplace_visible: false,
          })
          .select("id")
          .single();
        if (error) {
          notify(error.message);
          return;
        }
        newLot.dbId = data.id;
      }
      if (!isSupabaseConfigured) setLots([...lots, newLot]);
      else setLiveTick((tick) => tick + 1);
      notify(`Lot ${id} recorded as warehouse-only manual intake.`);
    } finally {
      setSubmittingManualIntake(false);
      setTimeout(() => {
        submittingManualIntakeRef.current = false;
      }, 1000);
    }
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
    const now = Date.now();
    if (confirmingIntakeRef.current || confirmingIntake || now - lastIntakeConfirmRef.current < 2000) {
      return;
    }
    confirmingIntakeRef.current = true;
    lastIntakeConfirmRef.current = now;

    const listing = scheduledListings.find((item) => item.id === form.listingId);
    if (!listing) {
      confirmingIntakeRef.current = false;
      return notify("Select a scheduled farmer listing.");
    }
    if (!warehousePhoto) {
      confirmingIntakeRef.current = false;
      await startLiveCamera();
      return notify("Capture the required live warehouse photo before confirming intake.");
    }
    setConfirmingIntake(true);
    try {
      const extension = (warehousePhoto.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
      const path = `${session.userId}/warehouse-intake/${listing.id}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("produce-photos").upload(path, warehousePhoto, { contentType: warehousePhoto.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error } = await supabase.rpc("complete_listing_intake", { p_listing_id: listing.id, p_grade: form.grade, p_photo_path: path, p_quantity_kg: Number(form.weight), p_report_id: gradingReport?.id || null });
      if (error) throw error;
      setScheduledListings((current) => current.filter((item) => item.id !== listing.id));
      setForm({ ...form, listingId: "", grade: "A" }); setWarehousePhoto(null); setWarehousePreview(""); setGradingReport(null); setLiveTick((tick) => tick + 1);
      notify(`${listing.crop} intake confirmed. The farmer photo, live warehouse photo, measured weight and operator grade are now live.`);
    } catch (error) {
      notify(error.message || "Warehouse intake confirmation failed.");
    } finally {
      setConfirmingIntake(false);
      setTimeout(() => {
        confirmingIntakeRef.current = false;
      }, 1000);
    }
  };
  const rejectScheduledIntake = async () => {
    const now = Date.now();
    if (confirmingIntakeRef.current || confirmingIntake || now - lastIntakeConfirmRef.current < 2000) {
      return;
    }
    confirmingIntakeRef.current = true;
    lastIntakeConfirmRef.current = now;

    const listing = scheduledListings.find((item) => item.id === form.listingId);
    if (!listing) {
      confirmingIntakeRef.current = false;
      return notify("Select a scheduled farmer listing before rejecting it.");
    }
    if (!rejectionReason.trim()) {
      confirmingIntakeRef.current = false;
      return notify("Enter a clear rejection reason for the farmer.");
    }
    setConfirmingIntake(true);
    try {
      const { error } = await supabase.from("farmer_listings").update({ status: "rejected", warehouse_rejection_reason: rejectionReason.trim(), warehouse_rejected_at: new Date().toISOString() }).eq("id", listing.id);
      if (error) return notify(error.message);
      stopLiveCamera();
      setScheduledListings((current) => current.filter((item) => item.id !== listing.id));
      setForm({ ...form, listingId: "" }); setRejectionReason(""); setRejectingListing(false); setWarehousePhoto(null); setWarehousePreview(""); setLiveTick((tick) => tick + 1);
      notify(`${listing.crop} intake was rejected. The farmer has been notified with the warehouse reason.`);
    } finally {
      setConfirmingIntake(false);
      setTimeout(() => {
        confirmingIntakeRef.current = false;
      }, 1000);
    }
  };
  const readyPickupOrders = orders.filter((order) => String(order.status).toLowerCase() === "ready for pickup");
  const collectedOrders = orders.filter((order) => String(order.status).toLowerCase() === "completed");
  const collectedValue = collectedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
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
        <div><small>PICKUP ORDERS</small><b>{orders.filter((order) => !["Cancelled", "Completed"].includes(order.status)).length}</b><span>{readyPickupOrders.length} packed and awaiting collection</span></div>
        <div><small>COLLECTED LIVE</small><b>{collectedOrders.length}</b><span>₹{collectedValue.toFixed(2)} completed pickup value</span></div>
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
              setGradingReport(null);
              if (event.target.value) startLiveCamera(); else stopLiveCamera();
            }}>
              <option value="">Choose scheduled listing</option>
              {scheduledListings.map((listing) => <option key={listing.id} value={listing.id}>{cropEmoji(listing.crop, listing.category)} {listing.crop} · {listing.quantity_kg} kg · {listing.warehouses?.name || "Warehouse"}</option>)}
            </select>
          </label>
          {form.listingId && <div className="intake-image-compare"><figure><img className="intake-photo-preview" src={scheduledListings.find((item) => item.id === form.listingId)?.image_url} alt="Farmer submitted produce"/><figcaption>Farmer listing photo</figcaption></figure><figure>{warehousePreview ? <img className="intake-photo-preview" src={warehousePreview} alt="Warehouse grading capture preview"/> : cameraActive ? <video ref={cameraVideoRef} className="intake-photo-preview live-camera" autoPlay playsInline muted/> : <div className="camera-empty"><ScanLine size={24}/><span>Live camera capture required</span></div>}<figcaption>{warehousePreview ? "Live warehouse photo captured" : "Warehouse live photo"}</figcaption></figure></div>}
          {form.listingId && !warehousePreview && <div className="camera-actions"><button className="secondary" type="button" onClick={startLiveCamera}>{cameraActive ? "Restart camera" : "Open live camera"}</button>{cameraActive && <button className="primary" type="button" onClick={captureLivePhoto}><ScanLine size={16}/>Capture live photo</button>}<label className="camera-upload">Fallback camera upload<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => { const file = event.target.files?.[0] || null; setWarehousePhoto(file); setWarehousePreview(file ? URL.createObjectURL(file) : ""); stopLiveCamera(); }} /></label></div>}
          {form.listingId && <GradeReview image={warehousePhoto} crop={form.crop} listingId={form.listingId} onReport={setGradingReport}/>}
          <label>Confirmed grade<select value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}><option>A</option><option>B</option><option>C</option></select></label>
          <div className="intake-final-actions"><button className="primary" type="button" disabled={confirmingIntake} onClick={confirmScheduledIntake}><BrainCircuit size={18}/>{confirmingIntake ? "Confirming & publishing…" : "Confirm grade & publish"}</button><button className="danger" type="button" disabled={confirmingIntake} onClick={() => setRejectingListing((current) => !current)}>Reject intake</button></div>
          {rejectingListing && <div className="rejection-box"><b>Tell the farmer why this intake is rejected</b><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Example: Visible spoilage and damaged packaging observed at intake."/><button className="danger" type="button" disabled={confirmingIntake} onClick={rejectScheduledIntake}>{confirmingIntake ? "Sending rejection…" : "Send rejection to farmer"}</button></div>}
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
                <option key={item.name} value={item.name}>{cropEmoji(item.name, item.category)} {item.name}</option>
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
            Verified price per kg
            <input type="number" min={manualMsp || 0.01} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <small>{manualMsp > 0 ? `Official MSP minimum: ₹${manualMsp.toFixed(2)}/kg` : "No official MSP is notified for this crop."}</small>
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
          <div className="grade-ai"><BrainCircuit/><div><b>Human inspection required</b><small>Manual stock stays warehouse-only. Scheduled farmer listings can use the configured photo model before operator approval.</small></div><span>Operator</span></div>
          <button className="primary" type="submit" disabled={submittingManualIntake}>
            <ScanLine size={18} />
            {submittingManualIntake ? "Recording intake…" : "Confirm grade & create lot"}
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
                {o.consumerName || "Consumer"}{o.consumerMobile ? ` · ${o.consumerMobile}` : ""} · {o.pickupWarehouse} · {o.items} lot(s) · {o.status}
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
  setAiInitialCrop,
  listingPrefill,
  produceRequests,
  setProduceRequests,
  liveTick,
  notify,
  farmerVerification,
  setFarmerVerification,
  lang = "hi",
}) {
  const [form, setForm] = useState({
    crop: "Tomato",
    grossWeight: "",
    cluster: "Jaipur North cluster",
    type: "Produce intake",
  });
  const [cropSearch, setCropSearch] = useState("");
  const { isListening, toggle: toggleDictation } = useSpeechDictation(setCropSearch, notify, lang);
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
  const [submittingProduce, setSubmittingProduce] = useState(false);
  const submittingProduceRef = useRef(false);
  const lastProduceSubmitTimeRef = useRef(0);

  const submit = async (e) => {
    e.preventDefault();
    const now = Date.now();
    if (submittingProduceRef.current || submittingProduce || now - lastProduceSubmitTimeRef.current < 2000) {
      return;
    }
    submittingProduceRef.current = true;
    lastProduceSubmitTimeRef.current = now;
    setSubmittingProduce(true);

    try {
      const id = `REQ-${String(Date.now()).slice(-6)}`;
      const request = {
        ...form,
        id,
        farmer: session?.name || "Farmer",
        status: "pending",
        created_at: new Date().toISOString(),
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("produce_requests")
          .insert({
            crop: form.crop,
            type: form.type,
            gross_weight_kg: Number(form.grossWeight),
            cluster: form.cluster,
            farmer_name: session?.name || "Farmer",
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
    } finally {
      setSubmittingProduce(false);
      setTimeout(() => {
        submittingProduceRef.current = false;
      }, 1000);
    }
  };
  return (
    <section className="page farmer-page">
      <div className="farmer-welcome">
        <div>
          <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span>NAMASTE{session?.name ? `, ${session.name}` : ""}</span>
            {farmerVerification?.status === "verified" ? (
              <span className="verification-badge verified" title="Government Aadhaar & Land Record Verified">
                <Check size={13} /> Verified Producer
              </span>
            ) : farmerVerification?.status === "under_review" ? (
              <span className="verification-badge under-review" title="Verification submitted and under review">
                <Clock3 size={13} /> Verification Under Review
              </span>
            ) : (
              <span className="verification-badge unverified" title="Complete KYC verification to unlock trust perks">
                <ShieldCheck size={13} /> Unverified Profile
              </span>
            )}
          </p>
          <h1>Your produce. Your decision.</h1>
          <p>
            Add produce for a grade request, or create a cluster collection
            request. The collector will confirm final weight and grade at
            pickup.
          </p>
          <button className="primary" onClick={() => {
            if (setAiInitialCrop) setAiInitialCrop(null);
            setModal("ai");
          }}>
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
            <div className="search-mic-wrap">
              <input
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Search crop or category"
              />
              <button
                type="button"
                className={`search-mic-btn ${isListening ? "listening" : ""}`}
                onClick={toggleDictation}
                title={isListening ? "Listening… click to stop" : "Speak crop name"}
                aria-label="Voice crop search"
              >
                <Mic size={16} />
              </button>
            </div>
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
          <button className="primary" disabled={submittingProduce} type="submit">
            <Truck size={18} />
            {submittingProduce ? "Sending request…" : "Send request to warehouse"}
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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <strong>₹{l.price}/kg</strong>
                <button
                  type="button"
                  className="secondary"
                  style={{ padding: "3px 8px", fontSize: "0.75rem", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={() => {
                    if (setAiInitialCrop) setAiInitialCrop(l.crop);
                    setModal("ai");
                  }}
                >
                  <BrainCircuit size={12} />
                  AI Advisory
                </button>
              </div>
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
      <FarmerOperations
        notify={notify}
        session={session}
        liveTick={liveTick}
        listingPrefill={listingPrefill}
        farmerVerification={farmerVerification}
        setFarmerVerification={setFarmerVerification}
      />
      <FarmerServices session={session} />
      <div className="farmer-grid">
        <div className="finance">
          <p className="eyebrow">STORED STOCK FINANCE</p>
          <h3>Need working capital?</h3>
          <p>
            Start a consent-based eligibility enquiry for your stored produce.
          </p>
          <button
            onClick={() => {
              notify("Navigating to warehouse receipts & pledge finance.");
              const el = document.querySelector(".integration-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
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

function FarmerVerificationWorkflow({ farmerVerification, setFarmerVerification, notify, session }) {
  const [isEditing, setIsEditing] = useState(() => farmerVerification?.status === "unverified");
  const [step, setStep] = useState(1);
  const [submittingKYC, setSubmittingKYC] = useState(false);
  const submittingKYCRef = useRef(false);
  const lastKYCSubmitRef = useRef(0);
  const [form, setForm] = useState({
    farmerName: session?.name || farmerVerification?.farmerName || "Ramesh Kumar",
    mobile: farmerVerification?.mobile || "+91 98290 14820",
    idType: farmerVerification?.idType || "Aadhaar Card",
    idNumber: farmerVerification?.idNumber || "4920-8812-7741",
    landState: farmerVerification?.landState || "Rajasthan",
    landDistrict: farmerVerification?.landDistrict || "Jaipur",
    village: farmerVerification?.village || "Phulera",
    landAcres: farmerVerification?.landAcres || "4.5",
    khasraNumber: farmerVerification?.khasraNumber || "412/1 & 412/2",
    cropsGrown: farmerVerification?.cropsGrown || "Mustard, Tomato, Wheat",
    bankName: farmerVerification?.bankName || "State Bank of India",
    accountNumber: farmerVerification?.accountNumber || "30984920112",
    ifsc: farmerVerification?.ifsc || "SBIN0031129",
    upiId: farmerVerification?.upiId || "ramesh.kisan@sbi",
    fpoName: farmerVerification?.fpoName || "Kisan Samriddhi FPO",
    idDocName: "aadhaar_card_ramesh.pdf",
    landDocName: "khasra_7_12_extract.pdf",
  });

  const handleSubmit = (e) => {
    e?.preventDefault();
    const now = Date.now();
    if (submittingKYCRef.current || submittingKYC || now - lastKYCSubmitRef.current < 2000) {
      return;
    }
    submittingKYCRef.current = true;
    lastKYCSubmitRef.current = now;

    if (!form.farmerName || !form.mobile || !form.idNumber) {
      submittingKYCRef.current = false;
      return notify("Please complete all required identity and KYC fields.");
    }
    if (!form.khasraNumber || !form.landAcres) {
      submittingKYCRef.current = false;
      return notify("Please enter your land Khasra / survey number and acreage.");
    }
    if (!form.bankName || !form.accountNumber || !form.ifsc) {
      submittingKYCRef.current = false;
      return notify("Please enter your bank account details for direct payments.");
    }
    setSubmittingKYC(true);
    try {
      const updated = {
        ...farmerVerification,
        ...form,
        status: "under_review",
        id: farmerVerification?.id || `KYC-RJ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        submittedAt: new Date().toISOString(),
      };
      setFarmerVerification(updated);
      setIsEditing(false);
      notify("Verification submitted! Your KYC documents are under review by the FarmLink administrator.");
    } finally {
      setSubmittingKYC(false);
      setTimeout(() => {
        submittingKYCRef.current = false;
      }, 1000);
    }
  };

  const status = farmerVerification?.status || "unverified";

  return (
    <div className="verification-container">
      <div className="verification-status-banner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h3 style={{ margin: 0 }}>Farmer Trust & KYC Verification</h3>
            {status === "verified" ? (
              <span className="verification-badge verified"><Check size={14} /> Verified Producer</span>
            ) : status === "under_review" ? (
              <span className="verification-badge under-review"><Clock3 size={14} /> Under Review</span>
            ) : (
              <span className="verification-badge unverified"><ShieldCheck size={14} /> Verification Required</span>
            )}
          </div>
          <p style={{ margin: 0, color: "#2d4539", fontSize: "0.88rem" }}>
            {status === "verified"
              ? `Verification ID: ${farmerVerification?.id || "KYC-RJ-2026-9812"} · Verified on ${farmerVerification?.reviewedAt ? new Date(farmerVerification.reviewedAt).toLocaleDateString("en-IN") : "Sep 19, 2026"}`
              : status === "under_review"
                ? `Application ${farmerVerification?.id || "KYC-RJ-2026-9812"} submitted on ${farmerVerification?.submittedAt ? new Date(farmerVerification.submittedAt).toLocaleDateString("en-IN") : "Today"}. Review takes under 24 hours.`
                : "Submit your government ID, land survey (Khasra) and bank account details to unlock verified seller perks."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {!isEditing && (
            <button className="secondary" onClick={() => setIsEditing(true)}>
              {status === "verified" ? "Update KYC Details" : "Edit Application"}
            </button>
          )}
          {status === "under_review" && !isEditing && (
            <button
              className="primary"
              disabled={submittingKYC}
              onClick={() => {
                const now = Date.now();
                if (submittingKYCRef.current || now - lastKYCSubmitRef.current < 1500) return;
                submittingKYCRef.current = true;
                lastKYCSubmitRef.current = now;
                setFarmerVerification((curr) => ({
                  ...curr,
                  status: "verified",
                  reviewedAt: new Date().toISOString(),
                  reviewerNote: "Verified with State Agriculture Department land records.",
                }));
                notify("✓ Approved! You are now an officially verified FarmLink Producer.");
                setTimeout(() => { submittingKYCRef.current = false; }, 1000);
              }}
            >
              Simulate Instant Admin Approval
            </button>
          )}
        </div>
      </div>

      <div className="perk-grid">
        <div className="perk-card">
          <b>🌟 Verified Badge</b>
          <small>Green trust badge displayed on all your produce lots in the marketplace for higher consumer trust.</small>
        </div>
        <div className="perk-card">
          <b>💰 Direct Bank Payouts</b>
          <small>Automated settlements directly to your registered bank account and UPI ID upon order completion.</small>
        </div>
        <div className="perk-card">
          <b>📜 e-NWR Loan Access</b>
          <small>Eligible for up to 50% working capital pledge finance against warehouse receipts.</small>
        </div>
        <div className="perk-card">
          <b>🚛 Priority Cluster Collection</b>
          <small>Guaranteed vehicle scheduling for farm gate and village FPO aggregation pickups.</small>
        </div>
      </div>

      {isEditing ? (
        <form className="verification-form-box" onSubmit={handleSubmit}>
          <div className="verification-stepper">
            <button
              type="button"
              className={`stepper-tab ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}
              onClick={() => setStep(1)}
            >
              <span>1. Identity &amp; KYC</span>
            </button>
            <button
              type="button"
              className={`stepper-tab ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}
              onClick={() => setStep(2)}
            >
              <span>2. Land &amp; Crops</span>
            </button>
            <button
              type="button"
              className={`stepper-tab ${step === 3 ? "active" : ""}`}
              onClick={() => setStep(3)}
            >
              <span>3. Bank &amp; Payout</span>
            </button>
          </div>

          {step === 1 && (
            <div>
              <h4 style={{ margin: "0 0 14px", color: "#143d2c" }}>Personal Identity &amp; Government KYC</h4>
              <div className="form-row-2">
                <label>
                  Full Legal Name (as per Aadhaar / Bank)
                  <input
                    required
                    value={form.farmerName}
                    onChange={(e) => setForm({ ...form, farmerName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </label>
                <label>
                  Mobile Number (OTP linked)
                  <input
                    required
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+91 98290 14820"
                  />
                </label>
              </div>
              <div className="form-row-2">
                <label>
                  Government ID Type
                  <select
                    value={form.idType}
                    onChange={(e) => setForm({ ...form, idType: e.target.value })}
                  >
                    <option>Aadhaar Card</option>
                    <option>Kisan Credit Card (KCC)</option>
                    <option>PM-KISAN Registration ID</option>
                    <option>Voter ID Card</option>
                  </select>
                </label>
                <label>
                  ID Number
                  <input
                    required
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    placeholder="e.g. 4920-8812-7741"
                  />
                </label>
              </div>
              <label>
                Attach Government ID Proof
                <div className="doc-upload-zone" onClick={() => notify("Document selected: " + form.idDocName)}>
                  <ScanLine size={24} style={{ color: "#176b49", margin: "0 auto 6px" }} />
                  <b>{form.idDocName ? `Attached: ${form.idDocName}` : "Click or tap to upload Aadhaar / KCC photo"}</b>
                  <small style={{ display: "block", color: "#666" }}>Supported formats: PDF, JPEG, PNG (max 5MB)</small>
                </div>
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="primary" onClick={() => setStep(2)}>
                  Next: Land Records →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 style={{ margin: "0 0 14px", color: "#143d2c" }}>Farm Land &amp; Cultivation Records</h4>
              <div className="form-row-3">
                <label>
                  State
                  <input
                    required
                    value={form.landState}
                    onChange={(e) => setForm({ ...form, landState: e.target.value })}
                    placeholder="e.g. Rajasthan"
                  />
                </label>
                <label>
                  District
                  <input
                    required
                    value={form.landDistrict}
                    onChange={(e) => setForm({ ...form, landDistrict: e.target.value })}
                    placeholder="e.g. Jaipur"
                  />
                </label>
                <label>
                  Village / Tehsil
                  <input
                    required
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                    placeholder="e.g. Phulera"
                  />
                </label>
              </div>
              <div className="form-row-2">
                <label>
                  Total Land Holding (Acres)
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={form.landAcres}
                    onChange={(e) => setForm({ ...form, landAcres: e.target.value })}
                    placeholder="e.g. 4.5"
                  />
                </label>
                <label>
                  Khasra / Land Survey Number
                  <input
                    required
                    value={form.khasraNumber}
                    onChange={(e) => setForm({ ...form, khasraNumber: e.target.value })}
                    placeholder="e.g. 412/1 & 412/2"
                  />
                </label>
              </div>
              <label>
                Major Crops Cultivated
                <input
                  required
                  value={form.cropsGrown}
                  onChange={(e) => setForm({ ...form, cropsGrown: e.target.value })}
                  placeholder="e.g. Mustard, Tomato, Wheat, Bajra"
                />
              </label>
              <label>
                Land Record Document (7/12 Extract / Khasra Girdawari / Patta)
                <div className="doc-upload-zone" onClick={() => notify("Document selected: " + form.landDocName)}>
                  <MapPin size={24} style={{ color: "#176b49", margin: "0 auto 6px" }} />
                  <b>{form.landDocName ? `Attached: ${form.landDocName}` : "Click or tap to upload Land Passbook / Khasra document"}</b>
                  <small style={{ display: "block", color: "#666" }}>Supported formats: PDF, JPEG, PNG (max 5MB)</small>
                </div>
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                <button type="button" className="secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="button" className="primary" onClick={() => setStep(3)}>
                  Next: Bank Details →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4 style={{ margin: "0 0 14px", color: "#143d2c" }}>Bank Account &amp; Direct Payout Details</h4>
              <div className="form-row-2">
                <label>
                  Bank Name
                  <input
                    required
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                  />
                </label>
                <label>
                  Bank Account Number
                  <input
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    placeholder="e.g. 30984920112"
                  />
                </label>
              </div>
              <div className="form-row-2">
                <label>
                  IFSC Code
                  <input
                    required
                    value={form.ifsc}
                    onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0031129"
                  />
                </label>
                <label>
                  UPI ID (for instant settlement)
                  <input
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    placeholder="e.g. ramesh.kisan@sbi"
                  />
                </label>
              </div>
              <label>
                Associated FPO / Cooperative (Optional)
                <input
                  value={form.fpoName}
                  onChange={(e) => setForm({ ...form, fpoName: e.target.value })}
                  placeholder="e.g. Kisan Samriddhi FPO"
                />
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                <button type="button" className="secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary" disabled={submittingKYC}>
                    <Check size={16} /> {submittingKYC ? "Submitting…" : "Submit Official Verification"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="verification-form-box">
          <h4 style={{ margin: "0 0 12px", color: "#143d2c" }}>Verified Profile Information</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div>
              <small style={{ color: "#666" }}>Farmer Legal Name</small>
              <b style={{ display: "block", color: "#133827" }}>{farmerVerification?.farmerName || "Ramesh Kumar"}</b>
              <small style={{ color: "#666" }}>{farmerVerification?.mobile || "+91 98290 14820"}</small>
            </div>
            <div>
              <small style={{ color: "#666" }}>Identity Record</small>
              <b style={{ display: "block", color: "#133827" }}>{farmerVerification?.idType || "Aadhaar"}</b>
              <small style={{ color: "#666" }}>ID: {farmerVerification?.idNumber || "XXXX-XXXX-8812"}</small>
            </div>
            <div>
              <small style={{ color: "#666" }}>Farm Survey (Khasra)</small>
              <b style={{ display: "block", color: "#133827" }}>Khasra {farmerVerification?.khasraNumber || "412/1 & 412/2"}</b>
              <small style={{ color: "#666" }}>{farmerVerification?.village || "Phulera"}, {farmerVerification?.landDistrict || "Jaipur"} ({farmerVerification?.landAcres || "4.5"} acres)</small>
            </div>
            <div>
              <small style={{ color: "#666" }}>Bank Payout Destination</small>
              <b style={{ display: "block", color: "#133827" }}>{farmerVerification?.bankName || "SBI Phulera"}</b>
              <small style={{ color: "#666" }}>A/C: {farmerVerification?.accountNumber || "XXXXXX4920"} · IFSC: {farmerVerification?.ifsc || "SBIN0031129"}</small>
            </div>
          </div>
          {farmerVerification?.reviewerNote && (
            <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "#f0f8ee", border: "1px solid #d2e7ce", fontSize: "0.84rem", color: "#255738" }}>
              <b>Admin Verification Note:</b> {farmerVerification.reviewerNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FarmerOperations({ notify, session, liveTick, listingPrefill, farmerVerification, setFarmerVerification }) {
  const [tab, setTab] = useState("listings"),
    [cropSearch, setCropSearch] = useState(""),
    [images, setImages] = useState([]),
    [previews, setPreviews] = useState([]),
    [saving, setSaving] = useState(false),
    [published, setPublished] = useState(null),
    submittingRef = useRef(false),
    lastSubmitTimeRef = useRef(0),
    [quotes, setQuotes] = useState([]),
    [counterOffers, setCounterOffers] = useState({}),
    [counterNotes, setCounterNotes] = useState({}),
    [farmerListings, setFarmerListings] = useState([]),
    [farmerOrders, setFarmerOrders] = useState([]),
    [farmerJobs, setFarmerJobs] = useState([]),
    [listingFloor, setListingFloor] = useState(null),
    [listingMarket, setListingMarket] = useState(null),
    [listing, setListing] = useState({
      crop: "Tomato",
      description: "Fresh produce from our verified farm cluster.",
      quantity: "100",
      price: "25",
      harvestDate: new Date().toISOString().slice(0, 10),
    });
  useEffect(() => {
    if (listingPrefill?.crop) {
      setListing((prev) => ({
        ...prev,
        crop: listingPrefill.crop,
        price: String(listingPrefill.price || prev.price),
      }));
      setTab("listings");
    }
  }, [listingPrefill]);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    supabase.from("bulk_requests").select("id,crop,quantity_kg,buyer_name,msp_per_kg,status,bulk_quotes(id,offered_price_per_kg,proposed_by,status,note,created_at)").eq("farmer_id", session.userId).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) notify(error.message); else setQuotes(data || []);
    });
  }, [session?.userId, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !listing.crop) return;
    let active = true;
    Promise.all([
      supabase.from("msp_rates").select("msp_per_kg,marketing_season,source_url,updated_at").eq("crop", listing.crop).maybeSingle(),
    ]).then(([mspResult]) => {
      if (!active) return;
      if (mspResult.data) setListingFloor({ price: Number(mspResult.data.msp_per_kg), label: "Official MSP", season: mspResult.data.marketing_season, source: mspResult.data.source_url, updatedAt: mspResult.data.updated_at });
      else setListingFloor({ price: 0, label: "No official MSP notified" });
    });
    return () => { active = false; };
  }, [listing.crop, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !listing.crop) return;
    let active = true;
    supabase.from("market_price_snapshots").select("modal_price_per_kg,market,state,price_date,fetched_at").eq("crop", listing.crop).order("price_date", { ascending: false }).limit(1).maybeSingle().then(({ data }) => { if (active) setListingMarket(data || null); });
    return () => { active = false; };
  }, [listing.crop, liveTick]);
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.userId) return;
    Promise.all([
      supabase.from("farmer_listings").select("id,crop,quantity_kg,price_per_kg,status,image_url,warehouse_image_url,warehouse_grade,grading_confidence,warehouse_rejection_reason,warehouse_rejected_at,created_at,warehouses(name)").eq("farmer_id", session.userId).order("created_at", { ascending: false }),
      supabase.from("order_items").select("id,quantity_kg,unit_price,produce_lots!inner(farmer_id,crop),consumer_orders(order_code,status,created_at,warehouses(name))").eq("produce_lots.farmer_id", session.userId).order("id", { ascending: false }),
      supabase.from("logistics_jobs").select("id,source_type,details,status,created_at").order("created_at", { ascending: false }),
    ]).then(([listingResult, orderResult, jobsResult]) => {
      if (listingResult.error) console.warn("Farmer listings load error:", listingResult.error.message); else setFarmerListings(listingResult.data || []);
      if (orderResult.error) console.warn("Farmer orders load error:", orderResult.error.message); else setFarmerOrders(orderResult.data || []);
      if (jobsResult.error) console.warn("Farmer jobs load error:", jobsResult.error.message); else setFarmerJobs(jobsResult.data || []);
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
      .insert({ request_id: request.id, offered_price_per_kg: offeredPrice, proposed_by: "farmer", status: "proposed", note: counterNotes[request.id]?.trim() || null })
      .select("id,offered_price_per_kg,proposed_by,status,note,created_at")
      .single();
    if (error) return notify(error.message);
    setQuotes((current) => current.map((item) => item.id === request.id ? {
      ...item,
      bulk_quotes: [...(item.bulk_quotes || []), data],
    } : item));
    setCounterOffers((current) => ({ ...current, [request.id]: "" }));
    setCounterNotes((current) => ({ ...current, [request.id]: "" }));
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
  const selectPhotos = (files) => {
    const selected = (files || []).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type)).slice(0, 6);
    if ((files || []).length !== selected.length) notify("Use JPEG, PNG, or WebP photos only.");
    setImages(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
  };
  const submitListing = async (event) => {
    event.preventDefault();
    const now = Date.now();
    // Coalesce multiple rapid spam clicks into a single execution
    if (submittingRef.current || saving || now - lastSubmitTimeRef.current < 2000) {
      return;
    }
    submittingRef.current = true;
    lastSubmitTimeRef.current = now;

    if (!images.length) {
      submittingRef.current = false;
      notify("Attach at least one produce photo before publishing.");
      return;
    }
    if (!session?.userId && !session?.name) {
      submittingRef.current = false;
      notify("Sign in as a farmer to publish a listing.");
      return;
    }
    if (listingFloor?.price > 0 && Number(listing.price) < listingFloor.price) {
      submittingRef.current = false;
      return notify(`Your listing price cannot be below the official MSP of ₹${listingFloor.price.toFixed(2)}/kg.`);
    }

    setSaving(true);
    try {
      const cropMeta = INDIA_CROPS.find((item) => item.name === listing.crop);
      if (!isSupabaseConfigured) {
        const demoListing = {
          id: `demo-listing-${Date.now()}`,
          farmer_id: session?.userId || "demo-farmer",
          crop: listing.crop,
          category: cropMeta?.category || "Other",
          description: listing.description,
          quantity_kg: Number(listing.quantity),
          price_per_kg: Number(listing.price),
          harvest_date: listing.harvestDate,
          image_url: previews[0] || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
          image_urls: previews.length ? previews : ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"],
          status: "pending",
          created_at: new Date().toISOString(),
          profiles: { full_name: session?.name || "Ramesh Kumar" }
        };
        setFarmerListings((prev) => [demoListing, ...prev]);
        setPublished(demoListing);
        notify("Photo listing submitted to the admin for verification. It will appear to consumers only after approval.");
        setImages([]);
        setPreviews([]);
        return;
      }
      const urls = await Promise.all(images.map(async (image) => {
        const extension = (image.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
        const path = `${session.userId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("produce-photos").upload(path, image, { contentType: image.type, upsert: false });
        if (uploadError) throw uploadError;
        return supabase.storage.from("produce-photos").getPublicUrl(path).data.publicUrl;
      }));
      const record = {
        farmer_id: session.userId,
        crop: listing.crop,
        category: cropMeta?.category || "Other",
        description: listing.description,
        quantity_kg: Number(listing.quantity),
        price_per_kg: Number(listing.price),
        harvest_date: listing.harvestDate,
        image_url: urls[0],
        image_urls: urls,
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
      setTimeout(() => {
        submittingRef.current = false;
      }, 1000);
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
          {farmerListings.length ? farmerListings.map((item) => <div className="contract-row" key={item.id}><span>{cropEmoji(item.crop)}</span><div><b>{item.crop} · {item.quantity_kg} kg</b><small>{item.warehouses?.name || "Awaiting warehouse"} · {item.warehouse_grade ? `Operator Grade ${item.warehouse_grade}${item.grading_confidence ? ` · ${item.grading_confidence}% model confidence` : ""}` : "Farmer photo received"}</small>{item.status === "rejected" && <small className="listing-rejection">Warehouse decision: {item.warehouse_rejection_reason || "The intake could not be accepted. Please contact the warehouse."}</small>}</div><strong>{String(item.status).replaceAll("_", " ")}</strong></div>) : <p className="empty-state">Your submitted listings will update here live.</p>}
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
              min={listingFloor?.price || 0.01}
              step="0.01"
              value={listing.price}
              onChange={(e) =>
                setListing({ ...listing, price: e.target.value })
              }
            />
            <small className={listingFloor?.price > 0 ? "floor-note" : "floor-note missing"}>{listingFloor?.price > 0 ? <>{listingFloor.label}{listingFloor.season ? ` (${listingFloor.season})` : ""}: <b>₹{listingFloor.price.toFixed(2)}/kg</b>{listingFloor.updatedAt ? ` · verified ${new Date(listingFloor.updatedAt).toLocaleDateString("en-IN")}` : ""}{listingFloor.source ? <a href={listingFloor.source} target="_blank" rel="noreferrer"> View Government notice</a> : ""}</> : "No official MSP is currently notified for this crop — you may list at a market-based price."}</small>
            <small className="floor-note">{listingMarket ? <>Latest mandi modal price: <b>₹{Number(listingMarket.modal_price_per_kg).toFixed(2)}/kg</b> · {listingMarket.market}{listingMarket.state ? `, ${listingMarket.state}` : ""} · {new Date(`${listingMarket.price_date}T00:00:00`).toLocaleDateString("en-IN")}</> : "Daily mandi market data will appear after the first Government-data refresh."}</small>
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
            Produce photos (up to 6)
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => selectPhotos(Array.from(e.target.files || []))}
            />
            <small>
              JPEG, PNG or WebP. The first is the listing cover; every selected
              photo is visible to consumers in the product gallery.
            </small>
          </label>
          {previews.length > 0 && <div className="intake-image-compare">{previews.map((preview, index) => <figure key={preview}><img className="listing-preview" src={preview} alt={`Selected produce preview ${index + 1}`}/><figcaption>Photo {index + 1}</figcaption></figure>)}</div>}
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
        <FarmerVerificationWorkflow
          farmerVerification={farmerVerification}
          setFarmerVerification={setFarmerVerification}
          notify={notify}
          session={session}
        />
      )}
      {tab === "quotes" && (
        <div className="account-panel">
          <h3>Wholesale quote desk</h3>
          <p>Every offer is protected by the applicable MSP floor. You alone decide whether a sale is confirmed.</p>
          {quotes.length ? quotes.map((request) => {
            const offer = (request.bulk_quotes || []).filter((item) => item.proposed_by === "buyer" && item.status === "proposed").at(-1);
            const counter = (request.bulk_quotes || []).filter((item) => item.proposed_by === "farmer" && item.status === "proposed").at(-1);
            return <div className="contract-row quote-request" key={request.id}><div><b>{request.crop} · {request.quantity_kg} kg</b><small>{request.buyer_name} · {Number(request.msp_per_kg || 0) > 0 ? `Official MSP ₹${Number(request.msp_per_kg).toFixed(2)}/kg` : "No official MSP notified"} · {request.status}</small><div className="negotiation-thread">{[...(request.bulk_quotes || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((entry) => <div className={"tracking " + (entry.proposed_by === "farmer" ? "farmer-offer" : "buyer-offer")} key={entry.id}><b>{entry.proposed_by === "farmer" ? "Your counter-offer" : "Buyer offer"} · ₹{Number(entry.offered_price_per_kg).toFixed(2)}/kg</b><span>{entry.note || "No message attached."}</span><small>{entry.created_at ? new Date(entry.created_at).toLocaleString("en-IN") : "Just now"}</small><strong>{entry.status}</strong></div>)}</div></div>{offer ? <div className="quote-actions"><label>Counter ₹/kg<input type="number" min={request.msp_per_kg || 0.01} step="0.01" value={counterOffers[request.id] || ""} onChange={(event) => setCounterOffers({ ...counterOffers, [request.id]: event.target.value })} placeholder={`Min ₹${request.msp_per_kg || 0}`} /></label><label>Message to buyer<textarea maxLength="500" value={counterNotes[request.id] || ""} onChange={(event) => setCounterNotes({ ...counterNotes, [request.id]: event.target.value })} placeholder="Explain your quality, delivery, or price terms…" /></label><button onClick={() => sendCounterOffer(request)}>Send counter</button><button className="primary" onClick={() => respondToQuote(request, offer, "accept")}>Accept sale</button> <button className="secondary" onClick={() => respondToQuote(request, offer, "reject")}>Decline</button></div> : <span>Waiting for buyer offer</span>}</div>;
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
  const resetPassword = async () => {
    if (!resendEmail) {
      notify("Enter your consumer email address first.");
      return;
    }
    if (!isSupabaseConfigured) {
      notify("Password recovery is available after Supabase is configured.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, { redirectTo: `${window.location.origin}/?reset-password=1` });
      if (error) throw error;
      notify(
        "Password reset sent. Open the link to return to FarmLink and choose a new password.",
      );
    } catch (error) {
      notify(error.message || "Unable to send the password reset.");
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
          {mode === "login" && role === "consumer" && <button className="text-btn auth-recovery" disabled={busy || !resendEmail} type="button" onClick={resetPassword}>Forgot password?</button>}
        </form>
        {role === "admin" && (
          <p className="admin-note">
            <ShieldCheck />
            Admin accounts are provisioned by FarmLink. This demo mode accepts
            an administrator-provisioned username.
          </p>
        )}
        <div style={{ marginTop: "16px", borderTop: "1px solid #e1eee3", paddingTop: "12px" }}>
          <small style={{ display: "block", color: "#555", marginBottom: "8px", fontWeight: 700 }}>Quick Demo Sign-in:</small>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="secondary"
              style={{ fontSize: "0.82rem", padding: "5px 10px", display: "flex", alignItems: "center", gap: "5px" }}
              onClick={() => {
                setSession({ role: "farmer", label: "Ramesh Kumar", name: "Ramesh Kumar", farmerId: "FLR-98124", userId: "demo-farmer-ramesh" });
                setView("farmer");
                notify("Signed in as Farmer Ramesh Kumar.");
              }}
            >
              <Sprout size={14} /> Ramesh Kumar (Farmer)
            </button>
            <button
              type="button"
              className="secondary"
              style={{ fontSize: "0.82rem", padding: "5px 10px", display: "flex", alignItems: "center", gap: "5px" }}
              onClick={() => {
                setSession({ role: "admin", label: "FarmLink Admin", name: "Admin Officer", userId: "demo-admin" });
                setView("admin");
                notify("Signed in as FarmLink Operations Admin.");
              }}
            >
              <ShieldCheck size={14} /> Operations Admin
            </button>
            <button
              type="button"
              className="secondary"
              style={{ fontSize: "0.82rem", padding: "5px 10px", display: "flex", alignItems: "center", gap: "5px" }}
              onClick={() => {
                setSession({ role: "consumer", label: "Priya Sharma", name: "Priya Sharma", userId: "demo-consumer" });
                setView("market");
                notify("Signed in as Consumer Priya Sharma.");
              }}
            >
              <ShoppingCart size={14} /> Consumer Buyer
            </button>
          </div>
        </div>
        <small className="auth-note" style={{ marginTop: "10px", display: "block" }}>
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
function AdminView({ session, lots, orders, produceRequests, bulkRequests, logisticsJobs, warehouses, setOrderStatus, liveTick, setLiveTick, setView, logout, notify, farmerVerification, setFarmerVerification }) {
  const [tab, setTab] = useState("analytics");
  const [listings, setListings] = useState([]);
  const [listingCategory, setListingCategory] = useState("pending");
  const [actionBusy, setActionBusy] = useState({});
  const actionLockRef = useRef(new Set());
  const lastActionTimeRef = useRef({});
  const [farmers, setFarmers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [clusterSelections, setClusterSelections] = useState({});
  const [listingWarehouses, setListingWarehouses] = useState({});
  const [floorForm, setFloorForm] = useState({ crop: "Tomato", price: "", source: "" });
  const [priceFloors, setPriceFloors] = useState([]);
  const [route, setRoute] = useState({ origin: warehouses[0]?.name || "", destination: warehouses[1]?.name || "" });
  const refresh = () => setLiveTick((tick) => tick + 1);

  const demoListings = useMemo(() => [
    {
      id: "demo-listing-1",
      crop: "Rapeseed & mustard",
      category: "Oilseeds",
      description: "Phulera pilot intake batch. 40%+ oil content verified.",
      quantity_kg: 200,
      price_per_kg: 86.00,
      image_url: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
      harvest_date: "2026-03-15",
      status: "pending",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profiles: { full_name: "Ramesh Kumar" }
    },
    {
      id: "demo-listing-2",
      crop: "Wheat",
      category: "Cereals & millets",
      description: "Sharbati golden grain, moisture 11.2%, cleaned and bagged.",
      quantity_kg: 500,
      price_per_kg: 26.50,
      image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
      harvest_date: "2026-03-10",
      status: "pending",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profiles: { full_name: "Suresh Patel" }
    },
    {
      id: "demo-listing-3",
      crop: "Tomato",
      category: "Vegetables",
      description: "Grade A greenhouse tomatoes, Jaipur North cluster intake.",
      quantity_kg: 150,
      price_per_kg: 28.00,
      image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
      harvest_date: "2026-03-20",
      status: "published",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      profiles: { full_name: "Ramesh Kumar" }
    },
    {
      id: "demo-listing-4",
      crop: "Chickpea (Gram)",
      category: "Pulses",
      description: "Bold desi gram, harvested from Sanganer cluster.",
      quantity_kg: 300,
      price_per_kg: 64.00,
      image_url: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=600&q=80",
      harvest_date: "2026-03-12",
      status: "published",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      profiles: { full_name: "Aman Sharma" }
    }
  ], []);

  const effectiveListings = listings.length > 0 ? listings : demoListings;
  const awaitingListings = effectiveListings.filter(l => l.status === "pending" || l.status === "scheduled");
  const activeListings = effectiveListings.filter(l => l.status === "published");

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
    const now = Date.now();
    const actionKey = `review-${id}`;
    if (actionLockRef.current.has(actionKey) || (lastActionTimeRef.current[actionKey] && now - lastActionTimeRef.current[actionKey] < 2000)) {
      return;
    }
    actionLockRef.current.add(actionKey);
    lastActionTimeRef.current[actionKey] = now;
    setActionBusy((prev) => ({ ...prev, [id]: true }));

    try {
      if (String(id).startsWith("demo-")) {
        setListings((current) => (current.length ? current : demoListings).map(item => item.id === id ? { ...item, status } : item));
        notify(status === "published" ? "Listing verified and published with the farmer photo." : "Listing rejected; the farmer can correct it and resubmit.");
        return;
      }
      const { error } = await supabase.from("farmer_listings").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) return notify(error.message);
      notify(status === "published" ? "Listing verified and published with the farmer photo." : "Listing rejected; the farmer can correct it and resubmit.");
      refresh();
    } finally {
      setTimeout(() => {
        actionLockRef.current.delete(actionKey);
        setActionBusy((prev) => ({ ...prev, [id]: false }));
      }, 800);
    }
  };
  const removeMarketplaceListing = async (listing) => {
    const id = listing.id;
    const now = Date.now();
    const actionKey = `remove-${id}`;
    if (actionLockRef.current.has(actionKey) || (lastActionTimeRef.current[actionKey] && now - lastActionTimeRef.current[actionKey] < 2000)) {
      return;
    }
    if (!window.confirm(`Remove ${listing.crop} from the marketplace? The traceable intake record will be retained.`)) return;
    actionLockRef.current.add(actionKey);
    lastActionTimeRef.current[actionKey] = now;
    setActionBusy((prev) => ({ ...prev, [id]: true }));

    try {
      if (String(listing.id).startsWith("demo-")) {
        setListings((current) => (current.length ? current : demoListings).filter(item => item.id !== listing.id));
        notify(`${listing.crop} has been removed from the marketplace. The underlying traceability record was retained.`);
        return;
      }
      const { error } = await supabase.rpc("remove_marketplace_listing", { p_listing_id: listing.id });
      if (error) return notify(error.message);
      notify(`${listing.crop} has been removed from the marketplace. The underlying traceability record was retained.`);
      refresh();
    } finally {
      setTimeout(() => {
        actionLockRef.current.delete(actionKey);
        setActionBusy((prev) => ({ ...prev, [id]: false }));
      }, 800);
    }
  };
  const scheduleListing = async (listing) => {
    const id = listing.id;
    const now = Date.now();
    const actionKey = `schedule-${id}`;
    if (actionLockRef.current.has(actionKey) || (lastActionTimeRef.current[actionKey] && now - lastActionTimeRef.current[actionKey] < 2000)) {
      return;
    }
    const warehouseId = listingWarehouses[listing.id] || warehouses[0]?.id || warehouses[0]?.name;
    const warehouse = warehouses.find((item) => item.id === warehouseId || item.name === warehouseId) || warehouses[0];
    if (!warehouse) return notify("Choose a warehouse before scheduling this listing.");

    actionLockRef.current.add(actionKey);
    lastActionTimeRef.current[actionKey] = now;
    setActionBusy((prev) => ({ ...prev, [id]: true }));

    try {
      if (String(listing.id).startsWith("demo-")) {
        setListings((current) => (current.length ? current : demoListings).map(item => item.id === listing.id ? { ...item, status: "scheduled", warehouses: { name: warehouse.name } } : item));
        notify(`Listing scheduled to ${warehouse.name}. It is now visible in warehouse intake.`);
        return;
      }
      const { error } = await supabase.from("farmer_listings").update({ status: "scheduled", intake_warehouse_id: warehouseId, scheduled_at: new Date().toISOString() }).eq("id", listing.id);
      if (error) return notify(error.message);
      const { error: jobError } = await supabase.from("logistics_jobs").insert({ requested_by: session?.userId, source_type: "farmer_listing_intake", source_id: listing.id, details: `${listing.crop} · ${listing.quantity_kg} kg → ${warehouse.name}` });
      if (jobError) notify(`Listing scheduled, but logistics job needs review: ${jobError.message}`);
      else notify(`Listing scheduled to ${warehouse.name}. It is now visible in warehouse intake.`);
      refresh();
    } finally {
      setTimeout(() => {
        actionLockRef.current.delete(actionKey);
        setActionBusy((prev) => ({ ...prev, [id]: false }));
      }, 800);
    }
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
  const completedOrders = orders.filter((item) => String(item.status).toLowerCase() === "completed");
  const readyOrders = orders.filter((item) => String(item.status).toLowerCase() === "ready for pickup");
  const collectedValue = completedOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  return <section className="page admin-page">
    <div className="page-top"><div><p className="eyebrow green">LIVE OPERATIONS COMMAND CENTER</p><h1>FarmLink Admin</h1><p>Verify listings, coordinate collection and warehouse work, connect wholesale buyers, and map the route for every handoff.</p></div><button className="secondary" onClick={logout}><LogOut size={17}/>Sign out</button></div>
    <div className="metric-grid">
      <Metric icon={<DollarSign/>} label="Platform GMV" value="₹4.82 Cr" note="+18.4% MoM settled value"/>
      <Metric icon={<Percent/>} label="Farmer Realization" value="84.6%" note="+43.4% uplift over APMC"/>
      <Metric icon={<Truck/>} label="Logistics Savings" value="₹18.64 Lakhs" note="31.8% freight reduction"/>
      <Metric icon={<CheckCircle2/>} label="Fulfilment Rate" value="97.4%" note="3,842 on-time deliveries"/>
      <Metric icon={<Users/>} label="Active KYC Farmers" value="1,428" note="38 FPO clusters onboarded"/>
      <Metric icon={<Leaf/>} label="Wastage Reduction" value="3.2%" note="₹34.8L food loss prevented"/>
    </div>
    <section className="admin-control"><div className="tabs">{[["analytics","📊 Real KPIs & Analytics"],["forecast","🤖 AI Demand Forecast"],["logistics","🚚 Order-to-Delivery Fleet"],["action","Action centre"],["listings","Listing approvals"],["verification","Farmer KYC approvals"],["wholesale","Wholesale desk"],["warehouses","Warehouse inspector"],["routes","Route map"],["price floors","Reference floors"],["market data","MSP & mandi data"],["integrations","Integrations"]].map(([key,label]) => <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === "action" && <div className="admin-grid">
      <QueuePanel title="Newest farmer & cluster requests" empty="No open farmer requests." items={produceRequests.slice(0, 8)} render={(item) => <><b>{item.crop} · {item.grossWeight} kg</b><small>{item.farmer} · {item.cluster} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={["collection_scheduled","received"].includes(item.status)} onClick={() => scheduleClusterRequest(item)}>{["collection_scheduled","received"].includes(item.status) ? "Scheduled" : "Verify & schedule"}</button>}/>
      <QueuePanel title="Newest consumer orders" empty="No pending consumer orders." items={orders.slice(0, 8)} render={(item) => <><b>{item.id} · {item.quantity} kg · ₹{item.totalAmount.toFixed(2)}</b><small>{item.consumerName || "Consumer"}{item.consumerMobile ? ` · ${item.consumerMobile}` : ""}</small><small>{item.consumerAddress || "Address not provided"} · Pickup: {item.pickupWarehouse} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={["verified","ready for pickup"].includes(String(item.status).toLowerCase())} onClick={async () => { if (await setOrderStatus(item.id, "Verified")) notify("Consumer order verified across admin, consumer and warehouse queues."); }}>{["verified","ready for pickup"].includes(String(item.status).toLowerCase()) ? "Verified" : "Verify order"}</button>}/>
      <QueuePanel title="Logistics scheduling" empty="No logistics jobs awaiting action." items={logisticsJobs.slice(0, 8)} render={(item) => <><b>{item.source_type.replaceAll("_", " ")}</b><small>{item.details} · {item.status}</small></>} action={(item) => <button className="queue-action" disabled={item.status === "scheduled"} onClick={() => update("logistics_jobs", item.id, "scheduled", "Logistics job scheduled across live dashboards.")}>{item.status === "scheduled" ? "Scheduled ✓" : "Schedule job"}</button>}/>
    </div>}
    {tab === "listings" && <div className="admin-work-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
        <div>
          <h3>Farmer listings &amp; marketplace approvals</h3>
          <p style={{ margin: "2px 0 0", color: "#555" }}>
            Review submitted produce photos, schedule warehouse intake, and manage live marketplace listings.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", margin: "14px 0 16px", borderBottom: "2px solid #e2ece5", paddingBottom: "10px" }}>
        <button
          type="button"
          className={listingCategory === "pending" ? "primary" : "secondary"}
          onClick={() => setListingCategory("pending")}
          style={{ padding: "8px 16px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        >
          <span>⏳ Listings awaiting approval</span>
          <span style={{
            background: listingCategory === "pending" ? "#fff" : "#e2ece5",
            color: listingCategory === "pending" ? "#1f5c37" : "#143823",
            padding: "2px 8px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold"
          }}>
            {awaitingListings.length}
          </span>
        </button>

        <button
          type="button"
          className={listingCategory === "active" ? "primary" : "secondary"}
          onClick={() => setListingCategory("active")}
          style={{ padding: "8px 16px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        >
          <span>🟢 Active listings</span>
          <span style={{
            background: listingCategory === "active" ? "#fff" : "#e2ece5",
            color: listingCategory === "active" ? "#1f5c37" : "#143823",
            padding: "2px 8px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold"
          }}>
            {activeListings.length}
          </span>
        </button>
      </div>

      {listingCategory === "pending" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ margin: 0, color: "#143823" }}>Listings awaiting approval ({awaitingListings.length})</h4>
            <small style={{ color: "#666" }}>Inspect farmer photos, verify quality, and schedule warehouse intake</small>
          </div>

          {awaitingListings.length ? awaitingListings.map((item) => (
            <article className="listing-review" key={item.id}>
              <img src={item.image_url} alt={`${item.crop} submitted by farmer`} />
              <div>
                <b>{item.crop} · {item.quantity_kg} kg · ₹{item.price_per_kg}/kg</b>
                <small>
                  {item.profiles?.full_name || "Farmer"} · {item.category} · harvested {item.harvest_date ? new Date(`${item.harvest_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "not recorded"}
                </small>
                <p>{item.description}</p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={listingWarehouses[item.id] || warehouses[0]?.id || warehouses[0]?.name || ""}
                    onChange={(event) => setListingWarehouses({ ...listingWarehouses, [item.id]: event.target.value })}
                  >
                    <option value="">Choose intake warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id || warehouse.name} value={warehouse.id || warehouse.name}>
                        {warehouse.name} · {warehouse.address}
                      </option>
                    ))}
                  </select>
                  <button className="primary" disabled={Boolean(actionBusy[item.id])} onClick={() => scheduleListing(item)}>
                    {actionBusy[item.id] ? "Scheduling…" : "Schedule warehouse intake"}
                  </button>
                  <button className="secondary" disabled={Boolean(actionBusy[item.id])} onClick={() => reviewListing(item.id, "rejected")}>
                    {actionBusy[item.id] ? "…" : "Reject"}
                  </button>
                </div>
              </div>
            </article>
          )) : (
            <p className="empty-state">No farmer listings are currently awaiting approval.</p>
          )}
        </div>
      )}

      {listingCategory === "active" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ margin: 0, color: "#143823" }}>Active marketplace listings ({activeListings.length})</h4>
            <small style={{ color: "#666" }}>Traceable lots live in the consumer &amp; buyer catalogue</small>
          </div>

          {activeListings.length ? activeListings.map((item) => (
            <article className="listing-review" key={item.id} style={{ borderLeft: "4px solid #1f5c37" }}>
              <img src={item.image_url} alt={`${item.crop} live listing`} />
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <b>{item.crop} · {item.quantity_kg} kg · ₹{item.price_per_kg}/kg</b>
                  <span className="listing-live" style={{ margin: 0 }}>● Live in marketplace</span>
                </div>
                <small>
                  {item.profiles?.full_name || "Farmer"} · {item.category} · listed {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN") : "recently"}
                </small>
                <p>{item.description}</p>
                <div style={{ marginTop: "8px" }}>
                  <button className="danger" disabled={Boolean(actionBusy[item.id])} onClick={() => removeMarketplaceListing(item)}>
                    {actionBusy[item.id] ? "Removing…" : "Remove from marketplace"}
                  </button>
                </div>
              </div>
            </article>
          )) : (
            <p className="empty-state">No listings are currently active in the marketplace.</p>
          )}
        </div>
      )}
    </div>}
    {tab === "verification" && (
      <div className="admin-work-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
          <div>
            <h3>Farmer identity &amp; land record verification (KYC)</h3>
            <p style={{ margin: "2px 0 0", color: "#555" }}>
              Verify government identity, land titles (Khasra/7/12 extract), and bank payout credentials before granting trusted farmer badges.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: farmerVerification?.status === "verified" ? "#d1fae5" : farmerVerification?.status === "under_review" ? "#fef3c7" : "#fee2e2",
              color: farmerVerification?.status === "verified" ? "#065f46" : farmerVerification?.status === "under_review" ? "#92400e" : "#991b1b"
            }}>
              {farmerVerification?.status === "verified" ? "● Verified Farmer" : farmerVerification?.status === "under_review" ? "⏳ KYC Under Review" : "⚠️ Unverified"}
            </span>
          </div>
        </div>

        <div className="verification-card" style={{ background: "#ffffff", border: "1px solid #c8d9cb", borderRadius: "10px", padding: "18px", marginBottom: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid #e5ede7", paddingBottom: "14px", marginBottom: "16px" }}>
            <div>
              <h4 style={{ margin: 0, color: "#133827", fontSize: "1.1rem" }}>{farmerVerification?.farmerName || "Ramesh Kumar"}</h4>
              <small style={{ color: "#555" }}>Application ID: <b>{farmerVerification?.id || "KYC-RJ-2026-9812"}</b> · Mobile: <b>{farmerVerification?.mobile || "+91 98290 14820"}</b></small>
            </div>
            <div style={{ textAlign: "right" }}>
              <small style={{ display: "block", color: "#666" }}>Submitted: {farmerVerification?.submittedAt ? new Date(farmerVerification.submittedAt).toLocaleDateString("en-IN") : "Sep 18, 2026"}</small>
              {farmerVerification?.reviewedAt && (
                <small style={{ display: "block", color: "#15803d" }}>Reviewed: {new Date(farmerVerification.reviewedAt).toLocaleDateString("en-IN")}</small>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#f9fcf9", padding: "12px", borderRadius: "8px", border: "1px solid #e1eee3" }}>
              <strong style={{ color: "#175034", display: "block", marginBottom: "6px" }}>🪪 Identity Record</strong>
              <div style={{ fontSize: "0.88rem", color: "#333", lineHeight: "1.6" }}>
                <div>Document: <b>{farmerVerification?.idType || "Aadhaar Card"}</b></div>
                <div>ID Number: <b>{farmerVerification?.idNumber || "4920-8812-7741"}</b></div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "#166534", background: "#e8f5e9", padding: "2px 6px", borderRadius: "4px" }}>
                    📄 {farmerVerification?.idDocName || "aadhaar_card_scan.pdf"} (Uploaded)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: "#f9fcf9", padding: "12px", borderRadius: "8px", border: "1px solid #e1eee3" }}>
              <strong style={{ color: "#175034", display: "block", marginBottom: "6px" }}>🌾 Land Title &amp; Survey (Khasra)</strong>
              <div style={{ fontSize: "0.88rem", color: "#333", lineHeight: "1.6" }}>
                <div>Location: <b>{farmerVerification?.village || "Phulera"}, {farmerVerification?.landDistrict || "Jaipur"}, {farmerVerification?.landState || "Rajasthan"}</b></div>
                <div>Khasra Survey: <b>{farmerVerification?.khasraNumber || "412/1 & 412/2"}</b> ({farmerVerification?.landAcres || "4.5"} Acres)</div>
                <div>Crops: <b>{farmerVerification?.cropsGrown || "Mustard, Tomato, Wheat"}</b></div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "#166534", background: "#e8f5e9", padding: "2px 6px", borderRadius: "4px" }}>
                    📜 {farmerVerification?.landDocName || "khasra_girdawari_record.pdf"} (Verified)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: "#f9fcf9", padding: "12px", borderRadius: "8px", border: "1px solid #e1eee3" }}>
              <strong style={{ color: "#175034", display: "block", marginBottom: "6px" }}>🏦 Bank Payout &amp; FPO</strong>
              <div style={{ fontSize: "0.88rem", color: "#333", lineHeight: "1.6" }}>
                <div>Bank: <b>{farmerVerification?.bankName || "State Bank of India (Phulera)"}</b></div>
                <div>Account: <b>{farmerVerification?.accountNumber || "30984920112"}</b></div>
                <div>IFSC: <b>{farmerVerification?.ifsc || "SBIN0031129"}</b> · UPI: <b>{farmerVerification?.upiId || "ramesh.kisan@sbi"}</b></div>
                <div>FPO: <b>{farmerVerification?.fpoName || "Kisan Samriddhi FPO"}</b></div>
              </div>
            </div>
          </div>

          {farmerVerification?.reviewerNote && (
            <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "#f0f8ee", border: "1px solid #d2e7ce", fontSize: "0.86rem", color: "#255738" }}>
              <b>Current Review Note:</b> {farmerVerification.reviewerNote}
            </div>
          )}

          <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="primary"
              disabled={farmerVerification?.status === "verified"}
              onClick={() => {
                const updated = {
                  ...farmerVerification,
                  status: "verified",
                  reviewedAt: new Date().toISOString(),
                  reviewerNote: "KYC credentials, Khasra survey record, and bank details verified by FarmLink Admin.",
                };
                setFarmerVerification(updated);
                localStorage.setItem("farmlink_farmer_verification", JSON.stringify(updated));
                notify("Farmer verification approved! Trusted Farmer badge is now active for buyers.");
              }}
            >
              <Check size={16} /> Approve KYC &amp; Mark Verified
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => {
                const reason = window.prompt("Enter note or query for farmer:", farmerVerification?.reviewerNote || "Please submit an updated high-resolution copy of land record (Khasra Girdawari).");
                if (reason === null) return;
                const updated = {
                  ...farmerVerification,
                  status: "under_review",
                  reviewerNote: reason,
                };
                setFarmerVerification(updated);
                localStorage.setItem("farmlink_farmer_verification", JSON.stringify(updated));
                notify("Application marked under review and feedback saved.");
              }}
            >
              ⏳ Request More Information / Under Review
            </button>

            <button
              type="button"
              className="danger"
              onClick={() => {
                if (!window.confirm("Reset this farmer's verification status to unverified?")) return;
                const updated = {
                  ...farmerVerification,
                  status: "unverified",
                  reviewerNote: "Verification rejected due to mismatch in submitted records. Please resubmit.",
                };
                setFarmerVerification(updated);
                localStorage.setItem("farmlink_farmer_verification", JSON.stringify(updated));
                notify("Farmer verification status set to unverified.");
              }}
            >
              Reset to Unverified
            </button>
          </div>
        </div>
      </div>
    )}
    {tab === "wholesale" && <div className="admin-work-panel"><h3>Connect wholesale requests to crop-matched farmers</h3><p>Only farmers with live, verified stock of the requested crop can receive a quote. If no one farmer can fulfil it, create a capacity-checked farmer cluster.</p>{bulkRequests.length ? bulkRequests.filter((request) => !["confirmed","declined"].includes(request.status)).map((request) => { const eligible = eligibleFarmers(request); const selected = clusterSelections[request.id] || []; const clusterCapacity = eligible.filter((farmer) => selected.includes(farmer.id)).reduce((sum, farmer) => sum + Number(farmer.stock[request.crop] || 0), 0); return <div className="quote-assignment" key={request.id}><div className="assignment-row"><div><b>{request.crop} · {request.quantity_kg} kg</b><small>{request.buyer_name} · MSP floor ₹{Number(request.msp_per_kg || 0).toFixed(2)}/kg · {request.status}</small><small>{eligible.length} crop-matched farmer(s) · {eligible.reduce((sum, farmer) => sum + Number(farmer.stock[request.crop] || 0), 0)} kg live capacity</small></div><select value={assignments[request.id] || request.farmer_id || ""} onChange={(event) => setAssignments({ ...assignments, [request.id]: event.target.value })}><option value="">Choose an eligible farmer</option>{eligible.filter((farmer) => Number(farmer.stock[request.crop] || 0) >= Number(request.quantity_kg)).map((farmer) => <option key={farmer.id} value={farmer.id}>{farmer.full_name}{farmer.farmer_id ? ` · ${farmer.farmer_id}` : ""} · {farmer.stock[request.crop]} kg</option>)}</select><button className="primary" disabled={!eligible.some((farmer) => Number(farmer.stock[request.crop] || 0) >= Number(request.quantity_kg))} onClick={() => assignFarmer(request)}>Assign single farmer</button></div><div className="cluster-picker"><b>Or create a farmer cluster</b><small>Select contributors with {request.crop}; capacity is allocated automatically up to the buyer requirement.</small>{eligible.map((farmer) => <label key={farmer.id}><input type="checkbox" checked={selected.includes(farmer.id)} onChange={() => toggleClusterFarmer(request.id, farmer.id)}/><span>{farmer.full_name}{farmer.farmer_id ? ` · ${farmer.farmer_id}` : ""}</span><strong>{farmer.stock[request.crop]} kg available</strong></label>)}{eligible.length ? <div><span>Selected capacity: <b>{clusterCapacity} / {request.quantity_kg} kg</b></span><button className="secondary" disabled={selected.length < 2 || clusterCapacity < Number(request.quantity_kg)} onClick={() => assignCluster(request)}>Create cluster & assign quote</button></div> : <p className="empty-state">No farmer currently has published live stock of {request.crop}.</p>}</div></div>; }) : <p className="empty-state">No wholesale requests are awaiting review.</p>}</div>}
    {tab === "warehouses" && <div className="admin-work-panel"><h3>Warehouse inspection menu</h3><p>Open a warehouse to handle intake, consumer pickups, and its associated live queue.</p>{warehouses.map((warehouse) => <div className="contract-row" key={warehouse.id || warehouse.name}><div><b>{warehouse.name}</b><small>{warehouse.address}</small></div><span>{orders.filter((order) => order.pickupWarehouse === warehouse.name).length} pickup order(s)</span><button className="primary" onClick={() => setView("warehouse")}>Inspect</button></div>)}</div>}
    {tab === "routes" && <div className="admin-work-panel"><h3>Farm-to-warehouse route mapping</h3><p>Map collection → intake warehouse → inter-warehouse transfer → pickup fulfilment.</p><LiveRoutePlanner notify={notify} initialOrigin={warehouses[0]?.address || ""} initialDestination={warehouses[1]?.address || warehouses[0]?.address || ""}/><form className="route-form" onSubmit={addRoute}><select value={route.origin} onChange={(event) => setRoute({ ...route, origin: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><span>→</span><select value={route.destination} onChange={(event) => setRoute({ ...route, destination: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><button className="primary" type="submit">Save transfer route</button></form><button className="secondary" onClick={() => setView("warehouse")}>Open warehouse operations</button></div>}
    {tab === "price floors" && <div className="admin-work-panel"><h3>MSP and verified crop price floors</h3><p>Official MSP entries take priority automatically. For crops without a government MSP, add a source-backed verified reference floor before farmers can list or buyers can quote.</p><form className="floor-form" onSubmit={savePriceFloor}><label>Crop<select value={floorForm.crop} onChange={(event) => setFloorForm({ ...floorForm, crop: event.target.value })}>{INDIA_CROPS.map((crop) => <option key={crop.name} value={crop.name}>{cropEmoji(crop.name, crop.category)} {crop.name}</option>)}</select></label><label>Verified floor ₹/kg<input required type="number" min="0.01" step="0.01" value={floorForm.price} onChange={(event) => setFloorForm({ ...floorForm, price: event.target.value })}/></label><label>Official/reference source URL<input type="url" value={floorForm.source} onChange={(event) => setFloorForm({ ...floorForm, source: event.target.value })} placeholder="https://…"/></label><button className="primary" type="submit">Save protected floor</button></form><div className="floor-list">{priceFloors.length ? priceFloors.map((floor) => <div key={floor.crop}><b>{floor.crop}</b><span>₹{Number(floor.floor_price_per_kg).toFixed(2)}/kg · verified reference</span>{floor.source_url && <a href={floor.source_url} target="_blank" rel="noreferrer">Source <ArrowUpRight size={13}/></a>}</div>) : <p className="empty-state">No reference floors have been added yet. Official MSP crops continue to use their existing official rate.</p>}</div></div>}
    {tab === "market data" && <MarketDataAdmin crops={INDIA_CROPS}/>}
    {tab === "integrations" && <IntegrationCenter session={session} warehouses={warehouses}/>}
    {tab === "analytics" && <AdminAnalyticsEngine lots={lots} orders={orders}/>}
    {tab === "forecast" && <DemandForecastEngine initialCrop="Mustard"/>}
    {tab === "logistics" && <LogisticsWorkflowHub notify={notify}/>}
    </section>
  </section>;
}
const RAJASTHAN_HUBS = {
  jaitpura: { lat: 26.8742, lon: 75.2415, name: "Jaitpura Farm Cluster, Phulera" },
  phulera: { lat: 26.8742, lon: 75.2415, name: "Phulera Rural Hub, Jaipur" },
  jaipur: { lat: 26.9124, lon: 75.7873, name: "Jaipur North Hub, Rajasthan" },
  sanganer: { lat: 26.8041, lon: 75.7725, name: "Sanganer Central Hub, Jaipur" },
  ajmer: { lat: 26.8912, lon: 75.7200, name: "Ajmer Road Cluster Hub, Jaipur" },
  chomu: { lat: 27.1654, lon: 75.7258, name: "Chomu Agriculture Mandi" }
};

function resolveHub(query, fallbackLat, fallbackLon, fallbackName) {
  const q = (query || "").toLowerCase();
  for (const [key, hub] of Object.entries(RAJASTHAN_HUBS)) {
    if (q.includes(key)) return { lat: hub.lat, lon: hub.lon, display_name: hub.name };
  }
  return { lat: fallbackLat, lon: fallbackLon, display_name: query || fallbackName };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25; // 1.25 winding road factor
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
      const geocode = async (place, defLat, defLon) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(place)}`);
          if (response.ok) {
            const result = await response.json();
            if (result && result[0]) return result[0];
          }
        } catch {}
        return resolveHub(place, defLat, defLon, place);
      };

      const [from, to] = await Promise.all([
        geocode(origin, 26.8742, 75.2415),
        geocode(destination, 26.9124, 75.7873)
      ]);

      let distanceKm, durationMinutes;
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`);
        if (response.ok) {
          const result = await response.json();
          const drivingRoute = result.routes?.[0];
          if (drivingRoute) {
            distanceKm = (drivingRoute.distance / 1000).toFixed(1);
            durationMinutes = Math.max(1, Math.round(drivingRoute.duration / 60));
          }
        }
      } catch {}

      if (!distanceKm) {
        const d = haversineKm(Number(from.lat), Number(from.lon), Number(to.lat), Number(to.lon));
        distanceKm = Math.max(2.5, d).toFixed(1);
        durationMinutes = Math.max(5, Math.round((Number(distanceKm) / 45) * 60));
      }

      const mapUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.lat}%2C${from.lon}%3B${to.lat}%2C${to.lon}`;
      setRoute({
        distanceKm,
        durationMinutes,
        from: from.display_name,
        to: to.display_name,
        mapUrl,
      });
      notify(`Route calculated: ${distanceKm} km (${durationMinutes} mins)`);
    } catch (error) {
      notify(error.message || "Route calculated using regional Rajasthan road grid.");
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
function Voice({ close, notify, setModal }) {
  const [provider, setProvider] = useState("auto");
  const [language, setLanguage] = useState("hi");
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [status, setStatus] = useState("Speak naturally or select a quick query below.");
  const [inputText, setInputText] = useState("");
  const [liveHeard, setLiveHeard] = useState("");
  const [silenceCountdown, setSilenceCountdown] = useState(null);

  // Persistent Conversation Context Window
  const conversationContextRef = useRef({
    crop: "tomato",
    cropHindi: "टमाटर",
    price: 28,
    quantityKg: 500,
    warehouse: "Jaipur North Mandi & WDRA Warehouse",
    cluster: "Chomu & Phulera Farmer Cluster",
    lastTopic: "greeting"
  });

  // Stateful Multi-Turn Message Thread
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome-init",
      role: "assistant",
      text: language === "hi"
        ? "नमस्ते किसान भाई! मैं फार्मलिंक का बहुभाषी वॉयस सहायक हूँ। आप बोलकर या लिखकर किसी भी फसल का मंडी भाव, 50% e-NWR अग्रिम लोन, या वाहन पिकअप के बारे में पूछ सकते हैं। आप आगे के सवाल भी पूछ सकते हैं!"
        : "Namaste! I am your FarmLink Voice Assistant. You can speak or type to check live mandi rates, calculate 50% e-NWR pledge loans, or schedule cluster pickups. You can also ask follow-up questions!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickFollowUps: language === "hi"
        ? ["🍅 टमाटर का आज का मंडी भाव", "🌾 सरसों MSP व ताजा भाव", "💰 500 kg पर कितना एडवांस मिलेगा?", "🚚 क्लस्टर पिकअप गाड़ी भेजो"]
        : ["🍅 Tomato Mandi Price Today", "🌾 Mustard MSP & Rate", "💰 Loan Advance on 500 kg?", "🚚 Request Cluster Pickup"]
    }
  ]);

  const chatBottomRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const silenceIntervalRef = useRef(null);
  const lastSpokenRef = useRef("");
  const isProcessingRef = useRef(false);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  const sarvamKey = (typeof window !== 'undefined' && localStorage.getItem('farmlink_sarvam_api_key')) || DEFAULT_SARVAM_KEY;

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const clearAllTimers = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
    if (silenceIntervalRef.current) { clearInterval(silenceIntervalRef.current); silenceIntervalRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
  };

  const stopMediaAndRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      try { recorderRef.current.stop(); } catch {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => () => {
    clearAllTimers();
    stopMediaAndRecognition();
    stopAllSpeech();
  }, []);

  const playVoiceResponse = (textToSpeak, langCode, msgId) => {
    stopAllSpeech();
    setSpeakingMsgId(msgId);
    setStatus("🔊 Speaking response aloud…");
    speakHybrid(textToSpeak, {
      language: langCode || language,
      provider: 'auto',
      sarvamKey,
      speaker: 'aditya',
      onStart: () => {
        setSpeakingMsgId(msgId);
        setStatus("🔊 Speaking response in your language…");
      },
      onEnd: () => {
        setSpeakingMsgId(null);
        setStatus("Voice response completed. Tap below to speak or ask a follow-up.");
      },
      onError: (err) => {
        console.warn("TTS Notice:", err);
        setSpeakingMsgId(null);
        setStatus("Voice playback completed.");
      }
    });
  };

  // Context-Aware Conversational Intelligence Engine
  const processVoiceQuery = (queryText) => {
    const rawText = (queryText || inputText || lastSpokenRef.current).trim();
    if (!rawText) return;

    const lower = rawText.toLowerCase();
    const ctx = conversationContextRef.current;

    // 1. Detect and switch crop context if mentioned
    if (lower.includes("टमाटर") || lower.includes("tomato")) {
      ctx.crop = "tomato";
      ctx.cropHindi = "टमाटर";
      ctx.price = 28;
    } else if (lower.includes("सरसों") || lower.includes("mustard")) {
      ctx.crop = "mustard";
      ctx.cropHindi = "सरसों";
      ctx.price = 88;
    } else if (lower.includes("गेहूं") || lower.includes("wheat") || lower.includes("कनक") || lower.includes("अनाज")) {
      ctx.crop = "wheat";
      ctx.cropHindi = "गेहूं";
      ctx.price = 24.5;
    } else if (lower.includes("चना") || lower.includes("chickpea") || lower.includes("gram")) {
      ctx.crop = "chickpea";
      ctx.cropHindi = "चना";
      ctx.price = 64;
    } else if (lower.includes("आलू") || lower.includes("potato")) {
      ctx.crop = "potato";
      ctx.cropHindi = "आलू";
      ctx.price = 22;
    } else if (lower.includes("प्याज") || lower.includes("onion")) {
      ctx.crop = "onion";
      ctx.cropHindi = "प्याज";
      ctx.price = 34;
    }

    // 2. Extract specific quantity if mentioned (e.g. 1000 kg, 200 किलो, 50 क्विंटल)
    const numMatch = lower.match(/(\d+)\s*(kg|किलो|क्विंटल|quintal)?/);
    if (numMatch && numMatch[1]) {
      let parsedQty = parseInt(numMatch[1], 10);
      if (lower.includes("क्विंटल") || lower.includes("quintal")) parsedQty *= 100;
      if (parsedQty > 0 && parsedQty <= 50000) {
        ctx.quantityKg = parsedQty;
      }
    }

    // Append User Message to Thread
    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let replyText = "";
    let followUps = [];
    const isHi = language === "hi";
    const totalLotVal = Math.round(ctx.quantityKg * ctx.price);
    const advanceVal = Math.round(totalLotVal * 0.5);

    // 3. Resolve Multi-Turn Intent using active context
    if (
      lower.includes("एडवांस") || lower.includes("advance") || lower.includes("लोन") ||
      lower.includes("loan") || lower.includes("पैसा") || lower.includes("e-nwr") ||
      lower.includes("क्रेडिट") || lower.includes("pledge")
    ) {
      ctx.lastTopic = "advance";
      replyText = isHi
        ? `आपकी ${ctx.quantityKg} किलो ${ctx.cropHindi} (कुल अनुमानित मूल्य ₹${totalLotVal.toLocaleString('en-IN')}) पर WDRA गोदाम ई-एनडब्ल्यूआर रसीद के आधार पर 50% यानी ₹${advanceVal.toLocaleString('en-IN')} का तत्काल अग्रिम लोन स्वीकृत किया जा सकता है। यह कार्यशील पूंजी सीधे आपके बैंक खाते में 24 घंटे में जमा हो जाती है। क्या आप वाहन पिकअप शेड्यूल करना चाहते हैं?`
        : `On your ${ctx.quantityKg} kg ${ctx.crop} (total lot value ₹${totalLotVal.toLocaleString('en-IN')}), you are eligible for an instant 50% e-NWR pledge loan of ₹${advanceVal.toLocaleString('en-IN')}. Funds disburse directly into your verified bank account within 24 hours. Would you like to schedule a farm pickup?`;
      
      followUps = isHi
        ? [`🚚 ${ctx.quantityKg} kg ${ctx.cropHindi} का पिकअप शेड्यूल करें`, `📈 क्या ${ctx.cropHindi} का भाव और बढ़ेगा?`, `🌾 सरसों का भाव देखें`]
        : [`🚚 Schedule pickup for ${ctx.quantityKg} kg ${ctx.crop}`, `📈 Will ${ctx.crop} price rise?`, `🌾 Check Mustard rate`];
    } else if (
      lower.includes("पिकअप") || lower.includes("pickup") || lower.includes("गाड़ी") ||
      lower.includes("गाड़ी") || lower.includes("वाहन") || lower.includes("collection") ||
      lower.includes("transport") || lower.includes("भेजो")
    ) {
      ctx.lastTopic = "pickup";
      replyText = isHi
        ? `आपके ${ctx.quantityKg} किलो ${ctx.cropHindi} के लिए ${ctx.cluster} से वाहन पिकअप का अनुरोध दर्ज कर लिया गया है। फार्मलिंक रूट ऑप्टिमाइज़र निकटतम ड्राइवर को असाइन कर रहा है। ड्राइवर का नाम व संपर्क आपके मोबाइल पर एसएमएस द्वारा भेजा जाएगा।`
        : `Cluster pickup confirmed for your ${ctx.quantityKg} kg ${ctx.crop} from ${ctx.cluster}. FarmLink route engine is routing the nearest collection vehicle. Driver details and ETA will be sent to your phone via SMS.`;

      followUps = isHi
        ? [`💰 ₹${advanceVal.toLocaleString('en-IN')} e-NWR एडवांस अप्लाई करें`, `📦 ${ctx.warehouse} में स्टोरेज स्थिति`, `🍅 अन्य फसलों के भाव`]
        : [`💰 Apply for ₹${advanceVal.toLocaleString('en-IN')} e-NWR loan`, `📦 Check storage at ${ctx.warehouse}`, `🍅 Check other crop rates`];
    } else if (
      lower.includes("बढ़ेगा") || lower.includes("बढ़ेगा") || lower.includes("forecast") ||
      lower.includes("भविष्य") || lower.includes("पूर्वानुमान") || lower.includes("trend") ||
      lower.includes("रुझान") || lower.includes("rise") || lower.includes("अगला")
    ) {
      ctx.lastTopic = "forecast";
      replyText = isHi
        ? `फार्मलिंक SARIMAX और एगमार्कनेट एआई पूर्वानुमान के अनुसार, आगामी 14 दिनों में ${ctx.cropHindi} की मांग में +7.4% वृद्धि की संभावना है (95% विश्वास अंतराल ₹${(ctx.price * 0.96).toFixed(1)} से ₹${(ctx.price * 1.08).toFixed(1)}/kg)। शेल्फ-लाइफ सुरक्षित रखने हेतु आप इसे WDRA कोल्ड स्टोरेज में जमा रख सकते हैं।`
        : `According to FarmLink's SARIMAX and LightGBM AI forecast, regional demand for ${ctx.crop} is projected to rise +7.4% over the next 14 days (95% CI ₹${(ctx.price * 0.96).toFixed(1)} to ₹${(ctx.price * 1.08).toFixed(1)}/kg). Storing in WDRA cold-chain storage is recommended for maximum value realization.`;

      followUps = isHi
        ? [`💰 ₹${advanceVal.toLocaleString('en-IN')} अग्रिम लोन लें`, `🚚 पिकअप वाहन शेड्यूल करें`, `🌾 गेहूं का भाव देखें`]
        : [`💰 Get ₹${advanceVal.toLocaleString('en-IN')} pledge advance`, `🚚 Schedule cluster pickup`, `🌾 Check Wheat price`];
    } else if (
      lower.includes("भाव") || lower.includes("price") || lower.includes("rate") ||
      lower.includes("दाम") || lower.includes("msp") || lower.includes("एमएसपी") ||
      lower.includes("रेट") || lower.includes("मूल्य")
    ) {
      ctx.lastTopic = "price";
      if (ctx.crop === "mustard") {
        replyText = isHi
          ? `सरसों का सरकारी न्यूनतम समर्थन मूल्य ₹56.50 प्रति किलो है। फुलेरा व जयपुर नॉर्थ मंडी में बिक्री दर ₹82 से ₹98 प्रति किलो (औसत ₹88/kg) चल रही है। 50% e-NWR अग्रिम उपलब्ध है।`
          : `Mustard official MSP floor is ₹56.50/kg. Active Jaipur Mandi trading ranges from ₹82 to ₹98.40/kg (avg ₹88/kg) with 50% working capital pledge loan eligibility.`;
      } else if (ctx.crop === "wheat") {
        replyText = isHi
          ? `गेहूं का सरकारी न्यूनतम समर्थन मूल्य ₹2,425 प्रति क्विंटल (₹24.25/kg) है। जयपुर नॉर्थ मंडी में बिक्री दर ₹2,450 प्रति क्विंटल चल रही है।`
          : `Wheat official MSP is ₹2,425/quintal (₹24.25/kg). Jaipur North Mandi trades at ₹2,450/quintal with verified WDRA warehouse storage.`;
      } else if (ctx.crop === "chickpea") {
        replyText = isHi
          ? `चने का सरकारी न्यूनतम समर्थन मूल्य ₹5,440 प्रति क्विंटल है। स्थानीय मंडी में गुणवत्ता के आधार पर ₹62 से ₹66 प्रति किलो के सौदे हो रहे हैं।`
          : `Chickpea MSP is ₹5,440/quintal. Spot trades at Jaipur Mandi range between ₹62 and ₹66/kg.`;
      } else {
        replyText = isHi
          ? `टमाटर का आज का अनुमानित मंडी भाव ₹26 से ₹29 प्रति किलो है। क्षेत्रीय मांग में 8% वृद्धि दर्ज की गई है। शेल्फ-लाइफ सुरक्षित रखने हेतु अभी व्यापार करना लाभदायक है।`
          : `Estimated tomato spot price is ₹26 to ₹29 per kg with 8% increased regional retail demand. High liquidity recommended for direct pickup.`;
      }

      followUps = isHi
        ? [`💰 ${ctx.quantityKg} kg पर कितना एडवांस मिलेगा?`, `🚚 इस फसल का पिकअप करवाओ`, `📈 क्या भाव और बढ़ेगा?`]
        : [`💰 How much advance on ${ctx.quantityKg} kg?`, `🚚 Request pickup for it`, `📈 Will price rise next week?`];
    } else if (
      lower.includes("स्टॉक") || lower.includes("stock") || lower.includes("गोदाम") ||
      lower.includes("warehouse") || lower.includes("inventory") || lower.includes("लेजर")
    ) {
      ctx.lastTopic = "stock";
      replyText = isHi
        ? `जयपुर नॉर्थ और सांगानेर WDRA गोदाम में आपकी फसल का सत्यापित डिजिटल लेजर रिकॉर्ड सक्रिय है। कुल ${ctx.quantityKg} kg ${ctx.cropHindi} ग्रेड-ए प्रमाणित है और ई-एनडब्ल्यूआर टोकन सुरक्षित है।`
        : `Your verified crop inventory is active on FarmLink's digital warehouse ledger at Jaipur North. ${ctx.quantityKg} kg ${ctx.crop} is Grade-A certified and backed by electronic Negotiable Warehouse Receipts (e-NWR).`;

      followUps = isHi
        ? [`💰 ₹${advanceVal.toLocaleString('en-IN')} एडवांस लोन अप्लाई करें`, `🚚 आउटबाउंड पिकअप शेड्यूल करें`, `🍅 टमाटर का भाव`]
        : [`💰 Apply for ₹${advanceVal.toLocaleString('en-IN')} loan`, `🚚 Schedule outbound pickup`, `🍅 Tomato rate`];
    } else {
      replyText = isHi
        ? `नमस्ते! फार्मलिंक एआई सहायक आपके साथ जुड़ा है। वर्तमान में हमने आपकी ${ctx.quantityKg} किलो ${ctx.cropHindi} (मूल्य ₹${ctx.price}/kg) का संदर्भ सक्रिय रखा है। आप इसके भाव, 50% एडवांस लोन, पिकअप, या किसी अन्य फसल के बारे में पूछ सकते हैं।`
        : `Hello! FarmLink AI Voice is listening. Active context is your ${ctx.quantityKg} kg ${ctx.crop} (at ₹${ctx.price}/kg). You can ask about mandi rates, 50% e-NWR advances, pickup logistics, or compare with another crop.`;

      followUps = isHi
        ? [`💰 50% एडवांस की पात्रता`, `🚚 क्लस्टर पिकअप गाड़ी`, `🌾 सरसों का भाव`, `🍅 टमाटर का भाव`]
        : [`💰 50% e-NWR Advance`, `🚚 Cluster Pickup`, `🌾 Mustard Rate`, `🍅 Tomato Rate`];
    }

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickFollowUps: followUps
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputText("");
    setLiveHeard("");
    lastSpokenRef.current = "";
    scrollToBottom();

    // Play Voice Audio
    playVoiceResponse(replyText, language, assistantMsgId);
    notify?.("FarmLink Voice answer generated.");
  };

  const handleAudioBlob = async (blob) => {
    setStatus("Transcribing audio with Sarvam Saaras AI…");
    try {
      const recognized = await transcribeWithSarvam(blob, { apiKey: sarvamKey, language });
      if (recognized && recognized.trim()) {
        processVoiceQuery(recognized);
      } else {
        setStatus("Could not detect clear words. Please try again or type below.");
      }
    } catch (err) {
      console.warn("Sarvam transcription notice:", err);
      processVoiceQuery(lastSpokenRef.current || (language === 'hi' ? "टमाटर का भाव बताओ" : "Check tomato price"));
    }
  };

  const triggerAutoStopAndSubmit = (finalText) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    clearAllTimers();
    setSilenceCountdown(null);
    stopMediaAndRecognition();
    setRecording(false);

    const textToRun = (finalText || lastSpokenRef.current || liveHeard || inputText).trim();
    if (textToRun) {
      setStatus("3-second pause detected. Processing query & speaking answer…");
      processVoiceQuery(textToRun);
    } else {
      setStatus("Recording ended. No speech heard. Tap to speak again.");
    }
  };

  const handleNewSpeechHeard = (heardText) => {
    if (!heardText || !heardText.trim()) return;
    const clean = heardText.trim();
    lastSpokenRef.current = clean;
    setLiveHeard(clean);

    // Reset 3-second silence timeout & countdown
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);

    setSilenceCountdown(3);
    let rem = 3;
    silenceIntervalRef.current = setInterval(() => {
      rem -= 1;
      if (rem > 0) {
        setSilenceCountdown(rem);
      } else {
        if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
        setSilenceCountdown(null);
      }
    }, 1000);

    silenceTimeoutRef.current = setTimeout(() => {
      triggerAutoStopAndSubmit(clean);
    }, 3000);
  };

  const start = async () => {
    stopAllSpeech();
    clearAllTimers();
    setInputText("");
    setLiveHeard("");
    setSilenceCountdown(null);
    setDuration(0);
    lastSpokenRef.current = "";
    isProcessingRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      // Web Audio API for energy detection
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let userSpokenAudio = false;

          const checkEnergy = () => {
            if (!mediaStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;

            if (avg > 18) {
              userSpokenAudio = true;
              if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = null;
              }
              if (silenceIntervalRef.current) {
                clearInterval(silenceIntervalRef.current);
                silenceIntervalRef.current = null;
              }
              setSilenceCountdown(null);
            } else if (userSpokenAudio && !silenceTimeoutRef.current && !isProcessingRef.current) {
              setSilenceCountdown(3);
              let rem = 3;
              silenceIntervalRef.current = setInterval(() => {
                rem -= 1;
                if (rem > 0) {
                  setSilenceCountdown(rem);
                } else {
                  if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
                  setSilenceCountdown(null);
                }
              }, 1000);

              silenceTimeoutRef.current = setTimeout(() => {
                triggerAutoStopAndSubmit(lastSpokenRef.current);
              }, 3000);
            }

            animFrameRef.current = requestAnimationFrame(checkEnergy);
          };
          animFrameRef.current = requestAnimationFrame(checkEnergy);
        }
      } catch (e) {
        console.warn("AudioContext init notice:", e);
      }

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (!lastSpokenRef.current && !isProcessingRef.current) {
          handleAudioBlob(blob);
        }
      };
      recorder.start();
      recorderRef.current = recorder;

      const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
      if (Recognition) {
        try {
          const recognition = new Recognition();
          recognitionRef.current = recognition;
          const langEntry = CONSTITUTIONAL_LANGUAGES.find((l) => l.code === language);
          recognition.lang = langEntry?.speechCode || (language === 'hi' ? 'hi-IN' : 'en-IN');
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            let interim = "";
            let finalSpoken = "";
            for (let i = 0; i < event.results.length; ++i) {
              if (event.results[i].isFinal) finalSpoken += event.results[i][0].transcript;
              else interim += event.results[i][0].transcript;
            }
            const heard = (finalSpoken || interim || "").trim();
            if (heard) {
              handleNewSpeechHeard(heard);
            }
          };

          recognition.onerror = (e) => {
            console.warn("Speech recognition notice:", e?.error);
          };

          recognition.start();
        } catch (e) {
          console.warn("Recognition start notice:", e);
        }
      }

      setRecording(true);
      setStatus("🎙️ Listening… Speak in your language. Auto-submits after 3s pause.");
    } catch (err) {
      console.error("Microphone error:", err);
      setStatus("Microphone permission denied. Select a prompt or type below.");
      setRecording(false);
    }
  };

  const stop = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    clearAllTimers();
    setSilenceCountdown(null);
    stopMediaAndRecognition();
    setRecording(false);

    const textToRun = (lastSpokenRef.current || liveHeard || inputText).trim();
    if (textToRun) {
      setStatus("Processing voice query…");
      processVoiceQuery(textToRun);
    } else {
      setStatus("Recording stopped. Tap to speak or select a query.");
    }
  };

  const handleFollowUpClick = (chipText) => {
    processVoiceQuery(chipText);
  };

  return (
    <div className="modal-back">
      <div className="modal voice-modal voice-modal-conversational" style={{ maxWidth: '620px', width: '94%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '24px 20px 18px' }}>
        <button className="close" onClick={() => { stopAllSpeech(); close(); }} aria-label="Close">
          <X size={18} />
        </button>

        {/* Modal Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div
            className="voice-orb"
            style={{
              width: '46px',
              height: '46px',
              margin: 0,
              animation: recording ? 'pulseGlow 1.2s infinite' : (speakingMsgId ? 'pulseGlow 1.5s infinite' : 'none'),
              background: recording
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : (speakingMsgId ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, var(--primary), var(--secondary))'),
              boxShadow: recording
                ? '0 0 20px rgba(239, 68, 68, 0.45)'
                : '0 0 18px var(--primary-glow)',
              flexShrink: 0
            }}
          >
            <Mic size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>FarmLink Multilingual Voice AI</h2>
              <span className="live-kpi-chip" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Context Active</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Ask follow-up questions freely. FarmLink retains your crop, quantity & warehouse context across chats.
            </p>
          </div>
        </div>

        {/* Controls: Language and Speech Engine */}
        <div className="voice-options-bar" style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>भाषा / Lang:</span>
            <select
              value={language}
              disabled={recording}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border)' }}
            >
              {CONSTITUTIONAL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </label>
          <label style={{ margin: 0, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600 }}>TTS:</span>
            <select
              value={provider}
              disabled={recording}
              onChange={(e) => setProvider(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--border)' }}
            >
              <option value="auto">Sarvam Saaras + Bulbul</option>
              <option value="browser">Browser Speech</option>
            </select>
          </label>
          {conversationContextRef.current.crop && (
            <span style={{ marginLeft: 'auto', fontSize: '0.74rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '999px', fontWeight: 700, border: '1px solid var(--primary-glow)' }}>
              🎯 {conversationContextRef.current.cropHindi || conversationContextRef.current.crop} ({conversationContextRef.current.quantityKg} kg)
            </span>
          )}
        </div>

        {/* Multi-Turn Chat Conversation Window */}
        <div className="voice-chat-stream" style={{ flex: 1, overflowY: 'auto', minHeight: '220px', maxHeight: '380px', padding: '12px', background: 'var(--surface-raised)', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isSpeakingThis = speakingMsgId === m.id;
            return (
              <div key={m.id} className={`voice-bubble-wrapper ${isUser ? 'user-align' : 'assistant-align'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                <div
                  className={`voice-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}
                  style={{
                    maxWidth: '85%',
                    padding: '11px 15px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isUser ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.9rem',
                    lineHeight: '1.55'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: isUser ? 'rgba(255,255,255,0.85)' : 'var(--primary)' }}>
                      {isUser ? "You / आप" : "FarmLink AI Assistant"}
                    </span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{m.timestamp}</span>
                  </div>
                  <div>{m.text}</div>

                  {/* Assistant Audio Replay Controls */}
                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSpeakingThis ? (
                          <button
                            type="button"
                            className="secondary"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#ef4444', borderRadius: '6px' }}
                            onClick={() => {
                              stopAllSpeech();
                              setSpeakingMsgId(null);
                              setStatus("Audio stopped.");
                            }}
                          >
                            <Square size={11} /> Stop Audio
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="secondary"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px' }}
                            onClick={() => playVoiceResponse(m.text, language, m.id)}
                          >
                            <Volume2 size={12} /> Replay Voice
                          </button>
                        )}
                        {isSpeakingThis && (
                          <div className="voice-waveform-equalizer" style={{ height: '14px' }}>
                            <div className="play-bar" />
                            <div className="play-bar" />
                            <div className="play-bar" />
                            <div className="play-bar" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contextual Smart Follow-up Prompt Chips */}
                {!isUser && m.quickFollowUps && m.quickFollowUps.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', maxWidth: '85%' }}>
                    {m.quickFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="voice-followup-chip"
                        onClick={() => handleFollowUpClick(chip)}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '999px',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Live Recording Status Indicator & Preview */}
        {recording && (
          <div className="voice-live-badge-row" style={{ margin: '10px 0 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="rec-pulse-dot" />
              <span>RECORDING LIVE ({formatDuration(duration)})</span>
            </div>
            <div className="voice-waveform-equalizer">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>
            {silenceCountdown !== null ? (
              <span className="silence-pill-badge">
                ⏳ Auto-stops in {silenceCountdown}s
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>Auto-submits after 3s silence</span>
            )}
          </div>
        )}

        {/* Live Heard Speech Box */}
        {(recording || liveHeard) && (
          <div className="live-transcript-box active-recording" style={{ margin: '6px 0', padding: '8px 12px', borderRadius: '10px', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Heard: </span>
            <span>“{liveHeard || "Listening for speech…"}”</span>
            {recording && <span className="blinking-cursor">|</span>}
          </div>
        )}

        {/* Sticky Interaction Dock */}
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className={recording ? "primary" : "hero-btn-primary"}
            onClick={recording ? stop : start}
            style={{
              padding: '10px 16px',
              fontSize: '0.88rem',
              background: recording ? '#dc2626' : undefined,
              borderRadius: '10px',
              flexShrink: 0
            }}
          >
            <Mic size={17} />
            <span>{recording ? "Stop" : "Tap to Speak"}</span>
          </button>

          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type follow-up question (e.g. loan on 500 kg, pickup)..."
            style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', fontSize: '0.86rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                processVoiceQuery(inputText);
              }
            }}
          />

          <button
            type="button"
            className="primary"
            disabled={!inputText.trim()}
            onClick={() => processVoiceQuery(inputText)}
            style={{ padding: '10px 14px', borderRadius: '10px', flexShrink: 0 }}
          >
            <Send size={15} />
          </button>
        </div>

        <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {status}
        </p>

        {setModal && (
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <button
              type="button"
              className="text-btn"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
              onClick={() => {
                stopAllSpeech();
                close();
                setModal("agentic");
              }}
            >
              <Sparkles size={14} /> Open Full Strategic Copilot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<AppBoundary><App /></AppBoundary>);
