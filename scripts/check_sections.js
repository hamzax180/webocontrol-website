const fs = require('fs');
const glob = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));

for (const html of glob) {
  const content = fs.readFileSync('frontend/' + html, 'utf8');
  console.log('--- ' + html + ' ---');
  if(content.includes('class=\"hero\"') || content.includes('class=\"hero ')) console.log('  HERO');
  if(content.includes('services-grid')) console.log('  SERVICES');
  if(content.includes('showcase-grid')) console.log('  PORTFOLIO / SHOWCASE');
  if(content.includes('press-preview')) console.log('  PRESS');
  if(content.includes('projects-grid')) console.log('  GITHUB PROJECTS');
  if(content.includes('about-grid')) console.log('  ABOUT');
  if(content.includes('auth-page')) console.log('  AUTH');
  if(content.includes('dashboard')) console.log('  DASHBOARD');
  if(content.includes('testimonials')) console.log('  TESTIMONIALS');
  if(content.includes('tech-logos')) console.log('  TECH LOGOS');
  if(content.includes('customer-form')) console.log('  CUSTOMER FORM');
  if(content.includes('payment-card')) console.log('  PAYMENT');
  if(content.includes('section-title') && content.includes('Order')) console.log('  ORDER SECTION');
  if(content.includes('requirements-grid')) console.log('  REQUIREMENTS FORM');
}
