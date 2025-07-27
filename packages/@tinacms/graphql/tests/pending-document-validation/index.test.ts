import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const validCreateMutation = `
  mutation {
    addPendingDocument(
      collection: "post"
      relativePath: "valid-post.md"
    ) {
      __typename
    }
  }
`;

const invalidCollectionMutation = `
  mutation {
    addPendingDocument(
      collection: "nonexistent"
      relativePath: "test.md"
    ) {
      __typename
    }
  }
`;

it('creates pending document with valid parameters', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);

  const result = await get({ query: validCreateMutation, variables: {} });
  expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-success-response.json'
  );

  const newDocWrite = bridge.getWrite('posts/valid-post.md');
  expect(newDocWrite).toBeDefined();
  expect(newDocWrite).toMatchFileSnapshot('valid-post-content.md');
});

it('handles validation error for invalid collection', async () => {
  const { get } = await setupMutation(__dirname, config);

  const result = await get({ query: invalidCollectionMutation, variables: {} });
  expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-invalid-collection-response.json'
  );
  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);
});

it('handles validation error for invalid path format', async () => {
  const { get } = await setupMutation(__dirname, config);

  const invalidPathMutation = `
    mutation {
      addPendingDocument(
        collection: "post"
        relativePath: "../invalid-path.md"
      ) {
        __typename
      }
    }
  `;

  const result = await get({ query: invalidPathMutation, variables: {} });
  expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-invalid-path-response.json'
  );
  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);
});
