"""deste için özgün kart görselleri üretir (500x700 SVG -> PNG -> WebP)."""
import math, random, asyncio, os
from playwright.async_api import async_playwright

W, H = 500, 700
OUT = '/home/claude/deste/img'
os.makedirs(OUT, exist_ok=True)

def poly(pts, fill, extra=''):
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x,y in pts)}" fill="{fill}" {extra}/>'

# ---------- çizimler: (w,h) alanına çizer ----------
def kapadokya(w, h):
    s = f'''<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1b4e"/><stop offset=".55" stop-color="#e9765b"/><stop offset="1" stop-color="#ffc27a"/></linearGradient></defs>
    <rect width="{w}" height="{h}" fill="url(#g1)"/><circle cx="{w*.7}" cy="{h*.62}" r="{h*.16}" fill="#ffe2a6" opacity=".9"/>'''
    for i,(x,ht,c) in enumerate([(.05,.45,'#7a3f2c'),(.22,.6,'#8f4c33'),(.4,.42,'#6e3826'),(.6,.55,'#93523a'),(.82,.48,'#7c4129'),(.98,.4,'#6a3424')]):
        bx=x*w; top=h*(1-ht)
        s+=f'<path d="M{bx-48},{h} L{bx-14},{top+26} Q{bx},{top-8} {bx+14},{top+26} L{bx+48},{h} Z" fill="{c}"/>'
        s+=f'<ellipse cx="{bx}" cy="{top+6}" rx="20" ry="9" fill="#5a2c1d"/>'
    for (x,y,r,c) in [(.18,.18,26,'#d9413a'),(.5,.1,18,'#2f6fd1'),(.78,.24,30,'#f2b632'),(.35,.32,13,'#3fae73')]:
        cx,cy=x*w,y*h
        s+=f'<path d="M{cx-r},{cy} A{r},{r} 0 1 1 {cx+r},{cy} Q{cx+r*.6},{cy+r*.9} {cx+r*.25},{cy+r*1.15} L{cx-r*.25},{cy+r*1.15} Q{cx-r*.6},{cy+r*.9} {cx-r},{cy} Z" fill="{c}"/>'
        s+=f'<path d="M{cx},{cy-r} Q{cx-r*.45},{cy} {cx-r*.15},{cy+r*1.1} M{cx},{cy-r} Q{cx+r*.45},{cy} {cx+r*.15},{cy+r*1.1}" stroke="#00000033" stroke-width="2" fill="none"/>'
        s+=f'<rect x="{cx-r*.22}" y="{cy+r*1.3}" width="{r*.44}" height="{r*.32}" rx="2" fill="#6b4a2a"/>'
        s+=f'<path d="M{cx-r*.25},{cy+r*1.15} L{cx-r*.2},{cy+r*1.3} M{cx+r*.25},{cy+r*1.15} L{cx+r*.2},{cy+r*1.3}" stroke="#3b2a1a" stroke-width="1.5"/>'
    return s

def tilki(w, h):
    s=f'''<defs><radialGradient id="tb" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#7a1d0c"/></radialGradient></defs><rect width="{w}" height="{h}" fill="url(#tb)"/>'''
    rnd=random.Random(3)
    for i in range(26):
        a=rnd.random()*math.tau; r=rnd.uniform(.35,.7)*h
        s+=f'<path d="M{w/2},{h*.55} L{w/2+math.cos(a)*r},{h*.55+math.sin(a)*r} L{w/2+math.cos(a+.08)*r},{h*.55+math.sin(a+.08)*r}Z" fill="#fff3c4" opacity=".18"/>'
    cx,cy=w/2,h*.56; k=h/300
    P=lambda x,y:(cx+x*k,cy+y*k)
    parts=[([(-95,-120),(-40,-55),(-75,-20)],'#e2571e'),([(95,-120),(40,-55),(75,-20)],'#c94415'),
           ([(-88,-104),(-52,-60),(-72,-36)],'#2b1208'),([(88,-104),(52,-60),(72,-36)],'#2b1208'),
           ([(-75,-20),(-40,-55),(0,-60),(0,-10)],'#f07a2a'),([(75,-20),(40,-55),(0,-60),(0,-10)],'#d8611f'),
           ([(-75,-20),(0,-10),(-30,40)],'#f4934a'),([(75,-20),(0,-10),(30,40)],'#e0702c'),
           ([(-75,-20),(-30,40),(-95,30)],'#fff1dc'),([(75,-20),(30,40),(95,30)],'#f1dcc2'),
           ([(-30,40),(0,-10),(30,40),(0,95)],'#ffffff'),([(-95,30),(-30,40),(0,95)],'#f4e2cc'),([(95,30),(30,40),(0,95)],'#e8d2b8'),
           ([(-12,80),(12,80),(0,100)],'#1b0b05')]
    for pts,c in parts: s+=poly([P(*p) for p in pts],c)
    for sx in (-1,1):
        e=[P(sx*28,-14),P(sx*46,-22),P(sx*40,-6)]
        s+=poly(e,'#1b0b05')
    return s

