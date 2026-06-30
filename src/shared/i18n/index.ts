import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to ProofPath",
      "no_aadhaar": "NO Aadhaar required",
      "Language": "English",
      // Wallet Module 3
      "wallet_home": "My Wallet",
      "show_qr": "Show Identity QR",
      "trust_score": "Trust Score",
      "add_entry": "Add Entry",
      "security": "Security",
      "evidence_timeline": "Evidence Timeline",
      "wallet_integrity_valid": "Wallet Integrity: Valid ✓",
      "wallet_integrity_warning": "Warning: Data may have been modified",
      "residence_badge": "Residence",
      "employment_badge": "Employment",
      "identity_badge": "Identity",
      "unverified": "Unverified",
      "community_verified": "Community Verified",
      "ngo_verified": "NGO Verified",
      "offline_qr_note": "This QR can be scanned without internet",
      // Notifications
      "notif_slot_title": "ProofPath Camp Reminder",
      "notif_slot_24h": "Your ProofPath slot is tomorrow at {{time}}. Please bring your documents.",
      "notif_slot_2h": "Your ProofPath slot is in 2 hours at {{time}}. Head to the camp now.",
      "notif_evidence_title": "Complete Your Evidence",
      "notif_evidence_body": "Your trust score is only {{score}}. Add more documents to strengthen your identity.",
      "notif_affidavit_title": "Your Affidavit is Ready",
      "notif_affidavit_body": "Your identity affidavit has been generated. Open ProofPath to view and share it."
    }
  },
  hi: {
    translation: {
      "welcome": "प्रूफपाथ में आपका स्वागत है",
      "no_aadhaar": "आधार की आवश्यकता नहीं है",
      // Wallet
      "wallet_home": "मेरा वॉलेट",
      "show_qr": "पहचान QR दिखाएं",
      "trust_score": "विश्वास स्कोर",
      "add_entry": "प्रविष्टि जोड़ें",
      "security": "सुरक्षा",
      "evidence_timeline": "साक्ष्य टाइमलाइन",
      "wallet_integrity_valid": "वॉलेट सत्यापित: वैध ✓",
      "wallet_integrity_warning": "चेतावनी: डेटा बदला गया हो सकता है",
      "residence_badge": "निवास",
      "employment_badge": "रोजगार",
      "identity_badge": "पहचान",
      "unverified": "असत्यापित",
      "community_verified": "समुदाय सत्यापित",
      "ngo_verified": "NGO सत्यापित",
      "offline_qr_note": "यह QR बिना इंटरनेट के स्कैन किया जा सकता है",
      // Notifications
      "notif_slot_title": "प्रूफपाथ कैंप अनुस्मारक",
      "notif_slot_24h": "आपका स्लॉट कल {{time}} बजे है। कृपया अपने दस्तावेज़ लाएं।",
      "notif_slot_2h": "आपका स्लॉट 2 घंटे में {{time}} बजे है। अभी कैंप की ओर चलें।",
      "notif_evidence_title": "अपना साक्ष्य पूरा करें",
      "notif_evidence_body": "आपका विश्वास स्कोर केवल {{score}} है। अधिक दस्तावेज़ जोड़ें।",
      "notif_affidavit_title": "आपका हलफनामा तैयार है",
      "notif_affidavit_body": "आपका पहचान हलफनामा तैयार हो गया है। देखने के लिए प्रूफपाथ खोलें।"
    }
  },
  bn: {
    translation: {
      "welcome": "প্রুফপাথে স্বাগতম",
      "no_aadhaar": "আধার প্রয়োজন নেই",
    }
  },
  ta: { translation: {} },
  te: { translation: {} },
  or: { translation: {} },
  mr: { translation: {} },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
