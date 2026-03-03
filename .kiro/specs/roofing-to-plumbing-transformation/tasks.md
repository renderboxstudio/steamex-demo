# Implementation Plan

- [x] 1. Update project metadata and configuration





  - Change package.json name from "roofing-agent-demo" to "plumbing-agent-demo"
  - Update page title and meta description in layout.tsx to reference plumbing services
  - _Requirements: 7.1, 7.2, 8.1_
-

- [x] 2. Transform main page content and branding




  - Update page.tsx header from "AI Roofing Assistant" to "AI Plumbing Assistant"
  - Change description from roofing estimates to plumbing estimates
  - Update initial chatbot message to mention plumbing services instead of roofing
  - Update roofing icon to plumbing-appropriate icon (wrench or pipe)
  - _Requirements: 1.1, 1.2, 1.4, 7.4_
- [x] 3. Update ChatBot component for plumbing context




- [ ] 3. Update ChatBot component for plumbing context

  - Change storage key from "roofing-chat-data" to "plumbing-chat-data"
  - Update header title from "AI Roofing Assistant" to "AI Plumbing Assistant"
  - Update placeholder text to reference plumbing projects instead of roofing
  - Update default initial message to mention plumbing services (repair, installation, maintenance)
  - _Requirements: 1.3, 7.3, 1.4_

- [x] 4. Transform booking form for plumbing services





  - Update ConsultationBooking component title to "Book Plumbing Consultation"
  - Change project summary labels from roof-related terms to plumbing service types
  - Update confirmation messaging to reference plumbing specialists instead of roofing team
  - Update form submission success message to mention plumbing consultation
  - _Requirements: 5.1, 5.2, 5.3_


- [x] 5. Implement plumbing pricing model in chat API




  - Replace roofing pricing table with comprehensive plumbing pricing structure
  - Add emergency service detection and 1.5x rate multiplier for urgent keywords
  - Update service type detection from roof types to plumbing services (drain cleaning, pipe repair, water heater, bathroom plumbing)
  - Implement complexity assessment logic for accurate quote calculation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.3_

- [x] 6. Update AI system prompts for plumbing expertise





  - Transform system prompt from roofing specialist to plumbing specialist
  - Update service area messaging to reference plumbing services instead of roofing
  - Add emergency plumbing detection and response logic
  - Update upselling suggestions for plumbing-appropriate services
  - _Requirements: 1.3, 3.2, 4.1, 4.2, 6.1, 6.2, 6.3, 6.4_
-

- [x] 7. Update context extraction logic for plumbing services




  - Modify extractData function to detect plumbing service types instead of roof types
  - Add emergency keyword detection for urgent plumbing situations
  - Update context interface to use serviceType instead of roofType
  - Implement urgency level detection for emergency services
  - _Requirements: 2.1, 4.1, 4.4, 8.2_

- [x] 8. Transform booking API for plumbing business





  - Update console logging to reference plumbing consultations instead of roofing
  - Modify email notification templates to mention plumbing services and team
  - Update booking confirmation messaging for plumbing context
  - Change email subject lines and content to reference plumbing quotes and services
  - _Requirements: 5.4, 8.3, 8.4_
-

- [-] 9. Update service area validation messaging


  - Maintain 200km radius around Toronto but update messaging for plumbing services
  - Change out-of-area messaging to recommend local plumbers instead of roofers
  - Update in-area confirmation to mention plumbing service availability
  - _Requirements: 3.1, 3.2_

- [ ] 10. Test and verify complete transformation

  - Test chat flow with various plumbing scenarios (emergency, drain cleaning, water heater, bathroom renovation)
  - Verify quote calculations for different plumbing service types
  - Test booking form with plumbing context and email notifications
  - Confirm all roofing references have been replaced with plumbing terminology
  - _Requirements: All requirements verification_