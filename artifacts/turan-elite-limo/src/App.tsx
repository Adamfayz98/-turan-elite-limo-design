import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDownRight, ArrowRight, CalendarDays, Check, Clock3, Diamond, Globe2, Menu, Navigation, Plane, Quote, ShieldCheck, Sparkles, Star, UserRound, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type RideMode = 'airport' | 'hourly' | 'point-to-point' | 'occasion';
type FleetMode = 'sedan' | 'suv' | 'van';

const rideModes: { id: RideMode; label: string; detail: string; icon: typeof Plane }[] = [
  { id: 'airport', label: 'Airport transfer', detail: 'Meet & greet included', icon: Plane },
  { id: 'point-to-point', label: 'Point to point', detail: 'Direct, door to door', icon: Navigation },
  { id: 'hourly', label: 'By the hour', detail: 'Your car, at your pace', icon: Clock3 },
  { id: 'occasion', label: 'Special occasion', detail: 'Arrive memorably', icon: Diamond },
];

const services = [
  { number: '01', title: 'Airport arrivals', copy: 'A composed landing. Your chauffeur tracks the flight, handles the luggage, and knows precisely where to be.', tag: 'Most requested', accent: 'ochre' },
  { number: '02', title: 'Executive travel', copy: 'Move between meetings with an unobtrusive rhythm. Quiet cabin, considered timing, zero loose ends.', tag: 'For business', accent: 'teal' },
  { number: '03', title: 'Weddings & occasions', copy: 'The final detail that makes the entrance. White-glove coordination for the moments worth remembering.', tag: 'Make an entrance', accent: 'rose' },
];

const fleet = {
  sedan: { name: 'The Meridian', type: 'Executive sedan', spec: '1–3 guests  ·  2 cases', description: 'Low profile. Long wheelbase. An interior designed for the pause between destinations.', code: 'TEL / 07' },
  suv: { name: 'The Atlas', type: 'Luxury SUV', spec: '1–5 guests  ·  4 cases', description: 'A little more room for the people and pieces that matter, without losing its poise.', code: 'TEL / 12' },
  van: { name: 'The Gallery', type: 'First-class van', spec: '1–7 guests  ·  7 cases', description: 'Private lounge seating for a party that prefers to travel together and arrive refreshed.', code: 'TEL / 19' },
};

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

