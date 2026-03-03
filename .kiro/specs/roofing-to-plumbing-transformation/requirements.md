# Requirements Document

## Introduction

Transform the existing AI Roofing Assistant application into an AI Plumbing Assistant application. The transformation involves converting all roofing-specific content, terminology, pricing models, service types, and business logic to plumbing equivalents while maintaining the same technical architecture, API integrations (Mailjet, Groq), and user experience patterns.

## Requirements

### Requirement 1

**User Story:** As a homeowner with plumbing needs, I want to interact with an AI plumbing assistant, so that I can get instant quotes for plumbing services instead of roofing services.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL display "AI Plumbing Assistant" instead of "AI Roofing Assistant"
2. WHEN a user sees the header description THEN the system SHALL show plumbing-specific messaging instead of roofing messaging
3. WHEN a user interacts with the chatbot THEN the system SHALL provide plumbing expertise instead of roofing expertise
4. WHEN the initial message loads THEN the system SHALL mention plumbing services (repair, installation, maintenance) instead of roofing work

### Requirement 2

**User Story:** As a customer seeking plumbing services, I want to receive accurate plumbing quotes based on service type and complexity, so that I can make informed decisions about my plumbing needs.

#### Acceptance Criteria

1. WHEN the system calculates quotes THEN it SHALL use plumbing-specific pricing models instead of roofing pricing
2. WHEN a user mentions drain cleaning THEN the system SHALL provide drain cleaning pricing (flat rate $150-400)
3. WHEN a user mentions pipe repair THEN the system SHALL provide pipe repair pricing (per hour $120-180 + materials)
4. WHEN a user mentions water heater installation THEN the system SHALL provide water heater pricing ($1200-3500 depending on type)
5. WHEN a user mentions bathroom renovation THEN the system SHALL provide bathroom plumbing pricing ($2000-8000)
6. WHEN a user mentions emergency services THEN the system SHALL provide emergency plumbing rates (1.5x standard rates)

### Requirement 3

**User Story:** As a plumbing business owner, I want the service area validation to reflect plumbing service coverage, so that I only accept customers within my plumbing service territory.

#### Acceptance Criteria

1. WHEN the system checks service areas THEN it SHALL maintain the same 200km radius around Toronto for plumbing services
2. WHEN a customer is outside the service area THEN the system SHALL provide plumbing-specific messaging about local plumber recommendations
3. WHEN a customer is within the service area THEN the system SHALL confirm plumbing service availability in their location

### Requirement 4

**User Story:** As a customer with plumbing emergencies, I want the system to recognize urgency indicators, so that I can get prioritized emergency plumbing services.

#### Acceptance Criteria

1. WHEN a user mentions "leak", "flood", "burst pipe", or "no water" THEN the system SHALL recognize this as emergency plumbing
2. WHEN emergency keywords are detected THEN the system SHALL offer 24/7 emergency plumbing services
3. WHEN emergency services are offered THEN the system SHALL mention emergency rates and faster response times
4. WHEN a user indicates urgency THEN the system SHALL prioritize immediate consultation booking

### Requirement 5

**User Story:** As a potential customer, I want to book plumbing consultations through the same booking system, so that I can schedule plumbing assessments and service appointments.

#### Acceptance Criteria

1. WHEN the booking form loads THEN it SHALL display "Book Plumbing Consultation" instead of roofing consultation
2. WHEN project details are shown THEN they SHALL reflect plumbing service types instead of roof types
3. WHEN confirmation emails are sent THEN they SHALL mention plumbing services and specialists
4. WHEN the booking is processed THEN the system SHALL reference plumbing team instead of roofing team

### Requirement 6

**User Story:** As a plumbing business, I want the AI to suggest appropriate upselling opportunities, so that I can maximize service value for customers.

#### Acceptance Criteria

1. WHEN a customer inquires about basic repairs THEN the system SHALL suggest preventive maintenance plans
2. WHEN a customer needs pipe work THEN the system SHALL suggest water quality testing or filtration systems
3. WHEN a customer mentions old fixtures THEN the system SHALL suggest fixture upgrades or water-efficient alternatives
4. WHEN a customer books water heater service THEN the system SHALL suggest annual maintenance contracts

### Requirement 7

**User Story:** As a user, I want essential text and branding to reflect plumbing services, so that the application feels authentic for plumbing needs.

#### Acceptance Criteria

1. WHEN the page title loads THEN it SHALL show "AI Plumbing Assistant - Instant Quotes" instead of roofing
2. WHEN meta descriptions are shown THEN they SHALL reference plumbing estimates instead of roofing estimates
3. WHEN storage keys are used THEN they SHALL use "plumbing-chat-data" instead of "roofing-chat-data"
4. WHEN the main header displays THEN it SHALL show "AI Plumbing Assistant" instead of "AI Roofing Assistant"

### Requirement 8

**User Story:** As a developer, I want all code references and variable names to be updated to plumbing terminology, so that the codebase is maintainable and consistent.

#### Acceptance Criteria

1. WHEN reviewing package.json THEN the name SHALL be "plumbing-agent-demo" instead of "roofing-agent-demo"
2. WHEN examining interface definitions THEN context properties SHALL use plumbing terms (serviceType instead of roofType)
3. WHEN looking at API routes THEN console logs SHALL reference plumbing consultations instead of roofing
4. WHEN checking email templates THEN all text SHALL reference plumbing services and specialists