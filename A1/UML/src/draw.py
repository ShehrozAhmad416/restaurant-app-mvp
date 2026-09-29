import math, html
SKY='#0369A1'; SKYS='#E0F2FE'; GRN='#15803D'; GRNS='#DCFCE7'; INK='#0F2A3D'; BG='#F4FAFF'
def esc(s): return html.escape(s)
def arrow_defs():
    return f'''<defs><marker id="open" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M1 1 L11 6 L1 11" fill="none" stroke="{SKY}" stroke-width="1.6"/></marker>
<marker id="solid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="{SKY}"/></marker></defs>'''
# ---------------- USE CASE ----------------
RX,RY=118,30
uc={}
def U(k,x,y,label,kind='uc'): uc[k]=(x,y,label,kind)
LC=lambda y: 560
RC=lambda y: 1440
for k,y,l in [('UC1',110,'UC1 Sign Up'),('UC3',195,'UC3 Browse Menu'),('UC7',300,'UC7 Manage Cart'),('UC9',390,'UC9 Place Order'),('UC10',475,'UC10 Track Order'),('UC11',560,'UC11 Reserve Table'),('UC12',645,'UC12 Cancel Reservation')]:
    U(k,LC(y),y,l)
U('UC4',1000,110,'UC4 Search Menu'); U('UC5',1000,185,'UC5 Filter / Sort Menu'); U('UC6',1000,260,'UC6 Mark Favourite')
U('UC8',1000,370,'UC8 Apply Promo Code'); U('CT',1000,450,'Calculate Totals','inc'); U('CA',1000,560,'Check Table Availability','inc')
for k,y,l in [('UC15',230,'UC15 Update Order Status'),('UC16',320,'UC16 Accept / Decline Booking'),('UC17',410,'UC17 Add Menu Item'),('UC18',500,'UC18 Edit Item Price'),('UC19',590,'UC19 Toggle Availability')]:
    U(k,RC(y),y,l)
U('UC2',1000,850,'UC2 Log In'); U('VC',1000,755,'Validate Credentials','inc')
U('UC13',1000,940,'UC13 Toggle Dark Mode'); U('UC14',1000,1030,'UC14 Log Out')
cust=(130,600); mgr=(1890,600)
cust_links=['UC1','UC2','UC3','UC7','UC9','UC10','UC11','UC12','UC13','UC14']
mgr_links=['UC2','UC13','UC14','UC15','UC16','UC17','UC18','UC19']
rels=[('UC4','UC3','«extend»'),('UC5','UC3','«extend»'),('UC6','UC3','«extend»'),('UC12','UC11','«extend»'),
      ('UC9','UC8','«include»'),('UC9','CT','«include»'),('UC11','CA','«include»'),('UC2','VC','«include»')]
def edge(a,b):
    (x1,y1),(x2,y2)=a,b; dx,dy=x2-x1,y2-y1; L=math.hypot(dx,dy)
    t=1/math.sqrt((dx/L/RX)**2+(dy/L/RY)**2)
    return x1+dx/L*t, y1+dy/L*t
def actor(x,y,name):
    return f'''<g stroke="{INK}" stroke-width="2.2" fill="none"><circle cx="{x}" cy="{y-58}" r="16" fill="{SKYS}" stroke="{SKY}"/><line x1="{x}" y1="{y-42}" x2="{x}" y2="{y}"/><line x1="{x-26}" y1="{y-28}" x2="{x+26}" y2="{y-28}"/><line x1="{x}" y1="{y}" x2="{x-22}" y2="{y+34}"/><line x1="{x}" y1="{y}" x2="{x+22}" y2="{y+34}"/></g>
<text x="{x}" y="{y+60}" text-anchor="middle" font-weight="700" font-size="17" fill="{INK}">{esc(name)}</text>'''
W,H=2020,1110
s=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Arial, Helvetica, sans-serif">',arrow_defs(),f'<rect width="{W}" height="{H}" fill="white"/>',
   f'<rect x="280" y="60" width="1460" height="1030" rx="14" fill="{BG}" stroke="{SKY}" stroke-width="2.5"/>',
   f'<text x="1010" y="40" text-anchor="middle" font-size="20" font-weight="700" fill="{SKY}">Restaurant App MVP — Use Case Diagram (frontend only)</text>']
for k in cust_links:
    x,y=uc[k][:2]; ex,ey=x-RX,y
    s.append(f'<line x1="{cust[0]+28}" y1="{cust[1]-28}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{SKY}" stroke-width="1.5"/>')
for k in mgr_links:
    x,y=uc[k][:2]; ex,ey=x+RX,y
    s.append(f'<line x1="{mgr[0]-28}" y1="{mgr[1]-28}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{GRN}" stroke-width="1.5"/>')
