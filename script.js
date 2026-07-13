/* 
   Maharaj Solar — Premium Interactive Javascript Overhaul
   Provides world-class scroll reveal, counter animations, responsive slider cockpit math, 
   dynamic localStorage data bindings, and clean feedback toasts.
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PREMIUM PAGE CURTAIN LOADER ---
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(loader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('loaded');
            setTimeout(() => loader.remove(), 800);
        }, 200);
    });

    // Fallback if load event doesn't fire fast enough
    setTimeout(() => {
        if (document.querySelector('.page-loader')) {
            loader.classList.add('loaded');
            setTimeout(() => loader.remove(), 800);
        }
    }, 1800);

    // --- 2. FLOATING MENU INTERACTIVITY ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-links');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('show');
            
            // Hamburger animation
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close on link clicks
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('show');
                hamburger.querySelectorAll('span').forEach(s => s.style.transform = 'none');
                hamburger.querySelectorAll('span')[1].style.opacity = '1';
            });
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('show');
                hamburger.querySelectorAll('span').forEach(s => s.style.transform = 'none');
                hamburger.querySelectorAll('span')[1].style.opacity = '1';
            }
        });
    }

    // Scroll header scroll-class toggle
    const headerNav = document.querySelector('.header-nav');
    if (headerNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                headerNav.classList.add('scrolled');
            } else {
                headerNav.classList.remove('scrolled');
            }
        });
    }

    // --- 3. SCROLL BOUND REVEALS & STATS COUNTERS ---
    const revealOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger counter animations if any
                const counter = entry.target.querySelector('.counter');
                if (counter) {
                    animateCounter(counter);
                }
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const elementsToReveal = document.querySelectorAll('.reveal-fade-up, .reveal-fade-in');
    elementsToReveal.forEach(el => revealObserver.observe(el));

    function animateCounter(counterEl) {
        const target = parseInt(counterEl.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        const duration = 2000;
        const fps = 60;
        const totalFrames = Math.round(duration / (1000 / fps));
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out quad
            const val = Math.round(target * (progress * (2 - progress)));
            counterEl.innerText = val;

            if (frame >= totalFrames) {
                clearInterval(timer);
                counterEl.innerText = target;
            }
        }, 1000 / fps);
    }

    // --- 4. CORE SAVINGS CALCULATOR MATH ---
    const billSlider = document.getElementById('billRange');
    const billVal = document.getElementById('billValue');
    const sizeSlider = document.getElementById('sizeRange');
    const sizeVal = document.getElementById('sizeValue');
    
    const monthlySavingsText = document.getElementById('monthlySavings');
    const paybackPeriodText = document.getElementById('paybackPeriod');
    const co2OffsetText = document.getElementById('co2Offset');
    const lifetimeSavingsText = document.getElementById('lifetimeSavings');

    if (billSlider && sizeSlider) {
        const calculateSavings = () => {
            const monthlyBill = parseInt(billSlider.value, 10);
            const systemSize = parseFloat(sizeSlider.value);
            
            billVal.innerText = `₹${monthlyBill.toLocaleString('en-IN')}`;
            sizeVal.innerText = `${systemSize} kW`;

            // Rajasthan pricing metrics: 1 kW generates ~120 kWh per month
            const generationPerKW = 120;
            const rate = 8.00;
            
            const maxSavingsPossible = monthlyBill * 0.90; // net metering grid cap
            const calculatedMonthlySavings = Math.min(systemSize * generationPerKW * rate, maxSavingsPossible);
            
            // Estimated system cost: ~ ₹55,000 per kW (net after PM subsidy benefits)
            const systemCost = systemSize * 55000;
            const yearlySavings = calculatedMonthlySavings * 12;
            
            const paybackYears = yearlySavings > 0 ? (systemCost / yearlySavings) : 0;
            const co2OffsetTons = (systemSize * 1.5).toFixed(1); 
            const lifetimeSavings = calculatedMonthlySavings * 12 * 25; 
            
            // UI bindings
            if (monthlySavingsText) monthlySavingsText.innerText = `₹${Math.round(calculatedMonthlySavings).toLocaleString('en-IN')}`;
            if (paybackPeriodText) paybackPeriodText.innerText = `${paybackYears.toFixed(1)} Yrs`;
            if (co2OffsetText) co2OffsetText.innerText = `${co2OffsetTons} Tons/Yr`;
            if (lifetimeSavingsText) lifetimeSavingsText.innerText = `₹${Math.round(lifetimeSavings).toLocaleString('en-IN')}`;
        };

        billSlider.addEventListener('input', calculateSavings);
        sizeSlider.addEventListener('input', calculateSavings);
        calculateSavings();
    }

    // --- 5. INITIALIZE LOCAL STORAGE DB ---
    const initLocalStorageDefaults = () => {
        const defaultTestimonials = [
            {
                name: "Rajesh Sharma",
                role: "Homeowner, Murlipura",
                quote: "My monthly electricity bill dropped from ₹4,500 to just ₹350 after Maharaj Solar installed a 5kW system. The team completed the work in just 2 days. Best investment!",
                img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
            },
            {
                name: "Sunil Agarwal",
                role: "Director, Agrawal Sweets",
                quote: "We got a 20kW commercial system for our store roof. The cost savings have been excellent, saving almost ₹18,000 monthly. Exceptional after-sales service.",
                img: ""
            },
            {
                name: "Priya Meena",
                role: "Resident, Vaishali Nagar",
                quote: "Their guidance regarding government subsidy applications was clean. Maharaj Solar handled all DISCOM paperwork. Highly recommended for home installations.",
                img: ""
            }
        ];

        const defaultProjects = [
            { title: "Residential — 5kW System", category: "residential", location: "Murlipura, Jaipur", img: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80" },
            { title: "Commercial — 20kW System", category: "commercial", location: "Vaishali Nagar, Jaipur", img: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80" },
            { title: "Industrial — 100kW Plant", category: "industrial", location: "Sitapura Industrial Area", img: "images/industrial-premium.png" },
            { title: "Rooftop — 3kW System", category: "residential", location: "Shekhawati Nagar, Jaipur", img: "images/hero-premium.png" },
            { title: "Residential — 8kW System", category: "residential", location: "Jagatpura, Jaipur", img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80" },
            { title: "Office Complex — 15kW", category: "commercial", location: "Malviya Nagar, Jaipur", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" }
        ];

        const defaultBlogs = [
            {
                title: "How to Apply for Solar Subsidy in Rajasthan (2026 Guide)",
                date: "JUNE 18, 2026",
                img: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
                content: "Applying for rooftop solar subsidies is easier than ever. The government provides direct financial assistance under the PM-Surya Ghar Yojana. Read details on eligibility, paperwork, and DISCOM clearances to save up to ₹78,000 on installation."
            },
            {
                title: "On-Grid vs Off-Grid Solar Systems: Which is Best for You?",
                date: "MAY 25, 2026",
                img: "images/hero-premium.png",
                content: "Are you confused between selling energy back to the grid or storing it in batteries? For most homes in cities like Jaipur with low power outages, On-Grid systems are highly cost-efficient due to net metering rewards. Off-Grid is ideal for farmhouses."
            },
            {
                title: "Top 5 Maintenance Tips to Keep Your Solar Panels at Peak Efficiency",
                date: "APRIL 10, 2026",
                img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
                content: "Dust build-up can block sun rays and lower your generation capacity by up to 15%. In dusty Rajasthan climates, clean your solar modules twice a week using plain water. Never use harsh abrasive chemicals or wire brushes."
            }
        ];

        if (!localStorage.getItem('sr_testimonials')) {
            localStorage.setItem('sr_testimonials', JSON.stringify(defaultTestimonials));
        }
        if (!localStorage.getItem('sr_projects')) {
            localStorage.setItem('sr_projects', JSON.stringify(defaultProjects));
        }
        if (!localStorage.getItem('sr_blogs')) {
            localStorage.setItem('sr_blogs', JSON.stringify(defaultBlogs));
        }
    };

    initLocalStorageDefaults();

    // --- 6. RENDER TESTIMONIALS ---
    const testiGrid = document.getElementById('testimonials-container-grid');
    if (testiGrid) {
        const testimonials = JSON.parse(localStorage.getItem('sr_testimonials')) || [];
        testiGrid.innerHTML = '';
        testimonials.forEach((t, idx) => {
            const card = document.createElement('div');
            card.className = `testimonial-card reveal-fade-up delay-${(idx % 3) + 1}`;
            
            const userMedia = t.img ? 
                `<img src="${t.img}" alt="${t.name}" class="testimonial-avatar">` : 
                `<div class="testimonial-initial">${t.name.charAt(0)}</div>`;

            card.innerHTML = `
                <div>
                    <div class="testimonial-stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-quote">"${t.quote}"</p>
                </div>
                <div class="testimonial-user">
                    ${userMedia}
                    <div class="testimonial-meta">
                        <h4>${t.name}</h4>
                        <p>${t.role}</p>
                    </div>
                </div>
            `;
            testiGrid.appendChild(card);
            revealObserver.observe(card);
        });
    }

    // --- 7. RENDER PROJECTS IN GALLERY ---
    const projectsGrid = document.getElementById('projects-gallery-grid');
    if (projectsGrid) {
        const projects = JSON.parse(localStorage.getItem('sr_projects')) || [];
        projectsGrid.innerHTML = '';
        projects.forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = `gallery-item reveal-fade-up delay-${(idx % 3) + 1}`;
            card.setAttribute('data-category', p.category);
            
            card.innerHTML = `
                <div class="gallery-img-wrap">
                    <img src="${p.img}" alt="${p.title}" loading="lazy">
                </div>
                <div class="gallery-details">
                    <p>${p.category}</p>
                    <h3>${p.title}</h3>
                    <span><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${p.location}</span>
                </div>
            `;
            projectsGrid.appendChild(card);
            revealObserver.observe(card);
        });

        // Filter handlers
        const pills = document.querySelectorAll('.filter-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const filterVal = pill.getAttribute('data-filter');
                const items = projectsGrid.querySelectorAll('.gallery-item');

                items.forEach(item => {
                    const itemCat = item.getAttribute('data-category');
                    if (filterVal === 'all' || itemCat === filterVal) {
                        item.style.display = 'block';
                        setTimeout(() => item.style.opacity = '1', 10);
                    } else {
                        item.style.opacity = '0';
                        setTimeout(() => item.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // --- 8. RENDER BLOG ARTICLES ---
    const blogGrid = document.getElementById('blogs-dynamic-grid');
    if (blogGrid) {
        const blogs = JSON.parse(localStorage.getItem('sr_blogs')) || [];
        blogGrid.innerHTML = '';
        if (blogs.length > 0) {
            blogs.forEach((b, idx) => {
                const article = document.createElement('article');
                article.className = `blog-card reveal-fade-up delay-${(idx % 3) + 1}`;
                
                let textPreview = b.content.replace(/<[^>]*>?/gm, '');
                if (textPreview.length > 130) {
                    textPreview = textPreview.substring(0, 130) + '...';
                }

                article.innerHTML = `
                    <div class="blog-card-img">
                        <img src="${b.img}" alt="${b.title}" loading="lazy">
                    </div>
                    <div class="blog-card-body">
                        <span class="blog-card-date">${b.date || 'LATEST'}</span>
                        <h3>${b.title}</h3>
                        <p>${textPreview}</p>
                        <a href="#" class="blog-card-link read-article-trigger" data-index="${idx}">Read Article &rarr;</a>
                    </div>
                `;
                blogGrid.appendChild(article);
                revealObserver.observe(article);
            });

            blogGrid.querySelectorAll('.read-article-trigger').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const idx = e.target.getAttribute('data-index');
                    const post = blogs[idx];
                    alert(`📖 Maharaj Solar Reader:\n\n${post.title.toUpperCase()}\n\n${post.content}`);
                });
            });
        } else {
            blogGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px;"><p>No articles available.</p></div>';
        }
    }

    // --- 9. FORM CAPTURES & TOASTS ---
    const leadForm = document.getElementById('consultationForm') || document.getElementById('contactForm');
    
    // Create toast container globally
    const toastArea = document.getElementById('toast-container') || document.createElement('div');
    if (!document.getElementById('toast-container')) {
        toastArea.id = 'toast-container';
        document.body.appendChild(toastArea);
    }

    function triggerToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 
            '<i class="fas fa-check-offset" style="color:var(--green-primary);">✓</i>' : 
            '<i class="fas fa-exclamation" style="color:#ef4444;">!</i>';

        toast.innerHTML = `${icon} <span style="margin-left: 8px;">${message}</span>`;
        toastArea.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.35s reverse forwards';
            setTimeout(() => toast.remove(), 350);
        }, 4000);
    }

    if (leadForm) {
        const inputs = leadForm.querySelectorAll('.input-field');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) validateInput(input);
            });
        });

        const validateInput = (input) => {
            const val = input.value.trim();
            let isValid = true;

            if (input.hasAttribute('required') && val === '') {
                isValid = false;
            } else if (input.type === 'email' && val !== '') {
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            } else if (input.id === 'phone' && val !== '') {
                isValid = val.replace(/\D/g, '').length === 10;
            }

            if (isValid) {
                input.classList.remove('is-invalid');
                input.style.borderColor = '';
            } else {
                input.classList.add('is-invalid');
                input.style.borderColor = '#ef4444';
            }
            return isValid;
        };

        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let formValid = true;
            inputs.forEach(input => {
                if (!validateInput(input)) formValid = false;
            });

            if (!formValid) {
                triggerToast('Please complete fields correctly.', 'error');
                return;
            }

            const submitBtn = leadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            const leadData = {
                name: leadForm.querySelector('[id*="Name"]').value,
                phone: leadForm.querySelector('[id*="phone"]').value,
                email: leadForm.querySelector('[id*="emailAddr"]')?.value || '',
                message: leadForm.querySelector('[id*="message"]')?.value || '',
                date: new Date().toLocaleDateString(),
                timestamp: new Date().toISOString()
            };

            const leads = JSON.parse(localStorage.getItem('sr_leads')) || [];
            leads.push(leadData);
            localStorage.setItem('sr_leads', JSON.stringify(leads));

            setTimeout(() => {
                submitBtn.style.opacity = '1';
                submitBtn.style.backgroundColor = 'var(--green-primary)';
                submitBtn.innerHTML = '✓ Submitted!';
                
                triggerToast('Solar consultation inquiry recorded!');
                leadForm.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.innerHTML = originalText;
                }, 3000);
            }, 1000);
        });
    }
});
