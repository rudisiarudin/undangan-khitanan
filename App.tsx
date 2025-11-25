import React, { useState } from 'react';
import InvitationPreview from './components/InvitationPreview';
import { CoupleData, GeneratedContent } from './types';

function App() {
  // Data for "Narendra Erabbani Musyafa" Khitanan
  const [formData] = useState<CoupleData>({
    eventType: 'KHITANAN',
    groomName: 'Narendra Erabbani Musyafa',
    groomNickname: 'Narendra',
    // Using standard Bapak & Ibu format derived from "Dewi Pujiana Sari... & Heri Kusmanto"
    groomParents: 'Bapak Heri Kusmanto & Ibu Dewi Pujiana Sari Aprilia Ningsih, AmKG',
    brideName: '', 
    brideNickname: '',
    brideParents: '',
    
    // Event 1: Pengajian
    weddingDate: '2025-12-20',
    weddingTime: '16.00 WIB',
    eventName: 'Pengajian & Doa',
    
    // Event 2: Tasyakuran
    secondEventName: 'Tasyakuran Khitan',
    secondEventDate: '2025-12-21',
    secondEventTime: '10.00 WIB',
    
    locationName: 'Kediaman Mempelai',
    locationAddress: 'Jl. Pondok Asri Utara I No. 83, RT 04 RW 10 Pondok Gedangasri, Gedanganak, Ungaran',
    
    coverPhoto: 'https://images.unsplash.com/photo-1604866830893-c13cafa515d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', 
    // Specific photo for Narendra
    couplePhoto: 'https://narendra.itpalugada.com/wp-content/uploads/2025/11/generated-image-1763900438094.png',
    // Specific gallery images for Narendra
    gallery: [
      "https://narendra.itpalugada.com/wp-content/uploads/2025/11/generated-image-1763901472050.png",
      "https://narendra.itpalugada.com/wp-content/uploads/2025/11/generated-image-1763902007340-1.png",
      "https://narendra.itpalugada.com/wp-content/uploads/2025/11/generated-image-1763902182112.png"
    ],
    donation: { // Fallback
      bankName: 'BNI',
      accountNumber: '0527484313',
      accountHolder: 'Dewi Pujianasari'
    },
    multiDonations: [
      {
        bankName: 'BNI',
        accountNumber: '0527484313',
        accountHolder: 'Dewi Pujianasari'
      },
      {
        bankName: 'BCA',
        accountNumber: '2730561302',
        accountHolder: 'Dewi Pujianasari'
      }
    ]
  });

  const [aiContent] = useState<GeneratedContent>({
    quote: "Ya Allah, muliakanlah anak kami ini, panjangkanlah umurnya, terangilah hatinya, teguhkanlah imannya, perbaikilah amal perbuatannya, lapangkanlah rezekinya, dekatkanlah pada kebaikan dan jauhkanlah dari keburukan. Ya Allah, kabulkanlah permohonan kami Ridhoilah keinginan kami dan terimalah amal kebaikan kami. Semoga engkau melimpahkan sholawat dan salam atas junjungan Nabi SAW, Keluarga dan para sahabatnya.",
    wetonAnalysis: "Sabtu Kliwon & Minggu Legi: Waktu yang sangat baik untuk hajat besar, melambangkan keteguhan hati dan keberkahan yang melimpah."
  });

  return (
    <InvitationPreview 
        data={formData} 
        aiContent={aiContent}
        isLoadingAI={false}
    />
  );
}

export default App;