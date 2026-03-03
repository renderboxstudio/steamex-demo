# Design Document

## Overview

This design outlines the transformation of the AI Roofing Assistant into an AI Plumbing Assistant. The core architecture remains unchanged - we're maintaining the Next.js framework, Groq AI integration, Mailjet email service, and React components. The primary changes involve content transformation, pricing logic updates, and plumbing-specific business rules.

## Architecture

The existing architecture is solid and will be preserved:

- **Frontend**: Next.js 14 with React components
- **Backend**: API routes for chat and booking
- **AI Integration**: Groq SDK for conversational AI
- **Email Service**: Mailjet for notifications
- **Storage**: LocalStorage for chat persistence
- **Styling**: Tailwind CSS (unchanged)

## Components and Interfaces

### Updated Interfaces

```typescript
interface ConversationContext {
  location?: string;
  serviceArea?: boolean;
  serviceType?: string; // Changed from roofType
  complexity?: 'basic' | 'standard' | 'complex'; // New field
  urgency?: 'emergency' | 'urgent' | 'standard'; // New field
  timeline?: string;
  budget?: string;
  previousQuotes?: number[];
}
```

### Pricing Model Design

Based on current Canadian plumbing rates (2024), the new pricing structure:

```typescript
const plumbingPricingTable = {
  // Emergency services (24/7, 1.5x rate)
  emergency: { 
    hourlyRate: 180, // $120 base * 1.5
    calloutFee: 150,
    description: "Emergency plumbing (burst pipes, major leaks, no water)"
  },
  
  // Drain cleaning services
  drainCleaning: { 
    basic: 150,      // Simple kitchen/bathroom drain
    standard: 250,   // Main line snaking
    complex: 400,    // Hydro jetting, severe blockages
    description: "Drain cleaning and unclogging"
  },
  
  // Pipe repair/replacement
  pipeRepair: { 
    hourlyRate: 120,
    materialMultiplier: 1.3, // 30% markup on materials
    description: "Pipe repair and replacement"
  },
  
  // Water heater services
  waterHeater: {
    repair: { min: 200, max: 600 },
    installation: { 
      standard: 1800,  // Standard tank water heater
      tankless: 3200,  // Tankless installation
      premium: 4500    // High-end or complex installs
    },
    description: "Water heater repair and installation"
  },
  
  // Bathroom plumbing
  bathroomPlumbing: {
    basic: 2000,     // Toilet/sink replacement
    standard: 4500,  // Partial bathroom renovation
    complete: 8000,  // Full bathroom plumbing renovation
    description: "Bathroom plumbing installation and renovation"
  },
  
  // General plumbing services
  general: {
    hourlyRate: 120,
    calloutFee: 100,
    description: "General plumbing repairs and maintenance"
  }
};
```

### Service Area Logic

Maintaining the existing 200km radius around Toronto, but updating messaging to reflect plumbing services instead of roofing.

## Data Models

### Updated Context Extraction

The `extractData` function will be modified to detect:

1. **Service Type Detection**: Keywords like "drain", "pipe", "water heater", "toilet", "leak", "bathroom"
2. **Urgency Detection**: Emergency keywords like "flooding", "burst", "no water", "leak"
3. **Complexity Assessment**: Based on described scope and service type

### Quote Calculation Logic

```typescript
function calculatePlumbingQuote(context: ConversationContext): number {
  const { serviceType, complexity, urgency } = context;
  
  let baseQuote = 0;
  let multiplier = 1;
  
  // Apply urgency multiplier
  if (urgency === 'emergency') multiplier = 1.5;
  
  // Calculate based on service type
  switch (serviceType) {
    case 'drainCleaning':
      baseQuote = plumbingPricingTable.drainCleaning[complexity || 'standard'];
      break;
    case 'waterHeater':
      baseQuote = plumbingPricingTable.waterHeater.installation.standard;
      break;
    // ... other service types
  }
  
  return Math.round(baseQuote * multiplier);
}
```

## Error Handling

Maintaining existing error handling patterns:
- API route error responses
- Graceful fallbacks for AI service failures
- Form validation for booking system
- Email notification error handling

## Testing Strategy

### Content Verification Tests
- Verify all roofing terminology has been replaced
- Confirm pricing calculations are accurate
- Test service type detection logic

### Functional Tests
- Chat flow with plumbing scenarios
- Quote generation for different service types
- Booking form with plumbing context
- Email notifications with plumbing content

### Integration Tests
- Groq AI responses for plumbing queries
- Mailjet email delivery with new templates
- End-to-end booking flow

## Migration Strategy

### Phase 1: Core Content Updates
1. Update package.json name and metadata
2. Transform main page content and headers
3. Update chat storage keys

### Phase 2: AI Logic Transformation
1. Replace pricing table with plumbing rates
2. Update system prompts for plumbing expertise
3. Modify context extraction for plumbing services

### Phase 3: Component Updates
1. Update ChatBot component messaging
2. Transform booking form labels and context
3. Update email templates

### Phase 4: API Route Updates
1. Update chat API with plumbing logic
2. Transform booking API notifications
3. Update all console logging references

## Plumbing-Specific Business Rules

### Emergency Service Detection
- Keywords: "flood", "burst", "leak", "no water", "overflow"
- Response: Immediate availability, emergency rates, 24/7 service

### Upselling Opportunities
- **Drain cleaning** → Preventive maintenance plans
- **Pipe repair** → Water quality testing, filtration systems
- **Water heater** → Annual maintenance, energy-efficient upgrades
- **General repair** → Fixture upgrades, water-saving devices

### Service Area Messaging
- Within area: "Great! We provide plumbing services in [location]"
- Outside area: "We don't currently service [location]. Consider contacting local licensed plumbers in your area."