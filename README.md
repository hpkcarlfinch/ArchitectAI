# ArchitectAI

Production-ready MVP built with Vite + React + TypeScript + Firebase + OpenAI for AI-powered house blueprint generation and dual 2D/3D rendering.

## 1. Folder Structure

```text
ArchitectAI/
  functions/
    src/
      blueprintSchema.ts
      index.ts
      openaiService.ts
      types.ts
    .env.example
    .eslintrc.cjs
    package.json
    tsconfig.json
  src/
    components/
      EmptyState.tsx
      ErrorBanner.tsx
      LoadingSpinner.tsx
    features/
      auth/
        AuthControls.tsx
      blueprint/
        RenderPanel.tsx
      chat/
        ChatPanel.tsx
      projects/
        ProjectControls.tsx
      render2d/
        Blueprint2DView.tsx
      render3d/
        Blueprint3DView.tsx
        bitbybitAdapter.ts
    hooks/
      useAppContext.ts
    lib/
      AppContext.tsx
      projectFactory.ts
    pages/
      HomePage.tsx
    services/
      blueprint/
        defaults.ts
        geometry.ts
        schema.ts
        validate.ts
      firebase/
        authService.ts
        firebaseClient.ts
        projectService.ts
      openai/
        blueprintApi.ts
    types/
      blueprint.ts
      chat.ts
      project.ts
    utils/
      id.ts
    App.tsx
    index.css
    main.tsx
    vite-env.d.ts
  .env.example
  .firebaserc
  firebase.json
  firestore.indexes.json
  firestore.rules
  package.json
  vite.config.ts
```

## 2. Prerequisites

- Node.js 22+
- npm
- Firebase CLI (`npm i -g firebase-tools`) or use local dev dependency via `npx firebase`
- A Firebase project
- OpenAI API key

## 3. Install Dependencies

```bash
npm install
npm --prefix functions install
```

## 4. Environment Setup

### Frontend env

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION` (default `us-central1`)
- `VITE_DEMO_MODE` (`true` or `false`)

### Functions env

Create `functions/.env` from `functions/.env.example`:

```bash
cp functions/.env.example functions/.env
```

Required variables:

- `OPENAI_API_KEY_LOCAL` (for emulator/local only)
- `OPENAI_MODEL` (default example: `gpt-5-mini`)

For deployed Cloud Functions (recommended), set secrets/params:

```bash
npx firebase functions:secrets:set OPENAI_API_KEY
```

If you use only emulator locally, `functions/.env` is enough.
`OPENAI_MODEL` already has a default (`gpt-5-mini`) in code, so setting it is optional.
Do not put `OPENAI_API_KEY` in `functions/.env` when deploying with secrets.

## 5. Firebase Setup

1. Update `.firebaserc` with your Firebase project ID.
2. Enable **Authentication > Google** provider in Firebase Console.
3. Create Firestore in production or test mode, then apply `firestore.rules`.
4. Ensure billing is enabled for Cloud Functions if required by your plan.

Deploy rules/indexes only:

```bash
npx firebase deploy --only firestore
```

## 6. Local Development

### Terminal 1: Frontend

```bash
npm run dev
```

### Terminal 2: Functions emulator (recommended)

```bash
npm run functions:serve
```

If using emulator, connect frontend to emulator by extending `firebaseClient.ts` with `connectFunctionsEmulator` and `connectFirestoreEmulator` for local-only mode.

## 7. Build

```bash
npm run build
npm run functions:build
```

## 8. Deploy to Firebase Hosting + Functions

```bash
npm run deploy
```

Or:

```bash
npm run build
npm run functions:build
npx firebase deploy
```

## 9. Data Model

Firestore document path:

- `users/{userId}`
- `users/{userId}/projects/{projectId}`

Project document fields:

- `title`
- `description`
- `createdAt`
- `updatedAt`
- `chatHistory`
- `blueprintJson`
- `renderMode`
- `userId`

## 10. OpenAI Contract

Cloud Function: `generateBlueprint` (callable HTTPS)

Input:

```json
{
  "message": "Build me a 3-bedroom modern farmhouse with 2 bathrooms and open kitchen",
  "chatHistory": [
    { "role": "user", "content": "...", "createdAt": "2026-03-14T20:00:00.000Z" }
  ],
  "projectTitle": "Farmhouse Draft"
}
```

Output envelope:

```json
{
  "status": "blueprint_ready",
  "assistantMessage": "I generated a single-floor modern farmhouse plan.",
  "blueprint": {
    "metadata": {
      "title": "Modern Farmhouse",
      "description": "3-bedroom farmhouse with open kitchen and garage.",
      "units": "m"
    },
    "floors": [
      {
        "id": "floor_0",
        "level": 0,
        "name": "Ground Floor",
        "ceilingHeight": 2.8,
        "rooms": [
          {
            "id": "room_living",
            "name": "Living Room",
            "polygon": [
              { "x": 0, "y": 0 },
              { "x": 5, "y": 0 },
              { "x": 5, "y": 4 },
              { "x": 0, "y": 4 }
            ]
          }
        ],
        "walls": [
          {
            "id": "w1",
            "start": { "x": 0, "y": 0 },
            "end": { "x": 5, "y": 0 },
            "thickness": 0.2,
            "type": "exterior"
          }
        ],
        "doors": [],
        "windows": []
      }
    ]
  }
}
```

The system prompt in `functions/src/openaiService.ts` enforces JSON-only output and supports clarification mode via `status: "needs_clarification"`.

## 11. MVP Behavior Confirmed by Design

- Google sign-in via Firebase Auth
- Chat input for house description
- Secure OpenAI call through Firebase Functions (no client-side API key)
- Structured blueprint JSON validation via Zod
- Save/load/delete projects in Firestore per user
- 2D blueprint SVG rendering
- 3D model rendering with Three.js and bitbybit package presence (`@bitbybit-dev/threejs`) via adapter layer
- One-button 2D/3D toggle without resetting project state

## 12. Notes for Extension

- Add door/window void carving in 3D wall meshes
- Add multi-floor selector and floor stacking in renderer
- Add thumbnail preview generation and storage URL
- Add project sharing and role-based access

## 13. Troubleshooting Generation Errors

If you see `Generation failed...`:

1. Check the full error message in the UI banner. It now includes Firebase callable error code and details.
2. If error is `functions/not-found`, deploy functions or enable emulator mode:
  - Set `VITE_USE_FUNCTIONS_EMULATOR=true` in `.env`
  - Run `npm run functions:serve`
3. If error mentions `OPENAI_API_KEY is not configured`, set the secret and redeploy:
  - `npx firebase functions:secrets:set OPENAI_API_KEY`
  - `npx firebase deploy --only functions`
4. If error is `functions/internal`, inspect function logs:
  - `npx firebase functions:log --only generateBlueprint`
