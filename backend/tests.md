# Running Tests

This document describes how to run the test suite for the backend application.

## Prerequisites

- Python 3.12 or higher
- PostgreSQL (for running complete test suite)

## Installing Test Dependencies

```bash
pip install -r requirements-test.txt
```

## Running Tests

### Using Django's Test Runner

```bash
# Run all tests
python manage.py test

# Run tests for a specific app
python manage.py test health

# Run a specific test class
python manage.py test health.tests.test_weight_entry.WeightEntryAPITest

# Run a specific test method
python manage.py test health.tests.test_weight_entry.WeightEntryAPITest.test_create_weight_entry
```

### Using pytest

```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=.

# Run specific test file
pytest health/tests/test_weight_entry.py

# Run specific test class
pytest health/tests/test_weight_entry.py::WeightEntryAPITest

# Run specific test method
pytest health/tests/test_weight_entry.py::WeightEntryAPITest::test_create_weight_entry
```

## Continuous Integration

Tests are automatically run on GitHub Actions for every push and pull request to the main branch.

The workflow configuration can be found in `.github/workflows/django-tests.yml`.

## Test Coverage

To generate a test coverage report:

```bash
pytest --cov=. --cov-report=html
```

This will create a directory called `htmlcov`. Open `htmlcov/index.html` in a web browser to view the coverage report.