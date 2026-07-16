/* 
   Shreeram Solar — Premium SaaS Dashboard Controller
   Provides clean login authentication, list rendering, CRUD editing, 
   and settings synchronization with local databases.
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MINIMAL AUTHENTICATION ---
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginBtn = document.getElementById('login-btn');
    const adminIdInput = document.getElementById('admin-id');
    const adminPassInput = document.getElementById('admin-pass');
    const loginError = document.getElementById('login-error');

    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'flex';
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const id = adminIdInput.value.trim();
            const pass = adminPassInput.value.trim();

            if (id === 'shreeramsolar@2004' && pass === '2004@shreeramsolar') {
                sessionStorage.setItem('admin_logged_in', 'true');
                if (loginScreen) loginScreen.style.display = 'none';
                if (adminDashboard) adminDashboard.style.display = 'flex';
                triggerAdminToast('Login Successful!', 'success');
            } else {
                if (loginError) loginError.textContent = 'Invalid ID or Password';
            }
        });

        [adminIdInput, adminPassInput].forEach(inp => {
            inp.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginBtn.click();
            });
        });
    }

    // --- 2. WORKSPACE TAB NAVIGATION ---
    const navItems = document.querySelectorAll('.admin-nav-item');
    const tabs = document.querySelectorAll('.admin-tab');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetTab = document.getElementById(targetId);
            if (targetTab) targetTab.classList.add('active');
        });
    });

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('admin_logged_in');
            window.location.reload();
        });
    }

    // Toast triggers
    function triggerAdminToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.zIndex = '99999';
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span style="margin-left:8px;">${msg}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    // --- 3. CRUD: TESTIMONIALS ---
    let testimonials = JSON.parse(localStorage.getItem('sr_testimonials')) || [];
    const tForm = document.getElementById('admin-testimonial-form');
    const tList = document.getElementById('admin-testimonials-list');

    const renderTestimonials = () => {
        if (!tList) return;
        tList.innerHTML = '';
        if (testimonials.length === 0) {
            tList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No testimonials added yet.</p>';
            return;
        }

        testimonials.forEach((t, idx) => {
            const row = document.createElement('div');
            row.className = 'admin-list-item';
            row.innerHTML = `
                <div>
                    <h4>${t.name}</h4>
                    <p>${t.role} &mdash; <i>"${t.quote.substring(0, 45)}..."</i></p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small btn-edit t-edit" data-index="${idx}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-small btn-delete t-del" data-index="${idx}"><i class="fas fa-trash"></i> Remove</button>
                </div>
            `;
            tList.appendChild(row);
        });

        // Testimonial Delete
        tList.querySelectorAll('.t-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                testimonials.splice(idx, 1);
                localStorage.setItem('sr_testimonials', JSON.stringify(testimonials));
                triggerAdminToast('Testimonial removed', 'success');
                renderTestimonials();
            });
        });

        // Testimonial Edit
        tList.querySelectorAll('.t-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const t = testimonials[idx];
                
                document.getElementById('t-name').value = t.name;
                document.getElementById('t-role').value = t.role;
                document.getElementById('t-quote').value = t.quote;
                document.getElementById('t-img').value = t.img || '';

                const submitBtn = tForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Testimonial';
                submitBtn.style.backgroundColor = 'var(--blue-primary)';
            });
        });
    };

    if (tForm) {
        tForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = tForm.querySelector('button[type="submit"]');
            
            const itemData = {
                name: document.getElementById('t-name').value.trim(),
                role: document.getElementById('t-role').value.trim(),
                quote: document.getElementById('t-quote').value.trim(),
                img: document.getElementById('t-img').value.trim()
            };

            if (submitBtn.innerHTML.includes('Update')) {
                // simple search matching author
                let editIdx = -1;
                testimonials.forEach((val, idx) => {
                    if (val.name === itemData.name) editIdx = idx;
                });
                
                if (editIdx > -1) {
                    testimonials[editIdx] = itemData;
                } else {
                    testimonials.push(itemData);
                }
                triggerAdminToast('Testimonial updated', 'success');
            } else {
                testimonials.push(itemData);
                triggerAdminToast('Testimonial added', 'success');
            }

            localStorage.setItem('sr_testimonials', JSON.stringify(testimonials));
            tForm.reset();
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Testimonial';
            submitBtn.style.backgroundColor = '';
            renderTestimonials();
        });
    }

    // --- 4. CRUD: INSTALLATION PROJECTS ---
    let projects = JSON.parse(localStorage.getItem('sr_projects')) || [];
    const pForm = document.getElementById('admin-project-form');
    const pList = document.getElementById('admin-projects-list');

    const renderProjects = () => {
        if (!pList) return;
        pList.innerHTML = '';
        if (projects.length === 0) {
            pList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No projects added yet.</p>';
            return;
        }

        projects.forEach((p, idx) => {
            const row = document.createElement('div');
            row.className = 'admin-list-item';
            row.innerHTML = `
                <div>
                    <h4>${p.title}</h4>
                    <p>${p.category.toUpperCase()} &mdash; ${p.location}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small btn-edit p-edit" data-index="${idx}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-small btn-delete p-del" data-index="${idx}"><i class="fas fa-trash"></i> Remove</button>
                </div>
            `;
            pList.appendChild(row);
        });

        pList.querySelectorAll('.p-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                projects.splice(idx, 1);
                localStorage.setItem('sr_projects', JSON.stringify(projects));
                triggerAdminToast('Project removed', 'success');
                renderProjects();
            });
        });

        pList.querySelectorAll('.p-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const p = projects[idx];

                document.getElementById('p-title').value = p.title;
                document.getElementById('p-category').value = p.category;
                document.getElementById('p-location').value = p.location;
                document.getElementById('p-img').value = p.img || '';

                const submitBtn = pForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Project';
                submitBtn.style.backgroundColor = 'var(--blue-primary)';
            });
        });
    };

    if (pForm) {
        pForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = pForm.querySelector('button[type="submit"]');
            
            const itemData = {
                title: document.getElementById('p-title').value.trim(),
                category: document.getElementById('p-category').value,
                location: document.getElementById('p-location').value.trim(),
                img: document.getElementById('p-img').value.trim()
            };

            if (submitBtn.innerHTML.includes('Update')) {
                let editIdx = -1;
                projects.forEach((val, idx) => {
                    if (val.title === itemData.title) editIdx = idx;
                });
                
                if (editIdx > -1) {
                    projects[editIdx] = itemData;
                } else {
                    projects.push(itemData);
                }
                triggerAdminToast('Project updated', 'success');
            } else {
                projects.push(itemData);
                triggerAdminToast('Project added', 'success');
            }

            localStorage.setItem('sr_projects', JSON.stringify(projects));
            pForm.reset();
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Project';
            submitBtn.style.backgroundColor = '';
            renderProjects();
        });
    }

    // --- 5. CRUD: BLOG PUBLISHING ---
    let blogs = JSON.parse(localStorage.getItem('sr_blogs')) || [];
    const bForm = document.getElementById('admin-blog-form');
    const bList = document.getElementById('admin-blogs-list');

    const renderBlogs = () => {
        if (!bList) return;
        bList.innerHTML = '';
        if (blogs.length === 0) {
            bList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No articles published yet.</p>';
            return;
        }

        blogs.forEach((b, idx) => {
            const row = document.createElement('div');
            row.className = 'admin-list-item';
            row.innerHTML = `
                <div>
                    <h4>${b.title}</h4>
                    <p>${b.date || 'LATEST'} &mdash; <i>"${b.content.substring(0, 45)}..."</i></p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small btn-edit b-edit" data-index="${idx}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-small btn-delete b-del" data-index="${idx}"><i class="fas fa-trash"></i> Remove</button>
                </div>
            `;
            bList.appendChild(row);
        });

        bList.querySelectorAll('.b-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                blogs.splice(idx, 1);
                localStorage.setItem('sr_blogs', JSON.stringify(blogs));
                triggerAdminToast('Article removed', 'success');
                renderBlogs();
            });
        });

        bList.querySelectorAll('.b-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const b = blogs[idx];

                document.getElementById('b-title').value = b.title;
                document.getElementById('b-img').value = b.img || '';
                document.getElementById('b-content').value = b.content;

                const submitBtn = bForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Article';
                submitBtn.style.backgroundColor = 'var(--blue-primary)';
            });
        });
    };

    if (bForm) {
        bForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = bForm.querySelector('button[type="submit"]');
            
            const itemData = {
                title: document.getElementById('b-title').value.trim(),
                img: document.getElementById('b-img').value.trim(),
                content: document.getElementById('b-content').value.trim(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
            };

            if (submitBtn.innerHTML.includes('Update')) {
                let editIdx = -1;
                blogs.forEach((val, idx) => {
                    if (val.title === itemData.title) editIdx = idx;
                });
                
                if (editIdx > -1) {
                    blogs[editIdx] = itemData;
                } else {
                    blogs.push(itemData);
                }
                triggerAdminToast('Article updated', 'success');
            } else {
                blogs.push(itemData);
                triggerAdminToast('Article published', 'success');
            }

            localStorage.setItem('sr_blogs', JSON.stringify(blogs));
            bForm.reset();
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Article';
            submitBtn.style.backgroundColor = '';
            renderBlogs();
        });
    }

    // --- 6. CALCULATOR AND SEO CONFIGS ---
    const calcForm = document.getElementById('admin-calc-settings-form');
    if (calcForm) {
        let settings = JSON.parse(localStorage.getItem('sr_calc_settings')) || { yield: 0.15, co2: 0.0024 };
        document.getElementById('c-yield').value = settings.yield;
        document.getElementById('c-co2').value = settings.co2;

        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {
                yield: parseFloat(document.getElementById('c-yield').value),
                co2: parseFloat(document.getElementById('c-co2').value)
            };
            localStorage.setItem('sr_calc_settings', JSON.stringify(updated));
            triggerAdminToast('Calculator parameters saved', 'success');
        });
    }

    const seoForm = document.getElementById('admin-seo-form');
    if (seoForm) {
        let currentSEO = JSON.parse(localStorage.getItem('sr_seo_settings')) || {
            title: "Shreeram Solar | India's Most Trusted Solar Company",
            description: "Shreeram Solar is the top solar company in Rajasthan, providing expert solar panel installation for homes, businesses, and industries in Jaipur, Sikar, and across Rajasthan.",
            keywords: "solar company in rajasthan, top solar installation in rajasthan, shreeram solar, solar panels jaipur, solar panels Sikar"
        };

        document.getElementById('seo-title').value = currentSEO.title;
        document.getElementById('seo-desc').value = currentSEO.description;
        document.getElementById('seo-keywords').value = currentSEO.keywords;

        seoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {
                title: document.getElementById('seo-title').value.trim(),
                description: document.getElementById('seo-desc').value.trim(),
                keywords: document.getElementById('seo-keywords').value.trim()
            };
            localStorage.setItem('sr_seo_settings', JSON.stringify(updated));
            triggerAdminToast('Global SEO tags applied', 'success');
        });
    }

    // --- 7. LEADS LIST INBOX ---
    const leadsList = document.getElementById('admin-leads-list');
    const renderLeads = () => {
        if (!leadsList) return;
        leadsList.innerHTML = '';
        
        const leads = JSON.parse(localStorage.getItem('sr_leads')) || [];
        if (leads.length === 0) {
            leadsList.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No pending inquiries in inbox.</p>';
            return;
        }

        leads.forEach((l, idx) => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <div>
                    <h4>${l.name} (${l.phone})</h4>
                    <p><b>Date:</b> ${l.date} | <b>Email:</b> ${l.email || 'N/A'}</p>
                    <p style="font-size:0.85rem; color:var(--text-primary); margin-top:6px;">${l.message || 'No additional message.'}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-small btn-delete lead-del" data-index="${idx}"><i class="fas fa-check"></i> Archive</button>
                </div>
            `;
            leadsList.appendChild(item);
        });

        leadsList.querySelectorAll('.lead-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                leads.splice(idx, 1);
                localStorage.setItem('sr_leads', JSON.stringify(leads));
                triggerAdminToast('Lead archived', 'success');
                renderLeads();
            });
        });
    };

    renderTestimonials();
    renderProjects();
    renderBlogs();
    renderLeads();
});
