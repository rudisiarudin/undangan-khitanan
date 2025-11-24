import React, { useState, useEffect, useRef } from 'react';
import { CoupleData, GeneratedContent } from '../types';
import { BatikDivider } from './Ornament';
import { MapPin, Calendar, Heart, Music, Pause, Gift, Home, User, MessageCircle, Copy, Check, X, Send, Clock, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const JAVA_GUNUNGAN_URL = "https://i.pinimg.com/originals/fa/31/d7/fa31d7c7845aa910ec6aed6a46f97387.png";
const LINE_ORNAMENT_URL = "https://lottie.host/3154f9d8-a4ce-489b-b0de-08becb1486f8/26TNw6VVFY.lottie";
const LOTTIE_SPINNING_FLOWER = "https://lottie.host/491d953d-27d6-4e58-9669-7682d338f9a3/WJ4u2t9aFp.lottie"; // Gold Mandala
const LOTTIE_FLOATING_LEAVES = "https://lottie.host/5753b27b-2c5e-442a-a53d-88b9c719543e/M8X6X8qgq7.lottie"; // Golden Particles/Leaves

interface InvitationPreviewProps {
  data: CoupleData;
  aiContent: GeneratedContent | null;
  isLoadingAI: boolean;
}

interface CommentData {
    name: string;
    msg: string;
    time: string;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({ data, aiContent, isLoadingAI }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Guest Name State
  const [guestName, setGuestName] = useState<string>('');
  const [isCustomGuest, setIsCustomGuest] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Gallery Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Gallery Modal State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Comment System State
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentMsg, setNewCommentMsg] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Section Refs for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    eventType,
    groomNickname, brideNickname,
    groomName, brideName,
    groomParents, brideParents,
    weddingDate, weddingTime,
    eventName, secondEventName,
    secondEventDate, secondEventTime,
    locationName, locationAddress,
    coverPhoto, couplePhoto,
    gallery,
    donation,
    multiDonations
  } = data;

  const isKhitanan = eventType === 'KHITANAN';
  const isTunangan = eventType === 'TUNANGAN';

  // Dynamic Text based on Event Type
  const headerTitle = isKhitanan ? "Undangan Khitan" : (isTunangan ? "The Engagement Of" : "The Wedding Of");
  
  // Custom or Default Event Titles
  const akadTitle = eventName || (isKhitanan ? "Prosesi Khitan" : (isTunangan ? "Tukar Cincin" : "Akad Nikah"));
  const akadSubtitle = isKhitanan ? "The Procession" : "The Ceremony";
  
  const resepsiTitle = secondEventName || (isKhitanan ? "Walimatul Khitan" : "Resepsi");
  const resepsiSubtitle = isKhitanan ? "The Celebration" : "The Party";
  
  const coupleSectionTitle = isKhitanan ? "Putra Kami" : "Mempelai";
  
  const displayCover = coverPhoto || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";
  const displayCouple = couplePhoto || (isKhitanan 
      ? "https://images.unsplash.com/photo-1516575150278-77136aed6920?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" // Boy image
      : "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"); // Couple image

  // Helper function to format relative time
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  // Fetch comments from Supabase
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data: fetchedComments, error } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching comments:', error);
            // Fallback to empty if table doesn't exist yet
            setComments([]);
            return;
        }

        if (fetchedComments) {
           const formatted = fetchedComments.map((item: any) => ({
             name: item.name,
             msg: item.message,
             time: timeAgo(item.created_at)
           }));
           setComments(formatted);
        }
      } catch (err) {
        console.error("Supabase connection error:", err);
      }
    };

    fetchComments();

    // Optional: Set up realtime subscription
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
         const newComment = payload.new as any;
         setComments(prev => [{
            name: newComment.name,
            msg: newComment.message,
            time: 'Baru saja'
         }, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Retrieve Guest Name from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Check for 'to', 'guest', 'u', or 'kpd' parameters
    const name = params.get('to') || params.get('guest') || params.get('u') || params.get('kpd');
    if (name) {
      setGuestName(name);
      setIsCustomGuest(true);
      // Auto-fill the comment name if it's a custom link
      setNewCommentName(name);
    } else {
      setGuestName('Tamu Undangan');
      setIsCustomGuest(false);
    }
  }, []);

  // Check Fullscreen State changes from browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
            console.error(`Error attempting to enable fullscreen: ${e.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  const handleOpenInvitation = () => {
    setIsOpen(true);
    // Auto enter fullscreen on mobile devices to enhance experience
    // Check if it is a touch device or small screen
    if (window.innerWidth < 768) { 
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
                // Ignore errors if fullscreen is blocked or not supported
            });
        }
    }
  };

  // Play audio when modal opens
  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Autoplay prevented:", e));
    }
  }, [isOpen]);

  // Countdown Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse time from weddingTime string (e.g., "16.00 WIB" -> "16:00")
      const timeString = data.weddingTime ? data.weddingTime.replace('.', ':').split(' ')[0] : '08:00';
      
      // Assume WIB (UTC+7) for valid count down if user is in different zone, or just use local simple parse
      // For simplicity and robustness in this demo, we use ISO format with offset +07:00
      const eventDateStr = `${data.weddingDate}T${timeString}:00+07:00`;
      const eventDate = new Date(eventDateStr);
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [data.weddingDate, data.weddingTime]);

  // Slideshow Auto-play
  useEffect(() => {
    if (!gallery || gallery.length === 0) return;
    const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [gallery]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCommentClick = () => {
      if (isCustomGuest) {
          setShowCommentModal(true);
      } else {
          alert("Maaf, fitur ucapan hanya tersedia untuk tamu dengan undangan khusus (tautan pribadi).");
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security check on submit as well
    if (!isCustomGuest) {
        alert("Akses ditolak. Gunakan link undangan resmi.");
        return;
    }

    if (newCommentName && newCommentMsg && !isSubmittingComment) {
      setIsSubmittingComment(true);
      
      try {
        const { error } = await supabase
            .from('comments')
            .insert([{ name: newCommentName, message: newCommentMsg }]);

        if (error) throw error;

        // If successful, reset form and close
        setNewCommentMsg(''); // Keep name if they want to post again? Or clear it. Usually clear msg only is better UX but protecting name is good.
        setShowCommentModal(false);
      } catch (err) {
        console.error("Error submitting comment:", err);
        alert("Gagal mengirim ucapan. Pastikan koneksi internet Anda lancar.");
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };

  // Custom Smooth Scroll Function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const container = scrollContainerRef.current;

    if (element && container) {
        const start = container.scrollTop;
        // Get relative position
        const elementTop = element.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        const offset = elementTop - containerTop;
        
        const target = start + offset;
        const startTime = performance.now();
        const duration = 1200; // ms duration for elegance

        // Quintic easing for very smooth start/stop
        const easeInOutQuint = (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeInOutQuint(progress);
            
            container.scrollTo(0, start + (offset * ease));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
  };

  const getBankLogo = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('bni')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg/2560px-Bank_Negara_Indonesia_logo_%282004%29.svg.png";
    if (name.includes('bca')) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj_ezaPhTLJU84qim6HtqI26tC6p2kq0FEgQ&s";
    return null;
  };

  if (!isOpen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-java-dark text-white overflow-hidden h-[100dvh] w-full bg-batik-pattern bg-cover bg-center"
      >
        {/* Full Cover Image Overlay */}
        <div className="absolute inset-0 z-0 bg-java-dark/90">
        </div>

        {/* Animated Background Ornaments (Lottie) */}
        <div className="absolute top-[-15%] left-[-15%] w-[80%] md:w-[60%] opacity-30 pointer-events-none z-10 animate-spin-slow">
            {/* @ts-ignore */}
            <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.5" loop autoplay></dotlottie-player>
        </div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[80%] md:w-[60%] opacity-30 pointer-events-none z-10 animate-spin-slow-reverse">
             {/* @ts-ignore */}
             <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.5" loop autoplay></dotlottie-player>
        </div>
        
        {/* Floating Leaves */}
        <div className="absolute inset-0 z-10 opacity-20 pointer-events-none">
             {/* @ts-ignore */}
             <dotlottie-player src={LOTTIE_FLOATING_LEAVES} background="transparent" speed="0.8" loop autoplay></dotlottie-player>
        </div>

        <div className="relative z-20 text-center p-6 md:p-8 max-w-lg w-full animate-fade-in-up border border-java-gold/30 bg-java-dark/40 backdrop-blur-sm rounded-3xl m-4 shadow-2xl">
           <div className="mb-6 md:mb-8 flex justify-center">
              <img src={JAVA_GUNUNGAN_URL} alt="Gunungan" className="h-36 md:h-52 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-fade-in-up" />
           </div>
           
           <h3 className="text-xs md:text-base font-sans tracking-[0.4em] mb-4 text-white/90 uppercase font-semibold">{headerTitle}</h3>
           
           <h1 className="text-3xl md:text-7xl font-script text-java-gold mb-6 md:mb-8 leading-normal drop-shadow-md">
             {isKhitanan ? groomNickname : `${groomNickname} & ${brideNickname}`}
           </h1>

           {/* GUEST NAME SECTION */}
           <div className="mb-6 md:mb-8 animate-zoom-in" style={{ animationDelay: '0.5s' }}>
             <p className="text-white/70 text-xs md:text-sm font-sans mb-2 tracking-widest">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
             <div className="bg-white/10 border border-java-gold/30 rounded-xl p-3 backdrop-blur-md inline-block min-w-[200px]">
                <h2 className="text-xl md:text-2xl font-bold text-white font-display tracking-wide capitalize">
                   {guestName}
                </h2>
             </div>
             <p className="text-white/50 text-[10px] mt-2 italic">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
           </div>
           
           <button 
             onClick={handleOpenInvitation}
             className="bg-java-gold hover:bg-java-gold-dark text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 mx-auto tracking-wide text-sm font-sans"
           >
             <MessageCircle size={18} />
             BUKA UNDANGAN
           </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-java-cream hide-scrollbar relative text-java-brown font-sans">
      {/* Audio Element - Improved Archive.org Link */}
      <audio ref={audioRef} loop src="https://narendra.itpalugada.com/wp-content/uploads/2025/11/Gending-Temanten-Adat-Jawa-kebo-giro.mp3" />
      
      {/* Floating Controls (Music + Fullscreen) */}
      <div className="fixed bottom-24 left-6 z-40 md:bottom-6 flex flex-col gap-3">
        {/* Fullscreen Toggle */}
        <button
            onClick={toggleFullscreen}
            className="bg-java-dark/80 text-java-gold p-3 rounded-full shadow-lg hover:bg-java-dark transition-all border border-java-gold/30 backdrop-blur-sm"
            title="Toggle Fullscreen"
        >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        {/* Music Toggle */}
        <button 
          onClick={toggleAudio}
          className="bg-java-gold text-white p-3 rounded-full shadow-lg hover:bg-java-gold-dark transition-all animate-spin-slow border-2 border-white"
          style={{ animationDuration: '4s', animationPlayState: isPlaying ? 'running' : 'paused' }}
        >
          {isPlaying ? <Music size={20} /> : <Pause size={20} />}
        </button>
      </div>

      {/* Navbar Bottom (Mobile Style) - Updated with Smooth Scroll */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-java-dark/95 backdrop-blur-md text-java-gold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex gap-6 md:gap-8 border border-java-gold/30">
        <button onClick={() => scrollToSection('section-home')} className="hover:text-white transition-colors hover:scale-110"><Home size={20} className="md:w-6 md:h-6"/></button>
        <button onClick={() => scrollToSection('section-couple')} className="hover:text-white transition-colors hover:scale-110"><User size={20} className="md:w-6 md:h-6"/></button>
        <button onClick={() => scrollToSection('section-event')} className="hover:text-white transition-colors hover:scale-110"><Calendar size={20} className="md:w-6 md:h-6"/></button>
        <button onClick={() => scrollToSection('section-wishes')} className="hover:text-white transition-colors hover:scale-110"><MessageCircle size={20} className="md:w-6 md:h-6"/></button>
      </div>

      {/* --- HERO SECTION --- */}
      <section id="section-home" className="h-[100dvh] relative flex items-center justify-center overflow-hidden py-10 md:py-20 bg-batik-pattern bg-cover bg-center">
         {/* Overlay to ensure text readability on batik */}
        <div className="absolute inset-0 bg-java-dark/85"></div>

        {/* Lottie Ornaments (Top Corners) */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 md:w-80 md:h-80 opacity-40 z-10 animate-spin-slow pointer-events-none">
             {/* @ts-ignore */}
             <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.5" loop autoplay></dotlottie-player>
        </div>
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 md:w-80 md:h-80 opacity-40 z-10 transform scale-x-[-1] animate-spin-slow pointer-events-none">
             {/* @ts-ignore */}
             <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.5" loop autoplay></dotlottie-player>
        </div>

        {/* Floating Leaves Background */}
        <div className="absolute inset-0 w-full h-full opacity-30 z-0 pointer-events-none">
             {/* @ts-ignore */}
             <dotlottie-player src={LOTTIE_FLOATING_LEAVES} background="transparent" speed="0.8" loop autoplay></dotlottie-player>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mt-0 md:mt-12">
          <div className="animate-fade-in-up">
             <h4 className="text-white/90 font-sans tracking-[0.3em] uppercase mb-4 md:mb-6 text-xs md:text-base drop-shadow-sm font-bold">{headerTitle}</h4>
             <h1 className="text-4xl md:text-8xl font-script text-java-gold mb-6 md:mb-8 drop-shadow-lg leading-snug py-2">
               {isKhitanan ? groomNickname : `${groomNickname} & ${brideNickname}`}
             </h1>
             
             {/* Countdown Timer */}
             <div className="flex flex-wrap justify-center gap-3 md:gap-8 my-8 md:my-12">
                <CountdownItem value={timeLeft.days} label="Hari" />
                <CountdownItem value={timeLeft.hours} label="Jam" />
                <CountdownItem value={timeLeft.minutes} label="Menit" />
                <CountdownItem value={timeLeft.seconds} label="Detik" />
             </div>

             <div className="inline-block border-y border-white/20 py-3 md:py-4 px-6 md:px-10 backdrop-blur-sm bg-white/5 rounded-2xl shadow-lg">
                <p className="text-lg md:text-2xl text-white font-display italic tracking-wide">
                  {new Date(weddingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
             </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-java-cream to-transparent z-10"></div>
      </section>

      {/* --- QUOTE / PRAYER SECTION --- */}
      <section className="py-16 md:py-24 px-6 bg-java-cream relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <img src={JAVA_GUNUNGAN_URL} alt="Gunungan" className="h-24 md:h-32 mx-auto mb-6 md:mb-8 opacity-100 drop-shadow-sm" />
          <h3 className="text-2xl md:text-3xl font-display text-java-dark mb-6 md:mb-8 font-bold tracking-wide">Doa & Harapan</h3>
          <p className="text-java-brown font-display text-lg md:text-2xl leading-relaxed italic mb-8 md:mb-10 px-2 md:px-12">
            "{aiContent?.quote || "Mugi-mugi Gusti Allah tansah paring berkah..."}"
          </p>
          
          {/* Lottie Divider */}
          <div className="w-full max-w-xs mx-auto h-16 opacity-80 animate-fade-in-up">
              {/* @ts-ignore */}
              <dotlottie-player src={LINE_ORNAMENT_URL} background="transparent" speed="1" loop autoplay></dotlottie-player>
          </div>
        </div>
        
        {/* Lottie Background Ornaments */}
        <div className="absolute top-10 left-[-50px] w-64 h-64 opacity-10 text-java-dark pointer-events-none animate-spin-slow">
            {/* @ts-ignore */}
            <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.3" loop autoplay></dotlottie-player>
        </div>
        <div className="absolute bottom-10 right-[-50px] w-64 h-64 opacity-10 text-java-dark pointer-events-none animate-spin-slow-reverse">
             {/* @ts-ignore */}
            <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.3" loop autoplay></dotlottie-player>
        </div>
      </section>

      {/* --- OPENING GREETING --- */}
      <section className="py-12 px-6 bg-white text-center relative overflow-hidden border-b border-java-gold/10">
        <div className="absolute inset-0 bg-paper-texture opacity-30"></div>
        <div className="max-w-3xl mx-auto font-display text-java-brown space-y-4 md:space-y-6 relative z-10 animate-fade-in-up">
            <h3 className="text-xl md:text-3xl font-bold text-java-dark">Assalamu’alaikum Warahmatullahi Wabarakatuh</h3>
            <p className="leading-relaxed text-base md:text-lg text-gray-700 font-sans">
                Dengan memanjatkan puji syukur ke hadirat Allah SWT atas limpahan rahmat dan karunia-Nya, kami sekeluarga bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Khitanan putra pertama kami:
            </p>
        </div>
      </section>

      {/* --- COUPLE / CHILD SECTION --- */}
      <section id="section-couple" className="py-16 md:py-24 px-6 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
           <div className="text-center mb-10 md:mb-16">
              {/* Lottie Divider replaces BatikDivider */}
              <div className="w-full max-w-sm mx-auto h-20 mb-6 opacity-90">
                 {/* @ts-ignore */}
                 <dotlottie-player src={LINE_ORNAMENT_URL} background="transparent" speed="1" loop autoplay></dotlottie-player>
              </div>
              <h2 className="text-3xl md:text-6xl font-script text-java-dark">{coupleSectionTitle}</h2>
           </div>

           <div className={`flex flex-col ${isKhitanan ? 'items-center' : 'md:flex-row justify-center items-center'} gap-10 md:gap-20`}>
              
              {/* Groom / Child */}
              <div className="flex flex-col items-center text-center animate-zoom-in group">
                 <div className="relative w-56 h-56 md:w-80 md:h-80 mb-6 md:mb-8">
                    <div className="absolute inset-0 border-[3px] border-java-gold rounded-full transform rotate-3 transition-transform duration-500 group-hover:rotate-12 opacity-60"></div>
                    <div className="absolute inset-0 border-[3px] border-java-dark/20 rounded-full transform -rotate-3 transition-transform duration-500 group-hover:-rotate-12"></div>
                    
                    {/* Image Wrapper with Clipping for Zoom Effect */}
                    <div className="absolute inset-0 rounded-full overflow-hidden z-10 shadow-2xl">
                        <img 
                          src={isKhitanan ? displayCouple : (data.couplePhoto || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80")} 
                          alt={groomName} 
                          className={`w-full h-full object-cover transition-transform duration-700 ${isKhitanan ? 'scale-[1.8] object-[center_15%]' : ''}`}
                        />
                    </div>
                 </div>
                 <h3 className="text-2xl md:text-4xl font-display font-bold text-java-dark mb-2 md:mb-3 tracking-wide">{groomName}</h3>
                 <p className="text-java-gold-dark font-sans text-xs tracking-[0.2em] font-bold uppercase mb-3 md:mb-4">{isKhitanan ? "Putra Tercinta Dari" : "Putra Bpk/Ibu"}</p>
                 <p className="text-java-brown font-sans text-base md:text-lg max-w-md leading-relaxed px-4">{groomParents}</p>
                 {isKhitanan && (
                   <div className="mt-6 md:mt-8 bg-java-cream px-6 md:px-8 py-3 md:py-4 rounded-xl border border-java-gold/30 shadow-sm relative overflow-hidden">
                     {/* Subtle floating leaves behind weton */}
                     <div className="absolute inset-0 opacity-10 pointer-events-none">
                         {/* @ts-ignore */}
                         <dotlottie-player src={LOTTIE_FLOATING_LEAVES} background="transparent" speed="0.5" loop autoplay></dotlottie-player>
                     </div>
                     <p className="text-java-gold-dark font-bold font-display italic text-lg md:text-2xl relative z-10">{aiContent?.wetonAnalysis ? aiContent.wetonAnalysis.split(':')[0] : 'Sabtu Kliwon'}</p>
                   </div>
                 )}
              </div>

              {!isKhitanan && (
                <>
                  <div className="text-5xl md:text-7xl font-script text-java-gold/50">&</div>

                  {/* Bride */}
                  <div className="flex flex-col items-center text-center animate-zoom-in group">
                    <div className="relative w-56 h-56 md:w-80 md:h-80 mb-6 md:mb-8">
                        <div className="absolute inset-0 border-[3px] border-java-gold rounded-full transform -rotate-3 transition-transform duration-500 group-hover:-rotate-12 opacity-60"></div>
                        <div className="absolute inset-0 border-[3px] border-java-dark/20 rounded-full transform rotate-3 transition-transform duration-500 group-hover:rotate-12"></div>
                        <div className="absolute inset-0 rounded-full overflow-hidden z-10 shadow-2xl">
                          <img 
                            src={data.couplePhoto ? data.couplePhoto : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"} 
                            alt={brideName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-display font-bold text-java-dark mb-2 md:mb-3 tracking-wide">{brideName}</h3>
                    <p className="text-java-gold-dark font-sans text-xs tracking-[0.2em] font-bold uppercase mb-3 md:mb-4">Putri Bpk/Ibu</p>
                    <p className="text-java-brown font-sans text-base md:text-lg max-w-md leading-relaxed px-4">{brideParents}</p>
                  </div>
                </>
              )}
           </div>
        </div>
      </section>

      {/* --- EVENT DETAILS --- */}
      <section id="section-event" className="py-16 md:py-24 px-4 md:px-6 bg-java-dark text-white relative bg-batik-pattern bg-blend-multiply overflow-hidden">
         {/* Lottie Overlay for Event Section */}
         <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-java-cream to-transparent z-10 opacity-10"></div>
         <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20 pointer-events-none rotate-180">
            {/* @ts-ignore */}
            <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="0.4" loop autoplay></dotlottie-player>
         </div>

         <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-6xl font-script text-java-gold mb-10 md:mb-16 drop-shadow-lg">Rangkaian Acara</h2>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
               {/* Event 1 */}
               <div className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/20 hover:border-java-gold/60 transition-all hover:transform hover:-translate-y-2 hover:shadow-2xl hover:bg-white/10 group relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
                     {/* @ts-ignore */}
                     <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="1" loop autoplay></dotlottie-player>
                  </div>

                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-java-gold/10 mb-4 md:mb-6 text-java-gold group-hover:bg-java-gold group-hover:text-java-dark transition-colors relative z-10">
                    <Heart size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-display font-bold text-white mb-2 tracking-wide relative z-10">{akadTitle}</h3>
                  <p className="text-java-gold/90 font-sans text-xs tracking-widest uppercase mb-6 md:mb-8 font-semibold relative z-10">{akadSubtitle}</p>
                  
                  <div className="space-y-4 md:space-y-6 text-gray-200 relative z-10">
                    <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                      <Calendar size={20} className="text-java-gold mb-1 md:w-6 md:h-6"/>
                      <span className="font-display text-lg md:text-xl">{new Date(weddingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                      <Clock size={20} className="text-java-gold mb-1 md:w-6 md:h-6"/>
                      <span className="font-display text-lg md:text-xl">{weddingTime}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                      <MapPin size={20} className="text-java-gold mb-1 md:w-6 md:h-6"/>
                      <span className="font-sans font-medium text-base md:text-lg">{locationName}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/10 relative z-10">
                     <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 leading-relaxed px-2 md:px-4">{locationAddress}</p>
                     <a 
                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`}
                       target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-2 text-xs font-bold text-java-dark bg-java-gold px-5 py-2.5 md:px-6 md:py-3 rounded-full hover:bg-white transition-all transform hover:scale-105"
                     >
                       <MapPin size={14} /> LIHAT LOKASI
                     </a>
                  </div>
               </div>

               {/* Event 2 */}
               <div className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/20 hover:border-java-gold/60 transition-all hover:transform hover:-translate-y-2 hover:shadow-2xl hover:bg-white/10 group relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
                     {/* @ts-ignore */}
                     <dotlottie-player src={LOTTIE_SPINNING_FLOWER} background="transparent" speed="1" loop autoplay></dotlottie-player>
                  </div>
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-java-gold/10 mb-4 md:mb-6 text-java-gold group-hover:bg-java-gold group-hover:text-java-dark transition-colors relative z-10">
                    <Gift size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-display font-bold text-white mb-2 tracking-wide relative z-10">{resepsiTitle}</h3>
                  <p className="text-java-gold/90 font-sans text-xs tracking-widest uppercase mb-6 md:mb-8 font-semibold relative z-10">{resepsiSubtitle}</p>
                  
                  <div className="space-y-4 md:space-y-6 text-gray-200 relative z-10">
                    <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                      <Calendar size={20} className="text-java-gold mb-1 md:w-6 md:h-6"/>
                      <span className="font-display text-lg md:text-xl">{new Date(secondEventDate || weddingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                     <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                      <Clock size={20} className="text-java-gold mb-1 md:w-6 md:h-6"/>
                      <span className="font-display text-lg md:text-xl">{secondEventTime || "11:00 WIB"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                      <MapPin size={20} className="text-java-gold mb-1 md:w-6 md:h-6"/>
                      <span className="font-sans font-medium text-base md:text-lg">{locationName}</span>
                    </div>
                  </div>
                   <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/10 relative z-10">
                     <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 leading-relaxed px-2 md:px-4">{locationAddress}</p>
                      <a 
                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`}
                       target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-2 text-xs font-bold text-java-dark bg-java-gold px-5 py-2.5 md:px-6 md:py-3 rounded-full hover:bg-white transition-all transform hover:scale-105"
                     >
                       <MapPin size={14} /> LIHAT LOKASI
                     </a>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- GALLERY SLIDESHOW --- */}
      {gallery && gallery.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 bg-java-cream">
           <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                 <h2 className="text-3xl md:text-6xl font-script text-java-dark mb-4 md:mb-6">Galeri Momen</h2>
                 <BatikDivider className="w-40 md:w-56 mx-auto text-java-gold" />
              </div>
              
              <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
                 {gallery.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                       <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-java-dark/60 via-transparent to-transparent opacity-60"></div>
                    </div>
                 ))}

                 {/* Navigation Dots */}
                 <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-20">
                    {gallery.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all shadow-md ${idx === currentSlide ? 'bg-java-gold scale-125' : 'bg-white/50 hover:bg-white'}`}
                        />
                    ))}
                 </div>
                 
                  <button 
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length)}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                  >
                     <ChevronLeft size={20} className="md:w-6 md:h-6"/>
                  </button>
                   <button 
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % gallery.length)}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                  >
                     <ChevronRight size={20} className="md:w-6 md:h-6"/>
                  </button>
              </div>
           </div>
        </section>
      )}

      {/* --- GIFT / DONATION --- */}
      <section className="py-16 md:py-24 px-6 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
           <h2 className="text-3xl md:text-4xl font-display font-bold text-java-dark mb-4 md:mb-6 tracking-wide">Tanda Kasih</h2>
           <p className="text-java-brown mb-8 md:mb-12 font-sans leading-relaxed text-base md:text-lg">Tanpa mengurangi rasa hormat, bagi bapak/ibu/saudara/i yang ingin memberikan tanda kasih untuk kami, dapat melalui:</p>
           
           {/* Single Card Container */}
           <div className="bg-java-cream rounded-3xl border border-java-gold/30 shadow-xl overflow-hidden max-w-2xl mx-auto">
              {/* Card Header */}
              <div className="bg-java-dark py-3 md:py-4 px-6">
                <h3 className="text-white font-display text-lg md:text-xl tracking-wider text-center">Rekening Tujuan</h3>
              </div>

              {/* Accounts List */}
              <div className="divide-y divide-java-gold/20">
                  {multiDonations && multiDonations.length > 0 ? (
                    multiDonations.map((acc, idx) => (
                       <div key={idx} className="p-5 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 hover:bg-white transition-colors">
                          {/* Logo Area */}
                          <div className="w-full md:w-32 flex-shrink-0 flex justify-center md:justify-start">
                             {getBankLogo(acc.bankName) ? (
                               <img src={getBankLogo(acc.bankName)!} alt={acc.bankName} className="h-8 md:h-12 object-contain" />
                             ) : (
                               <div className="h-10 w-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-bold text-xs">{acc.bankName}</div>
                             )}
                          </div>
                          
                          {/* Details Area */}
                          <div className="flex-1 text-center md:text-left">
                             <p className="font-mono text-lg md:text-xl tracking-wider text-java-dark font-bold mb-1">{acc.accountNumber}</p>
                             <p className="text-xs md:text-sm text-java-brown font-sans">a.n {acc.accountHolder}</p>
                          </div>

                          {/* Action Area */}
                          <button 
                            onClick={() => copyToClipboard(acc.accountNumber, idx)}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-java-gold hover:bg-java-gold-dark px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all shadow-md hover:scale-105 active:scale-95"
                          >
                             {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                             {copiedIndex === idx ? 'Tersalin' : 'Salin'}
                          </button>
                       </div>
                    ))
                  ) : (
                     donation && (
                        <div className="p-5 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 hover:bg-white transition-colors">
                           <div className="w-full md:w-32 flex-shrink-0 flex justify-center md:justify-start">
                               {getBankLogo(donation.bankName) ? (
                                 <img src={getBankLogo(donation.bankName)!} alt={donation.bankName} className="h-8 md:h-12 object-contain" />
                               ) : (
                                 <h4 className="font-bold text-2xl text-java-dark">{donation.bankName}</h4>
                               )}
                           </div>
                           <div className="flex-1 text-center md:text-left">
                              <p className="font-mono text-lg md:text-xl tracking-wider text-java-dark font-bold mb-1">{donation.accountNumber}</p>
                              <p className="text-xs md:text-sm text-java-brown font-sans">a.n {donation.accountHolder}</p>
                           </div>
                           <button 
                             onClick={() => copyToClipboard(donation.accountNumber, 0)}
                             className="flex items-center gap-2 text-xs font-bold text-white bg-java-gold hover:bg-java-gold-dark px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all shadow-md hover:scale-105"
                           >
                              {copiedIndex === 0 ? <Check size={16} /> : <Copy size={16} />}
                              {copiedIndex === 0 ? 'Tersalin' : 'Salin'}
                           </button>
                        </div>
                     )
                  )}
              </div>
              
              <div className="bg-java-cream p-3 md:p-4 text-center border-t border-java-gold/10">
                 <p className="text-xs text-gray-500 italic">Mohon konfirmasi setelah melakukan transfer</p>
              </div>
           </div>
        </div>
      </section>

      {/* --- WISHES --- */}
      <section id="section-wishes" className="py-16 md:py-24 px-6 bg-java-dark text-white relative bg-batik-pattern bg-blend-multiply bg-cover">
        <div className="absolute inset-0 bg-java-dark/90"></div>
        <div className="max-w-4xl mx-auto relative z-10">
           <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-display font-bold text-java-gold mb-2 md:mb-3">Ucapan & Doa</h2>
              <p className="text-gray-300 text-sm md:text-base font-sans">Berikan ucapan selamat dan doa restu untuk kami</p>
           </div>

           <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 mb-8 md:mb-10 max-h-[400px] md:max-h-[500px] overflow-y-auto custom-scrollbar shadow-2xl">
              {comments.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 italic">
                    Belum ada ucapan. Jadilah yang pertama memberikan doa restu.
                 </div>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="mb-5 md:mb-6 border-b border-white/10 pb-5 md:pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3 md:gap-4 mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-java-gold to-yellow-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg flex-shrink-0">
                            {c.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                              <h5 className="font-bold text-sm md:text-base text-java-cream font-display tracking-wide">{c.name}</h5>
                              <span className="text-[10px] md:text-xs text-gray-400 font-sans">{c.time}</span>
                            </div>
                            <p className="text-gray-200 text-xs md:text-sm font-sans leading-relaxed bg-black/20 p-2 md:p-3 rounded-lg rounded-tl-none">{c.msg}</p>
                        </div>
                      </div>
                  </div>
                ))
              )}
           </div>

           <div className="text-center">
              <button 
                onClick={handleCommentClick}
                className={`${isCustomGuest ? 'bg-java-gold hover:bg-white' : 'bg-gray-600 cursor-not-allowed opacity-70'} text-java-dark font-bold py-3 md:py-4 px-8 md:px-10 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2 mx-auto text-sm md:text-base`}
              >
                 <MessageCircle size={18} className="md:w-5 md:h-5" /> {isCustomGuest ? 'Kirim Ucapan' : 'Khusus Tamu Undangan'}
              </button>
           </div>
        </div>
      </section>

      {/* --- CLOSING GREETING --- */}
      <section className="py-16 md:py-20 px-6 bg-java-cream text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-paper-texture opacity-30"></div>
        <div className="max-w-3xl mx-auto font-display text-java-brown space-y-6 md:space-y-8 relative z-10">
            <p className="leading-relaxed text-base md:text-lg italic text-gray-700 font-display">
                Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu untuk putra kami. Semoga acara ini membawa keberkahan bagi kita semua.
            </p>
            <h3 className="text-xl md:text-3xl font-bold text-java-dark">Wassalamu’alaikum Warahmatullahi Wabarakatuh</h3>
            <div className="w-16 md:w-24 h-1 bg-java-gold mx-auto rounded-full opacity-60"></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-10 md:py-12 bg-java-dark text-center text-gray-400 text-xs font-sans border-t border-white/10">
         <div className="mb-4 opacity-50 flex justify-center">
            <img src={JAVA_GUNUNGAN_URL} alt="Gunungan" className="h-10 md:h-14 grayscale opacity-60" />
         </div>
         <p className="mb-2 tracking-widest uppercase">Created with KramaInvi</p>
         <p>&copy; 2024 Undangan Digital Jawa</p>
      </footer>

      {/* --- MODALS --- */}
      
      {/* Gallery Modal (Optional if click needed, currently disabled in slideshow) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
           <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-50">
              <X size={32} />
           </button>
           <img src={selectedImage} alt="Full View" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-zoom-in" />
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 relative animate-fade-in-up shadow-2xl">
              <button onClick={() => setShowCommentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                 <X size={24} />
              </button>
              <h3 className="text-xl md:text-2xl font-bold font-display text-java-dark mb-4 md:mb-6 border-b pb-4">Kirim Ucapan</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4 md:space-y-5">
                 <div>
                    <label className="block text-xs font-bold text-java-brown mb-2 uppercase tracking-wider">Nama</label>
                    <input 
                      type="text" 
                      value={newCommentName}
                      readOnly={true}
                      className="w-full bg-gray-200 text-gray-600 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none transition-all font-sans cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 italic">*Nama sesuai undangan</p>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-java-brown mb-2 uppercase tracking-wider">Ucapan</label>
                    <textarea 
                      value={newCommentMsg}
                      onChange={(e) => setNewCommentMsg(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-java-gold focus:border-transparent outline-none h-24 md:h-32 resize-none transition-all font-sans"
                      placeholder="Tuliskan doa dan harapan..."
                      required
                    />
                 </div>
                 <button type="submit" disabled={isSubmittingComment} className="w-full bg-java-dark text-white font-bold py-3 md:py-4 rounded-xl hover:bg-java-gold hover:text-java-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                    <Send size={18} /> {isSubmittingComment ? 'MENGIRIM...' : 'KIRIM'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

// Countdown Item Helper Component - Modern Glassmorphism Style
const CountdownItem = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-14 h-14 md:w-24 md:h-24 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/20 flex items-center justify-center shadow-lg mb-1 md:mb-2 relative overflow-hidden group hover:border-java-gold/50 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-java-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span className="text-lg md:text-4xl font-display font-bold text-java-gold drop-shadow-sm group-hover:scale-110 transition-transform">{value}</span>
    </div>
    <span className="text-[10px] md:text-xs text-white/80 uppercase tracking-widest font-sans font-semibold">{label}</span>
  </div>
);

export default InvitationPreview;