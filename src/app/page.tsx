"use client";

/**
 * Karya Saarthi - Official Portfolio & Project Platform
 * 
 * Main landing page integrating:
 * - Responsive navigation with light/dark theme switcher
 * - Hero section with primary CTA and consulting highlights
 * - Core services grid with interactive quote builder
 * - Interactive ROI estimator calculator
 * - Case study showcases with animated 3D device mockups
 * - Team credentials, client reviews, and verifiable outcomes
 * - Direct WhatsApp integration and branded Scroll-To-Top button
 * - Executive Portfolio PDF generator modal and consultation scheduler
 */

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectsSection from "@/components/ProjectsSection";
import RoiCalculator from "@/components/RoiCalculator";
import OutcomesSection from "@/components/OutcomesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import PortfolioPdfModal from "@/components/PortfolioPdfModal";
import AppointmentModal from "@/components/AppointmentModal";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";

export default function Home() {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedServiceForQuote, setSelectedServiceForQuote] = useState("");
  const [estimateForQuote, setEstimateForQuote] = useState("");

  const scrollToContact = () => {
    const contactElement = document.getElementById("contact");
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenAppointmentModal = (serviceTitle?: string) => {
    if (serviceTitle) {
      setSelectedServiceForQuote(serviceTitle);
    }
    setIsAppointmentModalOpen(true);
  };

  const handleSelectServiceForQuote = (serviceTitle: string) => {
    setSelectedServiceForQuote(serviceTitle);
    handleOpenAppointmentModal(serviceTitle);
  };

  const handleSendEstimate = (service: string, estimate: string) => {
    setSelectedServiceForQuote(service);
    setEstimateForQuote(estimate);
    handleOpenAppointmentModal(service);
  };

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-slate-50 dark:bg-[#0E0E11] text-slate-900 dark:text-white selection:bg-[#FF6B35] selection:text-white relative transition-colors duration-300">
      {/* Fixed Glassmorphism Navbar */}
      <Navbar
        onOpenConsultation={() => handleOpenAppointmentModal()}
        onOpenPortfolioPdf={() => setIsPdfModalOpen(true)}
      />

      {/* Main Sections */}
      <Hero
        onOpenConsultation={() => handleOpenAppointmentModal()}
        onOpenQuote={scrollToContact}
      />

      <AboutSection />

      <ServicesSection onSelectServiceForQuote={handleSelectServiceForQuote} />

      <ProjectsSection onOpenConsultation={() => handleOpenAppointmentModal()} />

      <RoiCalculator onSendEstimate={handleSendEstimate} />

      <OutcomesSection />

      <TestimonialsSection />

      <TeamSection />

      <ContactSection
        initialService={selectedServiceForQuote}
        initialEstimate={estimateForQuote}
      />

      {/* Interactive Appointment Booking Modal (Dispatches to info@karyasaarthi.com) */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        preselectedService={selectedServiceForQuote}
      />

      {/* Downloadable / Viewable Executive Portfolio PDF Modal */}
      {isPdfModalOpen && (
        <PortfolioPdfModal onClose={() => setIsPdfModalOpen(false)} />
      )}

      {/* Floating Scroll To Top Button (Direct to Top) */}
      <ScrollToTop />

      {/* Right-Side Floating WhatsApp Widget (Direct to 9153780968) */}
      <WhatsAppWidget />

      {/* Footer */}
      <Footer onOpenAppointment={() => handleOpenAppointmentModal()} />
    </main>
  );
}
