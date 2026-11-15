"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { COUNTRIES_195, CountryItem } from "@/data/countries195";
import { TRANSLATIONS } from "@/data/translations";

interface CountryContextType {
  selectedCountry: CountryItem;
  setSelectedCountry: (country: CountryItem) => void;
  selectCountryByCode: (code: string) => void;
  selectQuickCurrency: (currencyCode: string) => void;
  formatPrice: (inrAmount: number) => string;
  convertBudget: (rawStr: string) => string;
  t: (key: string, defaultText?: string) => string;
  isCountriesModalOpen: boolean;
  openCountriesModal: () => void;
  closeCountriesModal: () => void;
}

const defaultCountry = COUNTRIES_195.find((c) => c.code === "IN") || COUNTRIES_195[0];

const CountryContext = createContext<CountryContextType>({
  selectedCountry: defaultCountry,
  setSelectedCountry: () => {},
  selectCountryByCode: () => {},
  selectQuickCurrency: () => {},
  formatPrice: () => "",
  convertBudget: (s) => s,
  t: (k, d) => d || k,
  isCountriesModalOpen: false,
  openCountriesModal: () => {},
  closeCountriesModal: () => {},
});

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountryState] = useState<CountryItem>(defaultCountry);
  const [isCountriesModalOpen, setIsCountriesModalOpen] = useState(false);

  // Restore country preference from localStorage if available
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem("ks_selected_country");
      if (savedCode) {
        const match = COUNTRIES_195.find((c) => c.code === savedCode);
        if (match) setSelectedCountryState(match);
      }
    } catch {}
  }, []);

  const setSelectedCountry = (country: CountryItem) => {
    setSelectedCountryState(country);
    try {
      localStorage.setItem("ks_selected_country", country.code);
    } catch {}
  };

  const selectCountryByCode = (code: string) => {
    const match = COUNTRIES_195.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (match) setSelectedCountry(match);
  };

  const selectQuickCurrency = (currencyCode: string) => {
    const match = COUNTRIES_195.find((c) => c.currency.toUpperCase() === currencyCode.toUpperCase());
    if (match) setSelectedCountry(match);
  };

  const openCountriesModal = () => setIsCountriesModalOpen(true);
  const closeCountriesModal = () => setIsCountriesModalOpen(false);

  // Currency Converter Formatter
  const formatPrice = (inrAmount: number): string => {
    if (!selectedCountry) return `₹${inrAmount.toLocaleString('en-IN')}`;
    
    // For India, always format in Indian Rupees
    if (selectedCountry.code === "IN") {
      return `₹${inrAmount.toLocaleString('en-IN')}`;
    }

    const converted = Math.round(inrAmount * selectedCountry.rate);
    const sym = selectedCountry.symbol;
    
    // Clean symbol spacing
    const needsSpace = sym.length > 2 || sym === "AED" || sym === "SAR" || sym === "CHF" || sym === "Rs";
    const prefix = needsSpace ? `${sym} ` : sym;

    return `${prefix}${converted.toLocaleString()}`;
  };

  // Convert raw price strings like "₹75,000", "₹10,000 - ₹2,00,000", "₹25 Lakh"
  const convertBudget = (rawStr: string): string => {
    if (!rawStr || selectedCountry.code === "IN") return rawStr;

    // Handle range e.g. "₹10,000 - ₹2,00,000"
    if (rawStr.includes("-")) {
      const parts = rawStr.split("-");
      const cleanMin = parseInt(parts[0].replace(/[^0-9]/g, ""), 10);
      const cleanMax = parseInt(parts[1].replace(/[^0-9]/g, ""), 10);
      if (!isNaN(cleanMin) && !isNaN(cleanMax)) {
        return `${formatPrice(cleanMin)} - ${formatPrice(cleanMax)}`;
      }
    }

    // Handle single number e.g. "₹75,000"
    const num = parseInt(rawStr.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num) && num > 0) {
      // Special handle Lakhs e.g. "₹25 Lakh" -> 2,500,000
      if (rawStr.toLowerCase().includes("lakh") || rawStr.toLowerCase().includes("lac")) {
        const inrVal = num * 100000;
        return formatPrice(inrVal);
      }
      return formatPrice(num);
    }

    return rawStr;
  };

  // Language Translation Function
  // Rule: If India is selected, always show English as instructed.
  // If another country is selected, show that country's language.
  const t = (key: string, defaultText?: string): string => {
    // If India is selected, always show English as instructed:
    // "India choose kare to English ki language show ho aur currency bhi India ki show ho"
    if (selectedCountry.code === "IN") {
      return TRANSLATIONS.en?.[key] || defaultText || key;
    }

    const lang = selectedCountry.lang || "en";
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict?.[key] || TRANSLATIONS.en?.[key] || defaultText || key;
  };

  const value = useMemo(
    () => ({
      selectedCountry,
      setSelectedCountry,
      selectCountryByCode,
      selectQuickCurrency,
      formatPrice,
      convertBudget,
      t,
      isCountriesModalOpen,
      openCountriesModal,
      closeCountriesModal,
    }),
    [selectedCountry, isCountriesModalOpen]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = () => useContext(CountryContext);
