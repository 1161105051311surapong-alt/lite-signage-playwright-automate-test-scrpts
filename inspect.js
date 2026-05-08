const fs = require('fs');

function inspectFile(filename) {
  console.log(`\n--- Inspecting ${filename} ---`);
  const html = fs.readFileSync(filename, 'utf8');
  
  // Find standard UI elements
  const regex = /<(button|a|span|div)[^>]*class="([^"]*)"[^>]*>([^<]+)<\/\1>/gi;
  let match;
  const elements = new Set();
  
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].trim();
    if (text && text.length > 2 && text.length < 50) {
      elements.add(`Tag: ${match[1]}, Class: ${match[2]}, Text: ${text}`);
    }
  }
  
  Array.from(elements).slice(0, 30).forEach(e => console.log(e));
}

['login_page.html', 'overview_page.html', 'library_page.html', 'playlist_page.html', 'screen_page.html'].forEach(inspectFile);
