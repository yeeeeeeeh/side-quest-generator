// ===== Retirement calculator =====
// How big a portfolio must be to pay a monthly cost from dividends alone, after Dutch box 3 tax,
// and whether saving a % of salary gets you there. "Old" box 3 taxes a deemed return on wealth
// (forfaitair rendement); "new" taxes the actual return incl. unrealised price gains (planned 2028).
// Inputs are kept in localStorage. Wrapped in a function so its names don't clash with other tabs.
(function () {
"use strict";
const TEXT = {
  "tab.transit":"Transit → KML","tab.retire":"Retirement","tabs.group":"Tools",
    "r.sub":"How big must your portfolio be to pay a monthly cost from dividends alone, and do your savings get you there? Compared under the old and the new Dutch box 3 tax.",
  "r.you":"You","r.age":"Current age","r.retire":"Retire at age","r.until":"Plan until age",
  "r.salary":"Net salary per year","r.raise":"Salary raise per year %","r.invest":"Invest % of salary","r.start":"Invested today",
  "r.goal":"Retirement","r.cost":"Monthly cost in retirement (today's money)","r.infl":"Inflation per year %",
  "r.market":"Investments","r.yield":"Dividend yield %","r.growth":"Share price growth per year %",
  "r.box3":"Box 3 tax","r.partner":"Fiscal partner (doubles the tax-free amounts)",
  "r.old":"Old box 3 (deemed return)","r.new":"New box 3 (actual return)",
  "r.oRate":"Tax rate %","r.oDeemed":"Deemed return %","r.oFree":"Tax-free wealth per person",
  "r.nRate":"Tax rate %","r.nFree":"Tax-free return per person",
  "r.box3Hint":"Defaults are the 2026 rules and the new-system bill. Tax-free amounts and your monthly cost rise with inflation. Dividend withholding tax is assumed to be credited.",
  "r.mort":"Mortgage","r.mBal":"Mortgage balance today",
  "r.mFrom":"From year","r.mTo":"To year","r.mRate":"Interest %","r.mPay":"Per month",
  "r.mPayPh":"auto","r.mAdd":"Add period","r.mDel":"Remove period",
  "r.mHint":"Leave \"per month\" empty for a standard annuity that is paid off by the last year. Payments are made from your salary while you work, and from the portfolio after you retire.",
  "r.need":"Needed at retirement","r.have":"You will have","r.gap":"Short by","r.surplus":"Ahead by",
  "r.pct":"Invest {p}% of salary to get there","r.pctNo":"Not reachable even at 100% of salary",
  "r.never":"Not possible on dividends alone: after tax the dividends never cover the cost.",
  "r.atRetire":"At age {age} ({year}) you need {cost} a year: {month} a month{mort}.",
  "r.atRetireMort":", including {m} a year of mortgage after interest deduction",
  "r.afterMort":"Once the mortgage is paid off: {v} needed.",
  "r.mortLeft":"Mortgage still owed at retirement: {v}.",
  "r.netDiv":"Dividends after tax in the first retirement year: {v} a year.",
  "r.lasts":"Money runs out at age {age}.","r.lastsOk":"Lasts past age {age}.",
  "r.sells":"From age {age} dividends no longer cover spending and shares are sold.",
  "r.chart":"Portfolio by age","r.chartAlt":"Line chart of the projected portfolio under the old and the new box 3, with the amount needed at retirement marked.",
  "r.legOld":"Old box 3","r.legNew":"New box 3","r.legNeed":"Needed","r.legRetire":"Retire",
  "r.table":"Year by year",
  "c.year":"Year","c.age":"Age","c.salary":"Salary","c.contrib":"Invested","c.spend":"Spent",
  "c.left":"Salary left","c.mInt":"Mortgage interest","c.ben":"AOW + pension","c.mPaid":"Mortgage paid","c.mRef":"Interest deduction","c.mBal":"Mortgage owed",
  "c.wOld":"Portfolio (old)","c.taxOld":"Tax (old)","c.wNew":"Portfolio (new)","c.taxNew":"Tax (new)",
  "r.disc":"An estimate, not financial advice. Returns are assumed steady every year; real markets are not.",
  "x.h":"How this is calculated",
  "x.intro":"Every step below uses the numbers you entered, so you can check it by hand.",
  "x.s1":"1. Yearly cost when you retire",
  "x.s1t":"Your monthly cost, AOW and pension are in today's money and grow with inflation every year from now until you retire in {year} ({n} years).",
  "x.mort":"mortgage that year after interest deduction",
  "x.s2":"2. What box 3 takes in retirement, per €100 invested",
  "x.s2t":"Box 3 is charged every year and is paid out of the dividends. This is per €100 above the tax-free amount, after {leak} of the dividend is lost to withholding tax inside the fund.",
  "x.div":"dividend","x.tax":"tax","x.left":"left to spend",
  "x.s2new":"The new box 3 also taxes the {g} price growth per €100, even though you don't sell, so that tax comes out of the dividends too.",
  "x.s3":"3. Portfolio needed at retirement",
  "x.s3t":"The smallest portfolio for which, every year from age {age} to {until}, the dividends after box 3 tax pay your costs minus AOW and pension (even before those start), and the money does not run out. Until AOW and pension start, the part they will later pay comes from selling shares (the bridge). It is found by trying amounts; the dividend part on its own has a formula, shown below. In {year} the tax-free amounts have grown with inflation to {free}{partner}.",
  "x.partner":", for two partners",
  "x.fOld":"needed = (yearly cost − tax rate × deemed return × tax-free wealth) ÷ (dividend yield − tax rate × deemed return)",
  "x.fNew":"needed = (yearly cost − tax rate × tax-free return) ÷ (dividend yield − tax rate × (dividend yield + price growth))",
  "x.noTax":"This is below the tax-free amount, so no box 3 tax: needed = yearly cost ÷ dividend yield.",
  "x.never":"The bottom of the formula is zero or less: box 3 takes all of the dividends, so no portfolio is big enough.",
  "x.s4":"4. Year-by-year projection",
  "x.s4t":"Each year: next year's portfolio = portfolio + dividends + price growth − box 3 tax + invested − spent. Fund costs come off the growth ({terW} while working, {terR} in retirement) and {leak} of dividends is lost to withholding tax inside the fund. While you work it grows at your while-working ETF figures ({wy} dividend + {wg} growth, dividends reinvested); from retirement it uses the retirement ETF ({ry} dividend + {rg} growth). While you work, invested = salary × {p}, and the salary rises {r} a year. After you retire, spent = the yearly cost (rising with inflation) plus any mortgage payments, minus AOW and pension once they start. When the dividends after tax fall short, the rest comes from selling shares. \"You will have\" is the portfolio at the start of age {age}. The year-by-year table shows every step.",
  "x.s5":"5. How much to invest (reverse calculation)",
  "x.s5t":"The projection is run again with different amounts until the portfolio at age {age} just reaches the amount needed. \"Invest each month\" is what you put in every month from now, rising {r} a year with your raises (shown as a % of your salary too). \"Or have invested today\" is the lump sum you would need now instead of {start}, while still investing {p} of your salary.",
  "x.s6":"6. Mortgage",
  "x.s6t":"Month by month: interest = balance × rate ÷ 12, and the rest of the payment pays off the loan. A period with no payment filled in uses an annuity, payment = balance × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n is the months left until the last period ends. Interest deduction (hypotheekrenteaftrek): each year you get back deduction rate × (mortgage interest − imputed rental value), where the imputed rental value (eigenwoningforfait) = WOZ value × {forfait}, and the WOZ value rises {wg} a year, so the deduction shrinks as your home gets more valuable. This refund lowers what the mortgage costs you while you work. It is a reduction of income tax on your salary (box 1), so once you retire and live on box 3 dividends there is no tax left to reduce and the refund stops. The Hillen phase-out and the 30-year limit are not modelled."
};
const t = (key, params) => String(TEXT[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => params && params[k] != null ? params[k] : "");
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[<>&'"]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&#39;",'"':"&quot;"}[c]));

const NOW_YEAR = new Date().getFullYear();
const R_FIELDS = {age:35,retire:60,until:95,salary:50000,raise:2.5,invest:20,start:25000,
  cost:3000,infl:2.5,wYield:2,wGrowth:8.3,yield:3.5,growth:3,oRate:36,oDeemed:6,oFree:59357,nRate:36,nFree:1800,mBal:250000,mDed:37.56,mWoz:400000,mWozGrowth:4,mForfait:0.35,
  aowAge:68,aow:1558,pen:0,penAge:68,wr:2.5,terW:0.2,terR:0.3,leak:10};
const R_DEFAULT_MORT = [{from:NOW_YEAR,to:NOW_YEAR+9,rate:3.8,pay:""},{from:NOW_YEAR+10,to:NOW_YEAR+24,rate:4.2,pay:""}];

const rNum = id => { const v = Number($("#r-"+id).value); return Number.isFinite(v) ? v : 0; };
const money = v => new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v);
const short = v => (v<0?"-":"")+"€"+shortNum(Math.abs(v));
const shortNum = v => { const a=Math.abs(v); return a>=1e6?(v/1e6).toFixed(a>=1e7?0:1)+"M":a>=1e3?Math.round(v/1e3)+"k":String(Math.round(v)); };

/* ---------- inputs ---------- */
function mortRow(r){
  const tr=document.createElement("tr");
  tr.innerHTML=`<td><input type="number" class="m-from" step="1" value="${esc(r.from)}"></td>
<td><input type="number" class="m-to" step="1" value="${esc(r.to)}"></td>
<td><input type="number" class="m-rate" step="0.01" value="${esc(r.rate)}"></td>
<td><input type="number" class="m-pay" step="10" value="${esc(r.pay)}" placeholder="${esc(t("r.mPayPh"))}"></td>
<td><button type="button" class="r-del m-del" title="${esc(t("r.mDel"))}" aria-label="${esc(t("r.mDel"))}">✕</button></td>`;
  tr.querySelector(".m-del").addEventListener("click",()=>{ tr.remove(); recalc(); });
  $("#r-mRows").appendChild(tr);
}
function readMort(){
  return [...document.querySelectorAll("#r-mRows tr")].map(tr=>{
    const g=c=>tr.querySelector(c).value;
    return {from:Number(g(".m-from")),to:Number(g(".m-to")),rate:Number(g(".m-rate"))||0,pay:g(".m-pay")===""?"":Number(g(".m-pay"))};
  }).filter(r=>Number.isFinite(r.from)&&Number.isFinite(r.to)&&r.to>=r.from);
}
function readInputs(){
  const o={}; for(const k in R_FIELDS) o[k]=rNum(k);
  o.partner=$("#r-partner").checked; o.showNew=$("#r-showNew").checked; o.today=$("#r-today").checked; o.mort=readMort(); return o;
}
function saveInputs(o){ try{ localStorage.setItem("retire",JSON.stringify(o)); }catch(_){} }
function loadInputs(){
  let o=null; try{ o=JSON.parse(localStorage.getItem("retire")||"null"); }catch(_){}
  // Saved 2025 defaults move to the 2026 figures; values the user changed are kept.
  if(o){ for(const [k,from,to] of [["oDeemed",5.88,6],["oFree",57684,59357],["mDed",37.48,37.56]]) if(o[k]===from) o[k]=to; }
  for(const k in R_FIELDS) $("#r-"+k).value = o&&Number.isFinite(o[k]) ? o[k] : R_FIELDS[k];
  $("#r-partner").checked=!!(o&&o.partner);
  $("#r-showNew").checked=!!(o&&o.showNew);
  $("#r-today").checked=!!(o&&o.today);
  (o&&Array.isArray(o.mort)?o.mort:R_DEFAULT_MORT).forEach(mortRow);
}

/* ---------- model ---------- */
// Mortgage by calendar year, month by month. A period without a fixed payment gets an annuity
// that clears the balance by the end of the last period.
function mortgageYears(bal,periods){
  const out=new Map(); if(!(bal>0)||!periods.length) return out;
  const last=Math.max(...periods.map(p=>p.to));
  for(let y=NOW_YEAR;y<=last;y++){
    const p=periods.find(q=>y>=q.from&&y<=q.to);
    let interest=0, paid=0;
    if(p&&bal>0){
      const r=p.rate/100/12;
      for(let m=0;m<12&&bal>0;m++){
        const n=(last-y+1)*12-m;
        const pay=p.pay!==""?p.pay:(r?bal*r/(1-Math.pow(1+r,-n)):bal/n);
        const i=bal*r, princ=Math.min(bal,pay-i);
        interest+=i; paid+=i+princ; bal-=princ;
      }
    }
    out.set(y,{interest,paid,bal:Math.max(0,bal)});
  }
  return out;
}

// Mortgage interest deduction per year: rate × (interest − WOZ × eigenwoningforfait), WOZ rising by its own growth rate.
// It only lowers income tax on box 1 income (salary), so there is no refund once you retire on box 3 dividends.
// net = what the mortgage really costs that year after the refund.
function applyDeduction(mort,inp){
  const retireYear=NOW_YEAR+inp.retire-inp.age;
  for(const [yr,m] of mort){
    const woz=inp.mWoz*Math.pow(1+inp.mWozGrowth/100,yr-NOW_YEAR);
    m.forfait=m.interest>0?woz*inp.mForfait/100:0;
    m.refund=yr<retireYear?inp.mDed/100*Math.max(0,m.interest-m.forfait):0;
    m.net=m.paid-m.refund;
  }
  return mort;
}

// Box 3 tax for one year on a portfolio of w. f = inflation index for the tax-free amounts.
function box3(regime,inp,w,div,gain,f){
  const people=inp.partner?2:1;
  if(regime==="old") return inp.oRate/100*inp.oDeemed/100*Math.max(0,w-inp.oFree*people*f);
  return inp.nRate/100*Math.max(0,div+gain-inp.nFree*people*f);
}

// Yield and growth after fund costs (TER, taken off growth) and dividend leakage (withholding tax lost inside
// the fund). wy/wg = while working, ry/rg = in retirement.
function effective(inp){
  const keep=1-inp.leak/100;
  inp.wy=inp.wYield*keep; inp.wg=inp.wGrowth-inp.terW;
  inp.ry=inp.yield*keep;  inp.rg=inp.growth-inp.terR;
}

// AOW + employer pension in a year, rising with inflation (f). With startedOnly=false: the full amount as if both
// were already paid, i.e. the part of your costs the portfolio will not have to cover in the long run.
function benefits(inp,age,f,startedOnly=true){
  let b=0;
  if(!startedOnly||age>=inp.aowAge) b+=inp.aow*12*f;
  if(!startedOnly||age>=inp.penAge) b+=inp.pen*12*f;
  return b;
}

// Closed form: portfolio whose dividends after box 3 tax pay `spend` a year, with the tax also paid from dividends.
function needed(regime,inp,spend,f){
  const y=inp.ry/100, g=inp.rg/100, people=inp.partner?2:1;
  if(spend<=0) return 0;
  if(y<=0) return Infinity;
  if(regime==="old"){
    const rd=inp.oRate/100*inp.oDeemed/100, free=inp.oFree*people*f;
    if(spend/y<=free) return spend/y;
    return y>rd?Math.max(free,(spend-rd*free)/(y-rd)):Infinity;
  }
  const r=inp.nRate/100, free=inp.nFree*people*f;
  if(spend/y*(y+g)<=free) return spend/y;
  const den=y-r*(y+g);
  return den>0?(spend-r*free)/den:Infinity;
}

const mortYear=(inp,mort,yr)=>mort.get(yr)||{interest:0,paid:0,refund:0,net:0,bal:mort.size?[...mort.values()].pop().bal:Math.max(0,inp.mBal)};

// Does a portfolio of W0 at retirement work? Every year until the last planned age, dividends after box 3 tax must
// cover costs minus AOW and pension (even before those start). Until they start, the part they will later pay comes
// from selling shares (the bridge). The money must not run out.
function retireOK(regime,inp,mort,W0){
  let w=W0;
  for(let age=inp.retire, yr=NOW_YEAR+inp.retire-inp.age; age<=inp.until; age++, yr++){
    const f=Math.pow(1+inp.infl/100,yr-NOW_YEAR), base=inp.cost*12*f+mortYear(inp,mort,yr).net;
    const div=w*inp.ry/100, gain=w*inp.rg/100, tax=box3(regime,inp,w,div,gain,f);
    if(div-tax<base-benefits(inp,age,f,false)-0.5) return false;
    w+=div+gain-tax-Math.max(0,base-benefits(inp,age,f));
    if(w<0) return false;
  }
  return true;
}
function neededSim(regime,inp,mort){
  if(retireOK(regime,inp,mort,0)) return 0;
  let lo=0, hi=1e5;
  while(!retireOK(regime,inp,mort,hi)){ lo=hi; hi*=2; if(hi>1e13) return Infinity; }
  for(let i=0;i<60;i++){ const mid=(lo+hi)/2; if(retireOK(regime,inp,mort,mid)) hi=mid; else lo=mid; }
  return hi;
}

function simulate(regime,inp,investPct,mort,start=inp.start){
  const rows=[]; let w=start, salary=inp.salary, firstSell=null, broke=null;
  for(let age=inp.age, yr=NOW_YEAR; age<=inp.until; age++, yr++){
    const f=Math.pow(1+inp.infl/100,yr-NOW_YEAR), working=age<inp.retire;
    const m=mortYear(inp,mort,yr);
    const yl=working?inp.wy:inp.ry, gr=working?inp.wg:inp.rg;
    const div=w*yl/100, gain=w*gr/100, tax=box3(regime,inp,w,div,gain,f);
    const contrib=working?salary*investPct/100:0;
    const ben=working?0:benefits(inp,age,f);
    const spend=working?0:Math.max(0,inp.cost*12*f+m.net-ben);
    if(!working&&firstSell==null&&div-tax<spend-0.5) firstSell=age;
    rows.push({yr,age,salary:working?salary:0,contrib,spend,ben,left:working?salary-contrib-m.net:0,
      mInt:m.interest,mPaid:m.paid,mRef:m.refund,mBal:m.bal,w,tax});
    w=Math.max(0,w+div+gain-tax+contrib-spend);
    if(w<=0&&broke==null&&!working) broke=age;
    if(working) salary*=1+inp.raise/100;
  }
  return {rows,firstSell,broke};
}

function analyse(regime,inp,mort){
  const yrs=inp.retire-inp.age, yr=NOW_YEAR+yrs, f=Math.pow(1+inp.infl/100,yrs);
  const m=mort.get(yr), mPaid=m?m.net:0, costYear=inp.cost*12*f;
  const fullBen=benefits(inp,inp.retire,f,false), startedBen=benefits(inp,inp.retire,f);
  const need=neededSim(regime,inp,mort), needNoMort=mPaid>0?neededSim(regime,inp,new Map()):null;
  // The dividend part on its own, from the closed form, for "How this is calculated".
  const divSpend=Math.max(0,costYear+mPaid-fullBen), divPart=needed(regime,inp,divSpend,f);
  // D: selling shares instead. Withdraw wr% of the starting portfolio for the long-run cost, plus a bridge pot
  // for the AOW/pension part until it starts.
  let bridge=0;
  for(let a=inp.retire;a<=inp.until;a++){ const fa=Math.pow(1+inp.infl/100,a-inp.age); bridge+=benefits(inp,a,fa,false)-benefits(inp,a,fa); }
  const wrNeed=inp.wr>0?divSpend/(inp.wr/100)+bridge:Infinity;
  const atRetire=s=>{ const row=s.rows.find(r=>r.age===inp.retire); return row?row.w:s.rows.length?s.rows[s.rows.length-1].w:inp.start; };
  const sim=simulate(regime,inp,inp.invest,mort), have=atRetire(sim);
  // Reverse: what gets you to `need` by retirement. Both searches are bisections on a monotonic result.
  const reach=(pct,start)=>atRetire(simulate(regime,inp,pct,mort,start))>=need;
  const solve=(ok,hi)=>{ let lo=0; while(!ok(hi)&&hi<1e12) { lo=hi; hi*=2; } if(!ok(hi)) return Infinity;
    for(let i=0;i<50;i++){ const mid=(lo+hi)/2; if(ok(mid)) hi=mid; else lo=mid; } return hi; };
  let pct=null, monthly=null, lump=null;
  if(Number.isFinite(need)){
    if(inp.salary>0){ pct=reach(0,inp.start)?0:solve(p=>reach(p,inp.start),100); monthly=pct*inp.salary/100/12; }
    lump=reach(inp.invest,0)?0:solve(st=>reach(inp.invest,st),Math.max(1000,need));
  }
  const div=have*inp.ry/100, netDiv=div-box3(regime,inp,have,div,have*inp.rg/100,f);
  return {need,needNoMort,have,pct,monthly,lump,sim,yr,costYear,mPaid,fullBen,startedBen,divSpend,divPart,bridge,wrNeed,
    mortLeft:m?m.bal+m.paid-m.interest:0,netDiv};
}

/* ---------- output ---------- */
// "Show amounts in today's money": divide a year's euros by inflation since now.
let deflate=()=>1;
const M=(v,yr)=>money(v/deflate(yr)), S=(v,yr)=>short(v/deflate(yr));
// First mortgage year's interest deduction, worked out.
function mortCalc(inp,mort){
  const first=[...mort].find(([,m])=>m.interest>0); if(!first) return "";
  const [yr,m]=first, pc=v=>Number(v.toFixed(2))+"%";
  return `<div class="calc"><div>${esc(yr)}: forfait = ${esc(money(m.forfait/inp.mForfait*100))} WOZ × ${esc(pc(inp.mForfait))} = ${esc(money(m.forfait))}</div><div>${esc(yr)}: ${esc(pc(inp.mDed))} × (${esc(money(m.interest))} − ${esc(money(m.forfait))}) = ${esc(money(m.refund))} back</div>
<div>${esc(money(m.paid))} paid − ${esc(money(m.refund))} = ${esc(money(m.net))} real cost (${esc(money(m.net/12))} a month)</div></div>`;
}

// Step-by-step working with the user's own numbers (in future euros, as the formulas need).
function explain(inp,o,nw,mort){
  const pc=v=>Number(v.toFixed(2))+"%", m2=v=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
  const yrs=inp.retire-inp.age, f=Math.pow(1+inp.infl/100,yrs), people=inp.partner?2:1;
  const cost=o.costYear+o.mPaid, oFree=inp.oFree*people*f, nFree=inp.nFree*people*f;
  const y=inp.ry, rd=inp.oRate*inp.oDeemed/100, rn=inp.nRate*(inp.ry+inp.rg)/100;
  const calc=lines=>`<div class="calc">${lines.map(l=>`<div>${esc(l)}</div>`).join("")}</div>`;
  const step=(h,p,body)=>`<h3>${esc(h)}</h3><p>${esc(p)}</p>${body||""}`;
  const s1=[`${money(inp.cost)} × 12 × (1 + ${pc(inp.infl)})^${yrs} = ${money(o.costYear)}`+(o.mPaid>0?` + ${money(o.mPaid)} (${t("x.mort")}) = ${money(cost)}`:"")];
  if(o.fullBen>0) s1.push(`AOW ${money(inp.aow)} (from age ${inp.aowAge})${inp.pen>0?` + pension ${money(inp.pen)} (from age ${inp.penAge})`:""} a month × 12 × (1 + ${pc(inp.infl)})^${yrs} = ${money(o.fullBen)} a year`,
    `left for the portfolio in the long run: ${money(cost)} − ${money(o.fullBen)} = ${money(o.divSpend)}`);
  const per=tax=>`${t("x.div")} ${m2(inp.yield)} − leakage ${pc(inp.leak)} = ${m2(y)}, − ${t("x.tax")} ${m2(tax)} = ${m2(y-tax)} ${t("x.left")}`;
  const needLine=(regime,a)=>{
    const lbl=t(regime==="old"?"r.old":"r.new");
    if(!Number.isFinite(a.need)) return [lbl+":",t("x.never")];
    const sp=a.divSpend, lines=[lbl+":"];
    if(!Number.isFinite(a.divPart)) lines.push(t("x.never"));
    else if(Math.abs(a.divPart-sp/(y/100))<1) lines.push(t("x.noTax"),`dividend part: ${money(sp)} ÷ ${pc(y)} = ${money(a.divPart)}`);
    else if(regime==="old") lines.push(t("x.fOld"),`dividend part: (${money(sp)} − ${pc(inp.oRate)} × ${pc(inp.oDeemed)} × ${money(oFree)}) ÷ (${pc(y)} − ${pc(rd)}) = ${money(a.divPart)}`);
    else lines.push(t("x.fNew"),`dividend part: (${money(sp)} − ${pc(inp.nRate)} × ${money(nFree)}) ÷ (${pc(y)} − ${pc(inp.nRate)} × ${pc(inp.ry+inp.rg)}) = ${money(a.divPart)}`);
    if(Number.isFinite(a.divPart)&&a.need-a.divPart>1) lines.push(`+ ${money(a.need-a.divPart)} for the bridge until AOW/pension and for later years = ${money(a.need)} needed`);
    return lines;
  };
  const wrLine=a=>`${money(a.divSpend)} ÷ ${pc(inp.wr)}${a.bridge>0?` + bridge ${money(a.bridge)}`:""} = ${money(a.wrNeed)}`;
  return `<details class="explain" open><summary>${esc(t("x.h"))}</summary><p class="sub">${esc(t("x.intro"))}${inp.today?" The steps use future euros; the results above are shown in today's money.":""}</p>
${step(t("x.s1"),t("x.s1t",{year:o.yr,n:yrs}),calc(s1))}
${step(t("x.s2"),t("x.s2t",{leak:pc(inp.leak)}),calc([
  `${t("r.old")}: ${t("x.tax")} = ${pc(inp.oRate)} × ${pc(inp.oDeemed)} × €100 = ${m2(rd)}`, per(rd),
  ...(nw?[`${t("r.new")}: ${t("x.tax")} = ${pc(inp.nRate)} × (${pc(y)} + ${pc(inp.rg)}) × €100 = ${m2(rn)}`, per(rn)]:[])])
  +(nw?`<p>${esc(t("x.s2new",{g:m2(inp.rg)}))}</p>`:""))}
${step(t("x.s3"),t("x.s3t",{age:inp.retire,until:inp.until,year:o.yr,free:nw?`${money(oFree)} (old) and ${money(nFree)} (new)`:money(oFree),partner:inp.partner?t("x.partner"):""}),
  calc(needLine("old",o))+(nw?calc(needLine("new",nw)):""))}
${step(t("x.s4"),t("x.s4t",{p:pc(inp.invest),r:pc(inp.raise),age:inp.retire,wy:pc(inp.wYield),wg:pc(inp.wGrowth),ry:pc(inp.yield),rg:pc(inp.growth),terW:pc(inp.terW),terR:pc(inp.terR),leak:pc(inp.leak)}))}
${step(t("x.s5"),t("x.s5t",{age:inp.retire,r:pc(inp.raise),start:money(inp.start),p:pc(inp.invest)}))}
${step(t("x.s6"),t("x.s6t",{forfait:pc(inp.mForfait),wg:pc(inp.mWozGrowth)}),mortCalc(inp,mort))}
${step("7. Selling shares instead",`For comparison: instead of living only on dividends, you sell shares too and take out ${pc(inp.wr)} of the starting portfolio a year, rising with inflation. Dutch FIRE planners use 2–3% rather than the US 4% because of box 3. Needed = long-run yearly cost from step 1 ÷ withdrawal rate${o.bridge>0?", plus a bridge pot that pays the AOW/pension part until it starts":""}.`,
  calc([`${t("r.old")}: ${wrLine(o)}`]))}
</details>`;
}

function card(regime,a,inp){
  const legend=t(regime==="old"?"r.old":"r.new"), yr=a.yr;
  if(!Number.isFinite(a.need)) return `<div class="rcard"><h3>${esc(legend)}</h3><p class="rwarn">${esc(t("r.never"))}</p>
<div class="kv"><span>${esc(t("r.have"))}</span><b>${esc(M(a.have,yr))}</b></div></div>`;
  const diff=a.have-a.need;
  const rev=[];
  if(a.monthly!=null) rev.push(`<div class="kv"><span>Invest each month from now<small>${esc(Number.isFinite(a.pct)?a.pct.toFixed(1)+"% of salary, rising "+inp.raise+"% a year with your raises":"")}</small></span><b>${esc(Number.isFinite(a.monthly)?money(a.monthly):"—")}</b></div>`);
  if(a.lump!=null) rev.push(`<div class="kv"><span>Or have invested today<small>instead of ${esc(money(inp.start))}, keeping ${esc(inp.invest)}% of salary</small></span><b>${esc(Number.isFinite(a.lump)?money(a.lump):"—")}</b></div>`);
  const notes=[];
  if(a.fullBen>0){
    const from=Math.min(...[[inp.aow,inp.aowAge],[inp.pen,inp.penAge]].filter(([v])=>v>0).map(([,g])=>g));
    notes.push(from>inp.retire?`${inp.aow>0&&inp.pen>0?"AOW and pension start":inp.aow>0?"AOW starts":"Pension starts"} at ${from}. Until then you sell shares for that part (the bridge).`:`AOW and pension pay ${M(a.fullBen,yr)} a year of your costs.`);
  }
  if(a.needNoMort!=null&&Number.isFinite(a.needNoMort)) notes.push(t("r.afterMort",{v:M(a.needNoMort,yr)}));
  notes.push(t("r.netDiv",{v:M(a.netDiv,yr)}));
  if(a.sim.firstSell!=null) notes.push(t("r.sells",{age:a.sim.firstSell}));
  notes.push(a.sim.broke!=null?t("r.lasts",{age:a.sim.broke}):t("r.lastsOk",{age:inp.until}));
  const wrOk=a.have>=a.wrNeed;
  return `<div class="rcard ${regime}"><h3>${esc(legend)}</h3>
<div class="kv"><span>${esc(t("r.need"))}</span><b>${esc(M(a.need,yr))}</b></div>
<div class="kv"><span>${esc(t("r.have"))}</span><b>${esc(M(a.have,yr))}</b></div>
<div class="kv ${diff>=0?"ok":"bad"}"><span>${esc(t(diff>=0?"r.surplus":"r.gap"))}</span><b>${esc(M(Math.abs(diff),yr))}</b></div>
<div class="r-reverse"><h4>${diff>=0?"On track. Enough would be":"To have enough"}</h4>${rev.join("")}</div>
${Number.isFinite(a.wrNeed)?`<div class="r-reverse"><h4>Selling shares instead (${esc(inp.wr)}% a year)</h4><div class="kv ${wrOk?"ok":"bad"}"><span>Needed<small>${esc(wrOk?"you'd have enough":"short by "+M(a.wrNeed-a.have,yr))}</small></span><b>${esc(M(a.wrNeed,yr))}</b></div></div>`:""}
<ul class="rnotes">${notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul></div>`;
}

function chart(inp,o,nw){
  const W=640,H=260,L=52,R=10,T=12,B=28;
  const rowsO=o.sim.rows, rowsN=nw?nw.sim.rows:[]; if(!rowsO.length) return "";
  const ry=o.yr, wv=r=>r.w/deflate(r.yr);
  const pts=[...rowsO.map(wv),...rowsN.map(wv),...[o.need,nw&&nw.need].filter(Number.isFinite).map(v=>v/deflate(ry))];
  const maxY=Math.max(1,...pts)*1.05, a0=inp.age, a1=Math.max(inp.age+1,inp.until);
  const x=a=>L+(a-a0)/(a1-a0)*(W-L-R), y=v=>T+(1-v/maxY)*(H-T-B);
  const line=(rows,cls)=>`<polyline class="${cls}" fill="none" stroke-width="2.5" stroke-linejoin="round" points="${rows.map(r=>x(r.age).toFixed(1)+","+y(wv(r)).toFixed(1)).join(" ")}"/>`;
  const ticks=[]; for(let i=0;i<=4;i++){ const v=maxY*i/4; ticks.push(`<line class="ch-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ch-lbl" x="${L-6}" y="${y(v)+4}" text-anchor="end">${short(v)}</text>`); }
  const step=Math.max(5,Math.ceil((a1-a0)/8/5)*5);
  for(let a=Math.ceil(a0/step)*step;a<=a1;a+=step) ticks.push(`<text class="ch-lbl" x="${x(a)}" y="${H-8}" text-anchor="middle">${a}</text>`);
  const rx=x(inp.retire);
  const dot=(v,cls)=>Number.isFinite(v)?`<circle class="${cls}" cx="${rx}" cy="${y(v/deflate(ry))}" r="5" stroke-width="2"/>`:"";
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("r.chartAlt"))}">${ticks.join("")}
<line class="ch-retire" x1="${rx}" x2="${rx}" y1="${T}" y2="${H-B}" stroke-dasharray="4 4"/>
${line(rowsO,"ch-old")}${nw?line(rowsN,"ch-new")+dot(nw.need,"ch-need-new"):""}${dot(o.need,"ch-need-old")}</svg>
<div class="legend"><span class="sw old"></span>${esc(t("r.legOld"))}${nw?`<span class="sw new"></span>${esc(t("r.legNew"))}`:""}<span class="sw need"></span>${esc(t("r.legNeed"))}<span class="sw retire"></span>${esc(t("r.legRetire"))}</div>`;
}

function table(o,nw){
  const cols=["c.year","c.age","c.salary","c.contrib","c.left","c.spend","c.ben","c.mInt","c.mPaid","c.mRef","c.mBal","c.wOld","c.taxOld",...(nw?["c.wNew","c.taxNew"]:[])];
  const body=o.sim.rows.map((r,i)=>{ const n=nw&&nw.sim.rows[i];
    const Y=v=>M(v,r.yr);
    const cells=[r.yr,r.age,Y(r.salary),Y(r.contrib),Y(r.left),Y(r.spend),Y(r.ben),Y(r.mInt),Y(r.mPaid),Y(r.mRef),Y(r.mBal),Y(r.w),Y(r.tax),...(n?[Y(n.w),Y(n.tax)]:[])];
    return `<tr${r.spend>0?' class="ret"':""}>${cells.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`; }).join("");
  return `<div class="tblwrap"><table class="rtable"><thead><tr>${cols.map(c=>`<th>${esc(t(c))}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function recalc(){
  const inp=readInputs(); saveInputs(inp);
  document.querySelectorAll(".r-preset").forEach(b=>{ const w=b.dataset.phase==="w";
    b.setAttribute("aria-pressed",String(Number(b.dataset.yield)===(w?inp.wYield:inp.yield)&&Number(b.dataset.growth)===(w?inp.wGrowth:inp.growth))); });
  document.querySelectorAll(".r-aowp").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.aow)===inp.aow)));
  if(inp.retire<inp.age) inp.retire=inp.age;
  if(inp.until<inp.retire) inp.until=inp.retire;
  effective(inp);
  deflate=yr=>inp.today?Math.pow(1+inp.infl/100,yr-NOW_YEAR):1;
  const mort=applyDeduction(mortgageYears(inp.mBal,inp.mort),inp);
  $("#r-newBox").hidden=!inp.showNew;
  const o=analyse("old",inp,mort), nw=inp.showNew?analyse("new",inp,mort):null;
  const head=t("r.atRetire",{age:inp.retire,year:o.yr,cost:M(o.costYear+o.mPaid,o.yr),month:M((o.costYear+o.mPaid)/12,o.yr),
    mort:o.mPaid>0?t("r.atRetireMort",{m:M(o.mPaid,o.yr)}):""});
  const left=(o.mortLeft>0.5?" "+t("r.mortLeft",{v:M(o.mortLeft,o.yr)}):"")+(inp.today?" All amounts are in today's money.":"");
  const sum=(label,a)=>!Number.isFinite(a.need)
    ? `<div><b>${esc(label)}</b> <span class="bad">not possible on dividends</span> · have ${esc(S(a.have,a.yr))}</div>`
    : `<div><b>${esc(label)}</b> need ${esc(S(a.need,a.yr))} · have ${esc(S(a.have,a.yr))} · <span class="${a.have>=a.need?"ok":"bad"}">${a.have>=a.need?"ahead":"short"} ${esc(S(Math.abs(a.have-a.need),a.yr))}</span>${a.monthly!=null&&Number.isFinite(a.monthly)?` · invest ${esc(short(a.monthly))}/mo`:""}</div>`;
  $("#r-summary").innerHTML=sum(nw?"Old box 3":"Box 3",o)+(nw?sum("New box 3",nw):"")+(inp.today?`<div class="r-today-note">in today's money</div>`:"");
  // Keep the "How this is calculated" and "Year by year" sections open or closed across recalculations.
  const wasOpen=[...document.querySelectorAll("#r-out details")].map(d=>d.open);
  $("#r-out").innerHTML=`<p class="rhead">${esc(head+left)}</p>
<div class="rcards">${card("old",o,inp)}${nw?card("new",nw,inp):""}</div>
<section><h2 class="rsec">${esc(t("r.chart"))}</h2>${chart(inp,o,nw)}</section>
${explain(inp,o,nw,mort)}
<details><summary>${esc(t("r.table"))}</summary>${table(o,nw)}</details>
<p class="sub">${esc(t("r.disc"))}</p>`;
  if(wasOpen.length) document.querySelectorAll("#r-out details").forEach((d,i)=>{ d.open=wasOpen[i]; });
}

let ready = false;
window.retireInit = function () {
  if (!ready) {
    ready = true;
    loadInputs();
    $("#r-form").addEventListener("input", recalc);
    document.querySelectorAll(".r-preset").forEach(b => b.addEventListener("click", () => {
      const w = b.dataset.phase === "w";
      $(w ? "#r-wYield" : "#r-yield").value = b.dataset.yield;
      $(w ? "#r-wGrowth" : "#r-growth").value = b.dataset.growth;
      recalc();
    }));
    document.querySelectorAll(".r-aowp").forEach(b => b.addEventListener("click", () => {
      $("#r-aow").value = b.dataset.aow;
      recalc();
    }));
    $("#r-form").addEventListener("submit", e => e.preventDefault());
    $("#r-mAdd").addEventListener("click", () => {
      const rows = readMort(), lastTo = rows.length ? Math.max(...rows.map(r => r.to)) : NOW_YEAR - 1;
      mortRow({from: lastTo + 1, to: lastTo + 10, rate: rows.length ? rows[rows.length - 1].rate : 4, pay: ""});
      recalc();
    });
  }
  recalc();
};
})();
