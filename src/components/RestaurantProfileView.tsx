import React from 'react';
import { Star, MapPin, Phone, Mail, Globe, Clock, Wifi, Car, UtensilsCrossed, Music, Coffee, Wind, ShieldCheck, Heart } from 'lucide-react';
import { SystemSettings } from '../types';

interface RestaurantProfileViewProps {
  settings: SystemSettings;
  lang: 'en' | 'hi';
}

export const RestaurantProfileView: React.FC<RestaurantProfileViewProps> = ({ settings, lang }) => {
  const facilities = [
    { icon: Wifi, title: lang === 'hi' ? 'फ्री हाई-स्पीड वाईफाई' : 'Free High-Speed WiFi', desc: lang === 'hi' ? 'सभी मेहमानों के लिए उपलब्ध' : 'Available for all our guests' },
    { icon: Car, title: lang === 'hi' ? 'वैलेट पार्किंग' : 'Valet Parking', desc: lang === 'hi' ? 'सुरक्षित और मुफ्त पार्किंग सेवा' : 'Secure and complimentary parking service' },
    { icon: Music, title: lang === 'hi' ? 'लाइव म्यूजिक' : 'Live Music', desc: lang === 'hi' ? 'वीकेंड पर विशेष संगीत कार्यक्रम' : 'Special musical performances on weekends' },
    { icon: Coffee, title: lang === 'hi' ? 'प्रीमियम लाउंज' : 'Premium Lounge', desc: lang === 'hi' ? 'आरामदायक और शांत वातावरण' : 'Relaxing and peaceful environment' },
    { icon: Wind, title: lang === 'hi' ? 'सेंट्रल एसी' : 'Central AC', desc: lang === 'hi' ? 'मौसम के अनुकूल तापमान' : 'Climate-controlled comfortable seating' },
    { icon: ShieldCheck, title: lang === 'hi' ? '24/7 सुरक्षा' : '24/7 Security', desc: lang === 'hi' ? 'सीसीटीवी और सुरक्षा गार्ड' : 'CCTV surveillance and secure premises' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        
        <div className="relative z-10 p-10 md:p-16 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-6">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-wide mb-4">
            {settings.restaurant_name}
          </h1>
          <p className="text-amber-200 text-lg md:text-xl font-light tracking-wider max-w-2xl">
            {lang === 'hi' 
              ? 'स्वाद और परंपरा का अनूठा संगम। एक प्रीमियम डाइनिंग अनुभव।' 
              : 'Where taste meets tradition. A premium fine-dining experience.'}
          </p>
          
          <div className="flex items-center gap-2 mt-8 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
            <Star className="w-5 h-5 fill-amber-400" />
            <Star className="w-5 h-5 fill-amber-400" />
            <Star className="w-5 h-5 fill-amber-400" />
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Info Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#b14c33]" />
            {lang === 'hi' ? 'संपर्क और स्थान' : 'Contact & Location'}
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {lang === 'hi' ? 'पता' : 'Address'}
                </p>
                <p className="text-sm font-semibold text-slate-700">{settings.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {lang === 'hi' ? 'फ़ोन' : 'Phone'}
                </p>
                <p className="text-sm font-semibold text-slate-700">{settings.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {lang === 'hi' ? 'ईमेल' : 'Email'}
                </p>
                <p className="text-sm font-semibold text-slate-700">info@ramtara.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {lang === 'hi' ? 'वेबसाइट' : 'Website'}
                </p>
                <p className="text-sm font-semibold text-[#b14c33]">www.ramtara.com</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {lang === 'hi' ? 'खुलने का समय' : 'Opening Hours'}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">10:00 AM - 11:00 PM</p>
                  <p className="text-xs font-medium text-emerald-600 mt-1">
                    {lang === 'hi' ? 'सातों दिन खुला' : 'Open 7 Days a Week'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Facilities Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {lang === 'hi' ? 'प्रीमियम सुविधाएं' : 'Premium Facilities'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide">
              VIP Experience
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div key={idx} className="group p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-50 transition-transform">
                      <Icon className="w-5 h-5 text-slate-700 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-amber-700 transition-colors">
                        {fac.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {fac.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#b14c33] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                {lang === 'hi' ? 'हमारा वादा' : 'Our Promise'}
              </h4>
              <p className="text-sm text-slate-200/90 max-w-md">
                {lang === 'hi' 
                  ? 'हम अपने ग्राहकों को सर्वोच्च गुणवत्ता और शानदार आतिथ्य प्रदान करने के लिए प्रतिबद्ध हैं।' 
                  : 'We are committed to providing our customers with the highest quality food and exceptional hospitality.'}
              </p>
            </div>
            <button className="px-6 py-2.5 bg-white text-slate-900 hover:bg-amber-50 font-bold rounded-xl text-sm shadow-lg whitespace-nowrap transition-colors">
              {lang === 'hi' ? 'मेनू देखें' : 'View Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
