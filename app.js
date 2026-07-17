/* ==========================================================================
   RANKA CHEMICAL - WEBSITE CORE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State & Elements
    let inquiryCart = [];
    
    // Load from localStorage on initialization
    try {
        const storedCart = localStorage.getItem('ranka_inquiry_cart');
        if (storedCart) {
            inquiryCart = JSON.parse(storedCart);
        }
    } catch (e) {
        console.error('Failed to load inquiry cart from storage:', e);
    }

    const mainHeader = document.querySelector('.main-header');
    const scrollProgress = document.getElementById('scroll-progress');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const cartCountBadge = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummaryBlock = document.getElementById('cart-summary-block');
    const summaryItemCount = document.getElementById('summary-item-count');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const quoteForm = document.getElementById('quote-request-form');
    const submitWhatsappBtn = document.getElementById('submit-whatsapp-btn');
    const headerCartBtn = document.getElementById('header-cart-btn');

    // ==========================================================================
    // 2. Shrinking Header & Scroll Progress
    // ==========================================================================
    const handleScrollEffects = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Header Shrink
        if (scrollTop > 50) {
            mainHeader.classList.add('shrink');
        } else {
            mainHeader.classList.remove('shrink');
        }

        // Scroll Progress
        if (docHeight > 0) {
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = `${scrollPercent}%`;
        } else {
            scrollProgress.style.width = '0%';
        }
    };

    window.addEventListener('scroll', handleScrollEffects);
    // Initial call to set correct states on page load
    handleScrollEffects();

    // ==========================================================================
    // 3. Mobile Navigation Menu
    // ==========================================================================
    const toggleMobileMenu = () => {
        const isOpen = navMenu.classList.contains('open');
        navMenu.classList.toggle('open');
        mobileNavToggle.setAttribute('aria-expanded', !isOpen);
    };

    mobileNavToggle.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
            
            // Set active class visually (overridden by scrollspy)
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ==========================================================================
    // 4. ScrollSpy (Active Section Highlight)
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');
    
    const scrollSpyOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the upper-middle region
        threshold: 0
    };

    const scrollSpyCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const scrollSpyObserver = new IntersectionObserver(scrollSpyCallback, scrollSpyOptions);
    sections.forEach(section => scrollSpyObserver.observe(section));

    // ==========================================================================
    // 5. Product Category Tabs Switcher
    // ==========================================================================
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            
            // Remove active classes
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and panel
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Scroll tab button into view on mobile (horizontal scrolling sidebar)
            if (window.innerWidth <= 1024) {
                button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        });
    });

    // ==========================================================================
    // 6. B2B Quote Builder (Inquiry Cart Logic)
    // ==========================================================================
    
    // Save cart state
    const saveCart = () => {
        localStorage.setItem('ranka_inquiry_cart', JSON.stringify(inquiryCart));
    };

    // Update Inquiry UI Components
    const updateCartUI = () => {
        // 1. Calculate count
        const totalItemsCount = inquiryCart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountBadge.textContent = totalItemsCount;
        
        // 2. Animate cart bag if items exist
        if (totalItemsCount > 0) {
            headerCartBtn.classList.add('animate-pulse');
            setTimeout(() => headerCartBtn.classList.remove('animate-pulse'), 500);
        }

        // 3. Clear container & populate
        cartItemsContainer.innerHTML = '';
        
        if (inquiryCart.length === 0) {
            // Show empty cart message
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-message">
                    <span class="empty-icon">🧪</span>
                    <p>Your inquiry list is empty.</p>
                    <p class="small">Add items from the product catalog above, or add a custom chemical requirement in the form on the right.</p>
                </div>
            `;
            cartSummaryBlock.classList.add('hidden');
        } else {
            // Populate Cart Items
            inquiryCart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-details">
                        <div class="cart-item-title">${escapeHTML(item.subcategory)}</div>
                        <div class="cart-item-cat">${escapeHTML(item.category)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button type="button" class="qty-btn btn-minus" data-name="${escapeHTML(item.subcategory)}">−</button>
                            <input type="number" class="qty-input" value="${item.quantity}" min="1" data-name="${escapeHTML(item.subcategory)}">
                            <button type="button" class="qty-btn btn-plus" data-name="${escapeHTML(item.subcategory)}">+</button>
                        </div>
                        <button type="button" class="btn-remove-item" data-name="${escapeHTML(item.subcategory)}" title="Remove item">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            
            summaryItemCount.textContent = totalItemsCount;
            cartSummaryBlock.classList.remove('hidden');
        }

        // 4. Update the state of "Add to Inquiry" buttons in the catalog
        const catalogAddButtons = document.querySelectorAll('.add-to-quote-btn');
        catalogAddButtons.forEach(btn => {
            const subName = btn.getAttribute('data-subcategory');
            const cartItem = inquiryCart.find(item => item.subcategory === subName);
            
            if (cartItem) {
                btn.classList.add('added');
                btn.textContent = `Added ✓ (${cartItem.quantity})`;
            } else {
                btn.classList.remove('added');
                btn.textContent = 'Add to Inquiry';
            }
        });
    };

    // Add item handler
    const addToInquiry = (category, subcategory) => {
        const existingItem = inquiryCart.find(item => item.subcategory === subcategory);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            inquiryCart.push({
                category,
                subcategory,
                quantity: 1
            });
        }
        
        saveCart();
        updateCartUI();
    };

    // Remove item handler
    const removeFromInquiry = (subcategory) => {
        inquiryCart = inquiryCart.filter(item => item.subcategory !== subcategory);
        saveCart();
        updateCartUI();
    };

    // Update Quantity
    const updateQuantity = (subcategory, qty) => {
        const item = inquiryCart.find(item => item.subcategory === subcategory);
        if (item) {
            item.quantity = Math.max(1, parseInt(qty) || 1);
            saveCart();
            updateCartUI();
        }
    };

    // Clear Inquiry List
    clearCartBtn.addEventListener('click', () => {
        inquiryCart = [];
        saveCart();
        updateCartUI();
    });

    // Delegated event listeners for Cart interaction inside the summary container
    cartItemsContainer.addEventListener('click', (e) => {
        // Minus Button
        if (e.target.classList.contains('btn-minus')) {
            const subName = e.target.getAttribute('data-name');
            const item = inquiryCart.find(i => i.subcategory === subName);
            if (item && item.quantity > 1) {
                updateQuantity(subName, item.quantity - 1);
            } else if (item && item.quantity === 1) {
                removeFromInquiry(subName);
            }
        }
        
        // Plus Button
        if (e.target.classList.contains('btn-plus')) {
            const subName = e.target.getAttribute('data-name');
            const item = inquiryCart.find(i => i.subcategory === subName);
            if (item) {
                updateQuantity(subName, item.quantity + 1);
            }
        }

        // Remove icon button
        const removeBtn = e.target.closest('.btn-remove-item');
        if (removeBtn) {
            const subName = removeBtn.getAttribute('data-name');
            removeFromInquiry(subName);
        }
    });

    // Handle Direct Input changes in cart
    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('qty-input')) {
            const subName = e.target.getAttribute('data-name');
            updateQuantity(subName, e.target.value);
        }
    });

    // Bind Add buttons from Catalog
    document.querySelectorAll('.add-to-quote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-category');
            const sub = btn.getAttribute('data-subcategory');
            addToInquiry(cat, sub);
        });
    });

    // ==========================================================================
    // 7. B2B Submission Logic (Email / WhatsApp Formatters)
    // ==========================================================================
    
    // Validation helper
    const validateForm = () => {
        const requiredInputs = quoteForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });
        
        return isValid;
    };

    // Format list of chemicals for textual output
    const formatCartText = () => {
        if (inquiryCart.length === 0) return 'No pre-selected catalog categories (Custom request only)';
        
        return inquiryCart.map((item, index) => {
            return `${index + 1}. [${item.category}] - ${item.subcategory} (Quantity: ${item.quantity})`;
        }).join('\n');
    };

    // Build Email Link & Open Client
    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Please fill out all required fields.');
            return;
        }

        const name = document.getElementById('client-name').value;
        const company = document.getElementById('client-company').value;
        const email = document.getElementById('client-email').value;
        const phone = document.getElementById('client-phone').value;
        const industry = document.getElementById('client-industry').value;
        const customReq = document.getElementById('client-custom-req').value;
        
        const productsList = formatCartText();

        const emailBody = 
`Ranka Chemical B2B Sourcing Inquiry
--------------------------------------------------
Contact Person: ${name}
Company / Inst: ${company}
Industry: ${industry}
Email: ${email}
WhatsApp/Phone: ${phone}

Requested Catalog Categories:
${productsList}

Custom / Additional Requirements:
${customReq || 'None specified'}
--------------------------------------------------
Origin: Ranka Chemical B2B Web Portal`;

        const subject = encodeURIComponent(`B2B Sourcing Quote Request - ${company}`);
        const bodyEncoded = encodeURIComponent(emailBody);
        
        // Trigger mailto client
        window.location.href = `mailto:Chemicalranka@gmail.com?subject=${subject}&body=${bodyEncoded}`;
    });

    // Build WhatsApp Link & Forward
    submitWhatsappBtn.addEventListener('click', () => {
        if (!validateForm()) {
            alert('Please fill out all required fields to draft the WhatsApp message.');
            return;
        }

        const name = document.getElementById('client-name').value;
        const company = document.getElementById('client-company').value;
        const email = document.getElementById('client-email').value;
        const phone = document.getElementById('client-phone').value;
        const industry = document.getElementById('client-industry').value;
        const customReq = document.getElementById('client-custom-req').value;
        
        const productsList = inquiryCart.map((item, index) => {
            return `• *${item.subcategory}* (${item.category}) - Qty: _${item.quantity}_`;
        }).join('\n');

        const waText = 
`*RANKA CHEMICAL - B2B INQUIRY*
---------------------------------------
*Contact:* ${name}
*Company:* ${company}
*Industry:* ${industry}
*Email:* ${email}
*Phone/WA:* ${phone}

*Selected Catalog items:*
${productsList || '_None (Custom request only)_'}

*Custom / Specific Requirements:*
_${customReq || 'None specified'}_
---------------------------------------
_Sent via Ranka Chemical web portal_`;

        const waUrl = `https://wa.me/919071266066?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank');
    });

    // Helper: Escape HTML strings to prevent XSS
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initial render of cart components
    updateCartUI();

});