def dalga(w, h):
    s=f'''<defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e9c9"/><stop offset="1" stop-color="#e8d3a8"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#dg)"/>
    <circle cx="{w*.76}" cy="{h*.24}" r="{h*.11}" fill="#d9442f"/>'''
    for j,(y0,amp,c) in enumerate([(.55,.2,'#1d3f7a'),(.68,.14,'#2c5ea8'),(.8,.1,'#173566')]):
        d=f'M0,{h} L0,{h*y0}'
        for i in range(9):
            x0=i*w/8; x1=x0+w/16; x2=x0+w/8
            d+=f' Q{x1},{h*(y0-amp*(0.6+0.4*math.sin(i+j)))} {x2},{h*y0}'
        d+=f' L{w},{h} Z'
        s+=f'<path d="{d}" fill="{c}"/>'
    big=f'M{w*.05},{h*.75} C{w*.12},{h*.2} {w*.55},{h*.08} {w*.62},{h*.38} C{w*.5},{h*.28} {w*.38},{h*.36} {w*.42},{h*.5} C{w*.32},{h*.46} {w*.28},{h*.6} {w*.32},{h*.75}Z'
    s+=f'<path d="{big}" fill="#24508f"/><path d="{big}" fill="none" stroke="#f7f1e3" stroke-width="5"/>'
    rnd=random.Random(5)
    for i in range(22):
        t=i/21; x=w*(.12+.5*t); y=h*(.32-.18*math.sin(t*math.pi))+rnd.uniform(-6,6)
        s+=f'<circle cx="{x}" cy="{y}" r="{rnd.uniform(5,11)}" fill="#f7f1e3"/>'
    return s

def kedi(w, h):
    s=f'<rect width="{w}" height="{h}" fill="#3aa6a0"/>'
    for i in range(12):
        s+=f'<circle cx="{w/2}" cy="{h*.62}" r="{40+i*26}" fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="10"/>'
    cx,cy=w/2,h*.6; k=h/300
    s+=f'<path d="M{cx-95*k},{cy-20*k} L{cx-85*k},{cy-120*k} L{cx-35*k},{cy-72*k} Q{cx},{cy-82*k} {cx+35*k},{cy-72*k} L{cx+85*k},{cy-120*k} L{cx+95*k},{cy-20*k} Q{cx+100*k},{cy+70*k} {cx},{cy+85*k} Q{cx-100*k},{cy+70*k} {cx-95*k},{cy-20*k}Z" fill="#fbf7f0"/>'
    s+=f'<path d="M{cx-80*k},{cy-100*k} L{cx-45*k},{cy-70*k} L{cx-78*k},{cy-50*k}Z" fill="#f2b6b0"/><path d="M{cx+80*k},{cy-100*k} L{cx+45*k},{cy-70*k} L{cx+78*k},{cy-50*k}Z" fill="#f2b6b0"/>'
    s+=f'<path d="M{cx-30*k},{cy-78*k} Q{cx},{cy-95*k} {cx+30*k},{cy-78*k} Q{cx+10*k},{cy-60*k} {cx},{cy-40*k} Q{cx-10*k},{cy-60*k} {cx-30*k},{cy-78*k}Z" fill="#c98a4b"/>'
    for sx,col in ((-1,'#3f8be0'),(1,'#e8b528')):
        ex,ey=cx+sx*40*k,cy-5*k
        s+=f'<ellipse cx="{ex}" cy="{ey}" rx="{22*k}" ry="{17*k}" fill="{col}"/><ellipse cx="{ex}" cy="{ey}" rx="{5*k}" ry="{15*k}" fill="#111"/><circle cx="{ex+7*k}" cy="{ey-6*k}" r="{3.5*k}" fill="#fff"/>'
    s+=f'<path d="M{cx-9*k},{cy+28*k} L{cx+9*k},{cy+28*k} L{cx},{cy+38*k}Z" fill="#e58b8b"/>'
    s+=f'<path d="M{cx},{cy+38*k} Q{cx-12*k},{cy+52*k} {cx-24*k},{cy+44*k} M{cx},{cy+38*k} Q{cx+12*k},{cy+52*k} {cx+24*k},{cy+44*k}" stroke="#555" stroke-width="{2.5*k}" fill="none"/>'
    for sx in (-1,1):
        for dy in (-4,6,16):
            s+=f'<line x1="{cx+sx*38*k}" y1="{cy+(34+dy)*k}" x2="{cx+sx*110*k}" y2="{cy+(24+dy*1.8)*k}" stroke="#ffffff" stroke-width="{2*k}"/>'
    return s

