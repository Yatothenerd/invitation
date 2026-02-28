import React, { useState, useEffect, useRef } from 'react';
import { Wish, Guest } from '../types';
import { encodeGuestName } from '../utils/guestCode';

export const useWeddingApp = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('ភ្ញៀវកិត្តិយស');
  const [isAdmin, setIsAdmin] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function init() {
      // Prefer short-code path (/u/CODE) -> find guest by code
      const pathname = window.location.pathname || '/';
      const match = pathname.match(/^\/u\/(.+)$/);
      if (match && match[1]) {
        const code = match[1];
        try {
          const res = await fetch('/api/guests');
          if (res.ok) {
            const data: Guest[] = await res.json();
            const found = data.find(g => encodeGuestName(((g as any).Name || (g as any).name || Object.values(g)[0] || '').toString()) === code);
            if (found) {
              const name = (found as any).Name || (found as any).name || Object.values(found)[0];
              setGuestName(name as string);
            }
          }
        } catch (e) {
          // ignore — fallback to query param
        }
      }

      const params = new URLSearchParams(window.location.search);
      const guest = params.get('guest') || params.get('name');
      if (guest) {
        setGuestName(guest);
      }
      if (params.get('admin') === 'true' || params.get('admin') === '1') {
        setIsAdmin(true);
        fetchGuests();
      }
      fetchWishes();
    }

    init();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests');
      const data = await response.json();
      setGuests(data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      const data = await res.json();
      setWishes(data);
    } catch (error) {
      console.error("Failed to fetch wishes", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const audio = new Audio('/audio/bg-music.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.5;
    audioRef.current = audio;

    const playAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    const handleFirstInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      if (res.ok) {
        setName('');
        setMessage('');
        fetchWishes();
      }
    } catch (error) {
      console.error("Failed to submit wish", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContent = () => {
    secondSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Photo',
          text: 'Check out this beautiful wedding photo!',
          url: imageUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleGetLocation = () => {
    const url = `https://maps.app.goo.gl/fQmcW4u8Sxrj2wtF7`;
    window.open(url, '_blank');
  };

  return {
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
  };
};
