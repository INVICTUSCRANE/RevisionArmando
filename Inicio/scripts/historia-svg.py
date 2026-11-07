"""Genera las ilustraciones de la trayectoria (assets/img/historia/*.svg).
Uso: python3 scripts/historia-svg.py  — solo hace falta si se cambian los dibujos."""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'img' / 'historia'
G, G2, AMBER, INK, PAPER = '#218066', '#3fa684', '#ffb938', '#141515', '#f6f1e4'

STYLE = """<style>
.blink{animation:b 1s steps(2,jump-none) infinite}@keyframes b{to{opacity:.15}}
.spark{animation:s .8s ease-out infinite;transform-box:fill-box;transform-origin:center}@keyframes s{0%{opacity:1;transform:scale(.4)}100%{opacity:0;transform:scale(1.6)}}
.float{animation:f 4s ease-in-out infinite}@keyframes f{50%{transform:translateY(-10px)}}
.dash{stroke-dasharray:10 10;animation:d 1.2s linear infinite}@keyframes d{to{stroke-dashoffset:-40}}
.spin{animation:r 6s linear infinite;transform-box:fill-box;transform-origin:center}@keyframes r{to{transform:rotate(360deg)}}
</style>"""

def frame(body, glow='#3fa684'):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">{STYLE}
<defs><radialGradient id="bg" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#1f3a33"/><stop offset="1" stop-color="{INK}"/></radialGradient>
<radialGradient id="glow"><stop offset="0" stop-color="{glow}" stop-opacity=".35"/><stop offset="1" stop-color="{glow}" stop-opacity="0"/></radialGradient>
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".04"/></pattern></defs>
<rect width="800" height="500" fill="url(#bg)"/><rect width="800" height="500" fill="url(#grid)"/>
<ellipse cx="400" cy="300" rx="320" ry="180" fill="url(#glow)"/>
<rect y="420" width="800" height="80" fill="#0e1010"/><path d="M0 420H800" stroke="{G}" stroke-opacity=".6" stroke-width="3"/>
{body}</svg>"""

def truck(x, y, color=G, label='', bed=True):
    """Grúa de plataforma simple (origen: trasera, y = piso)."""
    return f"""<g transform="translate({x} {y})">
<rect x="0" y="-70" width="250" height="16" rx="3" fill="#3c4141"/>{'<rect x="0" y="-62" width="250" height="6" fill="'+AMBER+'"/>' if bed else ''}
<rect x="10" y="-54" width="330" height="14" rx="3" fill="#232525"/>
<path d="M255 -40V-118Q255 -128 265 -128H310L345 -92Q355 -88 355 -76V-40Z" fill="{color}"/>
<path d="M268 -118H306L330 -94H268Z" fill="#a8dccb"/>
<rect class="blink" x="276" y="-136" width="28" height="8" rx="3" fill="{AMBER}"/>
{f'<text x="268" y="-52" fill="#fff" font-family="Arial Narrow,Arial" font-weight="700" font-size="14">{label}</text>' if label else ''}
<g fill="#0d0e0e"><circle cx="60" cy="-20" r="20"/><circle cx="120" cy="-20" r="20"/><circle cx="300" cy="-20" r="20"/></g>
<g fill="#7d8686"><circle cx="60" cy="-20" r="9"/><circle cx="120" cy="-20" r="9"/><circle cx="300" cy="-20" r="9"/></g></g>"""

def car(x, y, c='#8f9696'):
    return f"""<g transform="translate({x} {y})"><path d="M0 -14Q2 -30 26 -33L56 -52Q64 -57 80 -57H126Q140 -57 150 -50L176 -33Q196 -30 200 -20V-10H0Z" fill="{c}"/>
<path d="M66 -48H98V-34H50ZM106 -48H134L156 -34H106Z" fill="#2a3132"/><circle cx="40" cy="-10" r="13" fill="#111"/><circle cx="160" cy="-10" r="13" fill="#111"/></g>"""

SCENES = {
 '2006': frame(f"""<path d="M170 420V230L400 140L630 230V420Z" fill="#253130"/><path d="M150 236L400 128L650 236" stroke="{G2}" stroke-width="10" fill="none"/>