def kartal(w, h):
    s=f'''<defs><linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2b4f"/><stop offset="1" stop-color="#4f86b8"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#kg)"/>'''
    s+=f'<path d="M0,{h} L{w*.18},{h*.62} L{w*.32},{h*.74} L{w*.5},{h*.5} L{w*.68},{h*.72} L{w*.82},{h*.58} L{w},{h*.78} L{w},{h}Z" fill="#e9f0f6"/><path d="M{w*.5},{h*.5} L{w*.56},{h*.6} L{w*.5},{h*.58} L{w*.45},{h*.62}Z" fill="#9fb6cc"/>'
    s+=f'<path d="M0,{h} L{w*.12},{h*.8} L{w*.3},{h*.9} L{w*.55},{h*.74} L{w*.8},{h*.88} L{w},{h*.82} L{w},{h}Z" fill="#1f3c5c"/>'
    cx,cy=w/2,h*.36; k=h/300
    wing=lambda sx: f'M{cx},{cy} C{cx+sx*40*k},{cy-50*k} {cx+sx*120*k},{cy-70*k} {cx+sx*190*k},{cy-40*k} L{cx+sx*150*k},{cy-28*k} L{cx+sx*178*k},{cy-14*k} L{cx+sx*132*k},{cy-6*k} L{cx+sx*156*k},{cy+8*k} L{cx+sx*100*k},{cy+6*k} C{cx+sx*60*k},{cy+14*k} {cx+sx*30*k},{cy+20*k} {cx},{cy+26*k}Z'
    s+=f'<path d="{wing(-1)}" fill="#2a1a10"/><path d="{wing(1)}" fill="#2a1a10"/>'
    s+=f'<ellipse cx="{cx}" cy="{cy+30*k}" rx="{16*k}" ry="{38*k}" fill="#3a2414"/><circle cx="{cx}" cy="{cy-14*k}" r="{14*k}" fill="#f4f1ea"/><path d="M{cx+8*k},{cy-14*k} L{cx+22*k},{cy-8*k} L{cx+8*k},{cy-4*k}Z" fill="#f2b632"/>'
    s+=f'<path d="M{cx-14*k},{cy+64*k} L{cx},{cy+80*k} L{cx+14*k},{cy+64*k}Z" fill="#2a1a10"/>'
    return s

def kristal(w, h):
    s=f'''<defs><radialGradient id="kr" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#5b2a91"/><stop offset="1" stop-color="#120a24"/></radialGradient>
    <linearGradient id="kc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7f6ff"/><stop offset=".5" stop-color="#7fd3f7"/><stop offset="1" stop-color="#3a6fd8"/></linearGradient></defs>
    <rect width="{w}" height="{h}" fill="url(#kr)"/>'''
    rnd=random.Random(9)
    for i in range(40):
        s+=f'<circle cx="{rnd.uniform(0,w)}" cy="{rnd.uniform(0,h)}" r="{rnd.uniform(.8,2.4)}" fill="#fff" opacity="{rnd.uniform(.3,.9):.2f}"/>'
    base=h*.92
    for (x,ht,wd,ang) in [(.5,.78,.16,0),(.36,.55,.11,-12),(.64,.6,.12,10),(.25,.36,.08,-22),(.76,.4,.09,20),(.45,.3,.07,-5),(.57,.34,.07,6)]:
        cx=x*w; t=h*(1-ht); bw=wd*w
        pts=[(cx-bw/2,base),(cx-bw/2,t+bw*.6),(cx,t),(cx+bw/2,t+bw*.6),(cx+bw/2,base)]
        s+=f'<g transform="rotate({ang} {cx} {base})">'+poly(pts,'url(#kc)','stroke="#e9fbff" stroke-width="1.5"')
        s+=poly([(cx,t),(cx+bw/2,t+bw*.6),(cx+bw/2,base),(cx,base)],'#1b3c86','opacity=".35"')+'</g>'
    s+=f'<ellipse cx="{w/2}" cy="{base}" rx="{w*.42}" ry="{h*.05}" fill="#0a0614"/>'
    return s

