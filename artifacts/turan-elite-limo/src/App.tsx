import { type FormEvent, type ReactNode, useEffect, useState, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Check, Clock3, Globe2, Menu, ShieldCheck, Sparkles, Star, UserRound, X, MapPin, Plane, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/turan-elite-limo-logo.png`}
      alt="TuranEliteLimo — Luxury Chauffeur Services"
      className={`h-auto w-[154px] object-contain sm:w-[182px] ${light ? 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]' : ''}`}
      data-testid="brand-logo"
    />
  );
}

function Nav({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [['Services', 'services'], ['Our standard', 'standard'], ['How it works', 'process']];
  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="container-edge flex h-[82px] items-center justify-between border-b border-white/15">
        <a href="#top" data-testid="link-brand-home"><Logo light /></a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map(([label, id]) => <button key={id} onClick={() => go(id)} className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#e7e2d8]/70 hover:text-[#d19a5c]" data-testid={`button-nav-${id}`}>{label}</button>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href="tel:+12125550184" className="font-mono-ui text-[10px] tracking-[.12em] text-[#e7e2d8]/70 hover:text-[#f6f1e8]" data-testid="link-call">+1 212 555 0184</a>
          <button onClick={onBook} className="group flex items-center gap-3 rounded-full border border-[#d19a5c] px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[.13em] text-[#f6f1e8] hover:bg-[#d19a5c] hover:text-[#193f3e]" data-testid="button-nav-quote">
            Request a car <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <button onClick={() => setOpen((value) => !value)} className="rounded-full border border-white/25 p-2 text-[#f6f1e8] md:hidden" aria-label="Toggle menu" data-testid="button-mobile-menu">
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {open && <div className="container-edge border-b border-white/15 bg-[#193f3e] py-5 md:hidden">
        {links.map(([label, id]) => <button key={id} onClick={() => go(id)} className="block w-full border-b border-white/10 py-3 text-left font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#f6f1e8]/75" data-testid={`button-mobile-nav-${id}`}>{label}</button>)}
        <button onClick={onBook} className="mt-4 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#d19a5c]" data-testid="button-mobile-quote">Request a car <ArrowRight size={13} /></button>
      </div>}
    </header>
  );
}

function BookingCard({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Desktop active mode state
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff' | 'date' | 'time' | null>(null);
  const [flightNumber, setFlightNumber] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeField) return;
    
    const handleClickOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    };
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      (document.activeElement as HTMLElement | null)?.blur();
      setActiveField(null);
    };
    
    document.addEventListener('pointerdown', handleClickOutside, true);
    window.addEventListener('keydown', handleEsc, true);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      window.removeEventListener('keydown', handleEsc, true);
    };
  }, [activeField]);

  useEffect(() => {
    onActiveChange?.(!!activeField);
  }, [activeField, onActiveChange]);

  const MOCK_AIRPORT = 'San Francisco International Airport (SFO)';
  const MOCK_HOTEL = 'Four Seasons Hotel San Francisco';

  const MOCK_SUGGESTIONS = [
    MOCK_AIRPORT,
    MOCK_HOTEL,
    'Palace Hotel San Francisco',
    'The St. Regis San Francisco',
    'Union Square, San Francisco'
  ];

  const helperContent = {
    pickup: {
      title: 'Set your pickup.',
      text: 'Choose an airport, hotel, residence, or meeting point. Your chauffeur will be ready where you need them.',
      icon: MapPin,
    },
    dropoff: {
      title: 'Choose your destination.',
      text: 'Tell us where you’re headed and we’ll prepare the ride around your journey.',
      icon: MapPin,
    },
    date: {
      title: 'Set the schedule.',
      text: 'Choose the day that works for you. We’ll take care of the timing from there.',
      icon: CalendarDays,
    },
    time: {
      title: 'Choose your pickup time.',
      text: 'Select when you’d like your chauffeur to arrive.',
      icon: Clock3,
    },
    sfo: {
      title: 'Flying into SFO?',
      text: 'Add your flight number so your chauffeur can be prepared for your arrival.',
      icon: Plane,
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (from && to && date && time) {
      setConfirmed(true);
      setActiveField(null);
    }
  };

  const reset = () => { 
    setConfirmed(false); 
    setStep(0); 
    setFrom(''); 
    setTo(''); 
    setDate(''); 
    setTime(''); 
    setActiveField(null);
    setFlightNumber('');
  };

  if (confirmed) {
    return (
      <div className="relative z-10 w-full rounded-[2px] bg-[#f6f1e8] p-8 lg:py-16 text-[#193f3e] shadow-[0_22px_70px_rgba(8,28,28,.28)] flex flex-col items-center justify-center text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#193f3e]/20 bg-white shadow-[0_12px_40px_rgba(8,28,28,.06)]">
          <Check size={28} className="text-[#bc754e]" />
        </div>
        <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e] mb-3">Request held</span>
        <h2 className="font-display text-4xl lg:text-5xl mb-4 leading-none">Vehicle selection<br />unlocked.</h2>
        <p className="text-[14px] leading-relaxed text-[#193f3e]/70 mb-8 max-w-[340px]">
          Your route and schedule are confirmed. In a production environment, you would proceed to select a specific TuranEliteLimo vehicle here.
        </p>
        <button onClick={reset} className="font-mono-ui text-[10px] uppercase tracking-[.16em] border-b border-[#193f3e] pb-1 hover:text-[#bc754e] hover:border-[#bc754e] transition-colors">Start over</button>
      </div>
    );
  }

  return (
    <>
      <div className="lg:hidden relative z-10 rounded-[2px] bg-[#f6f1e8] p-6 text-[#193f3e] shadow-[0_22px_70px_rgba(8,28,28,.28)] sm:p-9 w-full" id="booking" data-testid="card-booking-mobile">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">The first move</span>
              <h2 className="mt-2 font-display text-[28px] leading-none sm:text-[32px]">Where shall we take you?</h2>
            </div>
          </div>

          <div className="grid gap-3">
            <div className={`overflow-hidden transition-all duration-300 ${step === 0 ? 'opacity-100 h-auto' : step > 0 ? 'opacity-75 h-[48px]' : 'opacity-30 pointer-events-none'}`}>
              {step === 0 ? (
                <div className="border border-[#193f3e]/25 bg-white/50 p-2 pb-0">
                  <label className="group relative flex h-[60px] flex-col justify-center px-4 bg-white border-b border-[#193f3e]/10">
                    <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50">From</span>
                    <input readOnly value={from} placeholder="Select pickup location" className="mt-1 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#193f3e]/38 placeholder:font-normal cursor-pointer" data-testid="input-pickup" />
                    <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-[1.5px] border-[#bc754e]" />
                  </label>
                  <div className="p-2">
                    <button type="button" onClick={() => { setFrom(MOCK_AIRPORT); setTimeout(() => setStep(1), 250); }} className="w-full flex items-center gap-3 p-3 hover:bg-[#e9dfcf] rounded text-left transition-colors">
                      <Plane size={14} className="text-[#193f3e]/50" />
                      <div>
                        <span className="block text-[12px] font-bold">San Francisco International (SFO)</span>
                        <span className="block text-[10px] text-[#193f3e]/50">Airport</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setStep(0)} className="flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left hover:border-[#193f3e]/30 transition-colors bg-white/50">
                  <span className="flex items-center gap-3 text-[12px] font-semibold truncate pr-4"><span className="h-2 w-2 rounded-full border-[1.5px] border-[#bc754e] shrink-0" /> <span className="truncate">{from}</span></span>
                  <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 underline decoration-transparent hover:decoration-current underline-offset-4 transition-all shrink-0">Edit</span>
                </button>
              )}
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${step === 1 ? 'opacity-100 h-auto' : step > 1 ? 'opacity-75 h-[48px]' : step === 0 ? 'opacity-40 h-[48px] grayscale pointer-events-none' : 'opacity-30 pointer-events-none'}`}>
              {step === 1 ? (
                <div className="border border-[#193f3e]/25 bg-white/50 p-2 pb-0">
                  <label className="group relative flex h-[60px] flex-col justify-center px-4 bg-white border-b border-[#193f3e]/10">
                    <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50">To</span>
                    <input readOnly value={to} placeholder="Select destination" className="mt-1 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#193f3e]/38 placeholder:font-normal cursor-pointer" data-testid="input-dropoff" />
                    <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#193f3e]" />
                  </label>
                  <div className="p-2">
                    <button type="button" onClick={() => { setTo(MOCK_HOTEL); setTimeout(() => setStep(2), 250); }} className="w-full flex items-center gap-3 p-3 hover:bg-[#e9dfcf] rounded text-left transition-colors">
                      <MapPin size={14} className="text-[#193f3e]/50" />
                      <div>
                        <span className="block text-[12px] font-bold">Four Seasons Hotel San Francisco</span>
                        <span className="block text-[10px] text-[#193f3e]/50">757 Market Street, San Francisco, CA</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => step > 1 ? setStep(1) : undefined} className={`flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left bg-white/50 ${step > 1 ? 'hover:border-[#193f3e]/30 cursor-pointer transition-colors' : 'cursor-default'}`}>
                  <span className="flex items-center gap-3 text-[12px] font-semibold truncate pr-4"><span className="h-2 w-2 rounded-full bg-[#193f3e] shrink-0" /> <span className="truncate">{step > 1 ? to : 'Destination'}</span></span>
                  {step > 1 && <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 underline decoration-transparent hover:decoration-current underline-offset-4 transition-all shrink-0">Edit</span>}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`overflow-hidden transition-all duration-300 ${step === 2 ? 'opacity-100 h-auto' : step > 2 ? 'opacity-75 h-[48px]' : step < 2 ? 'opacity-40 h-[48px] grayscale pointer-events-none' : 'opacity-30 pointer-events-none'}`}>
                {step === 2 ? (
                  <label className="group relative flex min-h-[72px] flex-col justify-center border border-[#193f3e]/25 px-5 bg-white/50 focus-within:border-[#193f3e] focus-within:bg-white transition-colors">
                    <span className="flex items-center gap-1.5 font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50"><CalendarDays size={10} /> Date</span>
                    <input required type="date" value={date} onChange={(e) => { setDate(e.target.value); setTimeout(() => setStep(3), 250); }} className="mt-1.5 w-full bg-transparent text-[13px] font-semibold outline-none" data-testid="input-date" />
                  </label>
                ) : (
                  <button type="button" onClick={() => step > 2 ? setStep(2) : undefined} className={`flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left bg-white/50 ${step > 2 ? 'hover:border-[#193f3e]/30 cursor-pointer transition-colors' : 'cursor-default'}`}>
                    <span className="flex items-center gap-2 text-[12px] font-semibold"><CalendarDays size={12} className="text-[#193f3e]/50" /> {step > 2 ? date : 'Date'}</span>
                  </button>
                )}
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${step === 3 ? 'opacity-100 h-auto' : step > 3 ? 'opacity-75 h-[48px]' : step < 3 ? 'opacity-40 h-[48px] grayscale pointer-events-none' : 'opacity-30 pointer-events-none'}`}>
                {step === 3 ? (
                  <label className="group relative flex min-h-[72px] flex-col justify-center border border-[#193f3e]/25 px-5 bg-white/50 focus-within:border-[#193f3e] focus-within:bg-white transition-colors">
                    <span className="flex items-center gap-1.5 font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50"><Clock3 size={10} /> Time</span>
                    <input required type="time" value={time} onChange={(e) => { setTime(e.target.value); }} className="mt-1.5 w-full bg-transparent text-[13px] font-semibold outline-none" data-testid="input-time" />
                  </label>
                ) : (
                  <button type="button" onClick={() => step > 3 ? setStep(3) : undefined} className={`flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left bg-white/50 ${step > 3 ? 'hover:border-[#193f3e]/30 cursor-pointer transition-colors' : 'cursor-default'}`}>
                    <span className="flex items-center gap-2 text-[12px] font-semibold"><Clock3 size={12} className="text-[#193f3e]/50" /> {step > 3 ? time : 'Time'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className={`font-mono-ui text-[9px] leading-relaxed text-[#193f3e]/55 transition-opacity ${step < 3 ? 'opacity-0' : 'opacity-100'}`}>We match the vehicle<br />to your itinerary.</span>
            <button type="submit" disabled={step < 3 || !time} className="group flex w-full items-center justify-center gap-4 bg-[#193f3e] px-8 py-4 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#f6f1e8] hover:bg-[#bc754e] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto transition-colors" data-testid="button-see-vehicles">
              See Vehicles <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>

      <div 
        ref={containerRef}
        className={`hidden lg:block relative z-10 w-full bg-[#f6f1e8] shadow-[0_22px_70px_rgba(8,28,28,.28)] rounded-[2px] transition-all duration-300 overflow-hidden ${activeField ? 'h-[380px]' : 'h-[90px]'}`} 
        id="booking-desktop" 
        data-testid="card-booking-desktop"
      >
        <form onSubmit={submit} className="flex flex-col w-full h-full">
          <div className="flex items-center w-full h-[90px] shrink-0 border-b border-[#193f3e]/10 relative z-20">
            <div className={`relative min-w-0 flex-1 h-full border-r border-[#193f3e]/15 group transition-colors ${activeField === 'pickup' ? 'bg-white' : 'hover:bg-white/50'}`}>
              <button type="button" onClick={() => setActiveField('pickup')} className="w-full min-w-0 h-full px-7 pr-10 flex flex-col justify-center text-left focus:outline-none">
                <span className={`font-mono-ui text-[8px] uppercase tracking-[.15em] mb-1.5 flex items-center gap-2 transition-colors ${activeField === 'pickup' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><Plane size={10} /> Pickup</span>
                <span title={from || 'Select location'} className={`block max-w-full text-[13px] font-semibold truncate ${from ? 'text-[#193f3e]' : 'text-[#193f3e]/40 font-normal'}`}>{from || 'Select location'}</span>
              </button>
              <span className={`absolute right-6 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-[1.5px] transition-colors ${activeField === 'pickup' ? 'border-[#bc754e] bg-[#bc754e]' : 'border-[#bc754e]'}`} />
            </div>

            <div className={`relative min-w-0 flex-1 h-full border-r border-[#193f3e]/15 group transition-colors ${activeField === 'dropoff' ? 'bg-white' : 'hover:bg-white/50'}`}>
              <button type="button" onClick={() => setActiveField('dropoff')} className="w-full min-w-0 h-full px-7 pr-10 flex flex-col justify-center text-left focus:outline-none">
                <span className={`font-mono-ui text-[8px] uppercase tracking-[.15em] mb-1.5 flex items-center gap-2 transition-colors ${activeField === 'dropoff' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><MapPin size={10} /> Drop-off</span>
                <span title={to || 'Select destination'} className={`block max-w-full text-[13px] font-semibold truncate ${to ? 'text-[#193f3e]' : 'text-[#193f3e]/40 font-normal'}`}>{to || 'Select destination'}</span>
              </button>
              <span className={`absolute right-6 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full transition-colors ${activeField === 'dropoff' ? 'bg-[#bc754e]' : 'bg-[#193f3e]'}`} />
            </div>

            <div className={`relative w-[160px] shrink-0 h-full border-r border-[#193f3e]/15 group transition-colors ${activeField === 'date' ? 'bg-white' : 'hover:bg-white/50'}`}>
              <label className="flex w-full h-full flex-col justify-center px-6 cursor-pointer" onClick={() => setActiveField('date')}>
                <span className={`font-mono-ui text-[8px] uppercase tracking-[.15em] mb-1.5 flex items-center gap-2 transition-colors ${activeField === 'date' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><CalendarDays size={10} /> Date</span>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} onClick={() => setActiveField('date')} onFocus={() => setActiveField('date')} className="w-full bg-transparent text-[13px] font-semibold text-[#193f3e] outline-none cursor-pointer [color-scheme:light]" data-testid="input-date-desktop" />
              </label>
            </div>

            <div className={`relative w-[140px] shrink-0 h-full group transition-colors ${activeField === 'time' ? 'bg-white' : 'hover:bg-white/50'}`}>
              <label className="flex w-full h-full flex-col justify-center px-6 cursor-pointer" onClick={() => setActiveField('time')}>
                <span className={`font-mono-ui text-[8px] uppercase tracking-[.15em] mb-1.5 flex items-center gap-2 transition-colors ${activeField === 'time' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><Clock3 size={10} /> Time</span>
                <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} onClick={() => setActiveField('time')} onFocus={() => setActiveField('time')} className="w-full bg-transparent text-[13px] font-semibold text-[#193f3e] outline-none cursor-pointer [color-scheme:light]" data-testid="input-time-desktop" />
              </label>
            </div>

            <button type="submit" disabled={!from || !to || !date || !time} className="h-full px-10 bg-[#193f3e] text-[#f6f1e8] hover:bg-[#bc754e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-3 shrink-0 rounded-r-[2px]" data-testid="button-see-vehicles-desktop">
              <span className="font-mono-ui text-[10px] uppercase tracking-[.16em]">See Vehicles</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div 
            className={`flex-1 flex w-full bg-white relative transition-opacity duration-300 ${activeField ? 'opacity-100 delay-100' : 'opacity-0'}`} 
            data-testid="active-booking-surface"
          >
            {activeField && (
              <button 
                type="button" 
                onClick={() => setActiveField(null)} 
                className="absolute top-4 right-4 text-[#193f3e]/40 hover:text-[#193f3e] transition-colors p-2 z-10" 
                aria-label="Close"
                data-testid="button-close-active"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            )}

            <div className="w-1/2 p-10 flex flex-col justify-center border-r border-[#193f3e]/5 relative overflow-hidden">
              {(() => {
                let context = helperContent.pickup;
                if (activeField === 'dropoff') context = helperContent.dropoff;
                else if (activeField === 'date') context = helperContent.date;
                else if (activeField === 'time') context = helperContent.time;
                
                if (activeField === 'pickup' && from === MOCK_AIRPORT) {
                  context = helperContent.sfo;
                }

                const Icon = context.icon;
                
                return (
                  <div key={activeField + (from === MOCK_AIRPORT ? 'sfo' : '')} className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="w-10 h-10 rounded-full border border-[#193f3e]/10 flex items-center justify-center mb-6 bg-[#f6f1e8]/50">
                      <Icon size={16} className="text-[#bc754e]" />
                    </div>
                    <h3 className="font-display text-3xl text-[#193f3e] mb-3">{context.title}</h3>
                    <p className="text-[14px] text-[#193f3e]/60 leading-relaxed max-w-[320px]">{context.text}</p>
                  </div>
                );
              })()}
            </div>

            <div className="w-1/2 p-10 flex flex-col justify-center relative overflow-hidden">
              {(activeField === 'pickup' || activeField === 'dropoff') && (
                <div key={activeField + (from === MOCK_AIRPORT ? 'sfo' : '')} className="animate-in fade-in slide-in-from-right-4 duration-300 w-full max-w-[360px]">
                  {activeField === 'pickup' && from === MOCK_AIRPORT ? (
                    <div>
                      <label className="block font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#193f3e]/60 mb-3">Flight Number</label>
                      <input 
                        type="text" 
                        value={flightNumber} 
                        onChange={(e) => setFlightNumber(e.target.value)} 
                        placeholder="e.g. UA 1234" 
                        className="w-full bg-[#f6f1e8]/50 border border-[#193f3e]/15 rounded-[2px] px-4 py-3 text-[14px] outline-none focus:border-[#bc754e] focus:bg-white transition-colors"
                        data-testid="input-flight-number"
                      />
                      <button type="button" onClick={() => setActiveField('dropoff')} className="mt-4 w-full bg-[#193f3e] text-[#f6f1e8] py-3 text-[11px] font-mono-ui uppercase tracking-[.15em] hover:bg-[#bc754e] transition-colors rounded-[2px]">Continue to destination</button>
                    </div>
                  ) : (
                    <div>
                      <span className="block font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#193f3e]/60 mb-4">Suggested Locations</span>
                      <ul className="flex flex-col gap-1">
                        {MOCK_SUGGESTIONS.map(suggestion => (
                          <li key={suggestion}>
                            <button 
                              type="button" 
                              onClick={() => {
                                if (activeField === 'pickup') {
                                  setFrom(suggestion);
                                  if (suggestion !== MOCK_AIRPORT) setActiveField('dropoff');
                                } else {
                                  setTo(suggestion);
                                  setActiveField('date');
                                }
                              }}
                              className="w-full text-left px-4 py-2.5 rounded-[2px] hover:bg-[#f6f1e8] text-[13px] text-[#193f3e] transition-colors flex items-center gap-3 group"
                              data-testid="suggestion-option"
                            >
                              <MapPin size={12} className="text-[#193f3e]/40 group-hover:text-[#bc754e] transition-colors shrink-0" />
                              <span className="truncate">{suggestion}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {activeField === 'date' && (
                <div key="date" className="animate-in fade-in slide-in-from-right-4 duration-300 flex items-center h-full max-w-[360px]">
                   <div className="w-full p-8 bg-[#f6f1e8]/50 border border-[#193f3e]/10 rounded-[2px] text-center">
                     <CalendarDays size={24} className="mx-auto text-[#193f3e]/30 mb-4" />
                     <p className="text-[13px] text-[#193f3e]/60 mb-6">Select your date from the top menu.</p>
                     {date ? (
                       <button type="button" onClick={() => setActiveField('time')} className="bg-[#193f3e] text-[#f6f1e8] px-6 py-2.5 text-[10px] font-mono-ui uppercase tracking-[.15em] hover:bg-[#bc754e] transition-colors rounded-[2px]">Next: Time</button>
                     ) : (
                       <span className="inline-block px-6 py-2.5 text-[10px] font-mono-ui uppercase tracking-[.15em] text-[#193f3e]/30 border border-[#193f3e]/10 rounded-[2px]">Waiting for selection...</span>
                     )}
                   </div>
                </div>
              )}

              {activeField === 'time' && (
                <div key="time" className="animate-in fade-in slide-in-from-right-4 duration-300 flex items-center h-full max-w-[360px]">
                   <div className="w-full p-8 bg-[#f6f1e8]/50 border border-[#193f3e]/10 rounded-[2px] text-center">
                     <Clock3 size={24} className="mx-auto text-[#193f3e]/30 mb-4" />
                     <p className="text-[13px] text-[#193f3e]/60 mb-6">Select your time from the top menu.</p>
                     {time ? (
                       <button type="button" onClick={() => setActiveField(null)} className="bg-[#193f3e] text-[#f6f1e8] px-6 py-2.5 text-[10px] font-mono-ui uppercase tracking-[.15em] hover:bg-[#bc754e] transition-colors rounded-[2px]">Done</button>
                     ) : (
                       <span className="inline-block px-6 py-2.5 text-[10px] font-mono-ui uppercase tracking-[.15em] text-[#193f3e]/30 border border-[#193f3e]/10 rounded-[2px]">Waiting for selection...</span>
                     )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function Hero() {
  const jump = () => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  const [isBookingActive, setIsBookingActive] = useState(false);

  return (
    <section id="top" className={`relative lg:min-h-screen lg:flex lg:flex-col overflow-hidden pt-[82px] text-[#f6f1e8] transition-colors duration-500 ease-out ${isBookingActive ? 'bg-[#102a29]' : 'bg-[#193f3e]'}`}>
      <div className={`hero-grid absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-20' : 'opacity-50'}`} />
      <div className={`absolute -right-32 top-20 h-[600px] w-[600px] rounded-full border border-[#d19a5c]/20 sm:h-[800px] sm:w-[800px] pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-30' : 'opacity-100'}`} />
      <div className={`absolute -right-16 top-36 h-[390px] w-[390px] rounded-full border border-[#d19a5c]/15 sm:h-[590px] sm:w-[590px] pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-30' : 'opacity-100'}`} />
      <div className={`floating-line absolute right-[18%] top-[28%] h-[1px] w-[310px] origin-right bg-[#d19a5c]/60 pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-30' : 'opacity-100'}`} />
      <Nav onBook={jump} />
      
      <div className="container-edge relative flex-1 flex flex-col justify-end lg:justify-center pb-24 pt-20 lg:pt-32">
        <div className={`w-full max-w-[700px] transition-all duration-300 ease-out overflow-hidden ${isBookingActive ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-[500px] mb-12 lg:mb-20'}`}>
          <div className="reveal">
            <p className="flex items-center gap-3 font-mono-ui text-[9px] uppercase tracking-[.25em] text-[#d19a5c]"><span className="h-px w-7 bg-[#d19a5c]" />Bay Area & Northern California</p>
            <h1 className="mt-8 font-display text-[clamp(3.8rem,8.5vw,8.2rem)] leading-[.84] tracking-[-.05em]">Arrive in<br /><i className="text-[#d19a5c]">unspoken<br />luxury.</i></h1>
            <p className="mt-8 max-w-[390px] text-[14px] leading-[1.8] text-[#dbe0d6]/72">From SFO to Napa, your chauffeur handles the details so the ride feels effortless.</p>
          </div>
        </div>
        <div className="reveal delay-2 w-full max-w-[1000px] relative z-20">
          <BookingCard onActiveChange={setIsBookingActive} />
        </div>
      </div>
      
      <div className={`container-edge absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-between font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#dbe0d6]/45 w-full pointer-events-none transition-opacity duration-300 ease-out ${isBookingActive ? 'opacity-0' : 'opacity-100'}`}>
        <span className="hidden sm:block">SFO · OAK · SJC · Napa · Sonoma</span>
        <span className="flex items-center gap-2"><span className="pulse-ring h-2 w-2 rounded-full bg-[#d19a5c]" />Available around the clock</span>
      </div>
    </section>
  );
}

const services = [
  { id: 'airport', image: '/assets/airport-transfers.png', label: 'Airport transfers', headline: 'Arrive without the airport stress.', desc: 'Private pickups and drop-offs across SFO, OAK, and SJC with flight-aware scheduling and professional chauffeurs.' },
  { id: 'hourly', image: '/assets/hourly-chauffeur.png', label: 'Hourly chauffeur', headline: 'Your chauffeur, on your schedule.', desc: 'Reserve a dedicated chauffeur for meetings, appointments, dinners, errands, or a full day of travel.' },
  { id: 'corporate', image: '/assets/corporate-travel.png', label: 'Corporate travel', headline: 'Business travel, handled properly.', desc: 'Professional executive transportation for offices, hotels, meetings, and important client travel.' },
  { id: 'long-distance', image: '/assets/long-distance-travel.png', label: 'Long-distance travel', headline: 'Go farther in comfort.', desc: 'Private long-distance transportation throughout the Bay Area and Northern California in a quiet, premium vehicle.' }
];

function ServiceSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const next = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 0;
      scrollRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };
  
  const prev = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 0;
      scrollRef.current.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="bg-[#f6f1e8] py-28 sm:py-40 overflow-hidden relative">
      <div className="container-edge">
        <div className="reveal flex flex-col justify-between gap-7 md:flex-row md:items-end mb-16 lg:mb-24">
          <div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">Our services</span><h2 className="mt-5 max-w-[620px] font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[.95] tracking-[-.04em]">The ride is<br /><i>part of the occasion.</i></h2></div>
          
          <div className="hidden md:flex gap-3 pb-2">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-[#193f3e]/20 flex items-center justify-center text-[#193f3e] hover:bg-[#193f3e] hover:text-[#f6f1e8] transition-colors"><ChevronLeft size={20} strokeWidth={1.5} /></button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-[#193f3e]/20 flex items-center justify-center text-[#193f3e] hover:bg-[#193f3e] hover:text-[#f6f1e8] transition-colors"><ChevronRight size={20} strokeWidth={1.5} /></button>
          </div>
        </div>
        
        <div className="reveal delay-2 relative w-full">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 lg:gap-8 no-scrollbar pb-8 -mb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {services.map((service) => (
              <article key={service.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(50%-16px)] shrink-0 snap-start group">
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#e1e8e0] rounded-sm mb-6 relative lg:aspect-[1.1]">
                  <img src={service.image} alt={service.headline} className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="px-2">
                  <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e] block mb-3">{service.label}</span>
                  <h3 className="font-display text-3xl lg:text-4xl leading-tight mb-3">{service.headline}</h3>
                  <p className="text-[14px] leading-[1.7] text-[#193f3e]/70 max-w-[90%]">{service.desc}</p>
                </div>
              </article>
            ))}
          </div>
          
          <div className="flex justify-center gap-4 mt-12 md:hidden">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-[#193f3e]/20 flex items-center justify-center text-[#193f3e] hover:bg-[#193f3e] hover:text-[#f6f1e8] transition-colors"><ChevronLeft size={20} strokeWidth={1.5} /></button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-[#193f3e]/20 flex items-center justify-center text-[#193f3e] hover:bg-[#193f3e] hover:text-[#f6f1e8] transition-colors"><ChevronRight size={20} strokeWidth={1.5} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StackedStory() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const maxScroll = windowHeight * 2;
      const scrolled = -rect.top;
      
      if (scrolled < 0) {
        setScrollProgress(0);
      } else if (scrolled > maxScroll) {
        setScrollProgress(2);
      } else {
        setScrollProgress(scrolled / windowHeight);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReduced]);

  const stories = [
    { id: 'work', image: '/assets/stacked-1.png', headline: 'Make the ride work for you.', copy: 'Stay productive or simply unwind while you travel, with a quiet cabin, charging access, and complimentary bottled water.' },
    { id: 'power', image: '/assets/stacked-2.png', headline: 'Stay connected along the way.', copy: 'Keep your devices powered during the journey with convenient in-vehicle charging.' },
    { id: 'details', image: '/assets/stacked-3.png', headline: 'Every detail, handled.', copy: 'From opening the door to assisting with your belongings, your chauffeur is there to make the journey effortless.' }
  ];

  if (prefersReduced) {
    return (
      <section className="bg-black text-[#f6f1e8]">
        {stories.map((story, index) => (
          <div key={story.id} className="relative h-screen w-full flex items-end bg-black">
            <img src={story.image} alt={story.headline} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="relative z-10 w-full p-8 md:p-16 lg:p-24 pb-16 md:pb-24 max-w-4xl">
              <h3 className="font-display text-4xl md:text-5xl lg:text-[4rem] text-[#f6f1e8] mb-6 leading-tight">{story.headline}</h3>
              <p className="text-[15px] md:text-[17px] leading-[1.7] text-[#dbe0d6]/90 max-w-2xl">{story.copy}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#193f3e]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {stories.map((story, index) => {
          let translateY = 0;
          if (index === 0) {
            translateY = Math.max(0, Math.min(1, scrollProgress)) * -100;
          } else if (index === 1) {
            translateY = Math.max(0, Math.min(1, scrollProgress - 1)) * -100;
          }
          
          return (
            <div 
              key={story.id} 
              className="absolute inset-0 w-full h-full will-change-transform bg-black"
              style={{
                zIndex: 30 - index * 10,
                transform: `translateY(${translateY}%)`
              }}
            >
              <img 
                src={story.image} 
                alt={story.headline} 
                className="absolute inset-0 w-full h-full object-cover" 
                style={{ objectPosition: index === 1 ? 'center 70%' : 'center center' }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 pb-16 md:pb-24 max-w-4xl">
                <h3 className="font-display text-4xl md:text-5xl lg:text-[4rem] text-[#f6f1e8] mb-6 leading-tight tracking-tight drop-shadow-md">{story.headline}</h3>
                <p className="text-[15px] md:text-[17px] leading-[1.7] text-[#dbe0d6]/90 max-w-2xl drop-shadow-sm">{story.copy}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="bg-[#e9dfcf] py-28 sm:py-40">
      <div className="container-edge">
        <div className="reveal flex flex-col items-center text-center"><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">How it works</span><h2 className="mt-5 max-w-[650px] font-display text-[clamp(3.2rem,6vw,5.5rem)] leading-[.95] tracking-[-.03em]">Three steps.<br /><i>Nothing more.</i></h2></div>
        
        <div className="mt-24 grid gap-16 lg:grid-cols-3 lg:gap-12 relative max-w-[1000px] mx-auto">
          {[['01', 'Tell us where and when', 'A few details are enough. Choose your service, share the route, and tell us when to be ready.'], 
            ['02', 'Choose your ride', 'Select from our fleet of immaculate sedans and SUVs tailored to your journey.'], 
            ['03', 'We handle the rest', 'Your car is early, your route is considered, and the rest of the world can wait.']
           ].map(([num, title, copy], index) => (
            <div key={num} className={`reveal delay-${index + 1} flex flex-col items-center text-center`}>
              <span className="font-display text-6xl text-[#193f3e]/30 mb-6">{num}</span>
              <h3 className="font-display text-2xl mb-4">{title}</h3>
              <p className="text-[14px] leading-[1.7] text-[#193f3e]/70 max-w-[280px]">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Standard() {
  return (
    <section id="standard" className="bg-[#f6f1e8] py-28 sm:py-40 border-t border-[#193f3e]/10 overflow-hidden">
      <div className="container-edge grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:items-center">
        <div className="reveal relative min-h-[500px] w-full overflow-hidden bg-[#193f3e] p-10 sm:p-14 text-[#f6f1e8] flex flex-col justify-between shadow-xl">
          <div className="absolute -right-20 top-10 h-[400px] w-[400px] rounded-full border border-[#d19a5c]/20 pointer-events-none" />
          <div className="absolute -right-4 top-24 h-[250px] w-[250px] rounded-full border border-[#d19a5c]/20 pointer-events-none" />
          <span className="relative font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#d19a5c]">Step in. Breathe out.</span>
          <div className="relative z-10 mt-auto">
            <p className="font-display text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.05]">“The luxury is<br /><i>the lack of friction.”</i></p>
            <div className="mt-10 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d19a5c]/40 bg-[#d19a5c]/10"><ShieldCheck size={16} className="text-[#d19a5c]" /></span>
              <span className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#dbe0d6]/70">Our operating principle</span>
            </div>
          </div>
        </div>
        <div className="reveal delay-2 lg:py-10">
          <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">The Turan standard</span>
          <h2 className="mt-6 max-w-[500px] font-display text-[clamp(3.2rem,5vw,4.5rem)] leading-[1] tracking-[-.03em]">Nothing loud.<br /><i>Everything ready.</i></h2>
          <p className="mt-8 text-[15px] leading-[1.8] text-[#193f3e]/75 max-w-[440px]">From airport pickups to a night in the city, your chauffeur handles the details so the ride feels effortless. Every element has a job: the right temperature, a driver who has read the room, an arrival that never needs explaining.</p>
          
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-[#193f3e]/15 pt-10">
            {[['04:12', 'Average reply'], ['24/7', 'Human support'], ['12 min', 'Early to you'], ['∞', 'Small details']].map(([value, label]) => (
              <div key={label}>
                <strong className="block font-display text-4xl font-medium text-[#193f3e]">{value}</strong>
                <span className="mt-2 block font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const jump = () => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <footer className="bg-[#bc754e] text-[#193f3e] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border border-[#193f3e]/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="container-edge py-24 sm:py-32 relative z-10">
        <div className="reveal flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <span className="font-mono-ui text-[10px] uppercase tracking-[.2em]">Your ride starts here</span>
            <h2 className="mt-6 max-w-[700px] font-display text-[clamp(4rem,8vw,7rem)] leading-[.85] tracking-[-.04em]">Book in a few<br /><i>simple steps.</i></h2>
          </div>
          <button onClick={jump} className="group flex items-center gap-4 border-b-2 border-[#193f3e] pb-3 text-left font-mono-ui text-[12px] uppercase tracking-[.16em] hover:text-[#f6f1e8] hover:border-[#f6f1e8] transition-colors" data-testid="button-footer-book">
            We'll handle the rest <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
          </button>
        </div>
        <div className="mt-28 flex flex-col justify-between gap-10 border-t border-[#193f3e]/20 pt-10 sm:flex-row items-start sm:items-center">
          <Logo />
          <div className="flex flex-wrap gap-x-10 gap-y-4 font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#193f3e]/80">
            <a href="#services" className="hover:text-[#f6f1e8] transition-colors" data-testid="link-footer-services">Services</a>
            <a href="#process" className="hover:text-[#f6f1e8] transition-colors" data-testid="link-footer-process">How it works</a>
            <a href="#standard" className="hover:text-[#f6f1e8] transition-colors" data-testid="link-footer-standard">Our standard</a>
            <a href="mailto:hello@turan-elite.com" className="hover:text-[#f6f1e8] transition-colors" data-testid="link-footer-email">Concierge email</a>
          </div>
          <span className="font-mono-ui text-[9px] text-[#193f3e]/60">© 2024 Turan Elite Limo</span>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  useReveal();
  return (
    <main className="noise overflow-x-clip">
      <Hero />
      <div className="border-b border-[#193f3e]/15 bg-[#e9dfcf]">
        <div className="container-edge grid gap-5 py-6 font-mono-ui text-[9px] uppercase tracking-[.14em] text-[#193f3e]/55 sm:grid-cols-3 sm:gap-3">
          <span className="flex items-center gap-2"><Globe2 size={12} className="text-[#bc754e]" /> One standard, any city</span>
          <span className="flex items-center gap-2"><UserRound size={12} className="text-[#bc754e]" /> A real person, always</span>
          <span className="flex items-center gap-2"><Sparkles size={12} className="text-[#bc754e]" /> Thoughtful by default</span>
        </div>
      </div>
      <ServiceSlider />
      <StackedStory />
      <Process />
      <Standard />
      <section className="bg-[#193f3e] text-[#f6f1e8] py-28 sm:py-40">
        <div className="container-edge reveal flex flex-col items-center text-center">
          <div className="flex gap-1.5 text-[#d19a5c] mb-8">{[1, 2, 3, 4, 5].map((item) => <Star key={item} size={16} fill="currentColor" />)}</div>
          <blockquote className="max-w-[800px] font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.15] text-[#f6f1e8]">“It is the rare service that makes a 5am departure feel like a privilege.”</blockquote>
          <cite className="mt-8 block font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#dbe0d6]/75 not-italic">— A. Rahman, global strategy</cite>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
