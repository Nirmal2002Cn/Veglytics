// ------------------------------
// 1) IMPORT LOCAL IMAGES
// ------------------------------
import tomato from "../assets/veggies/tomato.jpg";
import cucumber from "../assets/veggies/cucumber.jpg";
import carrot from "../assets/veggies/carrot.jpg";
import ashPlantains from "../assets/veggies/ash_Plantains.jpg";
import beans from "../assets/veggies/beans.jpg";
import beetroot from "../assets/veggies/beetroot.webp";
import bigOnion from "../assets/veggies/big_onion.jpg";
import bitterGourd from "../assets/veggies/bitterGourd.jpg";
import brinjals from "../assets/veggies/brinjals.jpg";
import cabbage from "../assets/veggies/cabbage.avif";
import capsicum from "../assets/veggies/capsicum.webp";
import eggplant from "../assets/veggies/eggplant.jpg";
import greenChillies from "../assets/veggies/greenChillies.webp";
import knolkhol from "../assets/veggies/knolkhol.jpg";
import ladiesFingers from "../assets/veggies/ladisFingers.jpg";
import leeks from "../assets/veggies/leeks.jpg";
import lime from "../assets/veggies/Lime.jpg";
import longBeans from "../assets/veggies/longBeans.jpg";
import potato from "../assets/veggies/Potato.jpg";
import pumpkin from "../assets/veggies/pumpkin.jpg";
import radish from "../assets/veggies/raddish.jpg";
import snakeGourd from "../assets/veggies/snakeGourd.jpg";
import luffa from "../assets/veggies/luffa.jpg";
import sweetPotato from "../assets/veggies/sweet_potato.jpg";

// fallback image
import fallback from "../assets/veggies/default.webp";

// ------------------------------
// 2) SINHALA -> ENGLISH ALIASES
// ------------------------------
const SI_ALIASES = [
  { keys: ["තක්කාලි"], to: "tomato" },
  { keys: ["පිපිඤ්ඤා"], to: "cucumber" },
  { keys: ["කැරට්"], to: "carrot" },
  { keys: ["බෝංචි", "දිග බෝංචි", "මෑකරල්"], to: "long beans" },
  { keys: ["බීට්", "බීට්රූට්"], to: "beetroot" },
  { keys: ["ලූනු", "ලොකු ලූනු"], to: "big onion" },
  { keys: ["කරවිල"], to: "bitter gourd" },
  { keys: ["වම්බටු"], to: "brinjal" },
  { keys: ["ගෝවා"], to: "cabbage" },
  { keys: ["අමු මිරිස්", "මිරිස්"], to: "green chillies" },
  { keys: ["කොල්රාබි", "නෝල්කෝල්"], to: "knolkhol" },
  { keys: ["බණ්ඩක්කා"], to: "ladies fingers" },
  { keys: ["ලීක්", "ලීක්ස්"], to: "leeks" },
  { keys: ["දෙහි"], to: "lime" },
  { keys: ["අල"], to: "potato" },
  { keys: ["බතල", "මිහිරි අල"], to: "sweet potato" },
  { keys: ["වට්ටක්කා"], to: "pumpkin" },
  { keys: ["රාබු"], to: "radish" },
  { keys: ["පතෝල"], to: "snake gourd" },
  { keys: ["අළු කෙසෙල්"], to: "ash plantains" },
];

// ------------------------------
// 3) ENGLISH KEYWORD -> IMAGE MAP
// ------------------------------
const MAP = [
  { keys: ["tomato"], src: tomato },
  { keys: ["cucumber"], src: cucumber },
  { keys: ["carrot"], src: carrot },
  { keys: ["ash plantains"], src: ashPlantains },
  { keys: ["long beans"], src: longBeans },
  { keys: ["beans"], src: beans },
  { keys: ["beetroot"], src: beetroot },
  { keys: ["big onion", "red onion"], src: bigOnion },
  { keys: ["bitter gourd"], src: bitterGourd },
  { keys: ["brinjal"], src: brinjals },
  { keys: ["eggplant"], src: eggplant },
  { keys: ["cabbage"], src: cabbage },
  { keys: ["capsicum", "bell pepper"], src: capsicum },
  { keys: ["green chillies"], src: greenChillies },
  { keys: ["knolkhol", "kohlrabi"], src: knolkhol },
  { keys: ["ladies fingers", "okra"], src: ladiesFingers },
  { keys: ["leeks"], src: leeks },
  { keys: ["lime"], src: lime },
  { keys: ["potato"], src: potato },
  { keys: ["sweet potato"], src: sweetPotato },
  { keys: ["pumpkin"], src: pumpkin },
  { keys: ["radish"], src: radish },
  { keys: ["snake gourd"], src: snakeGourd },
  { keys: ["luffa"], src: luffa },
];

// ------------------------------
// 4) HELPERS
// ------------------------------
function normalizeName(text = "") {
  return String(text).toLowerCase().replace(/\s+/g, " ").trim();
}

function applySinhalaAliases(name) {
  for (const a of SI_ALIASES) {
    if (a.keys.some((k) => name.includes(k))) {
      return a.to;
    }
  }
  return name;
}

// ------------------------------
// 5) MAIN FUNCTION
// ------------------------------
export function getVegImage(commodity = "") {
  let name = normalizeName(commodity);
  name = applySinhalaAliases(name);

  const found = MAP.find((x) => x.keys.some((k) => name.includes(k)));
  return found ? found.src : fallback;
}
