import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const output = path.resolve(process.argv[2] || 'material-mate-sofa-prototype.png')
const svgOutput = output.replace(/\.[^.]+$/, '.svg')

const svg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f8e7d7"/>
      <stop offset="0.52" stop-color="#f6eee7"/>
      <stop offset="1" stop-color="#e7d7c8"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d8bea6"/>
      <stop offset="1" stop-color="#b98f6d"/>
    </linearGradient>
    <linearGradient id="sofa" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fffaf3"/>
      <stop offset="1" stop-color="#e5d2bd"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#dc8730"/>
      <stop offset="1" stop-color="#a94f15"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="#38271f" flood-opacity=".22"/>
    </filter>
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="17" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="gray"/>
      <feBlend in="SourceGraphic" in2="gray" mode="soft-light"/>
    </filter>
    <pattern id="rug" width="56" height="56" patternUnits="userSpaceOnUse">
      <rect width="56" height="56" fill="#887966"/>
      <path d="M0 28h56M28 0v56" stroke="#b6a38d" stroke-width="2" opacity=".55"/>
      <path d="M0 0l56 56M56 0L0 56" stroke="#6f6254" stroke-width="1" opacity=".35"/>
    </pattern>
  </defs>

  <rect width="1200" height="445" fill="url(#wall)"/>
  <path d="M0 0h430L140 445H0z" fill="#ffd9a7" opacity=".2"/>
  <path d="M1200 0H825l215 445h160z" fill="#f0b86f" opacity=".12"/>
  <path d="M395 0h250L580 445H190z" fill="#fff" opacity=".18"/>
  <rect y="445" width="1200" height="185" fill="url(#floor)"/>
  <path d="M0 445h1200" stroke="#6d5546" stroke-width="5" opacity=".38"/>
  <path d="M0 535L600 445l600 90v95H0z" fill="url(#rug)" opacity=".92"/>

  <!-- Window and shelving -->
  <g stroke="#2d2c2b" stroke-width="8" fill="none">
    <path d="M48 0v445M184 0v445M48 103h136M48 228h136M48 350h136"/>
    <path d="M20 0h205"/>
  </g>
  <g fill="#9f5523" stroke="#3c3028" stroke-width="4">
    <rect x="24" y="91" width="202" height="18" rx="4"/>
    <rect x="24" y="216" width="202" height="18" rx="4"/>
    <rect x="24" y="338" width="202" height="18" rx="4"/>
  </g>
  <g fill="#456d2a" stroke="#29451e" stroke-width="2">
    <ellipse cx="77" cy="52" rx="18" ry="34" transform="rotate(-24 77 52)"/>
    <ellipse cx="112" cy="63" rx="17" ry="37" transform="rotate(18 112 63)"/>
    <ellipse cx="144" cy="49" rx="16" ry="34" transform="rotate(30 144 49)"/>
    <ellipse cx="71" cy="156" rx="18" ry="32" transform="rotate(-32 71 156)"/>
    <ellipse cx="105" cy="173" rx="17" ry="36" transform="rotate(19 105 173)"/>
    <ellipse cx="139" cy="155" rx="15" ry="30" transform="rotate(33 139 155)"/>
  </g>
  <g fill="#bd6d2d" stroke="#4c382a" stroke-width="3">
    <path d="M64 91h97l-10-38H74z"/>
    <path d="M67 216h85l-9-37H76z"/>
  </g>

  <!-- Art and small plants -->
  <g filter="url(#shadow)">
    <rect x="443" y="52" width="205" height="174" rx="3" fill="#292d31"/>
    <rect x="458" y="67" width="175" height="144" fill="#e8c998"/>
    <path d="M458 170l56-56 45 30 40-65 34 31v101H458z" fill="#cf7b39"/>
    <path d="M458 67h175l-76 77-43-30-56 56z" fill="#7892a2"/>
    <path d="M540 67l40 45-23 32-43-30z" fill="#f6e9d3"/>
  </g>
  <g transform="translate(692 190)">
    <path d="M0 55c18-38 37-46 60-56M23 55c3-38-8-57-19-72M42 55c16-26 28-35 49-40" fill="none" stroke="#365928" stroke-width="6"/>
    <g fill="#5f873d"><ellipse cx="8" cy="20" rx="15" ry="27" transform="rotate(-35 8 20)"/><ellipse cx="44" cy="4" rx="15" ry="27" transform="rotate(38 44 4)"/><ellipse cx="75" cy="13" rx="14" ry="25" transform="rotate(58 75 13)"/><ellipse cx="15" cy="-4" rx="12" ry="23" transform="rotate(-30 15 -4)"/></g>
    <path d="M8 53h62l-10 48H18z" fill="#b76e3d" stroke="#553b2c" stroke-width="4"/>
  </g>

  <!-- Side chairs -->
  <g filter="url(#shadow)" stroke="#3a312d" stroke-width="5">
    <path d="M176 320q0-48 43-48h68q35 0 35 42v81H176z" fill="#c76c24"/>
    <path d="M187 349h124v64H187z" fill="#db8431"/>
    <path d="M199 411l-18 90M297 411l20 90"/>
    <path d="M952 316q0-47 43-47h66q35 0 35 42v84H952z" fill="#c76c24"/>
    <path d="M963 347h123v67H963z" fill="#db8431"/>
    <path d="M975 412l-18 90M1071 412l20 90"/>
  </g>

  <!-- Sofa -->
  <g filter="url(#shadow)" stroke="#4b433d" stroke-width="5">
    <rect x="305" y="278" width="590" height="188" rx="44" fill="url(#sofa)"/>
    <path d="M349 298q0-33 34-33h144q34 0 34 33v108H349z" fill="#f7ead9"/>
    <path d="M565 298q0-33 34-33h145q34 0 34 33v108H565z" fill="#f3e4d1"/>
    <path d="M301 338q0-34 34-34h28q25 0 25 28v115h-83z" fill="#ead6bf"/>
    <path d="M812 332q0-28 25-28h28q34 0 34 34v109h-87z" fill="#ead6bf"/>
    <path d="M355 405h432q30 0 30 29v42H331v-42q0-29 24-29z" fill="#e2cbb1"/>
    <path d="M367 475l-8 50M781 475l8 50" stroke="#332c28" stroke-width="10"/>
  </g>

  <!-- Cushions and throw -->
  <g filter="url(#shadow)" stroke="#5e5044" stroke-width="3">
    <path d="M381 301q49-15 83 17l-15 82q-48 13-84-15z" fill="#fff4df"/>
    <path d="M667 301q49-15 83 17l-15 82q-48 13-84-15z" fill="#d1a068"/>
    <path d="M733 283q55 20 68 48l-14 141-85-34 20-85z" fill="#68717a"/>
    <path d="M721 351l72 30M714 387l77 31M708 423l77 30" fill="none" stroke="#a9adb0" stroke-width="4"/>
  </g>

  <!-- Floor lamp -->
  <g stroke="#292a29" stroke-width="6" fill="none">
    <path d="M915 155l-45 365M915 155l45 365M915 155v365"/>
    <path d="M875 138l40 17 42-17"/>
  </g>
  <g fill="#2d2c2b" stroke="#161616" stroke-width="4">
    <circle cx="874" cy="123" r="30"/><circle cx="916" cy="105" r="31"/><circle cx="959" cy="124" r="30"/><circle cx="914" cy="153" r="28"/>
  </g>
  <g fill="#ffd28a"><circle cx="874" cy="123" r="16"/><circle cx="916" cy="105" r="17"/><circle cx="959" cy="124" r="16"/><circle cx="914" cy="153" r="15"/></g>

  <!-- Coffee tables -->
  <g filter="url(#shadow)" stroke="#704019" stroke-width="4">
    <ellipse cx="520" cy="492" rx="108" ry="35" fill="#e99a45"/>
    <path d="M412 492v99q108 45 216 0v-99q-108 37-216 0z" fill="url(#wood)"/>
    <ellipse cx="686" cy="513" rx="93" ry="31" fill="#e6923b"/>
    <path d="M593 513v87q93 39 186 0v-87q-93 33-186 0z" fill="url(#wood)"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="452" y="458" width="85" height="12" rx="3" fill="#f3e8d6" stroke="#463b33" stroke-width="3"/>
    <rect x="462" y="445" width="74" height="13" rx="3" fill="#557080" stroke="#463b33" stroke-width="3"/>
    <path d="M552 434h38v40q-19 17-38 0z" fill="#33383d" stroke="#191b1d" stroke-width="4"/>
    <path d="M590 442q23 0 17 20-5 15-17 12" fill="none" stroke="#191b1d" stroke-width="4"/>
    <path d="M672 420c10-32 23-45 40-60M694 427c0-37-11-49-21-65M710 424c18-25 30-30 47-32" fill="none" stroke="#365928" stroke-width="5"/>
    <g fill="#628a43"><ellipse cx="690" cy="380" rx="12" ry="23" transform="rotate(-25 690 380)"/><ellipse cx="716" cy="371" rx="12" ry="24" transform="rotate(32 716 371)"/><ellipse cx="743" cy="391" rx="12" ry="23" transform="rotate(55 743 391)"/></g>
    <ellipse cx="703" cy="435" rx="38" ry="24" fill="#c8834f" stroke="#553b2c" stroke-width="4"/>
  </g>

  <g opacity=".075" filter="url(#paper)"><rect width="1200" height="630" fill="#806951"/></g>
  <g transform="translate(978 562)">
    <rect width="176" height="42" rx="21" fill="#fff8ed" opacity=".94"/>
    <circle cx="23" cy="21" r="8" fill="#c76c24"/>
    <text x="42" y="27" font-family="DejaVu Sans, sans-serif" font-size="17" font-weight="700" letter-spacing="1.4" fill="#3c3028">FURNITURE</text>
  </g>
</svg>`

await writeFile(svgOutput, svg)
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output)
console.log(`SVG: ${svgOutput}`)
console.log(`PNG: ${output}`)
