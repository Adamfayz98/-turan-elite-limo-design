import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowRight, CalendarDays, Check, Clock3, Diamond, Globe2, Menu, Navigation, Plane, Quote, ShieldCheck, Sparkles, Star, UserRound, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type FleetMode = 'sedan' | 'suv' | 'premium';

const fleet = {
  sedan: { id: 'sedan', name: 'Executive Sedan', type: 'Cadillac XTS or similar', spec: '1–3 guests  ·  2 cases', description: 'Low profile. Long wheelbase. An interior designed for the pause between destinations.', image: '/assets/executive-sedan-cadillac-xts.png', code: 'TEL / 07', price: '$145' },
  suv: { id: 'suv', name: 'Luxury SUV', type: 'Chevrolet Suburban or similar', spec: '1–5 guests  ·  4 cases', description: 'A little more room for the people and pieces that matter, without losing its poise.', image: '/assets/luxury-suv-suburban.png', code: 'TEL / 12', price: '$185' },
  premium: { id: 'premium', name: 'Premium SUV', type: 'Cadillac Escalade only', spec: '1–6 guests  ·  5 cases', description: 'Uncompromising presence and capability. The definitive luxury SUV experience.', image: '/assets/Escalade.png', code: 'TEL / 19', price: '$225' },
};

const services = [
  { number: '01', title: 'Airport transfers', copy: 'A composed landing. Your chauffeur tracks the flight, handles the luggage, and knows precisely where to be at SFO, OAK, or SJC.', tag: 'Most requested', accent: 'ochre' },
  { number: '02', title: 'Corporate travel', copy: 'Move between meetings with an unobtrusive rhythm. Quiet cabin, considered timing, zero loose ends.', tag: 'For business', accent: 'teal' },
  { number: '03', title: 'Napa & Sonoma', copy: 'Experience wine country without watching the clock. We provide seamless, full-day transportation tailored to your itinerary.', tag: 'By the hour', accent: 'rose' },
];

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
    <div className={`flex items-center gap-3 ${light ? 'text-[#f6f1e8]' : 'text-[#193f3e]'}`} data-testid="brand-logo">
      <span className="relative flex h-9 w-9 items-center justify-center border border-current/60 rounded-full">
        <span className="absolute h-4 w-4 rounded-full border border-current/70" />
        <span className="h-1 w-1 rounded-full bg-[#d19a5c]" />
      </span>
      <span className="leading-none">
        <span className="block font-mono-ui text-[9px] tracking-[.28em]">TURAN</span>
        <span className="block mt-1 font-mono-ui text-[9px] tracking-[.16em] opacity-70">ELITE LIMO</span>
      </span>
    </div>
  );
}

