# Aura Frontend

This is the Next.js frontend for the Aura AGI platform, providing a sophisticated interface to interact with Aura's advanced cognitive architecture.

## Key Features

- **Neural Network Visualization**: Interactive particle animation showing Aura's cognitive processes
- **Real-time Communication**: WebSocket integration for streaming responses
- **Responsive Design**: Fully mobile-responsive UI with glass morphism effects
- **Rich Content Rendering**: Markdown, code syntax highlighting, and math rendering
- **Emotional State Visualization**: Real-time display of Aura's emotional state
- **Interactive Debug Panels**: Development tools for exploring Aura's reasoning
- **Memory Explorer**: Visual interface to Aura's memory system

## Getting Started

First, make sure the backend is running (see main README at the repository root).

Then, set up the frontend:

```bash
# Navigate to the frontend directory
cd Aura-app/frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Create a `.env.local` file with the following configuration:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see Aura's interface.

## Component Structure

The frontend is organized into the following main sections:

```
src/
├── app/             # Next.js App Router 
├── components/      # React components
│   ├── chat/        # Chat interface components
│   ├── common/      # Shared UI components
│   ├── debug/       # Developer tools and panels
│   ├── emotionViz/  # Emotional state visualization
│   ├── layout/      # Layout components
│   ├── memoryExplorer/ # Memory visualization
│   ├── metacognition/ # Reflection visualization
│   └── settings/    # User settings components
├── services/        # API and WebSocket services
├── styles/          # Global styles
└── utils/           # Utility functions
```

## Neural Network Animation

The project includes a sophisticated neural network animation that uses HTML5 Canvas to visualize Aura's cognitive processes. This animation is implemented in the `ParticlesBackground` component in `home.tsx`.

### Animation Customization

You can customize the animation by adjusting the following parameters:

```typescript
// In ParticlesBackground component

// Particle density (smaller divisor = more particles)
const particleCount = Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 12000));

// Connection distance in pixels
const connectionDistance = 150;

// Particle velocity (higher = faster movement)
const velocity = (Math.random() - 0.5) * 0.25;

// Particle size range
const size = Math.random() * 2 + 0.5;

// Particle opacity range
const opacity = Math.random() * 0.3 + 0.2;
```

### Performance Optimization

For optimal performance on various devices:

1. **Particle Count Scaling**: The animation automatically adjusts particle count based on screen size.

2. **Device-based Optimization**: You can add device detection:
   ```typescript
   // Add this to ParticlesBackground
   const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
   const particleCount = isMobile 
     ? Math.min(40, Math.floor(window.innerWidth * window.innerHeight / 20000))
     : Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 12000));
   ```

3. **GPU Acceleration**: The canvas is hardware-accelerated by default, but you can optimize further:
   ```typescript
   // In the canvas element
   <canvas 
     ref={canvasRef} 
     className="absolute top-0 left-0 w-full h-full z-0 opacity-30"
     style={{ 
       pointerEvents: 'none',
       transform: 'translateZ(0)', // Force GPU acceleration
     }}
   />
   ```

4. **Reduced Animation on Scroll**: You can pause or reduce animation during scrolling for better performance.

## API Communication

The frontend communicates with the Aura backend through two main channels:

1. **REST API** - For conversation management and system settings
2. **WebSockets** - For real-time streaming responses

### API Services

All API communication is handled through the services in `src/services/`:

- `apiService.ts` - REST API client
- `socketService.ts` - WebSocket client

Example usage in components:

```typescript
import apiService from '../services/apiService';
import socketService from '../services/socketService';

// REST API
const conversations = await apiService.getConversations();

// WebSockets
socketService.subscribeToMessages((message) => {
  // Handle incoming message
});
```

## Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

Then, start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

## Deployment

This Next.js app can be deployed to various platforms:

1. **Vercel** (recommended): 
   ```bash
   vercel
   ```

2. **Docker**: Use the included Dockerfile
   ```bash
   docker build -t Aura-frontend .
   docker run -p 3000:3000 Aura-frontend
   ```

3. **Static Export** (for simple hosting):
   ```bash
   npm run build
   npm run export # Creates an out/ directory with static files
   ```

## Browser Support

Aura's frontend is optimized for:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

The neural network animation requires a browser that supports HTML5 Canvas.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
