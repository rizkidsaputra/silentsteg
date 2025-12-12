<div align="center">

# 🔐 Steganography Web Application

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License" />

### *Hide secrets within images - Modern, Secure, Browser-Based*

[🚀 Live Demo](#) • [📖 Documentation](#-usage) • [🤝 Contributing](#-contributing)

<img src="https://img.shields.io/github/stars/rizkidsaputra/steganography-web?style=social" alt="Stars" />
<img src="https://img.shields.io/github/forks/rizkidsaputra/steganography-web?style=social" alt="Forks" />

---

</div>

## ✨ Features

<table>
<tr>
<td width="33%" align="center">

### 🎯 EXIF Metadata
Hide text within image EXIF fields
<br/>
<sub>UserComment • ImageDescription • Artist • Copyright</sub>

</td>
<td width="33%" align="center">

### 🔒 LSB Encryption
Embed files with pixel manipulation
<br/>
<sub>AES-CFB • Password Protected • Binary Support</sub>

</td>
<td width="33%" align="center">

### 📝 PNG Metadata
Store data in PNG tEXt chunks
<br/>
<sub>UTF-8 Support • Multiple Fields • Preserves Quality</sub>

</td>
</tr>
</table>

### 🛡️ Security & Privacy

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **AES-CFB Encryption** | Military-grade encryption for LSB method |
| 🔑 **SHA-256 Key Derivation** | Secure password-based key generation |
| 💻 **Client-Side Processing** | Zero server uploads - all processing in browser |
| 📦 **Binary File Support** | Hide any file type within images |
| 🎨 **Lossless Quality** | PNG conversion preserves visual quality |

</div>

---

## 🚀 Quick Start

### Prerequisites

\`\`\`bash
Node.js 18+ • npm/yarn/pnpm • Modern Browser
\`\`\`

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/rizkidsaputra/steganography-web.git
cd steganography-web

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
\`\`\`

---

## 📖 Usage

<details>
<summary><b>🔽 Embedding Data (Click to expand)</b></summary>

<br/>

1. **Navigate to Embed Page**
   - Choose from Dashboard or navigation menu

2. **Select Embedding Method**
   - EXIF Metadata (simple, text-only)
   - LSB (encrypted, supports files)
   - PNG Metadata (text chunks)

3. **Upload Cover Image**
   - Drag & drop or click to browse
   - Supports JPG, PNG, WebP

4. **Add Secret Content**
   - Enter text directly
   - Or toggle to upload file

5. **Configure Options**
   - For LSB: Add password for encryption
   - For EXIF: Choose metadata field
   - For PNG: Select chunk type

6. **Generate & Download**
   - Click "Embed & Download"
   - Receive steganographic image

</details>

<details>
<summary><b>🔼 Extracting Data (Click to expand)</b></summary>

<br/>

1. **Navigate to Extract Page**

2. **Select Extraction Method**
   - Must match the embedding method used

3. **Upload Steganographic Image**
   - The image containing hidden data

4. **Enter Password (if applicable)**
   - Required for encrypted LSB data

5. **Extract & View**
   - Click "Extract Data"
   - View or download extracted content

</details>

---

## 🛠️ Technical Stack

<div align="center">

\`\`\`mermaid
graph LR
    A[Next.js 16] --> B[React 19]
    A --> C[TypeScript]
    A --> D[Tailwind CSS v4]
    E[Steganography] --> F[piexifjs]
    E --> G[Web Crypto API]
    E --> H[Custom PNG Parser]
    I[UI] --> J[shadcn/ui]
    I --> K[Radix UI]
    I --> L[Lucide Icons]
\`\`\`

</div>

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 with App Router |
| **Language** | TypeScript, JavaScript |
| **Styling** | Tailwind CSS v4, Custom Design Tokens |
| **UI Components** | shadcn/ui, Radix UI Primitives |
| **Icons** | Lucide React |
| **Steganography** | piexifjs, Web Crypto API, Custom Implementations |

---

## 📁 Project Structure

\`\`\`
steganography-web/
│
├── 📂 app/                      # Next.js App Router
│   ├── 🏠 dashboard/           # Main dashboard page
│   ├── 📥 embed/               # Data embedding interface
│   ├── 📤 extract/             # Data extraction interface
│   ├── ℹ️ about/               # About & documentation
│   ├── layout.tsx              # Root layout (navbar + footer)
│   ├── page.tsx                # Home page redirect
│   └── globals.css             # Theme & global styles
│
├── 📂 components/               # Reusable UI components
│   ├── navbar.tsx              # Navigation bar
│   ├── footer.tsx              # Footer with links
│   ├── dashboard-card.tsx      # Dashboard feature cards
│   ├── method-selector.tsx     # Method selection UI
│   └── 📂 ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── ...
│
├── 📂 src/utils/                # Core steganography logic
│   ├── exifSteg.js             # EXIF metadata embedding/extraction
│   ├── lsbSteg.js              # LSB pixel manipulation + AES
│   └── pngMetaSteg.js          # PNG tEXt chunk manipulation
│
├── 📂 public/                   # Static assets
│
├── 📄 README.md                 # This file
├── 📄 LICENSE                   # MIT License
└── 📄 package.json              # Dependencies
\`\`\`

---

## 🔬 How It Works

<details>
<summary><b>📷 EXIF Method</b></summary>

<br/>

**Technique:** Embeds data into JPEG/PNG image EXIF metadata fields.

**Pros:**
- ✅ Simple implementation
- ✅ Preserves image quality
- ✅ Works with JPEG and PNG

**Cons:**
- ❌ Limited capacity (~2KB per field)
- ❌ Easily detectable with EXIF readers
- ❌ Text-only support

**Use Case:** Quick text notes, copyright info, simple messages

</details>

<details>
<summary><b>🎨 LSB (Least Significant Bit) Method</b></summary>

<br/>

**Technique:** Modifies the least significant bits of image pixel RGB values to store binary data.

**Features:**
- 🔐 AES-CFB encryption with password
- 📦 Supports text and binary files
- 🔄 Automatic JPG → PNG conversion
- 📊 Header-based format detection

**Capacity:** ~1/8 of image size (1 bit per color channel)

**Algorithm:**
1. Convert image to raw pixel data
2. Encrypt data with AES-CFB (optional)
3. Add 8-byte header (4B size + 4B type)
4. Embed bits into LSB of RGB channels
5. Output as PNG to preserve data

**Use Case:** Secure file hiding, encrypted communications

</details>

<details>
<summary><b>🖼️ PNG Metadata Method</b></summary>

<br/>

**Technique:** Stores data in PNG tEXt chunks within the file structure.

**Features:**
- 📝 Multiple metadata fields (Title, Author, Description, etc.)
- 🌍 UTF-8 encoding support
- 🔄 Preserves existing chunks
- ✅ Lossless and non-destructive

**Fields Available:**
- Title, Author, Description
- Copyright, Comment, Secret

**Use Case:** Document metadata, attribution, text-based secrets

</details>

---

## 🎨 Screenshots

<div align="center">

### Dashboard
*Modern dark theme with neon green accents*

### Embed Interface
*Intuitive method selection and file upload*

### Extract Interface
*Simple extraction with password support*

</div>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

<div align="center">

\`\`\`bash
# Fork the repository
# Create feature branch
git checkout -b feature/AmazingFeature

# Commit changes
git commit -m 'Add some AmazingFeature'

# Push to branch
git push origin feature/AmazingFeature

# Open Pull Request
\`\`\`

</div>

### Contribution Ideas
- 🐛 Bug fixes and improvements
- ✨ New embedding methods (DCT, DWT, etc.)
- 🎨 UI/UX enhancements
- 📖 Documentation improvements
- 🌍 Internationalization (i18n)
- 🧪 Test coverage

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

\`\`\`
Copyright (c) 2025 Rizki D. Saputra
\`\`\`

---

## 👥 Authors

<div align="center">

<table>
<tr>
<td align="center" width="50%">
<a href="https://github.com/rizkidsaputra">
<img src="https://github.com/rizkidsaputra.png" width="100px" alt="Rizki D. Saputra"/><br/>
<b>Rizki D. Saputra</b>
</a><br/>
<sub>Core Developer</sub>
</td>
<td align="center" width="50%">
<a href="https://github.com/JonatannaelPanjaitan">
<img src="https://github.com/JonatannaelPanjaitan.png" width="100px" alt="Jonatannael Panjaitan"/><br/>
<b>Jonatannael Panjaitan</b>
</a><br/>
<sub>Core Developer</sub>
</td>
</tr>
</table>

</div>

---

## 🙏 Acknowledgments

<div align="center">

Built with modern web technologies

[Next.js](https://nextjs.org/) • [shadcn/ui](https://ui.shadcn.com/) • [Tailwind CSS](https://tailwindcss.com/) • [Lucide Icons](https://lucide.dev/)

Inspired by steganography research and privacy tools

</div>

---

## ⚠️ Disclaimer

<div align="center">

**Educational Purpose Only**

This tool is designed for educational and research purposes. Users are responsible for ensuring their use complies with applicable laws and regulations. The authors assume no liability for misuse.

**Privacy Notice:** All processing occurs client-side in your browser. No data is transmitted to external servers.

</div>

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by [Rizki D. Saputra](https://github.com/rizkidsaputra) & [Jonatannael Panjaitan](https://github.com/JonatannaelPanjaitan)

</div>
\`\`\`

```text file="LICENSE"
MIT License

Copyright (c) 2025 Rizki D. Saputra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
