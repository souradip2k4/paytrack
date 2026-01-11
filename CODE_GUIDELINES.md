# Code guidelines

A code guideline is a set of rules that every developer must follow in order to ensure consistency and quality in the codebase.

We will follow the google style guidelines for the codebase.

## Primary branch

We use `main` branch as the primary branch. At no point should you break the main branch. In case, the `main` branch breaks, fixing it should be prioritized.

## Serialization and deserialization

All dates when sent from client to server should be in ISO format (yyyy-mm-dd). This includes query params, request body, url paths, etc.

All types for api endpoints are named as follows
<method><obj><type>

PostCategoryQueryParams
PostCategoriesResponseBody

types are QueryParams, ResponseBody, Request

## Database

- For indexes, names should be in the format `idx_table_name_column_names`
