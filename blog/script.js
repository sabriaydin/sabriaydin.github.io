document.addEventListener("DOMContentLoaded", async () => {
    // URL TEMİZLEYİCİ: Adres çubuğunda "index.html" varsa bunu fark ettirmeden siler
    if (window.location.pathname.endsWith('/index.html')) {
        const cleanUrl = window.location.pathname.replace('/index.html', '/') + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
    }

    const cb = Date.now(); 

    const showError = (msg, err) => {
        document.body.innerHTML += `<div style="background-color:#9e3636; color:#fff; padding:20px; margin:20px; border-radius:5px; text-align:center; z-index:9999; position:relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="margin-bottom:10px;">Sistem Hatası Yakalandı</h3>
            <p>${msg}</p>
            <small style="color:#ddd;">Hata Detayı: ${err}</small>
        </div>`;
        console.error(msg, err);
    };

    try {
        const hRes = await fetch(`./header.html?v=${cb}`);
        if (!hRes.ok) throw new Error("header.html bulunamadı");
        document.getElementById('header-placeholder').innerHTML = await hRes.text();
        
        const fRes = await fetch(`./footer.html?v=${cb}`);
        if (!fRes.ok) throw new Error("footer.html bulunamadı");
        document.getElementById('footer-placeholder').innerHTML = await fRes.text();
    } catch (err) { 
        showError("Arayüz (Header/Footer) yüklenirken bir sorun oluştu.", err); 
    }

    const container = document.getElementById('blog-container');
    if (container) {
        try {
            const pRes = await fetch(`./posts.json?v=${cb}`);
            if (!pRes.ok) throw new Error("posts.json dosyası bulunamadı veya okunamadı.");
            const allPosts = await pRes.json();
            
            let currentPage = 1;
            const postsPerPage = 5;
            let currentSearch = '';
            let lastRenderState = ''; 
            
            const urlParams = new URLSearchParams(window.location.search);
            const currentCategory = urlParams.get('category');

            const normalizeStr = (str) => {
                if (str === null || str === undefined) return '';
                return String(str).toLocaleLowerCase('tr-TR')
                          .replace(/ı/g, 'i').replace(/ğ/g, 'g')
                          .replace(/ü/g, 'u').replace(/ş/g, 's')
                          .replace(/ö/g, 'o').replace(/ç/g, 'c').trim();
            };

            const render = () => {
                let filtered = allPosts;
                
                if (currentCategory) {
                    filtered = filtered.filter(p => {
                        if (!p.category) return false;
                        return normalizeStr(p.category) === normalizeStr(currentCategory);
                    });
                }
                
                if (currentSearch) {
                    filtered = filtered.filter(p => 
                        normalizeStr(p.title).includes(normalizeStr(currentSearch)) || 
                        normalizeStr(p.summary).includes(normalizeStr(currentSearch))
                    );
                }

                const totalPages = Math.ceil(filtered.length / postsPerPage);
                if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
                if (currentPage < 1) currentPage = 1;
                
                const start = (currentPage - 1) * postsPerPage;
                const paginated = filtered.slice(start, start + postsPerPage);

                const currentState = paginated.map(p => p.id).join('-') + '|' + currentCategory + '|' + (paginated.length === 0 ? currentSearch : '');
                if (lastRenderState === currentState) return; 
                lastRenderState = currentState;

                // YENİ: Göz Kırpmayı Önleyen Sanal DOM (DocumentFragment) Kullanımı
                const fragment = document.createDocumentFragment();
                
                if (currentCategory) {
                    const catTitle = document.createElement('h3');
                    catTitle.style.cssText = "margin-bottom: 25px; color: var(--accent-red); font-size: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 10px; text-transform:uppercase; letter-spacing:1px;";
                    catTitle.textContent = `KATEGORİ: ${currentCategory}`;
                    fragment.appendChild(catTitle);
                }

                if (paginated.length === 0) {
                    const noResult = document.createElement('p');
                    noResult.style.cssText = "text-align:center; color:#999; margin-top:20px; font-size:1.1rem;";
                    noResult.textContent = "Bu kriterlere uygun içerik henüz bulunmuyor.";
                    fragment.appendChild(noResult);
                } else {
                    paginated.forEach(p => {
                        const article = document.createElement('article');
                        article.className = 'post-card';
                        article.innerHTML = `
                            <h2><a href="${p.url}">${p.title}</a></h2>
                            <span class="date">${p.date}</span>
                            <p>${p.summary}</p>
                            <a href="${p.url}" class="read-more">Devamını Oku &rarr;</a>
                        `;
                        fragment.appendChild(article);
                    });
                }

                if (totalPages > 1) {
                    const paginationDiv = document.createElement('div');
                    paginationDiv.className = 'pagination';
                    
                    const prevBtn = document.createElement('button');
                    prevBtn.innerHTML = '&larr; Geri';
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.onclick = () => { 
                        currentPage--; 
                        render(); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    };
                    
                    const pageInfo = document.createElement('span');
                    pageInfo.className = 'page-info';
                    pageInfo.textContent = `Sayfa ${currentPage} / ${totalPages}`;
                    
                    const nextBtn = document.createElement('button');
                    nextBtn.innerHTML = 'İleri &rarr;';
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.onclick = () => { 
                        currentPage++; 
                        render(); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    };

                    paginationDiv.appendChild(prevBtn);
                    paginationDiv.appendChild(pageInfo);
                    paginationDiv.appendChild(nextBtn);
                    fragment.appendChild(paginationDiv);
                }

                // Ekranı temizleyip Sanal DOM'u tek hamlede yükleyerek parlamayı engeller
                container.innerHTML = '';
                container.appendChild(fragment);
            };

            render();

            let debounceTimer;
            setTimeout(() => {
                const search = document.getElementById('blog-search');
                if (search) {
                    search.addEventListener('input', (e) => {
                        clearTimeout(debounceTimer); 
                        debounceTimer = setTimeout(() => { 
                            currentSearch = e.target.value;
                            currentPage = 1; 
                            render();
                        }, 300); 
                    });
                }
            }, 300);

        } catch (err) { 
            showError("Yazılar veritabanından (posts.json) çekilemedi.", err); 
        }
    }
});

// Kaynak Koduna Erişimi Zorlaştıran Eklemeler
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', event => {
    if (event.key === 'F12' || 
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) || 
        (event.ctrlKey && event.key === 'U')) {
        event.preventDefault();
    }
});