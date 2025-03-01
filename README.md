# Sudolphin 🐬
Level up your learning 🧠

This is our project for CS3300 at Georgia Tech.

## Features

- Course Dashboard:
  - Add classes to the dashboard to manage your courseload
  - Drag-and-drop course materials (PDF, DOCX, PPTX, TXT) to manage resources
- AI-Generated Study Resources:
  - Flashcard Generation
  - Practice Tests
  - Crib Sheets

## Installation Guide

### Pre-Requesties/Dependenices:

Operating System: Windows, macOS, or Linux

To run the project locally install:

- [Node.JS and npm](https://nodejs.org/en/download/package-manager)

The project requires the following npm packages:

- Typescript
- Supabase Auth
- TailwindCSS
- Jest
- Playwright

These will be installed automatically.

A modern web browser (e.g., Google Chrome, Mozilla Firefox) required to run local host.

### Setup Steps

```bash
# Clone repository
git clone https://github.com/ovadiagal/sudolphin.git

cd sudolphin

npm ci
```

The environment variables for the OpenAI and Supabase secrets also need to be setup.

Modify or create `.env` to with this template:

```
NEXT_PUBLIC_SUPABASE_URL={YOUR_SUPABASE_DB_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY={YOUR_SUPABASE_KEY}
OPENAI_API_KEY={YOUR_OPENAI_KEY}
```

### Running

With the dependencies and libraries installed, run:

`npm run dev`

to start the Node server locally at `localhost:3000`.

To run white-box end-to-end tests run the npm script:

`npm run test:e2e`

or

`npm run test:e2e:ui` for a gui.

To run black-box unit tests run the npm script:

`npm run test`

or

`npm run test:coverage` to generate a coverage report.

## Troubleshoot

- **Error:** Supabase authentication failed.

  - **Solution:** Verify that the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values in `.env` are correct.

- **Error:** OPENAI_API_KEY is missing.

  - **Solution:** Ensure your OpenAI API Key is correctly set in the `.env` file.

- **Error:** Cannot connect to localhost:3000.

  - **Solution:** Confirm Node.js is installed and that the development server is running.

- **Error:** Tests fail unexpectedly.
  - **Solution:** Ensure all dependencies are installed by running `npm ci` again.

### Release Notes

#### v0.1.0

Software features in this release:

- Course Dashboard:
  - Add classes to the dashboard to manage your courseload
  - Drag-and-drop course materials (PDF, DOCX, PPTX, TXT) to manage resources
- AI-Generated Study Resources:
  - Flashcard Generation
  - Practice Tests
  - Crib Sheets
- Progress Tracking:
  - Track number of flashcards reviewed
  - Track number of correct practice test questions answered

Bug fixes in this release:

- Fixed issue with flashcard rendering
- Fixed issue with dark mode styling being unreadable
- Fixed issue with not storing generated study resources

Known bugs in this release:

- Forgot password redirects to wrong page

Work Done By: Gal Ovadia, Rana Myneni, Matthew Perry, Cas Copeland, Jacob Kotzian, Maeci Frank
