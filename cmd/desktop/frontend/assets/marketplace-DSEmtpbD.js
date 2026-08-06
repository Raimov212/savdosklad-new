import"./api-CkWzOOJ-.js";var e=[],n=[],r=null;async function i(){console.log(`Marketplace initializing...`);try{localStorage.getItem(`mpSidebarHidden`)===`true`&&document.getElementById(`mp-sidebar`).classList.add(`hidden`);let e=localStorage.getItem(`appTheme`)||`dark`;document.documentElement.setAttribute(`data-theme`,e),a(e);let n=localStorage.getItem(`appLang`)||`uz`;document.getElementById(`mp-lang-selector`).value=n,typeof lucide<`u`&&lucide.createIcons(),c(),await u(),await d(),console.log(`Marketplace initialization complete`)}catch(e){console.error(`Marketplace init error:`,e)}document.getElementById(`mp-login-form`).onsubmit=o,document.getElementById(`mp-register-form`).onsubmit=s}window.toggleTheme=()=>{let e=(document.documentElement.getAttribute(`data-theme`)||`dark`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`appTheme`,e),a(e)};function a(e){let n=document.getElementById(`theme-icon`);n&&(n.setAttribute(`data-lucide`,e===`dark`?`sun`:`moon`),typeof lucide<`u`&&lucide.createIcons())}window.openAuthModal=e=>{let n=document.getElementById(`auth-modal`);n.style.display=`flex`,document.body.classList.add(`modal-active`);let r=e===`login`;document.getElementById(`auth-modal-title`).textContent=t(r?`Kirish`:`Ro'yxatdan o'tish`),document.getElementById(`mp-login-form`).style.display=r?`block`:`none`,document.getElementById(`mp-register-form`).style.display=r?`none`:`block`},window.closeAuthModal=()=>{document.getElementById(`auth-modal`).style.display=`none`,document.body.classList.remove(`modal-active`)};async function o(e){e.preventDefault();let n=document.getElementById(`login-phone`).value,r=document.getElementById(`login-password`).value;try{let e=await api.post(`/marketplace/auth/login`,{phoneNumber:n,password:r});api.setCustomerToken(e.token),localStorage.setItem(`customer_user`,JSON.stringify(e.customer)),closeAuthModal(),c(),alert(t(`Xush kelibsiz!`))}catch(e){alert(e.message)}}async function s(e){e.preventDefault();let n=document.getElementById(`reg-firstname`).value,r=document.getElementById(`reg-lastname`).value,i=document.getElementById(`reg-phone`).value,a=document.getElementById(`reg-password`).value;if(a!==document.getElementById(`reg-confirm`).value)return alert(t(`Parollar mos kelmadi`));if(!/^\+998\d{9}$/.test(i))return alert(t(`Telefon raqami noto'g'ri formatda`));try{await api.post(`/marketplace/auth/register`,{firstName:n,lastName:r,phoneNumber:i,password:a}),alert(t(`Muvaffaqiyatli ro'yxatdan o'tdingiz. Endi tizimga kiring.`)),openAuthModal(`login`)}catch(e){alert(e.message)}}function c(){let e=document.getElementById(`mp-auth-section`),n=api.getCustomerUser();n?e.innerHTML=`
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:700;">${n.firstName}</span>
                        <button class="btn btn-ghost" style="padding:8px;" onclick="logout()" title="Chiqish">
                            <i data-lucide="log-out" style="width:18px;"></i>
                        </button>
                    </div>
                `:e.innerHTML=`<button class="btn btn-primary" onclick="openAuthModal('login')" data-i18n="Kirish">Kirish</button>`,lucide.createIcons()}window.logout=()=>{localStorage.removeItem(`customer_token`),localStorage.removeItem(`customer_user`),location.reload()},window.showOrdersLayout=async()=>{if(!api.getCustomerUser())return openAuthModal(`login`);document.getElementById(`orders-layout`).style.display=`block`,await l()},window.hideOrdersLayout=()=>document.getElementById(`orders-layout`).style.display=`none`;async function l(){let e=document.getElementById(`orders-list-container`);e.innerHTML=`<div style="text-align:center; padding:50px; opacity:0.5;">Yuklanmoqda...</div>`;try{e.innerHTML=(await api.get(`/marketplace/orders/my`)||[]).map(e=>`
                    <div style="background:var(--mp-card); border:1px solid var(--mp-border); border-radius:24px; padding:30px; margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
                            <div>
                                <div style="font-size:20px; font-weight:800;">Buyurtma №${e.id}</div>
                                <div style="font-size:14px; color:var(--mp-primary); font-weight:700; margin-top:5px;">${e.businessName||``}</div>
                                <div style="opacity:0.5; font-size:13px; margin-top:2px;">${new Date(e.createdAt).toLocaleString()}</div>
                            </div>
                            <span class="status-badge status-${e.status.toLowerCase()}">${t(e.status)}</span>
                        </div>
                        <div style="border-top:1px dashed var(--mp-border); padding:20px 0;">
                            ${(e.items||[]).map(e=>`
                                <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px;">
                                    <img src="${e.product?.images||`https://via.placeholder.com/80`}" style="width:80px; height:80px; border-radius:15px; object-fit:cover; background:rgba(255,255,255,0.05);">
                                    <div style="flex:1;">
                                        <div style="font-size:16px; font-weight:700;">${e.product?.name}</div>
                                        <div style="font-size:13px; opacity:0.5; margin-top:4px;">${e.product?.categoryName||t(`Turkumlanmagan`)}</div>
                                        <div style="font-size:14px; margin-top:8px;">${e.quantity} x ${e.price.toLocaleString()} so'm</div>
                                    </div>
                                    <div style="font-weight:800; color:var(--mp-secondary);">
                                        ${(e.price*e.quantity).toLocaleString()} so'm
                                    </div>
                                </div>
                            `).join(``)}
                        </div>
                        <div style="text-align:right; font-size:18px; font-weight:900; color:var(--mp-secondary);">
                            Jami: ${e.totalSum.toLocaleString()} so'm
                        </div>
                    </div>
                `).join(``)||`<div style="text-align:center; padding:100px; opacity:0.3;">${t(`Hozircha buyurtmalar yo'q`)}</div>`}catch(n){e.innerHTML=`<div class="error">${n.message}</div>`}}async function u(){let e=await api.get(`/marketplace/categories`).catch(()=>[]),n=document.getElementById(`mp-categories-list`);n.innerHTML+=e.map(e=>`<button class="btn btn-ghost" style="justify-content:start; width:100%" onclick="filterByCategory(${e.id})">${e.name}</button>`).join(``)}async function d(){console.log(`Loading products...`);try{let n=await api.get(`/marketplace/products`);console.log(`Products response:`,n),e=n.products||[],f()}catch(n){console.error(`Load products error:`,n),e=[],f()}}function f(){let n=document.getElementById(`products-grid`);n.innerHTML=(r?e.filter(e=>e.marketplaceCategoryId===r):e).map(e=>`
                <div class="product-card">
                    <div style="position:relative;">
                        <img src="${e.images||`https://via.placeholder.com/300`}" class="product-img" onerror="this.src='https://via.placeholder.com/300'">
                        <span style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); padding:4px 12px; border-radius:10px; font-size:11px; font-weight:700; color:var(--mp-primary); border:1px solid rgba(255,255,255,0.1);">
                            ${e.categoryName||t(`Turkumlanmagan`)}
                        </span>
                    </div>
                    <h3 style="margin:0 0 5px 0; font-size:17px;">${e.name}</h3>
                    <p style="font-size:12px; opacity:0.6; margin:0 0 15px 0; font-weight:600;">${e.businessName||``}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                        <span style="font-size:18px; font-weight:800; color:var(--mp-secondary);">${(e.price||0).toLocaleString()} so'm</span>
                        <button class="btn btn-primary" style="padding:8px 12px;" onclick="addToCart(${e.id})" title="${t(`Savatga qo'shish`)}">
                            <i data-lucide="plus" style="width:20px;"></i>
                        </button>
                    </div>
                </div>
            `).join(``),lucide.createIcons()}window.filterByCategory=e=>{r=e,f()},window.toggleCart=()=>document.getElementById(`cart-drawer`).classList.toggle(`open`),window.toggleSidebar=()=>{let e=document.getElementById(`mp-sidebar`);e.classList.toggle(`hidden`),localStorage.setItem(`mpSidebarHidden`,e.classList.contains(`hidden`))},window.addToCart=r=>{let i=e.find(e=>e.id===r),a=n.find(e=>e.id===r);a?a.qty++:n.push({...i,qty:1}),p(),toggleCart()};function p(){let e=document.getElementById(`cart-items`),r=n.reduce((e,n)=>e+n.qty,0);document.getElementById(`cart-count`).textContent=r;let i=0;e.innerHTML=n.map(e=>(i+=e.price*e.qty,`
                    <div style="display:flex; gap:15px; margin-bottom:20px; align-items:center;">
                        <img src="${e.images||``}" style="width:50px; height:50px; border-radius:10px; object-fit:cover;">
                        <div style="flex:1;">
                            <div style="font-size:14px; font-weight:700;">${e.name}</div>
                            <div style="font-size:11px; opacity:0.5; margin-bottom:2px;">${e.businessName||``}</div>
                            <div style="font-size:12px; color:var(--mp-secondary);">${e.price.toLocaleString()} so'm</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:4px; border-radius:10px;">
                            <button class="btn btn-ghost" style="padding:2px;" onclick="changeQty(${e.id}, -1)">-</button>
                            <span style="min-width:20px; text-align:center;">${e.qty}</span>
                            <button class="btn btn-ghost" style="padding:2px;" onclick="changeQty(${e.id}, 1)">+</button>
                        </div>
                    </div>
                `)).join(``)||`<div style="text-align:center; padding:50px; opacity:0.3;">${t(`Savat bo'sh`)}</div>`,document.getElementById(`cart-total`).textContent=`${i.toLocaleString()} so'm`}window.changeQty=(e,r)=>{let i=n.find(n=>n.id===e);i.qty+=r,i.qty<=0&&(n=n.filter(n=>n.id!==e)),p()},window.handleCheckout=async()=>{if(n.length!==0){if(!api.getCustomerUser())return openAuthModal(`login`);try{await api.post(`/marketplace/orders`,{items:n.map(e=>({marketplaceProductId:e.id,quantity:e.qty}))}),alert(t(`Buyurtma qabul qilindi!`)),n=[],p(),toggleCart()}catch(e){alert(e.message)}}},i();