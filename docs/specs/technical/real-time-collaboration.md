---
id: FEAT-5c571bf
title: Real-Time Collaboration Technical Specification
type: feature
status: draft
domain: technical
owner: unassigned
last_reviewed: '2025-07-27'
depends_on: []
implements: []
covers_tests: []
code_refs: []
edit_url: >-
  https://github.com/micmcc/spec-driven-development-starter/edit/main/specs/technical/real-time-collaboration.md
---
# Real-Time Collaboration Technical Specification

## Metadata

- **Type**: Technical
- **Priority**: Medium
- **Status**: Draft
- **Dependencies**: Collaborative Editing, Authentication, WebSocket support

## Objective

Define the technical implementation for real-time collaborative editing with conflict resolution, live cursors, and synchronized document state.

## Context

The collaborative editing feature requires real-time synchronization between multiple users editing the same specification. This specification covers the technical architecture, WebSocket implementation, conflict resolution algorithms, and data synchronization patterns needed for seamless collaboration.

## Architecture Overview

### Technology Stack

```javascript
// Server-side
- **WebSocket Server**: Socket.IO for real-time communication
- **Conflict Resolution**: Operational Transformation (OT) algorithm
- **Document Storage**: PostgreSQL with JSON document field
- **Session Management**: Redis for active editing sessions
- **Message Queue**: Redis for reliable message delivery

// Client-side
- **WebSocket Client**: Socket.IO client
- **Document Editor**: CodeMirror or Monaco Editor with OT support
- **State Management**: Local document state with remote sync
- **Conflict Resolution**: Client-side OT operations
```

## WebSocket Implementation

### Connection Management

```javascript
// WebSocket connection endpoint
WS /ws/specs/:specId
Authorization: Bearer <access-token> (via query parameter or header)

// Connection events
{
  "event": "connect",
  "data": {
    "specId": "spec-uuid",
    "userId": "user-uuid",
    "userName": "John Doe",
    "timestamp": "2025-07-15T10:30:00Z"
  }
}

// User join notification
{
  "event": "user_joined",
  "data": {
    "userId": "user-uuid",
    "userName": "John Doe",
    "cursor": null,
    "activeUsers": [
      {
        "userId": "existing-user-uuid",
        "userName": "Jane Smith",
        "cursor": { "line": 5, "column": 10 }
      }
    ]
  }
}

// User leave notification
{
  "event": "user_left",
  "data": {
    "userId": "user-uuid",
    "activeUsers": []
  }
}
```

### Document Synchronization

```javascript
// Document state structure
{
  "specId": "spec-uuid",
  "version": 42,
  "content": "# Specification Title\n\nContent here...",
  "lastModified": "2025-07-15T10:30:00Z",
  "lastModifiedBy": "user-uuid"
}

// Operation format (Operational Transformation)
{
  "event": "operation",
  "data": {
    "operationId": "op-uuid",
    "userId": "user-uuid",
    "version": 42,
    "operations": [
      {
        "type": "insert",
        "position": 156,
        "content": "new text"
      },
      {
        "type": "delete", 
        "position": 200,
        "length": 5
      },
      {
        "type": "retain",
        "length": 100
      }
    ],
    "timestamp": "2025-07-15T10:30:15Z"
  }
}

// Operation acknowledgment
{
  "event": "operation_ack",
  "data": {
    "operationId": "op-uuid",
    "version": 43,
    "success": true
  }
}
```

### Cursor Tracking

```javascript
// Cursor position update
{
  "event": "cursor_update",
  "data": {
    "userId": "user-uuid",
    "cursor": {
      "line": 15,
      "column": 23,
      "selection": {
        "start": { "line": 15, "column": 20 },
        "end": { "line": 15, "column": 30 }
      }
    }
  }
}

// Cursor position broadcast
{
  "event": "cursor_broadcast",
  "data": {
    "userId": "user-uuid",
    "userName": "John Doe",
    "cursor": {
      "line": 15,
      "column": 23,
      "selection": null
    }
  }
}
```

## Conflict Resolution Algorithm

### Operational Transformation (OT)

