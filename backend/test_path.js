const path = require('path');
const fs = require('fs');

const __dirname_mock = 'c:\\Lms\\techwell-lms\\backend\\src\\services';
const relativeUrl = '/uploads/file.pdf';

const absolutePath = path.join(__dirname_mock, '../../', relativeUrl);
console.log('Absolute Path:', absolutePath);

// Also test without leading slash
const relativeUrlNoSlash = 'uploads/file.pdf';
const absolutePathNoSlash = path.join(__dirname_mock, '../../', relativeUrlNoSlash);
console.log('Absolute Path (no slash):', absolutePathNoSlash);
