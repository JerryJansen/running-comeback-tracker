// Simple script to generate SVG-based icons for the PWA
const fs = require('fs');

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0f172a"/>
  <circle cx="${size * 0.5}" cy="${size * 0.38}" r="${size * 0.22}" fill="none" stroke="#22d3ee" stroke-width="${size * 0.04}"/>
  <path d="M${size * 0.35} ${size * 0.62} L${size * 0.42} ${size * 0.52} L${size * 0.5} ${size * 0.58} L${size * 0.62} ${size * 0.42} L${size * 0.7} ${size * 0.62}" fill="none" stroke="#10b981" stroke-width="${size * 0.035}" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${size * 0.5}" y="${size * 0.85}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="${size * 0.12}" fill="#f8fafc">COMEBACK</text>
</svg>`;

// Write SVGs that we'll reference - for a real deploy you'd convert to PNG
// For now we create simple SVG files and reference them
fs.writeFileSync('public/icon-192.svg', svg(192));
fs.writeFileSync('public/icon-512.svg', svg(512));

console.log('Icons generated (SVG). For production, convert to PNG.');