<rect x="250" y="270" width="300" height="150" fill="#0f1414"/><g stroke="#2f3b39" stroke-width="4">{''.join(f'<path d="M250 {270+i*18}H550"/>' for i in range(3))}</g>
<rect x="320" y="170" width="160" height="40" rx="6" fill="{AMBER}"/><text x="400" y="198" text-anchor="middle" font-family="Arial Narrow,Arial" font-weight="700" font-size="24" fill="{INK}">TALLER</text>
{truck(270, 420, '#2a8f71')}
<g class="float"><path d="M610 300l40-40a22 22 0 1 1 18 18l-40 40z" fill="#c9d1d1"/><circle cx="672" cy="262" r="9" fill="#253130"/></g>"""),
 '2009': frame(f"""<path d="M400 60L250 420H550Z" fill="#ffe6a3" opacity=".08"/>{truck(230, 420, G, 'IP-22')}
<text x="400" y="120" text-anchor="middle" font-family="Arial Narrow,Arial" font-weight="700" font-size="64" fill="#fff" opacity=".12" letter-spacing="8">IP-22</text>
<g class="spark" fill="{AMBER}"><circle cx="190" cy="200" r="5"/></g><g class="spark" style="animation-delay:.4s" fill="{AMBER}"><circle cx="620" cy="180" r="4"/></g>"""),
 '2012': frame(f"""<path d="M90 420V250L170 210V250L250 210V250L330 210V250L410 210V420Z" fill="#253130"/><rect x="440" y="180" width="260" height="240" fill="#2b3836"/>
<rect x="470" y="110" width="30" height="70" fill="#2b3836"/><rect x="530" y="140" width="22" height="40" fill="#2b3836"/>
<g fill="{AMBER}" opacity=".7">{''.join(f'<rect x="{470+i*55}" y="{220+j*60}" width="30" height="22"/>' for i in range(4) for j in range(3))}</g>
<g transform="translate(250 420)"><rect x="-14" y="-90" width="28" height="56" rx="8" fill="#ff7a1a"/><rect x="-18" y="-120" width="36" height="30" rx="6" fill="#3d4646"/><rect x="-14" y="-110" width="28" height="10" fill="{G2}"/>
<path d="M14 -70L60 -50" stroke="#ff7a1a" stroke-width="10" stroke-linecap="round"/><path d="M-6 -34V0M8 -34V0" stroke="#2a3a5a" stroke-width="10"/>
<g fill="#fff6bd">{''.join(f'<circle class="spark" style="animation-delay:{i*.13}s" cx="{66+ (i%3)*8}" cy="{-50 - (i%4)*6}" r="4"/>' for i in range(6))}</g></g>"""),
 '2015': frame(f"""<g transform="translate(330 420)"><rect x="0" y="-54" width="330" height="14" rx="3" fill="#232525"/><rect x="0" y="-92" width="190" height="38" rx="4" fill="#3c4141"/>
<g><path d="M150 -100L-150 -190L-156 -176L150 -84Z" fill="{AMBER}"/><path d="M-60 -165L-150 -190L-156 -176L-60 -150Z" fill="#e59a14"/></g>
<rect x="130" y="-112" width="50" height="22" rx="4" fill="#4a4f4f"/>
<path d="M210 -40V-118Q210 -128 220 -128H265L300 -92Q310 -88 310 -76V-40Z" fill="{G}"/><path d="M223 -118H261L285 -94H223Z" fill="#a8dccb"/>
<rect class="blink" x="230" y="-136" width="28" height="8" rx="3" fill="{AMBER}"/>
<g fill="#0d0e0e"><circle cx="50" cy="-20" r="20"/><circle cx="110" cy="-20" r="20"/><circle cx="270" cy="-20" r="20"/></g></g>
<path d="M176 236V350" stroke="#e8e8e8" stroke-width="3"/><path d="M176 350L130 364M176 350L222 364" stroke="#c9b27a" stroke-width="3"/>{car(76, 412)}"""),
 '2018': frame(f"""{truck(330, 420, G, 'WL', bed=False)}<path d="M340 400L250 400L240 380" stroke="{AMBER}" stroke-width="12" fill="none" stroke-linecap="round"/>
