#!/usr/bin/env node

/**
 * Build Script for AGENTS.md
 *
 * Generates a consolidated AGENTS.md file from SKILL.md and individual rule files.
 * Similar to Supabase's approach for agent skills.
 */

const fs = require('fs');
const path = require('path');

// Paths
const SKILLS_DIR = path.join(__dirname, '..', 'skills', 'composio');
const SKILL_FILE = path.join(SKILLS_DIR, 'SKILL.md');
const RULES_DIR = path.join(SKILLS_DIR, 'rules');
const OUTPUT_FILE = path.join(SKILLS_DIR, 'AGENTS.md');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: content };
  }

  const frontmatterText = match[1];
  const contentWithoutFrontmatter = content.slice(match[0].length);

  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value;
    }
  });

  return { frontmatter, content: contentWithoutFrontmatter };
}

/**
 * Read and parse a rule file
 */
function readRuleFile(rulePath) {
  const fullPath = path.join(RULES_DIR, rulePath);

  if (!fs.existsSync(fullPath)) {
    log(`⚠️  Warning: Rule file not found: ${rulePath}`, 'yellow');
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const { frontmatter, content: ruleContent } = parseFrontmatter(content);

  return {
    path: rulePath,
    frontmatter,
    content: ruleContent.trim()
  };
}

/**
 * Extract rule references from SKILL.md content
 */
function extractRuleReferences(skillContent) {
  // Match markdown links like [Rule Name](rules/rule-file.md)
  const ruleRegex = /\[([^\]]+)\]\(rules\/([^)]+\.md)\)/g;
  const rules = [];
  let match;

  while ((match = ruleRegex.exec(skillContent)) !== null) {
    rules.push({
      title: match[1],
      file: match[2]
    });
  }

  return rules;
}

/**
 * Generate table of contents
 */
function generateTOC(sections) {
  let toc = '## Table of Contents\n\n';

  sections.forEach((section, index) => {
    const sectionNum = index + 1;
    toc += `${sectionNum}. [${section.title}](#${section.anchor})\n`;

    section.rules.forEach((rule, ruleIndex) => {
      toc += `   ${sectionNum}.${ruleIndex + 1}. [${rule.title}](#${rule.anchor})\n`;
    });

    toc += '\n';
  });

  return toc;
}

/**
 * Create anchor from title
 */