```javascript
// Operation types
const OperationType = {
  RETAIN: 'retain',    // Keep existing content
  INSERT: 'insert',    // Add new content
  DELETE: 'delete'     // Remove content
};

// Transform function for concurrent operations
function transformOperation(op1, op2, priority) {
  // Implementation of OT algorithm
  // Ensures convergence when operations are applied in different orders
  
  if (op1.type === 'insert' && op2.type === 'insert') {
    if (op1.position <= op2.position) {
      return {
        ...op2,
        position: op2.position + op1.content.length
      };
    }
  }
  
  if (op1.type === 'delete' && op2.type === 'insert') {
    if (op1.position < op2.position) {
      return {
        ...op2,
        position: op2.position - op1.length
      };
    }
  }
  
  // Additional transformation rules...
  return op2;
}
```

### Document State Management

```javascript
// Server-side document state
class DocumentState {
  constructor(specId) {
    this.specId = specId;
    this.version = 0;
    this.content = '';
    this.pendingOperations = new Map();
    this.activeUsers = new Set();
  }
  
  applyOperation(operation) {
    // Validate operation against current version
    if (operation.version !== this.version) {
      throw new Error('Version mismatch');
    }
    
    // Apply operation to content
    this.content = this.transformContent(this.content, operation.operations);
    this.version++;
    
    // Broadcast to all connected users
    this.broadcastOperation(operation);
  }
  
  broadcastOperation(operation) {
    this.activeUsers.forEach(userId => {
      if (userId !== operation.userId) {
        this.sendToUser(userId, operation);
      }
    });
  }
}
```

## Real-Time API Endpoints

### WebSocket Events

```javascript
// Client → Server Events
{
  // Join editing session
  "join_session": {
    "specId": "spec-uuid"
  },
  
  // Send operation
  "operation": {
    "operationId": "op-uuid",
    "version": 42,
    "operations": [...]
  },
  
  // Update cursor position
  "cursor_update": {
    "cursor": { "line": 10, "column": 5 }
  },
  
  // Leave session
  "leave_session": {
    "specId": "spec-uuid"
  }
}

// Server → Client Events
{
  // Session joined successfully
  "session_joined": {
    "specId": "spec-uuid",
    "version": 42,
    "content": "document content",
    "activeUsers": [...]
  },
  
  // Incoming operation from another user
  "remote_operation": {
    "userId": "other-user-uuid",
    "version": 43,
    "operations": [...]
  },
  
  // Cursor update from another user
  "remote_cursor": {
    "userId": "other-user-uuid",
    "cursor": { "line": 15, "column": 10 }
  },
  
  // Error handling
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Document version mismatch",
    "currentVersion": 45
  }
}
```

### REST API Endpoints

```javascript
// Get current document state
GET /api/specs/:specId/document
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "specId": "spec-uuid",
    "version": 42,
    "content": "# Specification Content",
    "lastModified": "2025-07-15T10:30:00Z",
    "activeCollaborators": [
      {
        "userId": "user-uuid",
        "userName": "John Doe",
        "joinedAt": "2025-07-15T10:25:00Z"
      }
    ]
  }
}

// Save document (manual save or auto-save)
PUT /api/specs/:specId/document
Authorization: Bearer <access-token>
{
  "content": "updated content",
  "version": 42
}

// Get document revision history
GET /api/specs/:specId/revisions
Authorization: Bearer <access-token>

// Response
{
  "success": true,
  "data": {
    "revisions": [
      {
        "version": 42,
        "content": "document content",
        "modifiedBy": "user-uuid",
        "modifiedAt": "2025-07-15T10:30:00Z",
        "changesSummary": "Added new section"
      }
    ]
  }
}
```

## Database Schema Updates

```sql
-- Real-time collaboration tables

-- Document versions for conflict resolution
CREATE TABLE document_versions (
  id UUID PRIMARY KEY,
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(spec_id, version)
);

-- Active editing sessions
CREATE TABLE editing_sessions (
  id UUID PRIMARY KEY,
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  socket_id TEXT NOT NULL,
  cursor_position JSONB,
  joined_at TIMESTAMP DEFAULT now(),
  last_activity TIMESTAMP DEFAULT now(),
  UNIQUE(spec_id, user_id)
);

-- Operation log for audit and recovery
CREATE TABLE document_operations (
  id UUID PRIMARY KEY,
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  operation_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  version INTEGER NOT NULL,
  operations JSONB NOT NULL,
  applied_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_document_versions_spec ON document_versions(spec_id, version);
CREATE INDEX idx_editing_sessions_spec ON editing_sessions(spec_id);
CREATE INDEX idx_operations_spec_version ON document_operations(spec_id, version);
```

