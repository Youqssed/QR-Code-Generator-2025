# QR Code Generator

A modern, feature-rich QR code generator built with vanilla HTML, CSS, and JavaScript. This application allows users to create custom QR codes with various types of content, styling options, and export capabilities.

## Website URL
[https://qr-codes-generator-wifi-image-contact.netlify.app/](https://qr-codes-generator-wifi-image-contact.netlify.app/)

## 🔍 Topics

`qr-code` `qr-code-generator` `qrcode` `qrcode-maker`  
`javascript` `vanilla-javascript` `html` `css` `webapp`  
`open-source` `frontend-tool` `barcode` `barcode-generator`  
`wifi-qrcode` `vcard-qrcode` `image-qrcode` `qr-code-with-logo`  
`customizable-qrcode` `responsive-webapp` `dark-mode`  
`offline-tool` `progressive-webapp` `pwa` `utilities`  
`qr-code-svg` `qr-code-png` `qr-code-download`  
`online-tool` `developer-tool` `modern-webapp`  

## 🌟 Features

### 📱 Multiple QR Code Types
- **Text/URL QR Codes**: Generate QR codes for plain text or website URLs
- **WiFi Network QR Codes**: Create QR codes that automatically connect devices to WiFi networks
- **Contact QR Codes (vCard)**: Generate QR codes containing contact information in vCard format
- **Picture QR Codes**: Embed custom images/logos within QR codes

### 🎨 Customization Options
- **Size Control**: Adjustable QR code size from 128px to 1024px
- **Error Correction**: Four levels of error correction (L, M, Q, H)
- **Color Customization**: Custom foreground and background colors
- **Transparent Background**: Option for transparent background
- **Quiet Zone**: Adjustable margin/quiet zone (0-64px)
- **Image Integration**: For picture QR codes, customizable image size (10%-50%)

### 💾 Export & Download
- **PNG Download**: High-quality PNG format with timestamped filenames
- **SVG Download**: Scalable vector graphics format
- **Clipboard Copy**: Copy QR codes directly to clipboard
- **Print Support**: Optimized for printing

### 🎯 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Real-time Preview**: Instant QR code generation and preview
- **Form Validation**: Comprehensive input validation with helpful error messages
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to generate, Escape to clear focus
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### 🔧 Technical Features
- **No Dependencies**: Pure vanilla JavaScript implementation
- **Modern CSS**: CSS Grid, Flexbox, and CSS Variables for theming
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Cross-browser Compatibility**: Supports all modern browsers
- **Mobile Optimized**: Touch-friendly interface with mobile-specific optimizations

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start generating QR codes!

### File Structure
```
qr-code/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and theming
├── app.js             # JavaScript functionality
└── assets/            # Additional assets (if any)
```

## 📖 Usage Guide

### Basic QR Code Generation
1. Select "Text / URL" from the QR Code Type dropdown
2. Enter your text or URL in the input field
3. Adjust size, colors, and other settings as needed
4. Click "Generate QR Code"
5. Download or copy the generated QR code

### WiFi QR Code Generation
1. Select "WiFi Network" from the QR Code Type dropdown
2. Enter the WiFi network name (SSID)
3. Choose encryption type (WPA/WPA2/WPA3, WEP, or No Password)
4. Enter the password (if required)
5. Check "Hidden Network" if applicable
6. Generate and download the QR code

### Contact QR Code Generation
1. Select "Contact (vCard)" from the QR Code Type dropdown
2. Fill in contact information (First Name is required)
3. Add optional fields like phone, email, company, etc.
4. Generate the QR code in vCard format

### Picture QR Code Generation
1. Select "Picture QR Code" from the QR Code Type dropdown
2. Enter the text or URL to encode
3. Upload an image file (PNG, JPG, JPEG, GIF, WebP, max 2MB)
4. Adjust image size using the slider (10%-50%)
5. Generate the QR code with embedded image

## 🎨 Customization Options

### QR Code Styling
- **Size**: 128px to 1024px (in 16px increments)
- **Error Correction**:
  - L (Low): ~7% error correction
  - M (Medium): ~15% error correction (default)
  - Q (Quartile): ~25% error correction
  - H (High): ~30% error correction (auto-selected for picture QR codes)
- **Colors**: Custom foreground and background colors
- **Transparency**: Optional transparent background
- **Margin**: 0-64px quiet zone around the QR code

### Image Integration (Picture QR Codes)
- **Supported Formats**: PNG, JPG, JPEG, GIF, WebP
- **File Size Limit**: 2MB maximum
- **Image Size**: 10% to 50% of QR code size
- **Drag & Drop**: Support for drag and drop file upload
- **Preview**: Real-time image preview before generation

## 🔧 Technical Implementation

### Core Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript**: No frameworks or dependencies
- **QR Code Styling Library**: External library for QR code generation

### Key JavaScript Features
- **Modular Architecture**: Organized into logical functions
- **Event Handling**: Comprehensive event listeners for user interactions
- **Form Validation**: Real-time validation with debounced input handling
- **Theme Management**: Local storage for theme preferences
- **File Handling**: Image upload with validation and preview
- **Download Functionality**: PNG and SVG export capabilities

### CSS Architecture
- **CSS Variables**: Theme-aware color system
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Complete dark theme implementation
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Focus states and keyboard navigation

## 🌐 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet

## 📱 Mobile Features

- **Touch Optimized**: Large touch targets and swipe gestures
- **Responsive Layout**: Adaptive design for all screen sizes
- **Mobile Navigation**: Collapsible navigation menu
- **Touch-friendly Forms**: Optimized input fields for mobile devices
- **Mobile-specific Styling**: Adjusted spacing and typography

## 🔒 Privacy & Security

- **Client-side Processing**: All QR code generation happens in the browser
- **No Data Collection**: No user data is sent to external servers
- **Local Storage**: Only theme preferences are stored locally
- **File Validation**: Image files are validated before processing
- **Secure Downloads**: Generated files are downloaded directly to user's device

## 🎯 Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations
- **Screen Reader Support**: Semantic HTML and descriptive text
- **Error Announcements**: Live regions for dynamic content updates

## 🚀 Performance Optimizations

- **Debounced Input**: Reduces unnecessary processing during typing
- **Lazy Loading**: Images and resources loaded on demand
- **Efficient DOM Updates**: Minimal DOM manipulation
- **Optimized Animations**: Hardware-accelerated CSS transitions
- **Memory Management**: Proper cleanup of event listeners and resources

## 🔧 Development

### Local Development
1. Clone the repository
2. Open `index.html` in a local server (recommended)
3. Use browser developer tools for debugging
4. Test across different browsers and devices

### Code Structure
- **HTML**: Semantic structure with accessibility features
- **CSS**: Modular styles with CSS variables for theming
- **JavaScript**: Organized into logical sections with clear comments

### Browser Compatibility
The application uses modern web standards but includes fallbacks for older browsers where possible.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

**Abubakkar Shahzad**
- Email: abubakkarshahzad947@gmail.com
- Phone: +92 314 2979757
- GitHub: [github.com/abubakkar052](https://github.com/abubakkar052)
- LinkedIn: [linkedin.com/in/abubakkar-shahzad](https://www.linkedin.com/in/abubakkar-shahzad/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📝 Changelog

### Version 1.0.0
- Initial release with core QR code generation features
- Support for multiple QR code types
- Customization options and export capabilities
- Responsive design and accessibility features
- Dark/light theme support

## 🐛 Known Issues

- Picture QR codes require high error correction for optimal readability
- Some older browsers may not support all features
- Large image files may cause performance issues on low-end devices

## 🔮 Future Enhancements

- QR code history and favorites
- Batch QR code generation
- Advanced styling options (gradients, patterns)
- QR code scanning functionality
- Social media sharing integration
- API for programmatic QR code generation

---

**Note**: This QR Code Generator was created as a learning exercise and demonstrates modern web development practices. While functional and feature-rich, it may contain imperfections typical of rapid prototyping.
<!--
Search Tags:
qr code, qr code generator, qr code generator javascript, qr code generator html css js, qr code with logo, qr code for wifi, qr code for contact, vCard qr code, qr code tool, free qr code generator, qr code app, qr code web app, customizable qr code, modern qr code generator, qr code export png svg, qr code maker, qr code generator open source
-->
