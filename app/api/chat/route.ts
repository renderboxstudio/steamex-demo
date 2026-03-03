import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const carpetCleaningPricingTable = {
  // Standard steam cleaning (hot water extraction) - per room
  steamCleaning: {
    smallRoom: 45,     // < 150 sqft (bedroom, den)
    standardRoom: 65,  // 150–300 sqft (living room, master bedroom)
    largeRoom: 100,    // > 300 sqft (open plan, great room)
    minimumJob: 99,    // Minimum charge per visit
    description: "Hot water extraction / steam cleaning"
  },

  // Stain & specialty treatments
  stainTreatment: {
    basicStain: 20,    // Coffee, juice, food
    toughStain: 40,    // Red wine, ink, grease
    setInStain: 60,    // Old or set-in stains
    description: "Spot stain treatment and removal"
  },

  // Pet odor & treatment
  petTreatment: {
    deodorizing: 35,   // Per room - general pet deodorizing
    enzymatic: 60,     // Per room - enzyme treatment for urine
    heavyInfestation: 100, // Per room - severe pet contamination
    description: "Pet odor and urine treatment"
  },

  // Dry cleaning (low moisture)
  dryCleaning: {
    smallRoom: 55,
    standardRoom: 80,
    largeRoom: 120,
    description: "Low-moisture dry cleaning (faster drying)"
  },

  // Upholstery cleaning
  upholstery: {
    armchair: 45,
    loveseat: 70,
    sofa: 100,
    sectional: 150,
    description: "Upholstery and fabric furniture cleaning"
  },

  // Add-ons
  addOns: {
    fabricProtector: 30,  // Per room - Scotchgard / fabric protector
    deodorizer: 20,       // Per room - general deodorizing
    areaRug: 3,           // Per sqft for area rugs
    description: "Add-on services"
  },

  // Rush / same-day surcharge
  rush: {
    sameDaySurcharge: 0.25,  // 25% surcharge for same-day
    description: "Same-day / rush service"
  }
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationContext {
  location?: string;
  serviceArea?: boolean;
  serviceType?: string;
  complexity?: 'basic' | 'standard' | 'complex';
  urgency?: 'rush' | 'standard';
  timeline?: string;
  budget?: string;
  roomCount?: number;
  hasPets?: boolean;
  previousQuotes?: number[];
}

function isWithinServiceArea(location: string): boolean {
  const serviceableCities = [
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

  return serviceableCities.some(city =>
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

  // Service type detection for carpet cleaning
  let serviceType = context.serviceType || 'steamCleaning';

  if (allText.includes('upholstery') || allText.includes('sofa') || allText.includes('couch') || allText.includes('furniture') || allText.includes('chair')) {
    serviceType = 'upholstery';
  } else if (allText.includes('dry clean') || allText.includes('low moisture') || allText.includes('encapsulation')) {
    serviceType = 'dryCleaning';
  } else if (allText.includes('pet') || allText.includes('dog') || allText.includes('cat') || allText.includes('urine') || allText.includes('odor') || allText.includes('odour')) {
    serviceType = 'petTreatment';
  } else if (allText.includes('stain') || allText.includes('spot') || allText.includes('spill')) {
    serviceType = 'stainTreatment';
  } else if (allText.includes('rug') || allText.includes('area rug')) {
    serviceType = 'areaRug';
  }

  // Rush / urgency detection
  const rushKeywords = ['today', 'same day', 'same-day', 'urgent', 'asap', 'emergency', 'rush', 'immediately', 'right away', 'move out', 'moving out'];
  const hasRush = rushKeywords.some(keyword => allText.includes(keyword));
  const urgency: 'rush' | 'standard' = hasRush ? 'rush' : (context.urgency || 'standard');

  // Complexity based on soil level / carpet condition
  let complexity: 'basic' | 'standard' | 'complex' = context.complexity || 'standard';
  if (allText.includes('heavily soiled') || allText.includes('very dirty') || allText.includes('filthy') || allText.includes('severe') || allText.includes('years') || allText.includes('never been cleaned')) {
    complexity = 'complex';
  } else if (allText.includes('lightly soiled') || allText.includes('light clean') || allText.includes('maintenance') || allText.includes('fresh') || allText.includes('not too dirty')) {
    complexity = 'basic';
  }

  // Room count detection
  const roomMatch = allText.match(/(\d+)\s*(?:room|bedroom|bed|br)/);
  const roomCount = roomMatch ? parseInt(roomMatch[1]) : (context.roomCount || 1);

  // Pet detection
  const hasPets = context.hasPets || allText.includes('pet') || allText.includes('dog') || allText.includes('cat');

  const timelineMatch = allText.match(/(urgent|asap|today|this week|next week|this month|next month|spring|summer|fall|winter|move.?out)/);
  const timeline = timelineMatch ? timelineMatch[1] : context.timeline;

  const budgetMatch = allText.match(/budget.*?(\$[\d,]+)/);
  const budget = budgetMatch ? budgetMatch[1] : context.budget;

  const serviceArea = location ? isWithinServiceArea(location) : context.serviceArea;

  return {
    serviceType,
    complexity,
    urgency,
    location,
    serviceArea,
    timeline,
    budget,
    roomCount,
    hasPets,
    previousQuotes: context.previousQuotes || []
  };
}

function buildSystemPrompt(context: ConversationContext) {
  const { serviceType = 'steamCleaning', complexity = 'standard', urgency = 'standard', serviceArea, location, timeline, budget, roomCount = 1, hasPets, previousQuotes } = context;

  let estimateText = '';
  let quote = null;
  let serviceAreaMsg = '';
  let upsellSuggestions = '';

  // Service area check
  if (location) {
    if (serviceArea === false) {
      serviceAreaMsg = `\nSERVICE AREA NOTICE: Unfortunately, we don't currently service ${location}. Our service area covers within 200km of Toronto, Ontario.`;
    } else if (serviceArea === true) {
      serviceAreaMsg = `\nSERVICE AREA: Great! We provide carpet cleaning services in ${location}.`;
    }
  }

  // Rush surcharge
  const rushMultiplier = urgency === 'rush' ? 1 + carpetCleaningPricingTable.rush.sameDaySurcharge : 1;

  // Pricing per room based on complexity (basic = small room rate, standard = standard, complex = large + add-ons)
  let perRoomRate = carpetCleaningPricingTable.steamCleaning.standardRoom;
  if (complexity === 'basic') perRoomRate = carpetCleaningPricingTable.steamCleaning.smallRoom;
  if (complexity === 'complex') perRoomRate = carpetCleaningPricingTable.steamCleaning.largeRoom;

  let baseQuote = 0;

  switch (serviceType) {
    case 'steamCleaning':
    case 'areaRug':
      baseQuote = Math.max(perRoomRate * roomCount, carpetCleaningPricingTable.steamCleaning.minimumJob);
      estimateText = `Service: Steam cleaning, ${roomCount} room(s) @ $${perRoomRate}/room, Subtotal: $${perRoomRate * roomCount}`;
      break;

    case 'dryCleaning':
      const dryRate = complexity === 'basic'
        ? carpetCleaningPricingTable.dryCleaning.smallRoom
        : complexity === 'complex'
          ? carpetCleaningPricingTable.dryCleaning.largeRoom
          : carpetCleaningPricingTable.dryCleaning.standardRoom;
      baseQuote = Math.max(dryRate * roomCount, carpetCleaningPricingTable.steamCleaning.minimumJob);
      estimateText = `Service: Dry cleaning, ${roomCount} room(s) @ $${dryRate}/room`;
      break;

    case 'petTreatment':
      const petRate = complexity === 'complex'
        ? carpetCleaningPricingTable.petTreatment.heavyInfestation
        : complexity === 'basic'
          ? carpetCleaningPricingTable.petTreatment.deodorizing
          : carpetCleaningPricingTable.petTreatment.enzymatic;
      baseQuote = Math.max((perRoomRate + petRate) * roomCount, carpetCleaningPricingTable.steamCleaning.minimumJob);
      estimateText = `Service: Steam clean + pet treatment, ${roomCount} room(s), Steam: $${perRoomRate}/room + Pet treatment: $${petRate}/room`;
      break;

    case 'stainTreatment':
      const stainRate = complexity === 'complex'
        ? carpetCleaningPricingTable.stainTreatment.setInStain
        : complexity === 'basic'
          ? carpetCleaningPricingTable.stainTreatment.basicStain
          : carpetCleaningPricingTable.stainTreatment.toughStain;
      baseQuote = Math.max((perRoomRate * roomCount) + stainRate, carpetCleaningPricingTable.steamCleaning.minimumJob);
      estimateText = `Service: Steam clean + stain treatment, ${roomCount} room(s), Cleaning: $${perRoomRate * roomCount} + Stain treatment: $${stainRate}`;
      break;

    case 'upholstery':
      baseQuote = carpetCleaningPricingTable.upholstery.sofa;
      estimateText = `Service: Upholstery cleaning. Sofa: $${carpetCleaningPricingTable.upholstery.sofa}, Loveseat: $${carpetCleaningPricingTable.upholstery.loveseat}, Chair: $${carpetCleaningPricingTable.upholstery.armchair}`;
      break;

    default:
      baseQuote = Math.max(perRoomRate * roomCount, carpetCleaningPricingTable.steamCleaning.minimumJob);
      estimateText = `Service: Carpet cleaning, ${roomCount} room(s) @ $${perRoomRate}/room`;
  }

  const finalQuote = Math.round(baseQuote * rushMultiplier);
  quote = `[QUOTE: ${finalQuote}]`;

  if (rushMultiplier > 1) {
    estimateText += `, Rush/same-day surcharge (25%), Total: $${finalQuote}`;
  } else {
    estimateText += `, Total: $${finalQuote}`;
  }

  // Upsell opportunities
  if (serviceType === 'steamCleaning' || serviceType === 'dryCleaning') {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: Suggest fabric protector ($${carpetCleaningPricingTable.addOns.fabricProtector}/room) to repel future stains, deodorizing ($${carpetCleaningPricingTable.addOns.deodorizer}/room), or upholstery cleaning if they have fabric furniture. Ask if they have pets.`;
  } else if (serviceType === 'petTreatment') {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: Recommend fabric protector to prevent future staining, and a whole-home deep clean. Ask about upholstery (sofas, chairs) that may also have pet odors.`;
  } else if (serviceType === 'stainTreatment') {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: Suggest fabric protector after cleaning to prevent future stains. Offer a whole-room steam clean for best results alongside stain treatment.`;
  } else if (serviceType === 'upholstery') {
    upsellSuggestions = `\nUPSELL OPPORTUNITIES: Bundle carpet and upholstery cleaning for a discount. Suggest fabric protector treatment for the furniture.`;
  }

  // Timeline / urgency messaging
  let timelineMsg = '';
  if (urgency === 'rush') {
    timelineMsg = `\nRUSH SERVICE: Same-day carpet cleaning available with a 25% surcharge. Great for move-outs, last-minute guests, or emergency spills.`;
  } else if (timeline && ['this week', 'next week'].includes(timeline)) {
    timelineMsg = `\nTIMELINE NOTED: Customer indicated ${timeline}. Prioritize scheduling availability.`;
  }

  return `
You are an expert AI carpet cleaning specialist assistant for a professional carpet cleaning company serving within 200km of Toronto, Ontario. Your goal is to help customers get accurate carpet cleaning quotes and schedule appointments.

IMPORTANT GUIDELINES:
1. Always be professional, helpful, and knowledgeable about carpet cleaning
2. Ask clarifying questions to provide accurate quotes
3. Focus on gathering: number of rooms, carpet condition, pet issues, stain concerns, and location
4. When you have enough info, provide a quote and mark it with [QUOTE: amount]
5. Be conversational but efficient - customers want quick answers
6. After providing a quote, encourage booking a cleaning appointment
7. ALWAYS check if customer is in service area (within 200km of Toronto)
8. Look for upselling opportunities naturally in conversation (fabric protector, pet treatment, upholstery)
9. Detect rush/same-day requests and apply 25% surcharge
10. SPECIAL: When customer says "yes" to booking, respond with: "Perfect! Please fill out the booking form that just appeared to schedule your cleaning. I've pre-filled your details to make it quick and easy."

KEY INFO TO GATHER:
- Location (CRITICAL - must be within 200km of Toronto, Ontario)
- Number of rooms to clean
- Type of carpet or service needed (steam clean, dry clean, pet treatment, stain removal, upholstery)
- Soil level: light (regular maintenance), standard, or heavily soiled
- Pet issues (odors, urine stains)
- Specific stains or concerns
- Timeline (same-day, this week, flexible)
- Budget considerations

PRICING REFERENCE (DYNAMIC):
${estimateText}
${serviceAreaMsg}
${timelineMsg}
${upsellSuggestions}

CONVERSATION CONTEXT:
- Service Type: ${serviceType}
- Complexity/Soil Level: ${complexity}
- Urgency: ${urgency}
- Rooms: ${roomCount}
- Has Pets: ${hasPets ? 'Yes' : 'Unknown'}
- Previous quotes given: ${previousQuotes?.length || 0}
- Budget mentioned: ${budget || 'Not specified'}
- Timeline: ${timeline || 'Not specified'}

When providing a quote, format it exactly like this: ${quote}

Keep responses concise but informative. Build trust through carpet cleaning expertise. Always check service area and detect rush requests.
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

    await new Promise(resolve => setTimeout(resolve, 5000));

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

    // Check if user wants to book
    const userMessage = history[history.length - 1]?.content || '';
    const wantsConsultation = /\b(yes|yeah|yep|sure|ok|okay)\b/i.test(userMessage);

    const recentMessages = history.slice(-3).concat([{ role: 'assistant', content: reply }]);
    const hasConsultationContext = recentMessages.some(msg =>
      /\b(book|schedule|appointment|visit|cleaning|consultation)\b/i.test(msg.content)
    );

    const shouldShowBooking = wantsConsultation && hasConsultationContext;

    console.log('Carpet cleaning booking debug:', {
      userMessage,
      wantsConsultation,
      hasConsultationContext,
      shouldShowBooking,
    });

    return NextResponse.json({
      reply: cleanReply,
      quoted,
      quote,
      context: extractedContext,
      showBooking: shouldShowBooking
    });
  } catch (error) {
    console.error('Carpet cleaning chat API error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
