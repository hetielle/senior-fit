"use client";

import "./ExerciseSvg.css";

// Maps exercise names to animation keys
const EXERCISE_ANIMATION: Record<string, string> = {
  "Flexão de Braço Modificada": "pushup",
  "Rosca Direta com Halteres": "curl",
  "Tríceps no Banco": "dip",
  "Elevação Lateral": "lateral",
  "Agachamento na Cadeira": "squat",
  "Elevação de Panturrilha": "calf",
  "Extensão de Quadril": "hipext",
  "Marcha Estacionária": "march",
  "Prancha Modificada": "plank",
  "Ponte Glútea": "bridge",
  "Crunch Abdominal": "crunch",
  "Rotação de Tronco": "trunk",
  "Polichinelo Modificado": "jack",
  "Agachamento com Rosca": "squat",
  "Remada Curvada": "row",
  "Step Touch": "jack",
  "Alongamento de Pescoço": "neckstretch",
  "Alongamento de Ombros": "shoulderstretch",
  "Alongamento de Quadríceps": "quadstretch",
  "Alongamento de Isquiotibiais": "hamstretch",
  "Rotação de Tornozelo": "ankle",
};

type SvgProps = { className?: string };

// ── individual animations ────────────────────────────────────────────────────

function PushUp({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      {/* ground */}
      <line x1="10" y1="68" x2="110" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* body — rocks forward/back */}
      <g className="esvg-pushup-body">
        {/* head */}
        <circle cx="90" cy="42" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* torso */}
        <line x1="83" y1="48" x2="40" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* arms */}
        <line x1="72" y1="52" x2="72" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="57" x2="52" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* legs */}
        <line x1="40" y1="58" x2="30" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="58" x2="20" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function BicepsCurl({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      {/* ground */}
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* static body */}
      <circle cx="60" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="26" x2="60" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="62" x2="48" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="62" x2="72" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* right arm (static) */}
      <line x1="60" y1="38" x2="78" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* left arm — curls up */}
      <g className="esvg-curl-arm">
        <line x1="60" y1="38" x2="42" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="50" x2="38" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* dumbbell */}
        <rect x="33" y="63" width="10" height="4" rx="2" fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}

function Dip({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      {/* bench */}
      <rect x="15" y="60" width="90" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="66" x2="20" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="100" y1="66" x2="100" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* body — bobs up and down */}
      <g className="esvg-dip-body">
        <circle cx="60" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="60" y1="26" x2="60" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* arms on bench */}
        <line x1="60" y1="36" x2="30" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="36" x2="90" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* legs hanging */}
        <line x1="60" y1="52" x2="48" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="52" x2="72" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function LateralRaise({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="130" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="70" y1="24" x2="70" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="70" y1="62" x2="58" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="62" x2="82" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* arms — raise laterally */}
      <g className="esvg-lateral-arms">
        <line x1="70" y1="38" x2="40" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="37" cy="51" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="70" y1="38" x2="100" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="103" cy="51" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function Squat({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g className="esvg-squat-body">
        <circle cx="60" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="60" y1="24" x2="60" y2="55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="40" x2="40" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="40" x2="80" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="55" x2="46" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="80" x2="44" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="55" x2="74" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="74" y1="80" x2="76" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function CalfRaise({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* wall support */}
      <line x1="15" y1="10" x2="15" y2="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <g className="esvg-calf-body">
        <circle cx="60" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="60" y1="24" x2="60" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="36" x2="22" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="36" x2="78" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="58" x2="50" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="58" x2="70" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* feet — rise on tiptoe */}
        <line x1="50" y1="80" x2="46" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="80" x2="74" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function March({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="24" x2="60" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* static right arm */}
      <line x1="60" y1="36" x2="78" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* static right leg */}
      <line x1="60" y1="58" x2="72" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="82" x2="74" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* left knee raises */}
      <g className="esvg-march-knee">
        <line x1="60" y1="36" x2="42" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="58" x2="50" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="72" x2="46" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Plank({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 80" className={className} aria-hidden>
      <line x1="10" y1="68" x2="130" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* static plank — subtle pulse on torso */}
      <circle cx="112" cy="46" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <g className="esvg-plank-body">
        <line x1="106" y1="51" x2="30" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* forearms */}
        <line x1="85" y1="53" x2="82" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="56" x2="52" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* feet */}
        <line x1="30" y1="58" x2="20" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="58" x2="12" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function GluteBridge({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      <line x1="10" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g className="esvg-bridge-hips">
        {/* head on ground */}
        <circle cx="18" cy="62" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* torso arches up */}
        <line x1="24" y1="66" x2="70" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* arms flat */}
        <line x1="40" y1="60" x2="36" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="54" x2="52" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* legs bent, feet on ground */}
        <line x1="70" y1="46" x2="90" y2="68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="90" y1="68" x2="95" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="46" x2="108" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="108" y1="60" x2="115" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Crunch({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      <line x1="10" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* legs on ground — static */}
      <line x1="60" y1="62" x2="90" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="70" x2="110" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="62" x2="80" y2="74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="80" y1="74" x2="98" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* upper body curls up */}
      <g className="esvg-crunch-upper">
        <line x1="60" y1="62" x2="36" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="54" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* arms reaching forward */}
        <line x1="50" y1="60" x2="66" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function TrunkRotation({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* seated figure — chair */}
      <rect x="40" y="60" width="40" height="5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="42" y1="65" x2="42" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="78" y1="65" x2="78" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="28" x2="60" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="60" x2="48" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="60" x2="72" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* arms swing side to side */}
      <g className="esvg-trunk-arms">
        <line x1="60" y1="38" x2="32" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="38" x2="88" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function JumpingJack({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="22" x2="60" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* arms + legs open/close */}
      <g className="esvg-jack-limbs">
        <line x1="60" y1="34" x2="28" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="34" x2="92" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="58" x2="36" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="82" x2="34" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="58" x2="84" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="82" x2="86" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function BentOverRow({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      <line x1="10" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* torso bent forward */}
      <circle cx="108" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="101" y1="33" x2="50" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* legs */}
      <line x1="75" y1="42" x2="70" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="68" x2="68" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="75" y1="42" x2="88" y2="66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="88" y1="66" x2="90" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* arms pull up */}
      <g className="esvg-row-arms">
        <line x1="90" y1="37" x2="68" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="52" x2="52" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* dumbbell */}
        <rect x="45" y="55" width="12" height="5" rx="2" fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}

