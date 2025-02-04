import { Anthropic } from '@anthropic-ai/sdk';
import express from 'express';
import simpleGit from 'simple-git';
import { createFileSystem } from 'memfs';
import { parse } from 'parse-git-diff';
import jscodeshift from 'jscodeshift';
import { namedTypes as n } from 'ast-types';

const app = express();
const port = process.env.PORT || 3000;
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create in-memory file system
const fs = createFileSystem();

class CodeAnalyzer {
  constructor() {
    this.git = simpleGit();
  }

  async cloneRepository(url, branch = 'main') {
    const tempDir = `/tmp/${Date.now()}`;
    await this.git.clone(url, tempDir);
    await this.git.checkout(branch);
    return tempDir;
  }

  async analyzeCode(directory) {
    const files = await fs.promises.readdir(directory, { recursive: true });
    const analysis = {
      structure: {},
      dependencies: {},
      patterns: [],
      documentation: {}
    };

    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const content = await fs.promises.readFile(`${directory}/${file}`, 'utf-8');
        const ast = jscodeshift(content);
        
        // Analyze imports and dependencies
        ast.find(jscodeshift.ImportDeclaration).forEach(path => {
          const importSource = path.node.source.value;
          analysis.dependencies[file] = analysis.dependencies[file] || [];
          analysis.dependencies[file].push(importSource);
        });

        // Analyze patterns and architecture
        this.analyzePatterns(ast, analysis.patterns);
      }
      
      if (file.endsWith('.md') || file.endsWith('.txt')) {
        const content = await fs.promises.readFile(`${directory}/${file}`, 'utf-8');
        analysis.documentation[file] = content;
      }
    }

    return analysis;
  }

  analyzePatterns(ast, patterns) {
    // Detect common patterns
    ast.find(jscodeshift.ClassDeclaration).forEach(path => {
      patterns.push({
        type: 'class',
        name: path.node.id.name,
        methods: path.node.body.body
          .filter(node => n.MethodDefinition.check(node))
          .map(node => node.key.name)
      });
    });

    // Add more pattern detection as needed
  }

  async generateMergeStrategy(sourceAnalysis, targetAnalysis) {
    const prompt = `Given the following source code analysis:
      ${JSON.stringify(sourceAnalysis, null, 2)}
      
      And target codebase analysis:
      ${JSON.stringify(targetAnalysis, null, 2)}
      
      Generate a detailed merge strategy that:
      1. Identifies compatible and conflicting patterns
      2. Suggests refactoring steps
      3. Provides a step-by-step integration plan
      4. Highlights potential risks and mitigations`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content;
  }
}

const analyzer = new CodeAnalyzer();

app.use(express.json());

// Endpoint to analyze a repository
app.post('/analyze', async (req, res) => {
  try {
    const { sourceRepo, targetRepo } = req.body;
    
    // Clone and analyze source repository
    const sourceDir = await analyzer.cloneRepository(sourceRepo);
    const sourceAnalysis = await analyzer.analyzeCode(sourceDir);
    
    // Clone and analyze target repository
    const targetDir = await analyzer.cloneRepository(targetRepo);
    const targetAnalysis = await analyzer.analyzeCode(targetDir);
    
    // Generate merge strategy
    const mergeStrategy = await analyzer.generateMergeStrategy(
      sourceAnalysis,
      targetAnalysis
    );
    
    res.json({
      sourceAnalysis,
      targetAnalysis,
      mergeStrategy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});