import fetch from "node-fetch";
import fs from "node:fs/promises";
const query = /* GraphQL */ `
  query getRepoLangs {
    viewer {
      repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
        totalCount
        nodes {
          name
          languages(first: 100) {
            edges {
              size
              node {
                color
                name
              }
            }
          }
        }
        pageInfo {
          endCursor
        }
      }
    }
  }
`;
const result = (await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${process.env.GH_PAT}`,
    },
    body: JSON.stringify({ query }),
}).then(async (res) => {
    const obj = (await res.json());
    if (res.status >= 400) {
        throw new Error(JSON.stringify(obj, null, 4));
    }
    return obj;
})).data;
const repos = result.viewer.repositories.nodes ?? [];
const data = {};
for (const repo of repos) {
    const repoLangs = {};
    for (const edge of repo?.languages?.edges ?? []) {
        repoLangs[edge.node.name] = edge.size;
    }
    data[repo.name] = repoLangs;
}
await fs.writeFile("data/data.json", JSON.stringify(data, null, 2));
