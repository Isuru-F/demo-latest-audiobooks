#!/usr/bin/env node

// Test Orb SDK integration with toolbox tools

import { execute } from '@sourcegraph/the-orb-is-awake';
import fs from 'fs';

async function testOrbIntegration() {
  console.log('🧪 Testing Orb SDK Integration');
  console.log('==============================');

  // Set up environment
  const scriptDir = new URL('.', import.meta.url).pathname;
  const toolsDir = scriptDir.replace('/tests/', '');
  const rootDir = toolsDir.replace('/.tools/', '');
  
  process.env.AMP_TOOLBOX = toolsDir;
  
  // Create empty settings file
  const settingsFile = `${rootDir}to-delete/empty-settings.json`;
  if (!fs.existsSync(`${rootDir}to-delete`)) {
    fs.mkdirSync(`${rootDir}to-delete`, { recursive: true });
  }
  fs.writeFileSync(settingsFile, '{}');
  
  console.log(`✅ Toolbox: ${process.env.AMP_TOOLBOX}`);
  console.log(`✅ Settings: ${settingsFile}`);

  if (!process.env.AMP_API_KEY) {
    console.log('⚠️  AMP_API_KEY not set - showing what would happen:');
    console.log('');
    console.log('1. Extract entities from PR diff using toolbox');
    console.log('2. For each entity in client/src/ files:');
    console.log('   - Create Orb SDK request with --visibility private');
    console.log('   - Use custom empty settings file');
    console.log('   - Get structured **SEVERITY**: responses');
    console.log('   - Parse HIGH/MEDIUM issues automatically');
    console.log('3. Generate GitHub-compatible JSON');
    console.log('4. Create inline PR comments');
    console.log('');
    console.log('To test with real API: export AMP_API_KEY=your_key');
    return;
  }

  try {
    // Quick test to verify Orb SDK works with settings
    console.log('🔮 Testing Orb SDK with custom settings...');
    
    const options = {
      prompt: `Test the code_reviewer tool with this sample:

\`\`\`typescript
const test = (data: any) => data.prop;
\`\`\`

Look for type safety issues and provide **SEVERITY**: format.`,
      options: {
        visibility: 'private',
        settingsFile: settingsFile
      }
    };

    const stream = execute(options);
    let sessionId = '';
    let issues = [];

    for await (const message of stream) {
      if (message.type === 'system') {
        sessionId = message.session_id;
        console.log(`  🆔 Session: ${sessionId}`);
        
        const toolboxTools = message.tools?.filter(t => t.startsWith('tb__')) || [];
        console.log(`  🧰 Toolbox tools: ${toolboxTools.length}`);
      }
      
      if (message.type === 'result') {
        const result = message.result;
        console.log(`  ✅ Analysis completed: ${message.duration_ms}ms`);
        
        // Extract structured issues
        const issueMatches = [...result.matchAll(/\*\*(HIGH|MEDIUM|LOW)\*\*:\s*([^\n]+)/g)];
        
        issues = issueMatches.map((match, index) => ({
          id: index + 1,
          severity: match[1],
          description: match[2],
          title: match[2].split(' - ')[0].slice(0, 50)
        }));
        
        console.log(`  📊 Issues found: ${issues.length}`);
        issues.forEach(issue => {
          console.log(`    - ${issue.severity}: ${issue.title}`);
        });
      }
    }

    console.log('\n🎉 Orb SDK integration test successful!');
    console.log(`✨ Session: ${sessionId}`);
    console.log(`📊 Issues extracted: ${issues.length}`);
    console.log('🔧 Benefits: Clean structured parsing, no JSON streaming complexity');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOrbIntegration();
