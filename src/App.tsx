import { useState, useRef, useCallback } from "react";
import logo from "@/imports/465277841_10233382405529642_3782409579598434056_n-2.jpg";
import heroPhoto from "@/imports/5D584F14-8A1C-46B7-933C-67899EF1BE46.PNG";
import jobSconces from "@/imports/657078568_122181999824591631_5532447073094463271_n.jpg";
import jobKitchenSockets from "@/imports/502583247_122146667786591631_6527052431430848068_n.jpg";
import jobTvFireplace from "@/imports/511191671_122150237744591631_3882601687954298215_n.jpg";
import jobLoftDownlights from "@/imports/511158323_122150237822591631_5132594126290179971_n.jpg";
import jobChandelier from "@/imports/558371187_122163956168591631_5073259982430142383_n.jpg";
import jobEvCharger from "@/imports/596091880_122171254082591631_2738812905795248170_n.jpg";
import jobLivingRoom from "@/imports/604663255_122173254368591631_3174324997793595324_n.jpg";
import jobKitchen from "@/imports/602495039_122173254380591631_7596565086744773483_n.jpg";
import jobLedPanel from "@/imports/558086484_122163956156591631_9194524728306376133_n.jpg";
import jobConsumerUnit1 from "@/imports/476449806_122126654132591631_1263607315244599684_n.jpg";
import jobConsumerUnit2 from "@/imports/476280975_122126653124591631_8138942217369824530_n.jpg";
import jobShower from "@/imports/689011170_122187098540591631_8940809661807458265_n.jpg";

const CALL_OUT = 60;

type ServiceType = {
  id: string;
  label: string;
  icon: string;
  description: string;
  // Flat-fee jobs: flatPrice is the total labour (call-out already included)
  flatPrice?: number;
  // Per-unit jobs: pricePerUnit charged on top of call-out
  pricePerUnit?: number;
  unitLabel?: string;
  unitLabelPlural?: string;
};

type JobSize = "small" | "medium" | "large";

const SERVICES: ServiceType[] = [
  { id: "fault-finding", label: "Fault Finding", icon: "⚡", flatPrice: 60, description: "Diagnose tripping circuits, flickering lights, or mystery faults" },
  { id: "consumer-unit", label: "Consumer Unit Upgrade", icon: "🔌", flatPrice: 460, description: "Full consumer unit / fuse board replacement to modern 18th Edition standards" },
  { id: "sockets", label: "Sockets & Outlets", icon: "🔲", pricePerUnit: 50, unitLabel: "socket", unitLabelPlural: "sockets", description: "Install or relocate single/double sockets, USB outlets, or fused spurs — priced per socket" },
  { id: "lighting", label: "Lighting Installation", icon: "💡", pricePerUnit: 50, unitLabel: "light fitting", unitLabelPlural: "light fittings", description: "LED downlights, pendants, ceiling fans, sensor or security lights — priced per fitting" },
  { id: "ev-charger", label: "EV Charger", icon: "🚗", flatPrice: 810, description: "Home EV charger supply and installation — OZEV-approved installer" },
  { id: "rcd", label: "RCD / Safety Switch", icon: "🛡️", flatPrice: 160, description: "Supply and fit RCDs on power and lighting circuits for full protection" },
  { id: "hot-water", label: "Immersion / Hot Water", icon: "🌡️", flatPrice: 240, description: "Immersion heater replacement or electric hot water system installation" },
  { id: "air-con", label: "Air Conditioning", icon: "❄️", flatPrice: 340, description: "Electrical supply and connection for split-system or multi-room air con units" },
  { id: "smoke-alarms", label: "Smoke Alarms", icon: "🔔", pricePerUnit: 75, unitLabel: "alarm", unitLabelPlural: "alarms", description: "Mains-wired interlinked smoke and heat alarms to BS 5839 — priced per alarm" },
  { id: "other", label: "Other", icon: "🔧", flatPrice: 60, description: "Something else — describe it below and we'll provide a bespoke quote" },
];

const SIZE_MULTIPLIERS: Record<JobSize, number> = { small: 1, medium: 1.5, large: 2.2 };
const SIZE_LABELS: Record<JobSize, string> = {
  small: "Small job",
  medium: "Medium job",
  large: "Large / complex job",
};

type Page = "booking" | "our-work";
type Step = "service" | "details" | "photos" | "contact" | "submitted";

