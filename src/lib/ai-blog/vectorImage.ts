import sharp from 'sharp'

import { SERVICE_NAMES, type ServiceCategory } from './serviceCategory'

export type VectorImageInput = {
  title: string
  slug: string
  serviceCategory: ServiceCategory
}

type Palette = {
  wallA: string
  wallB: string
  floorA: string
  floorB: string
  accent: string
  accentDark: string
  secondary: string
  ink: string
}

const PALETTES: Record<ServiceCategory, Palette[]> = {
  furniture: [
    { wallA: '#ffddb4', wallB: '#f9c6ac', floorA: '#d9bfa8', floorB: '#af8465', accent: '#f19a28', accentDark: '#9f4919', secondary: '#4b913c', ink: '#332e2b' },
    { wallA: '#8dd5ce', wallB: '#d4eee0', floorA: '#c7ae91', floorB: '#98775d', accent: '#ef704e', accentDark: '#7f3d2c', secondary: '#168268', ink: '#29332e' },
    { wallA: '#a9bfee', wallB: '#e8d6fa', floorA: '#c7b39e', floorB: '#927b67', accent: '#ee9140', accentDark: '#78422d', secondary: '#6a9e35', ink: '#302d3c' },
  ],
  roofing: [
    { wallA: '#65bde7', wallB: '#daefff', floorA: '#9fc956', floorB: '#668552', accent: '#e96538', accentDark: '#793522', secondary: '#227eab', ink: '#26343c' },
    { wallA: '#ffbf78', wallB: '#ffe6c7', floorA: '#abd45f', floorB: '#71865d', accent: '#d74e39', accentDark: '#682d27', secondary: '#197d91', ink: '#352e2c' },
    { wallA: '#91ace8', wallB: '#d9e7fa', floorA: '#92bd69', floorB: '#6e8061', accent: '#b75e51', accentDark: '#483833', secondary: '#376aaa', ink: '#29343d' },
  ],
  plumbing: [
    { wallA: '#80d8d6', wallB: '#d1f3e8', floorA: '#b5c7c6', floorB: '#778f91', accent: '#008fa8', accentDark: '#176070', secondary: '#f5a237', ink: '#26353a' },
    { wallA: '#99b7ef', wallB: '#fce0c6', floorA: '#b6c1d2', floorB: '#78889d', accent: '#426fce', accentDark: '#294b77', secondary: '#ef8153', ink: '#29313c' },
    { wallA: '#93d6b6', wallB: '#edf4bf', floorA: '#abc6bd', floorB: '#6f9188', accent: '#008c78', accentDark: '#145e55', secondary: '#eeb33e', ink: '#273633' },
  ],
}

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

