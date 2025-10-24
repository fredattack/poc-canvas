# Chat Canvas App

A modern React application featuring a dual-panel interface with Chat and Canvas functionality, built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Authentication System**: Email/password login with JWT token management
- **Chat Interface**: Real-time chat with LLM assistant
- **Canvas Editor**: Editable content area with markdown preview
- **Auto-Save**: Canvas content persists to localStorage
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Mock API**: Built-in mock adapter for development without backend

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Context API** - State management

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy `.env.example` to `.env` and adjust if needed:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_USE_MOCKS=true
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API layer
│   ├── axios.ts      # Axios instance with interceptors
│   ├── auth.ts       # Authentication API
│   └── chat.ts       # Chat API
├── components/       # React components
│   ├── Header.tsx
│   ├── Chat/
│   │   ├── ChatPanel.tsx
│   │   └── MessageBubble.tsx
│   ├── Canvas/
│   │   └── CanvasPanel.tsx
│   └── UI/
│       ├── Button.tsx
│       └── Input.tsx
├── context/          # React contexts
│   ├── AuthContext.tsx
│   ├── ChatContext.tsx
│   └── CanvasContext.tsx
├── hooks/            # Custom hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useCanvas.ts
├── types.ts          # TypeScript type definitions
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## API Endpoints

### POST /login

Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "token": "JWT_OR_OPAQUE_TOKEN",
  "user": {
    "id": "u_123",
    "email": "user@example.com"
  }
}
```

### POST /chat

Send a message to the assistant.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "message": "User question text",
  "conversationId": "c_001"
}
```

**Response:**
```json
{
  "assistant": "LLM full answer text",
  "conversationId": "c_001",
  "canvasContent": "Optional content to display in canvas"
}
```

## Mock API

The application includes a built-in mock API adapter for development. When `VITE_USE_MOCKS=true`, the following mock credentials work:

- **Email:** `user@example.com`
- **Password:** `secret123`

## Features in Detail

### Authentication

- Login/logout functionality in the header
- Token stored in localStorage and memory
- Automatic token injection in API requests
- Protected chat interface (requires authentication)

### Chat

- User and assistant message bubbles
- Optimistic UI updates
- Auto-scroll to latest message
- Typing indicator while waiting for response
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Error handling with dismissible alerts

### Canvas

- Edit and preview modes
- Auto-save to localStorage
- Character count display
- Apply content from assistant responses
- Simple markdown rendering in preview mode
- Clear content functionality

### Responsive Design

- Desktop: Side-by-side chat and canvas panels
- Mobile: Stacked layout (chat first, then canvas)
- Optimized for various screen sizes

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
