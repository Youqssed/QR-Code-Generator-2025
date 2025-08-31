/**
 * QR Code Generator Application
 * A modern, accessible QR code generator built with vanilla HTML, CSS, and JavaScript
 */
(function() {
    'use strict';

    // Constants
    const DEFAULTS = {
        size: 320,
        margin: 4,
        ecc: 'M',
        fgColor: '#111111',
        bgColor: '#ffffff',
        bgTransparent: false,
        pictureSize: 50
    };

    const SIZE_LIMITS = {
        min: 128,
        max: 1024,
        step: 16
    };

    const MARGIN_LIMITS = {
        min: 0,
        max: 64
    };


    const DEBOUNCE_DELAY = 300;

    // DOM Elements
    const elements = {
        // Form elements
        form: document.getElementById('qr-form'),
        typeSelect: document.getElementById('qr-type'),
        textInput: document.getElementById('qr-text'),
        sizeInput: document.getElementById('qr-size'),

        // WiFi elements
        wifiSsidInput: document.getElementById('wifi-ssid'),
        wifiPasswordInput: document.getElementById('wifi-password'),
        wifiEncryptionSelect: document.getElementById('wifi-encryption'),
        wifiHiddenCheckbox: document.getElementById('wifi-hidden'),
        togglePasswordBtn: document.getElementById('toggle-password'),

        // Contact elements
        contactFirstNameInput: document.getElementById('contact-first-name'),
        contactLastNameInput: document.getElementById('contact-last-name'),
        contactPhoneInput: document.getElementById('contact-phone'),
        contactEmailInput: document.getElementById('contact-email'),
        contactCompanyInput: document.getElementById('contact-company'),
        contactJobTitleInput: document.getElementById('contact-job-title'),
        contactWebsiteInput: document.getElementById('contact-website'),
        contactAddressInput: document.getElementById('contact-address'),

        // Input sections
        textInputSection: document.getElementById('text-input-section'),
        wifiInputSection: document.getElementById('wifi-input-section'),
        passwordFieldContainer: document.getElementById('password-field-container'),
        contactInputSection: document.getElementById('contact-input-section'),
        pictureInputSection: document.getElementById('picture-input-section'),

        // Picture QR code elements
        pictureTextInput: document.getElementById('picture-text'),
        pictureUploadInput: document.getElementById('picture-upload'),
        picturePreview: document.getElementById('picture-preview'),
        pictureSizeInput: document.getElementById('picture-size'),
        pictureSizeValue: document.getElementById('picture-size-value'),

        eccSelect: document.getElementById('qr-ecc'),
        marginInput: document.getElementById('qr-margin'),
        fgColorInput: document.getElementById('qr-fg-color'),
        bgColorInput: document.getElementById('qr-bg-color'),
        bgTransparentCheckbox: document.getElementById('qr-bg-transparent'),

        generateBtn: document.getElementById('generate-btn'),
        resetBtn: document.getElementById('reset-btn'),

        // Preview elements
        preview: document.getElementById('qr-preview'),
        info: document.getElementById('qr-info'),

        // Download elements
        downloadPngBtn: document.getElementById('download-png'),
        downloadSvgBtn: document.getElementById('download-svg'),
        copyClipboardBtn: document.getElementById('copy-clipboard'),

        // Other elements
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.querySelector('.theme-icon'),
        textHint: document.getElementById('text-hint')
    };

    // State
    let qrCode = null;
    let debounceTimer = null;
    let isGenerating = false;
    let userInteracted = {
        size: false,
        margin: false,
        text: false,
        wifi: false,
        contact: false,
        picture: false
    };

    // Picture QR code state
    let uploadedImage = null;
    let imageDataUrl = null;

    /**
     * Remove required attribute from hidden form controls
     */
    function removeRequiredFromHiddenInputs() {
        // Remove required from all input sections that are hidden by default
        elements.textInput.removeAttribute('required');
        elements.wifiSsidInput.removeAttribute('required');
        elements.contactFirstNameInput.removeAttribute('required');
        elements.pictureTextInput.removeAttribute('required');
    }

    /**
     * Initialize the application
     */
    function init() {
        initializeQrCode();
        setupEventListeners();
        setupKeyboardShortcuts();
        loadThemePreference();
        setupFormSync();

        // Ensure no hidden form controls have required attribute on initial load
        removeRequiredFromHiddenInputs();

        // Initial state - only update button, don't show validation errors
        updateGenerateButton();
    }

    /**
     * Initialize QR Code Styling library
     */
    function initializeQrCode() {
        try {
            qrCode = new QRCodeStyling({
                width: DEFAULTS.size,
                height: DEFAULTS.size,
                type: 'svg',
                data: '',
                margin: DEFAULTS.margin,
                qrOptions: {
                    typeNumber: 0,
                    mode: 'Byte',
                    errorCorrectionLevel: DEFAULTS.ecc
                },
                dotsOptions: {
                    color: DEFAULTS.fgColor,
                    type: 'rounded'
                },
                backgroundOptions: {
                    color: DEFAULTS.bgColor
                },
                imageOptions: {
                    crossOrigin: 'anonymous',
                    margin: 20,
                    hideBackgroundDots: true,
                    imageSize: 0.5
                }
            });
        } catch (error) {
            console.error('Failed to initialize QR Code library:', error);
            showError('Failed to initialize QR code generator. Please refresh the page.');
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Form submission
        elements.form.addEventListener('submit', handleGenerate);

        // Form inputs
        elements.typeSelect.addEventListener('change', handleTypeChange);
        elements.textInput.addEventListener('input', handleTextInput);
        elements.sizeInput.addEventListener('input', handleSizeChange);
        elements.marginInput.addEventListener('input', handleMarginChange);
        elements.fgColorInput.addEventListener('input', handleColorChange);
        elements.bgColorInput.addEventListener('input', handleColorChange);
        elements.bgTransparentCheckbox.addEventListener('change', handleTransparentChange);

        // WiFi inputs
        elements.wifiSsidInput.addEventListener('input', handleWifiInput);
        elements.wifiPasswordInput.addEventListener('input', handleWifiInput);
        elements.wifiEncryptionSelect.addEventListener('change', handleWifiInput);
        elements.wifiHiddenCheckbox.addEventListener('change', handleWifiInput);
        elements.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

        // Contact inputs
        elements.contactFirstNameInput.addEventListener('input', handleContactInput);
        elements.contactLastNameInput.addEventListener('input', handleContactInput);
        elements.contactPhoneInput.addEventListener('input', handleContactInput);
        elements.contactEmailInput.addEventListener('input', handleContactInput);
        elements.contactCompanyInput.addEventListener('input', handleContactInput);
        elements.contactJobTitleInput.addEventListener('input', handleContactInput);
        elements.contactWebsiteInput.addEventListener('input', handleContactInput);
        elements.contactAddressInput.addEventListener('input', handleContactInput);

        // Picture QR code inputs
        elements.pictureTextInput.addEventListener('input', handlePictureInput);
        elements.pictureUploadInput.addEventListener('change', handleImageUpload);
        elements.pictureSizeInput.addEventListener('input', handlePictureSettingsChange);

        // Setup drag and drop for image upload
        setupImageDragAndDrop();

        // Buttons
        elements.resetBtn.addEventListener('click', handleReset);
        elements.downloadPngBtn.addEventListener('click', () => downloadQR('png'));
        elements.downloadSvgBtn.addEventListener('click', () => downloadQR('svg'));
        elements.copyClipboardBtn.addEventListener('click', copyToClipboard);
        elements.themeToggle.addEventListener('click', toggleTheme);

        // WhatsApp toggle
        const whatsappToggle = document.getElementById('whatsapp-toggle');
        whatsappToggle.addEventListener('click', () => {
            const phoneNumber = '+923142979757';
            const message = 'Hello! I would like to discuss about your QR Code Generator project.';
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });

        // Navigation
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Update active state immediately
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });

        // Add scroll spy functionality
        setupScrollSpy();


    }

    /**
     * Set up keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!elements.generateBtn.disabled) {
                    handleGenerate(e);
                }
            }

            // Escape to clear focus
            if (e.key === 'Escape') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.blur) {
                    activeElement.blur();
                }
            }
        });
    }

    /**
     * Setup form synchronization (placeholder for future features)
     */
    function setupFormSync() {
        // Form sync functionality removed with size slider
    }

    /**
     * Setup scroll spy to highlight active section in navbar
     */
    function setupScrollSpy() {
        const sections = ['generator', 'preview'];
        const navLinks = document.querySelectorAll('.nav-link');
        
        function updateActiveSection() {
            const scrollPosition = window.scrollY + 100; // Offset for navbar height
            
            sections.forEach((sectionId, index) => {
                const section = document.getElementById(sectionId);
                if (!section) return;
                
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current section link
                    navLinks[index].classList.add('active');
                }
            });
        }
        
        // Update on scroll
        window.addEventListener('scroll', updateActiveSection);
        
        // Initial update
        updateActiveSection();
        
        // Set Generate section as active by default
        navLinks[0].classList.add('active');
    }

        /**
     * Handle text input with debounced validation
     */
    function handleTextInput() {
        userInteracted.text = true;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateFormValidation();
            updateGenerateButton();
            detectUrl();
        }, DEBOUNCE_DELAY);
    }

    /**
     * Handle size change
     */
    function handleSizeChange() {
        userInteracted.size = true;
        const size = parseInt(elements.sizeInput.value);
        if (size >= SIZE_LIMITS.min && size <= SIZE_LIMITS.max) {
            // Validate size within limits
            elements.sizeInput.value = size;
        }
        updateFormValidation();
        updateGenerateButton();
    }

    /**
     * Handle margin change
     */
    function handleMarginChange() {
        userInteracted.margin = true;
        const margin = parseInt(elements.marginInput.value);
        if (margin < MARGIN_LIMITS.min) {
            elements.marginInput.value = MARGIN_LIMITS.min;
        } else if (margin > MARGIN_LIMITS.max) {
            elements.marginInput.value = MARGIN_LIMITS.max;
        }
        updateFormValidation();
        updateGenerateButton();
    }

    /**
     * Handle color changes
     */
    function handleColorChange() {
        // Update preview if QR code exists
        if (qrCode && elements.textInput.value.trim()) {
            updateQrCode();
        }
    }

    /**
     * Handle transparent background toggle
     */
    function handleTransparentChange() {
        elements.bgColorInput.disabled = elements.bgTransparentCheckbox.checked;
        handleColorChange();
    }

    /**
     * Handle QR code type change
     */
    function handleTypeChange() {
        const type = elements.typeSelect.value;
        
        // Reset form when type changes
        resetFormOnTypeChange();
        
        // Hide all sections first
        elements.textInputSection.style.display = 'none';
        elements.wifiInputSection.style.display = 'none';
        elements.contactInputSection.style.display = 'none';
        elements.pictureInputSection.style.display = 'none';
        
        // Remove required attributes
        elements.textInput.removeAttribute('required');
        elements.wifiSsidInput.removeAttribute('required');
        elements.contactFirstNameInput.removeAttribute('required');
        elements.pictureTextInput.removeAttribute('required');
        
        if (type === 'wifi') {
            elements.wifiInputSection.style.display = 'block';
            elements.wifiSsidInput.setAttribute('required', '');
            
            // Initialize password field visibility
            updatePasswordFieldVisibility();
            
            // Hide hint for other types
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'none';
            }
        } else if (type === 'contact') {
            elements.contactInputSection.style.display = 'block';
            elements.contactFirstNameInput.setAttribute('required', '');
            
            // Hide hint for other types
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'none';
            }
        } else if (type === 'picture') {
            elements.pictureInputSection.style.display = 'block';
            elements.pictureTextInput.setAttribute('required', '');
            
            // Set error correction to High for picture QR codes
            elements.eccSelect.value = 'H';
            
            // Show hint about error correction
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'block';
                eccHint.style.color = 'var(--color-primary)';
                eccHint.style.fontWeight = '600';
            }
        } else {
            // Text/URL type
            elements.textInputSection.style.display = 'block';
            elements.textInput.setAttribute('required', '');
            
            // Hide hint for other types
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'none';
            }
        }
        
        updateFormValidation();
        updateGenerateButton();
    }

    /**
     * Handle WiFi input changes
     */
    function handleWifiInput() {
        userInteracted.wifi = true;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updatePasswordFieldVisibility();
            updateFormValidation();
            updateGenerateButton();
            validateWifiSettings();
        }, DEBOUNCE_DELAY);
    }

    /**
     * Handle contact input changes
     */
    function handleContactInput() {
        userInteracted.contact = true;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateFormValidation();
            updateGenerateButton();
        }, DEBOUNCE_DELAY);
    }

    /**
     * Handle picture QR code input changes
     */
    function handlePictureInput() {
        userInteracted.picture = true;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateFormValidation();
            updateGenerateButton();
            detectUrl();
        }, DEBOUNCE_DELAY);
    }

    /**
     * Handle image upload
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }

        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            showError('Image file size must be less than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            imageDataUrl = e.target.result;
            uploadedImage = file;
            
            // Clear any existing errors since we have a valid image
            hideError();
            
            // Show preview
            showImagePreview(imageDataUrl, file.name);
            
            // Update QR code if text is already entered
            if (elements.pictureTextInput.value.trim()) {
                updateQrCode();
            }
            
            // Update form validation and buttons
            updateFormValidation();
            updateGenerateButton();
            updateDownloadButtons();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show image preview
     */
    function showImagePreview(dataUrl, fileName) {
        const preview = elements.picturePreview;
        preview.innerHTML = `
            <img src="${dataUrl}" alt="Uploaded image: ${fileName}" />
            <div class="picture-qr-info">
                <span class="picture-qr-info-icon">📷</span>
                <span>${fileName}</span>
            </div>
        `;
        preview.classList.add('has-image');
    }

    /**
     * Handle picture settings changes
     */
    function handlePictureSettingsChange() {
        // Update range value displays
        if (elements.pictureSizeValue) {
            elements.pictureSizeValue.textContent = elements.pictureSizeInput.value + '%';
        }

        // Update QR code if we have both text and image
        if (elements.pictureTextInput.value.trim() && uploadedImage) {
            updateQrCode();
        }
        
        // Update download buttons
        updateDownloadButtons();
    }

    /**
     * Setup drag and drop for image upload
     */
    function setupImageDragAndDrop() {
        const uploadContainer = document.querySelector('.file-upload-container');
        if (!uploadContainer) return;

        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });

        uploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                elements.pictureUploadInput.files = files;
                handleImageUpload({ target: { files: files } });
            }
        });
    }

    /**
     * Update password field visibility based on encryption type
     */
    function updatePasswordFieldVisibility() {
        const encryption = elements.wifiEncryptionSelect.value;
        
        if (encryption === 'nopass') {
            // Hide password field and clear its value
            elements.passwordFieldContainer.style.display = 'none';
            elements.wifiPasswordInput.value = '';
            elements.wifiPasswordInput.classList.remove('input-error');
            
            // Clear any password-related hints
            const passwordHint = document.getElementById('password-hint');
            if (passwordHint) {
                passwordHint.textContent = '';
                passwordHint.className = 'form-hint';
            }
        } else {
            // Show password field
            elements.passwordFieldContainer.style.display = 'grid';
        }
    }

    /**
     * Validate WiFi settings for consistency
     */
    function validateWifiSettings() {
        const encryption = elements.wifiEncryptionSelect.value;
        const password = elements.wifiPasswordInput.value;
        const passwordHint = document.getElementById('password-hint');
        
        // Clear previous validation
        elements.wifiPasswordInput.classList.remove('input-error');
        if (passwordHint) {
            passwordHint.className = 'form-hint';
            passwordHint.textContent = '';
        }
        
        // Only validate password if encryption requires it, field is visible, and user has interacted
        if (encryption !== 'nopass' && elements.passwordFieldContainer.style.display !== 'none' && userInteracted.wifi) {
            if ((encryption === 'WPA' || encryption === 'WEP') && !password.trim()) {
                elements.wifiPasswordInput.classList.add('input-error');
                if (passwordHint) {
                    passwordHint.className = 'form-hint form-error';
                    passwordHint.textContent = `Password is required for ${encryption} encryption`;
                }
            }
        }
    }

    /**
     * Toggle password visibility
     */
    function togglePasswordVisibility() {
        const passwordInput = elements.wifiPasswordInput;
        const toggleBtn = elements.togglePasswordBtn;
        const eyeIcon = toggleBtn.querySelector('.eye-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
        } else {
            passwordInput.type = 'password';
            eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
        }
    }



    /**
     * Handle form submission (generate QR code)
     */
    function handleGenerate(e) {
        e.preventDefault();

        const type = elements.typeSelect.value;
        
        if (type === 'wifi') {
            const ssid = elements.wifiSsidInput.value.trim();
            if (!ssid) {
                showError('Please enter WiFi network name (SSID).');
                return;
            }
            generateWifiQR();
        } else if (type === 'contact') {
            const firstName = elements.contactFirstNameInput.value.trim();
            if (!firstName) {
                showError('Please enter first name for contact QR code.');
                return;
            }
            generateContactQR();
        } else if (type === 'picture') {
            const text = elements.pictureTextInput.value.trim();
            if (!text) {
                showError('Please enter text or URL to generate picture QR code.');
                return;
            }
            if (!uploadedImage) {
                showError('Please upload an image to generate picture QR code.');
                return;
            }
            generatePictureQR(text);
        } else {
            const text = elements.textInput.value.trim();
            if (!text) {
                showError('Please enter text or URL to generate QR code.');
                return;
            }
            generateQR(text);
        }
        
        // Scroll to preview section
        setTimeout(() => {
            const previewSection = document.getElementById('preview');
            if (previewSection) {
                previewSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 500); // Small delay to ensure QR code is generated
    }

    /**
     * Generate QR code with current settings
     */
    function generateQR(text) {
        if (isGenerating) return;

        isGenerating = true;
        elements.generateBtn.classList.add('loading');
        elements.generateBtn.disabled = true;

        try {
            updateQrCode();

            // Update UI
            updateInfo();
            updateDownloadButtons();



            // Clear any previous errors
            hideError();

        } catch (error) {
            console.error('Failed to generate QR code:', error);
            showError('Failed to generate QR code. Please check your input and try again.');
        } finally {
            isGenerating = false;
            elements.generateBtn.classList.remove('loading');
            updateGenerateButton();
        }
    }

    /**
     * Generate WiFi QR code
     */
    function generateWifiQR() {
        if (isGenerating) return;

        isGenerating = true;
        elements.generateBtn.classList.add('loading');
        elements.generateBtn.disabled = true;

        try {
            const ssid = elements.wifiSsidInput.value.trim();
            const password = elements.wifiPasswordInput.value;
            const encryption = elements.wifiEncryptionSelect.value;
            const hidden = elements.wifiHiddenCheckbox.checked;

            // Generate WiFi QR code string
            const wifiString = generateWifiString(ssid, password, encryption, hidden);
            
            // Update QR code with WiFi data
            updateQrCodeWithData(wifiString);

            // Update UI
            updateWifiInfo(ssid, encryption, hidden);
            updateDownloadButtons();



            // Clear any previous errors
            hideError();

        } catch (error) {
            console.error('Failed to generate WiFi QR code:', error);
            showError('Failed to generate WiFi QR code. Please check your input and try again.');
        } finally {
            isGenerating = false;
            elements.generateBtn.classList.remove('loading');
            updateGenerateButton();
        }
    }

    /**
     * Generate WiFi connection string
     */
    function generateWifiString(ssid, password, encryption, hidden) {
        // Escape special characters in SSID and password
        const escapedSsid = escapeWifiString(ssid);
        const escapedPassword = escapeWifiString(password);
        
        // Build WiFi string according to standard format
        let wifiString = `WIFI:S:${escapedSsid};`;
        
        if (encryption !== 'nopass') {
            wifiString += `T:${encryption};P:${escapedPassword};`;
        } else {
            wifiString += `T:nopass;`;
        }
        
        if (hidden) {
            wifiString += `H:true;`;
        }
        
        wifiString += `;;`;
        
        return wifiString;
    }

    /**
     * Escape special characters for WiFi string
     */
    function escapeWifiString(str) {
        if (!str) return '';
        return str.replace(/[\\;:,]/g, '\\$&');
    }

    /**
     * Update QR code with specific data
     */
    function updateQrCodeWithData(data) {
        if (!qrCode) return;

        const options = getCurrentOptions();
        options.data = data;
        qrCode.update(options);

        // Clear previous preview
        elements.preview.innerHTML = '';

        // Append new QR code
        qrCode.append(elements.preview);
    }

    /**
     * Update QR code with image data
     */
    function updateQrCodeWithImage(text) {
        if (!qrCode) return;

        const options = getCurrentOptions();
        qrCode.update(options);

        // Clear previous preview
        elements.preview.innerHTML = '';

        // Append new QR code
        qrCode.append(elements.preview);
    }

    /**
     * Generate Contact QR code
     */
    function generateContactQR() {
        if (isGenerating) return;

        isGenerating = true;
        elements.generateBtn.classList.add('loading');
        elements.generateBtn.disabled = true;

        try {
            const firstName = elements.contactFirstNameInput.value.trim();
            const lastName = elements.contactLastNameInput.value.trim();
            const phone = elements.contactPhoneInput.value.trim();
            const email = elements.contactEmailInput.value.trim();
            const company = elements.contactCompanyInput.value.trim();
            const jobTitle = elements.contactJobTitleInput.value.trim();
            const website = elements.contactWebsiteInput.value.trim();
            const address = elements.contactAddressInput.value.trim();

            // Generate vCard string
            const vCardString = generateVCardString(firstName, lastName, phone, email, company, jobTitle, website, address);
            
            // Update QR code with vCard data
            updateQrCodeWithData(vCardString);

            // Update UI
            updateContactInfo(firstName, lastName);
            updateDownloadButtons();



            // Clear any previous errors
            hideError();

        } catch (error) {
            console.error('Failed to generate Contact QR code:', error);
            showError('Failed to generate Contact QR code. Please check your input and try again.');
        } finally {
            isGenerating = false;
            elements.generateBtn.classList.remove('loading');
            updateGenerateButton();
        }
    }

    /**
     * Generate vCard string
     */
    function generateVCardString(firstName, lastName, phone, email, company, jobTitle, website, address) {
        let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
        
        // Name
        if (firstName || lastName) {
            vCard += `FN:${firstName} ${lastName}\n`;
            vCard += `N:${lastName};${firstName};;;\n`;
        }
        
        // Phone
        if (phone) {
            vCard += `TEL:${phone}\n`;
        }
        
        // Email
        if (email) {
            vCard += `EMAIL:${email}\n`;
        }
        
        // Company
        if (company) {
            vCard += `ORG:${company}\n`;
        }
        
        // Job Title
        if (jobTitle) {
            vCard += `TITLE:${jobTitle}\n`;
        }
        
        // Website
        if (website) {
            vCard += `URL:${website}\n`;
        }
        
        // Address
        if (address) {
            vCard += `ADR:;;${address}\n`;
        }
        
        vCard += 'END:VCARD';
        
        return vCard;
    }

    /**
     * Generate Picture QR code
     */
    function generatePictureQR(text) {
        if (isGenerating) return;

        isGenerating = true;
        elements.generateBtn.classList.add('loading');
        elements.generateBtn.disabled = true;

        try {
            // Update QR code with image
            updateQrCodeWithImage(text);

            // Update UI
            updatePictureInfo(text);
            updateDownloadButtons();



            // Clear any previous errors
            hideError();

        } catch (error) {
            console.error('Failed to generate Picture QR code:', error);
            showError('Failed to generate Picture QR code. Please check your input and try again.');
        } finally {
            isGenerating = false;
            elements.generateBtn.classList.remove('loading');
            updateGenerateButton();
        }
    }

    /**
     * Update info display for WiFi QR codes
     */
    function updateWifiInfo(ssid, encryption, hidden) {
        const size = elements.sizeInput.value;
        const ecc = elements.eccSelect.value;
        const margin = elements.marginInput.value;
        const encryptionText = encryption === 'nopass' ? 'No Password' : encryption;
        const hiddenText = hidden ? ' (Hidden)' : '';

        elements.info.textContent = `WiFi: ${ssid} | ${encryptionText}${hiddenText} | Size: ${size}×${size}px | ECC: ${ecc} | Margin: ${margin}px`;
    }

    /**
     * Update info display for Contact QR codes
     */
    function updateContactInfo(firstName, lastName) {
        const size = elements.sizeInput.value;
        const ecc = elements.eccSelect.value;
        const margin = elements.marginInput.value;
        const fullName = `${firstName} ${lastName}`.trim();

        elements.info.textContent = `Contact: ${fullName} | vCard Format | Size: ${size}×${size}px | ECC: ${ecc} | Margin: ${margin}px`;
    }

    /**
     * Update info display for Picture QR codes
     */
    function updatePictureInfo(text) {
        const size = elements.sizeInput.value;
        const ecc = elements.eccSelect.value;
        const margin = elements.marginInput.value;
        const textPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;

        elements.info.textContent = `Picture QR: ${textPreview} | Size: ${size}×${size}px | ECC: ${ecc} | Margin: ${margin}px`;
    }

    /**
     * Update QR code with current settings
     */
    function updateQrCode() {
        if (!qrCode) return;

        const options = getCurrentOptions();
        qrCode.update(options);

        // Clear previous preview
        elements.preview.innerHTML = '';

        // Append new QR code
        qrCode.append(elements.preview);
    }

    /**
     * Get current QR code options from form
     */
    function getCurrentOptions() {
        const type = elements.typeSelect.value;
        let text = '';
        
        // Get text based on type
        if (type === 'picture') {
            text = elements.pictureTextInput.value.trim();
        } else {
            text = elements.textInput.value.trim();
        }
        
        const size = parseInt(elements.sizeInput.value);
        const margin = parseInt(elements.marginInput.value);
        const ecc = elements.eccSelect.value;
        const fgColor = elements.fgColorInput.value;
        const bgColor = elements.bgTransparentCheckbox.checked ? 'transparent' : elements.bgColorInput.value;

        const options = {
            width: size,
            height: size,
            data: text,
            margin: margin,
            qrOptions: {
                errorCorrectionLevel: ecc
            },
            dotsOptions: {
                color: fgColor
            },
            backgroundOptions: {
                color: bgColor
            }
        };

        // Add image options for picture QR codes only
        if (type === 'picture' && uploadedImage && imageDataUrl) {
            const pictureSize = parseInt(elements.pictureSizeInput.value);
            
            options.imageOptions = {
                crossOrigin: 'anonymous',
                margin: 20,
                hideBackgroundDots: true,
                imageSize: pictureSize / 100
            };
            
            // Set image data
            options.image = imageDataUrl;
        } else {
            // For non-picture types, explicitly set no image and clear any existing image
            options.imageOptions = {
                crossOrigin: 'anonymous',
                margin: 20
            };
            // Explicitly remove any image data
            delete options.image;
            
            // Force clear image state for non-picture types
            if (uploadedImage || imageDataUrl) {
                uploadedImage = null;
                imageDataUrl = null;
            }
        }

        return options;
    }

    /**
     * Update info display
     */
    function updateInfo() {
        const size = elements.sizeInput.value;
        const ecc = elements.eccSelect.value;
        const margin = elements.marginInput.value;

        elements.info.textContent = `Size: ${size}×${size}px | ECC: ${ecc} | Margin: ${margin}px`;
    }

    /**
     * Update download button states
     */
    function updateDownloadButtons() {
        const type = elements.typeSelect.value;
        let hasContent = false;
        
        if (type === 'picture') {
            // For picture QR codes, check if we have both text and image
            const hasText = elements.pictureTextInput.value.trim().length > 0;
            const hasImage = uploadedImage && imageDataUrl;
            hasContent = hasText && hasImage;
        } else if (type === 'wifi') {
            // For WiFi QR codes, check if we have SSID
            hasContent = elements.wifiSsidInput.value.trim().length > 0;
        } else if (type === 'contact') {
            // For contact QR codes, check if we have first name
            hasContent = elements.contactFirstNameInput.value.trim().length > 0;
        } else {
            // For text/URL QR codes, check if we have text
            hasContent = elements.textInput.value.trim().length > 0;
        }
        
        elements.downloadPngBtn.disabled = !hasContent;
        elements.downloadSvgBtn.disabled = !hasContent;
        elements.copyClipboardBtn.disabled = !hasContent;
    }

    /**
     * Update generate button state
     */
    function updateGenerateButton() {
        const type = elements.typeSelect.value;
        let hasContent = false;
        let hasErrors = false;
        
        // Check size and margin validation
        const size = parseInt(elements.sizeInput.value);
        const margin = parseInt(elements.marginInput.value);
        const isSizeValid = size >= SIZE_LIMITS.min && size <= SIZE_LIMITS.max;
        const isMarginValid = margin >= MARGIN_LIMITS.min && margin <= MARGIN_LIMITS.max;
        
        if (type === 'wifi') {
            const ssid = elements.wifiSsidInput.value.trim();
            const encryption = elements.wifiEncryptionSelect.value;
            const password = elements.wifiPasswordInput.value.trim();
            
            hasContent = ssid.length > 0;
            
            // Check for validation errors - only validate password if field is visible
            hasErrors = !hasContent || 
                       (encryption !== 'nopass' && 
                        elements.passwordFieldContainer.style.display !== 'none' && 
                        (encryption === 'WPA' || encryption === 'WEP') && 
                        !password);
        } else if (type === 'contact') {
            const firstName = elements.contactFirstNameInput.value.trim();
            hasContent = firstName.length > 0;
        } else if (type === 'picture') {
            const text = elements.pictureTextInput.value.trim();
            const hasImage = uploadedImage && imageDataUrl;
            hasContent = text.length > 0 && hasImage;
        } else {
            hasContent = elements.textInput.value.trim().length > 0;
        }
        
        // Include size and margin validation in overall error check
        hasErrors = hasErrors || !isSizeValid || !isMarginValid;
        
        elements.generateBtn.disabled = !hasContent || hasErrors || isGenerating;
    }

    /**
     * Update form validation
     */
    function updateFormValidation() {
        const type = elements.typeSelect.value;
        
        // Validate size and margin (common for both types)
        validateSizeAndMargin();
        
        if (type === 'wifi') {
            const ssid = elements.wifiSsidInput.value.trim();
            const encryption = elements.wifiEncryptionSelect.value;
            const password = elements.wifiPasswordInput.value.trim();
            
            // Validate SSID - only show error if user has interacted
            const isSsidValid = ssid.length > 0;
            if (userInteracted.wifi) {
                elements.wifiSsidInput.classList.toggle('input-error', !isSsidValid);

                if (!isSsidValid) {
                    document.getElementById('ssid-hint').textContent = 'Network name is required';
                    document.getElementById('ssid-hint').className = 'form-hint form-error';
                } else {
                    document.getElementById('ssid-hint').textContent = '';
                    document.getElementById('ssid-hint').className = 'form-hint';
                }
            }
            
            // Validate password for encryption type
            validateWifiSettings();
        } else if (type === 'contact') {
            const firstName = elements.contactFirstNameInput.value.trim();
            
            // Validate first name - only show error if user has interacted
            const isFirstNameValid = firstName.length > 0;
            if (userInteracted.contact) {
                elements.contactFirstNameInput.classList.toggle('input-error', !isFirstNameValid);

                if (!isFirstNameValid) {
                    document.getElementById('firstName-hint').textContent = 'First name is required';
                    document.getElementById('firstName-hint').className = 'form-hint form-error';
                } else {
                    document.getElementById('firstName-hint').textContent = '';
                    document.getElementById('firstName-hint').className = 'form-hint';
                }
            }
        } else if (type === 'picture') {
            const text = elements.pictureTextInput.value.trim();
            const isValid = text.length > 0;

            // Only show error if user has interacted
            if (userInteracted.picture) {
                elements.pictureTextInput.classList.toggle('input-error', !isValid);

                if (!isValid) {
                    const hintElement = document.getElementById('picture-text-hint');
                    if (hintElement) {
                        hintElement.textContent = 'This field is required';
                        hintElement.className = 'form-hint form-error';
                    }
                } else {
                    const hintElement = document.getElementById('picture-text-hint');
                    if (hintElement) {
                        hintElement.className = 'form-hint';
                    }
                }
            }
        } else {
            const text = elements.textInput.value.trim();
            const isValid = text.length > 0;

            // Only show error if user has interacted
            if (userInteracted.text) {
                elements.textInput.classList.toggle('input-error', !isValid);

                if (!isValid) {
                    elements.textHint.textContent = 'This field is required';
                    elements.textHint.className = 'form-hint form-error';
                } else {
                    elements.textHint.className = 'form-hint';
                }
            }
        }
    }

    /**
     * Validate size and margin fields
     */
    function validateSizeAndMargin() {
        const size = parseInt(elements.sizeInput.value);
        const margin = parseInt(elements.marginInput.value);
        const sizeHint = document.getElementById('size-hint');
        const marginHint = document.getElementById('margin-hint');
        
        // Validate size - only show error if user has interacted
        const isSizeValid = size >= SIZE_LIMITS.min && size <= SIZE_LIMITS.max;
        if (userInteracted.size) {
            elements.sizeInput.classList.toggle('input-error', !isSizeValid);
            
            if (!isSizeValid) {
                if (sizeHint) {
                    sizeHint.textContent = `Size must be between ${SIZE_LIMITS.min} and ${SIZE_LIMITS.max} pixels`;
                    sizeHint.className = 'form-hint form-error';
                }
            } else {
                if (sizeHint) {
                    sizeHint.textContent = '';
                    sizeHint.className = 'form-hint';
                }
            }
        }
        
        // Validate margin - only show error if user has interacted
        const isMarginValid = margin >= MARGIN_LIMITS.min && margin <= MARGIN_LIMITS.max;
        if (userInteracted.margin) {
            elements.marginInput.classList.toggle('input-error', !isMarginValid);
            
            if (!isMarginValid) {
                if (marginHint) {
                    marginHint.textContent = `Quiet zone must be between ${MARGIN_LIMITS.min} and ${MARGIN_LIMITS.max} pixels`;
                    marginHint.className = 'form-hint form-error';
                }
            } else {
                if (marginHint) {
                    marginHint.textContent = '';
                    marginHint.className = 'form-hint';
                }
            }
        }
    }

    /**
     * Detect if input is a URL
     */
    function detectUrl() {
        const type = elements.typeSelect.value;
        let text = '';
        let hintElement = elements.textHint;
        
        if (type === 'picture') {
            text = elements.pictureTextInput.value.trim();
            hintElement = document.getElementById('picture-text-hint');
        } else {
            text = elements.textInput.value.trim();
        }
        
        if (!text || !hintElement) return;

        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        const isUrl = urlPattern.test(text);

        if (isUrl && !text.startsWith('http')) {
            hintElement.textContent = 'URL detected - will be encoded as https://' + text;
        } else if (isUrl) {
            hintElement.textContent = 'URL detected';
        } else {
            hintElement.textContent = '';
        }
    }

    /**
     * Handle reset button
     */
    function handleReset() {
        // Reset form to defaults
        elements.typeSelect.value = 'text';
        elements.textInput.value = '';
        elements.wifiSsidInput.value = '';
        elements.wifiPasswordInput.value = '';
        elements.wifiEncryptionSelect.value = 'WPA';
        elements.wifiHiddenCheckbox.checked = false;
        
        // Reset contact fields
        elements.contactFirstNameInput.value = '';
        elements.contactLastNameInput.value = '';
        elements.contactPhoneInput.value = '';
        elements.contactEmailInput.value = '';
        elements.contactCompanyInput.value = '';
        elements.contactJobTitleInput.value = '';
        elements.contactWebsiteInput.value = '';
        elements.contactAddressInput.value = '';
        
        // Reset picture QR code fields
        elements.pictureTextInput.value = '';
        elements.pictureUploadInput.value = '';
        elements.picturePreview.innerHTML = '';
        elements.picturePreview.classList.remove('has-image');
        elements.pictureSizeInput.value = DEFAULTS.pictureSize;
        if (elements.pictureSizeValue) {
            elements.pictureSizeValue.textContent = DEFAULTS.pictureSize + '%';
        }
        
        // Reset uploaded image state
        uploadedImage = null;
        imageDataUrl = null;
        
        elements.sizeInput.value = DEFAULTS.size;
        elements.eccSelect.value = DEFAULTS.ecc;
        elements.marginInput.value = DEFAULTS.margin;
        elements.fgColorInput.value = DEFAULTS.fgColor;
        elements.bgColorInput.value = DEFAULTS.bgColor;
        elements.bgTransparentCheckbox.checked = DEFAULTS.bgTransparent;

        // Reset password visibility
        elements.wifiPasswordInput.type = 'password';
        const eyeIcon = elements.togglePasswordBtn.querySelector('.eye-icon');
        eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';

        // Show text input section, hide other sections
        elements.textInputSection.style.display = 'block';
        elements.wifiInputSection.style.display = 'none';
        elements.contactInputSection.style.display = 'none';
        elements.pictureInputSection.style.display = 'none';
        elements.textInput.setAttribute('required', '');
        elements.wifiSsidInput.removeAttribute('required');
        elements.contactFirstNameInput.removeAttribute('required');
        elements.pictureTextInput.removeAttribute('required');
        
        // Reset password field visibility
        if (elements.passwordFieldContainer) {
            elements.passwordFieldContainer.style.display = 'grid';
        }

        // Clear preview
        elements.preview.innerHTML = '';
        elements.info.textContent = '';

        // Update UI
        updateFormValidation();
        updateGenerateButton();
        updateDownloadButtons();
        hideError();
        
        // Reset user interaction state
        userInteracted = {
            size: false,
            margin: false,
            text: false,
            wifi: false,
            contact: false,
            picture: false
        };
        
        // Clear any WiFi validation errors
        if (document.getElementById('password-hint')) {
            document.getElementById('password-hint').textContent = '';
            document.getElementById('password-hint').className = 'form-hint';
        }
        if (elements.wifiPasswordInput) {
            elements.wifiPasswordInput.classList.remove('input-error');
        }
        
        // Clear size and margin validation errors
        if (document.getElementById('size-hint')) {
            document.getElementById('size-hint').textContent = '';
            document.getElementById('size-hint').className = 'form-hint';
        }
        if (document.getElementById('margin-hint')) {
            document.getElementById('margin-hint').textContent = '';
            document.getElementById('margin-hint').className = 'form-hint';
        }
        if (elements.sizeInput) {
            elements.sizeInput.classList.remove('input-error');
        }
        if (elements.marginInput) {
            elements.marginInput.classList.remove('input-error');
        }
        
        // Hide error correction hint
        const eccHint = document.getElementById('ecc-hint');
        if (eccHint) {
            eccHint.style.display = 'none';
        }
    }

    /**
     * Completely clear QR code and image data
     */
    function clearQrCodeAndImage() {
        // Clear image state
        uploadedImage = null;
        imageDataUrl = null;
        
        // Clear preview
        if (elements.preview) {
            elements.preview.innerHTML = '';
        }
        if (elements.info) {
            elements.info.textContent = '';
        }
        
        // Reset QR code library
        if (qrCode) {
            qrCode.update({
                width: parseInt(elements.sizeInput.value),
                height: parseInt(elements.sizeInput.value),
                data: '',
                margin: parseInt(elements.marginInput.value),
                qrOptions: {
                    errorCorrectionLevel: elements.eccSelect.value
                },
                dotsOptions: {
                    color: elements.fgColorInput.value
                },
                backgroundOptions: {
                    color: elements.bgTransparentCheckbox.checked ? 'transparent' : elements.bgColorInput.value
                },
                imageOptions: {
                    crossOrigin: 'anonymous',
                    margin: 20
                }
            });
        }
    }

    /**
     * Reset form fields when type changes (without clearing common settings)
     */
    function resetFormOnTypeChange() {
        // Clear all input fields
        elements.textInput.value = '';
        elements.wifiSsidInput.value = '';
        elements.wifiPasswordInput.value = '';
        elements.wifiEncryptionSelect.value = 'WPA';
        elements.wifiHiddenCheckbox.checked = false;
        
        // Reset contact fields
        elements.contactFirstNameInput.value = '';
        elements.contactLastNameInput.value = '';
        elements.contactPhoneInput.value = '';
        elements.contactEmailInput.value = '';
        elements.contactCompanyInput.value = '';
        elements.contactJobTitleInput.value = '';
        elements.contactWebsiteInput.value = '';
        elements.contactAddressInput.value = '';
        
        // Reset picture QR code fields
        elements.pictureTextInput.value = '';
        elements.pictureUploadInput.value = '';
        elements.picturePreview.innerHTML = '';
        elements.picturePreview.classList.remove('has-image');
        elements.pictureSizeInput.value = DEFAULTS.pictureSize;
        if (elements.pictureSizeValue) {
            elements.pictureSizeValue.textContent = DEFAULTS.pictureSize + '%';
        }
        
        // Reset uploaded image state and clear QR code
        clearQrCodeAndImage();
        
        // Reset password visibility
        elements.wifiPasswordInput.type = 'password';
        const eyeIcon = elements.togglePasswordBtn.querySelector('.eye-icon');
        if (eyeIcon) {
            eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
        }
        
        // Reset password field visibility
        if (elements.passwordFieldContainer) {
            elements.passwordFieldContainer.style.display = 'grid';
        }

        // Clear preview
        elements.preview.innerHTML = '';
        elements.info.textContent = '';

        // Ensure no required attributes are set after reset
        removeRequiredFromHiddenInputs();

        // Update UI
        updateFormValidation();
        updateGenerateButton();
        updateDownloadButtons();
        hideError();
        
        // Reset user interaction state
        userInteracted = {
            size: false,
            margin: false,
            text: false,
            wifi: false,
            contact: false,
            picture: false
        };
        
        // Clear any validation errors
        if (document.getElementById('password-hint')) {
            document.getElementById('password-hint').textContent = '';
            document.getElementById('password-hint').className = 'form-hint';
        }
        if (elements.wifiPasswordInput) {
            elements.wifiPasswordInput.classList.remove('input-error');
        }
        
        // Clear size and margin validation errors
        if (document.getElementById('size-hint')) {
            document.getElementById('size-hint').textContent = '';
            document.getElementById('size-hint').className = 'form-hint';
        }
        if (document.getElementById('margin-hint')) {
            document.getElementById('margin-hint').textContent = '';
            document.getElementById('margin-hint').className = 'form-hint';
        }
        if (elements.sizeInput) {
            elements.sizeInput.classList.remove('input-error');
        }
        if (elements.marginInput) {
            elements.marginInput.classList.remove('input-error');
        }
    }

    /**
     * Handle QR code type change
     */
    function handleTypeChange() {
        const type = elements.typeSelect.value;
        
        // Reset form when type changes
        resetFormOnTypeChange();
        
        // Hide all sections first
        elements.textInputSection.style.display = 'none';
        elements.wifiInputSection.style.display = 'none';
        elements.contactInputSection.style.display = 'none';
        elements.pictureInputSection.style.display = 'none';
        
        // Remove required attributes
        elements.textInput.removeAttribute('required');
        elements.wifiSsidInput.removeAttribute('required');
        elements.contactFirstNameInput.removeAttribute('required');
        elements.pictureTextInput.removeAttribute('required');
        
        if (type === 'wifi') {
            elements.wifiInputSection.style.display = 'block';
            elements.wifiSsidInput.setAttribute('required', '');
            
            // Initialize password field visibility
            updatePasswordFieldVisibility();
            
            // Hide hint for other types
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'none';
            }
        } else if (type === 'contact') {
            elements.contactInputSection.style.display = 'block';
            elements.contactFirstNameInput.setAttribute('required', '');
            
            // Hide hint for other types
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'none';
            }
        } else if (type === 'picture') {
            elements.pictureInputSection.style.display = 'block';
            elements.pictureTextInput.setAttribute('required', '');
            
            // Set error correction to High for picture QR codes
            elements.eccSelect.value = 'H';
            
            // Show hint about error correction
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'block';
                eccHint.style.color = 'var(--color-primary)';
                eccHint.style.fontWeight = '600';
            }
        } else {
            // Text/URL type
            elements.textInputSection.style.display = 'block';
            elements.textInput.setAttribute('required', '');
            
            // Hide hint for other types
            const eccHint = document.getElementById('ecc-hint');
            if (eccHint) {
                eccHint.style.display = 'none';
            }
        }
        
        updateFormValidation();
        updateGenerateButton();
    }

    /**
     * Download QR code as PNG or SVG
     */
    function downloadQR(format) {
        if (!qrCode) return;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `qr-${timestamp}`;

        try {
            // Ensure QR code is up to date before downloading
            const type = elements.typeSelect.value;
            if (type === 'picture' && uploadedImage && imageDataUrl) {
                // For picture QR codes, ensure the image is properly set
                const options = getCurrentOptions();
                qrCode.update(options);
            }

            if (format === 'png') {
                qrCode.download({ name: filename, extension: 'png' });
            } else if (format === 'svg') {
                qrCode.download({ name: filename, extension: 'svg' });
            }
        } catch (error) {
            console.error('Download failed:', error);
            showError('Failed to download QR code. Please try again.');
        }
    }

    /**
     * Copy QR code to clipboard
     */
    async function copyToClipboard() {
        if (!qrCode) return;

        try {
            // Ensure QR code is up to date before copying
            const type = elements.typeSelect.value;
            if (type === 'picture' && uploadedImage && imageDataUrl) {
                // For picture QR codes, ensure the image is properly set
                const options = getCurrentOptions();
                qrCode.update(options);
            }

            // Get PNG data
            const blob = await qrCode.getRawData('png');
            if (blob && navigator.clipboard && navigator.clipboard.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showSuccess('QR code copied to clipboard!');
            } else {
                showError('Clipboard API not supported in this browser.');
            }
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            showError('Failed to copy QR code to clipboard.');
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const type = elements.typeSelect.value;
        let hintElement = elements.textHint;
        
        if (type === 'picture') {
            hintElement = document.getElementById('picture-text-hint');
        }
        
        if (hintElement) {
            hintElement.textContent = message;
            hintElement.className = 'form-hint form-error';
        }
    }

    /**
     * Hide error message
     */
    function hideError() {
        const type = elements.typeSelect.value;
        let hintElement = elements.textHint;
        
        if (type === 'picture') {
            hintElement = document.getElementById('picture-text-hint');
        }
        
        if (hintElement) {
            hintElement.textContent = '';
            hintElement.className = 'form-hint';
        }
    }

    /**
     * Show success message
     */
    function showSuccess(message) {
        // Create a temporary success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--color-success);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
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
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(successMessage);

        // Remove after 3 seconds with animation
        setTimeout(() => {
            successMessage.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.parentNode.removeChild(successMessage);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Load theme preference from localStorage
     */
    function loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('qr-theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            let theme = 'system'; // default

            if (savedTheme === 'light' || savedTheme === 'dark') {
                theme = savedTheme;
            } else if (savedTheme === 'system' || savedTheme === null) {
                theme = systemPrefersDark ? 'dark' : 'light';
            }

            applyTheme(theme);
            updateThemeIcon(theme);

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (localStorage.getItem('qr-theme') === 'system') {
                    const newTheme = e.matches ? 'dark' : 'light';
                    applyTheme(newTheme);
                    updateThemeIcon('system');
                }
            });

        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    }

    /**
     * Toggle theme (cycles through light -> dark)
     */
    function toggleTheme() {
        try {
            const currentTheme = localStorage.getItem('qr-theme') || 'light';
            let newTheme;

            if (currentTheme === 'light') {
                newTheme = 'dark';
            } else {
                newTheme = 'light';
            }

            localStorage.setItem('qr-theme', newTheme);
            applyTheme(newTheme);
            updateThemeIcon(newTheme);

        } catch (error) {
            console.error('Failed to toggle theme:', error);
        }
    }

    /**
     * Apply theme to document
     */
    function applyTheme(theme) {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else {
            // System preference
            root.removeAttribute('data-theme');
        }
    }

    /**
     * Update theme toggle icon
     */
    function updateThemeIcon(theme) {
        if (!elements.themeIcon) return;

        if (theme === 'dark') {
            elements.themeIcon.textContent = '☀️';
            elements.themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            elements.themeIcon.textContent = '🌙';
            elements.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    // Initialize the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