// Reusable foliage adds organic detail without external artwork or image APIs.
function plant(x: number, y: number, scale: number, p: Palette) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke-linecap="round">
    <path d="M0 0Q-10-65-40-105M0 0Q8-88 35-128M0 0Q46-53 70-70" fill="none" stroke="#326844" stroke-width="4"/>
    ${[[-36,-91,-55],[-22,-61,-48],[-8,-30,-48],[17,-76,35],[30,-110,30],[37,-40,50],[64,-65,55]].map(([cx,cy,r],i) => `<ellipse cx="${cx}" cy="${cy}" rx="12" ry="24" transform="rotate(${r} ${cx} ${cy})" fill="${['#387c43','#69a344','#91bc50'][i%3]}"/><path d="M${cx} ${cy-14}v28" transform="rotate(${r} ${cx} ${cy})" stroke="#c0d682" stroke-width="1" opacity=".5"/>`).join('')}
    <path d="M-32 0h64l-7 55h-50z" fill="${p.accent}" stroke="${p.ink}" stroke-width="3"/><path d="M-22 8h10l4 40h-8z" fill="#ffe0a6" opacity=".45"/>
  </g>`
}

function furnitureScene(p: Palette, title: string) {
  const storage = /storage|cabinet|wardrobe|shel/i.test(title)
  const table = /table|dining|desk|office/i.test(title)
  const centrepiece = storage
    ? `<g filter="url(#shadow)" stroke="${p.ink}" stroke-width="5"><rect x="430" y="236" width="340" height="250" rx="12" fill="#e8c99f"/><path d="M600 236v250M430 324h340M430 407h340"/><circle cx="580" cy="279" r="7" fill="${p.accent}"/><circle cx="620" cy="279" r="7" fill="${p.accent}"/><path d="M455 486v35M745 486v35" stroke-width="10"/></g>`
    : table
      ? `<g filter="url(#shadow)" stroke="${p.ink}" stroke-width="5"><ellipse cx="600" cy="389" rx="220" ry="58" fill="url(#wood)"/><path d="M487 431l-45 126M713 431l45 126" stroke-width="13"/><path d="M340 343q0-40 38-40h55q35 0 35 40v100H340z" fill="${p.accent}"/><path d="M732 343q0-40 38-40h55q35 0 35 40v100H732z" fill="${p.accent}"/></g>`
      : `<g filter="url(#shadow)" stroke="${p.ink}" stroke-width="5"><rect x="306" y="283" width="590" height="188" rx="44" fill="url(#sofa)"/><path d="M351 303q0-33 34-33h142q34 0 34 33v108H351zM565 303q0-33 34-33h143q34 0 34 33v108H565z" fill="#f7ead9"/><path d="M306 341q0-34 34-34h28q24 0 24 28v116h-86zM810 335q0-28 25-28h28q33 0 33 34v110h-86z" fill="#ead6bf"/><path d="M357 410h430q30 0 30 29v42H332v-42q0-29 25-29z" fill="#e2cbb1"/><path d="M370 478l-8 50M780 478l8 50" stroke-width="11"/><path d="M384 306q48-14 82 17l-15 80q-47 13-83-15z" fill="#efba4f"/><path d="M666 306q48-14 82 17l-15 80q-47 13-83-15z" fill="${p.accent}" opacity=".95"/></g>`

  return `<g>
    <g stroke="${p.ink}" stroke-width="7" fill="none"><path d="M48 0v448M184 0v448M48 108h136M48 232h136M48 354h136"/></g>
    <g fill="${p.accentDark}" stroke="${p.ink}" stroke-width="4"><rect x="23" y="96" width="204" height="18" rx="4"/><rect x="23" y="220" width="204" height="18" rx="4"/><rect x="23" y="342" width="204" height="18" rx="4"/></g>
    <g fill="${p.secondary}" stroke="${p.ink}" stroke-width="2"><ellipse cx="76" cy="58" rx="17" ry="33" transform="rotate(-25 76 58)"/><ellipse cx="112" cy="66" rx="17" ry="36" transform="rotate(18 112 66)"/><ellipse cx="146" cy="52" rx="16" ry="32" transform="rotate(31 146 52)"/><ellipse cx="83" cy="175" rx="17" ry="34" transform="rotate(-25 83 175)"/><ellipse cx="121" cy="170" rx="17" ry="36" transform="rotate(24 121 170)"/></g>
    <g filter="url(#shadow)"><rect x="467" y="52" width="190" height="170" rx="3" fill="${p.ink}"/><rect x="482" y="67" width="160" height="140" fill="#ffd079"/><path d="M482 169l53-55 43 29 36-62 28 29v97H482z" fill="${p.accent}"/><path d="M482 67h160l-70 76-37-29-53 55z" fill="#287eaa"/></g>
    <g stroke="${p.ink}" stroke-width="4" filter="url(#shadow)"><path d="M1015 345q0-35 30-35h66q30 0 30 35v65h-126z" fill="${p.accent}"/><path d="M1020 400h118v25h-118z" fill="#efb44b"/><path d="M1030 425l-13 80M1126 425l13 80" stroke-width="7"/></g>
    ${plant(1075, 266, .72, p)}
    <g stroke="${p.ink}" stroke-width="2"><path d="M75 335v-70h22v70z" fill="#df7659"/><path d="M101 335v-60h18v60z" fill="#e6bc57"/><path d="M125 335l14-68 20 5-14 63z" fill="#368c9c"/></g>
    ${centrepiece}
    <g stroke="${p.ink}" stroke-width="6" fill="none"><path d="M930 150l-44 373M930 150l46 373M930 150v373"/></g>
    <g fill="${p.ink}"><circle cx="890" cy="123" r="30"/><circle cx="932" cy="105" r="31"/><circle cx="975" cy="124" r="30"/><circle cx="930" cy="153" r="28"/></g>
    <g fill="#ffd18a"><circle cx="890" cy="123" r="16"/><circle cx="932" cy="105" r="17"/><circle cx="975" cy="124" r="16"/><circle cx="930" cy="153" r="15"/></g>
    <g filter="url(#shadow)" stroke="${p.accentDark}" stroke-width="4"><ellipse cx="530" cy="510" rx="106" ry="34" fill="#e69a48"/><path d="M424 510v90q106 42 212 0v-90q-106 36-212 0z" fill="url(#wood)"/><ellipse cx="699" cy="529" rx="88" ry="29" fill="#dc8739"/><path d="M611 529v76q88 36 176 0v-76q-88 31-176 0z" fill="url(#wood)"/></g>
    <g stroke="${p.ink}" stroke-width="2"><rect x="475" y="480" width="66" height="10" rx="2" fill="#f8deab"/><rect x="483" y="471" width="60" height="9" rx="2" fill="#339caa"/><path d="M554 456h27v28q-13 10-27 0z" fill="#344c5e"/><path d="M581 460q18 0 12 13-3 7-12 7" fill="none"/></g>
    ${plant(701, 501, .52, p)}
    <path d="M440 545v46M451 548v47M469 551v46M489 554v45M630 560v34M644 563v35M663 566v33" stroke="#ffe2ac" stroke-width="2" opacity=".3"/>
  </g>`
}

function roofingScene(p: Palette, title: string) {
  const rainy = /rain|storm|gutter|leak|wet/i.test(title)
  const ladder = /inspect|repair|maintenance/i.test(title)
  return `<g>
    <circle cx="1040" cy="105" r="61" fill="#ffd57b" opacity="${rainy ? '.25' : '.95'}"/>
    <g fill="#fff" opacity=".82"><ellipse cx="180" cy="115" rx="78" ry="34"/><ellipse cx="245" cy="107" rx="64" ry="42"/><ellipse cx="308" cy="120" rx="75" ry="31"/></g>
    ${rainy ? `<g stroke="${p.secondary}" stroke-width="7" opacity=".7"><path d="M150 160l-18 42M230 156l-18 42M310 164l-18 42M1010 160l-18 42M1080 165l-18 42"/></g>` : ''}
    <g filter="url(#shadow)" stroke="${p.ink}" stroke-width="6">
      <path d="M205 330L600 100l395 230v244H205z" fill="#f0d7b6"/>
      <path d="M145 344L600 78l455 266-50 55-405-236-405 236z" fill="${p.accent}"/>
      <path d="M207 331l393-229 393 229" fill="none" stroke="${p.accentDark}" stroke-width="18"/>
      <g clip-path="url(#roofSurface)" stroke="${p.accentDark}" stroke-width="3" opacity=".72"><path d="M236 315l728 0M280 288l640 0M327 260l546 0M375 232l450 0M422 204l356 0M470 176l260 0"/><path d="M280 288l-27 27M365 260l-28 28M450 232l-28 28M535 204l-28 28M620 176l-28 28M705 204l28 28M790 232l28 28M875 260l28 28"/></g>
      <rect x="272" y="368" width="656" height="206" fill="#f5dfc4"/>
      <rect x="475" y="406" width="160" height="168" fill="${p.secondary}"/>
      <rect x="690" y="398" width="155" height="112" fill="#b8d5df"/>
      <path d="M767 398v112M690 454h155" stroke-width="4"/>
      <path d="M165 360h870" stroke="${p.ink}" stroke-width="15"/>
      <path d="M1004 359v204" stroke="${p.ink}" stroke-width="18"/>
    </g>
    ${ladder ? `<g stroke="#e5d7b7" stroke-width="11"><path d="M850 260L710 601M910 294L770 620"/><path d="M832 310l58 25M813 356l58 25M794 402l58 25M775 448l58 25M756 494l58 25M737 540l58 25" stroke-width="7"/></g>` : ''}
    ${plant(1090, 515, .9, p)}
    <circle cx="610" cy="492" r="6" fill="#fbc15b"/>
    <path d="M700 410l50 0-50 65zM777 410h55l-55 80z" fill="#ffffff" opacity=".4"/>
    <g transform="translate(72 470)" filter="url(#shadow)"><rect width="190" height="92" rx="17" fill="${p.secondary}" stroke="${p.ink}" stroke-width="5"/><path d="M52 0q0-47 43-47t43 47" fill="none" stroke="${p.ink}" stroke-width="9"/><path d="M25 36h140" stroke="#fff" stroke-width="6" opacity=".55"/></g>
  </g>`
}

function plumbingScene(p: Palette, title: string) {
  const shower = /shower|pressure|hot water/i.test(title)
  const pipe = /pipe|drain|sewer|blocked/i.test(title)
  return `<g>
    <g opacity=".18" fill="${p.accent}"><rect x="0" y="112" width="150" height="112"/><rect x="450" y="0" width="150" height="112"/><rect x="750" y="224" width="150" height="112"/><rect x="1050" y="112" width="150" height="112"/></g>
    <g stroke="#fff" stroke-width="3" opacity=".55"><path d="M0 112h1200M0 224h1200M0 336h1200M150 0v448M300 0v448M450 0v448M600 0v448M750 0v448M900 0v448M1050 0v448"/></g>
    <g filter="url(#shadow)" stroke="${p.ink}" stroke-width="6">
      <rect x="110" y="78" width="286" height="260" rx="18" fill="#edf6f4"/><rect x="133" y="101" width="240" height="214" rx="8" fill="#9cc8ce"/>
      <rect x="132" y="360" width="365" height="178" rx="12" fill="#dfb27c"/><path d="M315 360v178"/>
      <ellipse cx="315" cy="352" rx="213" ry="50" fill="#f7f3e9"/><ellipse cx="315" cy="353" rx="115" ry="25" fill="#a7d0d4"/>
      <path d="M294 324v-56q0-38 38-38h54" fill="none" stroke="${p.accent}" stroke-width="16"/><path d="M370 230v38" stroke="${p.accent}" stroke-width="16"/>
    </g>
    ${shower ? `<g stroke="${p.ink}" stroke-width="8" fill="none"><path d="M835 90v75h95"/><path d="M878 165q42 0 74 35"/><path d="M930 204l-54 44"/></g><g stroke="${p.accent}" stroke-width="7" opacity=".72"><path d="M895 248l-15 43M925 249l-15 43M955 245l-15 43M985 235l-15 43"/></g>` : `<g filter="url(#shadow)" stroke="${p.ink}" stroke-width="6"><rect x="760" y="96" width="290" height="205" rx="12" fill="#edf3f2"/><path d="M790 255q115-75 230 0" fill="none" stroke="${p.accent}" stroke-width="18"/><circle cx="905" cy="196" r="35" fill="${p.secondary}"/></g>`}
    <g filter="url(#shadow)" stroke="${p.ink}" stroke-width="6"><rect x="689" y="350" width="395" height="190" rx="18" fill="#f6f1e7"/><path d="M713 394h347M713 458h347" opacity=".35"/><path d="M855 350v190" opacity=".35"/></g>
    ${pipe ? `<g fill="none" stroke="${p.accent}" stroke-width="30"><path d="M590 80v132h120v110H590v190"/></g><g fill="none" stroke="#d8f3f3" stroke-width="5" opacity=".6"><path d="M590 80v132h120v110H590v190"/></g>` : `<g transform="translate(585 286)"><path d="M0 80c19-43 39-64 64-86M32 82c1-39-9-58-24-77M62 82c18-31 36-45 61-49" fill="none" stroke="#416b46" stroke-width="7"/><g fill="#5e914f"><ellipse cx="14" cy="24" rx="17" ry="31" transform="rotate(-34 14 24)"/><ellipse cx="67" cy="9" rx="17" ry="31" transform="rotate(39 67 9)"/><ellipse cx="105" cy="35" rx="16" ry="29" transform="rotate(59 105 35)"/></g><path d="M7 78h93l-14 72H21z" fill="${p.secondary}" stroke="${p.ink}" stroke-width="5"/></g>`}
    <path d="M149 114h77l-77 152zM262 114h39l-65 185h-39z" fill="#fff" opacity=".3"/>
    <g stroke="${p.ink}" stroke-width="2"><rect x="746" y="323" width="124" height="24" rx="7" fill="${p.secondary}"/><rect x="754" y="304" width="113" height="19" rx="6" fill="#f6c95c"/><rect x="967" y="310" width="32" height="38" rx="6" fill="${p.accent}"/><path d="M983 309v-14h20" fill="none" stroke-width="5"/></g>
    <g transform="translate(84 519)" filter="url(#shadow)"><rect width="220" height="70" rx="16" fill="${p.accent}" stroke="${p.ink}" stroke-width="5"/><path d="M65 0q0-45 45-45t45 45" fill="none" stroke="${p.ink}" stroke-width="9"/><path d="M30 35h160" stroke="#fff" stroke-width="6" opacity=".58"/></g>
  </g>`
}

export function createVectorCoverSVG(input: VectorImageInput) {
  const palettes = PALETTES[input.serviceCategory]
  const p = palettes[hash(input.slug) % palettes.length]
  const scene = input.serviceCategory === 'furniture'
    ? furnitureScene(p, input.title)
    : input.serviceCategory === 'roofing'
      ? roofingScene(p, input.title)
      : plumbingScene(p, input.title)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <clipPath id="roofSurface"><path d="M145 344L600 78l455 266-50 55-405-236-405 236z"/></clipPath>
      <radialGradient id="sunlight"><stop stop-color="#fff0ac" stop-opacity=".65"/><stop offset="1" stop-color="#ffcc6c" stop-opacity="0"/></radialGradient>
      <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.wallA}"/><stop offset="1" stop-color="${p.wallB}"/></linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${p.floorA}"/><stop offset="1" stop-color="${p.floorB}"/></linearGradient>
      <linearGradient id="sofa" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffaf3"/><stop offset="1" stop-color="#e5d2bd"/></linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.accent}"/><stop offset="1" stop-color="${p.accentDark}"/></linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="175%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="${p.ink}" flood-opacity=".22"/></filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="${hash(input.slug) % 97}"/><feColorMatrix type="saturate" values="0"/></filter>
      <pattern id="rug" width="58" height="58" patternUnits="userSpaceOnUse"><rect width="58" height="58" fill="${p.floorB}"/><path d="M0 29h58M29 0v58M0 0l58 58M58 0L0 58" stroke="${p.floorA}" stroke-width="2" opacity=".42"/></pattern>
    </defs>
    <rect width="1200" height="450" fill="url(#wall)"/><path d="M0 0h430L145 450H0z" fill="#fff1c9" opacity=".18"/><path d="M1200 0H830l210 450h160z" fill="${p.accent}" opacity=".08"/>
    <rect y="450" width="1200" height="180" fill="url(#floor)"/><path d="M0 450h1200" stroke="${p.ink}" stroke-width="5" opacity=".28"/><path d="M0 540l600-90 600 90v90H0z" fill="url(#rug)" opacity=".65"/>
    <ellipse cx="970" cy="155" rx="340" ry="310" fill="url(#sunlight)"/>
    ${scene}
    <rect width="1200" height="630" filter="url(#grain)" opacity=".035"/>
    <g transform="translate(962 562)"><rect width="192" height="42" rx="21" fill="#fffaf1" opacity=".95"/><circle cx="23" cy="21" r="8" fill="${p.accent}"/><text x="42" y="27" font-family="DejaVu Sans, sans-serif" font-size="16" font-weight="700" letter-spacing="1.1" fill="${p.ink}">${SERVICE_NAMES[input.serviceCategory].toUpperCase()}</text></g>
  </svg>`
}

export async function generateVectorImage(input: VectorImageInput) {
  const svg = createVectorCoverSVG(input)
  const data = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
  return { data, mimeType: 'image/png' }
}
