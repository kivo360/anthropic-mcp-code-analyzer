# Anthropic MCP Code Analyzer

An MCP server that helps analyze open source projects and integrate them with your existing codebase. This tool uses Claude to analyze code patterns, architecture, and documentation to provide intelligent merge strategies.

## Features

- Repository analysis and code pattern detection
- Documentation extraction and processing
- Intelligent merge strategy generation using Claude
- AST-based code analysis
- Dependency tracking
- Architecture pattern detection

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kivo360/anthropic-mcp-code-analyzer.git
cd anthropic-mcp-code-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
export ANTHROPIC_API_KEY=your_api_key
export PORT=3000  # Optional, defaults to 3000
```

## Usage

1. Start the server:
```bash
npm start
```

2. Analyze repositories and get merge strategies:
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "sourceRepo": "https://github.com/user/source-repo.git",
    "targetRepo": "https://github.com/user/target-repo.git"
  }'
```

The server will return:
- Source repository analysis
- Target repository analysis
- Recommended merge strategy
- Potential conflicts and solutions

## API Endpoints

### POST /analyze
Analyzes source and target repositories and generates a merge strategy.

Request body:
```json
{
  "sourceRepo": "string",
  "targetRepo": "string"
}
```

### GET /health
Health check endpoint to verify server status.

## How it Works

1. **Repository Analysis**
   - Clones both source and target repositories
   - Analyzes code structure using AST parsing
   - Extracts patterns and dependencies
   - Processes documentation

2. **Pattern Detection**
   - Identifies common coding patterns
   - Maps dependencies and relationships
   - Analyzes architectural decisions

3. **Merge Strategy Generation**
   - Uses Claude to analyze compatibility
   - Generates step-by-step integration plan
   - Identifies potential conflicts
   - Suggests refactoring steps

4. **Documentation Processing**
   - Extracts and analyzes documentation
   - Maps knowledge between codebases
   - Provides context for decisions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.