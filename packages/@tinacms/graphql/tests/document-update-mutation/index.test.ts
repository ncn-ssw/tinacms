import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const updateMutation = `
  mutation {
    updateDocument(
      collection: "post", 
      relativePath: "in.md", 
      params: {
        post: {
          title: "Updated Title by Mr Bob Northwind"
          genre: "action"
          rating: 9
          body: {
            type: "root"
            children: [
              {
                type: "p"
                children: [
                  {
                    type: "text"
                    text: "This is the updated content for Mr Bob Northwind's post about Northwind. The company has achieved remarkable success through innovation and customer focus."
                  }
                ]
              }
            ]
          }
        }
      }
    ) {
      ...on Document { _values, _sys { title } }
    }
  }
`;

it('updates document and validates bridge writes', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);

  // Execute mutation with inline parameters (no variables)
  const result = await get({
    query: updateMutation,
    variables: {},
  });

  // Validate GraphQL response
  expect(format(result)).toMatchFileSnapshot('node.json');

  // Validate Bridge write operations
  const writes = bridge.getWrites();
  expect(writes.size).toBeGreaterThan(0);
  expect(bridge.getWrite('posts/in.md')).toMatchFileSnapshot(
    'updated-document-content.md'
  );
});
