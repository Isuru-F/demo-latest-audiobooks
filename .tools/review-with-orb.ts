#!/usr/bin/env tsx

// Review entities using Orb SDK
import fs from 'fs';

interface Entity {
  id: string;
  file: string;
  line: number;
  start: number;
  end: number;
  kind: string;
  name: string;
  content?: string;
}

interface Issue {
  id: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  file: string;
  line: number;
  description: string;
  suggestion: string;
}

interface ReviewResult {
  tool: string;
  version: string;
  summary: string;
  issues: Issue[];
}

interface EntitiesData {
  entities_found: number;
  extraction_method: string;
  note: string;
  entities: Entity[];
}

async function reviewEntitiesWithOrb(): Promise<ReviewResult> {
  try {
    // Import Orb SDK
    const { execute } = await import('@sourcegraph/the-orb-is-awake');
    
    const entitiesData: EntitiesData = JSON.parse(fs.readFileSync('entities.json', 'utf8'));
    const entities = entitiesData.entities;
    const allIssues: Issue[] = [];
    let id = 1;
    
    // Filter client entities first
    const clientEntities = entities.filter(entity => entity.file.includes('client/src/'));
    console.log(`Processing ${entities.length} total entities, ${clientEntities.length} client entities with Orb SDK...`);
    
    if (clientEntities.length === 0) {
      console.log('No client entities to review');
      return {
        tool: 'amp',
        version: '0.2',
        summary: 'No client entities found to review',
        issues: []
      };
    }

    let threadId: string | undefined;
    
    for (let i = 0; i < clientEntities.length; i++) {
      const entity = clientEntities[i];
      const isFirst = i === 0;
      
      console.log(`Reviewing ${entity.name} in ${entity.file}:${entity.line} ${isFirst ? '(starting new thread)' : '(continuing thread)'}`);
      
      const ampOptions: any = {
        visibility: 'private',
        dangerouslyAllowAll: true,
      };
      
      // Add continue option for thread continuation (except for first message)
      if (!isFirst && threadId) {
        ampOptions.continue = threadId;
        console.log(`🔄 Using existing thread ID for continuation: ${threadId}`);
      } else if (!isFirst && !threadId) {
        console.log(`⚠️  Warning: No thread ID available for continuation!`);
      }

      const prompt = isFirst 
        ? `I'm going to send you ${clientEntities.length} code entities from a client application to review for security and performance issues. As a Senior engineer, please analyze each one and report issues in this format: **HIGH/MEDIUM/LOW**: description

Consider: missing/weak tests, security, performance, code quality, architecture, best practices, include a suggestion on how to fix it and what the impact of not fixing it could be.

First entity - ${entity.kind} "${entity.name}" from ${entity.file}:${entity.line}:
${entity.content ? entity.content.slice(0, 1000) : 'No content available'}`
        : `Next entity - ${entity.kind} "${entity.name}" from ${entity.file}:${entity.line}:
${entity.content ? entity.content.slice(0, 1000) : 'No content available'}`;

      const stream = execute({
        prompt,
        options: ampOptions
      });
      
      let analysisResult = '';
      
      for await (const message of stream) {
        console.log(`📨 Message type: ${message.type}`, message.type === 'result' ? `(error: ${message.is_error})` : '');
        
        // Remove debug logging in production version
        
        // Capture session_id as threadId from any message that has it
        if (isFirst && (message as any).session_id && !threadId) {
          threadId = (message as any).session_id;
          console.log(`🧵 Thread ID captured from session_id: ${threadId}`);
        }
        
        // Also try threadId field as backup
        if (isFirst && !threadId && (message as any).threadId) {
          threadId = (message as any).threadId;
          console.log(`🧵 Thread ID captured from threadId field: ${threadId}`);
        }
        
        if (message.type === 'result') {
          if (message.is_error) {
            console.error(`❌ Error analyzing ${entity.name}:`, message.error);
            analysisResult = '';
          } else {
            console.log(`✅ Success analyzing ${entity.name}`);
            analysisResult = message.result;
            
            // Last attempt to capture threadId from successful result
            if (isFirst && !threadId && (message as any).threadId) {
              threadId = (message as any).threadId;
              console.log(`🧵 Thread ID captured from result: ${threadId}`);
            }
          }
          break;
        }
      }
      
      // Extract issues from structured result
      const issueMatches = [...analysisResult.matchAll(/\*\*(HIGH|MEDIUM|LOW)\*\*:\s*([^\n]+)/g)];
      
      for (const match of issueMatches) {
        // Focus on critical issues only
        if (match[1] === 'HIGH' || 
            (match[1] === 'MEDIUM' && (match[2].includes('safety') || match[2].includes('validation') || match[2].includes('security')))) {
          
          allIssues.push({
            id: id++,
            severity: match[1] as 'HIGH' | 'MEDIUM' | 'LOW',
            title: match[2].split(' - ')[0].slice(0, 60),
            file: entity.file,
            line: entity.line,
            description: match[2].slice(0, 180),
            suggestion: 'See analysis for specific recommendations'
          });
        }
      }
      
      // Small delay between requests to avoid rate limiting
      if (i < clientEntities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const result: ReviewResult = {
      tool: 'amp',
      version: '0.2', 
      summary: allIssues.length ? `Found ${allIssues.length} issues using Amp Orb SDK.` : 'No issues found.',
      issues: allIssues
    };
    
    console.log('📝 Writing review results to amp_review.json...');
    fs.writeFileSync('amp_review.json', JSON.stringify(result, null, 2));
    console.log(`✅ Generated review with ${allIssues.length} issues`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Review failed:', (error as Error).message);
    process.exit(1);
    return { tool: 'amp', version: '0.2', summary: 'Error occurred', issues: [] }; // This won't be reached but satisfies TypeScript
  }
}

reviewEntitiesWithOrb();
