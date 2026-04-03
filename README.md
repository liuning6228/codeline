# CodeLine AI Coding Assistant

<p align="center">
  <strong>VS Code Extension that combines Cline's autonomous capabilities with Qoder's prompt engineering</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a>
</p>

## 🚀 Features

### Core AI Capabilities
- **Autonomous Task Execution**: Execute complex coding tasks with minimal guidance
- **Qoder-style Prompt Engineering**: Intelligent context-aware prompts optimized for different project types
- **Multi-Model Support**: DeepSeek, Claude, GPT-4, Qwen, and more via unified adapter
- **Project Context Analysis**: Automatic detection of project structure, dependencies, and code style
- **Smart Task Decomposition**: Breaks down complex requests into manageable subtasks

### Advanced Functionality
- **Plugin System**: Extensible architecture with MCP (Model Context Protocol) integration
- **Enhanced Task Engine**: Real-time event streaming with async generator API
- **Browser Automation**: Automated web interaction for data collection and testing
- **Terminal Integration**: Direct command execution with approval workflow
- **Sidebar UI**: Modern React-based interface for task management

### Quality & Reliability
- **Comprehensive Test Suite**: 82+ tests covering unit, integration, and E2E scenarios
- **CI/CD Pipeline**: GitHub Actions with multi-Node.js version support
- **Code Coverage**: Istanbul/nyc integration with baseline tracking
- **Pre-commit Hooks**: Automated testing on every commit
- **VS Code Extension Testing**: Real VS Code environment validation

## 📦 Installation

### From VSIX (Development Build)
```bash
# Clone the repository
git clone https://github.com/yourusername/codeline.git
cd codeline

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension (generates codeline-*.vsix)
npm run package

# In VS Code: Extensions → ... → Install from VSIX → select the generated file
```

### From Marketplace (Planned)
Search for "CodeLine" in the VS Code Extensions Marketplace (coming soon).

## ⚙️ Configuration

### API Keys Setup
1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "CodeLine"
3. Set your API key for preferred AI service
4. Choose default model and configure advanced options

### Supported AI Providers
- **DeepSeek**: Set `codeline.apiKey` to your DeepSeek API key
- **Claude (Anthropic)**: Set `codeline.apiKey` to your Anthropic API key  
- **OpenAI GPT**: Set `codeline.apiKey` to your OpenAI API key
- **Qwen**: Set `codeline.apiKey` to your Alibaba Cloud API key
- **Custom Providers**: Extensible provider architecture for additional models

## 🎮 Usage

### Quick Start
1. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. **Start Chat**: Search for "CodeLine: Start Chat" for interactive assistance
3. **Execute Task**: Search for "CodeLine: Execute Task" for direct task execution
4. **Analyze Project**: Search for "CodeLine: Analyze Project Context" for project insights

### Example Workflows

#### Creating a REST API Endpoint
```
Task: "Create a user registration endpoint for a Spring Boot application"
```

**CodeLine will**:
1. Analyze Spring Boot project structure
2. Generate Qoder-Java optimized prompts
3. Create UserController, UserService, UserRepository
4. Add validation, error handling, and OpenAPI documentation

#### Implementing Authentication
```
Task: "Add JWT authentication to existing Express.js API"
```

**CodeLine will**:
1. Detect Express.js project structure
2. Create authentication middleware
3. Add login/register endpoints
4. Configure JWT token handling and security best practices

#### Web Scraping & Automation
```
Task: "Scrape product data from example.com and save to CSV"
```

**CodeLine will**:
1. Analyze target website structure
2. Create browser automation script
3. Extract and transform data
4. Generate formatted CSV output

## 🏗️ Architecture

### Core Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Extension Core** | Main entry point & lifecycle | Singleton pattern, dependency injection |
| **Project Analyzer** | Context detection | Tech stack analysis, dependency mapping |
| **Prompt Engine** | AI prompt generation | Qoder-style templates, context optimization |
| **Model Adapter** | Multi-model abstraction | Unified API, provider management |
| **Task Engine** | Task execution orchestration | Step decomposition, progress tracking |
| **Enhanced Task Engine** | Advanced task handling | Async generators, real-time events |
| **Plugin System** | Extensibility framework | MCP integration, tool registration |
| **Sidebar Provider** | React-based UI | Task management, chat interface |

### Plugin System Architecture

