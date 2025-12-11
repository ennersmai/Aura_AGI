# Aura App - Product Requirements Document (PRD)
Version: 1.1 Date: March 11, 2025 Authors: Dev: Mai & Aura : (AI Assistant)

## 1. Introduction
This document outlines the product requirements for Aura App, a personal AI assistant application designed to enhance productivity and provide a customizable AI companion. Aura App aims to be a powerful, responsive, and locally-focused tool, leveraging the capabilities of various Large Language Models (LLMs) while prioritizing user privacy and control.

## 2. Goals
- Provide a user-friendly AI assistant for daily tasks, including research, code generation, content creation, and general conversation.
- Enable deep customization of the AI's persona and behavior.
- Offer seamless integration with various LLM providers (Mistral, OpenAI, Gemini).
- Implement a robust memory system for long-term context retention and efficient retrieval.
- Facilitate tool/function calls to extend the AI's capabilities.
- Prioritize performance and responsiveness, leveraging local processing where possible.
- Provide a foundation for future open-source development.

## 3. Target Audience
- Developers
- Researchers
- Writers
- Anyone seeking a powerful and customizable AI assistant.

## 4. Key Features

### 4.1. Core Functionality
- Chat Interface: A text-based chat interface for interacting with the AI.
- Voice Interaction (MVP): Voice input (Speech-to-Text) and output (Text-to-Speech) capabilities using cloud-based services (Google Cloud TTS/STT).
- AI Persona Customization:
	- Adjustable temperature and other generation parameters.
	- Dynamic system prompt modification.
	- User preference storage for consistent behavior.
- LLM API Integration:
	- Support for multiple LLM providers (initially Gemini and Mistral).
	- User-provided API keys (managed via a .env file).
	- Model selection within each provider (e.g., Gemini Pro, Mistral Large).
	- Retry mechanism with a configurable timer (2 retries) for API failures.

### 4.2. Memory and Persistence
- Conversation History: Storage of all conversations in a local SQLite database.
- Long-Term Memory: A "scratchpad" for storing key information and insights, embedded using Mistral's cloud-based embedding API for high-quality retrieval.
- Embedding Strategy: A hybrid approach using a local Sentence Transformer model (all-MiniLM-L6-v2) for embedding conversation history and outputs, and Mistral's cloud API for the scratchpad.
- Data Storage:
	- Conversation history.
	- User preferences (settings, preferred models).
	- Tool configurations.
	- Generated content (code snippets, summaries, etc.).
- User Data Control: The user is responsible for data management and deletion. No automatic deletion.
- Database Security: Basic encryption for the SQLite database to protect conversation history.

### 4.3. Tool Calls and Extensibility
- Initial Tools:
	- Web Search (API: Tavily).
	- Run Python Script.
- Tool Configuration: A user interface for configuring tool parameters and authentication. Initial development with manual tweaking and unit tests, later translated to a user-friendly UI.
- MCP Server Integration: Support for connecting to MCP (Model Context Protocol) servers for accessing external resources and tools in a standardized way.
- Future Extensibility: A modular architecture to facilitate adding new tools.

## 5. User Interface (UI)
- Technology: Vue 3.
- Design Principles:
	- Clean and intuitive interface.
	- Responsive design for various screen sizes.
	- Clear visual feedback for user actions and AI responses.
- Key Elements:
	- Main chat window.
	- Input field for text-based interaction.
	- Buttons/controls for voice input/output (when enabled).
	- Settings panel for:
		- LLM API configuration (provider selection, API key input, model selection).
		- AI persona customization (temperature, system prompt, etc.).
		- Tool configuration.
		- Displaying logs and error messages.
	- A way to visually access the long-term memory of the agent.

## 6. Technical Architecture

### 6.1. Backend
- Language: Python.
- Framework: FastAPI.
- Asynchronous Operations: Extensive use of asynchronous programming (async/await) for handling LLM API calls, tool calls, and database operations to maximize responsiveness.
- Database: Hybrid approach for optimal performance:
  - SQLite with basic encryption for general data storage (conversations, settings, metadata)
  - FAISS vector database for embedding storage and high-performance similarity searches
  - Integration layer to coordinate between the two database systems
  - Caching mechanisms for frequently accessed data
- Embedding:
	- Local: Sentence Transformers library with all-MiniLM-L6-v2 model.
	- Cloud: Mistral Embeddings API.
