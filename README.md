# valorworks.dev

Professional portfolio site for Dillan Valor - IT Engineer & Cybersecurity Specialist

## 🚀 Site Structure
```
repo/
├── index.html              # Homepage with hero and contact
├── projects.html           # Detailed project case studies
├── experience.html         # Work history and credentials
├── blog/
│   └── index.html         # Blog listing page
└── assets/
    └── styles.css         # Shared stylesheet
```

## 📁 File Descriptions

- **index.html** - Homepage with hero section, key highlights, and contact cards
- **projects.html** - All detailed project writeups with technical details
- **experience.html** - Professional timeline, education, and certifications
- **blog/index.html** - Blog listing (placeholder for future posts)
- **assets/styles.css** - All styles used across the site

## 🎨 Design Features

- **Black & Gold Theme** - Professional, modern color scheme
- **Fully Responsive** - Mobile-first design
- **Zero Dependencies** - No frameworks, libraries, or CDNs
- **Fast Loading** - Minimal assets, optimized performance
- **Accessible** - ARIA labels, semantic HTML, keyboard navigation

## 🔒 Security Features

- ✅ No external dependencies (no supply chain attacks)
- ✅ No user input or forms (no XSS vulnerabilities)
- ✅ No browser storage (no data leakage)
- ✅ `rel="noopener noreferrer"` on all external links
- ✅ Minimal JavaScript (only date display)
- ✅ HTTPS enforced via GitHub Pages + Cloudflare

## 📝 Adding Blog Posts

### 1. Create a new blog post file

Create `blog/your-post-slug.html` based on this template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Post Title — Dillan Valor</title>
  <meta name="description" content="Brief description of your post.">
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
  <header>
    <div class="container">
      <a href="../index.html" class="logo">DILLAN <span>VALOR</span></a>
      <nav>
        <a href="../index.html">Home</a>
        <a href="../projects.html">Projects</a>
        <a href="../experience.html">Experience</a>
        <a href="index.html" class="active">Blog</a>
        <a href="../index.html#contact">Contact</a>
      </nav>
    </div>
  </header>

  <main>
    <section>
      <div class="container">
        <div class="blog-date">Month Day, Year</div>
        <h1>Your Post Title</h1>
        
        <!-- Your content here -->
        <p>Your blog post content...</p>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div>
        <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Dillan Valor</div>
        <div>© <span id="year"></span> valorworks.dev · All rights reserved</div>
      </div>
    </div>
  </footer>

  <script>
    document.getElementById('year').textContent = new Date().getFullYear();
  </script>
</body>
</html>
```

### 2. Add post preview to blog/index.html

Uncomment the example blog posts section and add:
```html
<a href="your-post-slug.html" class="blog-preview">
  <div class="blog-date">Month Day, Year</div>
  <h3>Your Post Title</h3>
  <p>Brief excerpt or description of the post.</p>
  <div class="tags">
    <span class="tag">Tag1</span>
    <span class="tag">Tag2</span>
  </div>
</a>
```

## 🛠️ Maintenance

### Updating Projects

Edit `projects.html` - each project is a `<article class="card">` block.

### Updating Experience

Edit `experience.html` - each role is a `<article class="timeline-item">` block.

### Changing Colors

Edit `assets/styles.css` at the top in the `:root` section:
```css
:root {
  --gold: #d4af37;        /* Change to your preferred accent color */
  --bg-primary: #000000;  /* Change background colors */
  /* ... */
}
```

## 🚢 Deployment

1. Push changes to your GitHub repository
2. GitHub Pages automatically rebuilds (takes 1-2 minutes)
3. Visit `https://valorworks.dev` to see changes

## 📞 Contact

- Email: dillan@valorworks.dev
- LinkedIn: [linkedin.com/in/dillan-valor](https://linkedin.com/in/dillan-valor)
- GitHub: [github.com/DillanValor](https://github.com/DillanValor)

---

Built with pure HTML/CSS - no frameworks, no build tools, no complexity.
