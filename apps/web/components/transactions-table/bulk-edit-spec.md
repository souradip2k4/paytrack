# Bulk Edit Performance Spec

## Feature Overview

The bulk edit feature allows users to edit multiple transactions directly within the transactions table. When a user modifies a cell, the changes are tracked in the component's state. A "Save" button appears, allowing the user to persist all changes in a single action.

## Performance Considerations

### 1. Client-Side Rendering

**Impact:** High

- **Initial Render:** The table renders normally, with minimal overhead.
- **Editing:** When a user clicks on a cell to edit, a new React component (`EditableCell`) is rendered. For large tables with many editable cells, this can lead to a significant increase in the number of DOM elements and React components, potentially impacting rendering performance and memory usage.
- **Re-renders:** Every character change in an input field triggers a re-render of the `EditableCell` component. While this is localized to the cell itself, with many cells being edited simultaneously, it can lead to a sluggish user experience.

**Mitigation:**

- **Virtualization:** For very large datasets (e.g., >1000 rows), implementing table virtualization (e.g., using `@tanstack/react-virtual`) is strongly recommended. This would ensure that only the visible rows are rendered, significantly reducing the number of DOM elements and improving performance.
- **Debounced Updates:** Instead of updating the state on every keystroke, the input can be debounced. However, this might feel less responsive to the user.

### 2. State Management

**Impact:** Medium

- **`editedRows` State:** All changes are stored in a single `editedRows` object in the `TransactionsTable` component's state. When this state is updated, it can trigger re-renders of the `TransactionsTable` component and its children.
- **Data Comparison:** Before saving, the `editedRows` are compared with the original `transactions` data to find the actual changes. This operation has a complexity of O(n) where n is the number of edited rows. For a large number of edited rows, this could introduce a small delay before the save operation is initiated.

**Mitigation:**

- **Optimized State Updates:** The current implementation updates the state for each cell change. This is generally fine for a reasonable number of edits. If performance becomes an issue, a more complex state management solution (like Zustand or Jotai) could be used to optimize re-renders, so only the affected components are updated.

### 3. Network Requests

**Impact:** Medium

- **Payload Size:** The `handleSave` function sends all *changed* rows to the server. If a user edits a large number of rows, the request payload could be large, potentially leading to slower network requests.
- **Number of Requests:** The current implementation sends one request per updated row using `Promise.all`. While this is parallelized, for a very large number of updates, it could still be slow and might hit server rate limits.

**Mitigation:**

- **Bulk Update Endpoint:** The backend should ideally support a true bulk update endpoint that accepts an array of objects to update in a single transaction. The current implementation simulates this with `Promise.all`, but a single endpoint would be more efficient.
- **Pagination:** If users are frequently editing a very large number of rows, introducing pagination on the save operation could be considered (e.g., saving in batches of 100).

## Conclusion

The bulk edit feature provides significant usability improvements. For typical use cases with a moderate number of transactions, the current implementation should perform well. However, for applications with very large datasets, the performance impacts, particularly on the client-side rendering, should be monitored. Implementing virtualization would be the most effective mitigation for large tables.