function BookingCard() {
  const [mode, setMode] = useState<RideMode>('airport');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:30');
  const [confirmed, setConfirmed] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (from && to && date) setConfirmed(true);
  };
  const selectedLabel = rideModes.find((ride) => ride.id === mode)?.label ?? 'Private transfer';
  return (
    <div className="relative z-10 rounded-[2px] bg-[#f6f1e8] p-5 text-[#193f3e] shadow-[0_22px_70px_rgba(8,28,28,.28)] sm:p-7" id="booking" data-testid="card-booking">
      {!confirmed ? <form onSubmit={submit}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">The first move</span>
            <h2 className="mt-2 font-display text-[28px] leading-none sm:text-[32px]">Where shall we take you?</h2>
          </div>
          <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#193f3e]/15 sm:flex"><ArrowDownRight size={16} /></span>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {rideModes.map(({ id, label, detail, icon: Icon }) => <button type="button" key={id} onClick={() => setMode(id)} className={`min-h-[76px] border p-3 text-left ${mode === id ? 'border-[#d19a5c] bg-[#e9dfcf]' : 'border-[#193f3e]/15 hover:border-[#193f3e]/45'}`} data-testid={`button-ride-mode-${id}`}>
            <Icon size={16} className={mode === id ? 'text-[#bc754e]' : 'text-[#193f3e]/55'} />
            <span className="mt-2 block text-[11px] font-bold">{label}</span>
            <span className="mt-1 block font-mono-ui text-[8px] text-[#193f3e]/55">{detail}</span>
          </button>)}
        </div>
        <div className="grid gap-2 lg:grid-cols-[1fr_1fr_150px_120px]">
          <label className="group relative flex min-h-[61px] flex-col justify-center border border-[#193f3e]/15 px-4 focus-within:border-[#193f3e]">
            <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50">From</span>
            <input required value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Airport, hotel or address" className="mt-1 w-full bg-transparent text-[12px] font-semibold outline-none placeholder:text-[#193f3e]/38" data-testid="input-pickup" />
            <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#bc754e]" />
          </label>
          <label className="group relative flex min-h-[61px] flex-col justify-center border border-[#193f3e]/15 px-4 focus-within:border-[#193f3e]">
            <span className="font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50">To</span>
            <input required value={to} onChange={(event) => setTo(event.target.value)} placeholder="Your destination" className="mt-1 w-full bg-transparent text-[12px] font-semibold outline-none placeholder:text-[#193f3e]/38" data-testid="input-dropoff" />
            <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#193f3e]" />
          </label>
          <label className="flex min-h-[61px] flex-col justify-center border border-[#193f3e]/15 px-4 focus-within:border-[#193f3e]">
            <span className="flex items-center gap-1 font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50"><CalendarDays size={10} /> Date</span>
            <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full bg-transparent text-[12px] font-semibold outline-none" data-testid="input-date" />
          </label>
          <label className="flex min-h-[61px] flex-col justify-center border border-[#193f3e]/15 px-4 focus-within:border-[#193f3e]">
            <span className="flex items-center gap-1 font-mono-ui text-[8px] uppercase tracking-[.15em] text-[#193f3e]/50"><Clock3 size={10} /> Time</span>
            <input required type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 w-full bg-transparent text-[12px] font-semibold outline-none" data-testid="input-time" />
          </label>
        </div>
        <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <span className="font-mono-ui text-[9px] leading-relaxed text-[#193f3e]/55">A tailored quote, held for 15 minutes.<br />No account required.</span>
          <button type="submit" className="group flex w-full items-center justify-center gap-4 bg-[#193f3e] px-6 py-4 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#f6f1e8] hover:bg-[#bc754e] sm:w-auto" data-testid="button-get-quote">See my estimate <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></button>
        </div>
      </form> : <div className="py-5 sm:py-8" data-testid="status-quote-confirmation">
        <div className="flex items-start justify-between">
          <div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">Your journey is held</span><h2 className="mt-3 font-display text-[34px] leading-[1.05]">A calm start<br /><i>awaits.</i></h2></div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d19a5c] text-[#193f3e]"><Check size={20} /></span>
        </div>
        <div className="my-7 grid gap-3 border-y border-[#193f3e]/15 py-5 sm:grid-cols-2">
          <div><span className="font-mono-ui text-[8px] uppercase tracking-[.14em] text-[#193f3e]/50">Journey</span><p className="mt-1 text-sm font-bold">{from} <span className="px-1 text-[#bc754e]">→</span> {to}</p></div>
          <div><span className="font-mono-ui text-[8px] uppercase tracking-[.14em] text-[#193f3e]/50">When</span><p className="mt-1 text-sm font-bold">{date} at {time}</p></div>
        </div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="font-mono-ui text-[8px] uppercase tracking-[.14em] text-[#193f3e]/50">Indicative fare</span><p className="mt-1 font-display text-3xl">$185 <span className="font-sans text-xs font-normal text-[#193f3e]/55">+ local taxes</span></p></div><button type="button" onClick={() => setConfirmed(false)} className="flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/65 underline decoration-[#d19a5c] underline-offset-4" data-testid="button-edit-quote">Edit journey <ArrowRight size={12} /></button></div>
        <p className="mt-6 border-l-2 border-[#d19a5c] pl-3 text-[11px] leading-relaxed text-[#193f3e]/70">A member of our client team will confirm the vehicle and exact fare shortly. Your preference: {selectedLabel}.</p>
      </div>}
    </div>
  );
}