def lale(w, h):
    s=f'<rect width="{w}" height="{h}" fill="#0f5c63"/>'
    for i in range(0,int(w)+40,40):
        for j in range(0,int(h)+40,40):
            s+=f'<path d="M{i},{j-8} L{i+8},{j} L{i},{j+8} L{i-8},{j}Z" fill="#0b4950"/>'
    cx,cy=w/2,h*.5; k=h/300
    s+=f'<rect x="{cx-140*k}" y="{cy-125*k}" width="{280*k}" height="{250*k}" rx="{130*k}" fill="#f6efe1" stroke="#c99a3a" stroke-width="{5*k}"/>'
    s+=f'<path d="M{cx},{cy+100*k} C{cx-6*k},{cy+40*k} {cx+6*k},{cy+10*k} {cx},{cy-10*k}" stroke="#2f7a3f" stroke-width="{6*k}" fill="none"/>'
    for sx in (-1,1):
        s+=f'<path d="M{cx},{cy+70*k} C{cx+sx*50*k},{cy+60*k} {cx+sx*80*k},{cy+20*k} {cx+sx*70*k},{cy-10*k} C{cx+sx*50*k},{cy+20*k} {cx+sx*20*k},{cy+40*k} {cx},{cy+70*k}Z" fill="#3b8f4d"/>'
        s+=f'<path d="M{cx},{cy-10*k} C{cx+sx*40*k},{cy-20*k} {cx+sx*48*k},{cy-70*k} {cx+sx*30*k},{cy-105*k} C{cx+sx*22*k},{cy-70*k} {cx+sx*12*k},{cy-60*k} {cx},{cy-75*k}Z" fill="#c8302a"/>'
    s+=f'<path d="M{cx},{cy-8*k} C{cx-22*k},{cy-30*k} {cx-14*k},{cy-80*k} {cx},{cy-118*k} C{cx+14*k},{cy-80*k} {cx+22*k},{cy-30*k} {cx},{cy-8*k}Z" fill="#e0453a"/>'
    s+=f'<path d="M{cx},{cy-30*k} C{cx-8*k},{cy-50*k} {cx-5*k},{cy-80*k} {cx},{cy-98*k} C{cx+5*k},{cy-80*k} {cx+8*k},{cy-50*k} {cx},{cy-30*k}Z" fill="#f2b632"/>'
    return s

def yildirim(w, h):
    s=f'''<defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1f3b"/><stop offset="1" stop-color="#4b3f8c"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#yg)"/>'''
    for (x,y,r) in [(.1,.12,60),(.3,.08,70),(.55,.12,80),(.8,.07,65),(1,.14,55)]:
        s+=f'<circle cx="{x*w}" cy="{y*h}" r="{r*h/300}" fill="#2c2b52"/>'
    cx=w*.5
    bolt=[(cx+10,h*.12),(cx-50,h*.55),(cx-6,h*.52),(cx-34,h*.95),(cx+60,h*.4),(cx+12,h*.43),(cx+48,h*.12)]
    s+=poly(bolt,'#ffe14d','stroke="#fff6b8" stroke-width="4"')
    s+=f'<circle cx="{cx}" cy="{h*.5}" r="{h*.42}" fill="#ffe14d" opacity=".08"/>'
    for i in range(8):
        a=i/8*math.tau
        s+=f'<line x1="{cx+math.cos(a)*h*.3}" y1="{h*.5+math.sin(a)*h*.3}" x2="{cx+math.cos(a)*h*.4}" y2="{h*.5+math.sin(a)*h*.4}" stroke="#ffe14d" stroke-width="3" opacity=".5"/>'
    return s