function Nav({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [['Services', 'services'], ['Fleet', 'fleet'], ['Our standard', 'standard'], ['Journal', 'journal']];
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

function BookingCard({ onSeeVehicles }: { onSeeVehicles: (details: any) => void }) {
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 0 && from) setStep(1);
    else if (step === 1 && to) setStep(2);
    else if (step === 2 && date) setStep(3);
    else if (step === 3 && time) onSeeVehicles({ from, to, date, time });
  };

  return (
    <div className="relative z-10 rounded-[2px] bg-[#f6f1e8] p-6 text-[#193f3e] shadow-[0_22px_70px_rgba(8,28,28,.28)] sm:p-9" id="booking" data-testid="card-booking">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">The first move</span>
            <h2 className="mt-2 font-display text-[28px] leading-none sm:text-[32px]">Where shall we take you?</h2>
          </div>
        </div>

        <div className="grid gap-3">
          {/* Pickup */}
          <div className={`overflow-hidden transition-all duration-300 ${step === 0 ? 'opacity-100 h-auto' : step > 0 ? 'opacity-75 h-[48px]' : 'opacity-30 pointer-events-none'}`}>
            {step === 0 ? (
              <label className="group relative flex min-h-[72px] flex-col justify-center border border-[#193f3e]/25 px-5 bg-white/50 focus-within:border-[#193f3e] focus-within:bg-white transition-colors">
                <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50">From</span>
                <input autoFocus required value={from} onChange={(e) => setFrom(e.target.value)} placeholder="San Francisco International Airport (SFO)" className="mt-1.5 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#193f3e]/38 placeholder:font-normal" data-testid="input-pickup" />
                <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-[1.5px] border-[#bc754e]" />
              </label>
            ) : (
              <button type="button" onClick={() => setStep(0)} className="flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left hover:border-[#193f3e]/30">
                <span className="flex items-center gap-3 text-[12px] font-semibold"><span className="h-2 w-2 rounded-full border-[1.5px] border-[#bc754e]" /> {from}</span>
                <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 underline decoration-transparent hover:decoration-current underline-offset-4 transition-all">Edit</span>
              </button>
            )}
          </div>

          {/* Dropoff */}
          <div className={`overflow-hidden transition-all duration-300 ${step === 1 ? 'opacity-100 h-auto' : step > 1 ? 'opacity-75 h-[48px]' : step === 0 ? 'opacity-40 h-[48px] grayscale' : 'opacity-30 pointer-events-none'}`}>
            {step === 1 ? (
              <label className="group relative flex min-h-[72px] flex-col justify-center border border-[#193f3e]/25 px-5 bg-white/50 focus-within:border-[#193f3e] focus-within:bg-white transition-colors">
                <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50">To</span>
                <input autoFocus required value={to} onChange={(e) => setTo(e.target.value)} placeholder="Napa Valley, CA" className="mt-1.5 w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#193f3e]/38 placeholder:font-normal" data-testid="input-dropoff" />
                <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#193f3e]" />
              </label>
            ) : (
              <button type="button" onClick={() => step > 1 ? setStep(1) : undefined} className={`flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left ${step > 1 ? 'hover:border-[#193f3e]/30 cursor-pointer' : 'cursor-default'}`}>
                <span className="flex items-center gap-3 text-[12px] font-semibold"><span className="h-2 w-2 rounded-full bg-[#193f3e]" /> {step > 1 ? to : 'Destination'}</span>
                {step > 1 && <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 underline decoration-transparent hover:decoration-current underline-offset-4 transition-all">Edit</span>}
              </button>
            )}
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`overflow-hidden transition-all duration-300 ${step === 2 ? 'opacity-100 h-auto' : step > 2 ? 'opacity-75 h-[48px]' : step < 2 ? 'opacity-40 h-[48px] grayscale' : 'opacity-30 pointer-events-none'}`}>
              {step === 2 ? (
                <label className="group relative flex min-h-[72px] flex-col justify-center border border-[#193f3e]/25 px-5 bg-white/50 focus-within:border-[#193f3e] focus-within:bg-white transition-colors">
                  <span className="flex items-center gap-1.5 font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50"><CalendarDays size={10} /> Date</span>
                  <input autoFocus required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full bg-transparent text-[13px] font-semibold outline-none" data-testid="input-date" />
                </label>
              ) : (
                <button type="button" onClick={() => step > 2 ? setStep(2) : undefined} className={`flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left ${step > 2 ? 'hover:border-[#193f3e]/30 cursor-pointer' : 'cursor-default'}`}>
                  <span className="flex items-center gap-2 text-[12px] font-semibold"><CalendarDays size={12} className="text-[#193f3e]/50" /> {step > 2 ? date : 'Date'}</span>
                </button>
              )}
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${step === 3 ? 'opacity-100 h-auto' : step > 3 ? 'opacity-75 h-[48px]' : step < 3 ? 'opacity-40 h-[48px] grayscale' : 'opacity-30 pointer-events-none'}`}>
              {step === 3 ? (
                <label className="group relative flex min-h-[72px] flex-col justify-center border border-[#193f3e]/25 px-5 bg-white/50 focus-within:border-[#193f3e] focus-within:bg-white transition-colors">
                  <span className="flex items-center gap-1.5 font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50"><Clock3 size={10} /> Time</span>
                  <input autoFocus required type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5 w-full bg-transparent text-[13px] font-semibold outline-none" data-testid="input-time" />
                </label>
              ) : (
                <button type="button" onClick={() => step > 3 ? setStep(3) : undefined} className={`flex w-full items-center justify-between h-full border border-[#193f3e]/15 px-5 text-left ${step > 3 ? 'hover:border-[#193f3e]/30 cursor-pointer' : 'cursor-default'}`}>
                  <span className="flex items-center gap-2 text-[12px] font-semibold"><Clock3 size={12} className="text-[#193f3e]/50" /> {step > 3 ? time : 'Time'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className={`font-mono-ui text-[9px] leading-relaxed text-[#193f3e]/55 transition-opacity ${step < 3 ? 'opacity-0' : 'opacity-100'}`}>We match the vehicle<br />to your itinerary.</span>
          <button type="submit" disabled={step < 3 || (step === 3 && !time)} className="group flex w-full items-center justify-center gap-4 bg-[#193f3e] px-8 py-4 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#f6f1e8] hover:bg-[#bc754e] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto" data-testid="button-next-step">
            {step < 3 ? 'Continue' : 'See Vehicles'} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Hero({ onBook }: { onBook: (details: any) => void }) {
  const jump = () => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <section id="top" className="relative min-h-[790px] overflow-hidden bg-[#193f3e] pt-[82px] text-[#f6f1e8]">
      <div className="hero-grid absolute inset-0 opacity-50" />
      <div className="absolute -right-32 top-20 h-[600px] w-[600px] rounded-full border border-[#d19a5c]/20 sm:h-[800px] sm:w-[800px]" />
      <div className="absolute -right-16 top-36 h-[390px] w-[390px] rounded-full border border-[#d19a5c]/15 sm:h-[590px] sm:w-[590px]" />
      <div className="floating-line absolute right-[18%] top-[28%] h-[1px] w-[310px] origin-right bg-[#d19a5c]/60" />
      <Nav onBook={jump} />
      <div className="container-edge relative grid gap-12 pb-20 pt-20 lg:grid-cols-[.95fr_1.05fr] lg:items-end lg:gap-20 lg:pt-28">
        <div className="reveal">
          <p className="flex items-center gap-3 font-mono-ui text-[9px] uppercase tracking-[.25em] text-[#d19a5c]"><span className="h-px w-7 bg-[#d19a5c]" />Bay Area & Northern California</p>
          <h1 className="mt-8 max-w-[640px] font-display text-[clamp(3.8rem,8.5vw,8.2rem)] leading-[.84] tracking-[-.05em]">Arrive in<br /><i className="text-[#d19a5c]">unspoken<br />luxury.</i></h1>
          <p className="mt-8 max-w-[390px] text-[14px] leading-[1.8] text-[#dbe0d6]/72">From SFO to Napa, your chauffeur handles the details so the ride feels effortless.</p>
          <div className="mt-9 flex items-center gap-6">
            <button onClick={jump} className="group flex items-center gap-3 border-b border-[#d19a5c] pb-2 font-mono-ui text-[10px] uppercase tracking-[.17em] hover:text-[#d19a5c]" data-testid="button-hero-book">Plan your journey <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></button>
            <span className="font-mono-ui text-[9px] text-[#dbe0d6]/45">01 / 04</span>
          </div>
        </div>
        <div className="reveal delay-2 lg:mb-[-90px]"><BookingCard onSeeVehicles={onBook} /></div>
      </div>
      <div className="container-edge absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-between font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#dbe0d6]/45">
        <span className="hidden sm:block">SFO · OAK · SJC · Napa · Sonoma</span>
        <span className="flex items-center gap-2"><span className="pulse-ring h-2 w-2 rounded-full bg-[#d19a5c]" />Available around the clock</span>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="bg-[#f6f1e8] py-28 sm:py-40">
      <div className="container-edge">
        <div className="reveal flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">A service with no loose ends</span><h2 className="mt-5 max-w-[620px] font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[.95] tracking-[-.04em]">The ride is<br /><i>part of the occasion.</i></h2></div>
          <p className="max-w-[245px] text-[12px] leading-[1.8] text-[#193f3e]/65">Discreet by instinct. Precise by practice. We make the journey feel like it was always going to be this easy.</p>
        </div>
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {services.map((service, index) => <article key={service.number} className={`reveal delay-${index + 1} group relative min-h-[360px] overflow-hidden border border-[#193f3e]/15 p-7 transition-colors hover:border-[#193f3e] ${service.accent === 'teal' ? 'bg-[#dfe8e1]' : service.accent === 'rose' ? 'bg-[#eadfd7]' : 'bg-[#e9dfcf]'}`} data-testid={`card-service-${service.number}`}>
            <div className="flex items-start justify-between"><span className="font-mono-ui text-[10px] text-[#193f3e]/55">{service.number}</span><span className="rounded-full border border-[#193f3e]/20 px-2 py-1 font-mono-ui text-[8px] uppercase tracking-[.12em] text-[#193f3e]/60">{service.tag}</span></div>
            <div className="absolute right-[-25px] top-[94px] h-44 w-44 rounded-full border border-[#193f3e]/15 transition-transform duration-700 group-hover:scale-125" /><div className="absolute right-[39px] top-[129px] h-24 w-24 rounded-full border border-[#bc754e]/40" />
            <div className="absolute inset-x-7 bottom-7"><h3 className="font-display text-3xl">{service.title}</h3><p className="mt-4 max-w-[280px] text-[12px] leading-[1.7] text-[#193f3e]/65">{service.copy}</p><button onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })} className="mt-6 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e] opacity-0 transition-opacity group-hover:opacity-100" data-testid={`button-service-book-${service.number}`}>Arrange this <ArrowRight size={12} /></button></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function Standard() {
  return (
    <section id="standard" className="overflow-hidden bg-[#e1e8e0] py-28 sm:py-40">
      <div className="container-edge grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div className="reveal relative min-h-[470px] overflow-hidden bg-[#193f3e] p-8 text-[#f6f1e8]">
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full border border-[#d19a5c]/35" /><div className="absolute -right-4 top-24 h-44 w-44 rounded-full border border-[#d19a5c]/35" />
          <span className="relative font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">Step in. Breathe out.</span>
          <div className="absolute bottom-8 left-8 right-8"><p className="font-display text-4xl leading-[1.05]">“The luxury is<br /><i>the lack of friction.”</i></p><div className="mt-8 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d19a5c]/50"><ShieldCheck size={13} className="text-[#d19a5c]" /></span><span className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[#dbe0d6]/60">Our operating principle</span></div></div>
        </div>
        <div className="reveal delay-2">
          <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">The Turan standard</span>
          <h2 className="mt-5 max-w-[570px] font-display text-[clamp(2.8rem,5.5vw,5.6rem)] leading-[.92] tracking-[-.04em]">Nothing loud.<br /><i>Everything ready.</i></h2>
          <p className="mt-8 max-w-[470px] text-[14px] leading-[1.85] text-[#193f3e]/68">From airport pickups to a night in the city, your chauffeur handles the details so the ride feels effortless. Every detail has a job: the right temperature, a driver who has read the room, an arrival that never needs explaining.</p>
          <div className="mt-10 grid max-w-[560px] grid-cols-2 gap-y-8 border-t border-[#193f3e]/15 pt-7 sm:grid-cols-4">
            {[['04:12', 'Average reply'], ['24/7', 'Human support'], ['12 min', 'Early to you'], ['∞', 'Small details']].map(([value, label]) => <div key={label}><strong className="font-display text-2xl font-medium">{value}</strong><span className="mt-1 block font-mono-ui text-[8px] uppercase tracking-[.1em] text-[#193f3e]/50">{label}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Fleet() {
  const [selected, setSelected] = useState<FleetMode>('premium');
  const vehicle = fleet[selected];
  return (
    <section id="fleet" className="bg-[#193f3e] py-28 text-[#f6f1e8] sm:py-40">
      <div className="container-edge">
        <div className="reveal flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">The quiet fleet</span><h2 className="mt-5 font-display text-[clamp(2.8rem,6vw,5.7rem)] leading-[.92] tracking-[-.04em]">Choose your<br /><i>point of view.</i></h2></div>
          <p className="max-w-[255px] text-[12px] leading-[1.8] text-[#dbe0d6]/65">Current-generation vehicles, maintained to exacting standards. Never flashy. Always immaculate.</p>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="reveal relative flex min-h-[390px] items-center justify-center overflow-hidden border border-[#dbe0d6]/15 bg-[#244d4c] p-8">
            <div className="absolute left-1/2 top-[25%] h-56 w-56 -translate-x-1/2 rounded-full border border-[#d19a5c]/25 sm:h-72 sm:w-72" /><div className="absolute left-1/2 top-[32%] h-40 w-40 -translate-x-1/2 rounded-full border border-[#d19a5c]/20" />
            <img src={vehicle.image} alt={vehicle.name} className="relative z-10 w-[85%] object-contain mix-blend-normal" />
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between"><span className="font-mono-ui text-[9px] uppercase tracking-[.17em] text-[#dbe0d6]/55">{vehicle.code}</span><span className="font-mono-ui text-[9px] uppercase tracking-[.17em] text-[#d19a5c]">Exterior / profile</span></div>
          </div>
          <div className="reveal delay-2">
            <div className="flex gap-2 border-b border-[#dbe0d6]/15 pb-4">{(['sedan', 'suv', 'premium'] as FleetMode[]).map((item) => <button key={item} onClick={() => setSelected(item)} className={`px-1 pb-3 mr-5 font-mono-ui text-[9px] uppercase tracking-[.16em] ${selected === item ? 'border-b border-[#d19a5c] text-[#d19a5c]' : 'text-[#dbe0d6]/45 hover:text-[#f6f1e8]'}`} data-testid={`button-fleet-${item}`}>{item}</button>)}</div>
            <span className="mt-10 block font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#d19a5c]">{vehicle.type}</span><h3 className="mt-4 font-display text-5xl">{vehicle.name}</h3><p className="mt-6 max-w-[380px] text-[14px] leading-[1.8] text-[#dbe0d6]/68">{vehicle.description}</p><div className="mt-9 flex items-center gap-6 border-y border-[#dbe0d6]/15 py-5"><span className="font-mono-ui text-[10px] text-[#dbe0d6]/60">{vehicle.spec}</span><span className="h-1 w-1 rounded-full bg-[#d19a5c]" /><span className="font-mono-ui text-[10px] text-[#dbe0d6]/60">Wi-Fi · water · privacy</span></div>
            <button onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })} className="group mt-8 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#f6f1e8]" data-testid="button-book-this-vehicle">Select this vehicle <ArrowRight size={14} className="text-[#d19a5c] transition-transform group-hover:translate-x-1" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="bg-[#e9dfcf] py-28 sm:py-36">
      <div className="container-edge">
        <div className="reveal text-center"><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">How it works</span><h2 className="mx-auto mt-5 max-w-[650px] font-display text-[clamp(2.8rem,5vw,5rem)] leading-[.95]">Three steps.<br /><i>Nothing more.</i></h2></div>
        <div className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-6">
          <div className="absolute left-[16%] right-[16%] top-5 hidden h-px border-t border-dashed border-[#193f3e]/25 md:block" />
          {[['01', 'Tell us where and when', 'A few details are enough. Choose your service, share the route, and tell us when to be ready.'], ['02', 'Choose your ride', 'Select from our fleet of immaculate sedans and SUVs tailored to your journey.'], ['03', 'We handle the rest', 'Your car is early, your route is considered, and the rest of the world can wait.']].map(([num, title, copy], index) => <div key={num} className={`reveal delay-${index + 1} relative`}><span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#193f3e] bg-[#e9dfcf] font-mono-ui text-[10px]">{num}</span><h3 className="mt-7 font-display text-2xl">{title}</h3><p className="mt-3 max-w-[260px] text-[12px] leading-[1.75] text-[#193f3e]/65">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Journal() {
  return (
    <section id="journal" className="bg-[#f6f1e8] py-28 sm:py-36">
      <div className="container-edge grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <div className="reveal"><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">Notes from the road</span><h2 className="mt-5 font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[.92]">A better way<br /><i>to move.</i></h2><button onClick={() => window.alert('Our journal is arriving shortly.')} className="group mt-9 flex items-center gap-3 border-b border-[#193f3e] pb-2 font-mono-ui text-[10px] uppercase tracking-[.16em]" data-testid="button-read-journal">Read the journal <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="reveal delay-1 border border-[#193f3e]/15 bg-[#dfe8e1] p-6 sm:col-span-2"><span className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#bc754e]">Field note / 06.24</span><h3 className="mt-16 max-w-[540px] font-display text-3xl">The art of being expected, not kept waiting.</h3><p className="mt-4 max-w-[480px] text-[12px] leading-[1.75] text-[#193f3e]/65">Why a thoughtful arrival has less to do with a clock than it does with attention.</p><button onClick={() => window.alert('This story will be available soon.')} className="mt-7 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.15em]" data-testid="button-read-field-note">Open note <ArrowRight size={12} /></button></article>
          <article className="reveal delay-2 min-h-[210px] border border-[#193f3e]/15 bg-[#eadfd7] p-6"><span className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#bc754e]">City guide / 05.24</span><h3 className="mt-12 font-display text-2xl">A softer landing in New York.</h3></article>
          <article className="reveal delay-3 min-h-[210px] border border-[#193f3e]/15 bg-[#e9dfcf] p-6"><span className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#bc754e]">On the road / 04.24</span><h3 className="mt-12 font-display text-2xl">What makes a cabin feel private.</h3></article>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const jump = () => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <footer className="bg-[#bc754e] text-[#193f3e]">
      <div className="container-edge py-24 sm:py-32">
        <div className="reveal flex flex-col justify-between gap-12 md:flex-row md:items-end"><div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em]">Your ride starts here</span><h2 className="mt-5 max-w-[700px] font-display text-[clamp(3.5rem,8vw,8rem)] leading-[.82] tracking-[-.06em]">Book in a few<br /><i>simple steps.</i></h2></div><button onClick={jump} className="group flex items-center gap-3 border-b border-[#193f3e] pb-3 text-left font-mono-ui text-[10px] uppercase tracking-[.16em]" data-testid="button-footer-book">We'll handle the rest <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></div>
        <div className="mt-24 flex flex-col justify-between gap-9 border-t border-[#193f3e]/25 pt-7 sm:flex-row"><Logo /><div className="flex flex-wrap gap-x-7 gap-y-3 font-mono-ui text-[9px] uppercase tracking-[.13em] text-[#193f3e]/65"><a href="#services" data-testid="link-footer-services">Services</a><a href="#fleet" data-testid="link-footer-fleet">Fleet</a><a href="#standard" data-testid="link-footer-standard">Our standard</a><a href="mailto:hello@turan-elite.com" data-testid="link-footer-email">Concierge email</a></div><span className="font-mono-ui text-[9px] text-[#193f3e]/55">© 2024 Turan Elite Limo</span></div>
      </div>
    </footer>
  );
}

function VehicleSelection({ trip, onBack }: { trip: any; onBack: () => void }) {
  const [selected, setSelected] = useState<FleetMode>('sedan');
  const vehicle = fleet[selected];
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#f6f1e8] text-[#193f3e] flex items-center justify-center p-6 text-center">
        <div className="max-w-md reveal is-visible">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#193f3e]/20 bg-white shadow-[0_12px_40px_rgba(8,28,28,.06)]">
            <Check size={28} className="text-[#bc754e]" />
          </div>
          <h2 className="font-display text-4xl mb-4">Request received.</h2>
          <p className="text-[14px] leading-relaxed text-[#193f3e]/70 mb-8">
            Your choice of the {vehicle.name} has been held. Our concierge team will review your itinerary and send a final confirmation shortly.
          </p>
          <button onClick={() => window.location.reload()} className="font-mono-ui text-[10px] uppercase tracking-[.16em] border-b border-[#193f3e] pb-1 hover:text-[#bc754e] hover:border-[#bc754e] transition-colors">Return to homepage</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#193f3e] flex flex-col md:flex-row">
      <div className="flex-1 p-6 sm:p-10 md:p-16 lg:p-20 border-r border-[#193f3e]/15">
        <button onClick={onBack} className="flex items-center gap-3 font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#193f3e]/50 hover:text-[#193f3e] transition-colors mb-12"><ArrowRight size={13} className="rotate-180" /> Back to details</button>
        <h2 className="font-display text-3xl sm:text-5xl mb-3">Choose your vehicle</h2>
        <p className="text-[13px] text-[#193f3e]/65 mb-12 max-w-md">Our fleet is maintained to exacting standards. Each vehicle includes bottled water, chargers, and a professional chauffeur.</p>
        
        <div className="grid gap-6">
          {(['sedan', 'suv', 'premium'] as FleetMode[]).map((key) => {
            const v = fleet[key];
            const isSelected = selected === key;
            return (
              <div key={key} onClick={() => setSelected(key)} className={`group relative cursor-pointer overflow-hidden border transition-all duration-300 ${isSelected ? 'border-[#d19a5c] bg-white shadow-[0_12px_40px_rgba(8,28,28,.08)]' : 'border-[#193f3e]/15 hover:border-[#193f3e]/40 bg-white/50'}`}>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
                  <div className="w-full sm:w-[220px] shrink-0">
                    <img src={v.image} alt={v.name} className={`w-full object-contain transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div><span className="block font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#bc754e]">{v.type}</span><h3 className="font-display text-2xl mt-1">{v.name}</h3></div>
                      <div className="text-right"><span className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/50 block mb-1">Est. Total</span><span className="font-display text-xl">{v.price}</span></div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#193f3e]/10">
                      <span className="font-mono-ui text-[9px] text-[#193f3e]/60">{v.spec}</span><span className="h-1 w-1 rounded-full bg-[#d19a5c]/50" /><span className="font-mono-ui text-[9px] text-[#193f3e]/60">Chauffeur</span>
                    </div>
                  </div>
                </div>
                {isSelected && <div className="absolute top-4 left-4 h-2 w-2 rounded-full bg-[#d19a5c]" />}
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center md:text-left"><a href="mailto:hello@turan-elite.com" className="font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/50 underline decoration-transparent hover:decoration-current hover:text-[#193f3e] transition-colors">Need something larger? Contact concierge</a></div>
      </div>
      <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 bg-[#e9dfcf] p-6 sm:p-10 md:p-12 md:sticky md:top-0 h-auto md:h-screen flex flex-col justify-between">
        <div>
          <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">Trip Summary</span>
          <div className="mt-8 space-y-6">
            <div><span className="block font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 mb-1.5">Route</span><p className="text-[13px] font-semibold leading-relaxed">{trip.from}<br /><span className="text-[#bc754e] my-1.5 block">↓</span>{trip.to}</p></div>
            <div className="flex gap-8"><div><span className="block font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 mb-1.5">Date</span><p className="text-[13px] font-semibold">{trip.date}</p></div><div><span className="block font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 mb-1.5">Time</span><p className="text-[13px] font-semibold">{trip.time}</p></div></div>
            <div className="pt-6 border-t border-[#193f3e]/15">
              <span className="block font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50 mb-1.5">Selected Vehicle</span><p className="text-[15px] font-display italic">{vehicle.name}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setConfirmed(true)} className="group mt-12 w-full flex items-center justify-between bg-[#193f3e] px-6 py-5 text-[#f6f1e8] hover:bg-[#bc754e] transition-colors"><span className="font-mono-ui text-[10px] uppercase tracking-[.16em]">Confirm request</span><ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button>
      </div>
    </div>
  );
}

function Home() {
  const [tripState, setTripState] = useState<any>(null);
  useReveal();
  if (tripState) return <VehicleSelection trip={tripState} onBack={() => setTripState(null)} />;
  return <main className="noise overflow-hidden"><Hero onBook={setTripState} /><div className="border-b border-[#193f3e]/15 bg-[#e9dfcf]"><div className="container-edge grid gap-5 py-6 font-mono-ui text-[9px] uppercase tracking-[.14em] text-[#193f3e]/55 sm:grid-cols-3 sm:gap-3"><span className="flex items-center gap-2"><Globe2 size={12} className="text-[#bc754e]" /> One standard, any city</span><span className="flex items-center gap-2"><UserRound size={12} className="text-[#bc754e]" /> A real person, always</span><span className="flex items-center gap-2"><Sparkles size={12} className="text-[#bc754e]" /> Thoughtful by default</span></div></div><Services /><Standard /><Fleet /><Process /><Journal /><section className="bg-[#f6f1e8] pb-28 sm:pb-40"><div className="container-edge reveal border-t border-[#193f3e]/15 pt-20"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><div className="flex gap-1 text-[#bc754e]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} size={14} fill="currentColor" />)}</div><blockquote className="mt-5 max-w-[720px] font-display text-3xl leading-[1.15] sm:text-5xl">“It is the rare service that makes a 5am departure feel like a privilege.”</blockquote><cite className="mt-5 block font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/50 not-italic">— A. Rahman, global strategy</cite></div><Quote className="hidden text-[#bc754e]/45 sm:block" size={54} strokeWidth={1} /></div></div></section><Footer /></main>;
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