# API Performance Report

## Phase 1: Initial Performance with Full Data

The initial performance of the API when fetching all data, including detailed information for each category and tag associated with entries, was as follows:

Route: /api/users/:user_id/entries
Response times: 3569 ms, 1894 ms, 2303 ms, 1642 ms, 1756 ms, 1771 ms, 1741 ms
Total requests: 7
Average response time: 2096.57 ms (~10,000 records)

## Phase 2: Optimization - Fetching Only Category and Tag IDs

In this phase, the API was optimized to fetch only the IDs of associated categories and tags, rather than their full data. Category and tag IDs were already indexed. This resulted in a significant improvement in response times:

Route: /api/users/:user_id/entries
Response times: 811 ms, 685 ms, 700 ms, 621 ms, 568 ms, 585 ms
Total requests: 6
Average response time: 661.67 ms

## Phase 3: Optimization - Adding Pagination

The final phase of optimization involved adding pagination to the API route. This further reduced the amount of data returned in a single request, leading to the following performance metrics:

Route: /api/users/:user_id/entries
Response times: 173 ms, 191 ms, 154 ms, 154 ms, 88 ms
Total requests: 5
Average response time: 152 ms (~10 records)

Overall Reduction in Average Response Time

Comparing the initial average response time (2096.57 ms) to the average response time after implementing both optimizations (152 ms), there is an approximate 92.75% reduction in the average response time for the /api/users/:user_id/entries route.