for a,b,lab in rels:
    A=uc[a][:2]; B=uc[b][:2]; p1=edge(A,B); p2=edge(B,A)
    s.append(f'<line x1="{p1[0]:.1f}" y1="{p1[1]:.1f}" x2="{p2[0]:.1f}" y2="{p2[1]:.1f}" stroke="{SKY}" stroke-width="1.6" stroke-dasharray="7 5" marker-end="url(#open)"/>')
    mx,my=(p1[0]+p2[0])/2,(p1[1]+p2[1])/2
    s.append(f'<rect x="{mx-38}" y="{my-11}" width="76" height="20" rx="4" fill="white"/><text x="{mx}" y="{my+4}" text-anchor="middle" font-size="13" font-style="italic" fill="{SKY}">{lab}</text>')
for k,(x,y,label,kind) in uc.items():
    fill,st=(GRNS,GRN) if kind=='inc' else (SKYS,SKY)
    s.append(f'<ellipse cx="{x}" cy="{y}" rx="{RX}" ry="{RY}" fill="{fill}" stroke="{st}" stroke-width="2"/><text x="{x}" y="{y+5}" text-anchor="middle" font-size="14.5" fill="{INK}">{esc(label)}</text>')
s.append(actor(*cust,'Customer')); s.append(actor(*mgr,'Restaurant Manager'))
s.append(f'<g font-size="13" fill="{INK}"><rect x="20" y="930" width="260" height="120" rx="8" fill="white" stroke="{SKY}"/><text x="34" y="954" font-weight="700">Legend</text><line x1="34" y1="974" x2="84" y2="974" stroke="{SKY}" stroke-width="1.6"/><text x="94" y="978">Customer association</text><line x1="34" y1="998" x2="84" y2="998" stroke="{GRN}" stroke-width="1.6"/><text x="94" y="1002">Manager association</text><line x1="34" y1="1022" x2="84" y2="1022" stroke="{SKY}" stroke-dasharray="7 5" stroke-width="1.6" marker-end="url(#open)"/><text x="94" y="1026">«include» / «extend»</text><ellipse cx="59" cy="1041" rx="24" ry="7" fill="{GRNS}" stroke="{GRN}"/><text x="94" y="1045">Included use case</text></g>')

def hits(p,q,skip):
    bad=[]
    for k,(x,y,l,kd) in uc.items():
        if k in skip: continue
        for i in range(1,200):
            t=i/200; px=p[0]+(q[0]-p[0])*t; py=p[1]+(q[1]-p[1])*t
            if ((px-x)/RX)**2+((py-y)/RY)**2<1: bad.append(k); break
    return bad
for k in cust_links:
    b=hits((cust[0]+28,cust[1]-28),(uc[k][0]-RX,uc[k][1]),{k})
    if b: print('cust->',k,'crosses',b)
for k in mgr_links:
    b=hits((mgr[0]-28,mgr[1]-28),(uc[k][0]+RX,uc[k][1]),{k})
    if b: print('mgr->',k,'crosses',b)
for a,bb,_ in rels:
    b=hits(uc[a][:2],uc[bb][:2],{a,bb})
    if b: print(a,'->',bb,'crosses',b)
s.append('</svg>'); open('01_use_case.svg','w').write('\n'.join(s))

# ---------------- COMPONENT ----------------
W,H=1400,1010
c=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Arial, Helvetica, sans-serif">',arrow_defs(),f'<rect width="{W}" height="{H}" fill="white"/>',
   f'<text x="700" y="30" text-anchor="middle" font-size="20" font-weight="700" fill="{SKY}">React Native App — Component Diagram</text>']
def comp(x,y,w,h,name,sub='',fill=SKYS,st=SKY,bold=True):
    icon=f'<g transform="translate({x+w-26},{y+8})" fill="white" stroke="{st}" stroke-width="1.2"><rect x="4" y="0" width="16" height="14"/><rect x="0" y="3" width="8" height="3"/><rect x="0" y="8" width="8" height="3"/></g>'
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{st}" stroke-width="1.6"/>{icon}<text x="{x+w/2}" y="{y+h/2-(6 if sub else -5)}" text-anchor="middle" font-size="14" font-weight="{700 if bold else 400}" fill="{INK}">{esc(name)}</text>'
    if sub: t+=f'<text x="{x+w/2}" y="{y+h/2+14}" text-anchor="middle" font-size="12" fill="#4B6478">{esc(sub)}</text>'
    return t
