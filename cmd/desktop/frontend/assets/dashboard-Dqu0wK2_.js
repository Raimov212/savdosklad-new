import{a as e,c as t,d as n,f as r,i,l as a,m as o,n as s,o as c,p as l,r as u,s as d,t as f,u as p}from"./api-CkWzOOJ-.js";window.businessPage=1;var m=[],h=[];async function g(){let e=document.getElementById(`page-content`);try{h=await s.get(`/businesses/my`)||[],_(h)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function _(e){e&&(m=e,window.businessPage=1);let t=Math.ceil(m.length/10);window.businessPage>t&&(window.businessPage=t||1);let n=(window.businessPage-1)*10,r=m.slice(n,n+10),a=document.getElementById(`page-content`);a.innerHTML=`
      <div class="card">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${o(`Mening bizneslarim`)}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${o(`Qidirish...`)}" id="business-search" value="${u(document.getElementById(`business-search`)?.value||``)}" oninput="filterBusinesses(this.value)">
             </div>
             <button class="btn btn-primary btn-sm" onclick="openBusinessModal()">${o(`Qo'shish`)}</button>
           </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align:center">№</th>
                <th style="text-align:center">${o(`Nomi`)}</th>
                <th style="text-align:center">${o(`Manzil`)}</th>
                <th style="text-align:center">${o(`Balans`)}</th>
                <th style="text-align:center">${o(`Hisob raqam`)}</th>
                <th style="text-align:center">${o(`Yaratilgan`)}</th>
                <th style="text-align:center">${o(`Amallar`)}</th>
              </tr>
            </thead>
            <tbody>
              ${r.length===0?`<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">${o(`Bizneslar yo'q`)}</td></tr>`:r.map((e,t)=>`
                  <tr>
                    <td style="text-align:center;">${n+t+1}</td>
                    <td>
                       <div style="font-weight:700; color:var(--text-primary); font-size:15px;">${u(e.name)}</div>
                       <div style="font-size:11px; color:var(--text-muted); opacity:0.8;">${u(e.description)||o(`Tavsif yo'q`)}</div>
                    </td>
                    <td>
                      ${e.regionName?`<div style="font-size:13px;">📍 ${u(e.regionName)}</div>`:``}
                      ${e.districtName?`<div style="font-size:11px; opacity:0.7;">${u(e.districtName)}, ${u(e.marketName||``)}</div>`:`—`}
                      ${e.address?`<div style="font-size:10px; opacity:0.6; font-style:italic;">🏠 ${u(e.address)}</div>`:``}
                    </td>
                    <td class="price" style="text-align:center; font-weight:700; ${e.balance<0?`color: #ef4444;`:``}">${c(e.balance)} ${o(`so'm`)}</td>
                    <td style="text-align:center;"><code style="background:var(--bg-glass); padding:2px 6px; border-radius:4px; font-size:12px;">${u(e.businessAccountNumber)||`—`}</code></td>
                    <td style="text-align:center; font-size:12px; opacity:0.7;">${i(e.createdAt)}</td>
                    <td class="actions" style="justify-content:center">
                      <button class="btn-icon" onclick='openBusinessModal(${JSON.stringify(e).replace(/'/g,`&#39;`)})' title="${o(`Tahrirlash`)}">✏️</button>
                      <button class="btn-icon danger" onclick="deleteBusiness(${e.id})" title="${o(`O'chirish`)}">🗑️</button>
                    </td>
                  </tr>`).join(``)}
            </tbody>
          </table>
        </div>
      </div>
      ${renderPageControls(`businessPage`,t,`renderBusinessesTable()`)}
    `}function v(e){let t=(e||``).toLowerCase(),n=h.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)||e.description&&String(e.description).toLowerCase().includes(t)),r=document.getElementById(`business-search`),i=r?r.selectionStart:0;_(n),setTimeout(()=>{let e=document.getElementById(`business-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function y(e=null){let t=!!e;`${o(`Yuklanmoqda...`)}`,openModal(`
    <div class="modal-header">
      <h3>${o(t?`Biznesni tahrirlash`:`Yangi biznes`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveBusiness(event, ${t?e.id:0})" style="min-width:450px">
      <div class="form-group">
        <label>${o(`Nomi`)}</label>
        <input type="text" class="form-control" id="biz-name" value="${t?u(e.name):``}" placeholder="${o(`Nomini kiriting`)}" required>
      </div>
      <div class="form-group">
        <label>${o(`Tavsifi`)}</label>
        <textarea class="form-control" id="biz-desc" rows="2" style="resize:none" placeholder="${o(`Biznes tavsifi`)}">${t?u(e.description):``}</textarea>
      </div>

      <div class="form-group">
        <label>${o(`Tashkilot`)}</label>
        <select class="form-control" id="biz-org-sel">
          <option value="">${o(`Tashkilotni tanlang`)}</option>
        </select>
      </div>

      <div class="form-group">
        <label>${o(`Viloyat`)}</label>
        <select class="form-control" id="biz-region-sel" required onchange="if(window.onRegionChangeGlobal) window.onRegionChangeGlobal(this.value)">
          <option value="">${o(`Viloyatni tanlang`)}</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>${o(`Tuman`)}</label>
          <select class="form-control" id="biz-district-sel" required onchange="if(window.onDistrictChangeGlobal) window.onDistrictChangeGlobal(this.value)">
            <option value="">${o(`Tumanni tanlang`)}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${o(`Bozor`)}</label>
          <select class="form-control" id="biz-market-sel">
            <option value="">${o(`Bozorni tanlang`)}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>${o(`Manzil`)}</label>
          <input type="text" class="form-control" id="biz-address" value="${t?u(e.address||``):``}" placeholder="${o(`Manzilni kiriting`)}">
        </div>
        <div class="form-group">
          <label>${o(`Do'kon / Bino raqami`)}</label>
          <input type="text" class="form-control" id="biz-extra-address" placeholder="${o(`D-123 yoki 1-do'kon`)}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>${o(`Hisob raqami`)}</label>
          <input type="text" class="form-control" id="biz-account" value="${t?u(e.businessAccountNumber):``}" placeholder="123456789">
        </div>
        <div class="form-group">
          <label>${o(`Balans`)}</label>
          <div style="position:relative">
            <input type="number" step="0.01" class="form-control" id="biz-balance" value="${t?e.balance:0}">
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
          </div>
        </div>
      </div>
      <div class="form-group" style="margin-top:10px; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px;">
        <label style="font-weight:700; margin-bottom:8px; display:block;">${o(`Barcode qidiruv sozlamalari`)}</label>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:400; cursor:pointer;">
            <input type="checkbox" id="biz-local-lookup" ${!t||e.localBarcodeLookup?`checked`:``}>
            <span>${o(`Mahalliy bazadan qidirish`)}</span>
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-weight:400; cursor:pointer;">
            <input type="checkbox" id="biz-global-lookup" ${t&&e.globalBarcodeLookup?`checked`:``}>
            <span>${o(`Global bazadan qidirish (Open Food Facts)`)}</span>
          </label>
        </div>
      </div>
      <div class="form-group" style="margin-top:10px; padding:12px; background:rgba(var(--primary-rgb), 0.05); border-radius:8px; border:1px solid rgba(var(--primary-rgb), 0.1);">
        <label style="font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="biz-cashback-enabled" ${t&&e.cashbackEnabled?`checked`:``} onchange="toggleCashbackSettings(this.checked)">
          <span>${o(`Keshbek tizimi`)}</span>
        </label>
        <div id="cashback-settings-group" style="display: ${t&&e.cashbackEnabled?`flex`:`none`}; flex-direction:column; gap:10px; margin-top:10px; padding-top:10px; border-top:1px dashed rgba(0,0,0,0.1);">
          <div class="form-row">
            <div class="form-group">
              <label>${o(`Keshbek turi`)}</label>
              <select class="form-control" id="biz-cashback-type" onchange="toggleCashbackTypeFields(this.value)">
                <option value="percentage" ${t&&e.cashbackType===`percentage`?`selected`:``}>${o(`Foizli`)}</option>
                <option value="tiered" ${t&&e.cashbackType===`tiered`?`selected`:``}>${o(`Darajali (Tiered)`)}</option>
                <option value="product_specific" ${t&&e.cashbackType===`product_specific`?`selected`:``}>${o(`Mahsulotga xos`)}</option>
              </select>
            </div>
            <div class="form-group" id="cashback-pct-group" style="display: ${!t||e.cashbackType===`percentage`?`block`:`none`}">
              <label>${o(`Keshbek foizi`)} (%)</label>
              <input type="number" step="0.1" class="form-control" id="biz-cashback-pct" value="${t?e.cashbackPercentage:0}">
            </div>
          </div>
          <div id="tiered-cashback-btn-group" style="display: ${t&&e.cashbackType===`tiered`?`block`:`none`}">
            <button type="button" class="btn btn-sm btn-outline" onclick="openCashbackTiersModal(${t?e.id:0})">⚙️ ${o(`Keshbek darajalari`)}</button>
          </div>
        </div>
      </div>
      <div class="form-group" style="margin-top:10px; padding:12px; background:rgba(var(--accent-rgb), 0.05); border-radius:8px; border:1px solid rgba(var(--accent-rgb), 0.1);">
        <label style="font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="biz-points-enabled" ${t&&e.pointsEnabled?`checked`:``} onchange="togglePointsSettings(this.checked)">
          <span>${o(`Ballar tizimi`)}</span>
        </label>
        <div id="points-settings-group" style="display: ${t&&e.pointsEnabled?`flex`:`none`}; flex-direction:column; gap:10px; margin-top:10px; padding-top:10px; border-top:1px dashed rgba(0,0,0,0.1);">
          <div class="form-row">
            <div class="form-group">
              <label>${o(`Ballar kursi (1 ball uchun UZS)`)}</label>
              <div style="position:relative">
                <input type="number" step="100" class="form-control" id="biz-points-rate" value="${t?e.pointsRate:1e4}">
                <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
              </div>
              <p style="font-size:10px; color:var(--text-muted); margin-top:4px;">${o(`Masalan: 1000 so'm uchun 1 ball`)}</p>
            </div>
            <div class="form-group">
              <label>${o(`1 ball qiymati (UZS)`)}</label>
              <div style="position:relative">
                <input type="number" step="1" class="form-control" id="biz-point-value" value="${t?e.pointValue:1}">
                <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
              </div>
              <p style="font-size:10px; color:var(--text-muted); margin-top:4px;">${o(`Masalan: 1 ball = 1 so'm`)}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${o(t?`Saqlash`:`Yaratish`)}</button>
      </div>
    </form>
  `),x(e),S(e),setTimeout(()=>{let e=document.getElementById(`biz-region-sel`);e&&(e.onchange=e=>window.onRegionChangeGlobal(e.target.value));let t=document.getElementById(`biz-district-sel`);t&&(t.onchange=e=>window.onDistrictChangeGlobal(e.target.value))},100)}window.onRegionChangeGlobal=function(e){C(e).catch(e=>a(e.message,`error`))},window.onDistrictChangeGlobal=function(e){w(e).catch(e=>a(e.message,`error`))};async function b(e){if(e.files&&e.files[0]){let t=e.files[0],n=new FormData;n.append(`file`,t);try{a(o(`Rasm yuklanmoqda...`),`info`);let e=await s.post(`/upload`,n);if(e&&e.url)document.getElementById(`biz-image-url`).value=e.url,document.getElementById(`biz-image-preview`).innerHTML=`<img src="${e.url}" style="width:100%; height:100%; object-fit:cover;">`,a(o(`Rasm yuklandi`));else throw Error(`Upload failed`)}catch(e){a(e.message,`error`)}}}async function x(e=null){let t=document.getElementById(`biz-region-sel`);try{let n=await s.get(`/geography/regions`);t&&(t.innerHTML=`<option value="">${o(`Viloyatni tanlang`)}</option>`+n.map(t=>`<option value="${t.id}" ${e&&e.regionId==t.id?`selected`:``}>${t.name}</option>`).join(``)),e&&e.regionId&&await C(e.regionId,e)}catch(e){console.error(`Viloyatlarni yuklashda xatolik:`,e),a(e.message,`error`)}}async function S(e=null){let t=document.getElementById(`biz-org-sel`);try{let n=await s.get(`/organizations/my`);t&&(t.innerHTML=`<option value="">${o(`Tashkilotni tanlang`)}</option>`+n.map(t=>`<option value="${t.id}" ${e&&e.organizationId==t.id?`selected`:``}>${t.orgName}</option>`).join(``))}catch(e){console.error(`Tashkilotlarni yuklashda xatolik:`,e)}}async function C(e,t=null){let n=document.getElementById(`biz-district-sel`),r=document.getElementById(`biz-market-sel`);if(n&&(n.innerHTML=`<option value="">${o(`Yuklanmoqda...`)}</option>`),r&&(r.innerHTML=`<option value="">${o(`Bozorni tanlang`)}</option>`),!e){n.innerHTML=`<option value="">${o(`Tumanni tanlang`)}</option>`;return}try{let r=await s.get(`/geography/districts?regionId=${e}`);(!r||r.length===0)&&a(o(`Bu viloyat uchun tumanlar topilmadi`),`warning`),n.innerHTML=`<option value="">${o(`Tumanni tanlang`)}</option>`+r.map(e=>`<option value="${e.id}" ${t&&t.districtId==e.id?`selected`:``}>${e.name}</option>`).join(``),t&&t.districtId&&await w(t.districtId,t)}catch(e){console.error(`Tumanlarni yuklashda xatolik:`,e),a(o(`Tumanlarni yuklab bo'lmadi`)+`: `+e.message,`error`)}}async function w(e,t=null){let n=document.getElementById(`biz-market-sel`);if(n&&(n.innerHTML=`<option value="">${o(`Yuklanmoqda...`)}</option>`),console.log(`District changed to:`,e),!e){n.innerHTML=`<option value="">${o(`Bozorni tanlang`)}</option>`;return}try{let r=await s.get(`/geography/markets?districtId=${e}`);console.log(`Markets received:`,r),(!r||r.length===0)&&a(o(`Bu tuman uchun bozorlar topilmadi`),`warning`),n.innerHTML=`<option value="">${o(`Bozorni tanlang`)}</option>`+r.map(e=>`<option value="${e.id}" ${t&&t.marketId==e.id?`selected`:``}>${e.name}</option>`).join(``)}catch(e){console.error(`Bozorlarni yuklashda xatolik:`,e),a(o(`Bozorlarni yuklab bo'lmadi`)+`: `+e.message,`error`)}}async function T(e,t){e.preventDefault();let n=parseInt(document.getElementById(`biz-market-sel`)?.value)||null,r=document.getElementById(`biz-address`).value.trim(),i=document.getElementById(`biz-extra-address`).value.trim();if(!n&&!r&&!i){a(o(`Bozor tanlanishi yoki manzil kiritilishi shart!`),`error`);return}let c=r;i&&(c=r?`${r}, ${i}`:i);let l={name:document.getElementById(`biz-name`).value.trim(),description:document.getElementById(`biz-desc`).value.trim(),businessAccountNumber:document.getElementById(`biz-account`).value.trim(),balance:parseFloat(document.getElementById(`biz-balance`).value)||0,regionId:parseInt(document.getElementById(`biz-region-sel`)?.value)||null,districtId:parseInt(document.getElementById(`biz-district-sel`)?.value)||null,marketId:n,address:c,image:document.getElementById(`biz-image-url`)?.value.trim()||null,localBarcodeLookup:document.getElementById(`biz-local-lookup`).checked,globalBarcodeLookup:document.getElementById(`biz-global-lookup`).checked,cashbackEnabled:document.getElementById(`biz-cashback-enabled`).checked,cashbackType:document.getElementById(`biz-cashback-type`).value,cashbackPercentage:parseFloat(document.getElementById(`biz-cashback-pct`).value)||0,pointsEnabled:document.getElementById(`biz-points-enabled`).checked,pointsRate:parseFloat(document.getElementById(`biz-points-rate`).value)||0,pointValue:parseFloat(document.getElementById(`biz-point-value`).value)||0};try{t?(await s.put(`/businesses/${t}`,l),a(o(`Biznes yangilandi`)),closeModal()):(await s.post(`/businesses`,l),a(o(`Biznes yaratildi`)),document.getElementById(`biz-name`).value=``,document.getElementById(`biz-desc`).value=``,document.getElementById(`biz-account`).value=``,document.getElementById(`biz-balance`).value=`0`,document.getElementById(`biz-address`).value=``,document.getElementById(`biz-extra-address`).value=``,document.getElementById(`biz-image-url`).value=``,document.getElementById(`biz-image-preview`).innerHTML=`<span style="font-size:32px; opacity:0.3;">🖼️</span>`,document.getElementById(`biz-name`).focus()),typeof loadBusinesses==`function`&&loadBusinesses(),g()}catch(e){a(e.message,`error`)}}async function ee(e){if(confirm(o(`Biznesni o'chirishga ishonchingiz komilmi?`)))try{await s.delete(`/businesses/${e}`),a(o(`Biznes o'chirildi`)),loadBusinesses(),g()}catch(e){a(e.message,`error`)}}window.renderBusinesses=g,window.renderBusinessesTable=_,window.filterBusinesses=v,window.openBusinessModal=y,window.saveBusiness=T,window.deleteBusiness=ee,window.previewBusinessImage=b,window.businessPage=businessPage,window.allBusinessesList=h,window.currentBusinesses=m,window.toggleCashbackSettings=function(e){let t=document.getElementById(`cashback-settings-group`);t&&(t.style.display=e?`flex`:`none`)},window.toggleCashbackTypeFields=function(e){let t=document.getElementById(`cashback-pct-group`),n=document.getElementById(`tiered-cashback-btn-group`);t&&(t.style.display=e===`percentage`?`block`:`none`),n&&(n.style.display=e===`tiered`?`block`:`none`)},window.openCashbackTiersModal=async function(e){if(!e){a(o(`Avval biznesni saqlang`),`warning`);return}openModal(`
    <div class="modal-header">
      <h3>${o(`Keshbek darajalari`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div id="cashback-tiers-list" style="min-width:500px; max-height:400px; overflow-y:auto; padding:10px;">
      <div style="text-align:center; padding:20px;">${o(`Yuklanmoqda...`)}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="addCashbackTierUI(${e})">+ ${o(`Qo'shish`)}</button>
      <button class="btn btn-ghost" onclick="closeModal()">${o(`Yopish`)}</button>
    </div>
  `,!0),await E(e)};async function E(e){let t=document.getElementById(`cashback-tiers-list`);try{let n=await s.getCashbackTiers(e);if(!n||n.length===0){t.innerHTML=`
        <div style="text-align:center; padding:30px; color:var(--text-muted);">
          <div style="font-size:32px; margin-bottom:8px;">🎯</div>
          <div>${o(`Hali darajalar qo'shilmagan`)}</div>
        </div>`;return}t.innerHTML=`
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:var(--bg-secondary); border-bottom:2px solid var(--border);">
            <th style="padding:10px 12px; text-align:left; font-weight:700; color:var(--text-primary);">${o(`Minimal harid summasi`)}</th>
            <th style="padding:10px 12px; text-align:center; font-weight:700; color:var(--text-primary);">${o(`Keshbek foizi`)} (%)</th>
            <th style="padding:10px 12px; text-align:center; width:60px;"></th>
          </tr>
        </thead>
        <tbody>
          ${n.map(t=>`
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px 12px; font-weight:600; color:var(--text-primary);">${c(t.minSpend||t.minAmount||0)} ${o(`so'm`)}</td>
              <td style="padding:10px 12px; text-align:center;">
                <span style="background:rgba(var(--primary-rgb),0.1); color:var(--primary); font-weight:700; padding:3px 10px; border-radius:10px;">${t.percentage}%</span>
              </td>
              <td style="padding:10px 12px; text-align:center;">
                <button style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:14px;" onclick="deleteCashbackTier(${e}, ${t.id})">🗑️</button>
              </td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `}catch(e){t.innerHTML=`<div style="color:#ef4444; padding:16px;">${u(e.message)}</div>`}}window.addCashbackTierUI=function(e){let t=prompt(o(`Minimal harid summasi`));if(t===null)return;let n=prompt(o(`Keshbek foizi`)+` (%)`);n!==null&&s.createCashbackTier({businessId:e,minAmount:parseFloat(t),percentage:parseFloat(n)}).then(()=>{a(o(`Saqlandi`)),E(e)}).catch(e=>a(e.message,`error`))},window.deleteCashbackTier=function(e,t){confirm(o(`O'chirishni xohlaysizmi?`))&&s.deleteCashbackTier(t).then(()=>{a(o(`O'chirildi`)),E(e)}).catch(e=>a(e.message,`error`))},window.togglePointsSettings=function(e){let t=document.getElementById(`points-settings-group`);t&&(t.style.display=e?`flex`:`none`)},window.categoryPage=1;var D=[],te=[];async function O(){let e=document.getElementById(`page-content`),t=d();if(!t){e.innerHTML=`<div class="empty-state"><div class="icon">📂</div><h4>${o(`Avval biznes tanlang`)}</h4></div>`;return}try{te=await s.get(`/categories?businessId=${t}`)||[],re(te)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function ne(e){return e?new Date(e).toLocaleDateString():``}function re(e){e&&(D=e,window.categoryPage=1);let t=Math.ceil(D.length/10);window.categoryPage>t&&(window.categoryPage=t||1);let n=(window.categoryPage-1)*10,r=D.slice(n,n+10),i=document.getElementById(`page-content`);i.innerHTML=`
      <div class="card">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${o(`Kategoriyalar`)}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${o(`Qidirish...`)}" id="category-search" value="${u(document.getElementById(`category-search`)?.value||``)}" oninput="filterCategories(this.value)">
             </div>
             ${window.hasPermission(`add`)?`<button class="btn btn-primary btn-sm" onclick="openCategoryModal()">${o(`Qo'shish`)}</button>`:``}
           </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align:center">№</th>
                <th style="text-align:center">${o(`Nomi`)}</th>
                <th style="text-align:center">${o(`Yaratilgan`)}</th>
                <th style="text-align:center">${o(`Amallar`)}</th>
              </tr>
            </thead>
            <tbody>
              ${r.length===0?`<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted);">${o(`Kategoriyalar yo'q`)}</td></tr>`:r.map((e,t)=>`
                  <tr>
                    <td style="text-align:center;">${n+t+1}</td>
                    <td><strong style="color:var(--text-primary); font-size:15px;">${u(e.name)}</strong></td>
                    <td style="text-align:center; font-size:12px; opacity:0.7;">${ne(e.createdAt)}</td>
                    <td class="actions" style="justify-content:center">
                      ${window.hasPermission(`edit`)?`<button class="btn-icon" onclick='openCategoryModal(${JSON.stringify(e).replace(/'/g,`&#39;`)})' title="${o(`Tahrirlash`)}">✏️</button>`:``}
                      ${window.hasPermission(`delete`)?`<button class="btn-icon danger" onclick="deleteCategory(${e.id})" title="${o(`O'chirish`)}">🗑️</button>`:``}
                    </td>
                  </tr>`).join(``)}
            </tbody>
          </table>
        </div>
      </div>
      ${renderPageControls(`categoryPage`,t,`renderCategoriesTable()`)}
    `}function ie(e){let t=(e||``).toLowerCase(),n=te.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)),r=document.getElementById(`category-search`),i=r?r.selectionStart:0;re(n),setTimeout(()=>{let e=document.getElementById(`category-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function ae(e=null){let t=!!e;openModal(`
    <div class="modal-header">
      <h3>${o(t?`Kategoriyani tahrirlash`:`Yangi kategoriya`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body-wrapper">
      ${t?``:`
      <div class="excel-actions-row" style="margin-bottom: 20px; padding: 15px; background: var(--bg-glass); border: 1px dashed var(--border); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px;">${o(`Excel orqali ommaviy yuklash`)}</h4>
          <a href="#" onclick="handleCategoryTemplate(event)" style="font-size:12px; color:var(--primary);">${o(`Shablonni yuklab olish`)}</a>
        </div>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-ghost btn-sm" onclick="handleCategoryExport()"><span class="icon">📥</span> ${o(`Eksport (Excel)`)}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('cat-excel-import').click()"><span class="icon">📤</span> ${o(`Import (Excel)`)}</button>
          <input type="file" id="cat-excel-import" style="display:none" accept=".xlsx,.xls" onchange="handleCategoryImport(this)">
        </div>
      </div>
      `}
      <form onsubmit="saveCategory(event, ${t?e.id:0})" style="min-width:400px">
        <div class="form-group">
          <label>${o(`Nomi`)}</label>
          <input type="text" class="form-control" id="cat-name" value="${t?u(e.name):``}" placeholder="${o(`Nomini kiriting`)}" required>
        </div>
        <div class="form-group">
          <label>${o(`Kategoriya rasmi`)}</label>
          <div style="display:flex; gap:16px; align-items: flex-start;">
             <div id="cat-image-preview" style="width:100px; height:100px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
               ${t&&e.image?`<img src="${e.image}" style="width:100%; height:100%; object-fit:cover;">`:`<span style="font-size:32px; opacity:0.3;">🖼️</span>`}
             </div>
             <div style="flex:1">
               <input type="file" class="form-control" id="cat-image-file" accept="image/*" onchange="previewCategoryImage(this)">
               <input type="hidden" id="cat-image-url" value="${t&&e.image?u(e.image):``}">
               <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${o(`Tavsiya etilgan o'lcham: 500x500px. JPG, PNG.`)}</p>
             </div>
          </div>
        </div>
        <div class="modal-footer" style="padding-top:10px">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
          <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${o(t?`Saqlash`:`Yaratish`)}</button>
        </div>
      </form>
    </div>
  `)}async function oe(){let e=d();try{let t=s.getToken();window.location.href=`${f}/excel/categories/export?businessId=${e}&token=${t}`,a(o(`Excel fayl tayyorlanmoqda...`))}catch(e){a(e.message,`error`)}}async function se(e){e.preventDefault();try{let e=s.getToken();window.location.href=`${f}/excel/categories/template?token=${e}`,a(o(`Shablon yuklab olinmoqda...`))}catch(e){a(e.message,`error`)}}async function ce(e){if(!e.files||e.files.length===0)return;let t=d(),n=e.files[0],r=new FormData;r.append(`businessId`,t),r.append(`file`,n);try{a(o(`Import qilinmoqda...`),`info`);let e=s.getToken(),t=await fetch(`${f}/excel/categories/import`,{method:`POST`,headers:{Authorization:`Bearer `+e},body:r}),n=await t.json();if(t.ok)a(`${o(`Muvaffaqiyatli`)}: ${n.created} ${o(`ta yaratildi`)}`),n.errors&&n.errors.length>0&&(console.error(`Import errors:`,n.errors),a(`${o(`Xatoliklar bor`)}: ${n.errors.length} ${o(`ta`)}`,`warning`)),closeModal(),O();else throw Error(n.error||o(`Importda xatolik`))}catch(e){a(e.message,`error`)}finally{e.value=``}}async function le(e){if(e.files&&e.files[0]){let t=e.files[0],n=new FormData;n.append(`file`,t);try{a(o(`Rasm yuklanmoqda...`),`info`);let e=await s.post(`/upload`,n);if(e&&e.url)document.getElementById(`cat-image-url`).value=e.url,document.getElementById(`cat-image-preview`).innerHTML=`<img src="${e.url}" style="width:100%; height:100%; object-fit:cover;">`,a(o(`Rasm yuklandi`));else throw Error(`Upload failed`)}catch(e){a(e.message,`error`)}}}function ue(){let e=document.getElementById(`cat-name`),t=document.getElementById(`cat-image-url`),n=document.getElementById(`cat-image-preview`),r=document.getElementById(`cat-image-file`);e&&(e.value=``),t&&(t.value=``),n&&(n.innerHTML=`<span style="font-size:32px; opacity:0.3;">🖼️</span>`),r&&(r.value=``),a(o(`Forma tozalandi`))}async function de(e,t){e.preventDefault();let n=d(),r=document.getElementById(`cat-name`).value.trim(),i=document.getElementById(`cat-image-url`).value.trim();try{t?(await s.put(`/categories/${t}`,{businessId:n||0,name:r,image:i||null}),a(o(`Kategoriya yangilandi`)),closeModal()):(await s.post(`/categories`,{businessId:n,name:r,image:i||null}),a(o(`Kategoriya yaratildi`)),ue()),O()}catch(e){a(e.message,`error`)}}async function fe(e){if(confirm(o(`Kategoriyani o'chirishga ishonchingiz komilmi?`)))try{let t=d();await s.delete(`/categories/${e}${t?`?businessId=`+t:``}`),a(o(`Kategoriya o'chirildi`)),O()}catch(e){a(e.message,`error`)}}window.renderCategories=O,window.renderCategoriesTable=re,window.filterCategories=ie,window.openCategoryModal=ae,window.saveCategory=de,window.deleteCategory=fe,window.handleCategoryExport=oe,window.handleCategoryImport=ce,window.handleCategoryTemplate=se,window.previewCategoryImage=le,window.resetCategoryForm=ue,window.categoryPage=categoryPage,window.allCategoriesList=te,window.currentCategories=D;var k=[],A=[],pe=!1;async function me(){let e=document.getElementById(`page-content`),t=d();try{if(t){let[e,n]=await Promise.all([s.get(`/products?businessId=${t}`),s.get(`/categories?businessId=${t}`)]);k=(e||[]).filter(e=>!e.isDeleted).sort((e,t)=>new Date(t.createdAt||0)-new Date(e.createdAt||0)),A=n||[]}else{let t=await s.get(`/businesses/my`).catch(()=>[]);if(!t||t.length===0){e.innerHTML=`<div class="empty-state"><div class="icon">🏢</div><h4>${o(`Biznes yarating`)}</h4></div>`;return}let n=await Promise.all((t||[]).filter(e=>e).map(e=>Promise.all([s.get(`/products?businessId=${e.id}`).catch(()=>[]),s.get(`/categories?businessId=${e.id}`).catch(()=>[])]).then(([t,n])=>((t||[]).filter(e=>e).forEach(t=>{t._businessName=e.name,t._businessId=e.id}),(n||[]).filter(e=>e).forEach(t=>{t._businessId=e.id}),{prods:t||[],cats:n||[]}))));k=n.flatMap(e=>e.prods).filter(e=>e&&!e.isDeleted).sort((e,t)=>new Date(t.createdAt||0)-new Date(e.createdAt||0)),A=n.flatMap(e=>e.cats).filter(e=>e)}ge(k)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}window.productPage=1;var he=[];function ge(e,t=!1){typeof e==`boolean`&&(t=e,e=null),e&&(t||(window.productPage=1),he=e);let n=Math.ceil(he.length/15),r=window.productPage*15,i=he.slice(r-15,r),a=document.getElementById(`page-content`),s=[`acc-avatar-indigo`,`acc-avatar-green`,`acc-avatar-blue`,`acc-avatar-orange`],l=i.length===0&&!t?`<div class="empty-state"><div class="icon">📦</div><h4>${o(`Mahsulotlar yo'q`)}</h4></div>`:i.map((e,t)=>{let n=A.find(t=>t.id===e.categoryId&&(e._businessId?t._businessId===e._businessId:!0)),r=s[t%s.length],i=(e.name||`?`)[0].toUpperCase(),a=e.price*(1-(e.discount||0)/100),l=e._businessName?`<span class="badge" style="background:rgba(255,255,255,0.05); border:1px solid var(--border); font-size:10px; opacity:0.7;">${u(e._businessName)}</span>`:``,d=e.quantity<=5?`<span class="badge badge-danger">${e.quantity} ${o(`ta`)}</span>`:`<span class="badge" style="background:#ECFDF5; color:#059669;">${e.quantity} ${o(`ta`)}</span>`;return`
        <div class="acc-item" id="prod-acc-${e.id}">
          <div class="acc-header" onclick="toggleAcc('prod-acc-${e.id}')">
            <div class="acc-header-left">
              ${e.images?`<img src="${e.images}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;" alt="">`:`<div class="acc-avatar ${r}">${i}</div>`}
              <div>
                <div class="acc-title">${u(e.name)}</div>
                <div class="acc-subtitle">${n?u(n.name):`—`} ${e.barcode?`· `+u(e.barcode):``} ${l}</div>
              </div>
            </div>
            <div class="acc-header-right">
              ${d}
              <span class="acc-price">${c(a)} ${o(`so'm`)}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📊</span>
                <div><div class="acc-detail-label">${o(`Miqdori`)}</div><div class="acc-detail-value">${e.quantity}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label">${o(`Sotish narxi`)}</div><div class="acc-detail-value">${c(e.price)} ${o(`so'm`)}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📥</span>
                <div><div class="acc-detail-label">${o(`Tan narxi`)} (Buy)</div><div class="acc-detail-value">${c(e.buyPrice||0)} ${o(`so'm`)}</div></div>
              </div>
              ${e.discount>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">🏷️</span>
                <div><div class="acc-detail-label">${o(`Chegirma`)}</div><div class="acc-detail-value">${e.discount}%</div></div>
              </div>`:``}
              ${e.barcode?`<div class="acc-detail-item">
                <span class="acc-detail-icon">📋</span>
                <div><div class="acc-detail-label">${o(`Barcode`)}</div><div class="acc-detail-value" style="font-family:monospace;">${u(e.barcode)}</div></div>
              </div>`:``}
              ${e.country?`<div class="acc-detail-item">
                <span class="acc-detail-icon">🌍</span>
                <div><div class="acc-detail-label">${o(`Mamlakat`)}</div><div class="acc-detail-value">${u(e.country)}</div></div>
              </div>`:``}
			  ${e.lokalCode?`<div class="acc-detail-item">
                <span class="acc-detail-icon">🔖</span>
                <div><div class="acc-detail-label">${o(`Lokal kod`)}</div><div class="acc-detail-value">${u(e.lokalCode)}</div></div>
              </div>`:``}
              ${e.shortDescription?`<div class="acc-detail-item" style="grid-column: 1/-1;">
                <span class="acc-detail-icon">📝</span>
                <div><div class="acc-detail-label">${o(`Tavsifi`)}</div><div class="acc-detail-value">${u(e.shortDescription)}</div></div>
              </div>`:``}
            </div>
            <div class="acc-actions">
              ${window.hasPermission(`edit`)?`<button class="btn btn-success btn-sm" onclick='openProductModal(${JSON.stringify(e).replace(/'/g,`&#39;`)})'>✏️ ${o(`Tahrirlash`)}</button>`:``}
              ${window.hasPermission(`delete`)?`<button class="btn btn-danger btn-sm" onclick="deleteProduct(${e.id})">🗑️ ${o(`O'chirish`)}</button>`:``}
            </div>
          </div>
        </div>`}).join(``);if(!t)a.innerHTML=`
      <div class="card-header" style="padding: 15px 20px; background: var(--bg-glass); border-bottom: 1px solid var(--border); border-radius: 20px 20px 0 0;">
        <div class="toolbar" style="width: 100%; display: flex; gap: 10px; align-items: center;">
          <div class="toolbar-actions" style="display: none; gap: 10px;">
            <button class="btn btn-ghost" id="out-of-stock-btn" onclick="toggleOutOfStockFilter()" style="height: 42px; flex: 1; justify-content: center; font-size: 13px;" title="${o(`Qolmagan mahsulotlar`)}">📦 ${o(`Qolmagan`)}</button>
            ${d()&&window.hasPermission(`add`)?`<button class="btn btn-primary" onclick="openProductModal()" style="height: 42px; flex: 1.5; justify-content: center; font-size: 13px;">${o(`Qo'shish`)}</button>`:``}
          </div>
          <div class="search-box" style="flex: 1; max-width: none; margin: 0;">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="${o(`Qidirish...`)}" id="product-search" class="form-control"
              value="${u(document.getElementById(`product-search`)?.value||``)}"
              oninput="filterProducts(this.value)"
              style="padding-left: 38px !important; height: 42px; font-size: 13px;"
              autocomplete="off">
          </div>
         
        </div>
      </div>
      <div class="acc-list" id="product-acc-list" style="margin-top: 10px;">${l}</div>
      <div id="product-pagination-area">
        ${renderPageControls(`productPage`,n,`renderProductsTable`)}
      </div>
    `,attachInfiniteScroll(`productPage`,n,`renderProductsTable`);else{let e=document.getElementById(`product-acc-list`);e&&e.insertAdjacentHTML(`beforeend`,l);let t=document.getElementById(`product-pagination-area`);t&&(t.innerHTML=renderPageControls(`productPage`,n,`renderProductsTable`)),attachInfiniteScroll(`productPage`,n,`renderProductsTable`)}}function _e(e){let t=(e||``).toLowerCase(),n=k.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)||e.barcode&&String(e.barcode).toLowerCase().includes(t)),r=document.getElementById(`product-search`),i=r?r.selectionStart:0;ge(n),setTimeout(()=>{let e=document.getElementById(`product-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function ve(e=null){let t=!!e,n=A.map(n=>`<option value="${n.id}" ${t&&e.categoryId===n.id?`selected`:``}>${u(n.name)}</option>`).join(``);openModal(`
    <div class="modal-header">
      <h3>${o(t?`Mahsulotni tahrirlash`:`Yangi mahsulot`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body-wrapper">
      ${t?``:`
      <div class="excel-actions-row" style="margin-bottom: 20px; padding: 15px; background: var(--bg-glass); border: 1px dashed var(--border); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px;">${o(`Excel orqali ommaviy yuklash`)}</h4>
          <a href="#" onclick="handleProductTemplate(event)" style="font-size:12px; color:var(--primary);">${o(`Shablonni yuklab olish`)}</a>
        </div>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-ghost btn-sm" onclick="handleProductExport()"><span class="icon">📥</span> ${o(`Eksport (Excel)`)}</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('prod-excel-import').click()"><span class="icon">📤</span> ${o(`Import (Excel)`)}</button>
          <input type="file" id="prod-excel-import" style="display:none" accept=".xlsx,.xls" onchange="handleProductImport(this)">
        </div>
      </div>
      `}
      <form onsubmit="saveProduct(event, ${t?e.id:0})" class="modal-wide" style="width: 650px;">
        <div class="form-group">
          <label>${o(`Nomi`)}</label>
          <input type="text" class="form-control" id="prod-name" value="${t?u(e.name):``}" placeholder="${o(`Mahsulot nomi`)}" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>${o(`Barcode`)}</label>
            <div class="barcode-input-group">
              <input type="text" class="form-control" id="prod-barcode" value="${t&&e.barcode?u(e.barcode):``}" placeholder="${o(`Kodni skanerlang yoki qo‘lda kiriting`)}">
              <div class="barcode-actions">
                <button type="button" class="btn-camera-scan" title="${o(`Kamera orqali skanerlash`)}" onclick="window.openCameraScanner(function(code){ const el=document.getElementById('prod-barcode'); if(el){el.value=code; window.executeBarcodeLookup(code);} })">📷</button>
                <button type="button" class="btn-barcode-search" title="${o(`Qidirish`)}" onclick="window.executeBarcodeLookup(document.getElementById('prod-barcode').value)">🔍</button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>${o(`Kategoriya`)}</label>
            <select class="form-control" id="prod-cat" required>
              <option value="">${o(`Tanlang...`)}</option>
              ${n}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${o(`Sotish narxi`)}</label>
            <div style="position:relative">
               <input type="number" step="0.01" class="form-control" id="prod-price" value="${t?e.price:0}" required style="padding-right:45px">
               <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:12px; opacity:0.5;">UZS</span>
            </div>
          </div>
          <div class="form-group">
            <label>${o(`Tan narxi`)}</label>
            <div style="position:relative">
               <input type="number" step="0.01" class="form-control" id="prod-buy-price" value="${t?e.buyPrice:0}" required style="padding-right:45px">
               <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:12px; opacity:0.5;">UZS</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>${o(`Chegirma`)} (%)</label>
            <input type="number" min="0" step="0.01" class="form-control" id="prod-discount" value="${t?e.discount:0}">
          </div>
          <div class="form-group">
            <label>${o(`Miqdori`)}</label>
            <input type="number" min="0" step="1" class="form-control" id="prod-qty" value="${t?e.quantity:0}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>💰 ${o(`Keshbek foizi`)} (%)</label>
            <input type="number" min="0" max="100" step="0.1" class="form-control" id="prod-cashback-pct" value="${t&&e.cashbackPercentage||0}" placeholder="0">
          </div>
          <div class="form-group">
            <label>${o(`Lokal kod`)}</label>
            <input type="text" class="form-control" id="prod-lcode" value="${t&&e.lokalCode?u(e.lokalCode):``}" placeholder="${o(`Ixtiyoriy`)}">
          </div>
        </div>

        <div class="form-group">
          <label>${o(`Mamlakat`)}</label>
          <input type="text" class="form-control" id="prod-country" value="${t?u(e.country||``):o(`O'zbekiston`)}" placeholder="${o(`O'zbekiston`)}">
        </div>

        <div class="form-group">
          <label>${o(`Qisqa tavsif`)}</label>
          <textarea class="form-control" id="prod-short" rows="2" style="resize:none; padding:10px;">${t&&e.shortDescription?u(e.shortDescription):``}</textarea>
        </div>

        <div class="form-group">
          <label>${o(`Mahsulot rasmi`)}</label>
          <div style="display:flex; gap:16px; align-items: flex-start;">
             <div id="prod-image-preview" style="width:100px; height:100px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
               ${t&&e.images?`<img src="${e.images}" style="width:100%; height:100%; object-fit:cover;">`:`<span style="font-size:32px; opacity:0.3;">🖼️</span>`}
             </div>
             <div style="flex:1">
               <input type="file" class="form-control" id="prod-image" accept="image/*" onchange="previewProductImage(this)">
               <p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${o(`Tavsiya etilgan o'lcham: 500x500px. JPG, PNG.`)}</p>
             </div>
          </div>
          <input type="hidden" id="prod-image-url" value="${t&&e.images?e.images:``}">
        </div>

        <div class="modal-footer" style="padding-top:10px">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
          <button type="submit" class="btn btn-primary" style="padding:10px 30px;">${o(t?`Saqlash`:`Yaratish`)}</button>
        </div>
      </form>
    </div>
  `),setTimeout(be,300)}function ye(e){let t={"prod-name":e.name,"prod-price":e.price,"prod-buy-price":e.buyPrice||e.buy_price,"prod-cat":e.categoryId||e.category_id,"prod-country":e.country,"prod-short":e.shortDescription||e.short_description,"prod-lcode":e.lokalCode||e.lokal_code};for(let e in t){let n=document.getElementById(e);n&&t[e]!==void 0&&t[e]!==null&&(n.value=t[e])}if(e.images||e.image_url){let t=e.images||e.image_url;document.getElementById(`prod-image-url`).value=t,document.getElementById(`prod-image-preview`).innerHTML=`<img src="${t}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`}}window.executeBarcodeLookup=async function(e){let t=(e||``).trim().replace(/\D/g,``);if(t.length<8){a(o(`Shtrix-kod juda qisqa`),`warning`);return}let n=document.getElementById(`prod-name`),r=document.getElementById(`prod-country`),i=document.getElementById(`prod-short`),s=document.getElementById(`prod-image-url`),c=k.find(e=>e.barcode===t);if(c){ye(c),a(o(`Ma'lumotlar topildi va to'ldirildi`),`success`);return}a(o(`Global bazadan qidirilmoqda...`),`info`);try{let e=!1,c=null,l=``;for(let n of[`world.openfoodfacts.org`,`world.openproductsfacts.org`,`world.openbeautyfacts.org`]){if(e)break;try{let r=await fetch(`https://${n}/api/v0/product/${t}.json`,{method:`GET`,headers:{Accept:`application/json`},cache:`no-store`});if(r.ok){let t=await r.json();if(t.status===1&&t.product)c=t.product,e=!0,l=n;else if(t.status_verbose&&t.status_verbose.includes(`different product type`))continue}}catch(e){console.warn(`${n} fetch error:`,e)}}if(e&&c){let e=c,t=e.product_name_uz||e.product_name_ru||e.product_name||e.product_name_en||e.generic_name||``;if(n&&!n.value&&t&&(n.value=t),r&&!r.value){let t=e.countries_uz||e.countries_ru||e.countries||``;t&&(r.value=t)}if(i&&!i.value&&(i.value=e.generic_name||e.ingredients_text||e.categories||``),s&&!s.value){let t=e.image_url||e.image_front_url||e.image_small_url;if(t){t.startsWith(`http`)||(t=`https://images.${l.split(`.`).slice(1).join(`.`)}${t}`),s.value=t;let e=document.getElementById(`prod-image-preview`);e&&(e.innerHTML=`<img src="${t}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`)}}a(o(`Ma'lumotlar olindi`),`success`)}else a(o(`Mahsulot topilmadi`),`warning`)}catch(e){console.error(`Global lookup failed`,e),a(o(`Global bazaga ulanishda xatolik`),`danger`)}};async function be(){let e=document.getElementById(`prod-barcode`);if(!e)return;let t=null,n=e=>{let n=e.target.value;t&&clearTimeout(t),t=setTimeout(()=>window.executeBarcodeLookup(n),600)};e.addEventListener(`input`,n),e.addEventListener(`change`,n)}async function xe(){let e=d();try{let t=s.getToken();window.location.href=`${f}/excel/products/export?businessId=${e}&token=${t}`,a(o(`Excel fayl tayyorlanmoqda...`))}catch(e){a(e.message,`error`)}}async function Se(e){e.preventDefault();let t=d();try{let e=s.getToken();window.location.href=`${f}/excel/products/template?businessId=${t}&token=${e}`,a(o(`Shablon yuklab olinmoqda...`))}catch(e){a(e.message,`error`)}}async function Ce(e){if(!e.files||e.files.length===0)return;let t=d(),n=e.files[0],r=new FormData;r.append(`businessId`,t),r.append(`file`,n);try{a(o(`Import qilinmoqda...`),`info`);let e=s.getToken(),t=await fetch(`${f}/excel/products/import`,{method:`POST`,headers:{Authorization:`Bearer `+e},body:r}),n=await t.json();if(t.ok){closeModal();let e=(n.created||0)+(n.updated||0)+(n.skipped||0),t=n.errors&&n.errors.length>0,r=t?`
        <div style="margin-top:16px; text-align:left;">
          <details style="cursor:pointer;">
            <summary style="font-size:13px; font-weight:600; color:#f59e0b; margin-bottom:8px;">
              ⚠️ ${o(`Xatoliklar bor`)}: ${n.errors.length} ${o(`ta`)}
            </summary>
            <div style="max-height:150px; overflow-y:auto; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:10px; padding:10px; margin-top:8px;">
              ${n.errors.map(e=>`<div style="font-size:11px; color:#ef4444; padding:4px 0; border-bottom:1px solid rgba(239,68,68,0.08);">${u(e)}</div>`).join(``)}
            </div>
          </details>
        </div>
      `:``,i=`
        <div style="position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; animation: fadeIn 0.2s ease;" id="import-result-alert">
          <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:24px; padding:36px 32px 28px; max-width:420px; width:92%; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
            
            <div style="width:72px; height:72px; margin:0 auto 20px; border-radius:50%; background:linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1)); display:flex; align-items:center; justify-content:center; font-size:36px;">
              ${t?`📊`:`✅`}
            </div>

            <h3 style="margin:0 0 6px; font-size:22px; font-weight:800; color:var(--text-primary); font-family:'Outfit',sans-serif;">
              ${o(`Import natijasi`)}
            </h3>
            <p style="margin:0 0 24px; font-size:13px; color:var(--text-muted);">
              ${o(`Jami`)}: ${e} ${o(`ta`)}
            </p>

            <div style="display:grid; grid-template-columns:1fr 1fr ${(n.skipped||0)>0?`1fr`:``}; gap:12px; margin-bottom:20px;">
              
              <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:16px; padding:16px 12px;">
                <div style="font-size:28px; font-weight:900; color:#10b981; font-family:'Outfit',sans-serif;">${n.created||0}</div>
                <div style="font-size:11px; color:#10b981; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px;">➕ ${o(`ta yaratildi`)}</div>
              </div>

              <div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); border-radius:16px; padding:16px 12px;">
                <div style="font-size:28px; font-weight:900; color:#3b82f6; font-family:'Outfit',sans-serif;">${n.updated||0}</div>
                <div style="font-size:11px; color:#3b82f6; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px;">🔄 ${o(`ta yangilandi`)}</div>
              </div>

              ${(n.skipped||0)>0?`
              <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:16px; padding:16px 12px;">
                <div style="font-size:28px; font-weight:900; color:#ef4444; font-family:'Outfit',sans-serif;">${n.skipped}</div>
                <div style="font-size:11px; color:#ef4444; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px;">❌ ${o(`Xatolik`)}</div>
              </div>`:``}
            </div>

            ${r}

            <button onclick="document.getElementById('import-result-alert').remove()" 
              class="btn btn-primary" 
              style="width:100%; padding:14px; border-radius:14px; font-size:15px; font-weight:700; margin-top:16px; box-shadow:0 4px 15px rgba(16,185,129,0.3);">
              ${o(`Yopish`)}
            </button>
          </div>
        </div>
      `;document.body.insertAdjacentHTML(`beforeend`,i),me()}else throw Error(n.error||o(`Importda xatolik`))}catch(e){a(e.message,`error`)}finally{e.value=``}}async function we(e,t){e.preventDefault();let n=d(),r=document.getElementById(`prod-image-url`).value,i=document.getElementById(`prod-image`);if(i.files.length>0)try{let e=new FormData;e.append(`file`,i.files[0]);let t=s.getToken(),n=await(await fetch(f.replace(`/api/v1`,``)+`/api/v1/upload`,{method:`POST`,headers:{Authorization:`Bearer `+t},body:e})).json();if(n.url)r=n.url;else throw Error(n.error||`Upload xatolik`)}catch(e){a(`Rasm yuklashda xatolik: `+e.message,`error`);return}try{t?(await s.put(`/products/${t}`,{name:document.getElementById(`prod-name`).value.trim(),lokalCode:document.getElementById(`prod-lcode`).value.trim()||null,shortDescription:document.getElementById(`prod-short`).value.trim(),price:parseFloat(document.getElementById(`prod-price`).value),buyPrice:parseFloat(document.getElementById(`prod-buy-price`).value)||0,discount:parseFloat(document.getElementById(`prod-discount`).value)||0,quantity:parseInt(document.getElementById(`prod-qty`).value),barcode:document.getElementById(`prod-barcode`).value.trim()||null,country:document.getElementById(`prod-country`).value.trim()||null,categoryId:parseInt(document.getElementById(`prod-cat`).value),images:r||null,cashbackPercentage:parseFloat(document.getElementById(`prod-cashback-pct`)?.value)||0}),a(o(`Mahsulot yangilandi`)),closeModal()):(await s.post(`/products`,{businessId:n,name:document.getElementById(`prod-name`).value.trim(),lokalCode:document.getElementById(`prod-lcode`).value.trim()||null,shortDescription:document.getElementById(`prod-short`).value.trim(),price:parseFloat(document.getElementById(`prod-price`).value),buyPrice:parseFloat(document.getElementById(`prod-buy-price`).value)||0,discount:parseFloat(document.getElementById(`prod-discount`).value)||0,quantity:parseInt(document.getElementById(`prod-qty`).value),barcode:document.getElementById(`prod-barcode`).value.trim(),country:document.getElementById(`prod-country`).value.trim(),categoryId:parseInt(document.getElementById(`prod-cat`).value),images:r,cashbackPercentage:parseFloat(document.getElementById(`prod-cashback-pct`)?.value)||0}),a(o(`Mahsulot yaratildi`)),Ee()),me()}catch(e){a(e.message,`error`)}}async function Te(e){if(confirm(o(`Mahsulotni o'chirishga ishonchingiz komilmi?`)))try{await s.delete(`/products/${e}`),a(o(`Mahsulot o'chirildi`)),me()}catch(e){a(e.message,`error`)}}function Ee(){[`prod-name`,`prod-cat`,`prod-barcode`,`prod-price`,`prod-discount`,`prod-qty`,`prod-country`,`prod-lcode`,`prod-short`,`prod-image-url`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=e===`prod-discount`?`0`:``)});let e=document.getElementById(`prod-image-preview`);e&&(e.innerHTML=`<span style="font-size:32px; opacity:0.3;">🖼️</span>`);let t=document.getElementById(`prod-image`);t&&(t.value=``),a(o(`Forma tozalandi`))}function De(){pe=!pe,ge(pe?k.filter(e=>(e.quantity||0)<=0):k),setTimeout(()=>{let e=document.getElementById(`out-of-stock-btn`);e&&(pe?(e.style.background=`var(--danger)`,e.style.color=`#fff`,e.style.borderColor=`var(--danger)`):(e.style.background=``,e.style.color=``,e.style.borderColor=``))},50)}window.resetProductForm=Ee,window.renderProducts=me,window.renderProductsTable=ge,window.filterProducts=_e,window.openProductModal=ve,window.saveProduct=we,window.deleteProduct=Te,window.handleProductExport=xe,window.handleProductImport=Ce,window.handleProductTemplate=Se,window.toggleOutOfStockFilter=De,window.productPage=productPage,window.allProducts=k,window.allCategories=A,window.currentProducts=he,window.clientPage=1;var Oe=[],ke=[];async function Ae(){let e=document.getElementById(`page-content`),t=d();try{if(t)ke=await s.get(`/clients?businessId=${t}`)||[];else{let t=await s.get(`/businesses/my`).catch(()=>[]);if(!t||t.length===0){e.innerHTML=`<div class="empty-state"><div class="icon">🏢</div><h4>${o(`Biznes yarating`)}</h4></div>`;return}ke=(await Promise.all((t||[]).filter(e=>e).map(e=>s.get(`/clients?businessId=${e.id}`).catch(()=>[]).then(t=>((t||[]).filter(e=>e).forEach(t=>{t._businessName=e.name,t._businessId=e.id}),(t||[]).filter(e=>e)))))).flat().filter(e=>e)}je(ke)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function je(e,t=!1){typeof e==`boolean`&&(t=e,e=null),e&&(Oe=e,t||(window.clientPage=1));let n=Math.ceil(Oe.length/15),r=window.clientPage*15,i=Oe.slice(r-15,r),a=document.getElementById(`page-content`),s=[`acc-avatar-indigo`,`acc-avatar-green`,`acc-avatar-blue`,`acc-avatar-orange`],l=i.length===0&&!t?`<div class="empty-state"><div class="icon">👥</div><h4>${o(`Mijozlar yo'q`)}</h4></div>`:i.map((e,t)=>{let n=s[t%s.length],r=(e.fullName||`?`)[0].toUpperCase(),i=e._businessName?`<span class="badge" style="background:rgba(255,255,255,0.05); border:1px solid var(--border); font-size:10px; opacity:0.7; margin-left:8px;">${u(e._businessName)}</span>`:``;return`
        <div class="acc-item" id="client-acc-${e.id}">
          <div class="acc-header" onclick="toggleAcc('client-acc-${e.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar ${n}">${r}</div>
              <div>
                <div class="acc-title">${u(e.fullName)} ${i}</div>
                <div class="acc-subtitle">${u(e.phone)}</div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="badge" style="background:#EEF2FF; color:#4F46E5;">${o(`Mijoz`)}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📞</span>
                <div><div class="acc-detail-label">${o(`Telefon`)}</div><div class="acc-detail-value">${u(e.phone)}</div></div>
              </div>
              ${e.address?`<div class="acc-detail-item">
                <span class="acc-detail-icon">📍</span>
                <div><div class="acc-detail-label">${o(`Manzil`)}</div><div class="acc-detail-value">${u(e.address)}</div></div>
              </div>`:``}
              <div class="acc-detail-item">
                <span class="acc-detail-icon">📅</span>
                <div><div class="acc-detail-label">${o(`Qo'shilgan`)}</div><div class="acc-detail-value">${formatDate(e.createdAt)}</div></div>
              </div>
              <div class="acc-detail-item" style="border: 1px solid var(--success-glass); background: var(--success-glass); border-radius: 12px; padding: 10px;">
                <span class="acc-detail-icon" style="background: var(--success); color: white; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">💰</span>
                <div><div class="acc-detail-label" style="color:var(--success); font-weight: 600;">${o(`Keshbek`)}</div><div class="acc-detail-value" style="color:var(--success); font-weight:800; font-size: 15px;">${c(e.cashbackBalance||0)} ${o(`so'm`)}</div></div>
              </div>
              <div class="acc-detail-item" style="border: 1px solid var(--accent-glass); background: var(--accent-glass); border-radius: 12px; padding: 10px;">
                <span class="acc-detail-icon" style="background: var(--accent); color: white; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">⭐</span>
                <div><div class="acc-detail-label" style="color:var(--accent); font-weight: 600;">${o(`Ballar`)}</div><div class="acc-detail-value" style="color:var(--accent); font-weight:800; font-size: 15px;">${e.pointsBalance||0}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              <button class="btn btn-ghost btn-sm" onclick="showClientTransactions(${e.id}, '${u(e.fullName)}')">🛍️ ${o(`Sotuvlar`)}</button>
              ${window.hasPermission(`edit`)?`<button class="btn btn-success btn-sm" onclick='openClientModal(${JSON.stringify(e).replace(/'/g,`&#39;`)})'>✏️ ${o(`Tahrirlash`)}</button>`:``}
              ${window.hasPermission(`delete`)?`<button class="btn btn-danger btn-sm" onclick="deleteClient(${e.id})">🗑️ ${o(`O'chirish`)}</button>`:``}
            </div>
          </div>
        </div>`}).join(``);if(!t)a.innerHTML=`
      <div class="card-header" style="padding: 15px 20px; background: var(--bg-glass); border-bottom: 1px solid var(--border); border-radius: 20px 20px 0 0;">
        <div class="toolbar" style="width: 100%; display: flex; gap: 10px; align-items: center;">
          <div class="search-box" style="flex: 1; max-width: none; margin: 0;">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="${o(`Qidirish...`)}" id="client-search"
              value="${u(document.getElementById(`client-search`)?.value||``)}"
              oninput="filterClients(this.value)"
              style="color: var(--text-primary) !important; background: var(--bg-input) !important; height: 44px;" class="form-control" autocomplete="off">
          </div>
          ${d()&&window.hasPermission(`add`)?`<button class="btn btn-primary" onclick="openClientModal()" style="height: 44px; padding: 0 20px;">${o(`Qo'shish`)}</button>`:``}
        </div>
      </div>
      <div class="acc-list" id="client-acc-list" style="margin-top: 10px;">${l}</div>
      <div id="client-pagination-area">
        ${renderPageControls(`clientPage`,n,`renderClientsTable`)}
      </div>
    `,attachInfiniteScroll(`clientPage`,n,`renderClientsTable`);else{let e=document.getElementById(`client-acc-list`);e&&e.insertAdjacentHTML(`beforeend`,l);let t=document.getElementById(`client-pagination-area`);t&&(t.innerHTML=renderPageControls(`clientPage`,n,`renderClientsTable`)),attachInfiniteScroll(`clientPage`,n,`renderClientsTable`)}}function Me(e){let t=(e||``).toLowerCase(),n=ke.filter(e=>e.fullName&&String(e.fullName).toLowerCase().includes(t)||e.phone&&String(e.phone).toLowerCase().includes(t)),r=document.getElementById(`client-search`),i=r?r.selectionStart:0;je(n),setTimeout(()=>{let e=document.getElementById(`client-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function Ne(e=null){let t=!!e;openModal(`
    <div class="modal-header">
      <h3>${o(t?`Mijozni tahrirlash`:`Yangi mijoz`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveClient(event, ${t?e.id:0})" style="min-width:400px">
      <div class="form-group">
        <label>${o(`To'liq ism`)}</label>
        <input type="text" class="form-control" id="client-name" value="${t?u(e.fullName):``}" placeholder="${o(`Mijozning to'liq ismini kiriting`)}" required>
      </div>
      <div class="form-group">
        <label>${o(`Telefon`)}</label>
        <div style="position:relative">
          <input type="tel" class="form-control" id="client-phone" value="${t?u(e.phone):``}" placeholder="+998" required style="padding-left:40px">
           <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:16px; opacity:0.5;">📞</span>
        </div>
      </div>
      <div class="form-group">
        <label>${o(`Manzil`)}</label>
        <input type="text" class="form-control" id="client-address" value="${t&&e.address?u(e.address):``}" placeholder="${o(`Mijozning manzilini kiriting`)}">
      </div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${o(t?`Saqlash`:`Yaratish`)}</button>
      </div>
    </form>
  `)}async function Pe(e,t){e.preventDefault();let n=d(),r=document.getElementById(`client-name`).value.trim(),i=document.getElementById(`client-phone`).value.trim(),c=document.getElementById(`client-address`).value.trim()||null;if(i.startsWith(`+998`)){if(!/^\+998\d{9}$/.test(i)){a(o(`Telefon raqami noto'g'ri (+998XXXXXXXXX ko'rinishida bo'lsin)`),`error`);return}}else if(!i.startsWith(`+`)){a(o(`Telefon raqami '+' bilan boshlanishi kerak`),`error`);return}let l=s.getUser();if(l&&(l.phone===i||l.phoneNumber===i)){a(o(`O'zingizni mijoz sifatida qo'sha olmaysiz`),`error`);return}try{t?(await s.put(`/clients/${t}`,{businessId:n||0,fullName:r,phone:i,address:c}),a(o(`Mijoz yangilandi`)),closeModal()):(await s.post(`/clients`,{businessId:n,fullName:r,phone:i,address:c}),a(o(`Mijoz qo'shildi`)),document.getElementById(`client-name`).value=``,document.getElementById(`client-phone`).value=``,document.getElementById(`client-address`).value=``,document.getElementById(`client-name`).focus()),Ae()}catch(e){a(e.message,`error`)}}async function Fe(e){if(confirm(o(`Mijozni o'chirishga ishonchingiz komilmi?`)))try{let t=d();await s.delete(`/clients/${e}${t?`?businessId=`+t:``}`),a(o(`Mijoz o'chirildi`)),Ae()}catch(e){a(e.message,`error`)}}window.toggleClientTransAcc=async function(e,t){p(`client-trans-acc-`+e);let n=document.getElementById(`client-trans-items-`+e);if(n&&!n.dataset.loaded){n.innerHTML=`<div class="loader" style="width:20px;height:20px;margin:10px auto;"></div>`;try{Array.isArray(t)||(t=[t]);let e=t.map(e=>s.get(`/transactions/${e}/items`)),r=(await Promise.all(e)).flat();if(r.length===0){n.innerHTML=`<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:12px;">${o(`Ma'lumot yo'q`)}</div>`,n.dataset.loaded=`true`;return}let i=`<div style="background:var(--bg-secondary); border-radius:10px; padding:10px; margin-top:10px;">
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border); opacity:0.7;">
            <th style="text-align:left; padding-bottom:5px;">${o(`Nomi`)}</th>
            <th style="text-align:center; padding-bottom:5px;">${o(`Soni`)}</th>
            <th style="text-align:right; padding-bottom:5px;">${o(`Narxi`)}</th>
            <th style="text-align:right; padding-bottom:5px;">${o(`Jami`)}</th>
          </tr>
        </thead>
        <tbody>`;(r||[]).forEach(e=>{e&&(i+=`<tr>
          <td style="padding:5px 0; font-weight:600;">${u(e.productName)}</td>
          <td style="text-align:center; padding:5px 0;">${e.productQuantity}</td>
          <td style="text-align:right; padding:5px 0;">${c(e.productPrice)}</td>
          <td style="text-align:right; padding:5px 0; font-weight:600; color:var(--accent);">${c(e.productQuantity*e.productPrice)}</td>
        </tr>`)}),i+=`</tbody></table></div>`,n.innerHTML=i,n.dataset.loaded=`true`}catch(e){n.innerHTML=`<span style="color:red; font-size:12px;">${e.message}</span>`}}},window.renderClientHistoryRows=function(t){let n=``;n=t.length===0?`<div style="text-align:center; padding:20px; color:var(--text-muted);">${o(`Sotuvlar yo'q`)}</div>`:t.map(t=>{let n=t.debt>0,r=JSON.stringify(t.ids);return`
        <div class="acc-item" id="client-trans-acc-${t.id}">
          <div class="acc-header" onclick='toggleClientTransAcc(${t.id}, ${r})'>
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-indigo" style="${n?`background:linear-gradient(135deg,#EF4444,#DC2626)`:``}">🛒</div>
              <div>
                <div class="acc-title">№ ${t.ids.join(`, `)} — ${e(t.createdAt)}</div>
                <div class="acc-subtitle">
                  ${n?`<span class="badge badge-danger">${o(`Qarz`)}: ${c(t.debt)}</span>`:``}
                </div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="acc-price" style="color:var(--success);">${c(t.total)} ${o(`so'm`)}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid" style="margin-bottom:10px;">
              ${t.cash>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">💵</span>
                <div><div class="acc-detail-label">${o(`Naqd`)}</div><div class="acc-detail-value">${c(t.cash)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${t.card>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">💳</span>
                <div><div class="acc-detail-label">${o(`Karta`)}</div><div class="acc-detail-value">${c(t.card)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${t.click>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">📱</span>
                <div><div class="acc-detail-label">${o(`Click`)}</div><div class="acc-detail-value">${c(t.click)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${n?`<div class="acc-detail-item" style="border-color:#FCA5A5;">
                <span class="acc-detail-icon">⚠️</span>
                <div><div class="acc-detail-label" style="color:#EF4444;">${o(`Qarz`)}</div><div class="acc-detail-value" style="color:#EF4444;">${c(t.debt)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${t.useCashbackAmount>0?`<div class="acc-detail-item" style="border-left: 2px solid var(--success);">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label" style="color:var(--success);">${o(`Keshbek`)}</div><div class="acc-detail-value" style="color:var(--success); font-weight:700;">- ${c(t.useCashbackAmount)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${t.usePointsAmount>0?`<div class="acc-detail-item" style="border-left: 2px solid var(--accent);">
                <span class="acc-detail-icon">⭐</span>
                <div><div class="acc-detail-label" style="color:var(--accent);">${o(`Ballar`)}</div><div class="acc-detail-value" style="color:var(--accent); font-weight:700;">- ${c(t.usePointsAmount)} ${o(`so'm`)}</div></div>
              </div>`:``}
            </div>
            <div id="client-trans-items-${t.id}"></div>
            <div class="acc-actions" style="margin-top:10px; border-top:1px solid var(--border); padding-top:10px;">
              <button class="btn btn-ghost btn-sm" onclick='viewTransactionItems(${r})'>👁️ ${o(`Tafsilotlar`)}</button>
              <button class="btn btn-primary btn-sm" onclick='downloadTransactionPdf(${r})'>📄 ${o(`PDF`)}</button>
            </div>
          </div>
        </div>
      `}).join(``);let r=document.getElementById(`client-history-list`);return r&&(r.innerHTML=n),n},window.searchClientHistory=function(t){let n=(t||``).toLowerCase(),r=window.currentClientTransactions.filter(t=>t.ids.join(`, `).includes(n)||e(t.createdAt).includes(n));renderClientHistoryRows(r)};async function Ie(e,t){try{a(o(`Yuklanmoqda...`),`info`);let n=await s.get(`/transactions/client/${e}`),r=new Map;(n||[]).forEach(e=>{let t=`${e.createdAt.substring(0,10)}`;if(r.has(t)){let n=r.get(t);n.ids.push(e.id),n.total+=e.total,n.cash+=e.cash,n.card+=e.card,n.click+=e.click||0,n.debt+=e.debt,new Date(e.createdAt)>new Date(n.createdAt)&&(n.createdAt=e.createdAt)}else r.set(t,{...e,ids:[e.id]})}),window.currentClientTransactions=Array.from(r.values());let i=window.renderClientHistoryRows(window.currentClientTransactions),c=`
      <style>
        .client-history-modal { max-width: 900px !important; width: 100% !important; }
        @media (max-width: 1024px) { .client-history-modal { max-width: 95% !important; } }
      </style>
      <div class="modal-header">
        <div>
          <h3 style="margin:0; font-family:'Outfit';">${o(`Xaridlar tarixi`)}</h3>
          <p style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">👤 ${u(t)}</p>
        </div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      
      <div style="margin: 15px 0;">
        <div class="search-box" style="max-width:100%;">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="${o(`Qidirish (Sana yoki raqam)...`)}" oninput="searchClientHistory(this.value)" class="form-control" autocomplete="off">
        </div>
      </div>
      
      <div style="max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 5px;" class="custom-scroll">
        <div class="acc-list" id="client-history-list">${i}</div>
      </div>
    `;openModal(c,null,`client-history-modal`)}catch(e){a(e.message,`error`)}}window.renderClients=Ae,window.renderClientsTable=je,window.filterClients=Me,window.openClientModal=Ne,window.saveClient=Pe,window.deleteClient=Fe,window.showClientTransactions=Ie,window.clientPage=clientPage,window.allClientsList=ke,window.currentClients=Oe;var j=[],Le=[];window.employeesPage=1;var Re=10;async function ze(){let e=document.getElementById(`page-content`);e.innerHTML=`
        <div class="card" style="padding:24px;">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; gap:15px; flex-wrap:wrap; margin-bottom:20px;">
                <h3 style="font-family:'Outfit'; font-size:18px; margin:0;">${o(`Xodimlar`)}</h3>
                <button class="btn btn-primary" onclick="window.openAddEmployeeModal()">
                    <i data-lucide="user-plus"></i> ${o(`Xodim qo'shish`)}
                </button>
            </div>
            
            <div id="employees-list" class="acc-list">
                <div style="text-align:center; padding:40px;"><div class="loader-inline"></div></div>
            </div>
            <div id="employees-pagination"></div>
        </div>
    `;try{let[e,t]=await Promise.all([s.get(`/users/my-employees`),s.get(`/businesses/my`)]);j=e||[],Le=t||[],Be(),typeof lucide<`u`&&lucide.createIcons()}catch(e){a(e.message,`error`),document.getElementById(`employees-list`).innerHTML=`<p style="text-align:center; color:var(--danger);">${e.message}</p>`}}function Be(e=!1){typeof e!=`boolean`&&(e=!1);let t=document.getElementById(`employees-list`),n=document.getElementById(`employees-pagination`);if(!t)return;if(e||(window.employeesPage=1),j.length===0&&!e){t.innerHTML=`<div class="empty-state" style="padding:40px; text-align:center; color:var(--text-muted);">${o(`Sizda hali xodimlar yo'q`)}</div>`,n.innerHTML=``;return}let r=Math.ceil(j.length/Re);window.employeesPage>r&&(window.employeesPage=r);let i=window.employeesPage*Re,a=j.slice(i-Re,i),s=[`acc-avatar-indigo`,`acc-avatar-green`,`acc-avatar-blue`,`acc-avatar-orange`],c=a.map((e,t)=>{let n=e.businessIds||[],r=Le.filter(e=>n.includes(e.id)).map(e=>e.name).join(`, `),i=s[t%s.length],a=(e.firstName||`?`)[0].toUpperCase(),c=`${u(e.firstName)} ${u(e.lastName)}`,l=e.expirationDate?e.expirationDate.split(`T`)[0]:`—`;return`
            <div class="acc-item" id="emp-acc-${e.id}">
                <div class="acc-header" onclick="toggleAcc('emp-acc-${e.id}')">
                    <div class="acc-header-left">
                        ${e.image?`<img src="${e.image}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;">`:`<div class="acc-avatar ${i}">${a}</div>`}
                        <div>
                            <div class="acc-title">${c}</div>
                            <div class="acc-subtitle">@${u(e.userName)} ${e.phoneNumber?` · `+u(e.phoneNumber):``}</div>
                        </div>
                    </div>
                    <div class="acc-header-right">
                        <span class="acc-chevron">▼</span>
                    </div>
                </div>
                <div class="acc-body">
                    <div class="acc-detail-grid">
                        <div class="acc-detail-item">
                            <span class="acc-detail-icon">🏢</span>
                            <div>
                                <div class="acc-detail-label">${o(`Biznes`)}</div>
                                <div class="acc-detail-value">${u(r||o(`Biriktirilmagan`))}</div>
                            </div>
                        </div>
                        <div class="acc-detail-item">
                            <span class="acc-detail-icon">📅</span>
                            <div>
                                <div class="acc-detail-label">${o(`Obuna muddati`)}</div>
                                <div class="acc-detail-value">${l}</div>
                            </div>
                        </div>
                        ${e.phoneNumber?`
                        <div class="acc-detail-item">
                            <span class="acc-detail-icon">📞</span>
                            <div>
                                <div class="acc-detail-label">${o(`Telefon`)}</div>
                                <div class="acc-detail-value">${u(e.phoneNumber)}</div>
                            </div>
                        </div>`:``}
                    </div>
                    <div class="acc-actions">
                        <button class="btn btn-ghost btn-sm" onclick="window.openSalaryModal(${e.id})" title="${o(`Ish haqi`)}">
                            <i data-lucide="banknote" style="width:14px; height:14px;"></i> ${o(`Ish haqi`)}
                        </button>
                        <button class="btn btn-success btn-sm" onclick="window.openEditEmployeeModal(${e.id})" title="${o(`Tahrirlash`)}">
                            <i data-lucide="edit-3" style="width:14px; height:14px;"></i> ${o(`Tahrirlash`)}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteEmployee(${e.id})" title="${o(`O'chirish`)}">
                            <i data-lucide="trash-2" style="width:14px; height:14px;"></i> ${o(`O'chirish`)}
                        </button>
                    </div>
                </div>
            </div>
        `}).join(``);e?(t.insertAdjacentHTML(`beforeend`,c),n.innerHTML=window.renderPageControls(`employeesPage`,r,`renderEmployeesTable`),window.attachInfiniteScroll(`employeesPage`,r,`renderEmployeesTable`)):(t.innerHTML=c,n.innerHTML=window.renderPageControls(`employeesPage`,r,`renderEmployeesTable`),window.attachInfiniteScroll(`employeesPage`,r,`renderEmployeesTable`)),typeof lucide<`u`&&lucide.createIcons()}window.renderEmployeesTable=Be,window.openAddEmployeeModal=function(){let e=Le.map(e=>`
        <div style="margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;">
                <input type="checkbox" name="emp-businesses" value="${e.id}" onchange="window.toggleBizPermissions(${e.id}, this.checked)">
                <span>${u(e.name)}</span>
            </label>
            <div id="biz-perms-${e.id}" style="display:none; gap:15px; margin-left:25px; margin-top:5px; font-size:12px;">
                <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="perm-add" data-biz="${e.id}"> ${o(`Qo'shish`)}
                </label>
                <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="perm-edit" data-biz="${e.id}"> ${o(`Tahrirlash`)}
                </label>
                <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                    <input type="checkbox" class="perm-delete" data-biz="${e.id}"> ${o(`O'chirish`)}
                </label>
            </div>
        </div>
    `).join(``),t=`
        <form onsubmit="window.handleAddEmployee(event)" id="employee-form">
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Ism`)} </label>
                    <input type="text" class="form-control" id="emp-firstName" required>
                </div>
                <div class="form-group">
                    <label>${o(`Familiya`)} </label>
                    <input type="text" class="form-control" id="emp-lastName" required>
                </div>
            </div>
            <div class="form-group">
                <label style="margin-bottom:12px; display:block;">${o(`Biriktirilgan bizneslar`)} </label>
                <div style="max-height:150px; overflow-y:auto; padding:12px; border:1px solid var(--border-color); border-radius:8px;">
                    ${e||`<p style="color:var(--text-muted); font-size:13px;">${o(`Hozircha bizneslar yo'q`)}</p>`}
                </div>
            </div>
            <div class="form-group">
                <label>${o(`Telefon`)}</label>
                <input type="text" class="form-control" id="emp-phone" placeholder="+998901234567">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Foydalanuvchi nomi`)} </label>
                    <input type="text" class="form-control" id="emp-user" required>
                </div>
                <div class="form-group">
                    <label>${o(`Parol`)} </label>
                    <input type="password" class="form-control" id="emp-pass" required>
                </div>
            </div>
            <div class="form-group">
                <label>${o(`Obuna muddati`)} </label>
                <input type="date" class="form-control" id="emp-expiration" value="${new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split(`T`)[0]}" required>
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${o(`Profil rasmi`)}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="window.previewEmployeeImage(this, 'emp-image', 'emp-image-preview')">
                        <input type="hidden" id="emp-image" value="">
                        <div id="emp-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding-top:20px;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `;window.openModal(o(`Yangi xodim qo'shish`),t)},window.handleAddEmployee=async function(e){e.preventDefault();let t=Array.from(document.querySelectorAll(`input[name="emp-businesses"]:checked`)).map(e=>parseInt(e.value)),n=t.map(e=>{let t=document.getElementById(`biz-perms-${e}`);return{businessId:e,canAdd:t.querySelector(`.perm-add`).checked,canEdit:t.querySelector(`.perm-edit`).checked,canDelete:t.querySelector(`.perm-delete`).checked}}),r=document.getElementById(`emp-phone`).value.trim();if(r.startsWith(`+998`)){if(!/^\+998[0-9]{9}$/.test(r)){a(o(`Telefon raqami noto'g'ri formatda (Masalan: +998901234567)`),`error`);return}}else if(r&&!r.startsWith(`+`)){a(o(`Telefon raqami '+' bilan boshlanishi kerak`),`error`);return}let i={firstName:document.getElementById(`emp-firstName`).value,lastName:document.getElementById(`emp-lastName`).value,userName:document.getElementById(`emp-user`).value,phoneNumber:r,password:document.getElementById(`emp-pass`).value,expirationDate:document.getElementById(`emp-expiration`).value?new Date(document.getElementById(`emp-expiration`).value).toISOString():void 0,businessIds:t,businessPermissions:n,image:document.getElementById(`emp-image`).value};try{await s.post(`/users/employees`,i),a(o(`Xodim muvaffaqiyatli qo'shildi`)),document.getElementById(`emp-firstName`).value=``,document.getElementById(`emp-lastName`).value=``,document.getElementById(`emp-user`).value=``,document.getElementById(`emp-phone`).value=``,document.getElementById(`emp-pass`).value=``,document.getElementById(`emp-firstName`).focus(),ze()}catch(e){a(e.message,`error`)}},window.openEditEmployeeModal=async function(e){let t=j.find(t=>t.id===e);if(!t)return;let n=t.businessIds||[],r=Le.map(e=>{let r=n.includes(e.id),i=t.businessPermissions?t.businessPermissions.find(t=>t.businessId===e.id):null,a=i?i.canAdd:!1,s=i?i.canEdit:!1,c=i?i.canDelete:!1;return`
            <div style="margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;">
                    <input type="checkbox" name="emp-businesses" value="${e.id}" ${r?`checked`:``} onchange="window.toggleBizPermissions(${e.id}, this.checked)">
                    <span>${u(e.name)}</span>
                </label>
                <div id="biz-perms-${e.id}" style="display:${r?`flex`:`none`}; gap:15px; margin-left:25px; margin-top:5px; font-size:12px;">
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" class="perm-add" data-biz="${e.id}" ${a?`checked`:``}> ${o(`Qo'shish`)}
                    </label>
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" class="perm-edit" data-biz="${e.id}" ${s?`checked`:``}> ${o(`Tahrirlash`)}
                    </label>
                    <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" class="perm-delete" data-biz="${e.id}" ${c?`checked`:``}> ${o(`O'chirish`)}
                    </label>
                </div>
            </div>
        `}).join(``),i=`
        <form onsubmit="window.handleUpdateEmployee(event, ${t.id})" id="employee-form">
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Ism`)} </label>
                    <input type="text" class="form-control" id="emp-firstName" value="${u(t.firstName)}" required>
                </div>
                <div class="form-group">
                    <label>${o(`Familiya`)} </label>
                    <input type="text" class="form-control" id="emp-lastName" value="${u(t.lastName)}" required>
                </div>
            </div>
            <div class="form-group">
                <label style="margin-bottom:12px; display:block;">${o(`Biriktirilgan bizneslar`)}</label>
                <div style="max-height:150px; overflow-y:auto; padding:12px; border:1px solid var(--border-color); border-radius:8px;">
                    ${r||`<p style="color:var(--text-muted); font-size:13px;">${o(`Hozircha bizneslar yo'q`)}</p>`}
                </div>
            </div>
            <div class="form-group">
                <label>${o(`Telefon`)}</label>
                <input type="text" class="form-control" id="emp-phone" value="${u(t.phoneNumber||``)}">
            </div>
            <div class="form-group">
                <label>${o(`Yangi parol (ixtiyoriy)`)}</label>
                <input type="password" class="form-control" id="edit-emp-pass" placeholder="******">
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${o(`Profil rasmi`)}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="window.previewEmployeeImage(this, 'edit-emp-image', 'edit-emp-image-preview')">
                        <input type="hidden" id="edit-emp-image" value="${u(t.image||``)}">
                        <div id="edit-emp-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                            ${t.image?`<img src="${t.image}" style="width:100%; height:100%; object-fit:cover;">`:``}
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>${o(`Obuna muddati`)} *</label>
                <input type="date" class="form-control" id="emp-expiration" value="${t.expirationDate?t.expirationDate.split(`T`)[0]:``}" required>
            </div>
            <div class="modal-footer" style="padding-top:20px;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Yangilash`)}</button>
            </div>
        </form>
    `;window.openModal(o(`Xodimni tahrirlash`),i)},window.handleUpdateEmployee=async function(e,t){e.preventDefault();let n=Array.from(document.querySelectorAll(`input[name="emp-businesses"]:checked`)).map(e=>parseInt(e.value)),r=n.map(e=>{let t=document.getElementById(`biz-perms-${e}`);return{businessId:e,canAdd:t.querySelector(`.perm-add`).checked,canEdit:t.querySelector(`.perm-edit`).checked,canDelete:t.querySelector(`.perm-delete`).checked}}),i=document.getElementById(`emp-phone`).value.trim();if(i&&!/^\+998[0-9]{9}$/.test(i)){a(o(`Telefon raqami noto'g'ri formatda (Masalan: +998901234567)`),`error`);return}let c={firstName:document.getElementById(`emp-firstName`).value,lastName:document.getElementById(`emp-lastName`).value,phoneNumber:i,expirationDate:document.getElementById(`emp-expiration`).value?new Date(document.getElementById(`emp-expiration`).value).toISOString():void 0,businessIds:n,businessPermissions:r,image:document.getElementById(`edit-emp-image`)?document.getElementById(`edit-emp-image`).value:``},l=document.getElementById(`edit-emp-pass`)?document.getElementById(`edit-emp-pass`).value:``;l&&(c.password=l);try{await s.put(`/users/${t}`,c),a(o(`Xodim ma'lumotlari yangilandi`)),closeModal(),ze()}catch(e){a(e.message,`error`)}},window.deleteEmployee=async function(e){if(confirm(o(`Ushbu xodimni o'chirishga ishonchingiz komilmi?`)))try{await s.delete(`/users/${e}`),a(o(`Xodim o'chirildi`)),ze()}catch(e){a(e.message,`error`)}},window.previewEmployeeImage=async function(e,t,n){if(e.files&&e.files[0]){let r=new FormData;r.append(`file`,e.files[0]);try{let e=await s.post(`/upload`,r);e.url&&(document.getElementById(t).value=e.url,document.getElementById(n).innerHTML=`<img src="${e.url}" style="width:100%; height:100%; object-fit:cover;">`)}catch(e){a(e.message,`error`)}}},window.toggleBizPermissions=function(e,t){let n=document.getElementById(`biz-perms-${e}`);n&&(n.style.display=t?`flex`:`none`)},window.openSalaryModal=async function(e){let t=j.find(t=>t.id===e);if(!t)return;let n=Ve(),r=new Date,i=[``,`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`];try{let a=(await s.get(`/salaries/employee/${e}`)||[]).filter(e=>e&&typeof e==`object`).map(t=>`
            <tr>
                <td>${i[t.month]} ${t.year}</td>
                <td style="font-weight:700; color:var(--accent);">${window.formatPrice(t.amount)}</td>
                <td style="font-size:12px; color:var(--text-muted);">${u(t.description||``)}</td>
                <td style="text-align:right;">
                    <button class="btn-icon danger" onclick="window.deleteSalary(${t.id}, ${e})" title="${o(`O'chirish`)}">
                        <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                    </button>
                </td>
            </tr>
        `).join(``),c=`
            <div style="margin-bottom:20px; padding:15px; background:var(--bg-glass); border-radius:12px; border:1px solid var(--accent-glow);">
                <h4 style="margin-top:0; margin-bottom:10px; font-size:14px;">${o(`Yangi to'lov qo'shish`)}</h4>
                <form onsubmit="window.handleSalaryPayment(event, ${e}, ${n})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>${o(`Oy`)}</label>
                            <select class="form-control" id="salary-month" required>
                                ${i.map((e,t)=>t===0?``:`<option value="${t}" ${t===r.getMonth()+1?`selected`:``}>${o(e)}</option>`).join(``)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>${o(`Yil`)}</label>
                            <input type="number" class="form-control" id="salary-year" value="${r.getFullYear()}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>${o(`Summa`)}</label>
                        <input type="number" class="form-control" id="salary-amount" placeholder="0" required>
                    </div>
                    <div class="form-group">
                        <label>${o(`Izoh`)}</label>
                        <input type="text" class="form-control" id="salary-desc" placeholder="${o(`Masalan: Bonus bilan`)}">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">${o(`Qo'shish`)}</button>
                </form>
            </div>

            <h4 style="font-size:14px; margin-bottom:10px;">${o(`To'lovlar tarixi`)}</h4>
            <div class="table-container" style="max-height:200px; overflow-y:auto;">
                <table class="premium-table">
                    <thead>
                        <tr>
                            <th>${o(`DAVR`)}</th>
                            <th>${o(`SUMMA`)}</th>
                            <th>${o(`Izoh`)}</th>
                            <th style="text-align:right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${a||`<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">${o(`Hozircha to'lovlar yo'q`)}</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;window.openModal(`💸 ${t.firstName} ${t.lastName} — ${o(`Ish haqi`)}`,c),typeof lucide<`u`&&lucide.createIcons()}catch(e){a(e.message,`error`)}},window.handleSalaryPayment=async function(e,t,n){if(e.preventDefault(),!n){a(o(`Avval biznes tanlang`),`warning`);return}let r={employeeId:t,businessId:n,month:parseInt(document.getElementById(`salary-month`).value),year:parseInt(document.getElementById(`salary-year`).value),amount:parseFloat(document.getElementById(`salary-amount`).value),description:document.getElementById(`salary-desc`).value};try{await s.post(`/salaries`,r),a(o(`Ish haqi muvaffaqiyatli qo'shildi`)),window.openSalaryModal(t)}catch(e){a(e.message,`error`)}},window.deleteSalary=async function(e,t){if(confirm(o(`Ushbu to'lovni o'chirishni xohlaysizmi?`)))try{await s.delete(`/salaries/${e}`),a(o(`O'chirildi`)),window.openSalaryModal(t)}catch(e){a(e.message,`error`)}};function Ve(){return parseInt(localStorage.getItem(`selectedBusinessId`))}var M=[],N=[];window.transactionPage=1;var He=[],P=[],F=null,I=[],L={cash:0,card:0,click:0,debt:0},Ue=[];async function R(){let e=document.getElementById(`page-content`),t=d();if(!t){e.innerHTML=`<div class="empty-state"><div class="icon">🛒</div><h4>${o(`Avval biznes tanlang`)}</h4></div>`;return}try{P=await s.get(`/transactions?businessId=${t}${getDateQuery()}`)||[],We(P)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function We(t,n=!1){if(t===!0&&(n=!0,t=null),Array.isArray(t)){n||(window.transactionPage=1);let e=new Map;t.forEach(t=>{let n=t.createdAt.substring(0,10),r=`${t.clientId?`id_${t.clientId}`:t.clientNumber?`num_${t.clientNumber}`:`trans_${t.id}`}_${n}`;if(e.has(r)){let n=e.get(r);n.ids.push(t.id),n.total+=t.total,n.cash+=t.cash,n.card+=t.card,n.click+=t.click||0,n.debt+=t.debt,n.pointsEarned=(n.pointsEarned||0)+(t.pointsEarned||0),n.pointsUsed=(n.pointsUsed||0)+(t.pointsUsed||0),n.cashbackEarned=(n.cashbackEarned||0)+(t.cashbackEarned||0),n.cashbackUsed=(n.cashbackUsed||0)+(t.cashbackUsed||0),new Date(t.createdAt)>new Date(n.createdAt)&&(n.createdAt=t.createdAt)}else e.set(r,{...t,ids:[t.id],isGroup:!0})}),He=Array.from(e.values()).sort((e,t)=>new Date(t.createdAt)-new Date(e.createdAt)),n||(window.transactionPage=1)}let r=Math.ceil(He.length/15),i=window.transactionPage*15,a=He.slice(i-15,i),s=document.getElementById(`page-content`),l=a.length===0?`<div class="empty-state"><div class="icon">🛒</div><h4>${o(`Sotuvlar yo'q`)}</h4></div>`:a.map((t,n)=>{(window.transactionPage-1)*15+n+1;let r=t.debt>0,i=JSON.stringify(t.ids);return`
        <div class="acc-item" id="trans-acc-${t.id}">
          <div class="acc-header" onclick="toggleAcc('trans-acc-${t.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-indigo" style="${r?`background:linear-gradient(135deg,#EF4444,#DC2626)`:``}">🛒</div>
              <div>
                <div class="acc-title">№ ${t.ids.join(`, `)} — ${e(t.createdAt)}</div>
                <div class="acc-subtitle">
                  ${t.clientName?`<strong>${u(t.clientName)}</strong>`:t.clientNumber?u(t.clientNumber):o(`Begona xaridor`)}
                  ${r?`<span class="badge badge-danger" style="margin-left:6px;">${o(`Qarz`)}: ${c(t.debt)}</span>`:``}
                </div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="acc-price" style="color:var(--success);">${c(t.total)} ${o(`so'm`)}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              ${t.cash>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">💵</span>
                <div><div class="acc-detail-label">${o(`Naqd`)}</div><div class="acc-detail-value">${c(t.cash)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${t.card>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">💳</span>
                <div><div class="acc-detail-label">${o(`Karta`)}</div><div class="acc-detail-value">${c(t.card)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${t.click>0?`<div class="acc-detail-item">
                <span class="acc-detail-icon">📱</span>
                <div><div class="acc-detail-label">${o(`Click/Payme`)}</div><div class="acc-detail-value">${c(t.click)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${r?`<div class="acc-detail-item" style="border-color:#FCA5A5;">
                <span class="acc-detail-icon">⚠️</span>
                <div><div class="acc-detail-label" style="color:#EF4444;">${o(`Qarz`)}</div><div class="acc-detail-value" style="color:#EF4444;">${c(t.debt)} ${o(`so'm`)}</div></div>
              </div>`:``}
              ${(t.pointsEarned||0)>0?`<div class="acc-detail-item" style="border-left: 2px solid var(--success-glass);">
                <span class="acc-detail-icon">⭐</span>
                <div><div class="acc-detail-label" style="color:var(--success);">${o(`To'plangan ballar`)}</div><div class="acc-detail-value" style="color:var(--success); font-weight:800;">+${t.pointsEarned}</div></div>
              </div>`:``}
              ${(t.pointsUsed||0)>0?`<div class="acc-detail-item" style="border-left: 2px solid var(--accent);">
                <span class="acc-detail-icon">💫</span>
                <div><div class="acc-detail-label" style="color:var(--accent);">${o(`Ishlatilgan ballar`)}</div><div class="acc-detail-value" style="color:var(--accent); font-weight:800;">-${t.pointsUsed}</div></div>
              </div>`:``}
              ${(t.cashbackEarned||0)>0?`<div class="acc-detail-item" style="border-left: 2px solid var(--success);">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label" style="color:var(--success);">${o(`To'plangan keshbek`)}</div><div class="acc-detail-value" style="color:var(--success); font-weight:800;">+${c(t.cashbackEarned)}</div></div>
              </div>`:``}
              ${(t.cashbackUsed||0)>0?`<div class="acc-detail-item" style="border-left: 2px solid var(--danger);">
                <span class="acc-detail-icon">💸</span>
                <div><div class="acc-detail-label" style="color:var(--danger);">${o(`Ishlatilgan keshbek`)}</div><div class="acc-detail-value" style="color:var(--danger); font-weight:800;">-${c(t.cashbackUsed)}</div></div>
              </div>`:``}
              <div class="acc-detail-item">
                <span class="acc-detail-icon">👤</span>
                <div><div class="acc-detail-label">${o(`Mijoz`)}</div><div class="acc-detail-value">${t.clientName?u(t.clientName):t.clientNumber?u(t.clientNumber):o(`Begona xaridor`)}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">🏢</span>
                <div><div class="acc-detail-label">${o(`Mas'ul`)}</div><div class="acc-detail-value">${u(t.createdByName||o(`Tizim`))}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              <button class="btn btn-ghost btn-sm" onclick='viewTransactionItems(${i})'>👁️ ${o(`Tafsilotlar`)}</button>
              <button class="btn btn-primary btn-sm" onclick='downloadTransactionPdf(${i})'>📄 ${o(`PDF`)}</button>
              
            </div>
          </div>
        </div>`}).join(``);if(!n)s.innerHTML=`
      <div class="card-header" style="padding: 15px 20px; background: var(--bg-glass); border-bottom: 1px solid var(--border); border-radius: 20px 20px 0 0;">
        <div class="toolbar" style="width: 100%; display: flex; gap: 10px; align-items: center;">
          <div class="toolbar-actions" style="display: flex; gap: 10px; width: 100%;">
            <button class="btn btn-ghost" onclick="openDateFilterModal()" style="height: 42px; flex: 1; justify-content: center; font-size: 13px;" title="${o(`Sana bo'yicha filter`)}">📅 ${o(`Sana`)}</button>
            <button class="btn btn-primary" onclick="openSaleModal()" style="height: 42px; flex: 1.5; justify-content: center; font-size: 13px;">${o(`Qo'shish`)}</button>
          </div>
          <div class="search-box" style="width: 100%; margin: 0;">
            <span class="search-icon" style="left: 12px;">🔍</span>
            <input type="text" placeholder="${o(`Mijoz bo'yicha qidirish...`)}" id="transaction-search"
              value="${u(document.getElementById(`transaction-search`)?.value||``)}"
              oninput="filterTransactions(this.value)"
              style="padding-left: 38px !important; height: 42px; font-size: 13px;" class="form-control" autocomplete="off">
          </div>
        </div>
      </div>
      <div class="acc-list" id="transaction-acc-list" style="margin-top: 10px;">${l}</div>
      <div id="transaction-pagination-area">
        ${renderPageControls(`transactionPage`,r,`renderTransactionsTable`)}
      </div>
    `,attachInfiniteScroll(`transactionPage`,r,`renderTransactionsTable`);else{let e=document.getElementById(`transaction-acc-list`);e&&e.insertAdjacentHTML(`beforeend`,l);let t=document.getElementById(`transaction-pagination-area`);t&&(t.innerHTML=renderPageControls(`transactionPage`,r,`renderTransactionsTable`)),attachInfiniteScroll(`transactionPage`,r,`renderTransactionsTable`)}}function Ge(e){let t=(e||``).toLowerCase(),n=P.filter(e=>e.clientNumber&&String(e.clientNumber).toLowerCase().includes(t)||e.clientName&&String(e.clientName).toLowerCase().includes(t)),r=document.getElementById(`transaction-search`),i=r?r.selectionStart:0;We(n),setTimeout(()=>{let e=document.getElementById(`transaction-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}async function Ke(e){if(!confirm(o(`Haqiqatan ham bu sotuvni o'chirmoqchimisiz? Bu mahsulotlarni omborga qaytaradi.`)))return;let t=d();try{a(o(`O'chirilmoqda...`),`info`),await s.delete(`/transactions/${e}?businessId=${t}`),a(o(`Muvaffaqiyatli o'chirildi`)),R()}catch(e){a(e.message,`error`)}}async function qe(){d();try{let e=await s.get(`/businesses/my`).catch(()=>[])||[],[t,n]=await Promise.all([s.get(`/products/my`),Promise.all((e||[]).filter(e=>e).map(e=>s.get(`/clients?businessId=${e.id}`).catch(()=>[])))]),r=n.flat().filter(e=>e),i=new Map;r.forEach(e=>i.set(e.id,e));let a=Array.from(i.values());M=(t||[]).filter(e=>e&&!e.isDeleted&&e.quantity>0).map(t=>{let n=(e||[]).find(e=>e&&e.id===t.businessId);return{...t,businessName:n?n.name:o(`Noma'lum`)}}),Ue=a||[],F=null,I=[],L={cash:0,card:0,click:0,debt:0},N=[],openModal(`
      <div class="modal-header">
        <div style="display:flex; flex-direction:column; gap:4px;">
          <h3 id="sale-modal-title">${o(`Yangi sotuv`)}</h3>
          <div class="sale-steps">
            <div class="step active" id="step-1-indicator">1. ${o(`Mahsulotlar`)}</div>
            <div class="step-divider"></div>
            <div class="step" id="step-2-indicator">2. ${o(`To'lov`)}</div>
          </div>
        </div>
        <button type="button" class="modal-close" onclick="closeModal()">✕</button>
      </div>
      
      <div id="sale-step-1" class="sale-segment">
        <div class="form-group" style="position:relative; margin-bottom: 20px;">
          <div class="barcode-input-group">
            <div class="search-box" style="flex: 1; max-width: none; margin: 0;">
              <span class="search-icon">🔍</span>
              <input type="text" class="form-control" id="sale-product-search" placeholder="${o(`Qidirish (Nomi, Barcode)...`)}" oninput="searchSaleProduct(this.value)" autocomplete="off">
            </div>
            <button type="button" class="btn-camera-scan" title="${o(`Kamera orqali skanerlash`)}" onclick="window.openCameraScanner(function(code){ addSaleProductByBarcode(code); })">📷</button>
          </div>
          <div id="sale-search-results" class="search-results-dropdown"></div>
        </div>

        <div id="sale-batches-container" style="margin-bottom: 15px; max-height: 120px; overflow-y: auto;"></div>
        <div id="sale-items-container" style="min-height: 200px; max-height: 350px; overflow-y: auto;"></div>
        
        <div class="modal-footer" style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div id="sale-total-qty-mini" style="font-size: 16px; font-weight: 600; color: var(--text-muted);">0 ${o(`ta`)}</div>
            <div id="sale-total-mini" style="font-size: 20px; font-weight: 700; color: var(--primary);">0 ${o(`so'm`)}</div>
          </div>
          <button type="button" class="btn btn-primary" onclick="goToSalePaymentStep()" style="padding: 10px 30px;">${o(`To'lovga o'tish`)} →</button>
        </div>
      </div>

      <div id="sale-step-2" class="sale-segment" style="display:none;">
        <div style="background: var(--bg-glass); padding: 15px 20px; border-radius: 16px; border: 1px solid var(--border); margin-bottom: 25px;">
          <h4 style="margin:0 0 15px 0; font-size:14px; color:var(--text-primary); text-align:center; text-transform:uppercase; letter-spacing:1px;">${o(`To'lov yoyilmasi`)}</h4>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:14px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">${o(`Mahsulotlar jami`)}:</span>
              <span id="breakdown-subtotal" style="font-weight:600;">0 ${o(`so'm`)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">${o(`Chegirma`)}:</span>
              <span id="breakdown-discount" style="font-weight:600; color:var(--danger);">- 0 ${o(`so'm`)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; display:none;" id="breakdown-cashback-row">
              <span style="color:var(--text-muted);">${o(`Keshbek ishlatildi`)}:</span>
              <span id="breakdown-cashback" style="font-weight:600; color:var(--success);">- 0 ${o(`so'm`)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; display:none;" id="breakdown-points-row">
              <span style="color:var(--text-muted);">${o(`Ball ishlatildi`)}:</span>
              <span id="breakdown-points" style="font-weight:600; color:var(--accent);">- 0 ${o(`so'm`)}</span>
            </div>
            <div style="height:1px; background:var(--border); margin:4px 0;"></div>
            <div style="display:flex; justify-content:space-between; font-size:18px;">
              <span style="font-weight:700;">${o(`To'lanishi kerak`)}:</span>
              <span id="breakdown-payable" style="font-weight:800; color:var(--primary);">0 ${o(`so'm`)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:8px;">
              <span style="color:var(--text-muted);">${o(`To'lanayotgan summa`)}:</span>
              <span id="breakdown-paid" style="font-weight:600; color:var(--success);">0 ${o(`so'm`)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;" id="breakdown-remaining-row">
              <span style="color:var(--text-muted);">${o(`Qoldiq`)}:</span>
              <span id="breakdown-remaining" style="font-weight:700; color:var(--primary);">0 ${o(`so'm`)}</span>
            </div>
          </div>
          <!-- Hidden old element for backward compatibility with scripts if missed -->
          <span id="sale-total-value" style="display:none;"></span>
          <div id="cumulative-total" style="display:none;"></div>
        </div>

        <div class="payment-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div class="form-group">
            <label>💵 ${o(`Naqd`)}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-cash" value="0" oninput="updateSalePayment()">
          </div>
          <div class="form-group">
            <label>💳 ${o(`Karta`)}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-card" value="0" oninput="updateSalePayment()">
          </div>
          <div class="form-group">
            <label>📱 Click/Payme</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-click" value="0" oninput="updateSalePayment()">
          </div>
          <div class="form-group">
            <label>⚠️ ${o(`Qarz`)}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-debt" value="0" readonly style="color: var(--warning); font-weight: 800;">
          </div>
          <div class="form-group">
            <label>🏷️ ${o(`Chegirma`)}</label>
            <input type="number" step="0.01" class="form-control form-control-lg" id="sale-discount" value="0" oninput="updateSalePayment()">
          </div>
        </div>

        <!-- Improved Bonus Section -->
        <div id="bonus-section" style="display:none; margin-top:15px; padding:15px; background:var(--bg-secondary); border-radius:16px; border:1px solid var(--primary-glass);">
          <h5 style="margin:0 0 12px 0; font-size:12px; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:8px;">
            <i data-lucide="sparkles" style="width:14px;"></i> ${o(`Bonuslar va Takliflar`)}
          </h5>
          <div id="bonus-cards-container" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <!-- Dynamic Bonus Cards -->
          </div>
          
          <!-- Hidden inputs for backward compatibility with updateSalePayment logic -->
          <input type="hidden" id="sale-cashback-used" value="0">
          <input type="hidden" id="sale-points-used" value="0">
        </div>

        <div id="payment-error-msg" style="color: #EF4444; font-size: 13px; font-weight: 700; margin: 15px 0; display: none; text-align: center; background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px;">
          ⚠️ ${o(`"JAMI" dan katta summani kirita olmaysiz!`)}
        </div>

        <div class="form-row" style="margin-top:10px">
          <div class="form-group" style="flex: 1.5; position: relative;">
            <label>${o(`Mijoz (ixtiyoriy)`)}</label>
            <div class="search-box" style="max-width: 100%;">
              <span class="search-icon">🔍</span>
              <input type="text" class="form-control" id="sale-client-search" placeholder="${o(`Mijoz nomi yoki tel...`)}" oninput="searchSaleClient(this.value)" autocomplete="off">
              <input type="hidden" id="sale-client-id" value="">
            </div>
            <div id="sale-client-results" class="search-results-dropdown"></div>
          </div>
          <div class="form-group" style="flex: 1;">
            <label>${o(`Izoh`)}</label>
            <input type="text" class="form-control" id="sale-desc" placeholder="${o(`Izoh`)}">
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 25px; border-top: 1px solid var(--border); padding-top: 20px;">
          <button type="button" class="btn btn-ghost" onclick="backToSaleProducts()">${o(`Orqaga`)}</button>
          <button type="button" class="btn btn-primary" onclick="finalizeSale(event)" style="padding: 12px 50px; font-size: 16px;">✅ ${o(`Saqlash`)}</button>
        </div>
      </div>

      <style>
        .sale-steps { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
        .sale-steps .step { font-size: 11px; font-weight: 600; color: var(--text-muted); padding: 2px 8px; border-radius: 4px; background: var(--bg-secondary); }
        .sale-steps .step.active { color: white; background: var(--primary); }
        .sale-steps .step-divider { width: 20px; height: 1px; background: var(--border); }
        
        .sale-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          max-height: 220px;
          overflow-y: auto;
          padding: 5px;
          background: var(--bg-input);
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .catalog-item-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
        }
        .catalog-item-card:hover { border-color: var(--primary); transform: translateY(-3px); box-shadow: var(--shadow-md); background: var(--bg-glass); }
        .catalog-item-card:active { transform: scale(0.95); }
        .cic-name { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cic-price { font-size: 12px; font-weight: 800; color: var(--success); }
        .cic-stock { font-size: 10px; font-weight: 600; color: var(--text-muted); }
        .cic-badge { position: absolute; top: 6px; right: 6px; font-size: 9px; padding: 1px 4px; border-radius: 4px; background: rgba(0,0,0,0.2); }
        .cic-low-stock { color: #EF4444 !important; }

        .search-results-dropdown {
          position: absolute; top: 100%; left: 0; right: 0;
          background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md);
          max-height: 250px; overflow-y: auto; z-index: 1100; box-shadow: var(--shadow-lg); display: none;
        }
        .search-result-item {
          padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--border); transition: 0.2s;
        }
        .search-result-item:hover { background: var(--bg-glass); }
        .btn-remove { 
          background: rgba(239, 68, 68, 0.1); color: #EF4444; border: none; padding: 6px 12px; 
          border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s;
        }
        .btn-remove:hover { background: #EF4444; color: white; }
      </style>
    `,null,`modal-wide`),z(),setTimeout(()=>document.getElementById(`sale-product-search`).focus(),150)}catch(e){a(e.message,`error`)}}window.goToSalePaymentStep=function(){if(N.length===0&&I.length===0){a(o(`Avval mahsulotlarni tanlang`),`warning`);return}document.getElementById(`sale-step-1`).style.display=`none`,document.getElementById(`sale-step-2`).style.display=`block`,document.getElementById(`step-1-indicator`).classList.remove(`active`),document.getElementById(`step-2-indicator`).classList.add(`active`),B()},window.backToSaleProducts=function(){document.getElementById(`sale-step-1`).style.display=`block`,document.getElementById(`sale-step-2`).style.display=`none`,document.getElementById(`step-1-indicator`).classList.add(`active`),document.getElementById(`step-2-indicator`).classList.remove(`active`)};function Je(e){let t=document.getElementById(`sale-search-results`);if(!e.trim()){t.style.display=`none`;return}let n=(e||``).toLowerCase();M.find(t=>t.barcode===(e||``).trim());let r=M.filter(e=>e.name&&String(e.name).toLowerCase().includes(n)||e.barcode&&String(e.barcode).toLowerCase().includes(n)).slice(0,10);r.length===0?t.innerHTML=`<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 13px;">${o(`Mahsulot topilmadi`)}</div>`:t.innerHTML=r.map(e=>`
      <div class="search-result-item" style="${e.quantity<=0?`opacity: 0.6; filter: grayscale(1);`:``}" 
           onclick="addSaleProductById(${e.id})">
        <div>
          <div class="p-name">${u(e.name)} <span style="font-size:10px; opacity:0.6; font-weight:normal;">🏢 ${u(e.businessName)}</span></div>
          <div class="p-info">${e.barcode?e.barcode:``}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; color: ${e.quantity<=0?`#EF4444`:`var(--success)`};">
            ${e.discount>0?`<span style="text-decoration: line-through; font-size: 11px; opacity: 0.6; margin-right: 5px;">${c(e.price)}</span>`:``}
            ${c(e.discount>0?e.price*(1-e.discount/100):e.price)}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: ${e.quantity<=10?`#EF4444`:`inherit`};">
            ${e.quantity} ${o(`dona`)}
          </div>
        </div>
      </div>
    `).join(``),t.style.display=`block`}document.addEventListener(`keydown`,e=>{let t=document.getElementById(`sale-product-search`);if(t&&document.activeElement===t&&e.key===`Enter`){let n=t.value.trim();if(n){let t=M.find(e=>e.barcode===n);t&&(e.preventDefault(),Ye(t.id))}}}),window.searchSaleClient=function(e){let t=document.getElementById(`sale-client-results`);if(!t)return;if(!e.trim()){t.style.display=`none`;return}let n=(e||``).toLowerCase(),r=Ue.filter(e=>e.fullName&&String(e.fullName).toLowerCase().includes(n)||e.phone&&String(e.phone).toLowerCase().includes(n)).slice(0,10);r.length===0?t.innerHTML=`<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 13px;">${o(`Mijoz topilmadi`)}</div>`:t.innerHTML=r.map(e=>`
      <div class="search-result-item" onclick="selectSaleClient(${e.id})">
        <div>
          <div style="font-weight:700; color:var(--text-primary);">${u(e.fullName)}</div>
          <div style="font-size:12px; color:var(--text-muted);">${u(e.phone)}</div>
        </div>
        <div style="text-align: right;">
           <span class="badge" style="background:var(--primary-glass); color:var(--primary); font-size:10px;">${c(e.cashbackBalance)} ${o(`keshbek`)}</span>
        </div>
      </div>
    `).join(``),t.style.display=`block`},window.selectSaleClient=function(e){let t=Ue.find(t=>t.id==e);if(!t)return;let n=document.getElementById(`sale-client-search`);n&&(n.value=t.fullName);let r=document.getElementById(`sale-client-id`);r&&(r.value=e);let i=document.getElementById(`sale-client-results`);i&&(i.style.display=`none`),window.onSaleClientChange(e)};function Ye(e){let t=M.find(t=>t.id===e);if(!t)return;let n=N.find(t=>t.productId==e);if((n?n.quantity+1:1)>t.quantity){a(o(`Sotuvda yetarli mahsulot qoldig'i mavjud emas!`),`warning`);return}if(n)n.quantity++;else{let n=t.discount>0?t.price*(1-t.discount/100):t.price;N.push({productId:e,quantity:1,price:n,name:t.name,businessId:t.businessId,businessName:t.businessName})}let r=document.getElementById(`sale-product-search`);r.value=``,document.getElementById(`sale-search-results`).style.display=`none`,r.focus(),z()}function z(){let e=document.getElementById(`sale-items-container`);if(e){if(N.length===0){e.innerHTML=`
      <div class="empty-state" style="padding: 20px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px dashed var(--border);">
        <p style="font-size: 13px;">${o(`Hali mahsulot qo'shilmadi. Yuqoridan qidiring.`)}</p>
      </div>`,B();return}e.innerHTML=`
    <div class="sale-items" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; margin: 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: var(--bg-secondary); border-bottom: 2px solid var(--border);">
          <tr>
            <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px;">${o(`Mahsulot`)}</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px; width: 90px;">${o(`Soni`)}</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px; width: 140px;">${o(`Narxi`)}</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: var(--text-primary) !important; background: transparent !important; text-transform: uppercase; letter-spacing: 0.5px; width: 130px;">${o(`Jami`)}</th>
            <th style="padding: 10px; width: 44px; background: transparent !important;"></th>
          </tr>
        </thead>
        <tbody>
          ${N.map((e,t)=>`
            <tr class="sale-item-row" style="border-bottom: 1px solid var(--border);">
              <td class="td-product" data-label="${o(`Mahsulot`)}">
                <div class="product-info">
                  <div class="product-name" style="font-weight:600; color:var(--text-primary);">${u(e.name||`Unknown`)}</div>
                  <div class="product-business" style="font-size:11px; color:var(--text-muted);">🏢 ${u(e.businessName)}</div>
                </div>
              </td>
              <td class="td-qty" data-label="${o(`Soni`)}">
                <div style="display:flex; align-items:center; gap:4px; justify-content:center;">
                  <input type="number" class="form-control sale-item-input" value="${e.quantity}" min="1" oninput="onSaleQtyChange(${t}, this.value)" style="width:60px; text-align:center; font-weight:700; color: var(--text-primary) !important; background: var(--bg-input) !important; border: 1px solid var(--border) !important;">
                  <span style="font-size:10px; color:var(--text-muted);">${o(`ta`)}</span>
                </div>
              </td>
              <td class="td-price" data-label="${o(`Narxi`)}">
                <input type="number" step="0.01" class="form-control sale-item-input" value="${e.price}" oninput="onSalePriceChange(${t}, this.value)">
              </td>
              <td class="td-total" data-label="${o(`Jami`)}">
                <div id="item-total-${t}" class="item-total-val" style="font-weight:700; color:var(--success); text-align:right;">${c(e.price*e.quantity)}</div>
              </td>
              <td class="td-action">
                <button type="button" class="btn-remove" onclick="removeSaleItem(${t})" title="${o(`O'chirish`)}">🗑️</button>
              </td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    </div > `,B()}}function Xe(e){N.splice(e,1),z()}function Ze(e,t){let n=parseInt(t)||1,r=N[e].productId,i=M.find(e=>e.id===r);if(i&&n>i.quantity){a(`${o(`Zaxirada atigi`)} ${i.quantity} ${o(`dona mavjud`)}`,`warning`),N[e].quantity=i.quantity,z(),B();return}N[e].quantity=n;let s=N[e].price*n,l=document.getElementById(`item-total-${e}`);l&&(l.textContent=c(s)),B()}function Qe(e,t){let n=parseFloat(t)||0;N[e].price=n;let r=n*N[e].quantity,i=document.getElementById(`item-total-${e}`);i&&(i.textContent=c(r)),B()}function B(){let e=N.reduce((e,t)=>e+parseInt(t.quantity||0),0)+I.reduce((e,t)=>e+parseInt(t.quantity||0),0),t=N.reduce((e,t)=>e+t.price*t.quantity,0),n=document.getElementById(`sale-total-qty-mini`);n&&(n.textContent=`${e} ${o(`ta`)}`);let r=document.getElementById(`sale-total-mini`);r&&(r.textContent=`${c(t)} ${o(`so'm`)}`);let i=document.getElementById(`sale-total-value`);i&&(i.textContent=`${c(t+I.reduce((e,t)=>e+t.price*t.quantity,0))} ${o(`so'm`)}`),V()}function V(){let e=N.reduce((e,t)=>e+t.price*t.quantity,0)+I.reduce((e,t)=>e+t.price*t.quantity,0),t=document.getElementById(`sale-cash`),n=document.getElementById(`sale-card`),r=document.getElementById(`sale-click`);if(!t)return;let i=parseFloat(t.value)||0,a=parseFloat(n.value)||0,s=parseFloat(r.value)||0,l=parseFloat(document.getElementById(`sale-cashback-used`)?.value||0)||0,u=parseFloat(document.getElementById(`sale-points-used`)?.value||0)||0,d=parseFloat(document.getElementById(`sale-discount`)?.value||0)||0,f=L.cash+L.card+L.click,p=f+(i+a+s+l+u),m=document.getElementById(`sale-debt`),h=document.getElementById(`payment-error-msg`),g=document.getElementById(`breakdown-subtotal`),_=document.getElementById(`breakdown-discount`),v=document.getElementById(`breakdown-cashback-row`),y=document.getElementById(`breakdown-cashback`),b=document.getElementById(`breakdown-points-row`),x=document.getElementById(`breakdown-points`),S=document.getElementById(`breakdown-payable`),C=document.getElementById(`breakdown-paid`),w=document.getElementById(`breakdown-remaining`);document.getElementById(`breakdown-remaining-row`),g&&(g.textContent=`${c(e)} ${o(`so'm`)}`),_&&(_.textContent=`- ${c(d)} ${o(`so'm`)}`),l>0?(v&&(v.style.display=`flex`),y&&(y.textContent=`- ${c(l)} ${o(`so'm`)}`)):v&&(v.style.display=`none`),u>0?(b&&(b.style.display=`flex`),x&&(x.textContent=`- ${c(u)} ${o(`so'm`)}`)):b&&(b.style.display=`none`);let T=e-d,ee=T-l-u;S&&(S.textContent=`${c(Math.max(0,ee))} ${o(`so'm`)}`);let E=i+a+s+f;C&&(C.textContent=`${c(E)} ${o(`so'm`)}`);let D=ee-E;w&&(w.textContent=`${c(Math.max(0,D))} ${o(`so'm`)}`,D<=0?w.style.color=`var(--success)`:w.style.color=`var(--primary)`),p>T+.01?(S&&(S.style.color=`#EF4444`),m.style.color=`#EF4444`,h&&(h.style.display=`block`)):(S&&(S.style.color=`var(--primary)`),m.style.color=`var(--warning)`,h&&(h.style.display=`none`)),T-p,m&&(m.value=Math.max(0,D)),window.updatePointsEarnedPreview&&window.updatePointsEarnedPreview()}async function $e(){d();let e=N.filter(e=>e.productId);if(e.length===0){a(o(`Kamida bitta mahsulot tanlang`),`warning`);return}try{let t=d();if(!t&&e.length>0&&(t=e[0].businessId),!t){a(o(`Iltimos, avval biznesni tanlang`),`error`);return}let n=e.reduce((e,t)=>e+t.price*t.quantity,0),r=document.getElementById(`sale-client-id`).value,i=parseFloat(document.getElementById(`sale-cash`).value)||0,c=parseFloat(document.getElementById(`sale-card`).value)||0,l=parseFloat(document.getElementById(`sale-click`).value)||0,u=parseFloat(document.getElementById(`sale-debt`).value)||0,f=e.reduce((e,t)=>e+t.price*t.quantity,0)+I.reduce((e,t)=>e+t.price*t.quantity,0);if(L.cash+L.card+L.click+(i+c+l)>f){a(o(`"JAMI" dan katta summani kirita olmaysiz!`),`error`);let e=document.getElementById(`sale-total-value`);e&&(e.classList.add(`shake`),setTimeout(()=>e.classList.remove(`shake`),500));return}F?(await s.post(`/transactions/${F}/items?businessId=${t}`,e.map(e=>({productId:parseInt(e.productId),productQuantity:e.quantity,productPrice:e.price,businessId:e.businessId}))),L.cash+=i,L.card+=c,L.click+=l,L.debt+=u):(F=(await s.post(`/transactions`,{businessId:t,total:n,cash:i,card:c,click:l,debt:u,clientId:r?parseInt(r):null,description:document.getElementById(`sale-desc`).value.trim(),items:e.map(e=>({productId:parseInt(e.productId),productQuantity:e.quantity,productPrice:e.price,businessId:e.businessId}))})).id,L.cash=i,L.card=c,L.click=l,L.debt=u),I=[...I,...e],N=[],document.getElementById(`sale-cash`).value=0,document.getElementById(`sale-card`).value=0,document.getElementById(`sale-click`).value=0,z(),et(),a(o(`Xarid saqlandi`),`success`)}catch(e){a(e.message,`error`)}}function et(){let e=document.getElementById(`sale-batches-container`);if(!e)return;if(I.length===0){e.innerHTML=``;return}e.innerHTML=`
    <div style="background: var(--bg-glass); padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size:12px;">
      <div style="font-weight:bold; margin-bottom:5px; opacity:0.8;">${o(`Saqlangan mahsulotlar`)}:</div>
      <div style="display:flex; flex-wrap:wrap; gap:5px;">
        ${I.map(e=>`
          <span style="background:var(--primary-glass); color:var(--primary); padding:2px 8px; border-radius:10px; font-weight:600;">
            ${u(e.name)} x ${e.quantity}
          </span>
        `).join(``)}
      </div>
    </div>
  `;let t=document.getElementById(`cumulative-total`);if(t){let e=I.reduce((e,t)=>e+t.price*t.quantity,0);t.textContent=`${o(`Avval saqlangan`)}: ${c(e)} ${o(`so'm`)}`}}async function tt(e){e&&e.preventDefault();let t=parseFloat(document.getElementById(`sale-cash`).value)||0,n=parseFloat(document.getElementById(`sale-card`).value)||0,r=parseFloat(document.getElementById(`sale-click`).value)||0,i=parseFloat(document.getElementById(`sale-discount`).value)||0,c=N.reduce((e,t)=>e+t.price*t.quantity,0)+I.reduce((e,t)=>e+t.price*t.quantity,0),l=c-i,u=L.cash+L.card+L.click;if(u+t+n+r>l+.01){a(o(`"JAMI" dan katta summani kirita olmaysiz!`),`error`);return}try{a(o(`Yakunlanmoqda...`),`info`);let e=d();if(e||(N.length>0?e=N[0].businessId:I.length>0&&(e=I[0].businessId)),!e){a(o(`Iltimos, avval biznesni tanlang`),`error`);return}let f=document.getElementById(`sale-client-id`).value,p=document.getElementById(`sale-desc`).value.trim(),m=parseFloat(document.getElementById(`sale-cashback-used`)?.value||0)||0,h=parseFloat(document.getElementById(`sale-points-used`)?.value||0)||0,g=Math.max(0,l-(u+t+n+r+m+h));if(F?(N.length>0&&await s.post(`/transactions/${F}/items?businessId=${e}`,N.map(e=>({productId:parseInt(e.productId),productQuantity:e.quantity,productPrice:e.price,businessId:e.businessId}))),await s.put(`/transactions/${F}`,{total:c,cash:L.cash+t,card:L.card+n,click:L.click+r,debt:g,discount:i,usePointsAmount:h,clientId:f?parseInt(f):null,description:p})):F=(await s.post(`/transactions`,{businessId:e,total:c,cash:t,card:n,click:r,debt:g,discount:i,useCashbackAmount:m,usePointsAmount:h,clientId:f?parseInt(f):null,description:p,items:N.map(e=>({productId:parseInt(e.productId),productQuantity:e.quantity,productPrice:e.price,businessId:e.businessId}))})).id,a(o(`Sotuv muvaffaqiyatli yakunlandi!`),`success`),N=[],I=[],F=null,L={cash:0,card:0,click:0,debt:0},document.getElementById(`sale-step-1`)){document.getElementById(`sale-step-1`).style.display=`block`,document.getElementById(`sale-step-2`).style.display=`none`,document.getElementById(`step-1-indicator`).classList.add(`active`),document.getElementById(`step-2-indicator`).classList.remove(`active`);let e=document.getElementById(`sale-cash`),t=document.getElementById(`sale-card`),n=document.getElementById(`sale-click`);e&&(e.value=0),t&&(t.value=0),n&&(n.value=0);let r=document.getElementById(`sale-discount`);r&&(r.value=0);let i=document.getElementById(`sale-client-search`);i&&(i.value=``);let a=document.getElementById(`sale-client-id`);a&&(a.value=``);let o=document.getElementById(`sale-desc`);o&&(o.value=``),z(),B();let s=document.getElementById(`sale-product-search`);s&&(s.value=``,s.focus())}else closeModal();R()}catch(e){a(e.message,`error`)}}async function nt(e){Array.isArray(e)||(e=[e]);try{a(o(`Tafsilotlar yuklanmoqda...`),`info`);let t=d(),n=await Promise.all(e.map(e=>s.get(`/transactions/${e}?businessId=${t}`))),r=(await Promise.all(e.map(e=>s.get(`/transactions/${e}/items?businessId=${t}`)))).filter(e=>e!==null).flat(),i=n.reduce((e,t)=>e+(t.cashbackUsed||0),0),l=n.reduce((e,t)=>e+(t.pointsUsed||0),0),f=n.reduce((e,t)=>e+(t.pointsEarned||0),0),p=n.reduce((e,t)=>e+(t.cashbackEarned||0),0),m=n.reduce((e,t)=>e+(t.discount||0),0),h=r.reduce((e,t)=>e+(t.productPrice||0)*(t.productQuantity||0),0);openModal(`
      <div class="modal-header">
        <h3 style="color: var(--text);">${o(`Sotuv tafsilotlari`)}</h3>
        <span style="opacity:0.6; color: var(--text-muted);">№: ${e.join(`, `)}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="background: var(--accent-gradient) !important; color: white !important; width: 40px; text-align: center;">№</th>
              <th style="text-align: center; color: white !important;">${o(`Mahsulot nomi`)}</th>
              <th style="text-align: center; color: white !important;">${o(`Narxi`)}</th>
              <th style="text-align: center; color: white !important;">${o(`Soni`)}</th>
              <th style="text-align: center; color: white !important;">${o(`Jami`)}</th>
              <th style="background: var(--accent-gradient) !important; text-align: center; color: white !important;">${o(`Amallar`)}</th>
            </tr>
          </thead>
          <tbody>
            ${r.length===0?`<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:r.map((t,n)=>{let r=t.productName||`${o(`Mahsulot`)} #${t.productId}`;return`
                <tr>
                  <td style="color: var(--text);">${n+1}</td>
                  <td style="font-weight:600; color: var(--text);">${u(r)} ${t.productBarcode?`<small style="opacity:0.5">(${t.productBarcode})</small>`:``}</td>
                  <td class="price" style="text-align:right; color: var(--text);">${c(t.productPrice)}</td>
                  <td style="text-align:center; color: var(--text);">${t.productQuantity}</td>
                  <td class="price" style="text-align:right; color: var(--text);"><strong>${c(t.productPrice*t.productQuantity)}</strong></td>
                  <td style="text-align:center;">
                    <div style="display:flex; gap:5px; justify-content:center;">
                      <button class="btn btn-ghost btn-sm" onclick='editTransactionItem(${t.id}, ${JSON.stringify(e)})' title="${o(`Tahrirlash`)}">✏️</button>
                      <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick='deleteTransactionItem(${t.id}, ${JSON.stringify(e)})' title="${o(`O'chirish`)}">🗑️</button>
                    </div>
                  </td>
                </tr>`}).join(``)}
          </tbody>
          ${r.length>0?`
          <tfoot>
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="3" style="text-align:right; font-size: 13px; color: var(--text-muted);">${o(`Mahsulotlar jami`)}:</td>
              <td style="text-align:center; font-size: 13px; color: var(--text-muted);">${r.reduce((e,t)=>e+(t.productQuantity||0),0)}</td>
              <td style="text-align:right; font-size: 13px; color: var(--text);">${c(h)} ${o(`so'm`)}</td>
              <td></td>
            </tr>
            ${m>0?`
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${o(`Chegirma`)}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--danger);">- ${c(m)} ${o(`so'm`)}</td>
              <td></td>
            </tr>`:``}
            ${i>0?`
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${o(`Keshbek ishlatildi`)}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--success);">- ${c(i)} ${o(`so'm`)}</td>
              <td></td>
            </tr>`:``}
            ${l>0?`
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${o(`Ball ishlatildi`)}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--accent);">- ${c(l)} ${o(`so'm`)}</td>
              <td></td>
            </tr>`:``}
            ${p>0?`
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${o(`To'plangan keshbek`)}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--success);">+ ${c(p)}</td>
              <td></td>
            </tr>`:``}
            ${f>0?`
            <tr style="background: rgba(0, 0, 0, 0.02);">
              <td colspan="4" style="text-align:right; font-size: 13px; color: var(--text-muted);">${o(`To'plangan ballar`)}:</td>
              <td style="text-align:right; font-size: 13px; color: var(--accent);">+ ${f}</td>
              <td></td>
            </tr>`:``}
            <tr style="background: rgba(0, 0, 0, 0.05); font-weight: bold;">
              <td colspan="4" style="text-align:right; font-size: 14px; color: var(--text);">${o(`Jami to'lov`)}:</td>
              <td class="price" style="text-align:right; font-size: 15px; color: var(--primary);">${c(h-m-i-l)} ${o(`so'm`)}</td>
              <td></td>
            </tr>
          </tfoot>`:``}
        </table>
      </div>
      <div class="modal-footer" style="justify-content: space-between; gap: 10px; margin-top:20px;">
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost btn-sm" onclick='downloadTransactionPdf(${JSON.stringify(e)})'>📄 PDF</button>
          <button class="btn btn-ghost btn-sm" onclick='downloadTransactionJpg(${JSON.stringify(e)})'>🖼️ JPG</button>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">${o(`Bekor qilish`)}</button>
          <button class="btn btn-primary btn-sm" onclick='sendTransactionToTelegram(${JSON.stringify(e)})'>📤 Telegram</button>
        </div>
      </div>
    `)}catch(e){a(e.message,`error`)}}async function rt(e,t){try{let n=await s.get(`/transactions/items/${e}`);if(!n)return;let r=prompt(o(`Yangi miqdorni kiriting:`),n.productQuantity);if(r===null)return;let i=prompt(o(`Yangi narxni kiriting:`),n.productPrice);if(i===null)return;await s.put(`/transactions/items/${e}`,{productQuantity:parseInt(r),productPrice:parseFloat(i)}),a(o(`Muvaffaqiyatli yangilandi`),`success`),nt(t),R()}catch(e){a(e.message,`error`)}}window.editTransactionItem=rt;async function it(e,t){if(confirm(o(`Ushbu mahsulotni sotuvdan o'chirishni tasdiqlaysizmi?`)))try{await s.delete(`/transactions/items/${e}`),a(o(`Muvaffaqiyatli o'chirildi`),`success`),nt(t),R()}catch(e){a(e.message,`error`)}}window.deleteTransactionItem=it;async function at(t,n=null){Array.isArray(t)||(t=[t]);let{jsPDF:r}=window.jspdf,i=d();try{a(o(`PDF tayyorlanmoqda...`),`info`);let l=await s.get(`/businesses/my`).catch(()=>[]),[u,d]=await Promise.all([Promise.all(t.map(e=>s.get(`/transactions/${e}/items?businessId=${i}`))),Promise.all(l.map(e=>s.get(`/clients?businessId=${e.id}`).catch(()=>[])))]),f=d.flat(),p=u.flat(),m=n||P.find(e=>e.id===t[0]),h=new r,g=`helvetica`;try{let e=await fetch(`/fonts/Roboto-Regular.ttf`);if(e.ok){let t=await e.blob(),n=await new Promise(e=>{let n=new FileReader;n.onloadend=()=>e(n.result.split(`,`)[1]),n.readAsDataURL(t)});h.addFileToVFS(`Roboto-Regular.ttf`,n),h.addFont(`Roboto-Regular.ttf`,`Roboto`,`normal`),h.setFont(`Roboto`),g=`Roboto`}}catch{}h.setFont(g),h.setFontSize(11),h.setTextColor(0,0,0);let _=f&&m.clientId?f.find(e=>e.id===m.clientId):null,v=15;if(_)h.text(`${o(`Mijoz`)}: ${_.fullName}`,15,v),v+=6,h.text(`${o(`Manzil`)}: ${_.address||`-`}`,15,v),v+=6,h.text(`${o(`Telefon`)}: ${_.phone||`-`}`,15,v);else{let e=m.clientName||m.clientNumber||o(`Begona xaridor`);h.text(`${o(`Mijoz`)}: ${e}`,10,v),v+=6,h.text(`${o(`Telefon`)}: ${m.clientNumber||`-`}`,10,v)}let y=p.map((e,t)=>{let n=e.productName||`${o(`Mahsulot`)} #${e.productId}`;return[t+1,n,e.productQuantity,c(e.productPrice),c(e.productPrice*e.productQuantity),e.productBarcode||`-`]}),b=p.reduce((e,t)=>e+(t.productQuantity||0),0),x=p.reduce((e,t)=>e+(t.productPrice||0)*(t.productQuantity||0),0);h.autoTable({startY:35,head:[[`№`,o(`Mahsulot nomi`),o(`Soni`),o(`Narxi`),o(`Jami`),o(`Barcode`)]],body:y,foot:[[``,o(`Jami`)+`:`,b,``,c(x),``]],theme:`grid`,headStyles:{fillColor:[230,230,230],textColor:0,fontStyle:`normal`,font:g,halign:`center`},footStyles:{fillColor:[240,240,240],textColor:[239,68,68],fontStyle:`bold`,font:g,halign:`center`},styles:{fontSize:10,textColor:0,font:g,halign:`center`},columnStyles:{0:{cellWidth:10,halign:`center`},2:{cellWidth:20,halign:`center`},3:{cellWidth:30,halign:`right`},4:{cellWidth:35,halign:`right`},5:{cellWidth:30,halign:`right`}}});let S=h.lastAutoTable.finalY+15;return h.setFontSize(11),h.setTextColor(0,0,0),h.text(`${o(`Naqd`)}: ${c(m.cash)}`,15,S),S+=5,h.text(`${o(`Karta`)}: ${c(m.card)}`,15,S),S+=5,h.text(`${o(`Click`)}: ${c(m.click||0)}`,15,S),S+=5,h.text(`${o(`Qarz`)}: ${c(m.debt)}`,15,S),h.setFontSize(8),h.setTextColor(180,180,180),h.text(`${e(m.createdAt)} ${o(`da generatsiya qilindi`)} [IDs: ${t.join(`,`)}]`,10,285),h.text(`${o(`Sotuv tafsilotlari`)} №: ${t.join(`, `)}`,105,10,{align:`center`}),h.save(`${o(`Sotuv_`)}${t.join(`_`)}.pdf`),a(o(`PDF yuklab olindi`)),h.output(`blob`)}catch(e){console.error(e),a(o(`PDF yarata olmadim: `)+e.message,`error`)}}async function ot(e){Array.isArray(e)||(e=[e]);let t=e[0];try{let e=document.querySelector(`.modal`);if(!e)return;let n=e.querySelector(`.modal-footer`);n&&(n.style.display=`none`);let r=await html2canvas(e,{backgroundColor:getComputedStyle(document.documentElement).getPropertyValue(`--bg-secondary`),scale:2});n&&(n.style.display=`flex`);let i=document.createElement(`a`);return i.download=`Sotuv_${t}.jpg`,i.href=r.toDataURL(`image/jpeg`,.9),i.click(),a(o(`Rasm yuklab olindi`)),new Promise(e=>r.toBlob(e,`image/jpeg`,.9))}catch(e){a(o(`Rasm yarata olmadim: `)+e.message,`error`)}}async function st(e){Array.isArray(e)||(e=[e]);try{a(o(`Telegramga yuborilmoqda...`),`info`);let t=await at(e);if(!t)throw Error(`Could not generate receipt files`);let n=new FormData;t&&n.append(`pdf`,t,`Receipt_${e[0]}.pdf`),await s.post(`/transactions/${e[0]}/send-telegram`,n,{headers:{"Content-Type":`multipart/form-data`}}),a(o(`Telegramga yuborildi!`))}catch(e){a(e.message,`error`)}}function ct(e){if(!e)return;let t=M.find(t=>t.barcode===e);t?Ye(t.id):a(o(`Mahsulot topilmadi`),`warning`)}window.addToSaleBatch=$e,window.renderSavedBatches=et,window.finalizeSale=tt,window.renderTransactions=R,window.renderTransactionsTable=We,window.filterTransactions=Ge,window.openSaleModal=qe,window.addSaleProductByBarcode=ct,window.searchSaleProduct=Je,window.addSaleProductById=Ye,window.renderSaleItems=z,window.removeSaleItem=Xe,window.onSaleQtyChange=Ze,window.onSalePriceChange=Qe,window.updateSaleTotal=B,window.updateSalePayment=V,window.viewTransactionItems=nt,window.downloadTransactionPdf=at,window.downloadTransactionJpg=ot,window.sendTransactionToTelegram=st,window.deleteTransaction=Ke,window.transactionPage=transactionPage,window.allTransactionsList=P,window.currentTransactions=He,window.saleProducts=M,window.saleItems=N,window.onSaleClientChange=function(e){let t=d(),n=document.getElementById(`bonus-section`),r=document.getElementById(`bonus-cards-container`),i=document.getElementById(`sale-cashback-used`),a=document.getElementById(`sale-points-used`);if(i.value=0,a.value=0,n&&(n.style.display=`none`),r&&(r.innerHTML=``),!e){V();return}let l=Ue.find(t=>t.id==e);if(!l)return;n&&(n.style.display=`block`);let u=l.cashbackBalance||0,f=document.createElement(`div`);f.className=`bonus-card`,f.style=`background:var(--bg-glass); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;`,f.innerHTML=`
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:11px; opacity:0.7;">💰 ${o(`Keshbek`)}</span>
      <span style="font-size:12px; font-weight:800; color:var(--success);">${c(u)} ${o(`so'm`)}</span>
    </div>
    <div style="position:relative;">
      <input type="number" id="cb-manual-input" class="form-control" style="width:100%; height:36px; font-size:13px; font-weight:700; padding-right:85px; color:var(--success) !important; background:var(--bg-input) !important;" value="0" step="0.01">
      <button type="button" id="btn-cb-all" class="btn btn-primary" style="position:absolute; right:4px; top:4px; height:28px; font-size:10px; padding:0 10px;">${o(`Hammasi`)}</button>
    </div>
  `,r&&r.appendChild(f);let p=f.querySelector(`#cb-manual-input`),m=f.querySelector(`#btn-cb-all`);p.oninput=e=>{i.value=Math.min(parseFloat(e.target.value)||0,u),V()},m.onclick=()=>{p.value=u,i.value=u,V()};let h=document.createElement(`div`);h.className=`bonus-card`,h.style=`background:var(--bg-glass); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:10px;`;let g=l.pointsBalance||0,_=100,v=1e4;h.innerHTML=`
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
      <span style="font-size:11px; font-weight:700; color:var(--accent);">⭐ ${o(`Ballar`)}</span>
      <span style="font-size:12px; font-weight:800;">${g}</span>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:8px;">
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px;">
        <input type="checkbox" id="pt-use-check" style="width:16px; height:16px;">
        <span>${o(`Ballarni ishlatish`)}</span>
      </label>
      <div id="pt-spend-area" style="display:none; position:relative; margin-left:24px;">
        <input type="number" id="pt-spend-input" class="form-control" style="width:100%; height:32px; font-size:12px; padding-right:70px; color:var(--accent) !important;" value="0">
        <button type="button" id="btn-pt-spend-all" class="btn btn-primary" style="position:absolute; right:3px; top:3px; height:26px; font-size:9px; padding:0 8px; background:var(--accent); border:none;">${o(`Hammasi`)}</button>
      </div>

      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px;">
        <input type="checkbox" id="pt-earn-check" checked style="width:16px; height:16px;">
        <span>${o(`Ballar to'plash`)}</span>
      </label>
      <div id="pt-earn-area" style="margin-left:24px; font-size:11px; color:var(--success);">
        ${o(`To'planadigan ballar`)}: <strong id="pt-earn-preview">0</strong>
      </div>
    </div>
  `,r&&r.appendChild(h);let y=h.querySelector(`#pt-use-check`),b=h.querySelector(`#pt-spend-area`),x=h.querySelector(`#pt-spend-input`),S=h.querySelector(`#btn-pt-spend-all`),C=h.querySelector(`#pt-earn-check`),w=h.querySelector(`#pt-earn-preview`);y.onchange=()=>{b.style.display=y.checked?`block`:`none`,y.checked||(x.value=0,a.value=0,V())},x.oninput=e=>{a.value=Math.min(parseFloat(e.target.value)||0,g*_),V()},S.onclick=()=>{x.value=g*_,a.value=g*_,V()},window.updatePointsEarnedPreview=()=>{if(!C.checked){w.textContent=`0`;return}let e=parseFloat(document.getElementById(`sale-cash`).value)||0,t=parseFloat(document.getElementById(`sale-card`).value)||0,n=parseFloat(document.getElementById(`sale-click`).value)||0;w.textContent=Math.floor((e+t+n)/v)},C.onchange=window.updatePointsEarnedPreview;let T=t;!T&&N.length>0&&(T=N[0].businessId),T&&s.get(`/businesses/${T}`).then(e=>{e&&(_=e.pointValue||100,v=e.pointsRate||1e4,window.updatePointsEarnedPreview&&window.updatePointsEarnedPreview())}),V()},window.refundPage=1;var lt=[],ut=[];async function dt(){let e=document.getElementById(`page-content`),t=d();if(!t){e.innerHTML=`<div class="empty-state"><div class="icon">🔄</div><h4>${o(`Avval biznes tanlang`)}</h4></div>`;return}try{ut=await s.get(`/refunds?businessId=${t}${getDateQuery()}`)||[],ft(ut)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function ft(t,n=!1){typeof t==`boolean`&&(n=t,t=null),t&&(n||(window.refundPage=1),lt=t);let r=Math.ceil(lt.length/15),i=window.refundPage*15,a=lt.slice(i-15,i),s=document.getElementById(`page-content`),l=a.length===0&&!n?`<div class="empty-state"><div class="icon">🔄</div><h4>${o(`Qaytarishlar yo'q`)}</h4></div>`:a.map((t,n)=>`
        <div class="acc-item" id="refund-acc-${t.id}">
          <div class="acc-header" onclick="toggleAcc('refund-acc-${t.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar acc-avatar-orange">🔄</div>
              <div>
                <div class="acc-title">${e(t.createdAt)}</div>
                <div class="acc-subtitle">#${t.id} — ${t.clientName?u(t.clientName):o(`Begona xaridor`)}</div>
              </div>
            </div>
            <div class="acc-header-right">
              <span class="acc-price" style="color:var(--danger);">${c(t.total)} ${o(`so'm`)}</span>
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
               <div class="acc-detail-item">
                <span class="acc-detail-icon">📄</span>
                <div><div class="acc-detail-label">${o(`Izoh`)}</div><div class="acc-detail-value">${t.description||o(`Tavsif yo'q`)}</div></div>
              </div>
               <div class="acc-detail-item">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label">${o(`Jami summa`)}</div><div class="acc-detail-value">${c(t.total)} ${o(`so'm`)}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">🏢</span>
                <div><div class="acc-detail-label">${o(`Mas'ul`)}</div><div class="acc-detail-value">${u(t.createdByName||o(`Tizim`))}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              <button class="btn btn-ghost btn-sm" onclick="viewRefundItems(${t.id})">👁️ ${o(`Tafsilotlar`)}</button>
              <button class="btn btn-primary btn-sm" onclick="downloadRefundPdf(${t.id})">📄 ${o(`PDF`)}</button>
            </div>
          </div>
        </div>`).join(``);if(!n)s.innerHTML=`
      <div class="acc-list" id="refund-acc-list">${l}</div>
      <div id="refund-pagination-area">
        ${renderPageControls(`refundPage`,r,`renderRefundsTable`)}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="${o(`Qidirish...`)}" id="refund-search"
            value="${u(document.getElementById(`refund-search`)?.value||``)}"
            oninput="filterRefunds(this.value)"
            style="color: var(--text-primary) !important; background: var(--bg-secondary) !important;" class="form-control">
        </div>
        <button class="btn btn-ghost" onclick="openDateFilterModal()" style="padding: 10px 15px;" title="${o(`Sana bo'yicha filter`)}">📅</button>
        ${window.hasPermission(`add`)?`<button class="btn btn-primary" onclick="openRefundModal()">${o(`Qo'shish`)}</button>`:``}
      </div>
    `,attachInfiniteScroll(`refundPage`,r,`renderRefundsTable`);else{let e=document.getElementById(`refund-acc-list`);e&&e.insertAdjacentHTML(`beforeend`,l);let t=document.getElementById(`refund-pagination-area`);t&&(t.innerHTML=renderPageControls(`refundPage`,r,`renderRefundsTable`)),attachInfiniteScroll(`refundPage`,r,`renderRefundsTable`)}}async function pt(e){try{a(o(`Tafsilotlar yuklanmoqda...`),`info`);let t=d(),n=await s.get(`/refunds/${e}/items?businessId=${t}`)||[];openModal(`
      <div class="modal-header">
        <h3>${o(`Qaytarish tafsilotlari`)} #${e}</h3>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th style="text-align:center">${o(`Mahsulot nomi`)}</th>
              <th style="text-align:center">${o(`Narxi`)}</th>
              <th style="text-align:center">${o(`Soni`)}</th>
              <th style="text-align:center">${o(`Jami`)}</th>
            </tr>
          </thead>
          <tbody>
            ${n.length===0?`<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:n.map((e,t)=>{let n=e.productName||`${o(`Mahsulot`)} #${e.productId}`;return`
                <tr>
                  <td>${t+1}</td>
                  <td style="font-weight:600;">${u(n)}</td>
                  <td class="price" style="text-align:right">${c(e.productPrice)}</td>
                  <td style="text-align:center">${e.productQuantity}</td>
                  <td class="price" style="text-align:right"><strong>${c(e.productPrice*e.productQuantity)}</strong></td>
                </tr>`}).join(``)}
          </tbody>
          ${n.length>0?`
          <tfoot>
            <tr style="background: rgba(255, 255, 255, 0.05); font-weight: bold;">
              <td colspan="3" style="text-align:right; font-size: 14px;">${o(`Jami`)}:</td>
              <td style="text-align:center; font-size: 14px;">${n.reduce((e,t)=>e+(t.productQuantity||0),0)}</td>
              <td class="price" style="text-align:right; font-size: 14px; color: var(--success);">${c(n.reduce((e,t)=>e+(t.productPrice||0)*(t.productQuantity||0),0))}</td>
            </tr>
          </tfoot>`:``}
        </table>
      </div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
      </div>
    `)}catch(e){a(e.message,`error`)}}async function mt(t){let{jsPDF:n}=window.jspdf,r=d();try{a(o(`PDF tayyorlanmoqda...`),`info`);let i=await s.get(`/businesses/my`).catch(()=>[]),[l,u,d]=await Promise.all([s.get(`/refunds/${t}/items?businessId=${r}`),Promise.all(i.map(e=>s.get(`/clients?businessId=${e.id}`).catch(()=>[]))),Promise.resolve(ut.find(e=>e.id===t))]);u.flat();let f=new n,p=`helvetica`;try{let e=await fetch(`/fonts/Roboto-Regular.ttf`);if(e.ok){let t=await e.blob(),n=await new Promise(e=>{let n=new FileReader;n.onloadend=()=>e(n.result.split(`,`)[1]),n.readAsDataURL(t)});f.addFileToVFS(`Roboto-Regular.ttf`,n),f.addFont(`Roboto-Regular.ttf`,`Roboto`,`normal`),f.setFont(`Roboto`),p=`Roboto`}}catch(e){console.warn(`Could not load Roboto font`,e)}f.setFont(p),f.setFontSize(14),f.text(`${o(`Qaytarish`)}: #${t}`,15,15),f.setFontSize(10),f.text(`${o(`Sana`)}: ${e(d.createdAt)}`,15,22),d.clientName&&f.text(`${o(`Mijoz`)}: ${d.clientName}`,15,29);let m=l.map((e,t)=>[t+1,e.productName||`${o(`Mahsulot`)} #${e.productId}`,e.productQuantity,c(e.productPrice),c(e.productPrice*e.productQuantity)]),h=l.reduce((e,t)=>e+(t.productQuantity||0),0);f.autoTable({startY:40,head:[[`№`,o(`Mahsulot nomi`),o(`Soni`),o(`Narxi`),o(`Jami`)]],body:m,foot:[[``,o(`Jami`)+`:`,h,``,c(d.total)]],theme:`grid`,styles:{font:p,fontSize:10,halign:`center`},headStyles:{fillColor:[230,230,230],textColor:0,font:p,halign:`center`},footStyles:{fillColor:[240,240,240],textColor:[239,68,68],fontStyle:`bold`,font:p,halign:`center`},columnStyles:{0:{cellWidth:10,halign:`center`},2:{cellWidth:20,halign:`center`},3:{cellWidth:35,halign:`right`},4:{cellWidth:40,halign:`right`}}});let g=f.lastAutoTable.finalY+15;d.description&&(f.setFontSize(10),f.setTextColor(0,0,0),f.text(`${o(`Izoh`)}: ${d.description}`,15,g)),f.save(`${o(`Qaytarish_`)}${t}.pdf`),a(o(`PDF yuklab olindi`))}catch(e){console.error(e),a(o(`PDF yarata olmadim: `)+e.message,`error`)}}function ht(e){let t=(e||``).toLowerCase();ft(ut.filter(e=>e.clientName&&String(e.clientName).toLowerCase().includes(t)||e.id.toString().includes(t)))}var H=[];async function gt(){openModal(`
    <div class="modal-header">
      <h3>${o(`Qaytarish qo'shish`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" style="padding: 20px;">
      <div class="form-group">
        <label>${o(`Sotuv ID raqami`)}</label>
        <div style="display:flex; gap:10px;">
          <input type="number" class="form-control" id="refund-trans-id" placeholder="${o(`Masalan: 3468`)}">
          <button type="button" class="btn btn-primary" onclick="checkTransactionForRefund()">${o(`Tekshirish`)}</button>
        </div>
      </div>
      <div id="refund-items-area" style="margin-top:20px;"></div>
      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
      </div>
    </div>
  `)}async function _t(){let e=document.getElementById(`refund-trans-id`).value;if(e)try{a(o(`Tafsilotlar yuklanmoqda...`),`info`);let t=d();if(H=await s.get(`/transactions/${e}/items?businessId=${t}`)||[],H.length===0){document.getElementById(`refund-items-area`).innerHTML=`<p style="color:var(--danger); text-align:center; padding:20px;">${o(`Sotuv topilmadi yoki unda mahsulotlar yo'q`)}</p>`;return}vt()}catch(e){a(e.message,`error`)}}function vt(){let e=document.getElementById(`refund-items-area`);e.innerHTML=`
    <div class="table-container" style="max-height: 380px; overflow-y: auto; margin-bottom: 20px; border: 1px solid var(--border); border-radius: var(--radius-md);">
      <table style="font-size: 12px; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--bg-glass); border-bottom: 1px solid var(--border);">
            <th rowspan="2" style="padding: 10px; text-align: left; vertical-align: middle;">${o(`Mahsulot`)}</th>
            <th rowspan="2" style="padding: 10px; text-align:center; vertical-align: middle;">${o(`Sotilgan`)}</th>
            <th rowspan="2" style="padding: 10px; text-align:center; vertical-align: middle;">${o(`Narxi`)}</th>
            <th colspan="2" style="padding: 5px; text-align:center; border-left: 1px solid var(--border);">${o(`Qaytarilgan`)}</th>
            <th colspan="2" style="padding: 5px; text-align:center; border-left: 1px solid var(--border);">${o(`Qaytarish`)}</th>
          </tr>
          <tr style="background: var(--bg-glass); border-bottom: 2px solid var(--border);">
            <th style="padding: 5px; text-align:center; border-left: 1px solid var(--border); font-size: 10px;">${o(`Miqdori`)}</th>
            <th style="padding: 5px; text-align:center; font-size: 10px;">${o(`Summa`)}</th>
            <th style="padding: 5px; text-align:center; border-left: 1px solid var(--border); font-size: 10px;">${o(`Miqdori`)}</th>
            <th style="padding: 5px; text-align:center; font-size: 10px;">${o(`Summa`)}</th>
          </tr>
        </thead>
        <tbody>
          ${H.map((e,t)=>{let n=e.productQuantity-(e.refundedQuantity||0),r=n<=0;return`
            <tr style="border-bottom: 1px solid var(--border); ${r?`display:none;`:``}" class="${r?`fully-refunded-row`:``}">
              <td style="padding: 8px 10px;">
                <div style="font-weight:600;">${u(e.productName)}</div>
                <small style="opacity:0.6;">${e.productBarcode||``}</small>
              </td>
              <td style="padding: 8px; text-align:center;">${e.productQuantity}</td>
              <td style="padding: 8px; text-align:center;">${c(e.productPrice)}</td>
              <td style="padding: 8px; text-align:center; background: rgba(var(--danger-rgb), 0.02); border-left: 1px solid var(--border);">${e.refundedQuantity||0}</td>
              <td style="padding: 8px; text-align:right; background: rgba(var(--danger-rgb), 0.02);">${c(e.refundedSum||0)}</td>
              <td style="padding: 8px; width: 80px; border-left: 1px solid var(--border);">
                <input type="number" class="form-control" style="padding:4px; text-align:center; font-weight: 600;" 
                  id="refund-qty-${t}" value="0" min="0" max="${n}" 
                  oninput="onRefundQtyChange(${t}, this.value)">
              </td>
              <td style="padding: 8px; width: 120px;">
                <input type="number" step="0.01" class="form-control" style="padding:4px; text-align:right; color: var(--danger); font-weight: 700;" 
                  id="refund-amount-${t}" value="0" min="0"
                  oninput="validateRefundAmount(${t}, this.value)">
              </td>
            </tr>
          `}).join(``)}
        </tbody>
      </table>
    </div>
    <div class="form-group">
      <label>${o(`Izoh`)}</label>
      <input type="text" class="form-control" id="refund-desc" placeholder="${o(`Izoh`)}">
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; background:var(--bg-glass); padding:15px; border-radius:var(--radius-md); border: 1px solid var(--border);">
      <div style="font-size:18px; font-weight:700;">${o(`Jami`)}: <span id="refund-total-amount">0</span> ${o(`so'm`)}</div>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="button" class="btn btn-primary" style="padding: 10px 40px;" onclick="submitRefund()">${o(`Qaytarish`)}</button>
      </div>
    </div>
  `}function yt(e,t){let n=parseInt(t)||0,r=H[e],i=r.productQuantity-(r.refundedQuantity||0);n>i&&(a(`${o(`Maksimal qaytarish miqdori`)}: ${i}`,`warning`),n=i,document.getElementById(`refund-qty-${e}`).value=n);let s=document.getElementById(`refund-amount-${e}`);s.value=n*r.productPrice,xt()}function bt(e,t){let n=parseFloat(t)||0;parseInt(document.getElementById(`refund-qty(${e})`)?document.getElementById(`refund-qty(${e})`).value:0);let r=document.getElementById(`refund-qty-${e}`),i=(r&&parseInt(r.value)||0)*H[e].productPrice;n>i&&(document.getElementById(`refund-amount-${e}`).value=i,a(o(`Qaytarish summasi sotuv narxidan oshib keta olmaydi`),`warning`)),xt()}function xt(){let e=0;H.forEach((t,n)=>{let r=document.getElementById(`refund-amount-${n}`);r&&(e+=parseFloat(r.value)||0)});let t=document.getElementById(`refund-total-amount`);t&&(t.textContent=c(e))}async function St(){let e=d();document.getElementById(`refund-trans-id`).value;let t=document.getElementById(`refund-desc`).value,n=[],r=0;if(H.forEach((e,i)=>{let a=document.getElementById(`refund-qty-${i}`),o=document.getElementById(`refund-amount-${i}`);if(a&&o){let i=parseInt(a.value)||0,s=parseFloat(o.value)||0;i>0&&(n.push({productId:e.productId,productQuantity:i,productPrice:e.productPrice,transactionId:e.id,description:t}),r+=s)}}),n.length===0||r<=0){openModal(`
      <div class="modal-header">
        <h3 style="color:var(--danger);">${o(`Xatolik`)}</h3>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div style="padding:20px; text-align:center;">
        <div style="font-size:40px; margin-bottom:10px;">⚠️</div>
        <p>${o(`Qaytarish uchun kamida bitta mahsulot miqdorini kiriting`)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal()">${o(`Tushunarli`)}</button>
      </div>
    `);return}try{await s.post(`/refunds`,{businessId:e,total:r,description:t,cash:r,items:n}),a(o(`Qaytarish muvaffaqiyatli amalga oshirildi!`));let i=document.getElementById(`refund-trans-id`);i?(i.value=``,document.getElementById(`refund-items-area`).innerHTML=``,i.focus()):closeModal(),dt()}catch(e){a(e.message,`error`)}}window.renderRefunds=dt,window.renderRefundsTable=ft,window.filterRefunds=ht,window.openRefundModal=gt,window.checkTransactionForRefund=_t,window.onRefundQtyChange=yt,window.validateRefundAmount=bt,window.updateRefundTotal=xt,window.submitRefund=St,window.viewRefundItems=pt,window.downloadRefundPdf=mt,window.refundPage=refundPage,window.activeDebtPage=1,window.paidDebtPage=1;var Ct=[],wt=[],Tt=[];async function Et(){let e=document.getElementById(`page-content`),t=d();if(!t){e.innerHTML=`<div class="empty-state"><div class="icon">⚠️</div><h4>${o(`Avval biznes tanlang`)}</h4></div>`;return}try{Tt=await s.get(`/transactions?businessId=${t}`)||[],Ct=[],wt=[],Tt.forEach(e=>{e.debt>0?Ct.push(e):(e.debtLimitDate||e.clientId&&new Date(e.updatedAt)>new Date(new Date(e.createdAt).getTime()+1e3))&&wt.push(e)}),Dt()}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function Dt(){let e=document.getElementById(`page-content`),t=window.currentDebtTab||`active`;e.innerHTML=`
    <div style="margin-bottom: 24px; display: flex; justify-content: flex-start;">
      <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 12px; display: inline-flex; border: 1px solid var(--border);">
        <button onclick="switchDebtTab('active')" style="
          border: none; background: ${t===`active`?`var(--accent-glow)`:`transparent`};
          color: ${t===`active`?`var(--accent)`:`var(--text-secondary)`};
          padding: 10px 24px; border-radius: 8px; font-weight: 600; font-family: 'Outfit'; cursor: pointer;
          transition: all 0.3s;
        ">⚠️ ${o(`Qarzdorlar`)}</button>
        <button onclick="switchDebtTab('paid')" style="
          border: none; background: ${t===`paid`?`rgba(16, 185, 129, 0.1)`:`transparent`};
          color: ${t===`paid`?`var(--success)`:`var(--text-secondary)`};
          padding: 10px 24px; border-radius: 8px; font-weight: 600; font-family: 'Outfit'; cursor: pointer;
          transition: all 0.3s;
        ">✅ ${o(`To'langan qarzlar`)}</button>
      </div>
    </div>
    <div id="debts-table-container"></div>
    <div class="page-bottom-bar">
      <div class="search-box" style="flex:1; max-width:none;">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="${o(`Mijoz bo'yicha qidirish...`)}" id="debt-search"
          oninput="filterDebts(this.value)"
          style="color: var(--text-primary) !important; background: var(--bg-secondary) !important;" class="form-control">
      </div>
      <button class="btn btn-ghost" onclick="openDateFilterModal()" style="padding: 10px 15px;" title="${o(`Sana bo'yicha filter`)}">📅</button>
      <div style="width: 100px;"></div> <!-- Spacer because there is no 'Add' debt button directly -->
    </div>
  `,Ot(t)}window.filterDebts=function(e){let t=e.toLowerCase();Ot(window.currentDebtTab||`active`,t)},window.switchDebtTab=function(e){window.currentDebtTab=e,Dt()};function Ot(t,n=``,r=!1){typeof n==`boolean`&&(r=n,n=``);let i=document.getElementById(`debts-table-container`);if(!i)return;let a=t===`active`?`activeDebtPage`:`paidDebtPage`;r||(window[a]=1);let s=getDatePeriod(),l=(t===`active`?Ct:wt).filter(e=>{let t=e.createdAt.substring(0,10);if(!(t>=s.start&&t<=s.end))return!1;let r=(e.clientName||e.clientNumber||o(`Begona xaridor`)).toLowerCase();return!n||r.includes(n)||e.id.toString().includes(n)}),d=Math.ceil(l.length/15),f=window[a]*15,p=l.slice(f-15,f),m=p.length===0&&!r?`<div class="empty-state"><div class="icon">✅</div><h4>${o(t===`active`?`Qarzdorlar topilmadi`:`Hech qanday to'langan qarz yo'q`)}</h4></div>`:p.map((n,r)=>{let i=n.clientName?u(n.clientName):n.clientNumber?u(n.clientNumber):o(`Begona xaridor`);return`
        <div class="acc-item" id="debt-acc-${n.id}">
          <div class="acc-header" onclick="toggleAcc('debt-acc-${n.id}')">
            <div class="acc-header-left">
              <div class="acc-avatar" style="${t===`active`?`background:linear-gradient(135deg,#EF4444,#DC2626)`:`background:linear-gradient(135deg,#10B981,#059669)`}">$</div>
              <div>
                <div class="acc-title">${i}</div>
                <div class="acc-subtitle">
                  ${o(`Sotuv`)} № ${n.id} — ${e(n.createdAt)}
                  ${t===`active`&&n.debtLimitDate?`<span class="badge badge-warning" style="margin-left:6px;">${o(`Muddat`)}: ${u(n.debtLimitDate.substring(0,10))}</span>`:``}
                </div>
              </div>
            </div>
            <div class="acc-header-right">
              ${t===`active`?`<span class="acc-price" style="color:var(--danger);">${c(n.debt)} ${o(`so'm`)}</span>`:`<span class="acc-price" style="color:var(--success);"><del style="opacity:0.5">${c(n.total)}</del> ${c(0)} ${o(`so'm`)}</span>`}
              <span class="acc-chevron">▼</span>
            </div>
          </div>
          <div class="acc-body">
            <div class="acc-detail-grid">
              <div class="acc-detail-item">
                <span class="acc-detail-icon">💰</span>
                <div><div class="acc-detail-label">${o(`Jami summa`)}</div><div class="acc-detail-value">${c(n.total)} ${o(`so'm`)}</div></div>
              </div>
              <div class="acc-detail-item">
                <span class="acc-detail-icon">💵</span>
                <div><div class="acc-detail-label">${o(`To'langan summasi`)}</div><div class="acc-detail-value">${c(n.cash+n.card+n.click)} ${o(`so'm`)}</div></div>
              </div>
              ${t===`active`?`
              <div class="acc-detail-item" style="border-color:#FCA5A5;">
                <span class="acc-detail-icon">⚠️</span>
                <div><div class="acc-detail-label" style="color:#EF4444;">${o(`Qolgan qarz`)}</div><div class="acc-detail-value" style="color:#EF4444;">${c(n.debt)} ${o(`so'm`)}</div></div>
              </div>`:``}
              <div class="acc-detail-item">
                <span class="acc-detail-icon">🏢</span>
                <div><div class="acc-detail-label">${o(`Mas'ul`)}</div><div class="acc-detail-value">${u(n.createdByName||o(`Tizim`))}</div></div>
              </div>
            </div>
            <div class="acc-actions">
              ${t===`active`&&window.hasPermission(`edit`)?`<button class="btn btn-success btn-sm" onclick='openDebtPayModal(${JSON.stringify(n)})'>💵 ${o(`To'lash`)}</button>`:``}
            </div>
          </div>
        </div>`}).join(``);if(!r)i.innerHTML=`
      <div class="acc-list" id="debts-acc-list">${m}</div>
      <div id="debts-pagination-area">
        ${renderPageControls(a,d,`renderDebtsTable`)}
      </div>
    `,attachInfiniteScroll(a,d,`renderDebtsTable`,t);else{let e=document.getElementById(`debts-acc-list`);e&&e.insertAdjacentHTML(`beforeend`,m);let n=document.getElementById(`debts-pagination-area`);n&&(n.innerHTML=renderPageControls(a,d,`renderDebtsTable`)),attachInfiniteScroll(a,d,`renderDebtsTable`,t)}}window.openDebtPayModal=function(e){openModal(`
    <div class="modal-header">
      <h3>${o(`Qarzni to'lash`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="payDebt(event, ${e.id}, ${e.total}, ${e.cash}, ${e.card}, ${e.click}, ${e.debt}, ${e.clientId?e.clientId:`null`})" class="modal-wide" style="min-width: 400px;">
      <div style="background: var(--bg-glass); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
         <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="opacity:0.7;">${o(`Mijoz`)}:</span>
            <strong>${u(e.clientName||e.clientNumber||o(`Begona`))}</strong>
         </div>
         <div style="display:flex; justify-content:space-between;">
            <span style="opacity:0.7;">${o(`Jami qarz`)}:</span>
            <strong style="color:var(--danger); font-size:18px;">${c(e.debt)} ${o(`so'm`)}</strong>
         </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>${o(`Naqd`)}</label>
          <input type="number" step="0.01" class="form-control" id="pay-cash" value="${e.debt}" oninput="calcRemainingDebt(${e.debt})">
        </div>
        <div class="form-group">
          <label>${o(`Karta`)}</label>
          <input type="number" step="0.01" class="form-control" id="pay-card" value="0" oninput="calcRemainingDebt(${e.debt})">
        </div>
        <div class="form-group">
          <label>${o(`Click`)}</label>
          <input type="number" step="0.01" class="form-control" id="pay-click" value="0" oninput="calcRemainingDebt(${e.debt})">
        </div>
      </div>
      
      <div style="display:flex; justify-content:space-between; margin-top:10px; padding: 10px; background:rgba(0,0,0,0.1); border-radius:6px;">
        <span style="font-weight:600;">${o(`Qoldiq qarz`)}:</span>
        <strong id="remaining-debt-label" style="color:var(--warning);">${c(0)} ${o(`so'm`)}</strong>
      </div>
      
      <div id="pay-error" style="color:red; text-align:center; margin-top:10px; display:none;">
        ${o(`To'lov summasi qarzdan ko'p bo'lishi mumkin emas!`)}
      </div>

      <div class="modal-footer" style="margin-top:20px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="submit" class="btn btn-primary">${o(`To'lash`)}</button>
      </div>
    </form>
  `)},window.calcRemainingDebt=function(e){let t=parseFloat(document.getElementById(`pay-cash`).value)||0,n=parseFloat(document.getElementById(`pay-card`).value)||0,r=parseFloat(document.getElementById(`pay-click`).value)||0,i=e-(t+n+r),a=document.getElementById(`pay-error`),s=document.getElementById(`remaining-debt-label`);i<0?(a.style.display=`block`,s.style.color=`var(--danger)`,s.textContent=c(0)+` `+o(`so'm`)):(a.style.display=`none`,s.style.color=`var(--warning)`,s.textContent=c(i)+` `+o(`so'm`))},window.payDebt=async function(e,t,n,r,i,c,l,u){e.preventDefault();let d=parseFloat(document.getElementById(`pay-cash`).value)||0,f=parseFloat(document.getElementById(`pay-card`).value)||0,p=parseFloat(document.getElementById(`pay-click`).value)||0,m=d+f+p;if(m>l){a(o(`To'lov summasi qarzdan ko'p bo'lishi mumkin emas!`),`error`);return}if(m<=0){a(o(`To'lov summasini kiriting`),`warning`);return}let h=r+d,g=i+f,_=c+p,v=l-m;try{a(o(`Saqlanmoqda...`),`info`),await s.put(`/transactions/${t}`,{total:n,cash:h,card:g,click:_,debt:v,clientId:u}),a(o(`Qarz muvaffaqiyatli to'landi!`),`success`),closeModal(),Et()}catch(e){a(e.message,`error`)}},window.renderDebts=Et,window.renderDebtsTabs=Dt,window.renderDebtsTable=Ot,window.expensePage=1,window.expensePeriod=`daily`;var U=[],kt=[];window.fixedPage=1;var At=[],jt=[];async function Mt(){let e=document.getElementById(`page-content`),t=d();if(!t){e.innerHTML=`<div class="empty-state"><div class="icon">💸</div><h4>${o(`Avval biznes tanlang`)}</h4></div>`;return}try{let[n,r]=await Promise.all([s.get(`/expenses?businessId=${t}${getDateQuery()}`),s.get(`/fixed-costs?businessId=${t}`)]);kt=n||[],jt=(r||[]).filter(e=>!e.isDeleted);let i=Pt(kt,window.expensePeriod).reduce((e,t)=>e+(t.total||0),0),a=window.expensePeriod===`daily`?o(`Jami xarajatlar`):window.expensePeriod===`monthly`?o(`Shu oydagi xarajatlar`):o(`Shu yildagi xarajatlar`);e.innerHTML=`
      <div class="stats-grid">
        <div class="stat-card" style="background: linear-gradient(135deg, #ff4d4d1a 0%, #ff4d4d05 100%); border-left: 4px solid #ff4d4d;">
          <div class="stat-icon" style="background:#ff4d4d20; color:#ff4d4d;">💸</div>
          <div class="stat-value" style="color:#ff4d4d;">${c(i)}</div>
          <div class="stat-label">${a}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, var(--accent)1a 0%, var(--accent)05 100%); border-left: 4px solid var(--accent);">
          <div class="stat-icon" style="background:var(--accent-glow); color:var(--accent);">📌</div>
          <div class="stat-value" style="color:var(--accent);">${jt.length}</div>
          <div class="stat-label">${o(`Doimiy xarajatlar soni`)}</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px; padding:10px;">
        <div class="segmented-control">
          <button class="segmented-item ${window.expensePeriod===`daily`?`active`:``}" onclick="setExpensePeriod('daily')">${o(`Kundalik`)}</button>
          <button class="segmented-item ${window.expensePeriod===`monthly`?`active`:``}" onclick="setExpensePeriod('monthly')">${o(`Oylik`)}</button>
          <button class="segmented-item ${window.expensePeriod===`yearly`?`active`:``}" onclick="setExpensePeriod('yearly')">${o(`Yillik`)}</button>
        </div>
      </div>

      <div id="expense-section" style="margin-bottom:30px"></div>
      <div id="fixed-section"></div>
        `,Ft(),It(jt)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function Nt(e){window.expensePeriod=e,Mt()}function Pt(e,t){return e}function Ft(t,n=!1){typeof t==`boolean`&&(n=t,t=null),t&&(n||(window.expensePage=1));let r=(document.getElementById(`expense-search`)?.value||``).toLowerCase(),i=kt.filter(e=>!r||e.description&&String(e.description).toLowerCase().includes(r)||e.createdAt&&String(e.createdAt).toLowerCase().includes(r));if(window.expensePeriod===`monthly`){let e={};i.forEach(t=>{let n=new Date(t.createdAt);if(isNaN(n.getTime()))return;let r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`;e[r]||(e[r]={total:0,cash:0,card:0,date:r,isGroup:!0}),e[r].total+=t.total||0,e[r].cash+=t.cash||0,e[r].card+=t.card||0}),U=Object.values(e).sort((e,t)=>t.date.localeCompare(e.date))}else if(window.expensePeriod===`yearly`){let e={};i.forEach(t=>{let n=new Date(t.createdAt);if(isNaN(n.getTime()))return;let r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}`;e[r]||(e[r]={total:0,cash:0,card:0,date:r,isGroup:!0}),e[r].total+=t.total||0,e[r].cash+=t.cash||0,e[r].card+=t.card||0}),U=Object.values(e).sort((e,t)=>t.date.localeCompare(e.date))}else U=i;let a=Math.ceil(U.length/15),s=window.expensePage*15,l=U.slice(s-15,s),d=document.getElementById(`expense-section`);if(!d)return;let f=window.expensePeriod===`daily`?o(`Kundalik xarajatlar`):window.expensePeriod===`monthly`?o(`Oylik xarajatlar`):o(`Yillik xarajatlar`),p=window.expensePeriod!==`daily`,m=l.map((t,n)=>`
      <tr>
        <td style="text-align:center">${(window.expensePage-1)*15+n+1}</td>
        ${p?``:`
        <td style="text-align:center">
          <div style="font-size:11px; color:var(--text-muted);">
            <div style="margin-bottom:2px;">${e(t.createdAt)}</div>
            ${t.updatedAt&&t.createdAt!==t.updatedAt?`<div style="color:var(--danger); font-weight:500;">${e(t.updatedAt)}</div>`:``}
          </div>
        </td>`}
        <td class="price price-negative" style="text-align:center; font-weight:700;">-${c(t.total)} ${o(`so'm`)}</td>
        <td style="text-align:center">
          <div style="font-size:11px; display:flex; flex-direction:column; gap:2px; align-items:center;">
            ${t.cash>0?`<span class="badge" style="background:#4CAF5020; color:#4CAF50; border:1px solid #4CAF5040;">${o(`Naqd`)}: ${c(t.cash)}</span>`:``}
            ${t.card>0?`<span class="badge" style="background:var(--accent)20; color:var(--accent); border:1px solid var(--accent)40;">${o(`Karta`)}: ${c(t.card)}</span>`:``}
          </div>
        </td>
        ${p?``:`<td style="text-align:center">${u(t.description)||`<span style="opacity:0.3">—</span>`}</td>`}
        <td style="text-align:center; font-weight:600; font-size:12px;">${u(t.createdByName||o(`Tizim`))}</td>
        ${p?`
        <td style="text-align:center; font-size:12px; opacity:0.7;">
            ${window.expensePeriod===`yearly`?(()=>{let e=[`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`],[n,r]=t.date.split(`-`);return`${o(e[parseInt(r)-1])} ${n}`})():(()=>{let e=[`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`],[n,r,i]=t.date.split(`-`);return`${parseInt(i)} ${o(e[parseInt(r)-1])}`})()}
        </td>`:``}
        ${p?``:`
        <td style="text-align:center">
            <div class="action-buttons" style="justify-content:center;">
              ${window.hasPermission(`edit`)?`<button class="btn btn-icon btn-sm" onclick="editExpense(${t.id})" title="${o(`Tahrirlash`)}">✏️</button>`:``}
              ${window.hasPermission(`delete`)?`<button class="btn btn-icon btn-sm" onclick="deleteExpense(${t.id})" style="color:var(--danger)" title="${o(`O'chirish`)}">🗑️</button>`:``}
            </div>
        </td>`}
      </tr>`).join(``);if(!n)d.innerHTML=`
        <div class="card">
          <div class="card-header">
             <h3 style="margin:0; font-size:16px;">${f}</h3>
             <div class="toolbar">
               <div class="search-box">
                 <span class="search-icon">🔍</span>
                 <input type="text" placeholder="${o(`Qidirish...`)}" id="expense-search" value="${u(document.getElementById(`expense-search`)?.value||``)}" oninput="renderExpenseTable()">
               </div>
               <button class="btn btn-ghost" onclick="openDateFilterModal()" title="${o(`Sana bo'yicha filter`)}">📅</button>
               ${window.hasPermission(`add`)?`<button class="btn btn-primary btn-sm" onclick="openExpenseModal()">${o(`Qo'shish`)}</button>`:``}
             </div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="text-align:center">№</th>
                  ${p?``:`<th style="text-align:center">${o(`Sana`)}</th>`}
                  <th style="text-align:center">${o(`Summa`)}</th>
                  <th style="text-align:center">${o(`To'lov turi`)}</th>
                  ${p?``:`<th style="text-align:center">${o(`Tavsifi`)}</th>`}
                  <th style="text-align:center">${o(`Mas'ul`)}</th>
                  ${p?`<th style="text-align:center">${o(`Sana (davr)`)}</th>`:``}
                  ${p?``:`<th style="text-align:center">${o(`Amallar`)}</th>`}
                </tr>
              </thead>
              <tbody id="expense-tbody">
                ${l.length===0&&!n?`<tr><td colspan="${p?5:8}" style="text-align:center;padding:30px;color:var(--text-muted);">${o(`Xarajatlar mavjud emas`)}</td></tr>`:m}
              </tbody>
            </table>
          </div>
        </div>
        <div id="expense-pagination-area">
          ${renderPageControls(`expensePage`,a,`renderExpenseTable`)}
        </div>
      `,attachInfiniteScroll(`expensePage`,a,`renderExpenseTable`);else{let e=document.getElementById(`expense-tbody`);e&&e.insertAdjacentHTML(`beforeend`,m);let t=document.getElementById(`expense-pagination-area`);t&&(t.innerHTML=renderPageControls(`expensePage`,a,`renderExpenseTable`)),attachInfiniteScroll(`expensePage`,a,`renderExpenseTable`)}}function It(t,n=!1){typeof t==`boolean`&&(n=t,t=null),t&&(At=t,window.fixedPage=1);let r=Math.ceil(At.length/10);window.fixedPage>r&&(window.fixedPage=r||1);let i=(window.fixedPage-1)*10,a=At.slice(i,i+10),s=document.getElementById(`fixed-section`);if(!s)return;let l=a.map((t,n)=>`
    <tr>
      <td style="text-align:center">${i+n+1}</td>
      <td style="text-align:center">
        <div style="font-size:11px; color:var(--text-muted);">
          <div style="margin-bottom:2px;">${e(t.createdAt)}</div>
          ${t.updatedAt&&t.createdAt!==t.updatedAt?`<div style="color:var(--danger); font-weight:500;">${e(t.updatedAt)}</div>`:``}
        </div>
      </td>
      <td style="text-align:center"><strong style="color:var(--text-primary)">${u(t.name)}</strong></td>
      <td class="price" style="text-align:center; font-weight:700;">${c(t.amount)} ${o(`so'm`)}</td>
      <td style="text-align:center">
        <span class="badge" style="background:var(--bg-glass); border:1px solid var(--border); color:var(--text-secondary);">
          ${t.type===1?o(`Oylik`):t.type===2?o(`Yillik`):o(`Boshqa`)}
        </span>
      </td>
      <td style="text-align:center"><span style="font-size:13px; color:var(--text-muted)">${u(t.description)||`—`}</span></td>
      <td class="actions" style="justify-content:center">
        ${window.hasPermission(`edit`)?`<button class="btn-icon" onclick='openFixedCostModal(${JSON.stringify(t).replace(/'/g,`&#39;`)})' title="${o(`Tahrirlash`)}">✏️</button>`:``}
      </td>
    </tr>`).join(``);if(!n)s.innerHTML=`
      <div class="card">
        <div class="card-header">
           <h3 style="margin:0; font-size:16px;">${o(`Doimiy xarajatlar`)}</h3>
           <div class="toolbar">
             <div class="search-box">
               <span class="search-icon">🔍</span>
               <input type="text" placeholder="${o(`Qidirish...`)}" id="fixed-search" value="${u(document.getElementById(`fixed-search`)?.value||``)}" oninput="filterFixed(this.value)">
             </div>
             ${window.hasPermission(`add`)?`<button class="btn btn-primary btn-sm" onclick="openFixedCostModal()">${o(`Qo'shish`)}</button>`:``}
           </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align:center">№</th>
                <th style="text-align:center">${o(`Sana`)}</th>
                <th style="text-align:center">${o(`Nomi`)}</th>
                <th style="text-align:center">${o(`Summa`)}</th>
                <th style="text-align:center">${o(`Turi`)}</th>
                <th style="text-align:center">${o(`Tavsifi`)}</th>
                <th style="text-align:center">${o(`Amallar`)}</th>
              </tr>
            </thead>
            <tbody id="fixed-tbody">
              ${a.length===0?`<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">${o(`Doimiy xarajatlar mavjud emas`)}</td></tr>`:l}
            </tbody>
          </table>
        </div>
      </div>
      <div id="fixed-pagination-area">
        ${renderPageControls(`fixedPage`,r,`renderFixedTable`)}
      </div>
    `,attachInfiniteScroll(`fixedPage`,r,`renderFixedTable`);else{let e=document.getElementById(`fixed-tbody`);e&&e.insertAdjacentHTML(`beforeend`,l);let t=document.getElementById(`fixed-pagination-area`);t&&(t.innerHTML=renderPageControls(`fixedPage`,r,`renderFixedTable`)),attachInfiniteScroll(`fixedPage`,r,`renderFixedTable`)}}function Lt(e){let t=(e||``).toLowerCase(),n=jt.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)||e.description&&String(e.description).toLowerCase().includes(t)),r=document.getElementById(`fixed-search`),i=r?r.selectionStart:0;It(n),setTimeout(()=>{let e=document.getElementById(`fixed-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function Rt(e){let t=kt.find(t=>t.id===e);t&&Bt(t)}async function zt(e){if(confirm(o(`Haqiqatan ham bu xarajatni o'chirmoqchimisiz?`)))try{await s.delete(`/expenses/`+e),a(o(`O'chirildi`)),Mt()}catch(e){a(e.message,`error`)}}function Bt(e=null){let t=!!e;openModal(`
    <div class="modal-header">
      <h3>${o(t?`Xarajatni tahrirlash`:`Yangi xarajat`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveExpense(event, ${t?e.id:`null`})" style="width:100%">
      <div class="form-group">
        <label>${o(`Jami summa`)}</label>
        <div style="position:relative">
          <input type="number" step="0.01" class="form-control" id="exp-total" value="${t?e.total:``}" placeholder="0.00" required style="padding-right:45px; font-weight:700; font-size:18px;">
          <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
        </div>
      </div>
      
      <div style="background:var(--bg-input); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid var(--border);">
        <p style="font-size:11px; margin-top:0; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${o(`To'lov usuli`)}</p>
        <div class="form-row" style="margin-bottom:0">
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${o(`Naqd`)}</label>
            <input type="number" step="0.01" class="form-control" id="exp-cash" value="${t?e.cash:`0`}">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:11px">${o(`Karta`)}</label>
            <input type="number" step="0.01" class="form-control" id="exp-card" value="${t?e.card:`0`}">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>${o(`Tavsifi`)}</label>
        <textarea class="form-control" id="exp-desc" rows="2" placeholder="${o(`Xarajat tavsifi`)}" style="resize:none">${t&&e.description||``}</textarea>
      </div>

      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${o(`Saqlash`)}</button>
      </div>
    </form>
  `)}async function Vt(e,t){e.preventDefault();let n=d();try{let e={businessId:n,total:parseFloat(document.getElementById(`exp-total`).value),cash:parseFloat(document.getElementById(`exp-cash`).value)||0,card:parseFloat(document.getElementById(`exp-card`).value)||0,description:document.getElementById(`exp-desc`).value.trim()};t?(await s.put(`/expenses/`+t,e),a(o(`O'zgarishlar saqlandi`)),closeModal()):(await s.post(`/expenses`,e),a(o(`Xarajat qo'shildi`)),document.getElementById(`exp-total`).value=``,document.getElementById(`exp-cash`).value=`0`,document.getElementById(`exp-card`).value=`0`,document.getElementById(`exp-desc`).value=``,document.getElementById(`exp-total`).focus()),Mt()}catch(e){a(e.message,`error`)}}function Ht(e=null){let t=!!e;openModal(`
    <div class="modal-header">
      <h3>${o(t?`Doimiy xarajatni tahrirlash`:`Yangi doimiy xarajat`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="saveFixedCost(event, ${t?e.id:0})" style="width:100%">
      <div class="form-group">
        <label>${o(`Turi`)}</label>
        <input type="text" class="form-control" id="fc-name" value="${t?u(e.name):``}" placeholder="${o(`Turini kiriting`)}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>${o(`Summa`)}</label>
          <div style="position:relative">
            <input type="number" step="0.01" class="form-control" id="fc-amount" value="${t?e.amount:``}" required style="padding-right:45px">
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:0.5; font-size:12px;">UZS</span>
          </div>
        </div>
        <div class="form-group">
          <label>${o(`Turi`)}</label>
          <select class="form-control" id="fc-type" required>
            <option value="1" ${t&&e.type===1?`selected`:``}>${o(`Oylik`)}</option>
            <option value="2" ${t&&e.type===2?`selected`:``}>${o(`Yillik`)}</option>
            <option value="3" ${t&&e.type===3?`selected`:``}>${o(`Boshqa`)}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>${o(`Tavsifi`)}</label>
        <textarea class="form-control" id="fc-desc" rows="2" style="resize:none">${t&&e.description?u(e.description):``}</textarea>
      </div>

      <div class="modal-footer" style="padding-top:10px">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="submit" class="btn btn-primary" style="padding:10px 40px;">${o(t?`Saqlash`:`Yaratish`)}</button>
      </div>
    </form>
  `)}async function Ut(e,t){e.preventDefault();let n=d();try{t?(await s.put(`/fixed-costs/${t}`,{name:document.getElementById(`fc-name`).value.trim(),description:document.getElementById(`fc-desc`).value.trim()||null,amount:parseFloat(document.getElementById(`fc-amount`).value),type:parseInt(document.getElementById(`fc-type`).value)}),a(o(`Doimiy xarajat yangilandi`)),closeModal()):(await s.post(`/fixed-costs`,{businessId:n,name:document.getElementById(`fc-name`).value.trim(),description:document.getElementById(`fc-desc`).value.trim(),amount:parseFloat(document.getElementById(`fc-amount`).value),type:parseInt(document.getElementById(`fc-type`).value)}),a(o(`Doimiy xarajat qo'shildi`)),document.getElementById(`fc-name`).value=``,document.getElementById(`fc-amount`).value=``,document.getElementById(`fc-desc`).value=``,document.getElementById(`fc-name`).focus()),Mt()}catch(e){a(e.message,`error`)}}window.renderExpenses=Mt,window.renderExpenseTable=Ft,window.filterExpensesByPeriod=Pt,window.setExpensePeriod=Nt,window.openExpenseModal=Bt,window.saveExpense=Vt,window.editExpense=Rt,window.deleteExpense=zt,window.renderFixedTable=It,window.filterFixed=Lt,window.openFixedCostModal=Ht,window.saveFixedCost=Ut,window.expensePage=expensePage,window.expensePeriod=expensePeriod,window.fixedPage=fixedPage,window.allExpensesList=kt,window.allFixedList=jt,window.currentExpenses=U,window.currentFixed=At;var Wt=1,Gt=[],Kt=[];async function qt(){let e=document.getElementById(`page-content`),t=d();try{let e=[];if(t)e=await s.get(`/calculations?businessId=${t}`);else{let t=await s.get(`/businesses/my`).catch(()=>[]);t&&t.length>0&&(e=(await Promise.all(t.map(e=>s.get(`/calculations?businessId=${e.id}`).catch(()=>[])))).flat())}Kt=(e||[]).filter(e=>e&&typeof e==`object`),Kt.sort((e,t)=>e.year===t.year?t.month-e.month:t.year-e.year),Jt(Kt)}catch(t){e.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(t.message)}</p></div>`}}function Jt(e,t=!1){typeof e==`boolean`&&(t=e,e=null),e&&(t||(window.calculationPage=1),Gt=e);let n=Math.ceil(Gt.length/15),r=window.calculationPage*15,i=Gt.slice(r-15,r),a=[``,`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`],s=document.getElementById(`page-content`),l=i.map(e=>{let t=o(a[e.month]||e.month),n=e.profit>=0;return`
        <div class="stat-card" style="cursor:pointer; display:block; height:auto; padding:20px; transition:all 0.3s; border:1px solid var(--border);" onclick='viewCalculationDetail(${JSON.stringify(e).replace(/'/g,`&#39;`)})'>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:10px;">
            <span style="font-size:11px; font-weight:700; color:var(--text-primary);">${t} ${e.year}</span>
            <span class="badge" style="background:${n?`#4CAF5020`:`#f4433620`}; color:${n?`#4CAF50`:`#f44336`}; padding:6px 12px; font-weight:700;">
                ${o(n?`Foyda`:`Zarar`)}
            </span>
            </div>
            
            <div style="margin-bottom:15px">
                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${o(`Sof foyda`)}</div>
                <div style="font-size:18px; font-weight:800; text-align: center; color:${n?`var(--success)`:`var(--danger)`};">
                ${n?``:`-`}${c(Math.abs(e.profit))} <small style="font-size:12px; font-weight:400; text-align: center; opacity:0.6;"></small>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px; background:var(--bg-glass); border-radius:8px; padding:12px;">
            <div>
                <div style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">${o(`Sotuv`)}</div>
                <div style="font-weight:700; color:var(--success)">${c(e.totalSale)}</div>
            </div>
            <div>
                <div style="color:var(--text-muted); font-size:10px; text-transform:uppercase;">${o(`Xarajat`)}</div>
                <div style="font-weight:700; color:var(--danger)">${c(e.totalExpense+e.totalFixedCosts)}</div>
            </div>
            </div>
            
            <div style="margin-top:10px; text-align:right; font-size:11px; color:var(--text-muted); font-style:italic;">
            ${o(`Batafsil ko'rish`)} →
            </div>
        </div >
    `}).join(``);if(!t)s.innerHTML=`
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <h3 style="margin:0; font-size:16px;">${o(`Oylik hisob-kitoblar`)}</h3>
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="${o(`Oy/Yil bo'yicha`)}" id="calculation-search" value="${u(document.getElementById(`calculation-search`)?.value||``)}" oninput="filterCalculations(this.value)">
          </div>
          <button class="btn btn-primary btn-sm" onclick="openCalculationModal()">${o(`Qo'shish`)}</button>
        </div>
      </div>
    </div>

      <div class="stats-grid" id="calculations-grid">
           ${i.length===0&&!t?`<div class="empty-state"><div class="icon">📊</div><h4>${o(`Hisob-kitoblar yo'q`)}</h4><p>${o(`Yangi hisob-kitob yarating.`)}</p></div>`:l}
      </div>
      <div id="calculations-pagination-area">
        ${renderPageControls(`calculationPage`,n,`renderCalculationsTable`)}
      </div>
      <div class="page-bottom-bar">
        <div class="search-box" style="flex:1; max-width:none;">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="${o(`Oy/Yil bo'yicha`)}" id="calculation-search-bottom" 
            oninput="filterCalculations(this.value)"
            style="color: var(--text-primary) !important; background: var(--bg-secondary) !important;" class="form-control">
        </div>
        <button class="btn btn-primary" onclick="openCalculationModal()">${o(`Qo'shish`)}</button>
      </div >
    `,attachInfiniteScroll(`calculationPage`,n,`renderCalculationsTable`);else{let e=document.getElementById(`calculations-grid`);e&&e.insertAdjacentHTML(`beforeend`,l);let t=document.getElementById(`calculations-pagination-area`);t&&(t.innerHTML=renderPageControls(`calculationPage`,n,`renderCalculationsTable`)),attachInfiniteScroll(`calculationPage`,n,`renderCalculationsTable`)}}function Yt(e){let t=(e||``).toLowerCase(),n=[``,`yanvar`,`fevral`,`mart`,`aprel`,`may`,`iyun`,`iyul`,`avgust`,`sentabr`,`oktabr`,`noyabr`,`dekabr`],r=Kt.filter(e=>{let r=o(n[e.month]||``).toLowerCase();return String(e.year).includes(t)||r.includes(t)}),i=document.getElementById(`calculation-search`),a=i?i.selectionStart:0;Jt(r),setTimeout(()=>{let e=document.getElementById(`calculation-search`);if(e){e.focus();try{e.setSelectionRange(a,a)}catch{}}},0)}function Xt(e){let t=o([``,`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`][e.month]||e.month);openModal(`
    <div class="modal-header">
      <h3>📊 ${t} ${e.year} — ${o(`Hisob-kitob tafsilotlari`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div style="padding:0 10px">
      <div class="table-container" style="border:none; background:none;">
        <table style="border-collapse: separate; border-spacing: 0 8px;">
          <tbody>
            <tr style="background:var(--bg-glass); border-radius:8px;">
              <td style="padding:12px; border:none; color:var(--text-secondary)">${o(`Jami sotuv`)}</td>
              <td class="price" style="padding:12px; border:none; text-align:right; font-weight:700;">${c(e.totalSale)} ${o(`so'm`)}</td>
            </tr>
            <tr>
              <td style="padding:12px; border:none; color:var(--text-secondary); display:flex; align-items:center; gap:8px; justify-content:space-between;">
                ${o(`Jami daromad`)}
                <button type="button" class="btn btn-ghost" style="padding:0; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; opacity:0.6; background:rgba(16, 185, 129, 0.1); border-radius:50%;" onclick="showIncomeBreakdown(${e.businessId}, ${e.month}, ${e.year})" title="${o(`Daromad yoyilmasini ko'rish`)}">ℹ️</button>
              </td>
              <td class="price" style="padding:12px; border:none; text-align:right; color:var(--success); font-weight:700;">${c(e.totalIncome)} ${o(`so'm`)}</td>
            </tr>
            <tr>
              <td style="padding:12px; border:none; color:var(--text-secondary); display:flex; align-items:center; gap:8px; justify-content:space-between;">
                ${o(`Jami xarajat`)}
                <button type="button" class="btn btn-ghost" style="padding:0; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; opacity:0.6; background:rgba(239, 68, 68, 0.1); border-radius:50%;" onclick="showExpenseBreakdown(${e.businessId}, ${e.month}, ${e.year})" title="${o(`Xarajatlar yoyilmasini ko'rish`)}">ℹ️</button>
              </td>
              <td class="price" style="padding:12px; border:none; text-align:right; color:var(--danger); font-weight:700;">-${c(e.totalExpense+e.totalFixedCosts)} ${o(`so'm`)}</td>
            </tr>
            <tr style="border-bottom: 2px solid var(--border);">
              <td style="padding:12px; border:none; color:var(--text-secondary)">${o(`Ish haqi va soliqlar`)}</td>
              <td class="price" style="padding:12px; border:none; text-align:right; color:var(--danger); opacity:0.8;">-${c(e.salary+e.salaryTax+e.incomeTax)} ${o(`so'm`)}</td>
            </tr>
            <tr>
              <td style="padding:12px; border:none; color:var(--text-secondary)">${o(`Qo'shilgan mablag'lar`)}</td>
              <td class="price" style="padding:12px; border:none; text-align:right;">${c(e.addedMoney)} ${o(`so'm`)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background:var(--accent-glow); border-radius:12px;">
              <td style="padding:20px; border:none; font-weight:800; font-size:18px; color:var(--text-primary); border-radius:12px 0 0 12px;">${o(`Sof foyda`)}</td>
              <td class="price" style="padding:20px; border:none; text-align:right; font-size:22px; font-weight:800; color:${e.profit>=0?`var(--success)`:`var(--danger)`}; border-radius:0 12px 12px 0;">
                ${c(e.profit)} ${o(`so'm`)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="modal-footer">
       <button class="btn btn-primary" onclick="closeModal()" style="width:100%">${o(`Yopish`)}</button>
    </div>
  `)}function Zt(){let e=new Date;openModal(`
    <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding: 20px 24px;">
      <h3 style="margin:0;">${o(`Yangi hisob-kitob`)}</h3>
      <div style="display:flex; gap:12px; align-items:center;">
        <button type="button" class="btn btn-success btn-sm" onclick="syncCalculationStats()" style="display:flex; align-items:center; gap:8px; padding: 8px 16px;">
          <span>🔄</span> ${o(`Hisoblash`)}
        </button>
        <button class="modal-close" onclick="closeModal()" title="${o(`Yopish`)}" style="position:static; margin:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.05); border-radius:50%;">✕</button>
      </div>
    </div>
    <form onsubmit="createCalculation(event)" style="width:100%; padding: 0 10px;">
      <div class="form-row" style="margin-bottom: 20px; background: var(--bg-glass); padding: 15px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size:11px; text-transform:uppercase; opacity:0.6; letter-spacing:0.5px;">${o(`Oy`)}</label>
          <select class="form-control" id="calc-month" required style="background:transparent; border-color:rgba(255,255,255,0.1);">
            ${[``,`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`].map((e,t)=>t===0?``:`<option value="${t}">${o(e)}</option>`).join(``)}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label style="font-size:11px; text-transform:uppercase; opacity:0.6; letter-spacing:0.5px;">${o(`Yil`)}</label>
          <input type="number" class="form-control" id="calc-year" value="${e.getFullYear()}" required style="background:transparent; border-color:rgba(255,255,255,0.1);">
        </div>
      </div>

      <div class="form-row" style="margin-bottom:20px;">
        <!-- Daromadlar Section -->
        <div style="background:rgba(16, 185, 129, 0.03); border:1px solid rgba(16, 185, 129, 0.1); padding:20px; border-radius:16px;">
          <h4 style="font-size:13px; color:var(--success); border-bottom:1px solid rgba(16, 185, 129, 0.2); padding-bottom:10px; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
            <span style="background:var(--success); color:white; width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:12px;">💰</span>
            ${o(`Daromadlar`)}
          </h4>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600;">${o(`Jami sotuv`)}</label>
            <input type="number" step="0.01" class="form-control" id="calc-sale" value="0">
          </div>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
              ${o(`Jami daromad`)}
              <button type="button" class="btn btn-ghost" style="padding:0; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; opacity:0.6; background:rgba(16, 185, 129, 0.1); border-radius:50%;" onclick="const bid = getSelectedBusinessId(); const month = document.getElementById('calc-month').value; const year = document.getElementById('calc-year').value; showIncomeBreakdown(bid, month, year);" title="${o(`Daromad yoyilmasini ko'rish`)}">ℹ️</button>
            </label>
            <input type="number" step="0.01" class="form-control" id="calc-income" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600;">${o(`Qo'shilgan mablag'lar`)}</label>
            <input type="number" step="0.01" class="form-control" id="calc-added" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:12px; font-weight:600;">${o(`Daromad solig'i`)}</label>
            <input type="number" step="0.01" class="form-control" id="calc-income-tax" value="0" oninput="calculateNetProfit()">
          </div>
        </div>

        <!-- Xarajatlar Section -->
        <div style="background:rgba(239, 68, 68, 0.03); border:1px solid rgba(239, 68, 68, 0.1); padding:20px; border-radius:16px;">
          <h4 style="font-size:13px; color:var(--danger); border-bottom:1px solid rgba(239, 68, 68, 0.2); padding-bottom:10px; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
            <span style="background:var(--danger); color:white; width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:12px;">📉</span>
            ${o(`Xarajatlar`)}
          </h4>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
              ${o(`Xarajatlar`)}
              <button type="button" class="btn btn-ghost" style="padding:0; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; opacity:0.6; background:rgba(239, 68, 68, 0.1); border-radius:50%;" onclick="const bid = getSelectedBusinessId(); const month = document.getElementById('calc-month').value; const year = document.getElementById('calc-year').value; showExpenseBreakdown(bid, month, year);" title="${o(`Xarajatlar yoyilmasini ko'rish`)}">ℹ️</button>
            </label>
            <input type="number" step="0.01" class="form-control" id="calc-expense" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group">
            <label style="font-size:12px; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
              ${o(`Doimiy xarajatlar`)}
              <button type="button" class="btn btn-ghost" style="padding:0; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; opacity:0.6; background:rgba(239, 68, 68, 0.1); border-radius:50%;" onclick="const bid = getSelectedBusinessId(); showFixedBreakdown(bid);" title="${o(`Doimiy xarajatlar yoyilmasini ko'rish`)}">ℹ️</button>
            </label>
            <input type="number" step="0.01" class="form-control" id="calc-fixed" value="0" oninput="calculateNetProfit()">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label style="font-size:12px; font-weight:600;">${o(`Ish haqi va soliqlar`)}</label>
            <input type="number" step="0.01" class="form-control" id="calc-salary-total" value="0" placeholder="${o(`Ish haqi va soliqlar`)}" oninput="calculateNetProfit()">
          </div>
        </div>
      </div>

      <div style="background:linear-gradient(135deg, var(--accent-glow), rgba(16, 185, 129, 0.1)); padding:20px; border-radius:16px; border:1px solid var(--accent); position:relative; overflow:hidden;">
        <div style="position:absolute; right:-20px; top:-20px; font-size:80px; opacity:0.05; transform:rotate(-15deg);">💎</div>
        <div class="form-group" style="margin-bottom:0; position:relative; z-index:1;">
          <label style="font-weight:700; color:var(--text-primary); font-size:14px; margin-bottom:8px; display:block;">${o(`Hisoblangan sof foyda`)}</label>
          <div style="display:flex; align-items:center; gap:12px;">
            <input type="number" step="0.01" class="form-control" id="calc-profit" value="0" readonly style="font-size:24px; font-weight:800; color:var(--accent); background:transparent; border:none; padding:0; height:auto;">
            <span style="font-size:14px; font-weight:700; color:var(--accent); opacity:0.7;">UZS</span>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="padding: 20px 0 10px 0; border-top: 1px solid var(--border); margin-top:20px;">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
        <button type="submit" class="btn btn-primary" style="padding:12px 50px; border-radius:12px; font-weight:700; box-shadow:0 4px 15px rgba(16, 185, 129, 0.2);">${o(`Yaratish`)}</button>
      </div>
    </form>
  `),document.getElementById(`calc-month`).value=e.getMonth()+1}async function Qt(e){e.preventDefault();let t=d();try{await s.post(`/calculations`,{businessId:t,month:parseInt(document.getElementById(`calc-month`).value),year:parseInt(document.getElementById(`calc-year`).value),totalSale:parseFloat(document.getElementById(`calc-sale`).value)||0,totalIncome:parseFloat(document.getElementById(`calc-income`).value)||0,incomeTax:parseFloat(document.getElementById(`calc-income-tax`).value)||0,totalExpense:parseFloat(document.getElementById(`calc-expense`).value)||0,totalFixedCosts:parseFloat(document.getElementById(`calc-fixed`).value)||0,salary:parseFloat(document.getElementById(`calc-salary-total`).value)||0,salaryTax:0,profit:parseFloat(document.getElementById(`calc-profit`).value)||0,addedMoney:parseFloat(document.getElementById(`calc-added`).value)||0}),a(o(`Hisob-kitob yaratildi`)),closeModal(),qt()}catch(e){a(e.message,`error`)}}async function $t(){let e=d(),t=document.getElementById(`calc-month`).value,n=document.getElementById(`calc-year`).value;if(!e){a(o(`Iltimos, avval do'konni tanlang`),`warning`);return}if(!(!t||!n))try{let r=await s.get(`/calculations/stats?businessId=${e}&month=${t}&year=${n}`);document.getElementById(`calc-sale`).value=r.totalSale||0,document.getElementById(`calc-income`).value=r.totalIncome||0,document.getElementById(`calc-expense`).value=r.totalExpense||0,document.getElementById(`calc-fixed`).value=r.totalFixedCosts||0,document.getElementById(`calc-salary-total`).value=r.totalSalary||0,en()}catch(e){a(e.message,`error`)}}function en(){let e=parseFloat(document.getElementById(`calc-income`).value)||0,t=parseFloat(document.getElementById(`calc-expense`).value)||0,n=parseFloat(document.getElementById(`calc-fixed`).value)||0,r=parseFloat(document.getElementById(`calc-salary-total`).value)||0,i=parseFloat(document.getElementById(`calc-added`).value)||0,a=parseFloat(document.getElementById(`calc-income-tax`).value)||0,o=e-t-n-r+i-a;document.getElementById(`calc-profit`).value=o.toFixed(2)}window.showIncomeBreakdown=async function(e,t,n){try{let r=await s.get(`/calculations/income-breakdown?businessId=${e}&month=${t}&year=${n}`);if(!r||r.length===0){a(o(`Ma'lumot topilmadi`),`info`);return}let i=``;(r||[]).forEach(e=>{i+=`
        <tr>
          <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px;">${e.productName}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:center; font-size:13px;">${e.quantity}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px;">${c(e.avgPrice)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px; color:var(--danger);">${c(e.buyPrice)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px; font-weight:700; color:${e.totalProfit>=0?`var(--success)`:`var(--danger)`};">
            ${c(e.totalProfit)}
          </td>
        </tr>
      `});let l=`
      <div class="modal-header">
        <h3>${o(`Daromad yoyilmasi`)}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div style="max-height:400px; overflow-y:auto; padding:10px;">
        <table style="width:100%; border-collapse:collapse;">
          <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1;">
            <tr>
              <th style="text-align:left; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Mahsulot`)}</th>
              <th style="text-align:center; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Soni`)}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Sotish narxi`)}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Tan narxi`)}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Foyda`)}</th>
            </tr>
          </thead>
          <tbody>
            ${i}
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">${o(`Yopish`)}</button>
      </div>
    `,u=document.createElement(`div`);u.className=`modal-overlay active`,u.style.zIndex=`2000`;let d=document.createElement(`div`);d.className=`modal`,d.style.width=`700px`,d.innerHTML=l,u.appendChild(d),document.body.appendChild(u)}catch(e){a(e.message,`error`)}},window.showExpenseBreakdown=async function(e,t,n){try{let r=await s.get(`/calculations/expense-breakdown?businessId=${e}&month=${t}&year=${n}`);if(!r||r.length===0){a(o(`Ma'lumot topilmadi`),`info`);return}let l=``;(r||[]).forEach(e=>{l+=`
        <tr>
          <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px;">${i(e.createdAt)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px;">${u(e.description||`—`)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px; font-weight:700; color:var(--danger);">
            ${c(e.total)}
          </td>
        </tr>
      `});let d=`
      <div class="modal-header">
        <h3>${o(`Xarajatlar yoyilmasi`)}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div style="max-height:400px; overflow-y:auto; padding:10px;">
        <table style="width:100%; border-collapse:collapse;">
          <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1;">
            <tr>
              <th style="text-align:left; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Sana`)}</th>
              <th style="text-align:left; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Tavsifi`)}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Summa`)}</th>
            </tr>
          </thead>
          <tbody>
            ${l}
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">${o(`Yopish`)}</button>
      </div>
    `,f=document.createElement(`div`);f.className=`modal-overlay active`,f.style.zIndex=`2000`;let p=document.createElement(`div`);p.className=`modal`,p.style.width=`600px`,p.innerHTML=d,f.appendChild(p),document.body.appendChild(f)}catch(e){a(e.message,`error`)}},window.showFixedBreakdown=async function(e){try{let t=await s.get(`/calculations/fixed-breakdown?businessId=${e}`);if(!t||t.length===0){a(o(`Ma'lumot topilmadi`),`info`);return}let n=``;(t||[]).forEach(e=>{n+=`
        <tr>
          <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px;">${u(e.name)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); font-size:13px;">${u(e.description||`—`)}</td>
          <td style="padding:10px; border-bottom:1px solid var(--border); text-align:right; font-size:13px; font-weight:700; color:var(--danger);">
            ${c(e.amount)}
          </td>
        </tr>
      `});let r=`
      <div class="modal-header">
        <h3>${o(`Doimiy xarajatlar yoyilmasi`)}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div style="max-height:400px; overflow-y:auto; padding:10px;">
        <table style="width:100%; border-collapse:collapse;">
          <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1;">
            <tr>
              <th style="text-align:left; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Nomi`)}</th>
              <th style="text-align:left; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Tavsifi`)}</th>
              <th style="text-align:right; padding:10px; font-size:11px; text-transform:uppercase; opacity:0.6;">${o(`Summa`)}</th>
            </tr>
          </thead>
          <tbody>
            ${n}
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">${o(`Yopish`)}</button>
      </div>
    `,i=document.createElement(`div`);i.className=`modal-overlay active`,i.style.zIndex=`2000`;let l=document.createElement(`div`);l.className=`modal`,l.style.width=`600px`,l.innerHTML=r,i.appendChild(l),document.body.appendChild(i)}catch(e){a(e.message,`error`)}},window.renderCalculations=qt,window.renderCalculationsTable=Jt,window.filterCalculations=Yt,window.openCalculationModal=Zt,window.createCalculation=Qt,window.viewCalculationDetail=Xt,window.syncCalculationStats=$t,window.calculateNetProfit=en,window.calculationPage=Wt,window.allCalculationsList=Kt,window.currentCalculations=Gt;var tn=`users`;async function nn(){let e=document.getElementById(`page-content`),t=(s.getUser()||{}).role===2;e.innerHTML=`
        <div class="admin-tabs">
            <button class="btn btn-secondary active" onclick="showAdminTab('users')" id="tab-users">👥 ${o(`Foydalanuvchilar`)}</button>
            ${t?`
            <button class="btn btn-secondary" onclick="showAdminTab('regions')" id="tab-regions">🗺️ ${o(`Viloyatlar`)}</button>
            <button class="btn btn-secondary" onclick="showAdminTab('districts')" id="tab-districts">🏘️ ${o(`Tumanlar`)}</button>
            <button class="btn btn-secondary" onclick="showAdminTab('markets')" id="tab-markets">🏪 ${o(`Bozorlar`)}</button>
            <button class="btn btn-secondary" onclick="showAdminTab('referrals')" id="tab-referrals">🎁 ${o(`Referral`)}</button>
            `:``}
        </div>
        <div id="admin-content"></div>
    `,rn(tn)}function rn(e){(s.getUser()||{}).role!==2&&[`regions`,`districts`,`markets`,`referrals`].includes(e)&&(e=`users`),tn=e,document.querySelectorAll(`.admin-tabs .btn`).forEach(e=>{e.classList.remove(`active`),e.classList.replace(`btn-primary`,`btn-secondary`)});let t=document.getElementById(`tab-`+e);switch(t&&(t.classList.add(`active`),t.classList.replace(`btn-secondary`,`btn-primary`)),e){case`users`:sn();break;case`regions`:On();break;case`districts`:Rn();break;case`markets`:X();break;case`referrals`:Gn();break}}var an=1,on=[];async function sn(){let e=document.getElementById(`admin-content`);e.innerHTML=`<div class="loader"></div>`;try{let e=s.getUser()||{},t;t=e.role===2?await s.get(`/admin/users`):await s.get(`/users/my-employees`),on=t||[],mn(on)}catch(t){e.innerHTML=`<p class="error">${o(`Xatolik`)}: `+t.message+`</p>`}}var W=1,cn=[],ln=[],G=1,un=[],dn=[],K=1,fn=[],pn=[];function mn(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(on=e);let n=(document.getElementById(`admin-user-search`)?.value||``).toLowerCase(),r=on.filter(e=>{let t=e.role===2?`super admin`:e.role===1?`admin`:e.role===3?`client`:`employee`;return e.firstName&&String(e.firstName).toLowerCase().includes(n)||e.lastName&&String(e.lastName).toLowerCase().includes(n)||e.userName&&String(e.userName).toLowerCase().includes(n)||e.phoneNumber&&String(e.phoneNumber).toLowerCase().includes(n)||t.includes(n)}),i=r.filter(e=>e.role===2),a=r.filter(e=>e.role===1),s=r.filter(e=>e.role===0),c=r.filter(e=>e.role===3),l=document.getElementById(`admin-content`),d=`
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${o(`Qidirish...`)}" id="admin-user-search" value="${u(n)}" oninput="filterAdminUsers(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick="openCreateUserModal()">${o(`Qo'shish`)}</button>
              </div>
            </div>
            <div class="admin-users-list" style="padding:20px;">
    `;i.length>0&&(d+=`<h4 style="margin-bottom:15px; color:var(--primary); display:flex; align-items:center; gap:10px;">🌟 Super Admins <span class="badge badge-success">${i.length}</span></h4>`,i.forEach(e=>{d+=hn(e)})),a.length>0&&(d+=`<h4 style="margin:25px 0 15px; color:var(--warning); display:flex; align-items:center; gap:10px;">🏢 Admins & Teams <span class="badge badge-warning">${a.length}</span></h4>`,a.forEach(e=>{let t=s.filter(t=>t.createdBy===e.id);d+=gn(e,t)}));let f=s.filter(e=>!a.find(t=>t.id===e.createdBy));(f.length>0||c.length>0)&&(d+=`<h4 style="margin:25px 0 15px; color:var(--text-muted);">${o(`Boshqa foydalanuvchilar`)}</h4>`,[...f,...c].forEach(e=>{d+=hn(e)})),r.length===0&&(d+=`<div class="empty-state">${o(`Ma'lumot yo'q`)}</div>`),d+=`</div></div>`,l.innerHTML=d}function hn(e){let t=(e.isExpired||e.expirationDate&&new Date(e.expirationDate)<new Date)&&e.role!==2,n=e.role===2?`Super Admin`:e.role===1?`Admin`:e.role===3?`Client`:`Employee`,r=e.role===2?`badge-success`:e.role===1?`badge-warning`:e.role===3?`badge-info`:``;return`
        <div class="user-item-card" style="display:flex; align-items:center; justify-content:space-between; padding:12px 15px; background:var(--bg-glass); border:1px solid var(--border); border-radius:12px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:15px;">
                <div class="acc-avatar" style="width:40px; height:40px; font-size:16px;">${e.firstName?e.firstName[0]:`?`}</div>
                <div>
                    <div style="font-weight:600; font-size:14px;">${u(e.firstName)} ${u(e.lastName)} <span style="color:var(--text-muted); font-weight:400; font-size:12px;">(@${e.userName})</span></div>
                    <div style="font-size:12px; color:var(--text-muted);">${e.phoneNumber||`—`} | <span class="badge ${r}" style="font-size:10px;">${o(n)}</span></div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:20px;">
                <div style="text-align:right">
                    <div style="font-size:11px; color:var(--text-muted);">${o(`Muddati`)}: ${i(e.expirationDate)}</div>
                    ${t?`<span class="badge badge-danger" style="font-size:10px;">${o(`Muddati tugagan`)}</span>`:`<span class="badge badge-success" style="font-size:10px;">${o(`Faol`)}</span>`}
                </div>
                <div class="actions">
                    <button class="btn-icon" onclick='openEditUserModal(${e.id}, ${JSON.stringify(JSON.stringify(e)).replace(/'/g,`&#39;`)})'>✏️</button>
                    <button class="btn-icon danger" onclick="deleteAdminUser(${e.id})">🗑️</button>
                </div>
            </div>
        </div>
    `}function gn(e,t){let n=(e.isExpired||e.expirationDate&&new Date(e.expirationDate)<new Date)&&e.role!==2,r=`user-acc-${e.id}`;return`
        <div class="acc-item" id="${r}" style="margin-bottom:12px; border-radius:15px; overflow:hidden; border:1px solid var(--border);">
            <div class="acc-header" onclick="toggleAcc('${r}')" style="padding:15px; background:var(--bg-card);">
                <div class="acc-header-left">
                    <div class="acc-avatar acc-avatar-indigo">${e.firstName?e.firstName[0]:`?`}</div>
                    <div>
                        <div class="acc-title">${u(e.firstName)} ${u(e.lastName)} (@${e.userName})</div>
                        <div class="acc-subtitle">${e.phoneNumber||`—`} | <span class="badge badge-warning">${o(`Admin`)}</span> | 👥 ${t.length} xodim</div>
                    </div>
                </div>
                <div class="acc-header-right">
                    <div style="text-align:right; margin-right:15px;">
                        <div style="font-size:11px; color:var(--text-muted);">${o(`Muddati`)}: ${i(e.expirationDate)}</div>
                        ${n?`<span class="badge badge-danger" style="font-size:10px;">${o(`Muddati tugagan`)}</span>`:`<span class="badge badge-success" style="font-size:10px;">${o(`Faol`)}</span>`}
                    </div>
                    <span class="acc-chevron">▼</span>
                </div>
            </div>
            <div class="acc-body" style="background:rgba(255,255,255,0.02); padding:0;">
                <div style="padding:15px; border-bottom:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-ghost btn-sm" onclick='openEditUserModal(${e.id}, ${JSON.stringify(JSON.stringify(e)).replace(/'/g,`&#39;`)})'>✏️ ${o(`Tahrirlash`)}</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdminUser(${e.id})">🗑️ ${o(`O'chirish`)}</button>
                </div>
                <div class="team-list" style="padding:10px 15px;">
                    ${t.length===0?`<div style="padding:10px; color:var(--text-muted); font-size:13px; text-align:center;">${o(`Xodimlar mavjud emas`)}</div>`:t.map(e=>`
                            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid var(--border-light);">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width:30px; height:30px; border-radius:50%; background:var(--bg-glass); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600;">${e.firstName?e.firstName[0]:`?`}</div>
                                    <div>
                                        <div style="font-size:13px; font-weight:500;">${u(e.firstName)} ${u(e.lastName)} <span style="color:var(--text-muted); font-weight:400;">(@${e.userName})</span></div>
                                        <div style="font-size:11px; color:var(--text-muted);">${e.phoneNumber||`—`}</div>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <div style="text-align:right; font-size:11px;">
                                        <div style="color:var(--text-muted);">${i(e.expirationDate)}</div>
                                    </div>
                                    <div class="actions">
                                        <button class="btn-icon btn-sm" onclick='openEditUserModal(${e.id}, ${JSON.stringify(JSON.stringify(e)).replace(/'/g,`&#39;`)})'>✏️</button>
                                        <button class="btn-icon danger btn-sm" onclick="deleteAdminUser(${e.id})">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        `).join(``)}
                </div>
            </div>
        </div>
    `}function _n(e){let t=(e||``).toLowerCase(),n=on.filter(e=>{let n=e.role===2?`super admin`:e.role===1?`admin`:e.role===3?`client`:`employee`;return e.firstName&&String(e.firstName).toLowerCase().includes(t)||e.lastName&&String(e.lastName).toLowerCase().includes(t)||e.userName&&String(e.userName).toLowerCase().includes(t)||e.phoneNumber&&String(e.phoneNumber).toLowerCase().includes(t)||n.includes(t)}),r=document.getElementById(`admin-user-search`),i=r?r.selectionStart:0;mn(n),setTimeout(()=>{let e=document.getElementById(`admin-user-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function vn(){openModal(o(`Yangi foydalanuvchi`),`
        <form onsubmit="createAdminUser(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Ism`)}</label>
                    <input type="text" id="add-firstName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>${o(`Familiya`)}</label>
                    <input type="text" id="add-lastName" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Foydalanuvchi nomi`)}</label>
                    <input type="text" id="add-userName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>${o(`Telefon`)}</label>
                    <input type="text" id="add-phone" class="form-control">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Parol`)}</label>
                    <input type="password" id="add-password" class="form-control" required minlength="6">
                </div>
                <div class="form-group">
                    <label>${o(`Rol`)}</label>
                    <select id="add-role" class="form-control">
                        <option value="1">${o(`Admin`)} (1)</option>
                        <option value="0">${o(`Employee`)} (0)</option>
                        <option value="2">${o(`Super Admin`)} (2)</option>
                        <option value="3">${o(`Client`)} (3)</option>
                    </select>
                </div>
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${o(`Profil rasmi`)}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewAdminImage(this, 'add-image', 'add-image-preview')">
                        <input type="hidden" id="add-image" value="">
                        <div id="add-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}async function yn(e){e.preventDefault();let t=s.getUser()||{},n={firstName:document.getElementById(`add-firstName`).value,lastName:document.getElementById(`add-lastName`).value,userName:document.getElementById(`add-userName`).value,phoneNumber:document.getElementById(`add-phone`).value,password:document.getElementById(`add-password`).value,brandName:t.brandName||``,brandImage:t.brandImage||``,image:document.getElementById(`add-image`).value},r=parseInt(document.getElementById(`add-role`).value);try{await s.post(`/users/employees`,{...n,role:r}),a(o(`Foydalanuvchi yaratildi`),`success`),closeModal(),sn()}catch(e){a(o(e.message),`error`)}}function bn(e,t){let n=JSON.parse(t),r=n.expirationDate?n.expirationDate.substring(0,10):``;openModal(o(`Foydalanuvchini tahrirlash`),`
        <form onsubmit="saveAdminUser(event, ${e})">
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Ism`)}</label>
                    <input type="text" id="edit-firstName" class="form-control" value="${u(n.firstName)}" required>
                </div>
                <div class="form-group">
                    <label>${o(`Familiya`)}</label>
                    <input type="text" id="edit-lastName" class="form-control" value="${u(n.lastName)}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Telefon`)}</label>
                    <input type="text" id="edit-phone" class="form-control" value="${n.phoneNumber||``}">
                </div>
                <div class="form-group">
                    <label>${o(`Rol`)}</label>
                    <select id="edit-role" class="form-control">
                        <option value="0" ${n.role===0?`selected`:``}>${o(`Employee`)} (0)</option>
                        <option value="1" ${n.role===1?`selected`:``}>${o(`Admin`)} (1)</option>
                        <option value="2" ${n.role===2?`selected`:``}>${o(`Super Admin`)} (2)</option>
                        <option value="3" ${n.role===3?`selected`:``}>${o(`Client`)} (3)</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Obuna muddati`)}</label>
                    <input type="date" id="edit-expiration" class="form-control" value="${r}">
                </div>
                <div class="form-group">
                    <label>${o(`Holati`)}</label>
                    <select id="edit-expired" class="form-control">
                        <option value="false" ${n.isExpired?``:`selected`}>${o(`Faol`)}</option>
                        <option value="true" ${n.isExpired?`selected`:``}>${o(`Muddati tugagan`)}</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; background:var(--bg-glass); padding:10px; border-radius:8px; border:1px solid var(--border);">
                    <input type="checkbox" id="edit-mp-enabled" ${n.isMarketplaceEnabled?`checked`:``}>
                    <span style="font-weight:600;">🛒 ${o(`Marketplace xizmatini yoqish`)}</span>
                </label>
            </div>
            <div class="form-group">
                <label>${o(`Yangi parol`)}</label>
                <input type="password" id="edit-password" class="form-control" placeholder="${o(`Yangi parol`)}">
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--border);">
                <div class="form-group">
                    <label>${o(`Profil rasmi`)}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewAdminImage(this, 'edit-image', 'edit-image-preview')">
                        <input type="hidden" id="edit-image" value="${u(n.image||``)}">
                        <div id="edit-image-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                            ${n.image?`<img src="${n.image}" style="width:100%; height:100%; object-fit:cover;">`:``}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>${o(`Brend nomi`)}</label>
                    <input type="text" id="edit-brandName" class="form-control" value="${u(n.brandName||``)}">
                </div>
                <div class="form-group">
                    <label>${o(`Brend rasmi`)}</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewAdminImage(this, 'edit-brandImage', 'admin-brand-preview')">
                        <input type="hidden" id="edit-brandImage" value="${u(n.brandImage||``)}">
                        <div id="admin-brand-preview" style="width:50px; height:50px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                            ${n.brandImage?`<img src="${n.brandImage}" style="width:100%; height:100%; object-fit:cover;">`:``}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}async function xn(e,t){e.preventDefault();let n={firstName:document.getElementById(`edit-firstName`).value,lastName:document.getElementById(`edit-lastName`).value,phoneNumber:document.getElementById(`edit-phone`).value,role:parseInt(document.getElementById(`edit-role`).value),isExpired:document.getElementById(`edit-expired`).value===`true`,isMarketplaceEnabled:document.getElementById(`edit-mp-enabled`).checked},r=document.getElementById(`edit-expiration`).value;r&&(n.expirationDate=new Date(r).toISOString()),n.brandName=document.getElementById(`edit-brandName`).value,n.brandImage=document.getElementById(`edit-brandImage`).value,n.image=document.getElementById(`edit-image`).value;let i=document.getElementById(`edit-password`).value;i&&(n.password=i);try{await s.put(`/admin/users/`+t,n),a(o(`Foydalanuvchi yangilandi`),`success`),closeModal(),sn()}catch(e){a(o(e.message),`error`)}}async function Sn(e,t,n){if(e.files&&e.files[0]){let r=new FormData;r.append(`file`,e.files[0]);try{let e=await s.post(`/upload`,r);e.url&&(document.getElementById(t).value=e.url,document.getElementById(n).innerHTML=`<img src="${e.url}" style="width:100%; height:100%; object-fit:cover;">`)}catch(e){a(e.message,`error`)}}}async function Cn(e){Sn(e,`edit-brandImage`,`admin-brand-preview`)}async function wn(e,t){try{await s.put(`/admin/users/`+e,{isMarketplaceEnabled:!t}),a(o(`Marketplace ruxsati o'zgartirildi`),`success`),sn()}catch(e){a(o(e.message),`error`)}}async function Tn(e){if(confirm(o(`Foydalanuvchini o'chirishni xohlaysizmi?`)))try{await s.delete(`/admin/users/`+e),a(o(`Foydalanuvchi o'chirildi`),`success`),sn()}catch(e){a(o(e.message),`error`)}}var q=1,En=[],Dn=[];async function On(){let e=document.getElementById(`admin-content`);e.innerHTML=`<div class="loader"></div>`;try{Dn=await s.get(`/admin/regions`)||[],kn(Dn)}catch(t){e.innerHTML=`<p class="error">${o(`Xatolik`)}: `+t.message+`</p>`}}function kn(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(En=e,q=1);let n=Math.ceil(En.length/10);q>n&&(q=n||1);let r=(q-1)*10,i=En.slice(r,r+10),a=i.length===0&&!t?`<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:i.map((e,t)=>`
            <tr>
                <td style="text-align:center">${r+t+1}</td>
                <td style="text-align:center">${u(e.name)}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick="openRegionModal(${e.id}, '${u(e.name)}')" title="${o(`Tahrirlash`)}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteRegion(${e.id})" title="${o(`O'chirish`)}">🗑️</button>
                </td>
            </tr>
        `).join(``);if(t){let e=document.querySelector(`#admin-content tbody`);e&&e.insertAdjacentHTML(`beforeend`,a);let t=document.getElementById(`adminRegionPage-sentinel`);t&&(t.outerHTML=renderPageControls(`adminRegionPage`,n,`renderAdminRegionsTable`)),setTimeout(()=>{attachInfiniteScroll(`adminRegionPage`,n,`renderAdminRegionsTable`)},100);return}let s=document.getElementById(`admin-content`);s.innerHTML=`
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${o(`Qidirish...`)}" id="admin-region-search" value="${u(document.getElementById(`admin-region-search`)?.value||``)}" oninput="filterAdminRegions(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick="openRegionModal()">${o(`Qo'shish`)}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 500px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);"><tr><th style="text-align:center; color: white; border: none;">№</th><th style="text-align:center; color: white; border: none;">${o(`Nomi`)}</th><th style="text-align:center; color: white; border: none;">${o(`Amallar`)}</th></tr></thead>
                    <tbody>
                        ${a}
                    </tbody>
                </table>
                ${renderPageControls(`adminRegionPage`,n,`renderAdminRegionsTable`)}
            </div>
        </div>
    `,setTimeout(()=>{attachInfiniteScroll(`adminRegionPage`,n,`renderAdminRegionsTable`)},100)}function An(e){let t=(e||``).toLowerCase(),n=Dn.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)),r=document.getElementById(`admin-region-search`),i=r?r.selectionStart:0;kn(n),setTimeout(()=>{let e=document.getElementById(`admin-region-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function jn(e,t){let n=!!e;openModal(o(n?`Viloyatni tahrirlash`:`Yangi viloyat`),`
        <form onsubmit="${n?`updateRegion(event, ${e})`:`createRegion(event)`}">
            <div class="form-group">
                <label>${o(`Nomi`)}</label>
                <input type="text" id="region-name" class="form-control" value="${t||``}" required>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}async function Mn(e){e.preventDefault();try{await s.post(`/admin/regions`,{name:document.getElementById(`region-name`).value}),a(o(`Viloyat yaratildi`),`success`),closeModal(),On()}catch(e){a(e.message,`error`)}}async function Nn(e,t){e.preventDefault();try{await s.put(`/admin/regions/`+t,{name:document.getElementById(`region-name`).value}),a(o(`Viloyat yangilandi`),`success`),closeModal(),On()}catch(e){a(e.message,`error`)}}async function Pn(e){if(confirm(o(`Viloyatni o'chirishni xohlaysizmi?`)))try{await s.delete(`/admin/regions/`+e),a(o(`Viloyat o'chirildi`),`success`),On()}catch(e){a(e.message,`error`)}}var J=1,Fn=[],In=[],Ln=[];async function Rn(){let e=document.getElementById(`admin-content`);e.innerHTML=`<div class="loader"></div>`;try{let[e,t]=await Promise.all([s.get(`/admin/districts`),s.get(`/admin/regions`)]);Ln=t||[],In=e||[],zn(In)}catch(t){e.innerHTML=`<p class="error">${o(`Xatolik`)}: `+t.message+`</p>`}}function zn(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(Fn=e,J=1);let n=Math.ceil(Fn.length/10);J>n&&(J=n||1);let r=(J-1)*10,i=Fn.slice(r,r+10),a=i.length===0&&!t?`<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:i.map((e,t)=>`
            <tr>
                <td style="text-align:center">${r+t+1}</td>
                <td style="text-align:center">${u(e.name)}</td>
                <td style="text-align:center">${u(e.regionName||``)}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick='openDistrictModal(${e.id}, "${u(e.name)}", ${e.regionId}, ${JSON.stringify(JSON.stringify(Ln)).replace(/'/g,`&#39;`)})' title="${o(`Tahrirlash`)}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteDistrict(${e.id})" title="${o(`O'chirish`)}">🗑️</button>
                </td>
            </tr>
        `).join(``);if(t){let e=document.querySelector(`#admin-content tbody`);e&&e.insertAdjacentHTML(`beforeend`,a);let t=document.getElementById(`adminDistrictPage-sentinel`);t&&(t.outerHTML=renderPageControls(`adminDistrictPage`,n,`renderAdminDistrictsTable`)),setTimeout(()=>{attachInfiniteScroll(`adminDistrictPage`,n,`renderAdminDistrictsTable`)},100);return}let s=document.getElementById(`admin-content`);s.innerHTML=`
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${o(`Qidirish...`)}" id="admin-district-search" value="${u(document.getElementById(`admin-district-search`)?.value||``)}" oninput="filterAdminDistricts(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick='openDistrictModal(null, null, null, ${JSON.stringify(JSON.stringify(Ln)).replace(/'/g,`&#39;`)})'>${o(`Qo'shish`)}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 600px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);"><tr><th style="text-align:center; color: white; border: none;">№</th><th style="text-align:center; color: white; border: none;">${o(`Nomi`)}</th><th style="text-align:center; color: white; border: none;">${o(`Viloyat`)}</th><th style="text-align:center; color: white; border: none;">${o(`Amallar`)}</th></tr></thead>
                    <tbody>
                        ${a}
                    </tbody>
                </table>
                ${renderPageControls(`adminDistrictPage`,n,`renderAdminDistrictsTable`)}
            </div>
        </div>
    `,setTimeout(()=>{attachInfiniteScroll(`adminDistrictPage`,n,`renderAdminDistrictsTable`)},100)}function Bn(e){let t=(e||``).toLowerCase(),n=In.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)||e.regionName&&String(e.regionName).toLowerCase().includes(t)),r=document.getElementById(`admin-district-search`),i=r?r.selectionStart:0;zn(n),setTimeout(()=>{let e=document.getElementById(`admin-district-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function Vn(e,t,n,r){let i=!!e,a=JSON.parse(r);openModal(o(i?`Tumanni tahrirlash`:`Yangi tuman`),`
        <form onsubmit="${i?`updateDistrict(event, ${e})`:`createDistrict(event)`}">
            <div class="form-group">
                <label>${o(`Nomi`)}</label>
                <input type="text" id="district-name" class="form-control" value="${t||``}" required>
            </div>
            <div class="form-group">
                <label>${o(`Viloyat`)}</label>
                <select id="district-regionId" class="form-control" required>
                    <option value="">${o(`Tanlang...`)}</option>
                    ${a.map(e=>`<option value="${e.id}" ${e.id===n?`selected`:``}>${u(e.name)}</option>`).join(``)}
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}async function Hn(e){e.preventDefault();try{await s.post(`/admin/districts`,{name:document.getElementById(`district-name`).value,regionId:parseInt(document.getElementById(`district-regionId`).value)}),a(o(`Tuman yaratildi`),`success`),closeModal(),Rn()}catch(e){a(e.message,`error`)}}async function Un(e,t){e.preventDefault();try{await s.put(`/admin/districts/`+t,{name:document.getElementById(`district-name`).value,regionId:parseInt(document.getElementById(`district-regionId`).value)}),a(o(`Tuman yangilandi`),`success`),closeModal(),Rn()}catch(e){a(e.message,`error`)}}async function Wn(e){if(confirm(o(`Tumanni o'chirishni xohlaysizmi?`)))try{await s.delete(`/admin/districts/`+e),a(o(`Tuman o'chirildi`),`success`),Rn()}catch(e){a(e.message,`error`)}}async function Gn(){let e=document.getElementById(`admin-content`);e.innerHTML=`<div class="loader"></div>`;try{Kn(await s.get(`/users/referred`)||[])}catch(t){e.innerHTML=`<p class="error">${o(`Xatolik`)}: `+t.message+`</p>`}}function Kn(e){let t=document.getElementById(`admin-content`),n=s.getUser()||{},r=n.userName?n.userName.toUpperCase():`ADMIN`,a=e.length===0?`<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${o(`Hali hech kim taklif qilinmagan`)}</td></tr>`:e.map((e,t)=>{let n=e.role===2?`Super Admin`:e.role===1?`Admin`:e.role===3?`Client`:`Employee`;return`
                <tr>
                    <td style="text-align:center">${t+1}</td>
                    <td>${u(e.firstName)} ${u(e.lastName)}</td>
                    <td>${u(e.userName)}</td>
                    <td style="text-align:center"><span class="badge ${e.role===1?`badge-warning`:``}">${o(n)}</span></td>
                    <td style="text-align:center">${i(e.createdAt)}</td>
                </tr>
            `}).join(``);t.innerHTML=`
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; margin-top:20px;">
            <div class="card" style="padding:20px; text-align:center; height:fit-content;">
                <div class="icon" style="font-size:40px; margin-bottom:15px;">🎁</div>
                <h4 style="margin-bottom:10px;">${o(`Mening taklif kodim`)}</h4>
                <div style="font-size:24px; font-weight:800; color:var(--primary); background:var(--bg-secondary); padding:15px; border-radius:12px; border:2px dashed var(--primary); margin-bottom:15px; letter-spacing:2px;">
                    ${r}
                </div>
                <button class="btn btn-primary" style="width:100%" onclick="copyToClipboard('${r}')">📋 ${o(`Nusxa olish`)}</button>
                <p style="font-size:12px; color:var(--text-muted); margin-top:15px;">
                    ${o(`Ushbu kodni yangi foydalanuvchilarga yuboring. Ular ro'yxatdan o'tayotganda ushbu kodni kiritsalar, sizga biriktiriladi.`)}
                </p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h4 style="margin:0">${o(`Taklif qilinganlar`)}</h4>
                    <span class="badge badge-info">${e.length}</span>
                </div>
                <div class="table-container">
                    <table style="width:100%">
                        <thead>
                            <tr>
                                <th style="text-align:center">№</th>
                                <th>${o(`Ism`)}</th>
                                <th>${o(`Foydalanuvchi nomi`)}</th>
                                <th style="text-align:center">${o(`Rol`)}</th>
                                <th style="text-align:center">${o(`Sana`)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${a}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `}var Y=1,qn=[],Jn=[],Yn=[];async function X(){let e=document.getElementById(`admin-content`);e.innerHTML=`<div class="loader"></div>`;try{let[e,t]=await Promise.all([s.get(`/admin/markets`),s.get(`/admin/districts`)]);Yn=t||[],Jn=e||[],Xn(Jn)}catch(t){e.innerHTML=`<p class="error">${o(`Xatolik`)}: `+t.message+`</p>`}}function Xn(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(qn=e,Y=1);let n=Math.ceil(qn.length/10);Y>n&&(Y=n||1);let r=(Y-1)*10,i=qn.slice(r,r+10),a=i.length===0&&!t?`<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:i.map((e,t)=>`
            <tr>
                <td style="text-align:center">${r+t+1}</td>
                <td style="text-align:center">${u(e.name)}</td>
                <td style="text-align:center">${u(e.address||`—`)}</td>
                <td style="text-align:center">${u(e.districtName||``)}</td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick='openMarketModal(${e.id}, "${u(e.name)}", "${u(e.address||``)}", ${e.districtId}, ${JSON.stringify(JSON.stringify(Yn)).replace(/'/g,`&#39;`)})' title="${o(`Tahrirlash`)}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteMarket(${e.id})" title="${o(`O'chirish`)}">🗑️</button>
                </td>
            </tr>
        `).join(``);if(t){let e=document.querySelector(`#admin-content tbody`);e&&e.insertAdjacentHTML(`beforeend`,a);let t=document.getElementById(`adminMarketPage-sentinel`);t&&(t.outerHTML=renderPageControls(`adminMarketPage`,n,`renderAdminMarketsTable`)),setTimeout(()=>{attachInfiniteScroll(`adminMarketPage`,n,`renderAdminMarketsTable`)},100);return}let s=document.getElementById(`admin-content`);s.innerHTML=`
        <div class="card" style="margin-top:20px">
            <div class="card-header">
              <div class="toolbar" style="width:100%">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" placeholder="${o(`Qidirish...`)}" id="admin-market-search" value="${u(document.getElementById(`admin-market-search`)?.value||``)}" oninput="filterAdminMarkets(this.value)">
                </div>
                <button class="btn btn-primary btn-sm" onclick='openMarketModal(null, null, null, null, ${JSON.stringify(JSON.stringify(Yn)).replace(/'/g,`&#39;`)})'>${o(`Qo'shish`)}</button>
              </div>
            </div>
            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 700px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);"><tr><th style="text-align:center; color: white; border: none;">№</th><th style="text-align:center; color: white; border: none;">${o(`Nomi`)}</th><th style="text-align:center; color: white; border: none;">${o(`Manzil`)}</th><th style="text-align:center; color: white; border: none;">${o(`Tuman`)}</th><th style="text-align:center; color: white; border: none;">${o(`Amallar`)}</th></tr></thead>
                    <tbody>
                        ${a}
                    </tbody>
                </table>
                ${renderPageControls(`adminMarketPage`,n,`renderAdminMarketsTable`)}
            </div>
        </div>
    `,setTimeout(()=>{attachInfiniteScroll(`adminMarketPage`,n,`renderAdminMarketsTable`)},100)}function Zn(e){let t=(e||``).toLowerCase(),n=Jn.filter(e=>e.name&&String(e.name).toLowerCase().includes(t)||e.address&&String(e.address).toLowerCase().includes(t)||e.districtName&&String(e.districtName).toLowerCase().includes(t)),r=document.getElementById(`admin-market-search`),i=r?r.selectionStart:0;Xn(n),setTimeout(()=>{let e=document.getElementById(`admin-market-search`);if(e){e.focus();try{e.setSelectionRange(i,i)}catch{}}},0)}function Qn(e,t,n,r,i){let a=!!e,s=JSON.parse(i);openModal(o(a?`Bozorni tahrirlash`:`Yangi bozor`),`
        <form onsubmit="${a?`updateMarket(event, ${e})`:`createMarket(event)`}">
            <div class="form-group">
                <label>${o(`Nomi`)}</label>
                <input type="text" id="market-name" class="form-control" value="${t||``}" required>
            </div>
            <div class="form-group">
                <label>${o(`Manzil`)}</label>
                <input type="text" id="market-address" class="form-control" value="${n||``}">
            </div>
            <div class="form-group">
                <label>${o(`Tuman`)}</label>
                <select id="market-districtId" class="form-control" required>
                    <option value="">${o(`Tanlang...`)}</option>
                    ${s.map(e=>`<option value="${e.id}" ${e.id===r?`selected`:``}>${u(e.name)} (${u(e.regionName||``)})</option>`).join(``)}
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}async function $n(e){e.preventDefault();try{await s.post(`/admin/markets`,{name:document.getElementById(`market-name`).value,address:document.getElementById(`market-address`).value,districtId:parseInt(document.getElementById(`market-districtId`).value)}),a(o(`Bozor yaratildi`),`success`),closeModal(),X()}catch(e){a(e.message,`error`)}}async function er(e,t){e.preventDefault();try{await s.put(`/admin/markets/`+t,{name:document.getElementById(`market-name`).value,address:document.getElementById(`market-address`).value,districtId:parseInt(document.getElementById(`market-districtId`).value)}),a(o(`Bozor yangilandi`),`success`),closeModal(),X()}catch(e){a(e.message,`error`)}}async function tr(e){if(confirm(o(`Bozorni o'chirishni xohlaysizmi?`)))try{await s.delete(`/admin/markets/`+e),a(o(`Bozor o'chirildi`),`success`),X()}catch(e){a(e.message,`error`)}}async function nr(){let e=document.getElementById(`admin-content`);e.innerHTML=`<div class="loader"></div>`;try{let[t,n]=await Promise.all([s.get(`/admin/marketplace/products`),s.get(`/admin/marketplace/categories`)]);e.innerHTML=`
            <!-- Categories Card -->
            <div class="card" style="margin-top:20px">
                <div class="card-header">
                    <h3>🛒 ${o(`Marketplace kategoriyalari`)}</h3>
                    <button class="btn btn-primary btn-sm" onclick="openMpCategoryModal()">${o(`Qo'shish`)}</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr><th style="text-align:center">№</th><th style="text-align:center">${o(`Nomi`)}</th><th style="text-align:center">${o(`Amallar`)}</th></tr></thead>
                        <tbody>
                            ${(n||[]).length===0?`<tr><td colspan="3" style="text-align:center">${o(`Ma'lumot yo'q`)}</td></tr>`:n.map(e=>`
                                <tr>
                                    <td style="text-align:center">${e.id}</td>
                                    <td style="text-align:center">${u(e.name)}</td>
                                    <td class="actions" style="justify-content: center;">
                                        <button class="btn-icon" onclick='openMpCategoryModal(${e.id}, "${u(e.name)}")'>✏️</button>
                                        <button class="btn-icon danger" onclick="deleteMpCategory(${e.id})">🗑️</button>
                                    </td>
                                </tr>
                            `).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Products Card -->
            <div class="card" style="margin-top:20px">
                <div class="card-header">
                    <h3>📦 ${o(`Marketplace mahsulotlari`)}</h3>
                    <button class="btn btn-primary btn-sm" onclick="openCreateMpProductModal()">${o(`Qo'shish`)}</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align:center">№</th>
                                <th style="text-align:center">${o(`Biznes`)}</th>
                                <th style="text-align:center">${o(`Nomi`)}</th>
                                <th style="text-align:center">${o(`Narxi`)}</th>
                                <th style="text-align:center">${o(`Soni`)}</th>
                                <th style="text-align:center">${o(`Holati`)}</th>
                                <th style="text-align:center">${o(`Amallar`)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(t||[]).length===0?`<tr><td colspan="7" style="text-align:center">${o(`Ma'lumot yo'q`)}</td></tr>`:t.map(e=>`
                                <tr>
                                    <td style="text-align:center">${e.id}</td>
                                    <td>${u(e.businessName||`—`)}</td>
                                    <td style="text-align:center">${u(e.name)}</td>
                                    <td style="text-align:center">${e.price.toLocaleString()}</td>
                                    <td style="text-align:center">${e.quantity}</td>
                                    <td style="text-align:center"><span class="badge ${e.isVisible?`badge-success`:`badge-danger`}">${e.isVisible?o(`Ko'rinadi`):o(`Berkitilgan`)}</span></td>
                                    <td class="actions" style="justify-content:center">
                                        <button class="btn-icon" onclick="toggleMpProductVisibility(${e.id}, ${e.isVisible})">👁️</button>
                                        <button class="btn-icon danger" onclick="deleteMpProduct(${e.id})">🗑️</button>
                                    </td>
                                </tr>
                            `).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="error">${o(`Xatolik`)}: ${o(t.message)}</p>`}}function rr(e,t){let n=!!e;openModal(o(n?`Kategoriyani tahrirlash`:`Yangi kategoriya`),`
        <form onsubmit="submitMpCategory(event, ${e||`null`})">
            <div class="form-group">
                <label>${o(`Kategoriya nomi`)}</label>
                <input type="text" id="mp-cat-name" class="form-control" value="${t||``}" required>
            </div>
            <div class="form-group">
                <label>${o(`Rasm`)}</label>
                <input type="file" id="mp-cat-image" class="form-control" accept="image/*">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}async function ir(e,t){e.preventDefault();let n=document.getElementById(`mp-cat-name`).value,r=document.getElementById(`mp-cat-image`).files[0];try{let e=``;if(r){let t=new FormData;t.append(`file`,r),e=(await s.post(`/upload`,t)).url}let i={name:n};e&&(i.image=e),t?(await s.put(`/admin/marketplace/categories/${t}`,i),a(o(`Yangilandi`),`success`)):(await s.post(`/admin/marketplace/categories`,i),a(o(`Yaratildi`),`success`)),closeModal(),window.currentPage===`mp-categories`?pr():window.currentPage===`mp-products`?gr():nn()}catch(e){a(e.message,`error`)}}async function ar(e){if(confirm(o(`O'chirishni xohlaysizmi?`)))try{await s.delete(`/admin/marketplace/categories/${e}`),a(o(`O'chirildi`),`success`),pr()}catch(e){a(e.message,`error`)}}async function or(e,t){try{await s.put(`/admin/marketplace/products/${e}`,{isVisible:!t}),a(o(`Muvaffaqiyatli`),`success`),gr()}catch(e){a(e.message,`error`)}}async function sr(e){if(confirm(o(`O'chirishni xohlaysizmi?`)))try{await s.delete(`/admin/marketplace/products/${e}`),a(o(`O'chirildi`),`success`),gr()}catch(e){a(e.message,`error`)}}async function cr(){openModal(o(`Marketplace'ga mahsulot qo'shish`),`
        <div id="mp-create-step1">
            <div class="form-group">
                <label>${o(`Biznesni tanlang`)}</label>
                <select id="mp-biz-id" class="form-control" onchange="loadMpCategories(this.value)">
                    <option value="">${o(`Tanlang...`)}</option>
                </select>
            </div>
            <div class="form-group" id="mp-cat-container" style="display:none">
                <label>${o(`Marketplace Kategoriyasi`)}</label>
                <select id="mp-category-id" class="form-control" onchange="showMpForm()">
                    <option value="">${o(`Tanlang...`)}</option>
                </select>
            </div>
            
            <form id="mp-prod-form" style="display:none" onsubmit="submitMpProduct(event)">
                <div class="form-group">
                    <label>${o(`Marketplace Nomi`)}</label>
                    <input type="text" id="mp-name" class="form-control" required placeholder="${o(`Masalan`)}: Samsung Galaxy S24">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>${o(`Narxi`)}</label>
                        <input type="number" id="mp-price" class="form-control" required placeholder="0">
                    </div>
                    <div class="form-group">
                        <label>${o(`Soni`)}</label>
                        <input type="number" id="mp-qty" class="form-control" required placeholder="1">
                    </div>
                </div>
                <div class="form-group">
                    <label>${o(`Qisqa tavsif`)}</label>
                    <input type="text" id="mp-short-desc" class="form-control" placeholder="${o(`Mahsulot haqida qisqacha...`)}">
                </div>
                <div class="form-group">
                    <label>${o(`Rasm`)}</label>
                    <input type="file" id="mp-image" class="form-control" accept="image/*">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                    <button type="submit" class="btn btn-primary">${o(`Qo'shish`)}</button>
                </div>
            </form>

            <div id="mp-initial-footer" class="modal-footer" style="margin-top:20px;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">${o(`Bekor qilish`)}</button>
            </div>
        </div>
    `);try{let e=s.getUser(),t=e&&e.role===2?`/businesses`:`/businesses/my`,n=await s.get(t),r=document.getElementById(`mp-biz-id`);(n||[]).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)})}catch(e){a(o(e.message),`error`)}}async function lr(e){if(e)try{let e=await s.get(`/marketplace/categories`),t=document.getElementById(`mp-category-id`);t.innerHTML=`<option value="">${o(`Tanlang...`)}</option>`,(e||[]).forEach(e=>{let n=document.createElement(`option`);n.value=e.id,n.textContent=e.name,t.appendChild(n)}),document.getElementById(`mp-cat-container`).style.display=`block`,document.getElementById(`mp-prod-form`).style.display=`none`}catch(e){a(o(e.message),`error`)}}function ur(){document.getElementById(`mp-category-id`).value&&(document.getElementById(`mp-prod-form`).style.display=`block`,document.getElementById(`mp-initial-footer`).style.display=`none`)}async function dr(e){e.preventDefault();let t=document.getElementById(`mp-image`).files[0];try{let e=``;if(t){let n=new FormData;n.append(`file`,t),e=(await s.post(`/upload`,n)).url}let n={businessId:document.getElementById(`mp-biz-id`).value?parseInt(document.getElementById(`mp-biz-id`).value):null,marketplaceCategoryId:document.getElementById(`mp-category-id`).value?parseInt(document.getElementById(`mp-category-id`).value):null,name:document.getElementById(`mp-name`).value,price:parseFloat(document.getElementById(`mp-price`).value),quantity:parseInt(document.getElementById(`mp-qty`).value),shortDescription:document.getElementById(`mp-short-desc`).value,images:e};await s.post(`/admin/marketplace/products`,n),a(o(`Qo'shildi`),`success`),closeModal(),gr()}catch(e){a(e.message,`error`)}}async function fr(){let e=document.getElementById(`page-content`);e.innerHTML=`<div class="loader"></div>`;try{let[t,n]=await Promise.all([s.get(`/admin/marketplace/products`),s.get(`/admin/marketplace/categories`)]),r=(t||[]).length,i=(n||[]).length,a=(t||[]).filter(e=>e.isVisible).length,c=(t||[]).reduce((e,t)=>e+t.quantity,0);e.innerHTML=`
            <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-bottom:30px;">
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${o(`Jami mahsulotlar`)}</div>
                    <div style="font-size:32px; font-weight:800; color:var(--primary);">${r}</div>
                </div>
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${o(`Faol mahsulotlar`)}</div>
                    <div style="font-size:32px; font-weight:800; color:#10b981;">${a}</div>
                </div>
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${o(`Kategoriyalar soni`)}</div>
                    <div style="font-size:32px; font-weight:800; color:var(--warning);">${i}</div>
                </div>
                <div class="stat-card" style="background:var(--bg-glass); padding:24px; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <div style="font-size:14px; color:var(--text-muted); margin-bottom:8px;">${o(`Jami qoldiq`)}</div>
                    <div style="font-size:32px; font-weight:800; color:var(--text-primary);">${c}</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>📊 ${o(`Marketplace tahlili`)}</h3>
                </div>
                <div style="padding:40px; text-align:center; color:var(--text-muted);">
                    <div style="font-size:48px; margin-bottom:20px;">📈</div>
                    <p>${o(`Batafsil grafiklar va hisobotlar tez kunda qo'shiladi.`)}</p>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<p class="error">${o(t.message)}</p>`}}async function pr(){let e=document.getElementById(`page-content`);e.innerHTML=`<div class="loader"></div>`;try{cn=await s.get(`/admin/marketplace/categories`)||[],W=1,mr(cn)}catch(t){e.innerHTML=`<p class="error">${o(t.message)}</p>`}}function mr(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(ln=e,W=1);let n=document.getElementById(`page-content`),r=Math.ceil(ln.length/10);W>r&&(W=r||1);let i=(W-1)*10,a=ln.slice(i,i+10),s=a.length===0&&!t?`<tr><td colspan="3" style="text-align:center; padding:40px; color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:a.map((e,t)=>`
            <tr>
                <td style="text-align:center; font-weight:600;">${i+t+1}</td>
                <td style="text-align:center">${u(e.name)}</td>
                <td class="actions" style="justify-content: center;">
                    <button class="btn-icon" onclick='openMpCategoryModal(${e.id}, "${u(e.name)}")' title="${o(`Tahrirlash`)}">✏️</button>
                    <button class="btn-icon danger" onclick="deleteMpCategory(${e.id})" title="${o(`O'chirish`)}">🗑️</button>
                </td>
            </tr>
        `).join(``);if(t){let e=document.querySelector(`#page-content tbody`);e&&e.insertAdjacentHTML(`beforeend`,s);let t=document.getElementById(`mpCategoryPage-sentinel`);t&&(t.outerHTML=renderPageControls(`mpCategoryPage`,r,`renderMpCategoriesTable`)),setTimeout(()=>{attachInfiniteScroll(`mpCategoryPage`,r,`renderMpCategoriesTable`)},100);return}n.innerHTML=`
        <div class="card">
            <div class="card-header">
                <h3 style="margin:0;">📁 ${o(`Marketplace Kategoriyalari`)}</h3>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-primary btn-sm" onclick="openMpCategoryModal()">${o(`Qo'shish`)}</button>
                </div>
            </div>
            
            <div class="search-container" style="padding:15px 24px;">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="mp-category-search" class="form-control search-input" 
                        placeholder="${o(`Qidirish...`)}" oninput="filterMpCategories(this.value)">
                </div>
            </div>

            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 800px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Nomi`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Amallar`)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s}
                    </tbody>
                </table>
                ${renderPageControls(`mpCategoryPage`,r,`renderMpCategoriesTable`)}
            </div>
        </div>
    `,typeof lucide<`u`&&lucide.createIcons(),setTimeout(()=>{attachInfiniteScroll(`mpCategoryPage`,r,`renderMpCategoriesTable`)},100)}function hr(e){let t=e.toLowerCase(),n=cn.filter(e=>e.name.toLowerCase().includes(t));W=1,mr(n),setTimeout(()=>{let t=document.getElementById(`mp-category-search`);t&&(t.focus(),t.value=e)},0)}async function gr(){let e=document.getElementById(`page-content`);e.innerHTML=`<div class="loader"></div>`;try{let e=getSelectedBusinessId();un=await s.get(`/admin/marketplace/products?businessId=${e}`)||[],G=1,_r(un)}catch(t){e.innerHTML=`<p class="error">${o(t.message)}</p>`}}function _r(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(dn=e,G=1);let n=document.getElementById(`page-content`),r=Math.ceil(dn.length/10);G>r&&(G=r||1);let i=(G-1)*10,a=dn.slice(i,i+10),s=a.length===0&&!t?`<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">${o(`Ma'lumot yo'q`)}</td></tr>`:a.map((e,t)=>`
            <tr>
                <td style="text-align:center; font-weight:600;">${i+t+1}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${e.images?`<img src="${e.images}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`:`<div style="width:40px;height:40px;border-radius:8px;background:var(--bg-glass);display:flex;align-items:center;justify-content:center;font-size:18px;">📦</div>`}
                        <div>
                            <div style="font-weight:600;">${u(e.name)}</div>
                            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${u(e.shortDescription||``)}</div>
                        </div>
                    </div>
                </td>
                <td style="text-align:center">${u(e.businessName)}</td>
                <td style="text-align:center">${u(e.categoryName||`—`)}</td>
                <td style="text-align:center; font-weight:700;">${e.price.toLocaleString()}</td>
                <td style="text-align:center">
                   <span style="background:var(--bg-glass); padding:2px 8px; border-radius:12px; font-weight:700;">${e.quantity}</span>
                </td>
                <td style="text-align:center">
                    <span class="badge ${e.isVisible?`badge-success`:`badge-danger`}" style="cursor:pointer" onclick="toggleMpProductVisibility(${e.id}, ${e.isVisible})">
                        ${e.isVisible?o(`Faol`):o(`Yopiq`)}
                    </span>
                </td>
                <td class="actions" style="justify-content:center">
                    <button class="btn-icon" onclick="toggleMpProductVisibility(${e.id}, ${e.isVisible})" title="${e.isVisible?o(`Yashirish`):o(`Ko'rsatish`)}">${e.isVisible?`👁️`:`🚫`}</button>
                    <button class="btn-icon danger" onclick="deleteMpProduct(${e.id})" title="${o(`O'chirish`)}">🗑️</button>
                </td>
            </tr>
        `).join(``);if(t){let e=document.querySelector(`#page-content tbody`);e&&e.insertAdjacentHTML(`beforeend`,s);let t=document.getElementById(`mpProductPage-sentinel`);t&&(t.outerHTML=renderPageControls(`mpProductPage`,r,`renderMpProductsTable`)),setTimeout(()=>{attachInfiniteScroll(`mpProductPage`,r,`renderMpProductsTable`)},100);return}n.innerHTML=`
        <div class="card">
            <div class="card-header">
                <h3 style="margin:0;">📦 ${o(`Marketplace mahsulotlari`)}</h3>
                <button class="btn btn-primary btn-sm" onclick="openCreateMpProductModal()">${o(`Qo'shish`)}</button>
            </div>

            <div class="search-container" style="padding:15px 24px;">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="mp-product-search" class="form-control search-input" 
                        placeholder="${o(`Qidirish...`)}" oninput="filterMpProducts(this.value)">
                </div>
            </div>

            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 1000px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Biznes`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Mahsulot`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Narxi`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Qoldiq`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Holati`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Amallar`)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s}
                    </tbody>
                </table>
                ${renderPageControls(`mpProductPage`,r,`renderMpProductsTable`)}
            </div>
        </div>
    `,typeof lucide<`u`&&lucide.createIcons(),setTimeout(()=>{attachInfiniteScroll(`mpProductPage`,r,`renderMpProductsTable`)},100)}function vr(e){let t=e.toLowerCase(),n=un.filter(e=>e.name.toLowerCase().includes(t)||e.businessName&&e.businessName.toLowerCase().includes(t)||e.shortDescription&&e.shortDescription.toLowerCase().includes(t));G=1,_r(n),setTimeout(()=>{let t=document.getElementById(`mp-product-search`);t&&(t.focus(),t.value=e)},0)}async function yr(){let e=document.getElementById(`page-content`);e.innerHTML=`<div class="loader"></div>`;try{let e=getSelectedBusinessId();fn=(await s.get(`/admin/marketplace/orders?businessId=${e}&status=CONFIRMED,DELIVERED`)||[]).map(e=>({id:e.id,createdAt:e.createdAt,customerName:`${e.customer?.firstName||``} ${e.customer?.lastName||``}`,productNames:(e.items||[]).map(e=>e.product?.name).join(`, `),total:e.totalSum,status:e.status})),K=1,br(fn)}catch(t){e.innerHTML=`<p class="error">${o(t.message)}</p>`}}function br(e,t=!1){e===!0&&(t=!0,e=null),Array.isArray(e)&&(pn=e,K=1);let n=document.getElementById(`page-content`),r=Math.ceil(pn.length/10);K>r&&(K=r||1);let i=(K-1)*10,a=pn.slice(i,i+10),s=a.length===0&&!t?`
        <tr>
            <td colspan="6" style="text-align:center; padding:100px; color:var(--text-muted);">
                <div style="font-size:48px; margin-bottom:15px;">📦</div>
                <h4>${o(`Hozircha sotuvlar yo'q`)}</h4>
                <p>${o(`Marketplace orqali buyurtmalar kelib tushganda bu erda paydo bo'ladi.`)}</p>
            </td>
        </tr>
    `:a.map((e,t)=>`
        <tr>
            <td style="text-align:center; font-weight:600;">${i+t+1}</td>
            <td style="text-align:center">${formatDateTime(e.createdAt)}</td>
            <td>${u(e.customerName)}</td>
            <td>${u(e.productNames)}</td>
            <td style="text-align:center; font-weight:700;">${e.total.toLocaleString()} UZS</td>
            <td style="text-align:center">
                <span class="badge badge-info">${o(e.status||`Kutilmoqda`)}</span>
            </td>
        </tr>
    `).join(``);if(t){let e=document.querySelector(`#page-content tbody`);e&&e.insertAdjacentHTML(`beforeend`,s);let t=document.getElementById(`mpSalesPage-sentinel`);t&&(t.outerHTML=renderPageControls(`mpSalesPage`,r,`renderMpSalesTable`)),setTimeout(()=>{attachInfiniteScroll(`mpSalesPage`,r,`renderMpSalesTable`)},100);return}n.innerHTML=`
        <div class="card">
            <div class="card-header">
                <h3 style="margin:0;">💰 ${o(`Marketplace sotuvlari`)}</h3>
            </div>

            <div class="search-container" style="padding:15px 24px;">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input type="text" id="mp-sales-search" class="form-control search-input" 
                        placeholder="${o(`Qidirish...`)}" oninput="filterMpSales(this.value)">
                </div>
            </div>

            <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                <table style="min-width: 1000px; white-space: nowrap; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                        <tr>
                            <th style="text-align:center; color: white; border: none;">№</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Sana`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Mijoz`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Mahsulot`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Summa`)}</th>
                            <th style="text-align:center; color: white; border: none;">${o(`Holati`)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s}
                    </tbody>
                </table>
                ${renderPageControls(`mpSalesPage`,r,`renderMpSalesTable`)}
            </div>
        </div>
    `,typeof lucide<`u`&&lucide.createIcons(),setTimeout(()=>{attachInfiniteScroll(`mpSalesPage`,r,`renderMpSalesTable`)},100)}function xr(e){let t=e.toLowerCase(),n=fn.filter(e=>e.customerName&&e.customerName.toLowerCase().includes(t)||e.productNames&&e.productNames.toLowerCase().includes(t));K=1,br(n),setTimeout(()=>{let t=document.getElementById(`mp-sales-search`);t&&(t.focus(),t.value=e)},0)}window.renderMpStats=fr,window.renderMpCategories=pr,window.renderMpProducts=gr,window.renderMpSales=yr,window.renderMpSalesTable=br,window.filterMpSales=xr,window.renderMpCategoriesTable=mr,window.filterMpCategories=hr,window.renderMpProductsTable=_r,window.filterMpProducts=vr,Object.defineProperty(window,`mpCategoryPage`,{get:()=>W,set:e=>W=e}),Object.defineProperty(window,`mpProductPage`,{get:()=>G,set:e=>G=e}),Object.defineProperty(window,`mpSalesPage`,{get:()=>K,set:e=>K=e}),window.renderAdmin=nn,window.activeAdminTab=tn,window.showAdminTab=rn,window.loadAdminMarketplace=nr,window.openMpCategoryModal=rr,window.submitMpCategory=ir,window.deleteMpCategory=ar,window.openCreateMpProductModal=cr,window.loadMpCategories=lr,window.showMpForm=ur,window.submitMpProduct=dr,window.toggleMpProductVisibility=or,window.deleteMpProduct=sr,window.openEditUserModal=bn,window.saveAdminUser=xn,window.deleteAdminUser=Tn,window.renderAdminUsersTable=mn,window.filterAdminUsers=_n,window.openCreateUserModal=vn,window.createAdminUser=yn,window.previewAdminBrandImage=Cn,window.loadAdminReferrals=Gn,window.renderAdminReferrals=Kn,Object.defineProperty(window,`adminUserPage`,{get:()=>an,set:e=>an=e}),Object.defineProperty(window,`adminRegionPage`,{get:()=>q,set:e=>q=e}),Object.defineProperty(window,`adminDistrictPage`,{get:()=>J,set:e=>J=e}),Object.defineProperty(window,`adminMarketPage`,{get:()=>Y,set:e=>Y=e}),window.loadAdminRegions=On,window.renderAdminRegionsTable=kn,window.filterAdminRegions=An,window.openRegionModal=jn,window.createRegion=Mn,window.updateRegion=Nn,window.deleteRegion=Pn,window.loadAdminDistricts=Rn,window.renderAdminDistrictsTable=zn,window.filterAdminDistricts=Bn,window.openDistrictModal=Vn,window.createDistrict=Hn,window.updateDistrict=Un,window.deleteDistrict=Wn,window.loadAdminMarkets=X,window.renderAdminMarketsTable=Xn,window.filterAdminMarkets=Zn,window.openMarketModal=Qn,window.createMarket=$n,window.updateMarket=er,window.deleteMarket=tr;async function Sr(){let e=document.getElementById(`page-content`);e.innerHTML=`<div class="loader"></div>`;try{let t=getSelectedBusinessId(),n=await s.get(`/admin/marketplace/orders?businessId=${t}`);e.innerHTML=`
            <div class="card">
                <div class="card-header">
                    <h3>📦 ${o(`Marketplace buyurtmalari`)}</h3>
                </div>
                <div class="table-container" style="overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 250px);">
                    <table style="min-width: 1200px; white-space: nowrap; width: 100%;">
                        <thead style="position: sticky; top: 0; z-index: 10; background: linear-gradient(135deg, #10b981, #059669);">
                            <tr>
                                <th style="text-align:center; color: white; border: none;">№</th>
                                <th style="text-align:center; color: white; border: none;">${o(`Mijoz`)}</th>
                                <th style="text-align:center; color: white; border: none;">${o(`Mahsulotlar`)}</th>
                                <th style="text-align:center; color: white; border: none;">${o(`Summa`)}</th>
                                <th style="text-align:center; color: white; border: none;">${o(`Sana`)}</th>
                                <th style="text-align:center; color: white; border: none;">${o(`Holati`)}</th>
                                <th style="text-align:center; color: white; border: none;">${o(`Amallar`)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(n||[]).length===0?`<tr><td colspan="7" style="text-align:center; padding: 20px;">${o(`Hozircha buyurtmalar yo'q`)}</td></tr>`:n.map(e=>`
                                <tr>
                                    <td style="text-align:center; font-weight:600;">#${e.id}</td>
                                    <td>
                                        <div style="font-weight:600;">${u(e.customer?.firstName)} ${u(e.customer?.lastName)}</div>
                                        <div style="font-size:12px; color:var(--text-muted);">${u(e.customer?.phoneNumber)}</div>
                                    </td>
                                    <td>
                                        <div style="font-size:13px;">
                                            ${(e.items||[]).map(e=>`
                                                <div style="margin-bottom:4px; display:flex; justify-content:space-between; gap:10px;">
                                                    <span>• ${u(e.product?.name)} <small>(${e.quantity} ta)</small></span>
                                                    <span style="color:var(--text-muted);">${(e.price*e.quantity).toLocaleString()}</span>
                                                </div>
                                            `).join(``)}
                                        </div>
                                    </td>
                                    <td style="text-align:center; font-weight:700; color:var(--primary);">${e.totalSum.toLocaleString()}</td>
                                    <td style="text-align:center; font-size:13px;">${new Date(e.createdAt).toLocaleString()}</td>
                                    <td style="text-align:center">
                                        <span class="badge ${e.status===`PENDING`?`badge-warning`:e.status===`CONFIRMED`?`badge-success`:`badge-danger`}">
                                            ${o(e.status)}
                                        </span>
                                    </td>
                                    <td class="actions" style="justify-content:center">
                                        ${e.status===`PENDING`?`
                                            <button class="btn btn-primary btn-sm" onclick="updateMpOrderStatus(${e.id}, 'CONFIRMED')" title="${o(`Tasdiqlash`)}">✓</button>
                                            <button class="btn btn-danger btn-sm" onclick="updateMpOrderStatus(${e.id}, 'REJECTED')" title="${o(`Rad etish`)}">✕</button>
                                        `:`—`}
                                    </td>
                                </tr>
                            `).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>
        `}catch(t){e.innerHTML=`<div class="error-state">${o(t.message)}</div>`}}async function Cr(e,t){if(confirm(o(`Buyurtmani ${t===`CONFIRMED`?`tasdiqlashni`:`rad etishni`} xohlaysizmi?`)))try{await s.put(`/admin/marketplace/orders/${e}/status`,{status:t}),a(o(`Holat yangilandi`),`success`),Sr()}catch(e){a(o(e.message),`error`)}}window.renderMpOrders=Sr,window.updateMpOrderStatus=Cr,window.toggleMarketplaceAccess=wn,(function(){s.getToken()||(window.location.href=`index.html`)})();var wr=`dashboard`,Tr=[],Er=[],Dr=`line`;document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`lang-selector-app`);e&&(e.value=l);let t=document.getElementById(`lang-selector-sidebar`);t&&(t.value=l),Or(),kr().then(()=>{typeof translateDOM==`function`&&translateDOM(),Z(getSelectedPage())});let n=e=>{let t=e.target;(t.tagName===`INPUT`||t.tagName===`TEXTAREA`)&&(t.closest(`#modal-overlay`)||t.closest(`.modal`))&&setTimeout(()=>{try{typeof t.select==`function`&&t.select()}catch{}},10)};document.addEventListener(`focusin`,n),document.addEventListener(`click`,e=>{(e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`)&&n(e)}),document.addEventListener(`keydown`,e=>{let t=e.target;t.tagName===`INPUT`&&t.closest(`#modal-overlay`)&&(t.dataset.origPlaceholder||(t.dataset.origPlaceholder=t.placeholder),t.placeholder&&e.key&&e.key.length===1&&(t.placeholder=``))}),document.addEventListener(`input`,e=>{let t=e.target;t.tagName===`INPUT`&&t.closest(`#modal-overlay`)&&(t.value.length===0&&t.dataset.origPlaceholder?t.placeholder=t.dataset.origPlaceholder:t.placeholder=``)})});function Or(){let e=s.getUser();if(e){document.getElementById(`user-name`).textContent=`${e.firstName} ${e.lastName}`;let t=document.getElementById(`user-avatar`);e.image&&e.image.trim()!==``?(t.innerHTML=`<img src="${e.image}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`,t.style.background=`none`):t.textContent=(e.firstName||`U`)[0].toUpperCase();let n=parseInt(e.role);document.body.classList.remove(`is-employee`,`is-owner`,`is-admin`),n===0?document.body.classList.add(`is-employee`):n===1?document.body.classList.add(`is-owner`):n===2&&document.body.classList.add(`is-admin`);let r=document.querySelector(`.sidebar-logo .brand-name`);if(r&&(r.textContent=e.brandName||`SavdoSklad`),document.title=`${e.brandName||`SavdoSklad`} — Biznes Boshqaruv Tizimi`,e.brandImage){let t=document.getElementById(`sidebar-brand-icon`);t&&(t.style.width=`36px`,t.style.height=`36px`,t.style.background=`none`,t.style.boxShadow=`none`,t.innerHTML=`<img src="${e.brandImage}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`)}document.querySelectorAll(`.owner-only`).forEach(e=>{e.style.display=n>=1?`flex`:`none`}),document.querySelectorAll(`.admin-only`).forEach(e=>{e.style.display=n===2?`flex`:`none`}),document.querySelectorAll(`.mp-only`).forEach(e=>{e.style.display=n>=1?`block`:`none`}),document.querySelectorAll(`.admin-only-mp`).forEach(e=>{e.style.display=n===2?`flex`:`none`})}}async function kr(){try{let e=await s.get(`/businesses/my`),n=document.getElementById(`business-selector`);if(!n)return;let r=[`categories`,`transactions`,`refunds`,`debts`,`expenses`,`calculations`,`mp-categories`,`mp-stats`,`mp-products`,`mp-sales`,`mp-orders`,`admin`].includes(window.currentPage||`dashboard`)?`Biznes tanlang`:`Hammasi`;if(n.innerHTML=`<option value="" data-i18n="${r}">${o(r)}</option>`,e&&e.length>0){(e||[]).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name||`Biznes #${e.id}`,n.appendChild(t)});let r=d();if(r&&e.find(e=>e.id==r))n.value=r;else if(e.length>0){let r=e[0].id;n.value=r,t(r)}else n.value=``,t(0)}else t(0);Z(wr)}catch(e){a(e.message,`error`)}}function Ar(e){t(e),Z(wr)}function Z(e){let t=s.getUser(),n=t?parseInt(t.role):0,r=[`employees`,`expenses`,`businesses`,`calculations`,`bulk-delete`,`mp-stats`,`mp-categories`,`mp-products`,`mp-sales`,`mp-orders`],i=[`admin`];if(n<1&&(r.includes(e)||i.includes(e))){console.warn(`RBAC: Access denied to`,e),Z(`dashboard`);return}if(n<2&&i.includes(e)){console.warn(`RBAC: Access denied to`,e),Z(`dashboard`);return}wr=e,window.currentPage=e,setSelectedPage(e),document.querySelectorAll(`.nav-item`).forEach(t=>{t.classList.toggle(`active`,t.dataset.page===e)});let a={dashboard:`Bosh sahifa`,businesses:`Bizneslar`,categories:`Kategoriyalar`,products:`Mahsulotlar`,transactions:`Sotuvlar`,refunds:`Qaytarishlar`,debts:`Qarzlar`,clients:`Mijozlar`,employees:`Xodimlar`,expenses:`Xarajatlar`,calculations:`Hisobotlar`,admin:`Admin panel`,profile:`Shaxsiy kabinet`,"bulk-delete":`Ommaviy o'chirish`,"mp-stats":`Marketplace: Statistika`,"mp-categories":`Marketplace: Kategoriyalar`,"mp-products":`Marketplace: Mahsulotlar`,"mp-sales":`Marketplace: Sotilgan tovarlar`,"mp-orders":`Marketplace: Buyurtmalar`};document.getElementById(`page-title`).textContent=o(a[e]||e),document.title=`SavdoSklad — ${o(a[e]||e)}`;let c=document.getElementById(`business-selector`);if(c&&c.options.length>0){let t=[`categories`,`transactions`,`refunds`,`debts`,`expenses`,`calculations`,`mp-categories`,`mp-stats`,`mp-products`,`mp-sales`,`mp-orders`,`admin`].includes(e)?`Biznes tanlang`:`Hammasi`;c.options[0].textContent=o(t),c.options[0].setAttribute(`data-i18n`,t);let n=d();c.value=Array.from(c.options).some(e=>e.value==n)&&n||``}let l=document.getElementById(`topbar-page-title-center`);l&&(l.textContent=o(a[e]||e));let u=document.getElementById(`topbar-date`);if(u){let e=new Date,t=e.getDate(),n=e.getMonth(),r=e.getFullYear(),i=e.getDay();u.textContent=`${t} ${o([`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`][n])} ${r}, ${o([`Yakshanba`,`Dushanba`,`Seshanba`,`Chorshanba`,`Payshanba`,`Juma`,`Shanba`][i])}`}let f=document.getElementById(`page-content`);switch(f.innerHTML=`<div class="loader"><div class="spinner"></div></div>`,f.className=`content fade-in`,e){case`dashboard`:jr();break;case`businesses`:renderBusinesses();break;case`categories`:renderCategories();break;case`products`:renderProducts();break;case`transactions`:renderTransactions();break;case`refunds`:renderRefunds();break;case`debts`:window.renderDebts();break;case`clients`:renderClients();break;case`employees`:ze();break;case`expenses`:renderExpenses();break;case`calculations`:renderCalculations();break;case`admin`:renderAdmin();break;case`profile`:zr();break;case`bulk-delete`:renderBulkDelete();break;case`mp-stats`:renderMpStats();break;case`mp-categories`:renderMpCategories();break;case`mp-products`:renderMpProducts();break;case`mp-sales`:renderMpSales();break;case`mp-orders`:renderMpOrders();break;default:f.innerHTML=`<div class="empty-state"><h4>${o(`Sahifa topilmadi`)}</h4></div>`}}async function jr(){let e=d(),t=document.getElementById(`page-content`);try{let n,r,i;if(e){let t=new Date,a=`&startDate=${new Date(t.getFullYear(),t.getMonth()-1,1).toISOString().split(`T`)[0]}&endDate=${t.toISOString().split(`T`)[0]}`;[n,r,i]=await Promise.all([s.get(`/products?businessId=${e}`).catch(()=>[]),s.get(`/transactions?businessId=${e}${a}`).catch(()=>[]),s.get(`/clients?businessId=${e}`).catch(()=>[])])}else{let e=await s.get(`/businesses/my`).catch(()=>[]),a=s.getUser();if(!e||e.length===0){t.innerHTML=`
          <div class="empty-state">
            <div class="icon">🏢</div>
            <h4>${o(`Biznes yarating`)}</h4>
            <p>${a&&a.role>=1?o(`Yangi biznes yarating va ma'lumotlaringizni boshqaring.`):o(`Hozircha biznes mavjud emas.`)}</p>
            <br>
            ${a&&a.role>=1?`<button class="btn btn-primary" onclick="navigateTo('businesses')">${o(`Biznes yaratish`)}</button>`:``}
          </div>`;return}let c=new Date,l=`&startDate=${new Date(c.getFullYear(),c.getMonth()-1,1).toISOString().split(`T`)[0]}&endDate=${c.toISOString().split(`T`)[0]}`,u=await Promise.all(e.map(e=>s.get(`/products?businessId=${e.id}`).catch(()=>[]))),d=await Promise.all(e.map(e=>s.get(`/transactions?businessId=${e.id}${l}`).catch(()=>[]))),f=await Promise.all(e.map(e=>s.get(`/clients?businessId=${e.id}`).catch(()=>[])));n=u.flat(),r=d.flat(),i=f.flat()}let a=(n||[]).filter(e=>e&&!e.isDeleted),l=(r||[]).filter(e=>e).sort((e,t)=>new Date(t.createdAt)-new Date(e.createdAt)),u=(i||[]).filter(e=>e),d=new Date,f=d.toISOString().split(`T`)[0],p=d.getMonth(),m=d.getFullYear(),h=l.filter(e=>{let t=new Date(e.createdAt);return t.getMonth()===p&&t.getFullYear()===m}).reduce((e,t)=>e+(t.total||0),0),g=p===0?11:p-1,_=p===0?m-1:m,v=l.filter(e=>{let t=new Date(e.createdAt);return t.getMonth()===g&&t.getFullYear()===_}).reduce((e,t)=>e+(t.total||0),0),y=d.getDate(),b=l.filter(e=>{let t=new Date(e.createdAt);return t.getMonth()===g&&t.getFullYear()===_&&t.getDate()<=y}).reduce((e,t)=>e+(t.total||0),0),x=0,S=`none`;v>0?(x=(h-v)/v*100,S=x>=0?`up`:`down`):h>0&&(S=`up`,x=100);let C=0,w=`none`;b>0?(C=(h-b)/b*100,w=C>=0?`up`:`down`):h>0&&(w=`up`,C=100);let T=w===`down`?`trending-down`:`trending-up`,ee=w===`down`?`var(--danger)`:`var(--success)`,E=w===`down`?`var(--danger-bg)`:`var(--success-bg)`,D=u.filter(e=>{let t=new Date(e.createdAt);return t.getMonth()===p&&t.getFullYear()===m}).length,te=o([`Yanvar`,`Fevral`,`Mart`,`Aprel`,`May`,`Iyun`,`Iyul`,`Avgust`,`Sentabr`,`Oktabr`,`Noyabr`,`Dekabr`][p]),O=l.filter(e=>e.createdAt.startsWith(f)).length,ne=a.filter(e=>(e.quantity||0)<=(e.minQuantity||5)).length,re=a.length>0?Math.round((a.length-ne)/a.length*100):100,ie=a.reduce((e,t)=>e+(t.quantity||0)*(t.price||0),0),ae=a.reduce((e,t)=>e+(t.quantity||0),0),oe=s.getUser();oe&&parseInt(oe.role)===0?t.innerHTML=`
        <div class="card fade-in" style="padding:24px; margin-bottom:20px; background:var(--accent-glow); border-left:4px solid var(--accent);">
           <div style="display:flex; align-items:center; gap:16px;">
              <div style="width:48px; height:48px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; color:#fff;">
                <i data-lucide="sun" style="width:24px; height:24px;"></i>
              </div>
              <div>
                <h3 style="margin:0; font-family:'Outfit'; color:var(--accent); font-size:20px;">${o(`Assalomu alaykum`)}!</h3>
                <p style="margin:4px 0 0 0; color:var(--text-secondary); font-size:14px;">${o(`Bugungi ish kunida omad tilaymiz.`)}</p>
              </div>
           </div>
        </div>
        
        <div class="dashboard-bottom-grid fade-in" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:0;">
          <div class="card" style="padding:0; overflow:hidden;">
             <div class="card-header" style="padding:24px;">
                <h3 style="font-family:'Outfit'; font-size:18px;">${o(`Ombor holati`)}</h3>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('products')">${o(`Hammasini ko'rish`)}</button>
             </div>
             <div id="dashboard-inventory-container" style="padding:0 24px 24px 24px;"></div>
          </div>
          <div class="card" style="padding:24px;">
             <div class="card-header">
                <h3 style="font-family:'Outfit'; font-size:18px;">${o(`Top mahsulotlar`)}</h3>
             </div>
             <div id="top-products-list" style="display:flex; flex-direction:column; gap:16px;"></div>
          </div>
        </div>

        <div class="card fade-in" style="padding:0; overflow:hidden; margin-top:20px;">
           <div class="card-header" style="padding:24px;">
              <h3 style="font-family:'Outfit'; font-size:18px;">${o(`So'nggi buyurtmalar`)}</h3>
              <button class="btn btn-primary btn-sm" onclick="window.openSaleModal()">${o(`Yangi sotuv`)}</button>
           </div>
           <div id="dashboard-transactions-container"></div>
        </div>
      `:t.innerHTML=`
        <div class="stats-grid fade-in">
          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${o(`Jami savdo`)}</span>
              <div class="btn-icon" style="background:${E}; color:${ee};"><i data-lucide="${T}"></i></div>
            </div>
            <div class="stat-value" style="font-size:28px; font-family:'Outfit'; font-weight:800;">${c(h)}</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px;">
              <div class="stat-trend" style="color:var(--text-muted); font-size:12px; font-weight:400;">${te}</div>
              <div style="text-align:right; display:flex; flex-direction:column; gap:4px;">
                ${S===`none`?``:`
                  <div>
                    <div style="font-size:16px; font-weight:800; color:${S===`up`?`var(--success)`:`var(--danger)`}; display:flex; align-items:center; justify-content:flex-end; gap:2px;">
                      ${S===`up`?`↑`:`↓`} ${Math.abs(Math.round(x))}%
                    </div>
                    <div style="font-size:9px; color:var(--text-muted); font-weight:400; text-transform:uppercase; letter-spacing:0.3px;">${o(`o'tgan oyga nisbatan`)}</div>
                  </div>
                `}
                ${w===`none`?``:`
                  <div style="border-top: 1px solid var(--border); padding-top:4px; margin-top:2px;">
                    <div style="font-size:13px; font-weight:700; color:${w===`up`?`var(--success)`:`var(--danger)`}; display:flex; align-items:center; justify-content:flex-end; gap:2px;">
                      ${w===`up`?`↑`:`↓`} ${Math.abs(Math.round(C))}%
                    </div>
                    <div style="font-size:9px; color:var(--text-muted); font-weight:400; text-transform:uppercase; letter-spacing:0.3px;">${o(`O'tgan oy (shu davr)`)}</div>
                  </div>
                `}
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${o(`Buyurtmalar`)}</span>
              <div class="btn-icon" style="background:var(--secondary-glow); color:var(--secondary);"><i data-lucide="shopping-bag"></i></div>
            </div>
            <div class="stat-value" style="font-size:28px; font-family:'Outfit'; font-weight:800;">${l.length}</div>
            <div class="stat-trend" style="color:var(--success); font-size:12px; margin-top:8px;">
              ↑ ${O} <span style="color:var(--text-muted); font-weight:400;">${o(`bugun`)}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${o(`Faol mijozlar`)}</span>
              <div class="btn-icon" style="background:var(--info-bg); color:var(--info);"><i data-lucide="users"></i></div>
            </div>
            <div class="stat-value" style="font-size:28px; font-family:'Outfit'; font-weight:800;">${u.length}</div>
            <div class="stat-trend" style="color:var(--success); font-size:12px; margin-top:8px;">
              <span style="color:var(--text-primary);">+${D}</span> <span style="color:var(--text-muted); font-weight:400;">${o(`shu oyda qo'shilgan`)}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <span class="stat-label">${o(`Ombor holati`)} <span style="color:var(--warning); font-weight:800; margin-left:5px;">${re}%</span></span>
              <div class="btn-icon" style="background:var(--warning-bg); color:var(--warning);"><i data-lucide="package"></i></div>
            </div>
            <div class="stat-value" style="font-size:24px; font-family:'Outfit'; font-weight:800; line-height:1.2;">
              <div style="font-size:13px; color:var(--text-muted); font-weight:400; margin-bottom:4px;">${o(`Jami mahsulotlar`)}: <b style="color:var(--text-primary);">${ae}</b></div>
              <div style="font-size:20px; color:var(--warning);">${c(ie)}</div>
            </div>
            <div class="stat-trend" style="color:var(--danger); font-size:12px; margin-top:8px; display:flex; align-items:center; gap:4px;">
              <span style="font-weight:800; background:rgba(239, 68, 68, 0.1); padding:2px 6px; border-radius:4px;">${ne}</span> 
              <span style="color:var(--text-muted); font-weight:400;">${o(`ta mahsulot kam qolgan`)}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-main-grid fade-in" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:20px;">
          <div class="card" style="padding:24px;">
            <div class="card-header">
              <h3 style="font-family:'Outfit'; font-size:18px;">${o(`Oylik savdo ko'rsatkichi`)}</h3>
            </div>
            <div style="height:350px;">
              <canvas id="salesTrendChart"></canvas>
            </div>
          </div>

          <div class="card" style="padding:24px;">
            <div class="card-header">
              <h3 style="font-family:'Outfit'; font-size:18px;">${o(`Savdo manbalari`)}</h3>
            </div>
            <div style="height:250px; margin-bottom:20px;">
               <canvas id="salesSourceChart"></canvas>
            </div>
            <div id="sales-sources-legend" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"></div>
          </div>
        </div>

        <div class="dashboard-bottom-grid fade-in" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top:20px;">
          <div class="card" style="padding:0; overflow:hidden;">
             <div class="card-header" style="padding:24px;">
                <h3 style="font-family:'Outfit'; font-size:18px;">${o(`Ombor holati`)}</h3>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('products')">${o(`Hammasini ko'rish`)}</button>
             </div>
             <div id="dashboard-inventory-container" style="padding:0 24px 24px 24px;"></div>
          </div>
          <div class="card" style="padding:24px;">
             <div class="card-header">
                <h3 style="font-family:'Outfit'; font-size:18px;">${o(`Top mahsulotlar`)}</h3>
             </div>
             <div id="top-products-list" style="display:flex; flex-direction:column; gap:16px;"></div>
          </div>
        </div>

        <div class="card fade-in" style="padding:0; overflow:hidden; margin-top:20px;">
           <div class="card-header" style="padding:24px;">
              <h3 style="font-family:'Outfit'; font-size:18px;">${o(`So'nggi buyurtmalar`)}</h3>
              <button class="btn btn-primary btn-sm" onclick="window.openSaleModal()">${o(`Yangi sotuv`)}</button>
           </div>
           <div id="dashboard-transactions-container"></div>
        </div>
      `,Fr=l,dashboardPage=1,Mr(a.slice(0,5)),Nr(a.slice(0,5)),Ir(),Tr=l,Er=a,setTimeout(()=>{typeof lucide<`u`&&lucide.createIcons(),Pr(Tr,Er)},100)}catch(e){console.error(e),t.innerHTML=`<div class="empty-state"><h4>${o(`Xatolik`)}</h4><p>${u(e.message)}</p></div>`}}function Mr(e){let t=document.getElementById(`dashboard-inventory-container`);if(!t)return;let n={};(e||[]).forEach(e=>{let t=e.categoryName||o(`Boshqa`);n[t]||(n[t]=[]),n[t].push(e)});let r=``;for(let e in n)r+=`
      <tr style="background:rgba(99, 102, 241, 0.05);">
        <td colspan="4" style="padding:10px 16px; font-weight:700; color:var(--accent); font-size:11px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border);">
           <div style="display:flex; align-items:center; gap:8px;">
             <i data-lucide="layers" style="width:14px;"></i>
             ${u(e)}
           </div>
        </td>
      </tr>
    `,r+=n[e].map(e=>`
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:12px; padding-left:8px;">
              <div style="width:32px; height:32px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                  <i data-lucide="${e.name?.toLowerCase().includes(`soat`)?`watch`:`package`}" style="width:16px;"></i>
              </div>
              <div style="font-weight:600; color:var(--text-primary); font-size:13px;">${u(e.name)}</div>
          </div>
        </td>
        <td style="color:var(--text-primary); text-align:center; font-weight:700;">${e.quantity}</td>
        <td>
          <div style="display:flex; align-items:center; gap:12px; justify-content:center;">
             <div style="width:80px; height:6px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                <div style="width:${Math.min(100,e.quantity/50*100)}%; height:100%; background:linear-gradient(to right, ${e.quantity<10?`var(--danger)`:`var(--accent)`}, var(--accent-hover)); border-radius:10px;"></div>
             </div>
          </div>
        </td>
        <td>
          <div style="display:flex; justify-content:center;">
            <div style="width:8px; height:8px; border-radius:50%; background:${e.quantity>0?`var(--success)`:`var(--danger)`}; box-shadow:0 0 10px ${e.quantity>0?`var(--success)`:`var(--danger)`}"></div>
          </div>
        </td>
      </tr>
    `).join(``);t.innerHTML=`
      <table class="premium-table">
        <thead>
          <tr>
            <th style="text-align:center">${o(`Nomi`)}</th>
            <th style="text-align:center">${o(`Qoldiq`)}</th>
            <th style="text-align:center">${o(`Prognoz`)}</th>
            <th style="text-align:center">${o(`Holat`)}</th>
          </tr>
        </thead>
        <tbody>
          ${r}
        </tbody>
      </table>
    `}function Nr(e){let t=document.getElementById(`top-products-list`);if(!t)return;let n=[`#3b82f6`,`#10b981`,`#f59e0b`,`#ef4444`,`#ec4899`];t.innerHTML=e.map((e,t)=>`
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:${n[t%5]}; transition:all 0.3s;" class="product-icon-hover">
                <i data-lucide="${e.name?.toLowerCase().includes(`soat`)?`watch`:e.name?.toLowerCase().includes(`telefon`)?`smartphone`:[`shopping-bag`,`package`,`truck`][t%3]}" style="width:22px;"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:700; color:var(--text-primary); font-size:14px;">${u(e.name)}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${c(e.price||0)} ${o(`so'm`)}</div>
            </div>
            <div style="text-align:right;">
                <div style="width:50px; height:20px;">
                    <canvas id="mini-sparkline-${t}" style="width:100%; height:100%;"></canvas>
                </div>
            </div>
        </div>
    `).join(``),setTimeout(()=>{(e||[]).forEach((e,t)=>{let r=document.getElementById(`mini-sparkline-${t}`);if(r){let e=Chart.getChart(r);e&&e.destroy(),new Chart(r,{type:`line`,data:{labels:[1,2,3,4,5],datasets:[{data:[10,15,12,18,14],borderColor:n[t%5],borderWidth:2,pointRadius:0,fill:!1,tension:.4}]},options:{plugins:{legend:{display:!1}},scales:{x:{display:!1},y:{display:!1}},maintainAspectRatio:!1}})}})},100)}function Pr(e,t){let n=document.getElementById(`salesTrendChart`);if(n){let e=n.getContext(`2d`),t=[o(`Dush`),o(`Sesh`),o(`Chor`),o(`Pay`),o(`Jum`),o(`Shan`),o(`Yak`)],r=[12,19,15,25,22,30,20],i=e.createLinearGradient(0,0,0,400);i.addColorStop(0,`rgba(16, 185, 129, 0.4)`),i.addColorStop(1,`rgba(16, 185, 129, 0)`);let a=Chart.getChart(n);a&&a.destroy(),new Chart(n,{type:Dr,data:{labels:t,datasets:[{label:o(`Savdo hajmi`),data:r,borderColor:`#10b981`,borderWidth:4,fill:!0,backgroundColor:i,tension:.4,pointRadius:6,pointBackgroundColor:`#10b981`,pointBorderColor:`#fff`,pointBorderWidth:3,pointHoverRadius:8}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,grid:{color:`rgba(255,255,255,0.05)`,drawBorder:!1},ticks:{color:`#64748b`,font:{size:10,family:`Plus Jakarta Sans`}}},x:{grid:{display:!1},ticks:{color:`#64748b`,font:{size:10,family:`Plus Jakarta Sans`}}}}}})}let r=document.getElementById(`salesSourceChart`);if(r){let t=e.reduce((e,t)=>e+(t.cash||0),0),n=e.reduce((e,t)=>e+(t.card||0),0),i=e.reduce((e,t)=>e+(t.click||0),0),a=e.reduce((e,t)=>e+(t.debt||0),0),s=t+n+i+a>0,l=s?[t,n,i,a]:[1],u=s?[o(`Naqd`),o(`Karta`),o(`Click`),o(`Qarz`)]:[o(`Ma'lumot yo'q`)],d=s?[`#10b981`,`#3b82f6`,`#8b5cf6`,`#ef4444`]:[`rgba(100, 116, 139, 0.2)`],f=Chart.getChart(r);f&&f.destroy(),new Chart(r,{type:`pie`,data:{labels:u,datasets:[{data:l,backgroundColor:d,borderWidth:s?2:0,borderColor:`var(--bg-card)`,hoverOffset:s?15:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{enabled:s,callbacks:{label:function(e){let t=e.label||``,n=e.raw||0,r=e.dataset.data.reduce((e,t)=>e+t,0),i=r>0?Math.round(n/r*100):0;return`${t}: ${c(n)} (${i}%)`}}}}}});let p=document.getElementById(`sales-sources-legend`);if(p){let e=s?t+n+i+a:0,r=[o(`Naqd`),o(`Karta`),o(`Click`),o(`Qarz`)],c=[`#10b981`,`#3b82f6`,`#8b5cf6`,`#ef4444`],l=[t,n,i,a];p.innerHTML=r.map((t,n)=>`
        <div style="display:flex; align-items:center; gap:8px;">
           <div style="width:8px; height:8px; border-radius:50%; background:${c[n]};"></div>
           <div style="flex:1; font-size:12px; color:var(--text-muted);">${t}</div>
           <div style="font-weight:700; font-size:12px; color:var(--text-primary);">${e>0?Math.round(l[n]/e*100):0}%</div>
        </div>
      `).join(``)}}}window.dashboardPage=1;var Fr=[];function Ir(){let t=document.getElementById(`dashboard-transactions-container`);if(!t)return;let n=Fr.slice(0,10),r=n.map((t,n)=>`
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="color:var(--text-muted); text-align:center; padding:12px 10px;">${n+1}</td>
        <td style="font-weight:700; color:#10b981; text-align:center; padding:12px 10px; min-width:120px;">${c(t.total)}</td>
        <td style="text-align:center; padding:12px 10px;">
           <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-size:12px; font-weight:500;">
             ${t.cash>0?`<span style="color:#10b981">💵 ${o(`Naqd`)}</span>`:``}
             ${t.card>0?`<span style="color:#3b82f6">💳 ${o(`Karta`)}</span>`:``}
             ${t.click>0?`<span style="color:#8b5cf6">📱 ${o(`Click`)}</span>`:``}
           </div>
        </td>
        <td style="text-align:center; padding:12px 10px; font-size:12px; font-weight:600; color:var(--text-primary); text-transform:uppercase;">
           ${u(t.createdByName||o(`Tizim`))}
        </td>
        <td style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px 10px;">${e(t.createdAt)}</td>
      </tr>`).join(``);t.innerHTML=`
    <div class="table-container" style="border:none; box-shadow:none;">
      <table class="premium-table">
        <thead>
          <tr style="background:rgba(79, 70, 229, 0.85);">
            <th style="text-align:center; padding:15px 10px;">№</th>
            <th style="text-align:center; padding:15px 10px;">${o(`SUMMA`)}</th>
            <th style="text-align:center; padding:15px 10px;">${o(`TO'LOV TURI`)}</th>
            <th style="text-align:center; padding:15px 10px;">${o(`Mas'ul`)}</th>
            <th style="text-align:center; padding:15px 10px;">${o(`SANA`)}</th>
          </tr>
        </thead>
        <tbody id="dashboard-tbody">
          ${n.length===0?`<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">${o(`Sotuvlar hali yo'q`)}</td></tr>`:r}
        </tbody>
      </table>
    </div>
  `}function Lr(e,t,n){return window[e]>=t?``:`<div id="${e}-sentinel" style="height:40px; margin:20px 0; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:13px; font-weight:500;">
    <div class="spinner-small" style="margin-right:10px;"></div> ${o(`Yuklanmoqda...`)}
  </div>`}window.attachInfiniteScroll=function(e,t,n,...r){let i=`${e}-sentinel`,a=document.getElementById(i);if(!a)return;let o=new IntersectionObserver(i=>{if(i[0].isIntersecting&&window[e]<t){window[e]++;let t=window[n];typeof t==`function`&&t.apply(null,[...r,!0]),o.disconnect()}},{threshold:.1,rootMargin:`150px`});o.observe(a)};var Rr=!1;function Q(e,t,n=``,r=!1){let i=document.getElementById(`modal-body`),a=document.getElementById(`modal-overlay`);Rr=r,i.className=`modal `+n,t?i.innerHTML=`
            <div class="modal-header">
                <h3>${e}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-content">${t}</div>
        `:i.innerHTML=e,a.classList.add(`active`)}function $(e=!1){if(Rr&&!e){s.logout(`org_required`);return}document.getElementById(`modal-overlay`).classList.remove(`active`),Rr=!1}window.api=s,window.t=o,window.currentLang=l;async function zr(){let t=document.getElementById(`page-content`),n=s.getUser();if(!n)return;try{let e=await s.get(`/users/${n.id}`);s.setUser(e)}catch(e){console.error(`User info refresh error:`,e)}let r=s.getUser();t.innerHTML=`
    <div class="profile-container fade-in" style="min-height: 80vh; padding: 20px; position: relative; overflow: hidden; background: var(--bg-secondary); border-radius: 20px;">
        <!-- Background Decorative Blobs -->
        <div style="position: absolute; top: -10%; left: -10%; width: 400px; height: 400px; background: rgba(16, 185, 129, 0.15); border-radius: 50%; filter: blur(80px); z-index: 0;"></div>
        <div style="position: absolute; bottom: -10%; right: -10%; width: 350px; height: 350px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; filter: blur(80px); z-index: 0;"></div>

        <div class="card shadow-lg" style="max-width: 800px; margin: 0 auto; position: relative; z-index: 1; overflow: hidden; border: none; backdrop-filter: blur(10px); background: var(--bg-card); border-radius: 24px;">
            <!-- Modern Header Banner (Sidebar Rangida) - Kengaytirilgan -->
            <div style="min-height: 220px; background: var(--sidebar-gradient); margin: 0; padding: 30px 40px; position: relative; display: flex; flex-direction: column; justify-content: flex-end;">
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                
                <!-- Profile Identity INSIDE Banner (Matnlar Oq rangda) -->
                <div style="display:flex; align-items: center; gap: 25px; position: relative; z-index: 2;">
                    <div class="user-avatar" id="profile-avatar-display" style="width:110px; height:110px; font-size:44px; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.2); background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); color: white; border-radius: 30px; overflow: hidden;">
                        ${r.image?`<img src="${r.image}" style="width:100%; height:100%; object-fit:cover;">`:(r.firstName||`U`)[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin:0; font-size:30px; font-weight: 800; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${r.firstName} ${r.lastName}</h2>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <span style="background: rgba(255, 255, 255, 0.2); color: white; padding: 2px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,0.3);">@${r.userName}</span>
                            <span style="font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500;">ID: #${r.id}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-content" style="padding: 40px;">
                <!-- Action Buttons -->
                <div class="profile-actions" style="display: flex; gap: 10px; margin-bottom: 30px;">
                    <button class="btn btn-outline" style="flex:1; border-radius: 12px; height: 45px; font-weight: 600; border-color: #e2e8f0;" onclick="showChangePasswordModal()">
                        <span class="icon">🔑</span> ${o(`Parolni o'zgartirish`)}
                    </button>
                    <button class="btn btn-primary" style="flex:1; border-radius: 12px; height: 45px; font-weight: 600;" onclick="showEditProfileModal()">
                        <span class="icon">✏️</span> ${o(`Ma'lumotlarni tahrirlash`)}
                    </button>
                </div>

                <!-- Info Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div class="info-card" style="padding: 15px 20px; background: var(--bg-input); border-radius: 16px; border: 1px solid var(--border);">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${o(`Ism`)}</label>
                        <div style="font-size:17px; font-weight:600; color: var(--text-primary);">${r.firstName}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: var(--bg-input); border-radius: 16px; border: 1px solid var(--border);">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${o(`Familiya`)}</label>
                        <div style="font-size:17px; font-weight:600; color: var(--text-primary);">${r.lastName}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: var(--bg-input); border-radius: 16px; border: 1px solid var(--border);">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${o(`Telefon raqami`)}</label>
                        <div style="font-size:17px; font-weight:600; color: var(--text-primary);">${r.phoneNumber||`—`}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: var(--bg-input); border-radius: 16px; border: 1px solid var(--border);">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${o(`Obuna muddati`)}</label>
                        <div style="font-size:15px; font-weight:600; color: var(--accent);">${e(r.expirationDate)||`—`}</div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: var(--bg-card); border-radius: 16px; border: 2px solid ${r.telegramUserId?`rgba(16, 185, 129, 0.15)`:`rgba(239, 68, 68, 0.1)`}; box-shadow: 0 4px 12px rgba(0,0,0,0.03); grid-column: span 1;">
                        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">${o(`Telegram`)}</label>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-size:15px; font-weight:700; color: ${r.telegramUserId?`#10b981`:`#ef4444`};">
                                ${r.telegramUserId?`✅ `+o(`Telegram ulangan`):`❌ `+o(`Telegram ulanmagan`)}
                            </span>
                            ${r.telegramUserId?``:`
                            <button class="btn btn-sm btn-outline" 
                                    style="padding: 4px 10px; border-radius: 8px; font-size: 11px; color:var(--accent); border-color:var(--accent);" 
                                    onclick="window.generateTelegramLink()">
                                🔗 ${o(`Ulash`)}
                            </button>`}
                        </div>
                    </div>
                    <div class="info-card" style="padding: 15px 20px; background: var(--bg-card); border-radius: 16px; border: 2px solid rgba(16, 185, 129, 0.15); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08); grid-column: span 1;">
                        <label style="display:block; font-size:11px; color:var(--accent); text-transform:uppercase; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px;">${o(`Taklif kodi (Promo)`)}</label>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-size:20px; font-weight:800; color:var(--accent); letter-spacing:2px;">${r.offerCode||`—`}</span>
                            <button class="btn btn-sm btn-primary" 
                                    style="padding: 6px 14px; border-radius: 10px; font-size: 12px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);" 
                                    onclick="copyToClipboard('${r.offerCode||``}')">
                                <span class="icon">📋</span> ${o(`Nusxa`)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tip Box -->
        <div style="max-width: 800px; margin: 30px auto 0; padding: 25px; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border); display: flex; gap: 20px; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: var(--warning-bg); color: #f59e0b; font-size: 24px; border-radius: 15px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.1);">💡</div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; font-size:16px; font-weight: 700; color: var(--text-primary);">${o(`Taklif kodi nima?`)}</h4>
                <p style="font-size:14px; line-height:1.6; margin:0; color: var(--text-secondary); font-weight: 500;">
                    ${o(`Ushbu kodni do'stlaringizga yuboring. Ular ro'yxatdan o'tayotganlarida ushbu kodni kiritsalar, sizga va ularga qo'shimcha imtiyozlar berilishi mumkin.`)}
                </p>
            </div>
        </div>
    </div>`}function Br(){let e=s.getUser();Q(o(`Profilni tahrirlash`),`
        <form onsubmit="handleUpdateProfile(event)" style="width: 100%; max-width: 450px;">
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display:block; margin-bottom: 10px;">${o(`Profil rasmi`)}</label>
                <div style="display:flex; gap:20px; align-items: center;">
                    <div id="profile-image-preview" style="width:80px; height:80px; border-radius:20px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${e.image?`<img src="${e.image}" style="width:100%; height:100%; object-fit:cover;">`:`<span style="font-size:24px; opacity:0.3;">🖼️</span>`}
                    </div>
                    <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                        <input type="file" class="form-control" accept="image/*" onchange="previewProfileImage(this)">
                        <input type="hidden" id="edit-image-url" value="${u(e.image||``)}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <p style="font-size:11px; color:var(--text-muted); margin:0;">${o(`JPEG, PNG formatlar, maksimal 2MB.`)}</p>
                            <button type="button" class="btn btn-sm btn-ghost" onclick="window.clearProfileImage()" style="color:var(--danger); border-color:var(--danger-bg); padding:4px 8px; font-size:11px;">${o(`Rasmni o'chirish`)}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${o(`Ism`)} </label>
                    <input type="text" class="form-control" id="edit-firstName" value="${u(e.firstName)}" placeholder="${o(`Ismni kiriting`)}" required>
                </div>
                <div class="form-group">
                    <label>${o(`Familiya`)} </label>
                    <input type="text" class="form-control" id="edit-lastName" value="${u(e.lastName)}" placeholder="${o(`Familiyani kiriting`)}" required>
                </div>
            </div>
            <div class="form-group">
                <label>${o(`Telefon raqami`)}</label>
                <input type="text" class="form-control" id="edit-phone" value="${u(e.phoneNumber||``)}" placeholder="+998901234567">
            </div>

            ${e.role>=1?`
            <div style="margin-top:20px; padding-top:20px; border-top:1px dashed var(--border);">
                <h4 style="margin-bottom:15px; color:var(--accent)">${o(`Brend ma'lumotlari`)}</h4>
                <div class="form-group">
                    <label>${o(`Brend nomi`)}</label>
                    <input type="text" class="form-control" id="edit-brandName" value="${u(e.brandName||``)}" placeholder="Masalan: Safia">
                </div>
                <div class="form-group">
                    <label style="display:block; margin-bottom: 10px;">${o(`Brend rasmi`)} (Fon)</label>
                    <div style="display:flex; gap:20px; align-items: center;">
                        <div id="brand-image-preview" style="width:120px; height:70px; border-radius:12px; background:var(--bg-input); border:2px dashed var(--border); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${e.brandImage?`<img src="${e.brandImage}" style="width:100%; height:100%; object-fit:cover;">`:`<span style="font-size:24px; opacity:0.3;">🖼️</span>`}
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                            <input type="file" class="form-control" accept="image/*" onchange="previewBrandImage(this)">
                            <input type="hidden" id="edit-brandImage-url" value="${u(e.brandImage||``)}">
                            <div style="display:flex; justify-content:flex-end; align-items:center;">
                                <button type="button" class="btn btn-sm btn-ghost" onclick="window.clearBrandImage()" style="color:var(--danger); border-color:var(--danger-bg); padding:4px 8px; font-size:11px;">${o(`Rasmni o'chirish`)}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `:``}
            
            
            <div style="margin-top:16px; padding:14px; border-radius:12px; background:var(--bg-input); border:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div>
                    <p style="margin:0; font-weight:600; font-size:13px;">${o(`Telegramni ulash`)}</p>
                    <p style="margin:4px 0 0; font-size:11px; color:var(--text-muted);">${e.telegramUserId?`✅ `+o(`Telegram ulangan`)+` (ID: `+e.telegramUserId+`)`:o(`Telegram hisobingizni ulab, bot orqali boshqaring`)}</p>
                </div>
                <button type="button" class="btn btn-ghost" style="white-space:nowrap; padding:8px 16px; font-size:12px; border-color:var(--accent); color:var(--accent);" onclick="window.generateTelegramLink()">
                    🔗 ${o(`Ulash`)}
                </button>
            </div>

            <div class="modal-footer" style="padding-top: 15px; margin-top: 20px; border-top: 1px solid var(--border);">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary" style="padding: 10px 40px;">${o(`Saqlash`)}</button>
            </div>
        </form>
    `)}window.clearProfileImage=function(){document.getElementById(`edit-image-url`).value=``,document.getElementById(`profile-image-preview`).innerHTML=`<span style="font-size:24px; opacity:0.3;">🖼️</span>`},window.clearBrandImage=function(){document.getElementById(`edit-brandImage-url`).value=``,document.getElementById(`brand-image-preview`).innerHTML=`<span style="font-size:24px; opacity:0.3;">🖼️</span>`},window.generateTelegramLink=async function(){try{a(o(`Havola yaratilmoqda...`),`info`);let e=await s.post(`/users/telegram-link`,{});if(e&&e.link){let t=`https://t.me/${e.botUserName||`savdosklad_bot`}?start=${e.link}`,n=document.createElement(`div`);n.id=`tg-link-popup`,n.style.cssText=`position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:9999; display:flex; align-items:center; justify-content:center;`,n.innerHTML=`
                <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:20px; padding:30px; max-width:400px; width:90%; text-align:center;">
                    <p style="font-size:32px; margin:0 0 12px;">🔗</p>
                    <h3 style="margin:0 0 8px;">${o(`Telegramni ulash`)}</h3>
                    <p style="color:var(--text-muted); font-size:13px; margin:0 0 20px;">${o(`Quyidagi tugmani bosib Telegram botini oching va ulang`)}</p>
                    <a href="${t}" target="_blank" class="btn btn-primary" style="display:inline-block; padding:12px 28px; text-decoration:none; border-radius:12px; margin-bottom:12px;">
                        📱 ${o(`Telegram orqali ulash`)}
                    </a>
                    <br>
                    <p style="font-size:11px; color:var(--text-muted); margin:8px 0 16px;">${o(`Bu havola bir marta ishlaydi`)}</p>
                    <button onclick="document.getElementById('tg-link-popup').remove()" class="btn btn-ghost" style="width:100%;">${o(`Yopish`)}</button>
                </div>
            `,document.body.appendChild(n)}}catch(e){a(e.message||o(`Xatolik`),`error`)}};async function Vr(e){if(e.files&&e.files[0]){let t=e.files[0],n=new FormData;n.append(`file`,t);try{a(o(`Rasm yuklanmoqda...`),`info`);let e=await s.post(`/upload`,n);e&&e.url&&(document.getElementById(`edit-image-url`).value=e.url,document.getElementById(`profile-image-preview`).innerHTML=`<img src="${e.url}" style="width:100%; height:100%; object-fit:cover;">`,a(o(`Rasm yuklandi`)))}catch(e){a(e.message,`error`)}}}async function Hr(e){if(e.files&&e.files[0]){let t=e.files[0],n=new FormData;n.append(`file`,t);try{a(o(`Rasm yuklanmoqda...`),`info`);let e=await s.post(`/upload`,n);e&&e.url&&(document.getElementById(`edit-brandImage-url`).value=e.url,document.getElementById(`brand-image-preview`).innerHTML=`<img src="${e.url}" style="width:100%; height:100%; object-fit:cover;">`,a(o(`Brend rasmi yuklandi`)))}catch(e){a(e.message,`error`)}}}async function Ur(e){e.preventDefault();let t=s.getUser(),n={firstName:document.getElementById(`edit-firstName`).value,lastName:document.getElementById(`edit-lastName`).value,phoneNumber:document.getElementById(`edit-phone`).value,image:document.getElementById(`edit-image-url`).value};t.role>=1&&(n.brandName=document.getElementById(`edit-brandName`).value,n.brandImage=document.getElementById(`edit-brandImage-url`).value);try{await s.put(`/users/${t.id}`,n);let e={...t,...n};s.setUser(e),a(o(`Profil yangilandi`)),$(),Or(),zr()}catch(e){a(e.message,`error`)}}function Wr(){Q(o(`Parolni o'zgartirish`),`
        <form onsubmit="handleChangePassword(event)" style="width: 100%; max-width: 400px;">
            <div class="form-group">
                <label>${o(`Yangi parol`)}</label>
                <input type="password" class="form-control" id="new-password" placeholder="••••••••" required>
            </div>
            <div class="form-group">
                <label>${o(`Parolni tasdiqlang`)}</label>
                <input type="password" class="form-control" id="confirm-password" placeholder="••••••••" required>
            </div>
            
            <div class="modal-footer" style="padding-top: 15px; margin-top: 20px; border-top: 1px solid var(--border);">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
                <button type="submit" class="btn btn-primary" style="padding: 10px 40px;">${o(`Yangilash`)}</button>
            </div>
        </form>
    `)}async function Gr(e){e.preventDefault();let t=s.getUser(),n=document.getElementById(`new-password`).value;if(n!==document.getElementById(`confirm-password`).value)return a(o(`Parollar bir xil emas`),`error`);try{await s.put(`/users/${t.id}`,{password:n}),a(o(`Parol yangilandi`)),$()}catch(e){a(e.message,`error`)}}function Kr(e){e&&navigator.clipboard.writeText(e).then(()=>{a(o(`Nusxa olindi`))}).catch(e=>{a(o(`Xatolik: `)+e,`error`)})}window.navigateTo=Z,window.onBusinessChange=Ar,window.renderProfile=zr,window.showEditProfileModal=Br,window.handleUpdateProfile=Ur,window.previewProfileImage=Vr,window.previewBrandImage=Hr,window.showChangePasswordModal=Wr,window.handleChangePassword=Gr,window.copyToClipboard=Kr,window.toggleTheme=n,window.updateThemeIcon=r,window.currentPage=wr,window.dashboardPage=dashboardPage,window.navigateTo=Z,window.renderPageControls=Lr,window.renderDashboard=jr,window.openModal=Q,window.closeModal=$,window.onBusinessChange=Ar,window.renderDashboardTransactions=Ir,window.closeModalOnOverlay=function(e){},window.maximizeTrendChart=function(){Q(o(`Oylik savdo ko'rsatkichi`),`
        <div style="height:600px; width:100%;">
            <canvas id="maxSalesChart"></canvas>
        </div>
    `,`modal-xl`),setTimeout(()=>{let e=document.getElementById(`maxSalesChart`)?.getContext(`2d`);if(e){let t=[o(`Dush`),o(`Sesh`),o(`Chor`),o(`Pay`),o(`Jum`),o(`Shan`),o(`Yak`)];new Chart(e,{type:Dr,data:{labels:t,datasets:[{label:o(`Savdo hajmi`),data:[12,19,15,25,22,30,20],borderColor:`#10b981`,borderWidth:4,fill:!0,backgroundColor:`rgba(16, 185, 129, 0.1)`,tension:.4,pointRadius:6,pointBackgroundColor:`#10b981`}]},options:{responsive:!0,maintainAspectRatio:!1}})}},200)},window.openTrendChartSettings=function(){Q(o(`Grafik sozlamalari`),`
        <div style="padding:10px;">
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:10px; color:var(--text-secondary);">${o(`Grafik turi`)}</label>
                <div style="display:flex; gap:10px;">
                    <button class="btn ${Dr===`line`?`btn-primary`:`btn-secondary`}" style="flex:1;" onclick="setChartType('line')">
                        <i data-lucide="line-chart"></i> ${o(`Chiziqli`)}
                    </button>
                    <button class="btn ${Dr===`bar`?`btn-primary`:`btn-secondary`}" style="flex:1;" onclick="setChartType('bar')">
                        <i data-lucide="bar-chart-2"></i> ${o(`Ustunli`)}
                    </button>
                </div>
            </div>
            <div style="text-align:right; margin-top:20px;">
                <button class="btn btn-secondary" onclick="closeModal()">${o(`Yopish`)}</button>
            </div>
        </div>
    `),setTimeout(()=>{typeof lucide<`u`&&lucide.createIcons()},50)},window.setChartType=function(e){Dr=e,$(),Pr(Tr,Er),a(o(`Grafik turi yangilandi`),`success`)},window.toggleSidebar=function(){let e=document.querySelector(`.sidebar`),t=document.querySelector(`.dashboard`),n=document.querySelector(`.sidebar-logo .btn-icon .icon`);if(e){if(window.innerWidth<=1024){e.classList.toggle(`mobile-open`);return}e&&t&&(e.classList.toggle(`collapsed`),t.classList.toggle(`sidebar-collapsed`),e.classList.contains(`collapsed`)?(n&&(n.textContent=`▶`),localStorage.setItem(`sidebarCollapsed`,`true`)):(n&&(n.textContent=`◀`),localStorage.setItem(`sidebarCollapsed`,`false`)))}},document.addEventListener(`DOMContentLoaded`,()=>{if(localStorage.getItem(`sidebarCollapsed`)===`true`){let e=document.querySelector(`.sidebar`),t=document.querySelector(`.dashboard`),n=document.querySelector(`.sidebar-logo .btn-icon .icon`);e&&t&&(e.classList.add(`collapsed`),t.classList.add(`sidebar-collapsed`),n&&(n.textContent=`▶`))}}),document.addEventListener(`DOMContentLoaded`,()=>{let e=document.createElement(`style`);e.textContent=`
        table th { cursor: pointer; user-select: none; position: relative; transition: background 0.2s; }
        table th:hover { background: rgba(0,0,0,0.05); }
        [data-theme='dark'] table th:hover { background: rgba(255,255,255,0.05); }
        table th.no-sort, table th:first-child, table th:last-child { cursor: default !important; background: transparent !important; }
        .sort-arrow { font-size: 0.9em; opacity: 0.8; margin-left: 4px; }
    `,document.head.appendChild(e),document.addEventListener(`click`,function(e){let t=e.target.closest(`th`);if(!t||t.querySelector(`input, select, button`)||t.classList.contains(`no-sort`))return;let n=t.textContent.trim().toLowerCase();if(n.includes(`amallar`)||n.includes(`actions`)||n===`#`||n===`№`||n===`n`)return;let r=t.parentElement.cells;if(t===r[0]||t===r[r.length-1])return;let i=t.closest(`table`);if(!i||i.classList.contains(`no-sort`))return;let a=i.querySelector(`tbody`);if(!a)return;let o=Array.from(a.querySelectorAll(`tr`));if(o.length<=1||o.length>0&&o[0].cells.length===1)return;let s=(t.getAttribute(`data-sort-dir`)||`none`)===`asc`?`desc`:`asc`;i.querySelectorAll(`th`).forEach(e=>{e.removeAttribute(`data-sort-dir`);let t=e.querySelector(`.sort-arrow`);t&&t.remove()}),t.setAttribute(`data-sort-dir`,s),t.insertAdjacentHTML(`beforeend`,`<span class="sort-arrow">${s===`asc`?`↑`:`↓`}</span>`);let c=t.cellIndex;o.sort((e,t)=>{let n=e.cells[c],r=t.cells[c];if(!n||!r)return 0;let i=n.textContent.trim(),a=r.textContent.trim(),o=i.replace(/[\s,]/g,``),l=a.replace(/[\s,]/g,``),u=parseFloat(o),d=parseFloat(l),f=Date.parse(i),p=Date.parse(a);if(!isNaN(f)&&!isNaN(p)&&i.length>=10&&(i.includes(`-`)||i.includes(`.`)))return s===`asc`?f-p:p-f;let m=!isNaN(u)&&/[0-9]/.test(o),h=!isNaN(d)&&/[0-9]/.test(l);return m&&h?s===`asc`?u-d:d-u:s===`asc`?i.localeCompare(a):a.localeCompare(i)}),a.innerHTML=``,o.forEach(e=>a.appendChild(e))})}),window.openDateFilterModal=function(){let e=getDatePeriod();Q(`
    <div class="modal-header">
      <h3>${o(`Sana bo'yicha filter`)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body-wrapper" style="padding: 20px;">
      <div class="form-row" style="margin-bottom:20px;">
        <div class="form-group">
          <label>${o(`Boshlang'ich sana`)}</label>
          <input type="date" class="form-control" id="filter-start-date" value="${e.start}">
        </div>
        <div class="form-group">
          <label>${o(`Oxirgi sana`)}</label>
          <input type="date" class="form-control" id="filter-end-date" value="${e.end}">
        </div>
      </div>
      <div class="modal-footer" style="padding-top:15px; border-top:1px solid var(--border); display:flex; justify-content:space-between; width:100%;">
        <button class="btn btn-ghost" style="color:var(--danger);" onclick="resetDateFilter()">${o(`Filterni tozalash`)}</button>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-ghost" onclick="closeModal()">${o(`Bekor qilish`)}</button>
          <button class="btn btn-primary" onclick="applyDateFilter()">${o(`Qo'llash`)}</button>
        </div>
      </div>
    </div>
  `)},window.applyDateFilter=function(){let e=document.getElementById(`filter-start-date`).value,t=document.getElementById(`filter-end-date`).value;if(!e||!t){a(o(`Sanalarni to'liq tanlang`),`warning`);return}setDatePeriod(e,t),$(),Z(window.currentPage)},window.resetDateFilter=function(){clearDatePeriod(),$(),Z(window.currentPage)},window.renderBulkDelete=async function(){let e=d(),t=s.getUser(),n=(t?parseInt(t.role):0)>=2;if(!n&&!e){document.getElementById(`page-content`).innerHTML=`
            <div class="empty-state">
                <div class="empty-icon">🏢</div>
                <p>${o(`Avval biznes tanlang`)}</p>
            </div>
        `;return}n?qr():Jr()};async function qr(){let t=document.getElementById(`page-content`);t.innerHTML=`
        <div class="container-fluid" style="max-width: 1000px; margin: 20px auto;">
            <div class="card card-dark">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-secondary); border-bottom: 1px solid var(--border);">
                    <h3 style="margin:0; font-size:18px;"><i data-lucide="list-checks" style="vertical-align:middle; margin-right:8px;"></i> ${o(`O'chirish so'rovlari`)}</h3>
                    <button class="btn btn-sm btn-ghost" onclick="renderBulkDelete()" title="${o(`Yangilash`)}">
                        <i data-lucide="refresh-cw" style="width:16px; height:16px;"></i>
                    </button>
                </div>
                <div class="card-body" style="padding:0;">
                    <div id="bulk-requests-list">
                        <div style="padding:60px; text-align:center;"><div class="spinner" style="margin:0 auto;"></div></div>
                    </div>
                </div>
            </div>
        </div>
    `,typeof lucide<`u`&&lucide.createIcons();try{let t=await s.get(`/products/bulk/requests`),n=document.getElementById(`bulk-requests-list`);if(!t||t.length===0){n.innerHTML=`<div style="padding:60px; text-align:center; color:var(--text-muted);">
                <div style="font-size:40px; margin-bottom:15px;">📥</div>
                <p>${o(`Hozircha so'rovlar yo'q`)}</p>
            </div>`;return}n.innerHTML=`
            <div class="table-responsive" style="border:1px solid var(--border); border-radius:12px; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                <table class="table bulk-requests-table" style="width: 100%; min-width: 700px; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="width: 60px; text-align:center;">ID</th>
                            <th>${o(`Sana`)}</th>
                            <th>${o(`Kategoriya`)}</th>
                            <th>${o(`Biznes`)}</th>
                            <th style="width: 130px; text-align:right;">${o(`Amal`)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${t.map(t=>`
                            <tr class="hover-row">
                                <td style="text-align:center; font-weight:600; color:var(--text-secondary);">${t.id}</td>
                                <td style="white-space:nowrap;">${e(t.createdAt)}</td>
                                <td>
                                    <span style="color: var(--text-secondary); font-size:13px; font-weight:500;">
                                        ${t.categoryName||`--`}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge" style="font-size:12px; font-weight:600; padding:4px 10px; background: rgba(99, 102, 241, 0.1); color: var(--accent); border: 1px solid rgba(99, 102, 241, 0.2);">
                                        ${t.businessName||t.businessId}
                                    </span>
                                </td>
                                <td style="text-align:right;">
                                    <button class="btn btn-sm btn-primary" onclick="viewBulkRequest(${t.id}, '${t.productIds}', ${t.businessId})" style="height:32px; padding:0 15px; border-radius:8px;">
                                        <i data-lucide="eye" style="width:14px; height:14px; margin-right:6px; vertical-align:middle;"></i> ${o(`Ko'rish`)}
                                    </button>
                                </td>
                            </tr>
                        `).join(``)}
                    </tbody>
                </table>
            </div>
        `,typeof lucide<`u`&&lucide.createIcons()}catch(e){a(e.message,`error`)}}window.viewBulkRequest=async function(e,t,n){let r=document.getElementById(`page-content`);r.innerHTML=`
        <div class="container-fluid" style="max-width: 800px; margin: 20px auto;">
            <div class="card card-danger">
                <div class="card-header" style="background: var(--danger-gradient); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                    <h3 style="margin:0; display:flex; align-items:center; gap:10px;">
                        <i data-lucide="alert-triangle"></i> ${o(`O'chirish so'rovini ko'rib chiqish`)} (#${e})
                    </h3>
                </div>
                <div class="card-body" style="padding: 30px;">
                    <div id="bulk-products-list" class="mb-4">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h4 style="margin:0">${o(`Tanlangan mahsulotlar`)}</h4>
                            <label style="cursor:pointer; font-size:14px; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                                <input type="checkbox" id="bulk-select-all" onclick="toggleAllBulkProducts(this)" checked style="width:16px; height:16px;"> ${o(`Hammasini tanlash`)}
                            </label>
                        </div>
                        <div id="bulk-products-container" style="max-height: 400px; overflow-y: auto; border: 2px solid var(--border); border-radius: 12px; background: var(--bg-input);">
                            <div style="padding:40px; text-align:center;"><div class="spinner" style="margin:0 auto;"></div></div>
                        </div>
                    </div>

                    <div style="background: rgba(var(--danger-rgb), 0.1); border-left: 4px solid var(--danger); padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                        <p style="margin:0; color: var(--danger); font-weight: 500;">
                            <strong>${o(`Diqqat`)}!</strong> ${o(`Tasdiqlangan mahsulotlar o'chiriladi va buni ortga qaytarib bo'lmaydi!`)}
                        </p>
                    </div>

                    <div class="bulk-actions-grid">
                        <button class="btn btn-danger btn-lg" onclick="handleBulkDeleteFinal(${e}, ${n})">
                            <span class="icon">🗑️</span> ${o(`Tasdiqlash va o'chirish`)}
                        </button>
                        <button class="btn btn-warning btn-lg" onclick="handleBulkDeleteReject(${e})">
                            <span class="icon">✖️</span> ${o(`Rad etish`)}
                        </button>
                        <button class="btn btn-success btn-lg" onclick="renderBulkDelete()">
                            <span class="icon">↩️</span> ${o(`Orqaga`)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,typeof lucide<`u`&&lucide.createIcons(),console.log(`Viewing bulk request with productIds:`,t),document.getElementById(`bulk-products-container`).innerHTML=`<div style="padding:40px; text-align:center;"><div class="spinner" style="margin:0 auto;"></div><div style="margin-top:10px; color:var(--text-muted);">${o(`Yuklanmoqda...`)} (${t})</div></div>`;try{let e=await s.get(`/products?ids=${t}`),n=document.getElementById(`bulk-products-container`);if(!e||e.length===0){n.innerHTML=`<div style="padding:40px; text-align:center; color:var(--text-muted);">${o(`Mahsulotlar topilmadi (ehtimol allaqachon o'chirilgan)`)}</div>`;return}n.innerHTML=e.map(e=>`
            <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid var(--border); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='transparent'">
                <input type="checkbox" class="bulk-product-checkbox" value="${e.id}" checked style="width:18px; height:18px; cursor:pointer;">
                <span style="font-size:15px; font-weight:500;">${u(e.name)}</span>
                <span style="margin-left:auto; font-size:14px; font-weight:600; color:var(--accent)">${c(e.price)}</span>
            </div>
        `).join(``)}catch(e){console.error(`Error fetching products for review:`,e),document.getElementById(`bulk-products-container`).innerHTML=`<div style="padding:40px; text-align:center; color:var(--danger); font-weight:500;">${o(`Xatolik`)}: ${e.message}</div>`,a(e.message,`error`)}},window.handleBulkDeleteFinal=async function(e,t){let n=document.querySelectorAll(`.bulk-product-checkbox:checked`),r=Array.from(n).map(e=>e.value);if(r.length===0){a(o(`Kamida bitta mahsulotni tanlang`),`warning`);return}if(confirm(o(`Haqiqatan ham tanlangan mahsulotlarni o'chirmoqchimisiz?`)))try{await s.delete(`/products/bulk?businessId=${t}&ids=${r.join(`,`)}`),await s.post(`/products/bulk/requests/${e}/status?status=approved`),a(o(`Mahsulotlar muvaffaqiyatli o'chirildi`),`success`),renderBulkDelete()}catch(e){a(e.message,`error`)}},window.handleBulkDeleteReject=async function(e){if(confirm(o(`Ushbu so'rovni rad etmoqchimisiz?`)))try{await s.post(`/products/bulk/requests/${e}/status?status=rejected`),a(o(`So'rov rad etildi`),`success`),renderBulkDelete()}catch(e){a(e.message,`error`)}};function Jr(){let e=d();document.getElementById(`page-content`).innerHTML=`
        <div class="container-fluid" style="max-width: 800px; margin: 20px auto;">
            <div class="card card-danger">
                <div class="card-header" style="background: var(--danger-gradient); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                    <h3 style="margin:0; display:flex; align-items:center; gap:10px;">
                        <i data-lucide="alert-triangle"></i> ${o(`Ommaviy o'chirish`)}
                    </h3>
                </div>
                <div class="card-body" style="padding: 30px;">
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; color: var(--text-secondary);">
                        ${o(`Ushbu sahifa orqali barcha mahsulotlarni yoki ma'lum bir kategoriya mahsulotlarini ommaviy o'chirib tashlashingiz mumkin.`)}
                    </p>
                    
                    <div class="form-group mb-4">
                        <label style="display:block; margin-bottom:10px; font-weight:600;">${o(`Kategoriya bo'yicha saralash`)}</label>
                        <select class="form-control" id="bulk-category-selector" onchange="loadBulkProducts()" style="height: 45px; font-size: 16px;">
                            <option value="">-- ${o(`Barcha mahsulotlar`)} --</option>
                        </select>
                    </div>

                    <div id="bulk-products-list" class="mb-4" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h4 style="margin:0">${o(`Mahsulotlar`)}</h4>
                            <label style="cursor:pointer; font-size:14px; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                                <input type="checkbox" id="bulk-select-all" onclick="toggleAllBulkProducts(this)" style="width:16px; height:16px;"> ${o(`Hammasini tanlash`)}
                            </label>
                        </div>
                        <div id="bulk-products-container" style="max-height: 350px; overflow-y: auto; border: 2px solid var(--border); border-radius: 12px; background: var(--bg-input);">
                        </div>
                    </div>

                    <div style="background: rgba(var(--danger-rgb), 0.1); border-left: 4px solid var(--danger); padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                        <p style="margin:0; color: var(--danger); font-weight: 500;">
                            <strong>${o(`Diqqat`)}!</strong> ${o(`Bu amalni ortga qaytarib bo'lmaydi!`)}
                        </p>
                    </div>

                    <div class="bulk-actions-grid" style="margin-top:20px;">
                        <button class="btn btn-warning btn-lg" onclick="handleBulkDelete()" style="height: 50px; font-weight: 600; font-size: 16px; border-radius: 10px;">
                            <span class="icon">📤</span> ${o(`Ommaviy o'chirishi tasdiqlashga yuborish`)}
                        </button>
                        <button class="btn btn-success btn-lg" onclick="navigateTo('products')" style="height: 50px; font-weight: 600; font-size: 16px; border-radius: 10px;">
                            <span class="icon">↩️</span> ${o(`Bekor qilish`)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,typeof lucide<`u`&&lucide.createIcons(),s.get(`/categories?businessId=${e}`).then(e=>{let t=document.getElementById(`bulk-category-selector`);t&&(e||[]).forEach(e=>{let n=document.createElement(`option`);n.value=e.id,n.textContent=e.name,t.appendChild(n)})}).catch(console.error)}window.loadBulkProducts=async function(){let e=d(),t=document.getElementById(`bulk-category-selector`).value,n=document.getElementById(`bulk-products-list`),r=document.getElementById(`bulk-products-container`);if(!t){n.style.display=`none`;return}n.style.display=`block`,r.innerHTML=`<div style="padding:40px; text-align:center; color:var(--text-muted)"><div class="spinner" style="margin: 0 auto 10px auto;"></div>${o(`Yuklanmoqda...`)}</div>`;try{let n=await s.get(`/products?businessId=${e}&categoryId=${t}`);if(!n||n.length===0){r.innerHTML=`<div style="padding:40px; text-align:center; color:var(--text-muted)">${o(`Mahsulotlar topilmadi`)}</div>`;return}r.innerHTML=n.map(e=>`
            <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid var(--border); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='transparent'">
                <input type="checkbox" class="bulk-product-checkbox" value="${e.id}" style="width:18px; height:18px; cursor:pointer;">
                <span style="font-size:15px; font-weight:500;">${u(e.name)}</span>
                <span style="margin-left:auto; font-size:14px; font-weight:600; color:var(--accent)">${c(e.price)}</span>
            </div>
        `).join(``);let i=document.getElementById(`bulk-select-all`);i&&(i.checked=!1)}catch(e){r.innerHTML=`<div style="padding:20px; color:var(--danger); text-align:center;">${e.message}</div>`}},window.toggleAllBulkProducts=function(e){document.querySelectorAll(`.bulk-product-checkbox`).forEach(t=>t.checked=e.checked)},window.handleBulkDelete=async function(){let e=d(),t=document.getElementById(`bulk-category-selector`),n=t?t.value:``,r=document.querySelectorAll(`.bulk-product-checkbox:checked`),i=Array.from(r).map(e=>e.value);if(i.length===0){a(o(`Kamida bitta mahsulotni tanlang`),`warning`);return}let c=o(`O'chirish so'rovini tasdiqlashga yubormoqchimisiz?`);if(confirm(c))try{await s.post(`/products/bulk/request`,{businessId:parseInt(e),categoryId:n?parseInt(n):null,productIds:i.join(`,`)}),a(o(`So'rov muvaffaqiyatli yuborildi`),`success`),Z(`products`)}catch(e){a(e.message||o(`Xatolik`),`error`)}};