<g transform="rotate(-8 240 400)">{car(40, 410)}</g><text x="400" y="110" text-anchor="middle" font-family="Arial Narrow,Arial" font-weight="700" font-size="44" fill="#fff" opacity=".15" letter-spacing="6">WHEEL LIFT · UNDERLIFT</text>"""),
 '2021': frame(f"""<g class="spin" opacity=".9"><circle cx="400" cy="250" r="150" fill="#1d3a33" stroke="{G2}" stroke-width="3"/>
<g fill="none" stroke="{G2}" stroke-opacity=".5" stroke-width="2"><ellipse cx="400" cy="250" rx="60" ry="150"/><ellipse cx="400" cy="250" rx="120" ry="150"/><path d="M250 250H550M265 180H535M265 320H535"/></g></g>
<path class="dash" d="M330 200 Q300 300 360 380" stroke="{AMBER}" stroke-width="4" fill="none"/><path class="dash" d="M330 200 Q420 260 410 390" stroke="{AMBER}" stroke-width="4" fill="none"/>
<circle cx="330" cy="200" r="10" fill="{AMBER}"/><circle class="blink" cx="360" cy="380" r="8" fill="#fff"/><circle class="blink" cx="410" cy="390" r="8" fill="#fff"/>
<text x="330" y="182" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#fff">MÉXICO</text>
<g transform="translate(560 420)"><path d="M0 -10H200L180 20H20Z" fill="#3c4141"/><rect x="30" y="-46" width="40" height="36" fill="{G}"/><rect x="74" y="-46" width="40" height="36" fill="{AMBER}"/><rect x="118" y="-46" width="40" height="36" fill="#8f9696"/></g>"""),
 '2024': frame(f"""<rect x="210" y="110" width="380" height="250" rx="16" fill="#2b3836" stroke="#4a5654" stroke-width="6"/><rect x="230" y="130" width="340" height="210" rx="6" fill="#0f1414"/>
<path d="M170 380H630L600 400H200Z" fill="#3d4646"/>
<g class="float"><path d="M400 160V310L270 296V150Z" fill="{PAPER}"/><path d="M400 160V310L530 296V150Z" fill="#ece4d0"/>
<path d="M400 160V310" stroke="#b9ad8f" stroke-width="3"/><rect x="290" y="176" width="90" height="10" fill="{G}"/><g stroke="#b9ad8f" stroke-width="3">{''.join(f'<path d="M290 {200+i*18}H380M420 {196+i*18}H510"/>' for i in range(5))}</g></g>"""),
 '2026': frame(f"""<rect x="300" y="90" width="200" height="320" rx="26" fill="#2b3836" stroke="#4a5654" stroke-width="6"/><rect x="316" y="114" width="168" height="270" rx="10" fill="#0f1414"/>
<g class="float"><path d="M350 190h14l16 70h66l14-50H372" stroke="{G2}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="388" cy="286" r="9" fill="{G2}"/><circle cx="440" cy="286" r="9" fill="{G2}"/></g>
<rect x="340" y="330" width="120" height="30" rx="8" fill="{G}"/><text x="400" y="351" text-anchor="middle" font-family="Arial" font-weight="700" font-size="15" fill="#fff">COMPRAR</text>
<g transform="translate(560 420)"><rect x="0" y="-80" width="90" height="80" fill="#b98b4e"/><path d="M0 -80H90M45 -80V0" stroke="#8c6532" stroke-width="5"/><rect x="100" y="-56" width="60" height="56" fill="#c99b5e"/></g>
<g transform="translate(110 420)"><rect x="0" y="-60" width="70" height="60" fill="#c99b5e"/><path d="M35 -60V0" stroke="#8c6532" stroke-width="5"/></g>"""),
}

OUT.mkdir(parents=True, exist_ok=True)
for year, svg in SCENES.items():
    (OUT / f'{year}.svg').write_text(svg, encoding='utf-8')
print('ok', len(SCENES))
