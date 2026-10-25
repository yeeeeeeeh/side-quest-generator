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
  "r.box3Hint":"Defaults are the 2025 rules and the new-system bill. Tax-free amounts and your monthly cost rise with inflation. Dividend withholding tax is assumed to be credited.",
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
  "c.left":"Salary left","c.mInt":"Mortgage interest","c.mPaid":"Mortgage paid","c.mRef":"Interest deduction","c.mBal":"Mortgage owed",
  "c.wOld":"Portfolio (old)","c.taxOld":"Tax (old)","c.wNew":"Portfolio (new)","c.taxNew":"Tax (new)",
  "r.disc":"An estimate, not financial advice. Returns are assumed steady every year; real markets are not.",
  "x.h":"How this is calculated",
  "x.intro":"Every step below uses the numbers you entered, so you can check it by hand.",
  "x.s1":"1. Yearly cost when you retire",
  "x.s1t":"Your monthly cost grows with inflation every year from now until you retire in {year} ({n} years).",
  "x.mort":"mortgage that year after interest deduction",
  "x.s2":"2. What box 3 takes, per €100 invested",
  "x.s2t":"Box 3 is charged every year and is paid out of the dividends. This is per €100 above the tax-free amount.",
  "x.div":"dividend","x.tax":"tax","x.left":"left to spend",
  "x.s2new":"The new box 3 also taxes the {g} price growth per €100, even though you don't sell, so that tax comes out of the dividends too.",
  "x.s3":"3. Portfolio needed at retirement",
  "x.s3t":"The smallest portfolio whose dividends, after box 3 tax, pay the yearly cost from step 1. In {year} the tax-free amounts have grown with inflation to {oFree} (old) and {nFree} (new){partner}.",
  "x.partner":", for two partners",
  "x.fOld":"needed = (yearly cost − tax rate × deemed return × tax-free wealth) ÷ (dividend yield − tax rate × deemed return)",
  "x.fNew":"needed = (yearly cost − tax rate × tax-free return) ÷ (dividend yield − tax rate × (dividend yield + price growth))",
  "x.noTax":"This is below the tax-free amount, so no box 3 tax: needed = yearly cost ÷ dividend yield.",
  "x.never":"The bottom of the formula is zero or less: box 3 takes all of the dividends, so no portfolio is big enough.",
  "x.s4":"4. Year-by-year projection",
  "x.s4t":"Each year: next year's portfolio = portfolio + dividends + price growth − box 3 tax + invested − spent. While you work, invested = salary × {p}, and the salary rises {r} a year. After you retire, spent = the yearly cost (rising with inflation) plus any mortgage payments after interest deduction. When the dividends after tax fall short, the rest comes from selling shares. \"You will have\" is the portfolio at the start of age {age}. The year-by-year table shows every step.",
  "x.s5":"5. % of salary needed",
  "x.s5t":"The projection is run again with different percentages until the portfolio at age {age} just reaches the amount needed.",
  "x.s6":"6. Mortgage",
  "x.s6t":"Month by month: interest = balance × rate ÷ 12, and the rest of the payment pays off the loan. A period with no payment filled in uses an annuity, payment = balance × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n is the months left until the last period ends. Interest deduction (hypotheekrenteaftrek): each year you get back deduction rate × (mortgage interest − imputed rental value), where the imputed rental value (eigenwoningforfait) = WOZ value × {forfait}, and the WOZ value rises with inflation. This refund lowers what the mortgage costs you, both from your salary and from the portfolio. The Hillen phase-out and the 30-year limit are not modelled."
};
const t = (key, params) => String(TEXT[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => params && params[k] != null ? params[k] : "");
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[<>&'"]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&#39;",'"':"&quot;"}[c]));

const NOW_YEAR = new Date().getFullYear();
const R_FIELDS = {age:35,retire:60,until:95,salary:50000,raise:2.5,invest:20,start:25000,
  cost:3000,infl:2.5,yield:3.5,growth:3,oRate:36,oDeemed:5.88,oFree:57684,nRate:36,nFree:1800,mBal:250000,mDed:37.48,mWoz:400000,mForfait:0.35};
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
  o.partner=$("#r-partner").checked; o.mort=readMort(); return o;
}
function saveInputs(o){ try{ localStorage.setItem("retire",JSON.stringify(o)); }catch(_){} }
function loadInputs(){
  let o=null; try{ o=JSON.parse(localStorage.getItem("retire")||"null"); }catch(_){}
  for(const k in R_FIELDS) $("#r-"+k).value = o&&Number.isFinite(o[k]) ? o[k] : R_FIELDS[k];
  $("#r-partner").checked=!!(o&&o.partner);
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

// Mortgage interest deduction per year: rate × (interest − WOZ × eigenwoningforfait), WOZ rising with inflation.
// net = what the mortgage really costs that year after the refund.
function applyDeduction(mort,inp){
  for(const [yr,m] of mort){
    const woz=inp.mWoz*Math.pow(1+inp.infl/100,yr-NOW_YEAR);
    m.forfait=m.interest>0?woz*inp.mForfait/100:0;
    m.refund=inp.mDed/100*Math.max(0,m.interest-m.forfait);
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

// Portfolio needed so that dividends after box 3 tax pay `spend` per year, with the tax also paid from dividends.
function needed(regime,inp,spend,f){
  const y=inp.yield/100, g=inp.growth/100, people=inp.partner?2:1;
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

function simulate(regime,inp,investPct,mort){
  const rows=[]; let w=inp.start, salary=inp.salary, firstSell=null, broke=null;
  for(let age=inp.age, yr=NOW_YEAR; age<=inp.until; age++, yr++){
    const f=Math.pow(1+inp.infl/100,yr-NOW_YEAR), working=age<inp.retire;
    const m=mort.get(yr)||{interest:0,paid:0,refund:0,net:0,bal:mort.size?[...mort.values()].pop().bal:Math.max(0,inp.mBal)};
    const div=w*inp.yield/100, gain=w*inp.growth/100, tax=box3(regime,inp,w,div,gain,f);
    const contrib=working?salary*investPct/100:0;
    const spend=working?0:inp.cost*12*f+m.net;
    if(!working&&firstSell==null&&div-tax<spend-0.5) firstSell=age;
    rows.push({yr,age,salary:working?salary:0,contrib,spend,left:working?salary-contrib-m.net:0,
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
  const need=needed(regime,inp,costYear+mPaid,f), needNoMort=needed(regime,inp,costYear,f);
  const atRetire=s=>{ const row=s.rows.find(r=>r.age===inp.retire); return row?row.w:s.rows.length?s.rows[s.rows.length-1].w:inp.start; };
  const sim=simulate(regime,inp,inp.invest,mort), have=atRetire(sim);
  let pct=null;
  if(Number.isFinite(need)){
    if(atRetire(simulate(regime,inp,100,mort))>=need){
      let lo=0, hi=100;
      for(let i=0;i<40;i++){ const mid=(lo+hi)/2; if(atRetire(simulate(regime,inp,mid,mort))>=need) hi=mid; else lo=mid; }
      pct=hi;
    } else pct=Infinity;
  }
  const div=have*inp.yield/100, netDiv=div-box3(regime,inp,have,div,have*inp.growth/100,f);
  return {need,needNoMort,have,pct,sim,yr,costYear,mPaid,mortLeft:m?m.bal+m.paid-m.interest:0,netDiv};
}

/* ---------- output ---------- */
// First mortgage year's interest deduction, worked out.
function mortCalc(inp,mort){
  const first=[...mort].find(([,m])=>m.interest>0); if(!first) return "";
  const [yr,m]=first, pc=v=>Number(v.toFixed(2))+"%";
  return `<div class="calc"><div>${esc(yr)}: ${esc(pc(inp.mDed))} × (${esc(money(m.interest))} − ${esc(money(m.forfait))}) = ${esc(money(m.refund))} back</div>
<div>${esc(money(m.paid))} paid − ${esc(money(m.refund))} = ${esc(money(m.net))} real cost (${esc(money(m.net/12))} a month)</div></div>`;
}

// Step-by-step working with the user's own numbers.
function explain(inp,o,nw,mort){
  const pc=v=>Number(v.toFixed(2))+"%", m2=v=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
  const yrs=inp.retire-inp.age, f=Math.pow(1+inp.infl/100,yrs), people=inp.partner?2:1;
  const cost=o.costYear+o.mPaid, oFree=inp.oFree*people*f, nFree=inp.nFree*people*f;
  const y=inp.yield, rd=inp.oRate*inp.oDeemed/100, rn=inp.nRate*(inp.yield+inp.growth)/100;
  const calc=lines=>`<div class="calc">${lines.map(l=>`<div>${esc(l)}</div>`).join("")}</div>`;
  const step=(h,p,body)=>`<h3>${esc(h)}</h3><p>${esc(p)}</p>${body||""}`;
  let s1=`${money(inp.cost)} × 12 × (1 + ${pc(inp.infl)})^${yrs} = ${money(o.costYear)}`;
  if(o.mPaid>0) s1+=` + ${money(o.mPaid)} (${t("x.mort")}) = ${money(cost)}`;
  const per=tax=>`${t("x.div")} ${m2(y)} − ${t("x.tax")} ${m2(tax)} = ${m2(y-tax)} ${t("x.left")}`;
  const needLine=(regime,a)=>{
    const lbl=t(regime==="old"?"r.old":"r.new");
    if(!Number.isFinite(a.need)) return [lbl+":",t("x.never")];
    if(Math.abs(a.need-cost/(y/100))<1) return [lbl+":",t("x.noTax"),`${money(cost)} ÷ ${pc(y)} = ${money(a.need)}`];
    return regime==="old"
      ? [lbl+":",t("x.fOld"),`(${money(cost)} − ${pc(inp.oRate)} × ${pc(inp.oDeemed)} × ${money(oFree)}) ÷ (${pc(y)} − ${pc(rd)}) = ${money(a.need)}`]
      : [lbl+":",t("x.fNew"),`(${money(cost)} − ${pc(inp.nRate)} × ${money(nFree)}) ÷ (${pc(y)} − ${pc(inp.nRate)} × ${pc(inp.yield+inp.growth)}) = ${money(a.need)}`];
  };
  return `<details class="explain" open><summary>${esc(t("x.h"))}</summary><p class="sub">${esc(t("x.intro"))}</p>
${step(t("x.s1"),t("x.s1t",{year:o.yr,n:yrs}),calc([s1]))}
${step(t("x.s2"),t("x.s2t"),calc([
  `${t("r.old")}: ${t("x.tax")} = ${pc(inp.oRate)} × ${pc(inp.oDeemed)} × €100 = ${m2(rd)}`, per(rd),
  `${t("r.new")}: ${t("x.tax")} = ${pc(inp.nRate)} × (${pc(y)} + ${pc(inp.growth)}) × €100 = ${m2(rn)}`, per(rn)])
  +`<p>${esc(t("x.s2new",{g:m2(inp.growth)}))}</p>`)}
${step(t("x.s3"),t("x.s3t",{year:o.yr,oFree:money(oFree),nFree:money(nFree),partner:inp.partner?t("x.partner"):""}),
  calc(needLine("old",o))+calc(needLine("new",nw)))}
${step(t("x.s4"),t("x.s4t",{p:pc(inp.invest),r:pc(inp.raise),age:inp.retire}))}
${step(t("x.s5"),t("x.s5t",{age:inp.retire}))}
${step(t("x.s6"),t("x.s6t",{forfait:pc(inp.mForfait)}),mortCalc(inp,mort))}
</details>`;
}

function card(regime,a,inp){
  const legend=t(regime==="old"?"r.old":"r.new");
  if(!Number.isFinite(a.need)) return `<div class="rcard"><h3>${esc(legend)}</h3><p class="rwarn">${esc(t("r.never"))}</p>
<div class="kv"><span>${esc(t("r.have"))}</span><b>${esc(money(a.have))}</b></div></div>`;
  const diff=a.have-a.need;
  const pctTxt=a.pct===Infinity?t("r.pctNo"):a.pct!=null?t("r.pct",{p:a.pct.toFixed(1)}):"";
  const notes=[];
  if(a.mPaid>0&&Number.isFinite(a.needNoMort)) notes.push(t("r.afterMort",{v:money(a.needNoMort)}));
  notes.push(t("r.netDiv",{v:money(a.netDiv)}));
  if(a.sim.firstSell!=null) notes.push(t("r.sells",{age:a.sim.firstSell}));
  notes.push(a.sim.broke!=null?t("r.lasts",{age:a.sim.broke}):t("r.lastsOk",{age:inp.until}));
  return `<div class="rcard ${regime}"><h3>${esc(legend)}</h3>
<div class="kv"><span>${esc(t("r.need"))}</span><b>${esc(money(a.need))}</b></div>
<div class="kv"><span>${esc(t("r.have"))}</span><b>${esc(money(a.have))}</b></div>
<div class="kv ${diff>=0?"ok":"bad"}"><span>${esc(t(diff>=0?"r.surplus":"r.gap"))}</span><b>${esc(money(Math.abs(diff)))}</b></div>
<p class="rpct ${diff>=0?"ok":"bad"}">${esc(pctTxt)}</p>
<ul class="rnotes">${notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul></div>`;
}

function chart(inp,o,nw){
  const W=640,H=260,L=52,R=10,T=12,B=28;
  const rowsO=o.sim.rows, rowsN=nw.sim.rows; if(!rowsO.length) return "";
  const pts=[...rowsO.map(r=>r.w),...rowsN.map(r=>r.w),...[o.need,nw.need].filter(Number.isFinite)];
  const maxY=Math.max(1,...pts)*1.05, a0=inp.age, a1=Math.max(inp.age+1,inp.until);
  const x=a=>L+(a-a0)/(a1-a0)*(W-L-R), y=v=>T+(1-v/maxY)*(H-T-B);
  const line=(rows,cls)=>`<polyline class="${cls}" fill="none" stroke-width="2.5" stroke-linejoin="round" points="${rows.map(r=>x(r.age).toFixed(1)+","+y(r.w).toFixed(1)).join(" ")}"/>`;
  const ticks=[]; for(let i=0;i<=4;i++){ const v=maxY*i/4; ticks.push(`<line class="ch-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ch-lbl" x="${L-6}" y="${y(v)+4}" text-anchor="end">${short(v)}</text>`); }
  const step=Math.max(5,Math.ceil((a1-a0)/8/5)*5);
  for(let a=Math.ceil(a0/step)*step;a<=a1;a+=step) ticks.push(`<text class="ch-lbl" x="${x(a)}" y="${H-8}" text-anchor="middle">${a}</text>`);
  const rx=x(inp.retire);
  const dot=(v,cls)=>Number.isFinite(v)?`<circle class="${cls}" cx="${rx}" cy="${y(v)}" r="5" stroke-width="2"/>`:"";
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("r.chartAlt"))}">${ticks.join("")}
<line class="ch-retire" x1="${rx}" x2="${rx}" y1="${T}" y2="${H-B}" stroke-dasharray="4 4"/>
${line(rowsO,"ch-old")}${line(rowsN,"ch-new")}${dot(o.need,"ch-need-old")}${dot(nw.need,"ch-need-new")}</svg>
<div class="legend"><span class="sw old"></span>${esc(t("r.legOld"))}<span class="sw new"></span>${esc(t("r.legNew"))}<span class="sw need"></span>${esc(t("r.legNeed"))}<span class="sw retire"></span>${esc(t("r.legRetire"))}</div>`;
}

function table(o,nw){
  const cols=["c.year","c.age","c.salary","c.contrib","c.left","c.spend","c.mInt","c.mPaid","c.mRef","c.mBal","c.wOld","c.taxOld","c.wNew","c.taxNew"];
  const body=o.sim.rows.map((r,i)=>{ const n=nw.sim.rows[i];
    const cells=[r.yr,r.age,money(r.salary),money(r.contrib),money(r.left),money(r.spend),money(r.mInt),money(r.mPaid),money(r.mRef),money(r.mBal),money(r.w),money(r.tax),money(n.w),money(n.tax)];
    return `<tr${r.spend>0?' class="ret"':""}>${cells.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`; }).join("");
  return `<div class="tblwrap"><table class="rtable"><thead><tr>${cols.map(c=>`<th>${esc(t(c))}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function recalc(){
  const inp=readInputs(); saveInputs(inp);
  document.querySelectorAll(".r-preset").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.yield)===inp.yield&&Number(b.dataset.growth)===inp.growth)));
  if(inp.retire<inp.age) inp.retire=inp.age;
  if(inp.until<inp.retire) inp.until=inp.retire;
  const mort=applyDeduction(mortgageYears(inp.mBal,inp.mort),inp);
  const o=analyse("old",inp,mort), nw=analyse("new",inp,mort);
  const head=t("r.atRetire",{age:inp.retire,year:o.yr,cost:money(o.costYear+o.mPaid),month:money((o.costYear+o.mPaid)/12),
    mort:o.mPaid>0?t("r.atRetireMort",{m:money(o.mPaid)}):""});
  const left=o.mortLeft>0.5?" "+t("r.mortLeft",{v:money(o.mortLeft)}):"";
  const sum=(label,a)=>!Number.isFinite(a.need)
    ? `<div><b>${esc(label)}</b> <span class="bad">not possible on dividends</span> · have ${esc(short(a.have))}</div>`
    : `<div><b>${esc(label)}</b> need ${esc(short(a.need))} · have ${esc(short(a.have))} · <span class="${a.have>=a.need?"ok":"bad"}">${a.have>=a.need?"ahead":"short"} ${esc(short(Math.abs(a.have-a.need)))}</span></div>`;
  $("#r-summary").innerHTML=sum("Old box 3",o)+sum("New box 3",nw);
  $("#r-out").innerHTML=`<p class="rhead">${esc(head+left)}</p>
<div class="rcards">${card("old",o,inp)}${card("new",nw,inp)}</div>
<section><h2 class="rsec">${esc(t("r.chart"))}</h2>${chart(inp,o,nw)}</section>
${explain(inp,o,nw,mort)}
<details><summary>${esc(t("r.table"))}</summary>${table(o,nw)}</details>
<p class="sub">${esc(t("r.disc"))}</p>`;
}

let ready = false;
window.retireInit = function () {
  if (!ready) {
    ready = true;
    loadInputs();
    $("#r-form").addEventListener("input", recalc);
    document.querySelectorAll(".r-preset").forEach(b => b.addEventListener("click", () => {
      $("#r-yield").value = b.dataset.yield;
      $("#r-growth").value = b.dataset.growth;
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