def ay(w, h):
    s=f'''<defs><radialGradient id="ag" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#2d3d78"/><stop offset="1" stop-color="#0b1022"/></radialGradient></defs><rect width="{w}" height="{h}" fill="url(#ag)"/>'''
    rnd=random.Random(12)
    for i in range(50):
        s+=f'<circle cx="{rnd.uniform(0,w)}" cy="{rnd.uniform(0,h*.7)}" r="{rnd.uniform(.6,2)}" fill="#fff" opacity="{rnd.uniform(.3,1):.2f}"/>'
    cx,cy=w*.5,h*.3; r=h*.17
    s+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#f6e7b0"/><circle cx="{cx+r*.45}" cy="{cy-r*.15}" r="{r*.92}" fill="#1a2550"/>'
    k=h/300
    s+=f'<path d="M{cx},{h*.42} L{cx-70*k},{h} L{cx+70*k},{h}Z" fill="#5b3fa0"/><path d="M{cx},{h*.42} L{cx-28*k},{h*.62} Q{cx},{h*.58} {cx+28*k},{h*.62}Z" fill="#3b2870"/>'
    s+=f'<circle cx="{cx-8*k}" cy="{h*.56}" r="{3*k}" fill="#ffe14d"/><circle cx="{cx+8*k}" cy="{h*.56}" r="{3*k}" fill="#ffe14d"/>'
    s+=f'<line x1="{cx+60*k}" y1="{h*.55}" x2="{cx+44*k}" y2="{h}" stroke="#c99a3a" stroke-width="{5*k}"/><circle cx="{cx+61*k}" cy="{h*.53}" r="{9*k}" fill="#7fd3f7"/>'
    for i in range(5):
        x=cx-110*k+i*55*k
        s+=f'<path d="M{x},{h*.75} l4,10 l10,0 l-8,6 l3,10 l-9,-6 l-9,6 l3,-10 l-8,-6 l10,0z" fill="#f6e7b0" opacity=".7"/>'
    return s

