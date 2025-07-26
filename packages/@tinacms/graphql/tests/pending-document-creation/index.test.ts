import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const createMutation = `
  mutation {
    addPendingDocument(
      collection: "post"
      relativePath: "new-post.md"
    ) {
      __typename
    }
  }
`;

it('creates pending document and validates bridge writes', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);

  // Execute document creation mutation
  const result = await get({
    query: createMutation,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-response.json'
  );

  // Validate Bridge writes for new document
  const newDocWrite = bridge.getWrite('posts/new-post.md');
  expect(newDocWrite).toBeDefined();
  expect(newDocWrite).toMatchFileSnapshot('new-post-content.md');
});
