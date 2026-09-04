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
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

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

  const calendarMonthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: calendarMonth.getDay() }, () => null),
    ...Array.from(
      { length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() },
      (_, index) => index + 1,
    ),
  ];
  const MOCK_TIMES = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

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
        className={`hidden lg:block relative z-20 w-full rounded-[2px] transition-all duration-300 ease-out overflow-hidden shadow-[0_22px_70px_rgba(8,28,28,.35)] ${activeField ? 'h-[460px]' : 'h-[100px]'}`} 
        id="booking-desktop" 
        data-testid="card-booking-desktop"
      >
        <form onSubmit={submit} className="flex flex-col w-full h-full">
          {/* Top Row */}
          <div className="absolute top-0 left-0 flex items-center w-full h-[100px] bg-[#f6f1e8] z-20">
            <div className={`relative min-w-0 flex-1 h-full border-r border-[#193f3e]/15 group transition-colors ${activeField === 'pickup' ? 'bg-[#e9dfcf]/40 shadow-[inset_0_-3px_0_0_#bc754e]' : 'hover:bg-white/50'}`}>
              <button type="button" onClick={() => setActiveField('pickup')} className="w-full min-w-0 h-full px-8 pr-12 flex flex-col justify-center text-left focus:outline-none">
                <span className={`font-mono-ui text-[9px] uppercase tracking-[.15em] mb-2 flex items-center gap-2 transition-colors ${activeField === 'pickup' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><Plane size={12} /> Pickup</span>
                <span title={from || 'Select location'} className={`block max-w-full text-[15px] truncate transition-all ${from || activeField === 'pickup' ? 'text-[#193f3e] font-bold' : 'text-[#193f3e]/50 font-medium'}`}>{from || 'Select location'}</span>
              </button>
              <span className={`absolute right-6 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border-[1.5px] transition-colors ${activeField === 'pickup' || from ? 'border-[#bc754e] bg-[#bc754e]' : 'border-[#bc754e]'}`} />
            </div>

            <div className={`relative min-w-0 flex-1 h-full border-r border-[#193f3e]/15 group transition-colors ${activeField === 'dropoff' ? 'bg-[#e9dfcf]/40 shadow-[inset_0_-3px_0_0_#bc754e]' : 'hover:bg-white/50'}`}>
              <button type="button" onClick={() => setActiveField('dropoff')} className="w-full min-w-0 h-full px-8 pr-12 flex flex-col justify-center text-left focus:outline-none">
                <span className={`font-mono-ui text-[9px] uppercase tracking-[.15em] mb-2 flex items-center gap-2 transition-colors ${activeField === 'dropoff' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><MapPin size={12} /> Drop-off</span>
                <span title={to || 'Select destination'} className={`block max-w-full text-[15px] truncate transition-all ${to || activeField === 'dropoff' ? 'text-[#193f3e] font-bold' : 'text-[#193f3e]/50 font-medium'}`}>{to || 'Select destination'}</span>
              </button>
              <span className={`absolute right-6 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full transition-colors ${activeField === 'dropoff' || to ? 'bg-[#bc754e]' : 'bg-[#193f3e]'}`} />
            </div>

            <div className={`relative w-[180px] shrink-0 h-full border-r border-[#193f3e]/15 group transition-colors ${activeField === 'date' ? 'bg-[#e9dfcf]/40 shadow-[inset_0_-3px_0_0_#bc754e]' : 'hover:bg-white/50'}`}>
              <button type="button" onClick={() => setActiveField('date')} className="w-full min-w-0 h-full px-8 flex flex-col justify-center text-left focus:outline-none">
                <span className={`font-mono-ui text-[9px] uppercase tracking-[.15em] mb-2 flex items-center gap-2 transition-colors ${activeField === 'date' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><CalendarDays size={12} /> Date</span>
                <span className={`block max-w-full text-[15px] truncate transition-all ${date || activeField === 'date' ? 'text-[#193f3e] font-bold' : 'text-[#193f3e]/50 font-medium'}`}>{date || 'Select date'}</span>
              </button>
            </div>

            <div className={`relative w-[160px] shrink-0 h-full group transition-colors ${activeField === 'time' ? 'bg-[#e9dfcf]/40 shadow-[inset_0_-3px_0_0_#bc754e]' : 'hover:bg-white/50'}`}>
              <button type="button" onClick={() => setActiveField('time')} className="w-full min-w-0 h-full px-8 flex flex-col justify-center text-left focus:outline-none">
                <span className={`font-mono-ui text-[9px] uppercase tracking-[.15em] mb-2 flex items-center gap-2 transition-colors ${activeField === 'time' ? 'text-[#bc754e]' : 'text-[#193f3e]/50'}`}><Clock3 size={12} /> Time</span>
                <span className={`block max-w-full text-[15px] truncate transition-all ${time || activeField === 'time' ? 'text-[#193f3e] font-bold' : 'text-[#193f3e]/50 font-medium'}`}>{time || 'Select time'}</span>
              </button>
            </div>

            <button type="submit" disabled={!from || !to || !date || !time} className="h-full px-12 bg-[#193f3e] text-[#f6f1e8] hover:bg-[#bc754e] hover:text-[#193f3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-4 shrink-0 rounded-r-[2px]" data-testid="button-see-vehicles-desktop">
              <span className="font-mono-ui text-[11px] uppercase tracking-[.16em] font-medium">See Vehicles</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Lower Stage */}
          <div 
            className={`absolute top-[100px] left-0 flex w-full h-[360px] bg-[#102a29] text-[#f6f1e8] transition-opacity duration-300 ease-out ${activeField ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}`} 
            data-testid="active-booking-surface"
          >
            {activeField && (
              <button 
                type="button" 
                onClick={() => setActiveField(null)} 
                className="absolute top-6 right-6 text-[#f6f1e8]/40 hover:text-[#f6f1e8] transition-colors p-2 z-10" 
                aria-label="Close"
                data-testid="button-close-active"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            )}

            <div className="w-[45%] p-12 flex flex-col justify-center border-r border-[#f6f1e8]/10 relative overflow-hidden">
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
                    <div className="w-12 h-12 rounded-full border border-[#d19a5c]/20 flex items-center justify-center mb-8 bg-[#d19a5c]/10">
                      <Icon size={18} className="text-[#d19a5c]" />
                    </div>
                    <h3 className="font-display text-4xl text-[#f6f1e8] mb-4">{context.title}</h3>
                    <p className="text-[15px] text-[#f6f1e8]/70 leading-relaxed max-w-[340px]">{context.text}</p>
                  </div>
                );
              })()}
            </div>

            <div className="w-[55%] p-12 flex flex-col justify-center relative overflow-hidden">
              {(activeField === 'pickup' || activeField === 'dropoff') && (
                <div key={activeField + (from === MOCK_AIRPORT ? 'sfo' : '')} className="animate-in fade-in slide-in-from-right-4 duration-300 w-full max-w-[420px]">
                  {activeField === 'pickup' && from === MOCK_AIRPORT ? (
                    <div>
                      <label className="block font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#f6f1e8]/60 mb-4">Flight Number</label>
                      <input 
                        type="text" 
                        value={flightNumber} 
                        onChange={(e) => setFlightNumber(e.target.value)} 
                        placeholder="e.g. UA 1234" 
                        className="w-full bg-[#f6f1e8]/5 border border-[#f6f1e8]/20 rounded-[2px] px-5 py-4 text-[15px] text-[#f6f1e8] outline-none focus:border-[#d19a5c] focus:bg-[#f6f1e8]/10 transition-colors placeholder:text-[#f6f1e8]/30"
                        data-testid="input-flight-number"
                      />
                      <button type="button" onClick={() => setActiveField('dropoff')} className="mt-6 w-full bg-[#d19a5c] text-[#102a29] py-4 text-[11px] font-mono-ui uppercase tracking-[.15em] font-bold hover:bg-[#bc754e] transition-colors rounded-[2px]">Continue to destination</button>
                    </div>
                  ) : (
                    <div>
                      <span className="block font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#f6f1e8]/60 mb-5">Suggested Locations</span>
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
                              className="w-full text-left px-5 py-3.5 rounded-[2px] hover:bg-[#f6f1e8]/10 text-[14px] text-[#f6f1e8]/80 hover:text-[#f6f1e8] transition-colors flex items-center gap-4 group"
                              data-testid="suggestion-option"
                            >
                              <MapPin size={14} className="text-[#f6f1e8]/30 group-hover:text-[#d19a5c] transition-colors shrink-0" />
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
                <div key="date" className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col justify-center h-full w-full max-w-[440px]">
                   <div className="flex justify-between items-center mb-6">
                     <span className="font-display text-2xl text-[#f6f1e8]" data-testid="calendar-month-label">{calendarMonthLabel}</span>
                     <div className="flex gap-2">
                        <button type="button" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" data-testid="calendar-previous-month" className="w-8 h-8 rounded-full border border-[#f6f1e8]/20 flex items-center justify-center hover:bg-[#f6f1e8]/10 text-[#f6f1e8]"><ChevronLeft size={14}/></button>
                        <button type="button" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" data-testid="calendar-next-month" className="w-8 h-8 rounded-full border border-[#f6f1e8]/20 flex items-center justify-center hover:bg-[#f6f1e8]/10 text-[#f6f1e8]"><ChevronRight size={14}/></button>
                     </div>
                   </div>
                   <div className="grid grid-cols-7 gap-2 mb-3 text-center font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#f6f1e8]/40">
                     {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
                   </div>
                   <div className="grid grid-cols-7 gap-y-2 gap-x-2">
                       {calendarCells.map((day, index) => {
                          if (day === null) return <span key={`empty-${index}`} aria-hidden="true" />;
                          const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                          const dStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          const isSel = date === dStr;
                          return (
                            <button type="button" key={dStr} onClick={() => { setDate(dStr); setActiveField('time'); }} className={`h-10 w-full rounded-[2px] text-[13px] transition-colors flex items-center justify-center ${isSel ? 'bg-[#d19a5c] text-[#102a29] font-bold' : 'text-[#f6f1e8]/80 hover:bg-[#f6f1e8]/10 hover:text-[#f6f1e8]'}`} data-testid={`calendar-choice-${day}`} aria-label={`Select ${dStr}`}>
                              {day}
                            </button>
                          );
                      })}
                   </div>
                </div>
              )}

              {activeField === 'time' && (
                <div key="time" className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col justify-center h-full w-full max-w-[440px]">
                  <span className="block font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#f6f1e8]/60 mb-6">Available Times</span>
                  <div className="grid grid-cols-3 gap-3">
                     {MOCK_TIMES.map(t => {
                        const isSel = time === t;
                        return (
                          <button type="button" key={t} onClick={() => { setTime(t); setActiveField(null); }} className={`p-4 rounded-[2px] text-[13px] border transition-colors ${isSel ? 'border-[#d19a5c] bg-[#d19a5c]/10 text-[#d19a5c] font-bold' : 'border-[#f6f1e8]/10 text-[#f6f1e8]/80 hover:border-[#f6f1e8]/30 hover:bg-[#f6f1e8]/5'}`} data-testid={`time-choice-${t.replace(/[: ]/g, '')}`}>
                            {t}
                          </button>
                        )
                     })}
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
    <section id="top" className={`relative lg:h-screen lg:min-h-0 lg:flex lg:flex-col overflow-hidden pt-[82px] text-[#f6f1e8] transition-colors duration-500 ease-out ${isBookingActive ? 'bg-[#102a29]' : 'bg-[#193f3e]'}`}>
      <div className={`hero-grid absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-20' : 'opacity-50'}`} />
      <div className={`absolute -right-32 top-20 h-[600px] w-[600px] rounded-full border border-[#d19a5c]/20 sm:h-[800px] sm:w-[800px] pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-30' : 'opacity-100'}`} />
      <div className={`absolute -right-16 top-36 h-[390px] w-[390px] rounded-full border border-[#d19a5c]/15 sm:h-[590px] sm:w-[590px] pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-30' : 'opacity-100'}`} />
      <div className={`floating-line absolute right-[18%] top-[28%] h-[1px] w-[310px] origin-right bg-[#d19a5c]/60 pointer-events-none transition-opacity duration-500 ease-out ${isBookingActive ? 'opacity-30' : 'opacity-100'}`} />
      <Nav onBook={jump} />
      
      <div className="container-edge relative flex-1 flex flex-col justify-end lg:justify-center pb-16 lg:pb-24 pt-20 lg:pt-32">
        <div className={`w-full max-w-[700px] transition-all duration-300 ease-out overflow-hidden lg:-translate-y-6 ${isBookingActive ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-[500px] mb-12 lg:mb-16'}`}>
          <div className="reveal">
            <p className="flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#d19a5c] font-medium"><span className="h-px w-7 bg-[#d19a5c]" />Northern California · Bay Area · SFO · OAK · SJC</p>
            <h1 className="mt-5 font-display text-[clamp(3.8rem,8.5vw,8.2rem)] leading-[.84] tracking-[-.05em]">Arrive in<br /><i className="text-[#d19a5c]">unspoken<br />luxury.</i></h1>
            <p className="mt-6 max-w-[390px] text-[15px] leading-[1.8] text-[#dbe0d6]/80 font-medium">From SFO to Napa, your chauffeur handles the details so the ride feels effortless.</p>
          </div>
        </div>
        <div className={`w-full flex justify-center z-20 transition-[top,transform] duration-300 ease-out ${isBookingActive ? 'lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2' : 'relative'}`}>
          <div className="w-full lg:w-[84vw] max-w-[1240px] lg:flex-none">
            <BookingCard onActiveChange={setIsBookingActive} />
          </div>
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

function AppSection() {
  return (
    <section className="bg-[#f6f1e8] py-28 sm:py-40 border-t border-[#193f3e]/10 overflow-hidden relative">
      <div className="container-edge grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24 lg:items-center">
        <div className="reveal">
          <span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#bc754e] font-medium">The TuranEliteLimo App</span>
          <h2 className="mt-5 max-w-[500px] font-display text-[clamp(3.2rem,5vw,4.5rem)] leading-[1.05] tracking-[-.03em]">TuranEliteLimo,<br /><i>wherever you go.</i></h2>
          <p className="mt-8 text-[15px] leading-[1.8] text-[#193f3e]/80 max-w-[400px] font-medium">Book and manage your rides from one place. Your chauffeur service stays within reach whenever you need it.</p>
          
          <div className="mt-12 hidden lg:flex flex-col sm:flex-row gap-4">
             <button type="button" onClick={(e) => e.preventDefault()} className="w-full sm:w-[200px] h-[54px] rounded-full border border-[#193f3e]/20 bg-white text-[#193f3e] flex items-center justify-center gap-3 hover:border-[#193f3e]/50 hover:bg-[#e9dfcf] transition-colors shadow-sm" data-testid="button-app-store">
               <span className="font-mono-ui text-[10px] uppercase tracking-[.12em] font-bold">Download on the App Store</span>
             </button>
             <button type="button" onClick={(e) => e.preventDefault()} className="w-full sm:w-[200px] h-[54px] rounded-full border border-[#193f3e]/20 bg-white text-[#193f3e] flex items-center justify-center gap-3 hover:border-[#193f3e]/50 hover:bg-[#e9dfcf] transition-colors shadow-sm" data-testid="button-google-play">
               <span className="font-mono-ui text-[10px] uppercase tracking-[.12em] font-bold">Get it on Google Play</span>
             </button>
          </div>
        </div>
        
        <div className="reveal delay-2 relative w-full h-[500px] sm:h-[600px] bg-[#e9dfcf]/60 rounded-[4px] overflow-hidden flex items-end justify-center shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] border border-[#193f3e]/5">
           {/* Decorative circles */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#193f3e]/5 pointer-events-none" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#193f3e]/5 pointer-events-none" />
           
           {/* Tablet/Desktop secondary UI floating behind phone */}
           <div className="absolute right-[-5%] top-[15%] w-[340px] h-[260px] bg-white rounded-xl shadow-[0_20px_50px_rgba(8,28,28,0.08)] border border-[#193f3e]/5 hidden lg:flex flex-col z-0 opacity-95 p-7">
              <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#193f3e]/40 block mb-6 font-medium">Manage Bookings</span>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4 border-b border-[#193f3e]/5 pb-5">
                  <div className="w-12 h-12 bg-[#193f3e] rounded-full flex items-center justify-center"><CalendarDays size={16} className="text-[#d19a5c]"/></div>
                  <div>
                    <span className="block text-[14px] font-bold text-[#193f3e] mb-1">Tomorrow, 8:00 AM</span>
                    <span className="block text-[12px] text-[#193f3e]/60 font-medium">SFO to Napa Valley</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#193f3e]/5 rounded-full flex items-center justify-center"><CalendarDays size={16} className="text-[#193f3e]/40"/></div>
                  <div>
                    <span className="block text-[14px] font-bold text-[#193f3e] mb-1">Oct 15, 2:30 PM</span>
                    <span className="block text-[12px] text-[#193f3e]/60 font-medium">Corporate HQ</span>
                  </div>
                </div>
              </div>
           </div>

           {/* Phone mockup */}
           <div className="relative w-[280px] h-[540px] bg-[#193f3e] rounded-t-[40px] shadow-[0_0_60px_rgba(8,28,28,0.15)] border-[8px] border-[#102a29] border-b-0 flex flex-col overflow-hidden z-10 translate-y-4">
             {/* Notch */}
             <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                <div className="w-36 h-6 bg-[#102a29] rounded-b-[18px]" />
             </div>
             
             {/* App Header */}
             <div className="bg-[#193f3e] pt-16 pb-7 px-7 text-[#f6f1e8] border-b border-white/10 relative z-10">
                <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c] block mb-2 font-medium">Next Ride</span>
                <h4 className="font-display text-3xl">Wed, Oct 12</h4>
                <div className="mt-6 flex items-start gap-4">
                  <div className="flex flex-col items-center mt-1.5">
                    <span className="w-2 h-2 rounded-full border border-[#d19a5c]" />
                    <span className="w-px h-7 bg-[#d19a5c]/40 my-1" />
                    <span className="w-2 h-2 rounded-full bg-[#d19a5c]" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-[13px] font-medium leading-none text-white/95 mt-0.5">SFO Airport</span>
                    <span className="text-[13px] font-medium leading-none text-white/95 mt-4">Four Seasons SF</span>
                  </div>
                </div>
             </div>
             
             {/* App Body */}
             <div className="flex-1 bg-[#f6f1e8] p-5 flex flex-col gap-4 relative">
                <div className="w-full bg-white rounded-xl shadow-sm border border-[#193f3e]/5 p-5 relative overflow-hidden">
                  <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#193f3e]/40 block mb-4 font-medium">Vehicle</span>
                  <div className="aspect-[2/1] w-full bg-[#e1e8e0]/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src="/assets/executive-sedan-cadillac-xts.png" alt="Executive sedan" className="w-[85%] h-auto mix-blend-multiply object-contain" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h5 className="font-display text-[16px] text-[#193f3e] mb-1 font-bold">Executive Sedan</h5>
                      <span className="text-[11px] text-[#193f3e]/60 font-medium">S-Class or similar</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-white rounded-xl shadow-sm border border-[#193f3e]/5 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#193f3e]/5 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} className="text-[#193f3e]" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-bold text-[#193f3e] mb-0.5">Reservation support</span>
                    <span className="block text-[11px] text-[#193f3e]/60 font-medium">24/7 live dispatch</span>
                  </div>
                </div>
             </div>
             
             {/* Bottom Nav */}
             <div className="h-[72px] bg-white border-t border-[#193f3e]/10 flex justify-around items-center px-6">
                <div className="flex flex-col items-center gap-1 text-[#193f3e]">
                  <Globe2 size={18} />
                </div>
                <div className="flex flex-col items-center gap-1 text-[#193f3e]/30">
                  <CalendarDays size={18} />
                </div>
                <div className="flex flex-col items-center gap-1 text-[#193f3e]/30">
                  <UserRound size={18} />
                </div>
             </div>
           </div>
           
        </div>
        <div className="flex flex-col sm:flex-row gap-4 lg:hidden">
          <button type="button" onClick={(e) => e.preventDefault()} className="w-full sm:w-[220px] h-[54px] rounded-full border border-[#193f3e]/20 bg-white text-[#193f3e] flex items-center justify-center shadow-sm" data-testid="button-app-store-mobile">
            <span className="font-mono-ui text-[10px] uppercase tracking-[.12em] font-bold">Download on the App Store</span>
          </button>
          <button type="button" onClick={(e) => e.preventDefault()} className="w-full sm:w-[220px] h-[54px] rounded-full border border-[#193f3e]/20 bg-white text-[#193f3e] flex items-center justify-center shadow-sm" data-testid="button-google-play-mobile">
            <span className="font-mono-ui text-[10px] uppercase tracking-[.12em] font-bold">Get it on Google Play</span>
          </button>
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
          {[['01', 'Tell us where and when', 'Choose your pickup, destination, date and time.'], 
            ['02', 'Choose your ride', 'Select from sedans, SUVs and specialty vehicles tailored to your trip.'], 
            ['03', 'We handle the rest', 'A professional chauffeur arrives on time and gets you there safely.']
           ].map(([num, title, copy], index) => (
            <div key={num} className={`reveal delay-${index + 1} flex flex-col items-center text-center`}>
              <span className="font-display text-6xl text-[#193f3e]/60 mb-6 font-medium">{num}</span>
              <h3 className="font-display text-2xl mb-4">{title}</h3>
              <p className="text-[15px] leading-[1.7] text-[#193f3e]/80 max-w-[280px] font-medium">{copy}</p>
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
          <span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#bc754e] font-medium">The Turan standard</span>
          <h2 className="mt-5 max-w-[500px] font-display text-[clamp(3.2rem,5vw,4.5rem)] leading-[1] tracking-[-.03em]">Nothing loud.<br /><i>Everything ready.</i></h2>
          <p className="mt-8 text-[15px] leading-[1.8] text-[#193f3e]/80 max-w-[440px] font-medium">TuranEliteLimo is a boutique chauffeur service built around professional chauffeurs, licensed and insured carriers, and live dispatch from booking to drop-off.</p>
          
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-[#193f3e]/20 pt-10">
            {[['30+', 'NorCal Cities'], ['24/7', 'Live Dispatch'], ['45 Min', 'Airport Grace Period'], ['15 Min', 'Standard Pickup Grace Period']].map(([value, label]) => (
              <div key={label}>
                <strong className="block font-display text-4xl lg:text-5xl font-medium text-[#193f3e]">{value}</strong>
                <span className="mt-3 block font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#193f3e]/70 font-medium">{label}</span>
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
            <span className="font-mono-ui text-[10px] uppercase tracking-[.2em] font-medium">Your ride starts here</span>
            <h2 className="mt-6 max-w-[700px] font-display text-[clamp(4rem,8vw,7rem)] leading-[.85] tracking-[-.04em]">Book in a few<br /><i>simple steps.</i></h2>
          </div>
          <button onClick={jump} className="group flex items-center gap-4 border-b-2 border-[#193f3e] pb-3 text-left font-mono-ui text-[12px] uppercase tracking-[.16em] font-bold hover:text-[#f6f1e8] hover:border-[#f6f1e8] transition-colors" data-testid="button-footer-book">
            Book Your Ride <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
          </button>
        </div>
        
        <div className="mt-28 grid gap-12 lg:grid-cols-4 border-t border-[#193f3e]/20 pt-16">
          <div className="lg:col-span-1">
             <div className="mix-blend-multiply opacity-90 brightness-0" style={{ filter: 'brightness(0) invert(22%) sepia(21%) saturate(1831%) hue-rotate(126deg) brightness(97%) contrast(93%)' }}>
               <Logo />
             </div>
             <p className="mt-8 text-[13px] leading-relaxed text-[#193f3e]/80 max-w-[280px] font-medium">
               A premium private chauffeur service for the Bay Area & Northern California.
             </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#193f3e]/60 mb-6 block">Navigation</span>
              <ul className="flex flex-col gap-4 text-[13px] font-medium text-[#193f3e]">
                <li><button onClick={jump} className="hover:text-[#f6f1e8] transition-colors">Reserve</button></li>
                <li><a href="#services" className="hover:text-[#f6f1e8] transition-colors">Services</a></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Vehicles</button></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Coverage</button></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">About</button></li>
              </ul>
            </div>
            <div>
              <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#193f3e]/60 mb-6 block">Services</span>
              <ul className="flex flex-col gap-4 text-[13px] font-medium text-[#193f3e]">
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Airport Transfers</button></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Corporate</button></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Hourly Charter</button></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Weddings</button></li>
                <li><button onClick={(e) => e.preventDefault()} className="hover:text-[#f6f1e8] transition-colors">Wine Tours</button></li>
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#193f3e]/60 mb-6 block">Contact</span>
            <address className="not-italic text-[13px] leading-relaxed text-[#193f3e] font-medium flex flex-col gap-4">
              <p>TuranEliteLimo<br/>501 Broadway, #251<br/>Millbrae, CA 94030</p>
              <a href="tel:6506723520" className="hover:text-[#f6f1e8] transition-colors">(650) 672-3520</a>
              <a href="mailto:support@turanelitelimo.com" className="hover:text-[#f6f1e8] transition-colors">support@turanelitelimo.com</a>
            </address>
          </div>
        </div>
        
        <div className="mt-20 flex flex-col justify-between gap-6 border-t border-[#193f3e]/10 pt-8 sm:flex-row items-center font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/70 font-medium">
          <span>© 2026 TuranEliteLimo. All rights reserved.</span>
          <span className="flex items-center gap-2"><ShieldCheck size={12} /> All Rides Licensed & Insured</span>
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
          <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-[#bc754e]" /> All rides licensed & insured</span>
          <span className="flex items-center gap-2"><UserRound size={12} className="text-[#bc754e]" /> Professional chauffeurs</span>
          <span className="flex items-center gap-2"><Globe2 size={12} className="text-[#bc754e]" /> 24/7 live dispatch</span>
        </div>
      </div>
      <ServiceSlider />
      <AppSection />
      <StackedStory />
      <Process />
      <Standard />
      <section className="bg-[#193f3e] text-[#f6f1e8] py-28 sm:py-40 border-t border-white/5">
        <div className="container-edge reveal flex flex-col items-center text-center">
          <span className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-[#d19a5c] font-medium mb-6 block">Reviews</span>
          <h2 className="max-w-[800px] font-display text-[clamp(3.5rem,7vw,5.5rem)] leading-[.9] tracking-[-.02em] text-[#f6f1e8]">Real riders,<br /><i>real words.</i></h2>
          <p className="mt-8 text-[15px] md:text-[16px] leading-[1.8] text-[#dbe0d6]/80 max-w-[480px] font-medium">On Google and Yelp — where our clients can leave their honest, verified impressions of our chauffeurs.</p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <button type="button" onClick={(e) => e.preventDefault()} className="w-full sm:w-[220px] h-[60px] rounded-full border border-[#d19a5c]/30 bg-[#d19a5c]/10 text-[#d19a5c] flex items-center justify-center gap-3 hover:bg-[#d19a5c] hover:text-[#102a29] transition-colors" data-testid="button-google-reviews">
               <span className="font-mono-ui text-[11px] uppercase tracking-[.15em] font-medium">Google Reviews</span>
               <ArrowRight size={14} />
            </button>
            <button type="button" onClick={(e) => e.preventDefault()} className="w-full sm:w-[220px] h-[60px] rounded-full border border-white/20 bg-white/5 text-[#f6f1e8] flex items-center justify-center gap-3 hover:bg-white hover:text-[#102a29] transition-colors" data-testid="button-yelp-reviews">
               <span className="font-mono-ui text-[11px] uppercase tracking-[.15em] font-medium">Yelp Reviews</span>
               <ArrowRight size={14} />
            </button>
          </div>
          
          <span className="mt-10 block font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#dbe0d6]/50">Every review read personally by our team</span>
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
