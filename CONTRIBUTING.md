# Contributing an Android App

Thank you for contributing to OpenApp Store.

## Required files

1. An Android APK file.
2. A square app icon, preferably PNG, WEBP, or SVG.
3. App name, developer name, version, category, description, and download URL.

## Recommended publication workflow

1. Upload the APK as an asset in a GitHub Release. Release assets are better than committing large APK files directly to the repository.
2. Put the app icon inside `assets/icons/`.
3. Add one object to `data/apps.json`.
4. Open a pull request, or create an App Submission issue for the repository owner.

## App record format

```json
{
  "id": "my-app",
  "name": "My App",
  "developer": "Developer Name",
  "version": "1.0.0",
  "updated": "2026-08-03",
  "size": "12.5 MB",
  "category": "Tools",
  "description": "A clear description of the app.",
  "icon": "assets/icons/my-app.png",
  "apkUrl": "https://github.com/USERNAME/REPOSITORY/releases/download/v1.0.0/my-app.apk",
  "sourceUrl": "https://github.com/USERNAME/APP-SOURCE",
  "rating": 0,
  "downloads": 0,
  "featured": false
}
```

## Safety requirements

- Do not submit malware, spyware, cracked applications, or unauthorized copyrighted content.
- The repository owner should scan APK files before approving them.
- Make the source code URL available whenever possible.
- State clearly when an app is experimental or requires special Android permissions.
