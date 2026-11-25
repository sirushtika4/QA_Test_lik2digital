
Feature: User Registration
  As a new Ink2Digital user
  I want to create an account
  So that I can access handwriting digitization features

  Scenario: Registration with missing information
    Given the registration service is available
    When I register with a missing name
    Then the registration status should be 400

  Scenario: Registration with a short password
    Given the registration service is available
    When I register with a password shorter than 6 characters
    Then the registration status should be 400

  Scenario: Successful registration
    Given the registration service is available
    And the email address is not already registered
    When I register with valid details
    Then the registration status should be 201
