/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

interface CelebrityScore {
  familiarity: number;
  popularity: number;
  qScore: number;
}

interface SocialProfile {
  name: string;
  link: string;
  image?: string;
}

interface Celebrity {
  name: string;
  description: string;
  image: string;
  facts: string[];
  socialProfiles: SocialProfile[];
  score: CelebrityScore;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Celebrity name is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      throw new Error('API key is not configured');
    }
    
    const url = `https://serpapi.com/search?api_key=${apiKey}&engine=google&q=${encodeURIComponent(name)}`;
    
    console.log('Fetching from URL:', url.replace(apiKey, 'HIDDEN_KEY'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('SerpAPI error:', data.error);
      return NextResponse.json({ error: data.error }, { status: 500 });
    }
    
    const result = processResults(data, name);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch celebrity information' }, { status: 500 });
  }
}

function processResults(data: { knowledge_graph?: any; organic_results?: any[]; news_results?: any[]; error?: string }, searchName: string): Celebrity {
  const knowledgeGraph = data.knowledge_graph || {};
  const hasKnowledgeGraph = Object.keys(knowledgeGraph).length > 0;

  let image = '';
  if (knowledgeGraph.image) {
    image = knowledgeGraph.image;
  } else if (knowledgeGraph.thumbnail) {
    image = knowledgeGraph.thumbnail;
  } else if (knowledgeGraph.header_images && knowledgeGraph.header_images.length > 0) {
    image = knowledgeGraph.header_images[0].image;
  }
  
  const socialProfiles: SocialProfile[] = [];
  if (knowledgeGraph.profiles && knowledgeGraph.profiles.length > 0) {
    knowledgeGraph.profiles.forEach((profile: { name: string; link: string; image?: string }) => {
      socialProfiles.push({
        name: profile.name,
        link: profile.link,
        image: profile.image
      });
    });
  }

  const celebrityInfo: Celebrity = {
    name: hasKnowledgeGraph ? (knowledgeGraph.title || searchName) : searchName,
    description: knowledgeGraph.description || '',
    image: image,
    facts: extractFacts(knowledgeGraph),
    socialProfiles: socialProfiles,
    score: calculateCelebrityScore(data, knowledgeGraph)
  };
  
  return celebrityInfo;
}

function extractFacts(knowledgeGraph: { [key: string]: string | string[] | { [key: string]: string } }): string[] {
  const facts: string[] = [];
  if (knowledgeGraph.facts && knowledgeGraph.facts.length) {
    if (Array.isArray(knowledgeGraph.facts)) {
      return knowledgeGraph.facts;
    }
  }
  
  if (knowledgeGraph.attributes) {
    for (const [key, value] of Object.entries(knowledgeGraph.attributes)) {
      if (value) {
        facts.push(`${key}: ${value}`);
      }
    }
  }
  
  const factProperties = ['born', 'height', 'net_worth', 'spouse', 'children', 'education', 'website'];
  factProperties.forEach(prop => {
    if (knowledgeGraph[prop]) {
      facts.push(`${prop.replace('_', ' ')}: ${knowledgeGraph[prop]}`);
    }
  });
  
  return facts;
}

function calculateCelebrityScore(data: any, knowledgeGraph: any): CelebrityScore {
  let familiarityScore = 0;
  let popularityScore = 0;
  if (Object.keys(knowledgeGraph).length > 0) {
    familiarityScore += 50;
    if (knowledgeGraph.description) familiarityScore += 10;
    if (knowledgeGraph.profiles && knowledgeGraph.profiles.length > 0) familiarityScore += 10;
    const hasFacts = 
      (knowledgeGraph.facts && knowledgeGraph.facts.length > 0) ||
      (knowledgeGraph.attributes && Object.keys(knowledgeGraph.attributes).length > 0);
    if (hasFacts) familiarityScore += 10;
    if (knowledgeGraph.image || knowledgeGraph.thumbnail || 
        (knowledgeGraph.header_images && knowledgeGraph.header_images.length > 0)) {
      familiarityScore += 5;
    }
  } else {
    if (data.organic_results && data.organic_results.length > 0)
      familiarityScore += 20;
  }
  if (data.organic_results) {
    popularityScore += Math.min(30, data.organic_results.length * 5);
  }
  if (data.news_results) {
    popularityScore += Math.min(20, data.news_results.length * 4);
  }
  if (knowledgeGraph.profiles) {
    popularityScore += Math.min(20, knowledgeGraph.profiles.length * 5);
  }
  familiarityScore = Math.min(100, Math.round(familiarityScore));
  popularityScore = Math.min(100, Math.round(popularityScore));
  const qScore = Math.round((familiarityScore * popularityScore) / 100);
  return {
    familiarity: familiarityScore,
    popularity: popularityScore,
    qScore: qScore
  };
}