- Error Handling:
	- Robust error handling with informative logging to the console and UI.
	- Centralized error handling system categorizing errors by source (API connection, local processing, tool execution).
	- Different logging levels (DEBUG, INFO, WARNING, ERROR) with appropriate filtering.
- Logging: Extensive logging with multiple levels of detail.

### 6.2. Frontend
- Language: JavaScript/TypeScript.
- Framework: Vue 3.
- Communication with Backend: REST API for standard operations, with WebSockets for streaming responses.

### 6.3. Deployment
- Local Application: The application will be designed to run locally on the user's machine.
- Distribution: Instructions for users for easy cloning and configuration.

## 7. Performance Requirements
- Responsiveness:
	- Simple queries: Near-instant response (< 500ms).
	- Complex tasks (e.g., web search, code execution): Response within a few seconds (< 5 seconds, ideally).
	- Vector similarity searches: Under 50ms for databases with thousands of memories.
- Scalability: The application should handle long conversation histories and a reasonable number of tool integrations without significant performance degradation.

## 8. Security Considerations
- API Key Management: API keys are stored locally in a .env file and are the user's responsibility.
- Data Privacy: All data is stored locally on the user's machine, minimizing privacy risks.
- Input Validation: The backend must validate all user inputs to prevent injection attacks or other vulnerabilities.
- Optional Access Protection: Adding basic password protection for accessing the application.

## 9. Future Integrations (Beyond MVP)
- API Rotation: Implement a system for automatically rotating between different LLM API providers to manage costs and rate limits. This will involve using multiple API keys and intelligently switching between providers based on availability, cost, and usage limits.
- Local LLMs: Explore the possibility of integrating with locally running LLMs (e.g., using Ollama or similar tools) to provide an offline option or enhance privacy.
- Local TTS/STT: Integrate local Text-to-Speech and Speech-to-Text engines for improved privacy and offline functionality.
- Advanced Tool Integration:
	- Calendar access.
	- Smart home control.
	- Email management.
	- More sophisticated code execution environments.
- User Authentication: Although primarily a local application, consider adding user authentication (e.g., password protection) for an extra layer of security.
- Plugin System: Develop a plugin system to allow users and third-party developers to easily extend Aura App's functionality.
- Desktop Integration:
	- File System Access: Ability to read, write, and manage files and directories on the user's local file system.
	- Application Control: Ability to launch and interact with other applications on the user's desktop (e.g., opening a text editor, running a command in the terminal).
	- Screen Reading (Optional): Potentially, the ability to "see" the user's screen content (with appropriate permissions and privacy safeguards) to provide contextual assistance. This would require careful consideration of security and user consent.
	- Clipboard access
- Emotional Intelligence System:
	- Computational emotion modeling using established frameworks (OCC Model, PAD Dimensional Model)
	- Neo4j graph database integration for storing and manipulating emotion states
	- 22-dimensional emotion embeddings with real-time updates
	- Dynamic system prompt modification based on emotional state
	- Emotional memory tagging and retrieval
	- Integration with emotional speech synthesis for voice interactions
	- Context-sensitive emotional responses that evolve over time
	- Emotional congruence effects linking current state to memory accessibility
	- Personality-driven emotional baseline calibration
	- Visual representation of emotional state in the UI (optional)

## 10. Open Source Considerations
- Licensing: MIT License.
- Community Engagement: Plan for community involvement, including contribution guidelines, issue tracking, and communication channels.
- Documentation: Comprehensive documentation for users and developers, including secure API key management guidelines.

## 11. Success Metrics
- User Adoption: Track the number of users downloading and actively using Aura App.
- User Engagement: Monitor the frequency and duration of user interactions.
- Performance Benchmarks: Regularly measure response times and resource utilization.
- Community Contributions: Track the number of contributions (bug reports, feature requests, pull requests) from the community.
- User Satisfaction: Gather user feedback through surveys or feedback forms.

## 12. MVP Implementation Prioritization
1. Core chat functionality with one LLM provider (Mistral)
2. Basic memory system with local storage
3. Simple persona customization
4. Adding a second LLM provider (Gemini)
5. Web search tool integration
6. Python script execution tool
7. Voice interaction capabilities

## 13. Appendix (Optional)
- \[This section can be used to include any supporting documents, diagrams, or mockups.\]
