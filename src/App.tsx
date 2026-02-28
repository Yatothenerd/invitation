/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useWeddingApp } from './hooks/useWeddingApp';
import { LandingSection } from './components/sections/LandingSection';
import { FormalInvitationSection } from './components/sections/FormalInvitationSection';
import { AgendaSection } from './components/sections/AgendaSection';
import { GallerySection } from './components/sections/GallerySection';
import { SupportSection } from './components/sections/SupportSection';
import { LocationSection } from './components/sections/LocationSection';
import { WishingCardSection } from './components/sections/WishingCardSection';
import { Footer } from './components/sections/Footer';
import { ImageModal } from './components/modals/ImageModal';
import { AdminModal } from './components/modals/AdminModal';
import { FloatingControls } from './components/FloatingControls';
import AdminPage from './pages/AdminPage';
import QRPanel from './pages/QRPanel';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const adminParam = params.get('admin') === '1';
  const pathname = window.location.pathname || '/';
  if (pathname.startsWith('/qr')) {
    return <QRPanel />;
  }

  if (adminParam) {
    return <AdminPage />;
  }
  const {
    showScrollTop,
    selectedImage,
    setSelectedImage,
    wishes,
    name,
    setName,
    message,
    setMessage,
    isSubmitting,
    guestName,
    isAdmin,
    setIsAdmin,
    guests,
    isMuted,
    mainRef,
    secondSectionRef,
    handleSubmitWish,
    scrollToTop,
    scrollToContent,
    toggleMute,
    handleShare,
    handleGetLocation
  } = useWeddingApp();

  return (
    <div className="bg-stone-200 min-h-screen">
      <div className="phone-container no-scrollbar" ref={mainRef}>
        <LandingSection 
          guestName={guestName} 
          scrollToContent={scrollToContent} 
        />

        <div ref={secondSectionRef}>
          <FormalInvitationSection />
          <AgendaSection />
          <GallerySection setSelectedImage={setSelectedImage} />
          <SupportSection />
          <LocationSection handleGetLocation={handleGetLocation} />
          <WishingCardSection 
            name={name}
            setName={setName}
            message={message}
            setMessage={setMessage}
            isSubmitting={isSubmitting}
            handleSubmitWish={handleSubmitWish}
            wishes={wishes}
          />
          <Footer />
          
          <FloatingControls 
            isMuted={isMuted}
            toggleMute={toggleMute}
            showScrollTop={showScrollTop}
            scrollToTop={scrollToTop}
          />
        </div>
      </div>

      <ImageModal 
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        handleShare={handleShare}
      />

      <AdminModal 
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        guests={guests}
      />
    </div>
  );
}
