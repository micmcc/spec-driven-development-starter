// COPILOT TEST FILE
// Ask Copilot to implement a feature from our specifications

// TODO: Implement project creation feature following /specs/features/project-creation.md
// This should create an Express route that:
// 1. Requires authentication (JWT)
// 2. Validates project title and description
// 3. Creates project in PostgreSQL database
// 4. Returns appropriate response format

// Start typing below and see what Copilot suggests:

// Context: ${JSON.stringify(context, null, 2)}
// This is a test file to check if Copilot can generate code based on our specifications        
const SpecExtractor = require('./tools/spec-extractor');    

const extractor = new SpecExtractor();
const context = extractor.extractContext(); 


