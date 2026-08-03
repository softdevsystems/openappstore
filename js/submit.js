'use strict';

// Change these two values after creating your GitHub repository.
const STORE_REPOSITORY = {
  owner: 'YOUR_USERNAME',
  name: 'YOUR_REPOSITORY'
};

const form = document.querySelector('#submissionForm');
const result = document.querySelector('#submissionResult');
const jsonPreview = document.querySelector('#jsonPreview');
const downloadJsonButton = document.querySelector('#downloadJson');
const copyJsonButton = document.querySelector('#copyJson');
const openGithubLink = document.querySelector('#openGithub');
let generatedApp = null;

const fields = {
  appName: document.querySelector('#appName'),
  developer: document.querySelector('#developer'),
  version: document.querySelector('#version'),
  category: document.querySelector('#category'),
  packageName: document.querySelector('#packageName'),
  description: document.querySelector('#description'),
  iconUrl: document.querySelector('#iconUrl'),
  apkUrl: document.querySelector('#apkUrl'),
  sourceUrl: document.querySelector('#sourceUrl'),
  iconFile: document.querySelector('#iconFile'),
  apkFile: document.querySelector('#apkFile')
};

const preview = {
  name: document.querySelector('#previewName'),
  developer: document.querySelector('#previewDeveloper'),
  version: document.querySelector('#previewVersion'),
  category: document.querySelector('#previewCategory'),
  description: document.querySelector('#previewDescription'),
  icon: document.querySelector('#previewIcon'),
  size: document.querySelector('#previewSize')
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'new-app';
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function updatePreview() {
  preview.name.textContent = fields.appName.value.trim() || 'Your app name';
  preview.developer.textContent = fields.developer.value.trim() || 'Developer name';
  preview.version.textContent = fields.version.value.trim() || '1.0.0';
  preview.category.textContent = fields.category.value || 'Category';
  preview.description.textContent = fields.description.value.trim() || 'Your app description will appear here.';
  document.querySelector('#descriptionCount').textContent = fields.description.value.length;
}

function handleIconFile() {
  const file = fields.iconFile.files[0];
  document.querySelector('#iconFileName').textContent = file ? file.name : 'No file selected';
  if (!file) {
    preview.icon.src = fields.iconUrl.value.trim() || 'assets/icons/default-app.svg';
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file for the app icon.');
    fields.iconFile.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    preview.icon.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function handleApkFile() {
  const file = fields.apkFile.files[0];
  const fileName = document.querySelector('#apkFileName');
  fileName.textContent = file ? `${file.name} · ${formatFileSize(file.size)}` : 'No file selected';
  preview.size.textContent = file ? formatFileSize(file.size) : '—';

  if (file && !file.name.toLowerCase().endsWith('.apk')) {
    alert('The selected application file must use the .apk extension.');
    fields.apkFile.value = '';
    fileName.textContent = 'No file selected';
    preview.size.textContent = '—';
  }
}

function createMetadata() {
  const apkFile = fields.apkFile.files[0];
  const appName = fields.appName.value.trim();

  return {
    id: slugify(appName),
    name: appName,
    developer: fields.developer.value.trim(),
    version: fields.version.value.trim(),
    updated: new Date().toISOString().slice(0, 10),
    size: apkFile ? formatFileSize(apkFile.size) : 'Update size',
    category: fields.category.value,
    packageName: fields.packageName.value.trim(),
    description: fields.description.value.trim(),
    icon: fields.iconUrl.value.trim(),
    apkUrl: fields.apkUrl.value.trim(),
    sourceUrl: fields.sourceUrl.value.trim(),
    rating: 0,
    downloads: 0,
    featured: false
  };
}

function buildIssueUrl(app) {
  const base = `https://github.com/${STORE_REPOSITORY.owner}/${STORE_REPOSITORY.name}/issues/new`;
  const body = [
    '## App submission',
    '',
    `**App name:** ${app.name}`,
    `**Developer:** ${app.developer}`,
    `**Version:** ${app.version}`,
    `**Category:** ${app.category}`,
    `**Package name:** ${app.packageName || 'Not provided'}`,
    `**APK URL:** ${app.apkUrl}`,
    `**Icon path/URL:** ${app.icon}`,
    `**Source URL:** ${app.sourceUrl || 'Not provided'}`,
    '',
    '### Description',
    app.description,
    '',
    '### Metadata JSON',
    '```json',
    JSON.stringify(app, null, 2),
    '```'
  ].join('\n');

  const params = new URLSearchParams({
    title: `[App Submission] ${app.name} v${app.version}`,
    body,
    labels: 'app-submission'
  });
  return `${base}?${params.toString()}`;
}

function downloadJson() {
  if (!generatedApp) return;
  const blob = new Blob([`${JSON.stringify(generatedApp, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${generatedApp.id}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyJson() {
  if (!generatedApp) return;
  const text = JSON.stringify(generatedApp, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    copyJsonButton.textContent = 'Copied';
    setTimeout(() => { copyJsonButton.textContent = 'Copy JSON'; }, 1600);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

form.addEventListener('input', updatePreview);

fields.iconUrl.addEventListener('input', () => {
  if (!fields.iconFile.files.length) {
    preview.icon.src = fields.iconUrl.value.trim() || 'assets/icons/default-app.svg';
  }
});

fields.iconFile.addEventListener('change', handleIconFile);
fields.apkFile.addEventListener('change', handleApkFile);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  generatedApp = createMetadata();
  jsonPreview.textContent = JSON.stringify(generatedApp, null, 2);
  openGithubLink.href = buildIssueUrl(generatedApp);
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    generatedApp = null;
    result.hidden = true;
    preview.icon.src = 'assets/icons/default-app.svg';
    preview.size.textContent = '—';
    document.querySelector('#iconFileName').textContent = 'No file selected';
    document.querySelector('#apkFileName').textContent = 'No file selected';
    updatePreview();
  }, 0);
});

downloadJsonButton.addEventListener('click', downloadJson);
copyJsonButton.addEventListener('click', copyJson);

['iconDropzone', 'apkDropzone'].forEach((id) => {
  const dropzone = document.querySelector(`#${id}`);
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'));
  });
});

updatePreview();