```
CodeLine Core
├── Plugin Manager
│   ├── Plugin Loader (TypeScript/JavaScript)
│   ├── Dependency Resolver
│   └── Lifecycle Controller
├── Tool Registry
│   ├── Plugin Tool Registration
│   ├── Tool Discovery & Validation
│   └── Execution Context Management
└── MCP Handler
    ├── Server Initialization
    ├── Protocol Adapter
    └── Resource Management
```

### Data Flow
```
User Request → Task Engine → Project Analysis → Prompt Generation → AI Model
      ↓              ↓              ↓                ↓               ↓
   UI Update ← Status Events ← Step Execution ← Response Parsing ← AI Response
```

## 🧪 Development

### Prerequisites
- **Node.js**: 18.x, 20.x, or 22.x (LTS versions)
- **VS Code**: 1.84+ with Extension Development Host
- **TypeScript**: 5.1+ for compilation
- **Git**: For version control and pre-commit hooks

### Building & Testing

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run all tests (unit + integration + E2E)
npm test

# Specific test suites
npm run test:unit      # 55+ unit tests
npm run test:integration  # 14+ integration tests  
npm run test:e2e       # 13+ end-to-end tests
npm run test:coverage  # Generate coverage report

# Development watch mode
npm run watch

# Package for distribution
npm run package
```

### Test Architecture
- **Unit Tests**: Isolated module testing with `mockVscode`
- **Integration Tests**: Plugin system and task execution workflows
- **E2E Tests**: Real VS Code environment with `@vscode/test-electron`
- **Coverage**: Istanbul/nyc with HTML, text, and LCOV reports
- **CI/CD**: GitHub Actions with matrix testing across Node.js versions

### Code Quality
.
**Pre-commit Hooks**: Automated testing on every commit
- **Code Formatting**: Prettier integration
- **Type Safety**: Strict TypeScript configuration
- **Linting**: ESLint with VS Code extension best practices

## 🛣️ Roadmap

### ✅ Completed (v0.4.0)
- [x] **Core Extension Architecture**: Singleton pattern with dependency injection
- [x] **Multi-Model Support**: DeepSeek, Claude, GPT, Qwen adapters
- [x] **Plugin System**: Extensible architecture with MCP integration
- [x] **Enhanced Task Engine**: Real-time event streaming API
- [x] **Comprehensive Testing**: 82+ tests with CI/CD pipeline
- [x] **Sidebar UI**: React-based task management interface
- [x] **Browser Automation**: Web interaction capabilities
- [x] **Approval Workflow**: Safe command execution with user confirmation

### 🚧 In Progress & Planned
#### Phase 2 (v0.5.0)
- [ ] **Plugin Marketplace**: Discover and install community plugins
- [ ] **Advanced Code Completion**: AI-powered IntelliSense integration
- [ ] **Team Collaboration**: Shared task queues and project contexts
- [ ] **Performance Optimization**: Caching and incremental analysis

#### Phase 3 (v1.0.0)
- [ ] **Visual Programming**: Drag-and-drop task composition
- [ ] **Multi-Agent Coordination**: Specialized agents for different task types
- [ ] **Learning System**: Adapts to user's coding style and preferences
- [ ] **Enterprise Features**: SSO, audit logging, compliance controls

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow
1. **Fork & Clone**: `git clone https://github.com/yourusername/codeline.git`
2. **Branch**: `git checkout -b feature/your-feature-name`
3. **Develop**: Make your changes following code style guidelines
4. **Test**: Ensure all tests pass: `npm test`
5. **Commit**: Use descriptive commit messages
6. **Pull Request**: Submit PR with clear description and test coverage

### Code Standards
- **TypeScript**: Strict mode enabled, explicit types preferred
- **Testing**: All new features require corresponding tests
- **Documentation**: Update README and code comments as needed
- **Commit Messages**: Follow Conventional Commits specification

### Testing Requirements
- **Unit Tests**: Required for all new modules
- **Integration Tests**: Required for cross-module functionality
- **E2E Tests**: Recommended for user-facing features
- **Coverage**: Maintain or improve existing coverage levels

## 📄 License

MIT License - See [LICENSE](LICENSE) for full text.

## 🙏 Acknowledgments

- **Cline**: Inspiration for autonomous coding capabilities
- **Qoder**: Intelligent prompt engineering patterns
- **VS Code Team**: Extension API and development tools
- **AI Model Providers**: DeepSeek, Anthropic, OpenAI, Alibaba Cloud
- **Open Source Community**: All contributors and dependency maintainers

---

<p align="center">
  <em>CodeLine: Your AI-powered coding companion for the VS Code ecosystem</em>
</p>