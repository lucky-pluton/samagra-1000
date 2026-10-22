# Capability Specification: Core Challenge & Question Progression

## ADDED Requirements

### Requirement: Exact 1,000-Question Bank
The system SHALL provide exactly 1,000 published Python coding problems organized into 300 Easy, 400 Medium, and 300 Hard questions.

#### Scenario: Full Question Bank Distribution
- **WHEN** the question bank is queried
- **THEN** the total count of published questions is exactly 1,000
- **AND** there are 300 Easy, 400 Medium, and 300 Hard problems

### Requirement: Sequential Problem Progression
The system SHALL unlock questions sequentially so that question N cannot be attempted until question N-1 has been successfully verified.

#### Scenario: Unlocking next question upon acceptance
- **GIVEN** a student has completed question 1
- **WHEN** the submission is accepted by the judge
- **THEN** question 2 is marked unlocked in student progress
- **AND** future questions beyond 2 remain locked

### Requirement: Safe Retries Without Penalties
The system SHALL allow students to retry failed questions without deducting points or penalizing leaderboard standing.

#### Scenario: Submitting after failed attempt
- **GIVEN** a student previously received Wrong Answer on question 5
- **WHEN** they submit an updated correct solution
- **THEN** the question is marked accepted and completion points are awarded once