type UploadedPhoto = { id: string; file: File; preview: string };
type FormData = {
  service: ServiceType | null;
  quantity: number;
  size: JobSize;
  description: string;
  urgency: "flexible" | "within-week" | "urgent";
  photos: UploadedPhoto[];
  name: string;
  email: string;
  address: string;
};

const GALLERY_ITEMS = [
  {
    id: 1,
    img: jobChandelier,
    title: "Multi-Tier Crystal Chandelier",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "Installation of a large round multi-tier crystal chandelier with smoked glass outer panels and cascading clear crystal drops, wired into an existing ceiling rose in a living room with a marble feature wall.",
  },
  {
    id: 2,
    img: jobLedPanel,
    title: "LED Crystal Panel & Pendant Lights",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "Installation of a large modular LED crystal panel ceiling light — four rectangular black-framed ice-effect sections — combined with three hanging globe pendant lights, all wired on separate circuits.",
  },
  {
    id: 3,
    img: jobLivingRoom,
    title: "LED Downlights",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "LED downlight installation throughout a new kitchen renovation, including fittings across the main ceiling and inside a decorative coffered ceiling section.",
  },
  {
    id: 4,
    img: jobKitchen,
    title: "Twin Chandeliers",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "Supply and installation of two matching tiered glass rod chandeliers with brass fittings in a large open-plan living room, wired into new ceiling roses with dedicated circuits for each fitting.",
  },
  {
    id: 5,
    img: jobSconces,
    title: "Bathroom Wall Sconces",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "Installation of two antique brass wall sconces with pleated shades either side of a framed artwork, wired into the wall above a marble farmhouse sink.",
  },
  {
    id: 6,
    img: jobEvCharger,
    title: "EV Charger Installation",
    location: "Swindon, England",
    tag: "EV Charger",
    desc: "Supply and installation of a home EV charger unit mounted on a rendered exterior wall, with a new outdoor consumer unit enclosure, trunking, and a dedicated circuit run from the main board.",
  },
  {
    id: 7,
    img: jobKitchenSockets,
    title: "Kitchen Sockets & LED Strip Lighting",
    location: "Swindon, England",
    tag: "Sockets",
    desc: "Installation of double sockets along the kitchen splashback and LED strip lighting fitted beneath the upper cabinets, as part of a full kitchen renovation.",
  },
  {
    id: 8,
    img: jobTvFireplace,
    title: "Media Wall",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "Concealed wiring for a wall-mounted TV on a slatted timber feature wall, with a dedicated power supply installed for an electric fireplace below.",
  },
  {
    id: 9,
    img: jobLoftDownlights,
    title: "Loft Room Downlights",
    location: "Swindon, England",
    tag: "Lighting",
    desc: "LED downlights installed into a vaulted ceiling with exposed timber beams in a converted loft room.",
  },
  {
    id: 10,
    img: jobConsumerUnit1,
    title: "Consumer Unit Upgrade",
    location: "Swindon, England",
    tag: "Consumer Unit",
    desc: "Full consumer unit replacement with a new Hager 18th Edition board, including RCBO protection on individual circuits, surge protection device, and neatly terminated wiring throughout.",
  },
  {
    id: 11,
    img: jobConsumerUnit2,
    title: "Consumer Unit Upgrade",
    location: "Swindon, England",
    tag: "Consumer Unit",
    desc: "Supply and installation of a FuseBox consumer unit with a 100A main switch, RCD protection, and individual MCBs for all circuits — fully wired and tested to 18th Edition regulations.",
  },
  {
    id: 12,
    img: jobShower,
    title: "Shower Change",
    location: "Swindon, England",
    tag: "Hot Water",
    desc: "Supply and installation of a Mira electric shower unit with a dedicated circuit from the consumer unit, including new cabling, isolation switch, and shower rail fitted.",
  },
];

const ALL_TAGS = ["All", ...Array.from(new Set(GALLERY_ITEMS.map((g) => g.tag)))] as string[];

function estimatePrice(service: ServiceType | null, size: JobSize, quantity: number): number {
  if (!service) return 0;
  if (service.flatPrice !== undefined) {
    return Math.round(service.flatPrice * SIZE_MULTIPLIERS[size]);
  }
  // Per-unit: call-out + (quantity × pricePerUnit), size multiplier on labour only
  return Math.round(CALL_OUT + (quantity * (service.pricePerUnit ?? 0) * SIZE_MULTIPLIERS[size]));
}