def goz(w, h):
    s=f'<rect width="{w}" height="{h}" fill="#1d4d2b"/>'
    for j in range(0,int(h)+30,26):
        for i in range(-30,int(w)+30,30):
            ox=15 if (j//26)%2 else 0
            s+=f'<path d="M{i+ox},{j} q15,18 30,0" fill="#2c6b3d" stroke="#143a20" stroke-width="2"/>'
    cx,cy=w/2,h/2; k=h/300
    s+=f'<path d="M{cx-150*k},{cy} Q{cx},{cy-110*k} {cx+150*k},{cy} Q{cx},{cy+110*k} {cx-150*k},{cy}Z" fill="#f2b632" stroke="#0e2716" stroke-width="{8*k}"/>'
    s+=f'<circle cx="{cx}" cy="{cy}" r="{52*k}" fill="#e0701c" opacity=".6"/>'
    for i in range(18):
        a=i/18*math.tau
        s+=f'<line x1="{cx+math.cos(a)*20*k}" y1="{cy+math.sin(a)*20*k}" x2="{cx+math.cos(a)*50*k}" y2="{cy+math.sin(a)*50*k}" stroke="#9c3f0c" stroke-width="{2*k}" opacity=".6"/>'
    s+=f'<ellipse cx="{cx}" cy="{cy}" rx="{10*k}" ry="{48*k}" fill="#0b0b0b"/><circle cx="{cx+22*k}" cy="{cy-22*k}" r="{8*k}" fill="#fff" opacity=".85"/>'
    return s

def figur(w, h, poz, top_renk, zemin):
    """Spor piktogramı: kalın yuvarlak uçlu uzuvlar."""
    k=w/330; s=''
    def L(a,b,wd=22):
        nonlocal s
        s+=f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="#fff" stroke-width="{wd*k}" stroke-linecap="round"/>'
    P=lambda x,y:(w/2+x*k,h*.42+y*k)
    j=poz
    L(P(*j['boyun']),P(*j['kalca']),30)
    for a,b,c in j['uzuv']: L(P(*a),P(*b)); L(P(*b),P(*c))
    hx,hy=P(*j['bas']); s+=f'<circle cx="{hx}" cy="{hy}" r="{17*k}" fill="#fff"/>'
    bx,by=P(*j['top']); s+=top_renk(bx,by,k)
    return s

def golcu(w, h):
    s=f'''<defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8102e"/><stop offset="1" stop-color="#5e0716"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#fg)"/>'''
    for i in range(6):
        s+=f'<rect x="{-w+i*w*.4}" y="0" width="{w*.18}" height="{h*2}" fill="#fff" opacity=".05" transform="rotate(25)"/>'
    s+=f'<rect x="0" y="{h*.86}" width="{w}" height="{h*.14}" fill="#2f8f46"/>'
    poz={'bas':(-10,-110),'boyun':(-6,-88),'kalca':(6,-10),'top':(95,80),
         'uzuv':[((-6,-80),(-60,-60),(-95,-80)),((-6,-80),(40,-60),(70,-90)),((6,-10),(-30,40),(-50,95)),((6,-10),(50,30),(85,70))]}
    def top(x,y,k): return f'<circle cx="{x}" cy="{y}" r="{16*k}" fill="#fff" stroke="#111" stroke-width="{3*k}"/><path d="M{x-6*k},{y-4*k} l6,-6 l6,6 l-3,7 l-7,0z" fill="#111"/>'
    s+=figur(w,h,poz,top,None)
    return s

def smac(w, h):
    s=f'''<defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f28c28"/><stop offset="1" stop-color="#7a2d0b"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#bg2)"/>'''
    for i in range(10):
        s+=f'<circle cx="{w*.5}" cy="{h*1.1}" r="{60+i*45}" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="14"/>'
    k=w/330
    hx,hy=w*.78,h*.17
    s+=f'<rect x="{hx-40*k}" y="{hy-60*k}" width="{80*k}" height="{56*k}" fill="none" stroke="#fff" stroke-width="{4*k}"/><ellipse cx="{hx}" cy="{hy}" rx="{26*k}" ry="{6*k}" fill="none" stroke="#ff5a1f" stroke-width="{5*k}"/>'
    s+=f'<path d="M{hx-24*k},{hy} L{hx-14*k},{hy+30*k} L{hx+14*k},{hy+30*k} L{hx+24*k},{hy}" fill="none" stroke="#fff" stroke-width="{2*k}"/>'
    poz={'bas':(-30,-80),'boyun':(-22,-58),'kalca':(-40,20),'top':(80,-130),
         'uzuv':[((-22,-50),(20,-90),(62,-118)),((-22,-50),(-60,-30),(-90,-50)),((-40,20),(-10,60),(-40,100)),((-40,20),(-90,50),(-110,95))]}
    def top(x,y,k): return f'<circle cx="{x}" cy="{y}" r="{15*k}" fill="#e2611d" stroke="#3a1606" stroke-width="{2.5*k}"/><path d="M{x-15*k},{y} L{x+15*k},{y} M{x},{y-15*k} L{x},{y+15*k}" stroke="#3a1606" stroke-width="{2*k}"/>'
    s+=figur(w,h,poz,top,None)
    return s

def kale(w, h):
    s=f'''<defs><linearGradient id="kl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14532d"/><stop offset="1" stop-color="#2f9e57"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#kl)"/>'''
    k=h/300
    s+=f'<rect x="{w*.12}" y="{h*.18}" width="{w*.76}" height="{h*.55}" fill="none" stroke="#fff" stroke-width="{6*k}"/>'
    for i in range(1,12): s+=f'<line x1="{w*.12+i*w*.76/12}" y1="{h*.18}" x2="{w*.12+i*w*.76/12}" y2="{h*.73}" stroke="#fff" stroke-opacity=".25"/>'
    for i in range(1,8): s+=f'<line x1="{w*.12}" y1="{h*.18+i*h*.55/8}" x2="{w*.88}" y2="{h*.18+i*h*.55/8}" stroke="#fff" stroke-opacity=".25"/>'
    poz={'bas':(-70,-40),'boyun':(-52,-22),'kalca':(20,20),'top':(-130,-90),
         'uzuv':[((-52,-22),(-90,-50),(-118,-80)),((-52,-22),(-80,-70),(-100,-104)),((20,20),(60,50),(110,40)),((20,20),(40,70),(80,100))]}
    def top(x,y,k): return f'<circle cx="{x}" cy="{y}" r="{15*k}" fill="#fff" stroke="#111" stroke-width="{3*k}"/>'
    s+=figur(w,h,poz,top,None)
    return s

ICERIK = [
    # dosya, stil, ad, güç/numara, çizim, çerçeve rengi, kategori etiketi, alt bilgiler
    ('kapadokya','tcg','Kapadokya Göğü','GÜÇ 90',kapadokya,'#d9a441','Rüzgâr',[('Sıcak Hava',30),('Peribacası Kalkanı',70)]),
    ('tilki','tcg','Ateş Tilkisi','GÜÇ 120',tilki,'#d1462a','Ateş',[('Kor Pençe',40),('Alev Kuyruğu',90)]),
    ('dalga','tcg','Ege Dalgası','GÜÇ 100',dalga,'#2c5ea8','Su',[('Köpük',20),('Meltem Vurgunu',80)]),
    ('kedi','tcg','Van Kedisi','GÜÇ 70',kedi,'#e7e2d6','Normal',[('Çift Renkli Bakış',30),('Göl Sıçrayışı',50)]),
    ('kartal','tcg','Toros Kartalı','GÜÇ 110',kartal,'#6b4a2a','Uçan',[('Pike',60),('Zirve Rüzgârı',100)]),
    ('kristal','tcg','Kristal Golem','GÜÇ 150',kristal,'#7d5bd6','Taş',[('Prizma',40),('Işık Kırılması',120)]),
    ('lale','tcg','Lale Devri','GÜÇ 60',lale,'#1a8b82','Bitki',[('Çini Kalkanı',20),('Bahar Dansı',60)]),
    ('yildirim','tcg','Yıldırım Ruhu','GÜÇ 130',yildirim,'#f2c51d','Elektrik',[('Kıvılcım',30),('Gök Gürültüsü',110)]),
    ('ay','tcg','Ay Büyücüsü','GÜÇ 100',ay,'#3a3f8f','Gizem',[('Hilal',30),('Yıldız Yağmuru',90)]),
    ('goz','tcg','Ejder Gözü','GÜÇ 180',goz,'#2f7a3f','Ejder',[('Pul Zırh',50),('Yakıcı Bakış',140)]),
    ('golcu','spor','Golcü','10',golcu,'#c8102e','FORVET',None),
    ('smac','spor','Smaç Kralı','23',smac,'#f28c28','KISA FORVET',None),
    ('kaleci','spor','Uçan Kaleci','1',kale,'#2f9e57','KALECİ',None),
]

def kart_svg(i, dosya, stil, ad, guc, ciz, renk, tur, saldiri):
    no=f'{i+1:02d}/{len(ICERIK)}'
    if stil=='tcg':
        aw,ah=420,300
        s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs><linearGradient id="fr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{renk}"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="{renk}"/></linearGradient>
<linearGradient id="pn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ea"/><stop offset="1" stop-color="#efe5cf"/></linearGradient><clipPath id="aw"><rect width="{aw}" height="{ah}"/></clipPath></defs>
<rect width="{W}" height="{H}" rx="22" fill="{renk}"/><rect width="{W}" height="{H}" rx="22" fill="url(#fr)" opacity=".5"/>
<rect x="18" y="18" width="{W-36}" height="{H-36}" rx="14" fill="url(#pn)"/>
<text x="42" y="64" font-family="Inter Tight" font-weight="700" font-size="30" fill="#1d1b18">{ad}</text>
<text x="{W-42}" y="64" text-anchor="end" font-family="Inter Tight" font-weight="700" font-size="20" fill="#b3261e">{guc}</text>
<g transform="translate(40,84)"><g clip-path="url(#aw)">{ciz(aw,ah)}</g><rect width="{aw}" height="{ah}" fill="none" stroke="#c99a3a" stroke-width="6"/></g>
<rect x="60" y="392" width="{W-120}" height="24" rx="4" fill="#d9c48e"/>
<text x="{W/2}" y="409" text-anchor="middle" font-family="Inter" font-style="italic" font-size="13" fill="#3a2f1a">Tür: {tur} · deste koleksiyonu</text>'''
        y=458
        for nm,dmg in saldiri:
            s+=f'''<circle cx="56" cy="{y-8}" r="11" fill="{renk}" stroke="#1d1b18" stroke-opacity=".3"/><text x="78" y="{y}" font-family="Inter Tight" font-weight="700" font-size="22" fill="#1d1b18">{nm}</text>
<text x="{W-44}" y="{y}" text-anchor="end" font-family="Inter Tight" font-weight="700" font-size="24" fill="#1d1b18">{dmg}</text>
<rect x="56" y="{y+14}" width="{W-160}" height="6" rx="3" fill="#1d1b18" opacity=".12"/><rect x="56" y="{y+28}" width="{W-220}" height="6" rx="3" fill="#1d1b18" opacity=".12"/>
<line x1="42" y1="{y+52}" x2="{W-42}" y2="{y+52}" stroke="#1d1b18" stroke-opacity=".15"/>'''
            y+=92
        s+=f'''<text x="42" y="{H-34}" font-family="Inter" font-size="12" fill="#5a5243">Zayıflık ×2   ·   Direnç −20   ·   Geri çekilme ●</text>
<text x="{W-42}" y="{H-34}" text-anchor="end" font-family="Inter" font-size="12" fill="#5a5243">deste 2026 · {no}</text></svg>'''
        return s
    # spor
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs><clipPath id="c"><rect x="16" y="16" width="{W-32}" height="{H-32}" rx="12"/></clipPath></defs>
<rect width="{W}" height="{H}" rx="20" fill="#f4f1ea"/>
<g clip-path="url(#c)"><g transform="translate(16,16)">{ciz(W-32,H-32)}</g>
<path d="M16,{H-170} L{W-16},{H-230} L{W-16},{H-16} L16,{H-16}Z" fill="#0d0d0d" opacity=".82"/>
<path d="M16,{H-178} L{W-16},{H-238} L{W-16},{H-226} L16,{H-166}Z" fill="{renk}"/></g>
<circle cx="70" cy="70" r="34" fill="#f4f1ea"/><circle cx="70" cy="70" r="28" fill="{renk}"/><text x="70" y="80" text-anchor="middle" font-family="Inter Tight" font-weight="700" font-size="28" fill="#fff">{guc}</text>
<text x="44" y="{H-84}" font-family="Inter Tight" font-weight="700" font-size="44" fill="#fff" letter-spacing="-1">{ad.upper()}</text>
<text x="46" y="{H-50}" font-family="Inter" font-weight="600" font-size="17" fill="{renk}" letter-spacing="2">{tur}</text>
<text x="{W-44}" y="{H-50}" text-anchor="end" font-family="Inter" font-size="14" fill="#bbb">deste 2026 · {no}</text>
<rect x="{W-120}" y="40" width="80" height="26" rx="4" fill="#f2c51d"/><text x="{W-80}" y="58" text-anchor="middle" font-family="Inter Tight" font-weight="700" font-size="14" fill="#111">ÇAYLAK</text></svg>'''
    return s

ARKA = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs><radialGradient id="r" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#2a5bd1"/><stop offset="1" stop-color="#0c1d4d"/></radialGradient></defs>
<rect width="{W}" height="{H}" rx="22" fill="#163a92"/><rect x="18" y="18" width="{W-36}" height="{H-36}" rx="14" fill="url(#r)"/>
{''.join(f'<circle cx="{W/2}" cy="{H/2}" r="{30+i*28}" fill="none" stroke="#b5d8ff" stroke-opacity="{.25-i*.02:.2f}" stroke-width="2"/>' for i in range(10))}
<g transform="translate({W/2-70},{H/2-110}) rotate(-10 70 110)"><rect width="140" height="200" rx="14" fill="#b5d8ff"/></g>
<g transform="translate({W/2-60},{H/2-100}) rotate(8 60 100)"><rect width="140" height="200" rx="14" fill="#ffd98a" stroke="#0c1d4d" stroke-width="3"/></g>
<text x="{W/2}" y="{H-90}" text-anchor="middle" font-family="Inter Tight" font-weight="700" font-size="64" fill="#fff" letter-spacing="-2">deste</text></svg>'''

FONTS='<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700&family=Inter:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">'

async def main():
    from PIL import Image
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',proxy={'server':'http://127.0.0.1:34237'})
        p=await b.new_page(viewport={'width':W,'height':H},device_scale_factor=1.5)
        isler=[(f'kart-{d}',kart_svg(i,d,*rest)) for i,(d,*rest) in enumerate(ICERIK)]+[('kart-arka',ARKA)]
        for ad,svg in isler:
            await p.set_content(f'<html><head>{FONTS}<style>body{{margin:0;background:transparent}}</style></head><body>{svg}</body></html>')
            await p.wait_for_timeout(400 if ad=='kart-kapadokya' else 120)
            await p.screenshot(path=f'/tmp/{ad}.png',omit_background=True,clip={'x':0,'y':0,'width':W,'height':H})
            Image.open(f'/tmp/{ad}.png').save(f'{OUT}/{ad}.webp','WEBP',quality=84,method=6)
        await b.close()
    print('ok', len(ICERIK)+1)
asyncio.run(main())
