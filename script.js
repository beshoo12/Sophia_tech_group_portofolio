/* ========================================
   SOPHIA TECH GROUP - JAVASCRIPT MASTER
   الإصدار: 3.0.0 (النسخة الأسطورية)
   التاريخ: 2026
   ======================================== */

( function() {
    'use strict';

    /* ----------------------------------------
       تهيئة البيئة والمتغيرات العامة
       ---------------------------------------- */
    const Site = {
        config: {
            whatsappNumber: '201278095655',
            email: 'info@sophiatech.com',
            phoneNumbers: ['01278095655', '01012345678'],
            workingHours: 'السبت - الخميس: 9ص - 9م',
            socialLinks: {
                facebook: '#',
                linkedin: '#',
                github: '#',
                whatsapp: 'https://wa.me/201278095655',
                twitter: '#'
            },
            animations: {
                enabled: true,
                duration: 350
            },
            security: {
                csrfToken: 'sophia_tech_2026_secure_token',
                maxFileSize: 5 * 1024 * 1024, // 5MB
                allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
            }
        },

        state: {
            isLoading: true,
            currentTheme: localStorage.getItem('sophia_theme') || 'dark',
            currentLang: 'ar',
            isMobile: window.innerWidth <= 768,
            scrollPosition: 0,
            formSubmitting: false,
            notifications: [],
            statsAnimated: false
        },

        elements: {},
        
        cache: {}
    };

    /* ----------------------------------------
       دوال مساعدة متطورة
       ---------------------------------------- */
    const Utils = {
        // تأخير التنفيذ (debounce)
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // تحديد السرعة (throttle)
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // توليد ID فريد
        generateId: function() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        // تنسيق التاريخ
        formatDate: function(date) {
            return new Intl.DateTimeFormat('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Africa/Cairo'
            }).format(date);
        },

        // التحقق من البريد الإلكتروني
        validateEmail: function(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },

        // التحقق من رقم الهاتف المصري
        validateEgyptianPhone: function(phone) {
            const re = /^(01[0-2|5]{1}[0-9]{8})$/;
            return re.test(phone.replace(/\s+/g, ''));
        },

        // تنظيف النص من XSS
        sanitizeInput: function(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        },

        // تشفير بسيط (للاستخدام الداخلي)
        simpleHash: function(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString(36);
        },

        // كشف الجهاز
        detectDevice: function() {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                return 'tablet';
            }
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                return 'mobile';
            }
            return 'desktop';
        },

       // حفظ في الـ localStorage مع تشفير (معدلة لدعم اللغة العربية)
        setSecureStorage: function(key, value) {
            try {
                // تحويل النص لترميز يدعم العربي قبل التشفير
                const utf8Str = encodeURIComponent(JSON.stringify(value));
                const encrypted = btoa(utf8Str);
                localStorage.setItem(`sophia_${key}`, encrypted);
            } catch (e) {
                console.error('Storage error:', e);
            }
        },

        // قراءة من الـ localStorage (معدلة لدعم اللغة العربية)
        getSecureStorage: function(key) {
            try {
                const encrypted = localStorage.getItem(`sophia_${key}`);
                if (encrypted) {
                    // فك التشفير ثم إرجاع الحروف العربية لأصلها
                    const utf8Str = atob(encrypted);
                    return JSON.parse(decodeURIComponent(utf8Str));
                }
                return null;
            } catch (e) {
                return null;
            }
        }
    };

    /* ----------------------------------------
       نظام الإشعارات المتطور
       ---------------------------------------- */
    const NotificationSystem = {
        container: null,

        init: function() {
            this.createContainer();
        },

        createContainer: function() {
            if (!document.querySelector('.notification-container')) {
                this.container = document.createElement('div');
                this.container.className = 'notification-container';
                document.body.appendChild(this.container);
            } else {
                this.container = document.querySelector('.notification-container');
            }
        },

        show: function(message, type = 'info', duration = 3000) {
            const id = Utils.generateId();
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.id = id;
            notification.setAttribute('role', 'alert');
            
            // أيقونات حسب النوع
            const icons = {
                success: 'fa-circle-check',
                error: 'fa-circle-exclamation',
                warning: 'fa-triangle-exclamation',
                info: 'fa-circle-info'
            };

            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fa-regular ${icons[type] || icons.info}"></i>
                    <span>${message}</span>
                </div>
                <button class="notification-close" onclick="this.parentElement.remove()">
                    <i class="fa-regular fa-xmark"></i>
                </button>
                <div class="notification-progress"></div>
            `;

            this.container.appendChild(notification);

            // Auto remove after duration
            setTimeout(() => {
                const notif = document.getElementById(id);
                if (notif) {
                    notif.style.animation = 'slideOut 0.3s ease forwards';
                    setTimeout(() => notif.remove(), 300);
                }
            }, duration);
        },

        success: function(message) {
            this.show(message, 'success');
        },

        error: function(message) {
            this.show(message, 'error');
        },

        warning: function(message) {
            this.show(message, 'warning');
        },

        info: function(message) {
            this.show(message, 'info');
        }
    };

    

    /* ----------------------------------------
       نظام التحميل المتطور
       ---------------------------------------- */
    const LoaderSystem = {
        init: function() {
            const loader = document.getElementById('loader-wrapper');
            if (!loader) return;

            // Progress bar simulation
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    setTimeout(() => {
                        loader.classList.add('hidden');
                        Site.state.isLoading = false;
                        document.body.style.overflow = 'auto';
                        
                        // تشغيل الأنيميشن بعد التحميل
                        if (window.AOS) {
                            window.AOS.refresh();
                        }
                    }, 500);
                }
                
                const bar = loader.querySelector('.loader-progress-bar');
                if (bar) {
                    bar.style.width = progress + '%';
                }
            }, 200);

            // Prevent scroll while loading
            document.body.style.overflow = 'hidden';
        }
    };

    /* ----------------------------------------
       نظام التوقيت اللحظي المتطور
       ---------------------------------------- */
    const LiveTimeSystem = {
        element: null,
        interval: null,

        init: function() {
            this.element = document.getElementById('liveTime');
            if (!this.element) return;

            this.update();
            this.interval = setInterval(() => this.update(), 1000);
        },

        update: function() {
            const now = new Date();
            const timeString = Utils.formatDate(now);
            const timeElement = this.element.querySelector('#timeText');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        },

        destroy: function() {
            if (this.interval) {
                clearInterval(this.interval);
            }
        }
    };

    /* ----------------------------------------
       نظام الثيم المتطور (Dark/Light)
       ---------------------------------------- */
    const ThemeSystem = {
        init: function() {
            this.applyTheme(Site.state.currentTheme);
            this.setupListeners();
        },

       applyTheme: function(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            this.updateIcon('moon'); // الأيقونة اللي هتظهر عشان يرجع للدارك
        } else {
            document.body.classList.remove('light-mode');
            this.updateIcon('sun'); // الأيقونة اللي هتظهر عشان يروح للايت
        }
        
        Site.state.currentTheme = theme;
        
        // التعديل هنا: استخدمنا الحفظ العادي بدل التشفير عشان يتقرأ صح فوق
        localStorage.setItem('sophia_theme', theme); 
    },

        toggle: function() {
            const newTheme = Site.state.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            
            // رسالة ترحيبية حسب الثيم
            NotificationSystem.info(
                newTheme === 'dark' ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع النهاري ☀️'
            );
        },

        updateIcon: function(iconName) {
            const toggleBtn = document.getElementById('theme-toggle');
            if (!toggleBtn) return;

            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = `fa-regular fa-${iconName}`;
            }
        },

        setupListeners: function() {
            const toggleBtn = document.getElementById('theme-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.toggle());
            }
        }
    };

    /* ----------------------------------------
       نظام الكتابة المتطور (Typing Effect)
       ---------------------------------------- */
    const TypingSystem = {
        element: null,
        words: [
            'برمجة المواقع المعقدة من الصفر (Custom Code) 💻',
            'الهدايا الرقمية ومواقع المصالحات العاطفية ❤️',
            'تطوير منصات WordPress و Webflow احترافية ⚡',
            'دعوات الأفراح الرقمية وافتتاح المشاريع 🎉',
            'الأنظمة المحاسبية والمنصات التعليمية المتكاملة 📚',
            'بورتفوليو تفاعلي يبرز هويتك ويخطف الأنظار 🎨',
            'مواقع الذكريات لتوثيق أجمل لحظاتك مع من تحب 💑',
            'تحسين محركات البحث (SEO) لتصدر جوجل 🚀',
            'أي فكرة في خيالك.. نحولها لواقع رقمي! 💡'
        ],
        wordIndex: 0,
        charIndex: 0,
        isDeleting: false,
        timeout: null,

        init: function() {
            this.element = document.getElementById('typing-text');
            if (!this.element) return;

            this.type();
        },

        type: function() {
            const currentWord = this.words[this.wordIndex];
            
            if (this.isDeleting) {
                this.element.textContent = currentWord.substring(0, this.charIndex - 1);
                this.charIndex--;
            } else {
                this.element.textContent = currentWord.substring(0, this.charIndex + 1);
                this.charIndex++;
            }

            let typingSpeed = this.isDeleting ? 50 : 100;

            if (!this.isDeleting && this.charIndex === currentWord.length) {
                typingSpeed = 2000;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.wordIndex = (this.wordIndex + 1) % this.words.length;
                typingSpeed = 500;
            }

            this.timeout = setTimeout(() => this.type(), typingSpeed);
        },

        destroy: function() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
        }
    };

    /* ----------------------------------------
       نظام الإحصائيات المتحركة
       ---------------------------------------- */
    const StatsSystem = {
        statsElements: [],
        animated: false,

        init: function() {
            this.statsElements = document.querySelectorAll('.stat-number[data-target]');
            if (!this.statsElements.length) return;

            this.checkVisibility();
            window.addEventListener('scroll', Utils.throttle(() => this.checkVisibility(), 100));
        },

        checkVisibility: function() {
            if (this.animated) return;

            this.statsElements.forEach(stat => {
                const rect = stat.getBoundingClientRect();
                const isVisible = rect.top <= window.innerHeight - 100 && rect.bottom >= 0;

                if (isVisible) {
                    this.animateStat(stat);
                }
            });
        },

        animateStat: function(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const step = 50;
            const steps = duration / step;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + (element.getAttribute('data-suffix') || '');
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, step);

            this.animated = true;
        }
    };

    /* ----------------------------------------
       نظام الفورم المتطور مع Validation
       ---------------------------------------- */
    /* ----------------------------------------
       نظام الفورم المتطور (Validation + WhatsApp + Analytics)
       ---------------------------------------- */
    const FormSystem = {
        form: null,
        fields: {},

        init: function() {
            this.form = document.getElementById('contactForm');
            if (!this.form) return;

            this.setupFields();
            this.setupValidation();
            this.setupFileUpload(); // خلينا نظام الملفات زي ما هو!
            this.setupSubmit();
        },

        setupFields: function() {
            // كود ذكي بيقرأ الحقول سواء حطيت ID أو لأ
            this.fields = {
                name: this.form.querySelector('#senderName') || this.form.querySelector('input[placeholder*="الاسم"]'),
                email: this.form.querySelector('#senderEmail') || this.form.querySelector('input[type="email"]'),
                phone: this.form.querySelector('#senderPhone') || this.form.querySelector('input[type="tel"]'),
                service: this.form.querySelector('#senderService') || this.form.querySelector('select'),
                message: this.form.querySelector('#senderMessage') || this.form.querySelector('textarea'),
                file: this.form.querySelector('#fileInput') || this.form.querySelector('input[type="file"]')
            };
        },

        setupValidation: function() {
            Object.keys(this.fields).forEach(fieldName => {
                const field = this.fields[fieldName];
                if (!field) return;

                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', Utils.debounce(() => {
                    this.removeFieldError(field);
                }, 300));
            });
        },

        validateField: function(fieldName) {
            const field = this.fields[fieldName];
            if (!field) return true;

            this.removeFieldError(field);
            let isValid = true;
            let errorMessage = '';

            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                errorMessage = 'هذا الحقل مطلوب';
            }

            if (isValid && fieldName === 'email' && field.value) {
                if (!Utils.validateEmail(field.value)) {
                    isValid = false;
                    errorMessage = 'البريد الإلكتروني غير صحيح';
                }
            }

            if (isValid && fieldName === 'phone' && field.value) {
                if (!Utils.validateEgyptianPhone(field.value)) {
                    isValid = false;
                    errorMessage = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01)';
                }
            }

            if (!isValid) {
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        },

        showFieldError: function(field, message) {
            const formGroup = field.closest('.form-group');
            if (!formGroup) return;
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        },

        removeFieldError: function(field) {
            field.classList.remove('error');
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                const error = formGroup.querySelector('.field-error');
                if (error) error.remove();
            }
        },

        setupFileUpload: function() {
            const fileInput = this.fields.file;
            if (!fileInput) return;

            const label = fileInput.closest('.file-upload-wrapper')?.querySelector('h6') || 
                          fileInput.closest('.file-upload')?.querySelector('.file-label span');
            
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                let isValid = true;
                let totalSize = 0;

                files.forEach(file => {
                    totalSize += file.size;
                    if (!Site.config.security.allowedFileTypes.includes(file.type)) {
                        isValid = false;
                        NotificationSystem.error(`نوع الملف ${file.name} غير مسموح به`);
                    }
                });

                if (totalSize > Site.config.security.maxFileSize) {
                    isValid = false;
                    NotificationSystem.error('حجم الملفات كبير جداً (الحد الأقصى 5MB)');
                }

                if (isValid && label) {
                    const fileNames = files.map(f => f.name).join(', ');
                    label.textContent = fileNames.length > 30 ? fileNames.substring(0, 30) + '...' : fileNames;
                } else {
                    fileInput.value = '';
                    if (label) label.textContent = 'ارفق ملفات أو صور (اختياري)';
                }
            });
        },

        validateForm: function() {
            let isValid = true;
            Object.keys(this.fields).forEach(fieldName => {
                if (!this.validateField(fieldName)) {
                    isValid = false;
                }
            });
            return isValid;
        },

        setupSubmit: function() {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (Site.state.formSubmitting) {
                    NotificationSystem.warning('يتم تجهيز الطلب بالفعل...');
                    return;
                }

                if (!this.validateForm()) {
                    NotificationSystem.error('يرجى تصحيح الأخطاء في النموذج أولاً');
                    return;
                }

                Site.state.formSubmitting = true;
                const submitBtn = this.form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fa-regular fa-spinner fa-spin"></i> جاري تحويلك للواتساب...';
                submitBtn.disabled = true;

                try {
                    // 1. تجميع البيانات
                    const formData = {
                        name: Utils.sanitizeInput(this.fields.name?.value || ''),
                        email: Utils.sanitizeInput(this.fields.email?.value || ''),
                        phone: Utils.sanitizeInput(this.fields.phone?.value || 'لم يتم إدخاله'),
                        service: Utils.sanitizeInput(this.fields.service?.value || 'غير محدد'),
                        message: Utils.sanitizeInput(this.fields.message?.value || '')
                    };

                    // 2. التحقق من وجود ملفات تم رفعها في الفورم
                    const files = this.fields.file?.files;
                    let fileNote = "";
                    if (files && files.length > 0) {
                        fileNote = `\n📁 *يوجد ملفات مرفقة:* العميل لديه (${files.length}) ملفات سيقوم بإرسالها لك الآن.\n`;
                    }

                    // 3. تنسيق رسالة الواتساب 
                    let whatsappMessage = `*طلب مشروع جديد من الموقع* 🚀\n\n`;
                    whatsappMessage += `👤 *الاسم:* ${formData.name}\n`;
                    whatsappMessage += `📧 *البريد:* ${formData.email}\n`;
                    whatsappMessage += `📱 *رقم الهاتف:* ${formData.phone}\n`;
                    whatsappMessage += `🛠 *نوع الخدمة:* ${formData.service}\n\n`;
                    whatsappMessage += `📝 *تفاصيل المشروع:*\n${formData.message}\n`;
                    whatsappMessage += fileNote; // إضافة ملاحظة الملفات إن وجدت
                    whatsappMessage += `\n-------------------\n`;
                    whatsappMessage += `*(يرجى إرسال أي ملفات أو صور توضيحية هنا في الشات)*`;

                    const companyNumber = "201278095655";
                    const encodedMessage = encodeURIComponent(whatsappMessage);
                    const whatsappURL = `https://api.whatsapp.com/send?phone=${companyNumber}&text=${encodedMessage}`;

                    // تأخير وهمي بسيط عشان الأنيميشن يشتغل والعميل يحس بالاحترافية
                    await new Promise(resolve => setTimeout(resolve, 800));

                    NotificationSystem.success('تم التجهيز! سيتم فتح الواتساب الآن 💬');
                    
                    // 4. حفظ الإحصائيات 
                    this.trackFormSubmission(formData);

                    // 5. فتح الواتساب وتفريغ الفورم
                    setTimeout(() => {
                        window.open(whatsappURL, '_blank');
                        this.form.reset();
                        const fileLabel = this.fields.file?.closest('.file-upload-dropzone')?.querySelector('h6');
                        if (fileLabel) fileLabel.textContent = 'ارفق ملفات توضيحية للمشروع';
                    }, 1000);

                } catch (error) {
                    console.error('Form Error:', error);
                    NotificationSystem.error('حدث خطأ، يرجى المحاولة مرة أخرى.');
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    Site.state.formSubmitting = false;
                }
            });
        },

        trackFormSubmission: function(data) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'contact',
                    'event_label': data.service
                });
            }
            const submissions = Utils.getSecureStorage('form_submissions') || [];
            submissions.push({ ...data, id: Utils.generateId() });
            if (submissions.length > 50) submissions.shift();
            Utils.setSecureStorage('form_submissions', submissions);
        }
    };

    /* ----------------------------------------
       نظام فلترة الخدمات (Services Tabs)
       ---------------------------------------- */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const serviceItems = document.querySelectorAll('.service-item');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // شيل كلاس active من كل الزراير وحطه على اللي اتداس عليه
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-tab');

            serviceItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    /* ----------------------------------------
       نظام التبويبات (Tabs) المتطور
       ---------------------------------------- */
    const TabsSystem = {
        init: function() {
            const tabs = document.querySelectorAll('.tab-btn');
            if (!tabs.length) return;

            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const filter = tab.getAttribute('data-tab');
                    this.filterItems(filter);
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                });
            });
        },

        filterItems: function(filter) {
            const items = document.querySelectorAll('.service-item');
            
            items.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });

            // Refresh AOS
            if (window.AOS) {
                setTimeout(() => AOS.refresh(), 350);
            }
        }
    };

    /* ----------------------------------------
       نظام النافبار الذكي
       ---------------------------------------- */
    const NavbarSystem = {
        init: function() {
            this.handleScroll();
            this.setupSmoothScroll();
            this.setupActiveLinks();
            
            window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 50));
        },

        handleScroll: function() {
            const navbar = document.getElementById('mainNav');
            if (!navbar) return;

            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        },

        setupSmoothScroll: function() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (!target) return;

                    const offset = 100;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse?.classList.contains('show')) {
                        navbarCollapse.classList.remove('show');
                    }
                });
            });
        },

        setupActiveLinks: function() {
            const sections = document.querySelectorAll('section[id]');
            
            window.addEventListener('scroll', Utils.throttle(() => {
                let current = '';
                const scrollY = window.pageYOffset;

                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 150;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            }, 100));
        }
    };

    /* ----------------------------------------
       نظام العودة للأعلى
       ---------------------------------------- */
    const BackToTopSystem = {
        button: null,

        init: function() {
            this.button = document.getElementById('backToTop');
            if (!this.button) return;

            window.addEventListener('scroll', Utils.throttle(() => this.checkVisibility(), 100));
            this.button.addEventListener('click', () => this.scrollToTop());
        },

        checkVisibility: function() {
            if (window.scrollY > 500) {
                this.button.classList.add('show');
            } else {
                this.button.classList.remove('show');
            }
        },

        scrollToTop: function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    /* ----------------------------------------
       نظام حماية الصور والمحتوى
       ---------------------------------------- */
    const SecuritySystem = {
        init: function() {
            this.preventRightClick();
            this.preventInspector();
            this.preventCopyPaste();
        },

        preventRightClick: function() {
            document.addEventListener('contextmenu', (e) => {
                // Allow right click on form elements
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                    return true;
                }
                
                e.preventDefault();
                return false;
            });
        },

        preventInspector: function() {
            let devtools = {
                open: false,
                orientation: null
            };

            const checkDevTools = () => {
                const widthThreshold = window.outerWidth - window.innerWidth > 160;
                const heightThreshold = window.outerHeight - window.innerHeight > 160;
                
                if (widthThreshold || heightThreshold) {
                    if (!devtools.open) {
                        NotificationSystem.warning('تم اكتشاف أدوات المطور. برجاء احترام حقوق الملكية 🙏');
                        devtools.open = true;
                    }
                } else {
                    devtools.open = false;
                }
            };

            setInterval(checkDevTools, 1000);
        },

        preventCopyPaste: function() {
            document.addEventListener('copy', (e) => {
                e.preventDefault();
                NotificationSystem.info('حقوق المحتوى محفوظة لـ Sophia Tech Group');
                return false;
            });

            document.addEventListener('cut', (e) => e.preventDefault());
        }
    };

    /* ----------------------------------------
       نظام تحليل الأداء والتتبع
       ---------------------------------------- */
    const AnalyticsSystem = {
        init: function() {
            this.trackPageView();
            this.trackUserBehavior();
            this.reportPerformance();
        },

        trackPageView: function() {
            const data = {
                page: window.location.pathname,
                title: document.title,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                device: Utils.detectDevice(),
                language: navigator.language,
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            };

            // Store in localStorage
            const views = Utils.getSecureStorage('page_views') || [];
            views.push(data);
            
            if (views.length > 100) views.shift();
            Utils.setSecureStorage('page_views', views);
        },

        trackUserBehavior: function() {
            let scrollDepth = 0;
            
            window.addEventListener('scroll', Utils.throttle(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                
                if (scrolled - scrollDepth > 25) {
                    scrollDepth = Math.floor(scrolled / 25) * 25;
                    
                    // Track milestone
                    const data = {
                        event: 'scroll_milestone',
                        depth: scrollDepth,
                        timestamp: new Date().toISOString()
                    };
                    
                    const behaviors = Utils.getSecureStorage('user_behavior') || [];
                    behaviors.push(data);
                    
                    if (behaviors.length > 50) behaviors.shift();
                    Utils.setSecureStorage('user_behavior', behaviors);
                }
            }, 1000));
        },

        reportPerformance: function() {
            if (window.performance) {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                if (pageLoadTime > 3000) {
                    NotificationSystem.warning('الموقع بطيء قليلاً. جاري تحسين الأداء...');
                }
            }
        }
    };

    /* ----------------------------------------
       نظام الإعاقات (Accessibility)
       ---------------------------------------- */
    const AccessibilitySystem = {
        init: function() {
            this.addSkipLink();
            this.setupAriaLabels();
            this.handleKeyboardNavigation();
        },

        addSkipLink: function() {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
            document.body.insertBefore(skipLink, document.body.firstChild);
        },

        setupAriaLabels: function() {
            // Add ARIA labels to interactive elements
            document.querySelectorAll('button').forEach(btn => {
                if (!btn.getAttribute('aria-label')) {
                    btn.setAttribute('aria-label', btn.textContent.trim() || 'زر');
                }
            });

            document.querySelectorAll('a').forEach(link => {
                if (!link.getAttribute('aria-label')) {
                    link.setAttribute('aria-label', link.textContent.trim() || 'رابط');
                }
            });
        },

        handleKeyboardNavigation: function() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
        }
    };

    /* ----------------------------------------
       نظام AOS المتطور
       ---------------------------------------- */
    const AOSSystem = {
        init: function() {
            if (typeof AOS !== 'undefined' && Site.config.animations.enabled) {
                AOS.init({
                    duration: Site.config.animations.duration,
                    easing: 'ease-in-out-cubic',
                    once: false,
                    mirror: true,
                    offset: 120,
                    delay: 100,
                    disable: window.innerWidth < 768 ? 'mobile' : false
                });
            }
        }
    };

    /* ----------------------------------------
       نظام معالجة الأخطاء العالمي
       ---------------------------------------- */
    const ErrorHandler = {
        init: function() {
            window.addEventListener('error', (event) => this.handleError(event));
            window.addEventListener('unhandledrejection', (event) => this.handlePromiseError(event));
        },

        handleError: function(error) {
            console.error('Global error:', error.error || error.message);
            
            // Log to localStorage
            const errors = Utils.getSecureStorage('errors') || [];
            errors.push({
                message: error.message,
                filename: error.filename,
                lineno: error.lineno,
                timestamp: new Date().toISOString()
            });
            
            if (errors.length > 20) errors.shift();
            Utils.setSecureStorage('errors', errors);
        },

        handlePromiseError: function(error) {
            console.error('Unhandled promise rejection:', error.reason);
        }
    };


    

    /* ----------------------------------------
       التهيئة الرئيسية
       ---------------------------------------- */
    const init = function() {
        console.log('🚀 Sophia Tech Group - النظام الأسطوري يعمل بكفاءة');

        // Cache DOM elements
        Site.elements = {
            body: document.body,
            window: window,
            document: document
        };

        // Initialize all systems
        ErrorHandler.init();
        LoaderSystem.init();
        LiveTimeSystem.init();
        ThemeSystem.init();
        TypingSystem.init();
        StatsSystem.init();
        NavbarSystem.init();
        BackToTopSystem.init();
        FormSystem.init();
        TabsSystem.init();
        SecuritySystem.init();
        AnalyticsSystem.init();
        AccessibilitySystem.init();
        AOSSystem.init();
        NotificationSystem.init();

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            Site.state.isMobile = window.innerWidth <= 768;
        }, 250));

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden
            } else {
                // Page visible again
                if (window.AOS) AOS.refresh();
            }
        });

        // Initial welcome message
        setTimeout(() => {
            NotificationSystem.info('مرحباً بك في Sophia Tech Group! 💡');
        }, 2000);
    };

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for global use (if needed)
    window.Site = Site;
    window.Utils = Utils;
    window.NotificationSystem = NotificationSystem;

})();

        /* ----------------------------------------
       نظام السلايدر الدوار لفريق العمل (Tech Core Slider)
       ---------------------------------------- */
    const TeamSliderSystem = {
        currentIndex: 0,
        total: 3,
        duration: 5000, // 5 ثواني لكل شخص
        progress: 0,
        timerId: null,
        isPaused: false,

        avatars: document.querySelectorAll('.team-avatar'),
        infos: document.querySelectorAll('.team-member-info'),
        dots: document.querySelectorAll('.control-dot'),
        progressBar: document.getElementById('sliderProgress'),
        sliderWrapper: document.getElementById('teamCoreSlider'),
        discContainer: document.querySelector('.tech-disc-container'),

        init: function() {
            if (!this.avatars.length) return;

            // 1. تفعيل الضغط اليدوي على النقاط
            this.dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const targetIndex = parseInt(e.target.getAttribute('data-target'));
                    this.goToMember(targetIndex);
                    this.resetTimer(); // تصفير العداد لما تدوس بنفسك
                });
            });

            // 2. إيقاف السلايدر مؤقتاً لما الماوس ييجي عليه (Hover / Touch)
            this.sliderWrapper.addEventListener('mouseenter', () => this.pause());
            this.sliderWrapper.addEventListener('mouseleave', () => this.resume());
            this.sliderWrapper.addEventListener('touchstart', () => this.pause());
            this.sliderWrapper.addEventListener('touchend', () => this.resume());

            // 3. تشغيل التايمر والعداد
            this.startTimer();
        },

        goToMember: function(index) {
            // إزالة الكلاسات
            this.avatars.forEach(av => av.classList.remove('active'));
            this.infos.forEach(info => info.classList.remove('active'));
            this.dots.forEach(dot => dot.classList.remove('active'));

            // إضافة الكلاس للعضو الحالي
            this.avatars[index].classList.add('active');
            this.infos[index].classList.add('active');
            this.dots[index].classList.add('active');
            
            this.currentIndex = index;
        },

        nextMember: function() {
            let nextIndex = (this.currentIndex + 1) % this.total;
            this.goToMember(nextIndex);
        },

        startTimer: function() {
            const interval = 50; // سرعة تحديث العداد (كل 50 ملي ثانية)
            
            this.timerId = setInterval(() => {
                // لو الماوس مش واقف على السلايدر، كمل عد
                if (!this.isPaused) {
                    this.progress += interval;
                    let widthPercent = (this.progress / this.duration) * 100;
                    
                    // تحريك خط العداد
                    if (this.progressBar) {
                        this.progressBar.style.width = `${widthPercent}%`;
                    }

                    // لو الـ 5 ثواني خلصوا، قلب للي بعده وصفر العداد
                    if (this.progress >= this.duration) {
                        this.progress = 0;
                        this.nextMember();
                    }
                }
            }, interval);
        },

        resetTimer: function() {
            this.progress = 0;
            if (this.progressBar) this.progressBar.style.width = '0%';
        },

        pause: function() {
            this.isPaused = true;
            // توقيف حركة الليزر في الـ CSS
            if (this.discContainer) this.discContainer.classList.add('is-paused');
        },

        resume: function() {
            this.isPaused = false;
            // تشغيل حركة الليزر تاني
            if (this.discContainer) this.discContainer.classList.remove('is-paused');
        }
    };



    /* ----------------------------------------
       نظام الأمان لتحويلات الواتساب (Secure WhatsApp Routing)
       ---------------------------------------- */
    const SecureWhatsAppSystem = {
        // الرقم متشفر بـ Base64 عشان ميكونش مقروء في الـ Inspect Element
        // الرقم الأصلي: 201278095655
        _encNum: 'MjAxMjc4MDk1NjU1', 

       init: function() {
            // 1. زراير الخدمات
            const waButtons = document.querySelectorAll('.secure-wa-btn');
            waButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceName = btn.getAttribute('data-service') || 'إحدى خدماتكم';
                    this.routeToWhatsApp(serviceName, 'service');
                });
            });

            // 2. الزرار العائم الجديد
            const floatingBtn = document.getElementById('floatingWaBtn');
            if (floatingBtn) {
                floatingBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.routeToWhatsApp(null, 'general');
                });
            }
        },

        routeToWhatsApp: function(serviceName, type) {
            try {
                // فك تشفير الرقم
                const targetNumber = atob(this._encNum);
                let messageText = "";

                // تحديد نوع الرسالة بناءً على الزرار اللي انضغط
                if (type === 'service') {
                    messageText = `مرحباً فريق Sophia Tech 👋،\n\nلقد تصفحت موقعكم وأنا مهتم جداً بمعرفة تفاصيل أكثر حول خدمة:\n✨ *${serviceName}* ✨\n\nهل يمكنكم تزويدي بالباقات والأسعار المتاحة؟`;
                } else if (type === 'general') {
                    // دي الرسالة التشجيعية بتاعة الزرار العائم
                    messageText = `مرحباً فريق Sophia Tech 👋،\n\nأنا أتصفح موقعكم الآن ومُهتم جداً بخدماتكم. عندي فكرة مشروع ومحتاج أستشيركم فيها، هل يمكننا التحدث؟ 🚀`;
                }
                
                // تحويل الرسالة وفتح الواتساب
                const encodedMessage = encodeURIComponent(messageText);
                const finalUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodedMessage}`;
                window.open(finalUrl, '_blank');
                
            } catch (error) {
                console.error("حدث خطأ في نظام التحويل:", error);
                window.open(`https://wa.me/201278095655`, '_blank');
            }
        }
    };

    // تشغيل النظام
    SecureWhatsAppSystem.init();
    // تشغيل النظام
    TeamSliderSystem.init();