function createAnchor(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Build AGENTS.md
 */
function buildAgentsMd() {
  log('\n🚀 Building AGENTS.md...', 'cyan');
  log('━'.repeat(50), 'cyan');

  // Read SKILL.md
  if (!fs.existsSync(SKILL_FILE)) {
    log('❌ Error: SKILL.md not found', 'red');
    process.exit(1);
  }

  const skillContent = fs.readFileSync(SKILL_FILE, 'utf-8');
  const { frontmatter: skillFrontmatter, content: skillBody } = parseFrontmatter(skillContent);

  log('✓ Read SKILL.md', 'green');

  // Extract sections and rules
  const sections = [];
  const sectionRegex = /^### (\d+)\. (.+)$/gm;
  let sectionMatch;
  let lastSectionEnd = 0;

  while ((sectionMatch = sectionRegex.exec(skillBody)) !== null) {
    const sectionTitle = sectionMatch[2];
    const sectionStart = sectionMatch.index;

    if (sections.length > 0) {
      sections[sections.length - 1].endIndex = sectionStart;
    }

    sections.push({
      number: sectionMatch[1],
      title: sectionTitle,
      anchor: createAnchor(sectionTitle),
      startIndex: sectionStart,
      endIndex: skillBody.length,
      rules: []
    });

    lastSectionEnd = sectionStart;
  }

  // Extract rules for each section
  sections.forEach(section => {
    const sectionContent = skillBody.slice(section.startIndex, section.endIndex);
    const rules = extractRuleReferences(sectionContent);

    section.rules = rules.map(rule => ({
      title: rule.title,
      file: rule.file,
      anchor: createAnchor(rule.title)
    }));
  });

  log(`✓ Found ${sections.length} sections`, 'green');

  let totalRules = 0;
  sections.forEach(section => {
    totalRules += section.rules.length;
    log(`  • ${section.title}: ${section.rules.length} rules`, 'blue');
  });

  log(`✓ Found ${totalRules} total rules`, 'green');

  // Build AGENTS.md content
  let output = '';

  // Add header from SKILL.md frontmatter
  output += '---\n';
  Object.entries(skillFrontmatter).forEach(([key, value]) => {
    output += `${key}: ${value}\n`;
  });
  output += '---\n\n';

  // Add title
  output += `# ${skillFrontmatter.name || 'Composio Agent Skills'}\n\n`;
  output += `${skillFrontmatter.description || ''}\n\n`;

  // Extract "When to Apply" section from SKILL.md
  const whenToApplyMatch = skillBody.match(/## When to Apply([\s\S]*?)(?=##|$)/);
  if (whenToApplyMatch) {
    output += '## When to Apply\n';
    output += whenToApplyMatch[1].trim() + '\n\n';
  }

  // Generate and add TOC
  log('✓ Generating table of contents', 'green');
  output += generateTOC(sections);

  output += '---\n\n';

  // Add each section and its rules
  log('✓ Processing rules...', 'green');
  let processedRules = 0;

  sections.forEach((section, sectionIndex) => {
    output += `## ${section.number}. ${section.title}\n\n`;
    output += `<a name="${section.anchor}"></a>\n\n`;

    section.rules.forEach((rule, ruleIndex) => {
      log(`  • Processing: ${rule.file}`, 'blue');

      const ruleData = readRuleFile(rule.file);

      if (!ruleData) {
        output += `### ${section.number}.${ruleIndex + 1}. ${rule.title}\n\n`;
        output += `_Rule file not found: ${rule.file}_\n\n`;
        return;
      }

      // Add rule header
      output += `### ${section.number}.${ruleIndex + 1}. ${rule.title}\n\n`;
      output += `<a name="${rule.anchor}"></a>\n\n`;

      // Add impact badge if available
      if (ruleData.frontmatter.impact) {
        const impact = ruleData.frontmatter.impact;
        const badge = impact === 'CRITICAL' ? '🔴 CRITICAL' :
                     impact === 'HIGH' ? '🟠 HIGH' :
                     impact === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW';
        output += `**Impact:** ${badge}\n\n`;
      }

      // Add description if available
      if (ruleData.frontmatter.description) {
        output += `> ${ruleData.frontmatter.description}\n\n`;
      }

      // Add rule content
      output += ruleData.content + '\n\n';
      output += '---\n\n';

      processedRules++;
    });
  });

  log(`✓ Processed ${processedRules} rules`, 'green');

  // Add footer
  const quickStartMatch = skillBody.match(/## Quick Start([\s\S]*?)(?=##|$)/);
  if (quickStartMatch) {
    output += '## Quick Start\n\n';
    output += quickStartMatch[1].trim() + '\n\n';
  }

  const referencesMatch = skillBody.match(/## References([\s\S]*?)$/);
  if (referencesMatch) {
    output += '## References\n\n';
    output += referencesMatch[1].trim() + '\n\n';
  }

  // Add generation timestamp
  output += '\n---\n\n';
  output += `_This file was automatically generated from individual rule files on ${new Date().toISOString()}_\n`;
  output += `_To update, run: \`npm run build:agents\`_\n`;

  // Write output
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  log('━'.repeat(50), 'cyan');
  log(`✅ Successfully generated AGENTS.md`, 'green');
  log(`📄 Output: ${OUTPUT_FILE}`, 'blue');
  log(`📊 Stats: ${sections.length} sections, ${processedRules} rules`, 'blue');

  // Calculate file sizes
  const agentsSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
  log(`📦 Size: ${agentsSize} KB`, 'blue');
  log('━'.repeat(50), 'cyan');
}

// Run the build
try {
  buildAgentsMd();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}