function HipExtension({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      <line x1="10" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* standing figure holding chair */}
      <rect x="95" y="40" width="30" height="5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="97" y1="45" x2="97" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="123" y1="45" x2="123" y2="80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="58" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="58" y1="22" x2="58" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="36" x2="95" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* standing leg */}
      <line x1="58" y1="58" x2="50" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* extending leg swings back */}
      <g className="esvg-hipext-leg">
        <line x1="58" y1="58" x2="68" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="68" y1="72" x2="58" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function NeckStretch({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* head tilts */}
      <g className="esvg-neck-head">
        <circle cx="60" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <line x1="60" y1="24" x2="60" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="36" x2="40" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="36" x2="80" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="62" x2="48" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="62" x2="72" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShoulderStretch({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="24" x2="60" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="62" x2="48" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="62" x2="72" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* right arm crosses chest */}
      <g className="esvg-shoulder-arm">
        <line x1="60" y1="36" x2="82" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="82" y1="46" x2="40" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* left arm holds it */}
      <line x1="60" y1="36" x2="36" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function QuadStretch({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="55" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="55" y1="22" x2="55" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* arm holding wall */}
      <line x1="55" y1="36" x2="20" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="36" x2="72" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* standing leg */}
      <line x1="55" y1="58" x2="48" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* bent leg pulled back */}
      <g className="esvg-quad-leg">
        <line x1="55" y1="58" x2="65" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="70" x2="68" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function HamStretch({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      <line x1="10" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* seated figure reaching forward */}
      <g className="esvg-ham-reach">
        <circle cx="28" cy="46" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="34" y1="50" x2="68" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* arms reach to toe */}
        <line x1="48" y1="54" x2="90" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* leg extended */}
        <line x1="68" y1="58" x2="108" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="108" y1="60" x2="112" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* bent leg */}
        <line x1="68" y1="58" x2="72" y2="80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function AnkleRotation({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <line x1="10" y1="90" x2="110" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* seated */}
      <rect x="30" y="54" width="60" height="5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="32" y1="59" x2="32" y2="78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="88" y1="59" x2="88" y2="78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="26" x2="60" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="40" x2="42" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="40" x2="78" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* one leg extended, foot rotating */}
      <line x1="60" y1="54" x2="48" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="54" x2="72" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g className="esvg-ankle-foot">
        <line x1="72" y1="68" x2="82" y2="76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="82" y1="76" x2="86" y2="86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ── registry ──────────────────────────────────────────────────────────────────

const COMPONENTS: Record<string, (props: SvgProps) => React.JSX.Element> = {
  pushup: PushUp,
  curl: BicepsCurl,
  dip: Dip,
  lateral: LateralRaise,
  squat: Squat,
  calf: CalfRaise,
  hipext: HipExtension,
  march: March,
  plank: Plank,
  bridge: GluteBridge,
  crunch: Crunch,
  trunk: TrunkRotation,
  jack: JumpingJack,
  row: BentOverRow,
  neckstretch: NeckStretch,
  shoulderstretch: ShoulderStretch,
  quadstretch: QuadStretch,
  hamstretch: HamStretch,
  ankle: AnkleRotation,
};

export function ExerciseSvg({ exerciseName }: { exerciseName: string }) {
  const key = EXERCISE_ANIMATION[exerciseName];
  if (!key) return null;
  const Component = COMPONENTS[key];
  if (!Component) return null;
  return <Component className="exercise-svg" />;
}
