# 🎮 Flappy Bird Game - Clean Architecture

A browser-based recreation of the classic Flappy Bird game built with **Next.js 14**, **TypeScript**, and **Clean Architecture** principles.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tests](https://img.shields.io/badge/Tests-179%20passing-success?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-success?style=flat-square)

## ✨ Features

- 🐦 **Physics-based bird movement** with gravity and flap mechanics
- 🚧 **Procedurally generated obstacles** with randomized gap heights
- 💥 **Precise collision detection** (bird vs pipes, bird vs boundaries)
- 🎮 **Cross-platform controls** (mouse, touch, keyboard)
- 🏆 **Score tracking** with high score persistence
- 📱 **Responsive design** for desktop and mobile
- ⚡ **60 FPS gameplay** with smooth animations
- 🎨 **Visual effects** and animations

## 🏗️ Clean Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router (Framework)
├── core/                   # Business Logic (Domain)
│   └── entities/          # Pure business objects
├── infrastructure/         # Implementation Details
│   ├── engine/            # Game engine, physics, collision
│   └── managers/          # Service managers
├── presentation/           # UI Layer
│   └── components/        # React components
├── shared/                 # Shared Utilities
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── constants/        # Configuration
└── __tests__/             # Tests organized by layer
```

### Architecture Layers

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| **Core** | Business logic & domain entities | None (pure TypeScript) |
| **Infrastructure** | Technical implementation | Core |
| **Presentation** | UI components & user interaction | Core + Infrastructure |
| **Shared** | Common utilities & types | None |

### Dependency Rule

```
Presentation → Infrastructure → Core
(Dependencies point inward)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd flappy-bird-game

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🎯 How to Play

1. **Start**: Click, tap, or press **Space** to start the game
2. **Control**: Click/tap/Space to make the bird flap and fly upward
3. **Objective**: Navigate through pipes without hitting them
4. **Score**: Earn points by passing through pipe gaps
5. **Restart**: When game over, click/tap/Space to restart

## 📁 Project Structure

### Core Layer (Domain)
```
src/core/entities/
├── Bird.ts              # Bird entity with movement logic
└── Obstacle.ts          # Obstacle entity with pipe logic
```

**Principles:**
- ✅ Pure business logic
- ✅ No framework dependencies
- ✅ Highly testable

### Infrastructure Layer
```
src/infrastructure/
├── engine/
│   ├── GameEngine.ts        # Game orchestrator
│   ├── PhysicsSystem.ts     # Physics calculations
│   ├── CollisionDetector.ts # Collision detection
│   └── InputHandler.ts      # Input management
└── managers/
    ├── ObstacleManager.ts   # Obstacle lifecycle
    └── ScoreManager.ts      # Score tracking
```

**Principles:**
- ✅ Implements technical details
- ✅ Depends on Core layer
- ✅ Framework-specific code allowed

### Presentation Layer
```
src/presentation/components/game/
└── GameCanvas.tsx           # Canvas rendering component
```

**Principles:**
- ✅ React components only
- ✅ Handles UI and user events
- ✅ Uses hooks for state

### Shared Layer
```
src/shared/
├── types/
│   └── game.types.ts        # Type definitions
├── utils/
│   └── canvas.utils.ts      # Canvas utilities
└── constants/
    └── game.constants.ts    # Game configuration
```

**Principles:**
- ✅ Reusable across all layers
- ✅ No business logic
- ✅ Pure utility functions

## 🧪 Testing

Tests are organized by architectural layer:

```
src/__tests__/
├── core/                    # Domain tests (2 suites)
├── infrastructure/          # Engine tests (6 suites)
└── presentation/            # UI tests (future)
```

**Test Results:**
- ✅ **179 tests** passing
- ✅ **8 test suites**
- ✅ **100% pass rate**

### Test Coverage

| Layer | Files | Tests | Status |
|-------|-------|-------|--------|
| Core | 2 | 62 | ✅ Passing |
| Infrastructure | 6 | 117 | ✅ Passing |
| Total | 8 | 179 | ✅ Passing |

## 📦 Path Aliases

Clean imports using TypeScript path aliases:

```typescript
// Instead of: import { Bird } from '../../../core/entities/Bird'
import { Bird } from '@/core/entities/Bird';

// Available aliases:
@/core/*           // Core domain layer
@/infrastructure/* // Infrastructure layer
@/presentation/*   // Presentation layer
@/shared/*         // Shared utilities
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0
- **UI Library**: React 18
- **Rendering**: HTML5 Canvas API
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **Architecture**: Clean Architecture

## 📊 Performance

- ⚡ **60 FPS** game loop with fixed timestep
- 🎯 **<50ms** touch response time
- 🚀 **~1.8s** dev server start time
- ✅ **~4.5s** test execution time
- 📦 **~91.7 kB** first load JS

## 🎨 Clean Code Principles

### 1. Separation of Concerns
Each layer has a single, well-defined responsibility.

### 2. Dependency Inversion
High-level modules don't depend on low-level modules. Both depend on abstractions.

### 3. Single Responsibility
Each class/module has one reason to change.

### 4. Open/Closed Principle
Open for extension, closed for modification.

### 5. Testability
Pure functions and clear interfaces make testing easy.

## 📈 Benefits of This Architecture

| Benefit | Description |
|---------|-------------|
| **Maintainability** | Clear structure makes code easy to understand and modify |
| **Testability** | Pure business logic separated from framework code |
| **Scalability** | Easy to add new features without affecting existing code |
| **Team Collaboration** | Clear boundaries help multiple developers work together |
| **Framework Independence** | Core logic doesn't depend on Next.js or React |

## 🔄 Refactoring Summary

### Before (Flat Structure)
```
❌ No clear separation between layers
❌ Long imports: '../../../entities/Bird'
❌ Hard to test and maintain
❌ Not following Clean Architecture
```

### After (Clean Architecture)
```
✅ Clear separation: Core, Infrastructure, Presentation
✅ Clean imports: '@/core/entities/Bird'
✅ Easy to test: 179 tests organized by layer
✅ Following Clean Architecture principles
✅ Scalable and maintainable
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Refactoring process summary
- **[CLEAN_ARCHITECTURE_CHECKLIST.md](./CLEAN_ARCHITECTURE_CHECKLIST.md)** - Implementation checklist

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the Clean Architecture structure
2. Write tests for new features
3. Maintain code quality (ESLint + Prettier)
4. Update documentation as needed

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎓 Learning Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

## 🙏 Acknowledgments

- Inspired by the original Flappy Bird game
- Built with modern web technologies
- Following industry best practices

---

**Made with ❤️ using Clean Architecture principles**

**Status**: ✅ Production Ready | 🧪 179 Tests Passing | 🚀 Optimized Build
