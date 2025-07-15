import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const pricingTable = {
  asphalt: { rate: 6.5, deliveryFee: 150 },
  metal: { rate: 10.0, deliveryFee: 180 },
  tile: { rate: 12.0, deliveryFee: 200 },
  repair: { flatMin: 500, flatMax: 3000 },
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationContext {
  location?: string;
  serviceArea?: boolean;
  roofType?: string;
  sqft?: number;
  timeline?: string;
  budget?: string;
  previousQuotes?: number[];
}

function isWithinServiceArea(location: string): boolean {
  const torontoAdjacent = [
    'toronto', 'mississauga', 'brampton', 'markham', 'vaughan', 'richmond hill',
    'oakville', 'burlington', 'milton', 'ajax', 'pickering', 'whitby', 'oshawa',
    'newmarket', 'aurora', 'king city', 'stouffville', 'georgetown', 'acton',
    'bolton', 'caledon', 'orangeville', 'barrie', 'innisfil', 'bradford',
    'alliston', 'tottenham', 'shelburne', 'dundalk', 'angus', 'wasaga beach',
    'collingwood', 'meaford', 'owen sound', 'hanover', 'durham', 'port perry',
    'uxbridge', 'beaverton', 'cannington', 'lindsay', 'bobcaygeon', 'fenelon falls',
    'minden', 'haliburton', 'bancroft', 'madoc', 'belleville', 'trenton',
    'brighton', 'cobourg', 'port hope', 'bowmanville', 'courtice', 'clarington',
    'hamilton', 'ancaster', 'dundas', 'waterdown', 'stoney creek', 'grimsby',
    'beamsville', 'vineland', 'jordan', 'st catharines', 'niagara falls',
    'welland', 'port colborne', 'fort erie', 'crystal beach', 'ridgeway',
    'fonthill', 'pelham', 'thorold', 'niagara-on-the-lake', 'guelph', 'kitchener',
    'waterloo', 'cambridge', 'paris', 'brantford', 'woodstock', 'ingersoll',
    'tillsonburg', 'simcoe', 'port dover', 'delhi', 'norfolk county'
  ];
  
  return torontoAdjacent.some(city => 
    location.toLowerCase().includes(city)
  );
}

function extractData(history: Message[], context: ConversationContext = {}) {
  const allText = history.map(m => m.content).join(' ').toLowerCase();
  
  // Location detection
  const locationPatterns = [
    /(?:in|from|at|live in|located in)\s+([a-z\s]+?)(?:\s|$|,|\.|!|\?)/g,
    /([a-z\s]+?),?\s+ontario/g,
    /postal code\s+([a-z]\d[a-z]\s?\d[a-z]\d)/g
  ];
  
  let location = context.location;
  for (const pattern of locationPatterns) {
    const matches = Array.from(allText.matchAll(pattern));
    if (matches.length > 0) {
      location = matches[matches.length - 1][1].trim();
      break;
    }
  }

  const roofType = Object.keys(pricingTable).find(type => 
    allText.includes(type)
  ) || context.roofType || 'asphalt';

  const sqftMatch = allText.match(/(\d{3,5})\s?(sqft|square feet|ft2|ft²)?/);
  const sqft = sqftMatch ? parseInt(sqftMatch[1]) : context.sqft || 1500;

  const timelineMatch = allText.match(/(urgent|asap|this week|next week|this month|next month|spring|summer|fall|winter)/);
  const timeline = timelineMatch ? timelineMatch[1] : context.timeline;

  const budgetMatch = allText.match(/budget.*?(\$[\d,]+)/);
  const budget = budgetMatch ? budgetMatch[1] : context.budget;

  const serviceArea = location ? isWithinServiceArea(location) : context.serviceArea;

  return { 
    roofType, 
    sqft, 
    location, 
    serviceArea, 
    timeline, 
    budget,
    previousQuotes: context.previousQuotes || []
  };
}

function buildSystemPrompt(context: ConversationContext) {
  const { roofType = 'asphalt', sqft = 1500, serviceArea, location, timeline, budget, previousQuotes } = context;
  
  let estimateText = '';
  let quote = null;
  let serviceAreaMsg = '';
  let upsellSuggestions = '';

  // Service area check
  if (location) {
    if (serviceArea === false) {
      serviceAreaMsg = `\nSERVICE AREA NOTICE: Unfortunately, we don't currently service ${location}. Our service area covers within 200km of Toronto, Ontario. You may want to look for local contractors in your area.`;
    } else if (serviceArea === true) {
      serviceAreaMsg = `\nSERVICE AREA: Great! We service ${location} within our 200km radius around Toronto.`;
    }
  }

  // Pricing calculation
  if (roofType === 'repair') {
    const min = pricingTable.repair.flatMin;
    const max = pricingTable.repair.flatMax;
    estimateText = `Repair cost range: $${min}–${max}`;
    quote = `[QUOTE: ${Math.round((min + max) / 2)}]`;
  } else {
    const rule = pricingTable[roofType as keyof typeof pricingTable];
    if ('rate' in rule) {
      const cost = Math.round(rule.rate * sqft + rule.deliveryFee);
      estimateText = `Roof type: ${roofType}, Size: ${sqft} sqft, Rate: $${rule.rate}/sqft, Delivery: $${rule.deliveryFee}, Estimated Total: $${cost}`;
      quote = `[QUOTE: ${cost}]`;
    }
  }

  // Upselling opportunities
  if (roofType === 'asphalt') {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: Consider mentioning metal roofing for longer durability (50+ years vs 20-25 for asphalt), energy efficiency, and increased home value. Also suggest gutter replacement, attic insulation, or skylight installation.`;
  } else if (roofType === 'repair') {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: If repair costs are high, suggest full replacement benefits. Mention preventive maintenance plans, gutter cleaning services, or attic ventilation improvements.`;
  } else {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: Suggest complementary services like gutter systems, attic insulation upgrades, solar panel preparation, or extended warranties.`;
  }

  // Timeline urgency
  let timelineMsg = '';
  if (timeline && ['urgent', 'asap', 'this week'].includes(timeline)) {
    timelineMsg = `\nURGENCY NOTED: Customer indicated ${timeline} timeline. Prioritize emergency services and expedited scheduling.`;
  }

  return `
You are an expert AI roofing specialist assistant for a professional roofing company serving within 200km of Toronto, Ontario. Your goal is to help customers get accurate roofing quotes and schedule consultations.

IMPORTANT GUIDELINES:
1. Always be professional, helpful, and knowledgeable about roofing
2. Ask clarifying questions to provide accurate quotes
3. Focus on gathering: roof type, size (sq ft), materials wanted, work needed, location
4. When you have enough info, provide a quote range and mark it with [QUOTE: amount]
5. Be conversational but efficient - customers want quick answers
6. After providing a quote, encourage booking a consultation
7. ALWAYS check if customer is in service area (within 200km of Toronto)
8. Look for upselling opportunities naturally in conversation
9. SPECIAL: When customer says "yes" to booking consultation, respond with: "Perfect! Please fill out the booking form that just appeared to schedule your consultation. I've pre-filled your project details to make it quick and easy."

KEY INFO TO GATHER:
- Location (CRITICAL - must be within 200km of Toronto, Ontario)
- Type of work: repair, replacement, new installation
- Roof size (square footage or house dimensions)
- Current roofing material and desired material
- Any specific issues or concerns
- Timeline for the project
- Budget considerations

PRICING REFERENCE (DYNAMIC):
${estimateText}
${serviceAreaMsg}
${timelineMsg}
${upsellSuggestions}

CONVERSATION CONTEXT:
- Previous quotes given: ${previousQuotes?.length || 0}
- Budget mentioned: ${budget || 'Not specified'}
- Timeline: ${timeline || 'Not specified'}

When providing a quote, format it exactly like this: ${quote}

Keep responses concise but informative. Build trust through expertise. Always prioritize service area validation.
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { history, context } = await request.json();

    if (!Array.isArray(history)) {
      return NextResponse.json({ error: 'Invalid message history' }, { status: 400 });
    }

    const extractedContext = extractData(history, context || {});
    const systemPrompt = buildSystemPrompt(extractedContext);

    const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: Message) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1000,
      top_p: 1,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, but I cannot process your request right now. Please try again.';

    const quoteMatch = reply.match(/\[QUOTE:\s*(\d+)\]/);
    const quoted = !!quoteMatch;
    const quote = quoted ? parseInt(quoteMatch![1]) : null;
    
    let cleanReply = reply;
    if (quoted && quote) {
      cleanReply = reply.replace(/\[QUOTE:\s*\d+\]/g, `$${quote.toLocaleString()}`);
    }

    // Update context with any new quotes
    if (quoted && quote) {
      extractedContext.previousQuotes = [...(extractedContext.previousQuotes || []), quote];
    }

    // Check if user wants to book consultation
    const userMessage = history[history.length - 1]?.content || '';
    const wantsConsultation = /\b(yes|yeah|yep|sure|ok|okay)\b/i.test(userMessage);
    
    // Check if conversation context involves booking/consultation in recent messages
    const recentMessages = history.slice(-3).concat([{role: 'assistant', content: reply}]);
    const hasConsultationContext = recentMessages.some(msg => 
      /\b(consultation|appointment|book|schedule|visit|meet)\b/i.test(msg.content)
    );
    
    const shouldShowBooking = wantsConsultation && hasConsultationContext;

    // Debug logging
    console.log('Booking trigger debug:', {
      userMessage,
      wantsConsultation,
      hasConsultationContext,
      shouldShowBooking,
      recentMessages: recentMessages.map(m => m.content.substring(0, 50))
    });

    return NextResponse.json({ 
      reply: cleanReply, 
      quoted, 
      quote,
      context: extractedContext,
      showBooking: shouldShowBooking
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