def pkg(x,y,w,h,title,st=SKY,fill=BG):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" stroke="{st}" stroke-width="2"/><text x="{x+14}" y="{y+22}" font-size="14" font-weight="700" fill="{st}">{esc(title)}</text>'
def row(x0,y,w,h,items,gap=12,**kw):
    out=[]; x=x0
    for n,sub in items: out.append(comp(x,y,w,h,n,sub,**kw)); x+=w+gap
    return ''.join(out)
def arr(pts,label=None,lx=None,ly=None,anchor='middle'):
    d='M'+' L'.join(f'{a},{b}' for a,b in pts)
    o=f'<path d="{d}" fill="none" stroke="{SKY}" stroke-width="1.8" stroke-dasharray="8 5" marker-end="url(#open)"/>'
    if label:
        o+=f'<text x="{lx}" y="{ly}" text-anchor="{anchor}" font-size="12.5" font-style="italic" fill="{SKY}" paint-order="stroke" stroke="white" stroke-width="4">{esc(label)}</text>'
    return o
c.append(comp(600,50,200,48,'App.js','root component',fill=SKY,st=SKY).replace(f'fill="{INK}">App.js','fill="white">App.js').replace('fill="#4B6478">root','fill="#E0F2FE">root'))
c.append(pkg(100,130,1200,120,'Context providers  (src/context)'))
c.append(row(118,165,182,64,[('ThemeProvider','useTheme()'),('AuthProvider','useAuth()'),('MenuProvider','useMenu()'),('ReservationsProvider','useReservations()'),('OrdersProvider','useOrders()'),('CartProvider','useCart()')],gap=15))
c.append(pkg(100,310,560,120,'Reducers  (src/reducers)'))
c.append(row(115,345,124,64,[('cartReducer',''),('ordersReducer',''),('menuReducer',''),('reservations','Reducer')],gap=10))
c.append(pkg(740,310,560,120,'Custom hooks  (src/hooks)',st=GRN,fill='#F0FDF4'))
c.append(row(755,345,124,64,[('useForm',''),('useDebounce',''),('useReservation',''),('usePersisted','Reducer')],gap=10,fill=GRNS,st=GRN))
c.append(comp(100,480,260,90,'Mock data  (src/data)','users · menu · tables · promos',fill=GRNS,st=GRN))
c.append(pkg(430,480,540,90,'Navigation  (src/navigation)'))
c.append(comp(450,510,500,48,'AppNavigator','Root stack → bottom tabs → nested stacks'))
c.append(comp(1040,480,260,90,'AsyncStorage','orders · reservations · menu',fill=GRNS,st=GRN))
c.append(pkg(100,630,1200,190,'Screens  (src/screens)'))
c.append(row(115,665,222,58,[('LoginScreen','Q3 · Q6 · Q9'),('MenuScreen','Q4 · Q5 · Q8'),('ProfileScreen','Q6'),('CartScreen','Q7'),('OrderSummaryScreen','Q8 · Q10')],gap=12,fill='white'))
c.append(row(115,740,222,58,[('ReservationScreen','Q9'),('OrderTrackingScreen','Q10'),('MyOrdersScreen','Q10'),('ManagerDashboardScreen','Q10 (manager only)')],gap=12,fill='white'))
c.append(pkg(100,880,1200,100,'Reusable components  (src/components)',st=GRN,fill='#F0FDF4'))
c.append(row(115,915,222,50,[('MenuItemCard','React.memo'),('CartItemRow',''),('PrimaryButton · FormField',''),('Chip · SegmentedControl',''),('StepProgress · StatusPill','')],gap=12,fill=GRNS,st=GRN))
c.append(arr([(700,98),(700,128)]))
c.append(arr([(380,250),(380,308)],'useReducer',392,284,'start'))
c.append(arr([(1020,250),(1020,308)],'usePersistedReducer',1032,284,'start'))
c.append(arr([(700,250),(700,478)],'wraps',712,370,'start'))
c.append(arr([(230,430),(230,478)],'initial state',242,460,'start'))
c.append(arr([(1170,430),(1170,478)],'load / save',1182,460,'start'))
c.append(arr([(700,570),(700,628)],'renders',712,604,'start'))
c.append(arr([(1005,630),(1005,432)],'useForm · useDebounce · useReservation',1015,606,'start'))
c.append(arr([(100,720),(70,720),(70,190),(98,190)]))
c.append('<text x="60" y="455" transform="rotate(-90 60 455)" text-anchor="middle" font-size="12.5" font-style="italic" fill="#0369A1">consume contexts (useAuth, useCart, …)</text>')
c.append(arr([(700,820),(700,878)],'uses',712,854,'start'))
c.append('</svg>'); open('05_component.svg','w').write('\n'.join(c))
print('ok')
