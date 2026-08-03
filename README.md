# OpenApp Store for GitHub Pages

A responsive, Play Store-inspired Android app catalog that can be deployed as a static GitHub Pages website.

## Included features

- Responsive desktop, tablet, and mobile layout
- Search by app name, developer, category, or description
- Category filters and sorting
- Featured app section
- App details modal with APK and source-code links
- Contributor form with icon/APK local preview
- JSON metadata generator
- Prefilled GitHub issue submission
- GitHub Issue Form template
- No database and no server-side code required

## Important GitHub Pages limitation

GitHub Pages only serves static files. A public visitor cannot directly upload an APK into your repository from this website without a separate authenticated backend or GitHub OAuth application.

This template uses a safe static contribution workflow:

1. The contributor fills in `submit.html`.
2. The page generates the app JSON and a prefilled GitHub issue.
3. The contributor uploads the APK to GitHub Releases or sends it to the repository maintainer.
4. The maintainer reviews the APK and adds the metadata to `data/apps.json`.

## Setup

1. Create a new GitHub repository.
2. Upload every file and folder in this project.
3. Open `js/submit.js` and change:

```js
const STORE_REPOSITORY = {
  owner: 'YOUR_USERNAME',
  name: 'YOUR_REPOSITORY'
};
```

4. Replace the sample app records in `data/apps.json`.
5. Replace every placeholder APK URL with a valid GitHub Release asset URL.
6. In GitHub, open **Settings → Pages**.
7. Under **Build and deployment**, select **Deploy from a branch**.
8. Select the `main` branch and the `/ (root)` folder, then save.

Your website will normally be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

## Adding an app manually

Add an app object to `data/apps.json`, upload its icon into `assets/icons/`, and use a GitHub Release URL for `apkUrl`.

## Local testing

Do not open `index.html` only by double-clicking it, because some browsers block local JSON requests. Run a small local web server instead:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Security recommendation

Review and scan every APK before publishing it. Avoid automatically publishing unreviewed user uploads.
