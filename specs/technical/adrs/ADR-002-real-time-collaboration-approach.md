# ADR-002: Real-time Collaboration Approach

## Status

Accepted

## Context

The application requires real-time collaborative editing capabilities for specification documents. Multiple users need to simultaneously edit documents without conflicts, similar to Google Docs or Notion.

Key requirements:
- Multiple users editing the same document simultaneously
- Conflict resolution when users edit the same content
- Real-time cursor positions and user presence
- Document consistency across all clients
- Offline capability and synchronization when reconnected

## Decision

We will implement real-time collaboration using:

### WebSocket Communication
- **Socket.io**: For bi-directional real-time communication between clients and server
- **Room-based architecture**: Each document gets its own Socket.io room
- **Event-driven updates**: Discrete events for different types of document changes

### Conflict Resolution Strategy
- **Operational Transform (OT)**: For character-level conflict resolution
- **Document snapshots**: Periodic snapshots for recovery and new user synchronization
- **Optimistic updates**: Client-side immediate updates with server reconciliation

### Data Structure
```javascript
// Document operations structure
{
  id: 'uuid',
  type: 'insert|delete|retain',
  position: number,
  content: string,
  author: 'user_id',
  timestamp: 'ISO_date',
  version: number
}
```

### Implementation Components

1. **Client-side Editor**: Rich text editor with OT integration
2. **Operation Transform Engine**: Server-side OT processing
3. **Presence System**: Real-time user cursor and selection tracking
4. **Version History**: Document state snapshots and operation logs

## Consequences

### Positive
- Near real-time collaboration experience similar to popular tools
- Conflict resolution handles simultaneous edits gracefully
- Scalable to multiple concurrent users per document
- Offline capability with synchronization on reconnection
- Granular change tracking for audit and version history

### Negative
- Complex implementation requiring careful handling of edge cases
- OT algorithms can be difficult to debug and maintain
- Increased server load for processing operations
- Client-side complexity for handling network disconnections

### Risks
- OT implementation bugs could cause document corruption
- Performance degradation with many simultaneous users
- Complexity of handling all edge cases in conflict resolution
- Potential memory leaks in long-running collaboration sessions

## Alternatives Considered

### Conflict Resolution Alternatives

**Conflict-free Replicated Data Types (CRDTs)**
- Pros: Mathematically guaranteed consistency, simpler conflict resolution
- Cons: Larger memory footprint, more complex data structures
- Decision: OT chosen for better performance and established patterns

**Lock-based Editing**
- Pros: Simple implementation, no conflicts possible
- Cons: Poor user experience, blocking other users
- Decision: Rejected for collaboration requirements

**Turn-based Editing**
- Pros: No conflicts, simple to implement
- Cons: Very poor user experience for real-time collaboration
- Decision: Rejected for user experience requirements

### Communication Alternatives

**WebRTC for Peer-to-Peer**
- Pros: Reduced server load, direct client communication
- Cons: Complex NAT traversal, no central authority for conflict resolution
- Decision: Rejected for complexity and reliability concerns

**Server-Sent Events (SSE)**
- Pros: Simpler than WebSockets, HTTP-based
- Cons: Unidirectional, requires polling for client-to-server communication
- Decision: Rejected for real-time bidirectional requirements

**GraphQL Subscriptions**
- Pros: Strong typing, integrated with existing GraphQL
- Cons: Overhead for simple operations, complex setup
- Decision: Rejected as we're not using GraphQL initially

## Implementation Plan

### Phase 1: Basic Real-time (Current)
- Socket.io setup with room-based architecture
- Basic text synchronization without OT
- User presence indicators

### Phase 2: Full OT Implementation
- Implement operational transform algorithms
- Add conflict resolution for simultaneous edits
- Document version history and snapshots

### Phase 3: Advanced Features
- Rich text formatting support
- Comment system integration
- Offline synchronization

### Phase 4: Performance Optimization
- Operation batching for performance
- Memory optimization for long sessions
- Horizontal scaling for multiple servers

## Technical Specifications

### WebSocket Events
```javascript
// Client to Server
'join-document': { documentId, userId }
'document-operation': { operation, documentId }
'cursor-position': { position, selection, documentId }

// Server to Client
'document-operation': { operation, author }
'user-joined': { user, users }
'user-left': { userId, users }
'cursor-update': { userId, position, selection }
'document-snapshot': { content, version }
```

### Database Schema
```sql
-- Document operations log
CREATE TABLE document_operations (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES specifications(id),
    user_id UUID REFERENCES users(id),
    operation_type VARCHAR(20),
    position INTEGER,
    content TEXT,
    version INTEGER,
    created_at TIMESTAMP
);

-- Document snapshots for recovery
CREATE TABLE document_snapshots (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES specifications(id),
    content TEXT,
    version INTEGER,
    created_at TIMESTAMP
);
```

## Testing Strategy

- Unit tests for OT algorithms
- Integration tests for WebSocket communication
- Load testing for concurrent users
- Chaos testing for network disconnections
- End-to-end tests for collaboration scenarios

## Monitoring and Metrics

- Real-time connection count per document
- Operation processing latency
- Conflict resolution frequency
- User session duration
- Error rates for OT operations

## Review Date

This decision should be reviewed after Phase 2 implementation or if performance issues arise with more than 10 concurrent users per document.

---

*Decision made on: July 25, 2024*
*Last updated: July 25, 2024*
*Status: Accepted*