## Performance Considerations

### Scalability Patterns

```javascript
// Redis for session management
const sessionStore = {
  // Store active sessions
  setActiveSession: (specId, userId, socketId) => {
    redis.sadd(`spec:${specId}:users`, userId);
    redis.hset(`user:${userId}:session`, 'socketId', socketId);
    redis.expire(`user:${userId}:session`, 3600); // 1 hour TTL
  },
  
  // Get active users for a spec
  getActiveUsers: async (specId) => {
    return await redis.smembers(`spec:${specId}:users`);
  }
};

// Message queuing for reliability
const messageQueue = {
  // Queue operations for processing
  queueOperation: (specId, operation) => {
    redis.lpush(`spec:${specId}:operations`, JSON.stringify(operation));
  },
  
  // Process operation queue
  processOperations: async (specId) => {
    const operations = await redis.lrange(`spec:${specId}:operations`, 0, -1);
    // Process operations in order
  }
};
```

### Optimization Strategies

- **Operation Batching**: Group small operations together
- **Delta Compression**: Send only changes, not full content
- **Presence Throttling**: Limit cursor update frequency
- **Connection Pooling**: Reuse WebSocket connections
- **Graceful Degradation**: Fall back to polling if WebSocket fails

## Error Handling & Recovery

### Connection Recovery

```javascript
// Client-side reconnection logic
class RealtimeClient {
  constructor(specId, token) {
    this.specId = specId;
    this.token = token;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  connect() {
    this.socket = io(`/ws/specs/${this.specId}`, {
      auth: { token: this.token },
      transports: ['websocket', 'polling']
    });
    
    this.socket.on('disconnect', () => {
      this.handleDisconnection();
    });
  }
  
  handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }
  }
}
```

### Conflict Resolution

```javascript
// Handle version conflicts
{
  "event": "version_conflict",
  "data": {
    "expectedVersion": 42,
    "currentVersion": 45,
    "conflictingOperations": [
      {
        "version": 43,
        "operations": [...]
      }
    ]
  }
}

// Client response - request document sync
{
  "event": "request_sync",
  "data": {
    "lastKnownVersion": 42
  }
}
```

## Security Considerations

### Authentication & Authorization

- **WebSocket Authentication**: Validate JWT tokens on connection
- **Permission Checking**: Verify edit permissions before accepting operations
- **Rate Limiting**: Prevent operation spam (max 100 operations/minute)
- **Input Validation**: Sanitize all operation content
- **Session Management**: Track and limit concurrent sessions per user

### Data Integrity

```javascript
// Operation validation
function validateOperation(operation, userPermissions) {
  // Check user has edit permissions
  if (!userPermissions.canEdit) {
    throw new Error('Insufficient permissions');
  }
  
  // Validate operation structure
  if (!operation.operations || !Array.isArray(operation.operations)) {
    throw new Error('Invalid operation format');
  }
  
  // Check operation size limits
  if (JSON.stringify(operation).length > 10000) {
    throw new Error('Operation too large');
  }
  
  return true;
}
```

## Testing Requirements

### Unit Tests

- [ ] Operational Transformation algorithm correctness
- [ ] Document state management
- [ ] Cursor position tracking
- [ ] Error handling and recovery

### Integration Tests

- [ ] WebSocket connection management
- [ ] Multi-user collaboration scenarios
- [ ] Conflict resolution with concurrent edits
- [ ] Network interruption recovery

### Performance Tests

- [ ] Concurrent user limits (target: 10 users per document)
- [ ] Operation throughput (target: 1000 ops/second)
- [ ] Memory usage with large documents
- [ ] WebSocket connection scalability

## Related Files

- [Collaborative Editing](../features/collaborative_editing.md)
- [Authentication](./authentication.md)
- [Database Schema](../product-overview/db-schema.md)
- [Error Handling](./error-handling.md)
- [API Routes](../product-overview/api-routes.md)