/* ----------------------------------------
   إضافة CSS خاص بالإشعارات
   ---------------------------------------- */
const style = document.createElement('style');
style.textContent = `
    .notification-container {
        position: fixed;
        top: 100px;
        left: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
    }

    .notification {
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        border-radius: 15px;
        padding: 15px 20px;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        box-shadow: var(--shadow-lg);
        animation: slideIn 0.3s ease forwards;
        position: relative;
        overflow: hidden;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }

    .notification-content i {
        font-size: 1.2rem;
    }

    .notification-success i { color: #10B981; }
    .notification-error i { color: #EF4444; }
    .notification-warning i { color: #F59E0B; }
    .notification-info i { color: #3B82F6; }

    .notification-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 5px;
        transition: all 0.3s;
    }

    .notification-close:hover {
        color: var(--primary-glow);
        transform: scale(1.1);
    }

    .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--gradient-primary);
        animation: progressShrink 3s linear forwards;
    }

    .field-error {
        color: #EF4444;
        font-size: 0.8rem;
        margin-top: 5px;
        margin-right: 45px;
        animation: fadeIn 0.3s ease;
    }

    .form-control.error {
        border-color: #EF4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }

    .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-glow);
        color: white;
        padding: 8px 15px;
        z-index: 10000;
        text-decoration: none;
        border-radius: 0 0 10px 0;
        transition: top 0.3s;
    }

    .skip-link:focus {
        top: 0;
    }

    body.keyboard-navigation *:focus {
        outline: 3px solid var(--primary-glow) !important;
        outline-offset: 2px !important;
    }

    @keyframes slideIn {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes progressShrink {
        from { width: 100%; }
        to { width: 0%; }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
        .notification-container {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;

document.head.appendChild(style);