function Hero() {
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
          <p className="flex items-center gap-3 font-mono-ui text-[9px] uppercase tracking-[.25em] text-[#d19a5c]"><span className="h-px w-7 bg-[#d19a5c]" />Private ground travel, considered</p>
          <h1 className="mt-8 max-w-[640px] font-display text-[clamp(4rem,9vw,8.6rem)] leading-[.84] tracking-[-.05em]">Arrive<br /><i className="text-[#d19a5c]">unhurried.</i></h1>
          <p className="mt-8 max-w-[390px] text-[14px] leading-[1.8] text-[#dbe0d6]/72">The city moves around you. Turan keeps your journey quiet, exact, and entirely your own.</p>
          <div className="mt-9 flex items-center gap-6">
            <button onClick={jump} className="group flex items-center gap-3 border-b border-[#d19a5c] pb-2 font-mono-ui text-[10px] uppercase tracking-[.17em] hover:text-[#d19a5c]" data-testid="button-hero-book">Plan your journey <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></button>
            <span className="font-mono-ui text-[9px] text-[#dbe0d6]/45">01 / 04</span>
          </div>
        </div>
        <div className="reveal delay-2 lg:mb-[-90px]"><BookingCard /></div>
      </div>
      <div className="container-edge absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-between font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#dbe0d6]/45">
        <span className="hidden sm:block">New York · London · Paris · Wherever next</span>
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
          <span className="relative font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">Turan / 00:17</span>
          <div className="absolute bottom-8 left-8 right-8"><p className="font-display text-4xl leading-[1.05]">“The luxury is<br /><i>the lack of friction.”</i></p><div className="mt-8 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d19a5c]/50"><ShieldCheck size={13} className="text-[#d19a5c]" /></span><span className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[#dbe0d6]/60">Our operating principle</span></div></div>
        </div>
        <div className="reveal delay-2">
          <span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">The Turan standard</span>
          <h2 className="mt-5 max-w-[570px] font-display text-[clamp(2.8rem,5.5vw,5.6rem)] leading-[.92] tracking-[-.04em]">Nothing loud.<br /><i>Everything ready.</i></h2>
          <p className="mt-8 max-w-[470px] text-[14px] leading-[1.85] text-[#193f3e]/68">We believe a great chauffeur service should leave you with more time than it found you with. Every detail has a job: the right temperature, a driver who has read the room, an arrival that never needs explaining.</p>
          <div className="mt-10 grid max-w-[560px] grid-cols-2 gap-y-8 border-t border-[#193f3e]/15 pt-7 sm:grid-cols-4">
            {[['04:12', 'Average reply'], ['24/7', 'Human support'], ['12 min', 'Early to you'], ['∞', 'Small details']].map(([value, label]) => <div key={label}><strong className="font-display text-2xl font-medium">{value}</strong><span className="mt-1 block font-mono-ui text-[8px] uppercase tracking-[.1em] text-[#193f3e]/50">{label}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Fleet() {
  const [selected, setSelected] = useState<FleetMode>('sedan');
  const vehicle = fleet[selected];
  return (
    <section id="fleet" className="bg-[#193f3e] py-28 text-[#f6f1e8] sm:py-40">
      <div className="container-edge">
        <div className="reveal flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#d19a5c]">The quiet fleet</span><h2 className="mt-5 font-display text-[clamp(2.8rem,6vw,5.7rem)] leading-[.92] tracking-[-.04em]">Choose your<br /><i>point of view.</i></h2></div>
          <p className="max-w-[255px] text-[12px] leading-[1.8] text-[#dbe0d6]/65">Current-generation vehicles, maintained to exacting standards. Never flashy. Always immaculate.</p>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="reveal relative flex min-h-[390px] items-end overflow-hidden border border-[#dbe0d6]/15 bg-[#244d4c] p-8">
            <div className="absolute left-1/2 top-[25%] h-56 w-56 -translate-x-1/2 rounded-full border border-[#d19a5c]/25 sm:h-72 sm:w-72" /><div className="absolute left-1/2 top-[32%] h-40 w-40 -translate-x-1/2 rounded-full border border-[#d19a5c]/20" />
            <div className="absolute inset-x-[13%] top-[44%] h-[74px] rounded-[50%_50%_18%_18%] border-2 border-[#d19a5c]/60 bg-[#183b3b] shadow-[0_20px_30px_rgba(0,0,0,.22)] sm:inset-x-[18%]"><span className="absolute left-[8%] top-3 h-9 w-[34%] rounded-tl-full border border-[#d19a5c]/35 bg-[#dbe0d6]/10" /><span className="absolute right-[8%] top-3 h-9 w-[34%] rounded-tr-full border border-[#d19a5c]/35 bg-[#dbe0d6]/10" /><span className="absolute -bottom-3 left-[10%] h-5 w-5 rounded-full bg-[#0f2a2b] ring-2 ring-[#d19a5c]/70" /><span className="absolute -bottom-3 right-[10%] h-5 w-5 rounded-full bg-[#0f2a2b] ring-2 ring-[#d19a5c]/70" /></div>
            <div className="relative flex w-full items-end justify-between"><span className="font-mono-ui text-[9px] uppercase tracking-[.17em] text-[#dbe0d6]/55">{vehicle.code}</span><span className="font-mono-ui text-[9px] uppercase tracking-[.17em] text-[#d19a5c]">Exterior / profile</span></div>
          </div>
          <div className="reveal delay-2">
            <div className="flex gap-2 border-b border-[#dbe0d6]/15 pb-4">{(['sedan', 'suv', 'van'] as FleetMode[]).map((item) => <button key={item} onClick={() => setSelected(item)} className={`px-1 pb-3 mr-5 font-mono-ui text-[9px] uppercase tracking-[.16em] ${selected === item ? 'border-b border-[#d19a5c] text-[#d19a5c]' : 'text-[#dbe0d6]/45 hover:text-[#f6f1e8]'}`} data-testid={`button-fleet-${item}`}>{item}</button>)}</div>
            <span className="mt-10 block font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#d19a5c]">{vehicle.type}</span><h3 className="mt-4 font-display text-5xl">{vehicle.name}</h3><p className="mt-6 max-w-[380px] text-[14px] leading-[1.8] text-[#dbe0d6]/68">{vehicle.description}</p><div className="mt-9 flex items-center gap-6 border-y border-[#dbe0d6]/15 py-5"><span className="font-mono-ui text-[10px] text-[#dbe0d6]/60">{vehicle.spec}</span><span className="h-1 w-1 rounded-full bg-[#d19a5c]" /><span className="font-mono-ui text-[10px] text-[#dbe0d6]/60">Wi-Fi · water · privacy</span></div>
            <button onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })} className="group mt-8 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#f6f1e8]" data-testid="button-select-vehicle">Select this vehicle <ArrowRight size={14} className="text-[#d19a5c] transition-transform group-hover:translate-x-1" /></button>
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
        <div className="reveal text-center"><span className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#bc754e]">From here to there</span><h2 className="mx-auto mt-5 max-w-[650px] font-display text-[clamp(2.8rem,5vw,5rem)] leading-[.95]">Three quiet steps<br /><i>to your destination.</i></h2></div>
        <div className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-6">
          <div className="absolute left-[16%] right-[16%] top-5 hidden h-px border-t border-dashed border-[#193f3e]/25 md:block" />
          {[['01', 'Tell us where', 'A few details are enough. Choose your service, share the route, and tell us when to be ready.'], ['02', 'We make it exact', 'Our team matches the vehicle and chauffeur to your itinerary, then sends one clear confirmation.'], ['03', 'You arrive composed', 'Your car is early, your route is considered, and the rest of the world can wait.']].map(([num, title, copy], index) => <div key={num} className={`reveal delay-${index + 1} relative`}><span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#193f3e] bg-[#e9dfcf] font-mono-ui text-[10px]">{num}</span><h3 className="mt-7 font-display text-2xl">{title}</h3><p className="mt-3 max-w-[260px] text-[12px] leading-[1.75] text-[#193f3e]/65">{copy}</p></div>)}
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
        <div className="reveal flex flex-col justify-between gap-12 md:flex-row md:items-end"><div><span className="font-mono-ui text-[9px] uppercase tracking-[.2em]">The road is yours</span><h2 className="mt-5 max-w-[700px] font-display text-[clamp(3.5rem,8vw,8rem)] leading-[.82] tracking-[-.06em]">Take your<br /><i>time.</i></h2></div><button onClick={jump} className="group flex items-center gap-3 border-b border-[#193f3e] pb-3 text-left font-mono-ui text-[10px] uppercase tracking-[.16em]" data-testid="button-footer-book">Request a car <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></div>
        <div className="mt-24 flex flex-col justify-between gap-9 border-t border-[#193f3e]/25 pt-7 sm:flex-row"><Logo /><div className="flex flex-wrap gap-x-7 gap-y-3 font-mono-ui text-[9px] uppercase tracking-[.13em] text-[#193f3e]/65"><a href="#services" data-testid="link-footer-services">Services</a><a href="#fleet" data-testid="link-footer-fleet">Fleet</a><a href="#standard" data-testid="link-footer-standard">Our standard</a><a href="mailto:hello@turan-elite.com" data-testid="link-footer-email">Concierge email</a></div><span className="font-mono-ui text-[9px] text-[#193f3e]/55">© 2024 Turan Elite Limo</span></div>
      </div>
    </footer>
  );
}

function Home() {
  useReveal();
  return <main className="noise overflow-hidden"><Hero /><div className="border-b border-[#193f3e]/15 bg-[#e9dfcf]"><div className="container-edge grid gap-5 py-6 font-mono-ui text-[9px] uppercase tracking-[.14em] text-[#193f3e]/55 sm:grid-cols-3 sm:gap-3"><span className="flex items-center gap-2"><Globe2 size={12} className="text-[#bc754e]" /> One standard, any city</span><span className="flex items-center gap-2"><UserRound size={12} className="text-[#bc754e]" /> A real person, always</span><span className="flex items-center gap-2"><Sparkles size={12} className="text-[#bc754e]" /> Thoughtful by default</span></div></div><Services /><Standard /><Fleet /><Process /><Journal /><section className="bg-[#f6f1e8] pb-28 sm:pb-40"><div className="container-edge reveal border-t border-[#193f3e]/15 pt-20"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><div className="flex gap-1 text-[#bc754e]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} size={14} fill="currentColor" />)}</div><blockquote className="mt-5 max-w-[720px] font-display text-3xl leading-[1.15] sm:text-5xl">“It is the rare service that makes a 5am departure feel like a privilege.”</blockquote><cite className="mt-5 block font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#193f3e]/50 not-italic">— A. Rahman, global strategy</cite></div><Quote className="hidden text-[#bc754e]/45 sm:block" size={54} strokeWidth={1} /></div></div></section><Footer /></main>;
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