function serviceFromPrice(service: ServiceType): string {
  if (service.flatPrice !== undefined) return `£${service.flatPrice} inc. call-out`;
  return `£${CALL_OUT} call-out + £${service.pricePerUnit} per ${service.unitLabel}`;
}

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium transition-all duration-200"
              style={{
                background: i <= current ? "#cccccc" : "#2e2e2e",
                color: i <= current ? "#0f0f0f" : "#888",
              }}
            >
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (i + 1)}
            </div>
            <span className="text-[10px] mt-1 font-mono" style={{ color: i <= current ? "#cccccc" : "#888" }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="h-px w-12 mb-4 mx-1 transition-all duration-300" style={{ background: i < current ? "#cccccc" : "#2e2e2e" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ service, selected, onClick }: { service: ServiceType; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded transition-all duration-150"
      style={{
        background: selected ? "#4a4a4a" : "#181818",
        border: `1px solid ${selected ? "#888" : "#2e2e2e"}`,
        color: "#f0f0f0",
      }}
    >
      <div className="text-2xl mb-2">{service.icon}</div>
      <div className="font-semibold text-sm font-display mb-1">{service.label}</div>
      <div className="text-[11px] leading-relaxed" style={{ color: selected ? "#ccc" : "#888" }}>
        {service.description}
      </div>
      <div className="mt-3 font-mono text-xs leading-snug" style={{ color: "#cccccc" }}>
        {serviceFromPrice(service)}
      </div>
    </button>
  );
}

/* ── Our Work page ── */
function OurWorkPage({ onBook }: { onBook: () => void }) {
  const [activeTag, setActiveTag] = useState("All");
  const [lightbox, setLightbox] = useState<(typeof GALLERY_ITEMS)[0] | null>(null);

  const filtered = activeTag === "All" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((g) => g.tag === activeTag);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div
          className="inline-block text-[10px] font-mono px-2 py-1 rounded mb-4"
          style={{ background: "#181818", border: "1px solid #cccccc", color: "#cccccc" }}
        >
          PORTFOLIO
        </div>
        <h1
          className="text-4xl sm:text-5xl font-display font-extrabold leading-tight mb-4 tracking-tight"
          style={{ color: "#f0f0f0" }}
        >
          Our <span style={{ color: "#cccccc" }}>work</span>
        </h1>
        <p className="text-sm leading-relaxed max-w-xl" style={{ color: "#888" }}>
          A selection of recent jobs completed by JMJ Electrical across Swindon and the surrounding areas. Every job is carried out by our licensed electricians to the highest standard.
        </p>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className="px-3 py-1.5 rounded text-xs font-mono transition-all duration-150"
            style={{
              background: activeTag === tag ? "#4a4a4a" : "#181818",
              border: `1px solid ${activeTag === tag ? "#888" : "#2e2e2e"}`,
              color: activeTag === tag ? "#f0f0f0" : "#888",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setLightbox(item)}
            className="group rounded-lg overflow-hidden text-left transition-all duration-200"
            style={{ background: "#181818", border: "1px solid #2e2e2e" }}
          >
            <div className="relative overflow-hidden aspect-[4/3]" style={{ background: "#222" }}>
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={item.id === 10 ? { objectPosition: "center top" } : undefined}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "rgba(245,196,0,0.12)" }} />
              <div
                className="absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded"
                style={{ background: "rgba(0,0,0,0.8)", border: "1px solid #2e2e2e", color: "#cccccc" }}
              >
                {item.tag}
              </div>
            </div>
            <div className="p-4">
              <div className="font-display font-bold text-sm mb-1" style={{ color: "#f0f0f0" }}>
                {item.title}
              </div>
              <div className="text-[10px] font-mono mb-2" style={{ color: "#cccccc" }}>
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "#888" }}>
                {item.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* CTA strip */}
      <div
        className="rounded-lg p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ background: "#181818", border: "1px solid #cccccc" }}
      >
        <div>
          <div className="font-display font-bold text-xl mb-1" style={{ color: "#f0f0f0" }}>
            Ready to get started?
          </div>
          <div className="text-sm" style={{ color: "#888" }}>
            Get an instant estimate and send your job directly to JMJ Electrical.
          </div>
        </div>
        <button
          onClick={onBook}
          className="shrink-0 px-6 py-3 rounded font-display font-bold text-sm transition-all duration-150"
          style={{ background: "#4a4a4a", color: "#f0f0f0" }}
        >
          Get a Quote ⚡
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-2xl w-full rounded-lg overflow-hidden"
            style={{ background: "#181818", border: "1px solid #2e2e2e" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightbox.img} alt={lightbox.title} className="w-full object-contain" style={{ maxHeight: 520, background: "#111" }} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div
                    className="text-[10px] font-mono px-2 py-1 rounded inline-block mb-2"
                    style={{ background: "#222", border: "1px solid #cccccc", color: "#cccccc" }}
                  >
                    {lightbox.tag}
                  </div>
                  <div className="font-display font-bold text-lg" style={{ color: "#f0f0f0" }}>
                    {lightbox.title}
                  </div>
                  <div className="text-xs font-mono mt-1" style={{ color: "#cccccc" }}>
                  </div>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="w-8 h-8 rounded flex items-center justify-center text-sm"
                  style={{ background: "#222", border: "1px solid #2e2e2e", color: "#888" }}
                >
                  ×
                </button>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "#888" }}>
                {lightbox.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Booking flow ── */
function BookingPage() {
  const [step, setStep] = useState<Step>("service");
  const [form, setForm] = useState<FormData>({
    service: null, quantity: 1, size: "small", description: "", urgency: "flexible",
    photos: [], name: "", email: "", address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const estimate = estimatePrice(form.service, form.size, form.quantity);
  const isPerUnit = !!form.service?.pricePerUnit;
  const steps = ["Service", "Details", "Photos", "Contact"];
  const stepIndex = ["service", "details", "photos", "contact"].indexOf(step);

  function addPhotos(files: FileList | File[]) {
    const arr = Array.from(files).slice(0, 8 - form.photos.length);
    const newPhotos: UploadedPhoto[] = arr.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
    }));
    setForm((f) => ({ ...f, photos: [...f.photos, ...newPhotos] }));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addPhotos(e.dataTransfer.files);
  }, [form.photos.length]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/xppzygvo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          address: form.address,
          service: form.service?.label,
          job_size: SIZE_LABELS[form.size],
          timing: form.urgency === "flexible" ? "Flexible" : form.urgency === "within-week" ? "This week" : "Urgent / ASAP",
          description: form.description,
          quantity: form.service?.pricePerUnit ? `${form.quantity} ${form.quantity === 1 ? form.service.unitLabel : form.service.unitLabelPlural}` : "N/A",
          estimate: `£${estimatePrice(form.service, form.size, form.quantity).toLocaleString()} approx. inc. VAT`,
          photos_attached: form.photos.length > 0 ? `${form.photos.length} photo(s) uploaded by customer` : "None",
        }),
      });
      if (res.ok) {
        setStep("submitted");
      } else {
        alert("Something went wrong sending your request. Please try again or call us directly.");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canProceed = {
    service: !!form.service,
    details: form.description.trim().length > 10,
    photos: true,
    contact: !!(form.name.trim() && form.email.trim() && form.address.trim()),
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {step !== "submitted" ? (
        <>
          {/* Hero row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="inline-block text-[10px] font-mono px-2 py-1 rounded mb-4" style={{ background: "#181818", border: "1px solid #cccccc", color: "#cccccc" }}>
                INSTANT ESTIMATE
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold leading-tight mb-4 tracking-tight" style={{ color: "#f0f0f0" }}>
                Get a quote in{" "}<span style={{ color: "#cccccc" }}>60 seconds</span>
              </h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#888" }}>
                Tell us what's needed, upload a photo, and we'll send your job straight to our team. JMJ Electrical will review and confirm within 24 business hours.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono" style={{ color: "#888" }}>
                {["Licensed & insured", "Same-day available", "No hidden fees", "Swindon and surrounding areas"].map((t) => (
                  <div key={t} className="flex items-center gap-1">
                    <span style={{ color: "#cccccc" }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg hidden lg:block" style={{ background: "#181818", minHeight: 220 }}>
              <img
                src={heroPhoto}
                alt="JMJ Electrical engineer working on a consumer unit"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,15,15,0.6) 0%, transparent 60%)" }} />
              <div className="absolute bottom-4 left-4">
                <div className="inline-block text-xs font-mono px-3 py-1.5 rounded" style={{ background: "rgba(0,0,0,0.8)", border: "1px solid #cccccc", color: "#cccccc" }}>
                  {form.service ? `Est. £${estimate.toLocaleString()} — ${form.service.label}` : "Select a service to see your estimate"}
                </div>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="mb-8">
            <StepIndicator current={stepIndex} steps={steps} />
          </div>

          {/* Step panel */}
          <div className="rounded-lg p-6 sm:p-8" style={{ background: "#181818", border: "1px solid #2e2e2e" }}>

            {/* STEP 1: Service */}
            {step === "service" && (
              <div>
                <h2 className="font-display font-bold text-xl mb-1" style={{ color: "#f0f0f0" }}>What do you need done?</h2>
                <p className="text-xs mb-6" style={{ color: "#888" }}>Select the service that best describes your job.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                  {SERVICES.map((s) => (
                    <ServiceCard key={s.id} service={s} selected={form.service?.id === s.id} onClick={() => setForm((f) => ({ ...f, service: s, quantity: 1 }))} />
                  ))}
                </div>
                {form.service && (
                  <div className="p-4 rounded mb-6 flex items-center justify-between" style={{ background: "#222", border: "1px solid #cccccc" }}>
                    <div>
                      <div className="text-xs font-mono mb-1" style={{ color: "#888" }}>SELECTED SERVICE</div>
                      <div className="font-display font-semibold" style={{ color: "#f0f0f0" }}>{form.service.icon} {form.service.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono mb-1" style={{ color: "#888" }}>PRICING</div>
                      <div className="font-mono font-bold text-sm" style={{ color: "#cccccc" }}>{serviceFromPrice(form.service)}</div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button disabled={!canProceed.service} onClick={() => setStep("details")} className="px-6 py-3 rounded font-display font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#4a4a4a", color: "#f0f0f0" }}>
                    Next: Job Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === "details" && (
              <div>
                <h2 className="font-display font-bold text-xl mb-1" style={{ color: "#f0f0f0" }}>Tell us more</h2>
                <p className="text-xs mb-6" style={{ color: "#888" }}>The more detail you give, the more accurate your estimate.</p>
                {/* Quantity picker — only for per-unit services */}
                {isPerUnit && (
                  <div className="mb-6">
                    <label className="block text-xs font-mono mb-1" style={{ color: "#888" }}>
                      HOW MANY {form.service?.unitLabelPlural?.toUpperCase()} DO YOU NEED?
                    </label>
                    <p className="text-[11px] mb-3" style={{ color: "#888" }}>
                      Priced at £{CALL_OUT} call-out + £{form.service?.pricePerUnit} per {form.service?.unitLabel}. Select the quantity for your estimate.
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                        className="w-10 h-10 rounded font-bold text-lg flex items-center justify-center transition-all"
                        style={{ background: "#222", border: "1px solid #2e2e2e", color: "#f0f0f0" }}
                      >−</button>
                      <div className="text-center">
                        <div className="font-mono font-bold text-2xl" style={{ color: "#f0f0f0" }}>{form.quantity}</div>
                        <div className="text-[10px] font-mono" style={{ color: "#888" }}>{form.quantity === 1 ? form.service?.unitLabel : form.service?.unitLabelPlural}</div>
                      </div>
                      <button
                        onClick={() => setForm((f) => ({ ...f, quantity: Math.min(50, f.quantity + 1) }))}
                        className="w-10 h-10 rounded font-bold text-lg flex items-center justify-center transition-all"
                        style={{ background: "#222", border: "1px solid #2e2e2e", color: "#f0f0f0" }}
                      >+</button>
                      <div className="ml-4 px-4 py-2 rounded font-mono text-sm" style={{ background: "#222", border: "1px solid #2e2e2e", color: "#cccccc" }}>
                        £{CALL_OUT} + {form.quantity} × £{form.service?.pricePerUnit} = <strong>£{CALL_OUT + form.quantity * (form.service?.pricePerUnit ?? 0)}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-xs font-mono mb-3" style={{ color: "#888" }}>ROUGH JOB SIZE</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["small", "medium", "large"] as JobSize[]).map((s) => (
                      <button key={s} onClick={() => setForm((f) => ({ ...f, size: s }))} className="py-3 rounded text-sm font-display font-medium transition-all duration-150" style={{ background: form.size === s ? "#4a4a4a" : "#222", border: `1px solid ${form.size === s ? "#888" : "#2e2e2e"}`, color: "#f0f0f0" }}>
                        {SIZE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-mono mb-3" style={{ color: "#888" }}>TIMING</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([{ id: "flexible", label: "Flexible", sub: "Whenever suits" }, { id: "within-week", label: "This week", sub: "Within 5 days" }, { id: "urgent", label: "Urgent", sub: "ASAP / same day" }] as const).map((u) => (
                      <button key={u.id} onClick={() => setForm((f) => ({ ...f, urgency: u.id }))} className="py-3 px-2 rounded text-sm font-display font-medium transition-all duration-150" style={{ background: form.urgency === u.id ? (u.id === "urgent" ? "#ff4444" : "#4a4a4a") : "#222", border: `1px solid ${form.urgency === u.id ? (u.id === "urgent" ? "#ff4444" : "#888") : "#2e2e2e"}`, color: "#f0f0f0" }}>
                        <div>{u.label}</div>
                        <div className="text-[10px] font-mono mt-0.5" style={{ color: form.urgency === u.id ? "#333" : "#888" }}>{u.sub}</div>
                      </button>
                    ))}
                  </div>
                  {form.urgency === "urgent" && <div className="mt-2 text-xs font-mono" style={{ color: "#ff4444" }}>⚠ Urgent jobs may incur a call-out surcharge. JMJ will confirm pricing on approval.</div>}
                </div>
                <div className="mb-8">
                  <label className="block text-xs font-mono mb-2" style={{ color: "#888" }}>DESCRIBE THE JOB</label>
                  <textarea rows={4} placeholder="e.g. Circuit keeps tripping in the kitchen when using the microwave and kettle at the same time. 1970s brick home, no prior electrical work done recently." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded px-4 py-3 text-sm resize-none outline-none transition-all duration-150" style={{ background: "#222", border: "1px solid #2e2e2e", color: "#f0f0f0", fontFamily: "'Work Sans', sans-serif" }} onFocus={(e) => (e.target.style.borderColor = "#cccccc")} onBlur={(e) => (e.target.style.borderColor = "#2e2e2e")} />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] font-mono" style={{ color: "#888" }}>Minimum 10 characters</span>
                    <span className="text-[10px] font-mono" style={{ color: form.description.length > 10 ? "#22c55e" : "#888" }}>{form.description.length} chars</span>
                  </div>
                </div>
                {form.service && (
                  <div className="p-5 rounded mb-6 flex items-center justify-between" style={{ background: "#222", border: "1px solid #cccccc" }}>
                    <div>
                      <div className="text-xs font-mono mb-1" style={{ color: "#888" }}>INSTANT ESTIMATE</div>
                      <div className="font-display text-2xl font-bold" style={{ color: "#cccccc" }}>
                        £{estimate.toLocaleString()}
                        <span className="text-xs font-mono font-normal ml-2" style={{ color: "#888" }}>approx. inc. VAT</span>
                      </div>
                      <div className="text-[10px] font-mono mt-1" style={{ color: "#888" }}>{form.service.label} · {SIZE_LABELS[form.size]}</div>
                    </div>
                    <div className="text-xs font-mono px-3 py-2 rounded text-center" style={{ background: "#181818", border: "1px solid #2e2e2e", color: "#888", maxWidth: 140 }}>
                      Final price confirmed after JMJ Electrical reviews your job
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("service")} className="text-xs font-mono px-4 py-2 rounded" style={{ color: "#888", border: "1px solid #2e2e2e" }}>← Back</button>
                  <button disabled={!canProceed.details} onClick={() => setStep("photos")} className="px-6 py-3 rounded font-display font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#4a4a4a", color: "#f0f0f0" }}>Next: Upload Photos →</button>
                </div>
              </div>
            )}

            {/* STEP 3: Photos */}
            {step === "photos" && (
              <div>
                <h2 className="font-display font-bold text-xl mb-1" style={{ color: "#f0f0f0" }}>Upload photos</h2>
                <p className="text-xs mb-6" style={{ color: "#888" }}>Photos help JMJ Electrical give a more accurate quote. Optional but recommended.</p>
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="rounded-lg flex flex-col items-center justify-center py-12 mb-6 cursor-pointer transition-all duration-150" style={{ border: `2px dashed ${dragOver ? "#cccccc" : "#2e2e2e"}`, background: dragOver ? "rgba(245,196,0,0.06)" : "#222" }}>
                  <div className="text-3xl mb-3">📸</div>
                  <div className="font-display font-semibold text-sm mb-1" style={{ color: "#f0f0f0" }}>Drop photos here or click to browse</div>
                  <div className="text-xs font-mono" style={{ color: "#888" }}>JPG, PNG, HEIC up to 10 MB each · max 8 photos</div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addPhotos(e.target.files)} />
                </div>
                {form.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {form.photos.map((p) => (
                      <div key={p.id} className="relative group rounded overflow-hidden aspect-square" style={{ background: "#181818" }}>
                        <img src={p.preview} alt="Uploaded" className="w-full h-full object-cover" />
                        <button onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((x) => x.id !== p.id) }))} className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.8)", color: "#fff", border: "1px solid #2e2e2e" }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("details")} className="text-xs font-mono px-4 py-2 rounded" style={{ color: "#888", border: "1px solid #2e2e2e" }}>← Back</button>
                  <button onClick={() => setStep("contact")} className="px-6 py-3 rounded font-display font-semibold text-sm" style={{ background: "#4a4a4a", color: "#f0f0f0" }}>Next: Your Details →</button>
                </div>
              </div>
            )}

            {/* STEP 4: Contact */}
            {step === "contact" && (
              <div>
                <h2 className="font-display font-bold text-xl mb-1" style={{ color: "#f0f0f0" }}>Your contact details</h2>
                <p className="text-xs mb-6" style={{ color: "#888" }}>JMJ Electrical will review your job and be in touch within 24 business hours to confirm a time.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { key: "name", label: "FULL NAME", placeholder: "Sarah Mitchell", type: "text" },
                    { key: "email", label: "EMAIL", placeholder: "sarah@example.com", type: "email" },
                    { key: "address", label: "PROPERTY ADDRESS", placeholder: "12 High St, Swindon SN1 1AA", type: "text" },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                      <label className="block text-[10px] font-mono mb-2" style={{ color: "#888" }}>{label}</label>
                      <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full rounded px-4 py-3 text-sm outline-none transition-all duration-150" style={{ background: "#222", border: "1px solid #2e2e2e", color: "#f0f0f0", fontFamily: "'Work Sans', sans-serif" }} onFocus={(e) => (e.target.style.borderColor = "#cccccc")} onBlur={(e) => (e.target.style.borderColor = "#2e2e2e")} />
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded mb-6" style={{ background: "#222", border: "1px solid #2e2e2e" }}>
                  <div className="text-[10px] font-mono mb-3" style={{ color: "#888" }}>JOB SUMMARY</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><div className="text-[10px] font-mono mb-1" style={{ color: "#888" }}>SERVICE</div><div className="font-display font-semibold text-xs" style={{ color: "#f0f0f0" }}>{form.service?.icon} {form.service?.label}</div></div>
                    <div><div className="text-[10px] font-mono mb-1" style={{ color: "#888" }}>SIZE</div><div className="font-display font-semibold text-xs" style={{ color: "#f0f0f0" }}>{SIZE_LABELS[form.size]}</div></div>
                    <div><div className="text-[10px] font-mono mb-1" style={{ color: "#888" }}>TIMING</div><div className="font-display font-semibold text-xs" style={{ color: form.urgency === "urgent" ? "#ff4444" : "#f0f0f0" }}>{form.urgency === "flexible" ? "Flexible" : form.urgency === "within-week" ? "This week" : "⚠ Urgent"}</div></div>
                    <div><div className="text-[10px] font-mono mb-1" style={{ color: "#888" }}>ESTIMATE</div><div className="font-mono font-bold text-sm" style={{ color: "#cccccc" }}>£{estimate.toLocaleString()}</div></div>
                  </div>
                  {form.photos.length > 0 && <div className="mt-3 text-[10px] font-mono" style={{ color: "#888" }}>{form.photos.length} photo{form.photos.length !== 1 ? "s" : ""} attached</div>}
                </div>
                <div className="text-xs font-mono mb-6 p-3 rounded" style={{ background: "#181818", border: "1px solid #2e2e2e", color: "#888" }}>
                  By submitting, you agree to JMJ Electrical contacting you about this job. Your details are used only for job scheduling and never shared with third parties.
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep("photos")} className="text-xs font-mono px-4 py-2 rounded" style={{ color: "#888", border: "1px solid #2e2e2e" }}>← Back</button>
                  <button disabled={!canProceed.contact || submitting} onClick={handleSubmit} className="px-8 py-3 rounded font-display font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2" style={{ background: "#4a4a4a", color: "#f0f0f0" }}>
                    {submitting ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#0f0f0f" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" /></svg>Sending to JMJ...</>) : "Submit Job Request ⚡"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* SUCCESS */
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#4a4a4a" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16l8 8 12-12" stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="font-display font-extrabold text-3xl mb-3 tracking-tight" style={{ color: "#f0f0f0" }}>Job sent to JMJ Electrical</h2>
          <p className="text-sm mb-2" style={{ color: "#888", maxWidth: 440 }}>Thanks, <strong style={{ color: "#f0f0f0" }}>{form.name}</strong>. Your job request has been received and forwarded to our team for review.</p>
          <p className="text-sm mb-8" style={{ color: "#888", maxWidth: 440 }}>We'll be in touch at <strong style={{ color: "#cccccc" }}>{form.email}</strong> within 24 business hours.</p>
          <div className="p-6 rounded-lg w-full max-w-sm mb-8" style={{ background: "#181818", border: "1px solid #2e2e2e" }}>
            <div className="text-[10px] font-mono mb-4 text-left" style={{ color: "#888" }}>JOB REFERENCE</div>
            <div className="font-mono text-2xl font-bold mb-4" style={{ color: "#cccccc" }}>JMJ-{Math.random().toString(36).toUpperCase().slice(2, 8)}</div>
            <div className="text-left space-y-2">
              <div className="flex justify-between text-xs"><span style={{ color: "#888" }}>Service</span><span style={{ color: "#f0f0f0" }}>{form.service?.label}</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: "#888" }}>Address</span><span style={{ color: "#f0f0f0" }}>{form.address}</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: "#888" }}>Estimate</span><span style={{ color: "#cccccc" }} className="font-mono font-bold">£{estimate.toLocaleString()}</span></div>
            </div>
          </div>
          <button onClick={() => { setStep("service"); setForm({ service: null, quantity: 1, size: "small", description: "", urgency: "flexible", photos: [], name: "", email: "", phone: "", address: "" }); }} className="text-xs font-mono px-5 py-2.5 rounded" style={{ border: "1px solid #2e2e2e", color: "#888" }}>
            Submit another job
          </button>
        </div>
      )}
    </main>
  );
}

