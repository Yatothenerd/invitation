import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CornerDecor } from '../common/Common';

function DynamicNamePlaceholder({ guestName }: { guestName: string }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const nameRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const img = document.getElementById('landing-name-placeholder') as HTMLImageElement | null;
    const nameEl = document.querySelector('.guest-name') as HTMLElement | null;
    if (!img || !nameEl) return;

    // measure displayed name width and set placeholder width accordingly
    // add small padding so placeholder is slightly larger than name
    const nameWidth = nameEl.scrollWidth || nameEl.getBoundingClientRect().width || 200;
    const padding = 48; // px
    const desired = Math.min(window.innerWidth * 0.9, Math.max(200, Math.ceil(nameWidth + padding)));
    img.style.width = desired + 'px';
  }, [guestName]);

  return null;
}

interface LandingSectionProps {
  guestName: string;
  scrollToContent: () => void;
}

export const LandingSection: React.FC<LandingSectionProps> = ({ guestName, scrollToContent }) => {
  const isKhmer = /[\u1780-\u17FF]/.test(guestName || '');

  return (
    <section 
      className="min-h-screen flex flex-col items-center justify-between text-wedding-gold p-8 text-center relative overflow-hidden pt-10 pb-10"
      style={{
        backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0) 60%), url("/image/Photo/Cover.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-4 border border-wedding-gold/30 pointer-events-none z-20"></div>
      <div className="absolute inset-6 border-2 border-wedding-gold/20 pointer-events-none z-20"></div>
      <CornerDecor />
      
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
        className="relative z-10"
      >
        <img src="/image/Asset/abbreviationname.png" alt="frame" className="w-full max-w-[150px]" />
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center mb-2"
      >
        <p className="font-sans uppercase text-[16px] mb-2 text-wedding-landbody">សូមគោរពអញ្ជើញ</p>
        <div className="mb-2">
          <div className="relative flex items-center justify-center max-h-[80px] min-h-[40px]">
          <img
            ref={(el) => { /* placeholder ref set later in effect */ }}
            id="landing-name-placeholder"
            src="/image/Asset/name_placeholder.png"
            alt="name placeholder"
            className="absolute left-1/2 -translate-x-1/2 w-auto max-w-[430px] opacity-60 pointer-events-none"
          />
          <h2 ref={(el) => { /* name ref set later in effect */ }} className={`${isKhmer ? 'font-moulpali' : 'font-koulen'} guest-name text-wedding-white italic relative z-10 w-full text-center`}>{guestName}</h2>
        </div>

        {/* dynamic sizing: scale placeholder to match guest name width when using break-all */}
        <DynamicNamePlaceholder guestName={guestName} />
                 <p className="font-sans text-[16px] text-wedding-landbody uppercase mt-1 mb-2">ចូលរួមជាអធិបតីក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(220, 178, 135, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToContent}
            className="text-wedding-white/90 opacity-50 mt-4 mb-4 font-koulen border-wedding-landbody/30  animate-bounce  px-4 p -3 rounded-full text-sm tracking-widest transition-all duration-300"
          >
           បើកលិខិតអញ្ជើញ
          </motion.button>
         
        </div>
      </motion.div>
    </section>
  );
};
