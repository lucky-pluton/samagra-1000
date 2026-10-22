# Capability Specification: Isolated Code Judge

## ADDED Requirements

### Requirement: Separate Run and Submit Actions
The system SHALL support two distinct execution modes: Run (evaluating public tests only) and Submit (evaluating all public and private tests).

#### Scenario: Running public tests
- **WHEN** a student clicks Run
- **THEN** only public test cases are evaluated
- **AND** completion credit is NOT awarded

#### Scenario: Submitting complete test suite
- **WHEN** a student clicks Submit
- **THEN** both public and private tests are evaluated on the backend
- **AND** completion credit is awarded only if 100% of tests pass

### Requirement: Private Test Case Protection
The system SHALL protect private test inputs and outputs from client-side exposure.

#### Scenario: Inspection of API response
- **WHEN** the student receives evaluation results for a submission
- **THEN** private test inputs and expected outputs are not present in the payload
- **AND** only aggregate pass/fail status is visible for private tests

### Requirement: Sandboxed Resource Limits
The system SHALL enforce execution timeouts and memory bounds on student Python code.

#### Scenario: Infinite loop execution
- **WHEN** submitted code enters a `while True` loop
- **THEN** the process is terminated after 2,000 milliseconds
- **AND** the judge returns 'Time Limit Exceeded' without crashing the server