/* ── Root app ── */
export default function App() {
  const [page, setPage] = useState<Page>("booking");

  return (
    <div className="min-h-full" style={{ background: "#0f0f0f", fontFamily: "'Work Sans', sans-serif" }}>
      {/* Nav */}
      <header style={{ background: "#0f0f0f", borderBottom: "1px solid #2e2e2e" }} className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 relative flex items-center justify-between">
          {/* Logo — centred */}
          <button onClick={() => setPage("booking")} className="flex items-center">
            <img
              src={logo}
              alt="JMJ Electrical"
              className="h-36 w-auto object-contain"
              style={{ filter: "invert(1) contrast(3) brightness(0.7)", mixBlendMode: "screen" }}
            />
          </button>

          {/* Nav links — pinned right */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setPage("booking")}
              className="px-4 py-2 rounded text-xs font-mono transition-all duration-150"
              style={{
                background: page === "booking" ? "#4a4a4a" : "transparent",
                color: page === "booking" ? "#f0f0f0" : "#888",
                border: `1px solid ${page === "booking" ? "#666" : "transparent"}`,
              }}
            >
              Get a Quote
            </button>
            <button
              onClick={() => setPage("our-work")}
              className="px-4 py-2 rounded text-xs font-mono transition-all duration-150"
              style={{
                background: page === "our-work" ? "#4a4a4a" : "transparent",
                color: page === "our-work" ? "#f0f0f0" : "#888",
                border: `1px solid ${page === "our-work" ? "#666" : "transparent"}`,
              }}
            >
              Our Work
            </button>
          </nav>
        </div>
      </header>

      {page === "booking" ? (
        <BookingPage />
      ) : (
        <OurWorkPage onBook={() => setPage("booking")} />
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #2e2e2e" }} className="mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center gap-4 text-center">
          <img src={logo} alt="JMJ Electrical" className="h-24 object-contain opacity-60" style={{ filter: "invert(1) contrast(3) brightness(0.7)", mixBlendMode: "screen" }} />
          <div className="text-xs font-mono" style={{ color: "#888" }}>
            © 2023 JMJ Electrical · Licensed electricians · Swindon, England
          </div>
        </div>
      </footer>
    </div>
  );
}
