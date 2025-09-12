#!/usr/bin/env node

// Review entities using Orb SDK

import { execute } from '@sourcegraph/the-orb-is-awake';
import fs from 'fs';

async function reviewEntitiesWithOrb() {
  try {
    const entities = JSON.parse(fs.readFileSync('entities.json', 'utf8')).entities;
    const allIssues = [];
    let id = 1;
    
    console.log(`Processing ${entities.length} entities with Orb SDK...`);
    
    for (const entity of entities) {
      // Skip non-client files
      if (!entity.file.includes('client/src/')) {
        console.log(`Skipping non-client file: ${entity.file}`);
        continue;
      }
      
      console.log(`Reviewing ${entity.name} in ${entity.file}:${entity.line}`);
      

      const stream = execute({
        prompt: `Review this ${entity.kind} "${entity.name}" from ${entity.file}:${entity.line}. Find security/performance issues. Format: **HIGH/MEDIUM/LOW**: description`
      });
      let analysisResult = '';
      
      for await (const message of stream) {
        console.log(`📨 Message type: ${message.type}`);
        if (message.type === 'result') {
          if (message.is_error) {
            console.error(`❌ Error analyzing ${entity.name}:`, message.error);
            analysisResult = ''; // No results from error
          } else {
            console.log(`✅ Success analyzing ${entity.name}`);
            analysisResult = message.result;
          }
          break; // Exit loop after getting result (success or error)
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
            severity: match[1],
            title: match[2].split(' - ')[0].slice(0, 60),
            file: entity.file,
            line: entity.line,
            description: match[2].slice(0, 180),
            suggestion: 'See analysis for specific recommendations'
          });
        }
      }
    }
    
    const result = {
      tool: 'amp',
      version: '0.2', 
      summary: allIssues.length ? `Found ${allIssues.length} issues using Amp Orb SDK.` : 'No issues found.',
      issues: allIssues
    };
    
    fs.writeFileSync('amp_review.json', JSON.stringify(result, null, 2));
    console.log(`✅ Generated review with ${allIssues.length} issues`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Review failed:', error.message);
    process.exit(1);
  }
}

reviewEntitiesWithOrb();
