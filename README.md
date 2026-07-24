# ZKP2P Groups List

The public registry of verified address groups used by ZKP2P makers.

Groups are created and managed onchain. This repository adds the metadata that
helps makers understand who operates a group, how membership is decided, and
what they are opting into.

Published list:

```text
https://zkp2p.github.io/groups-list/groups-list.json
```

## Repository layout

Each group has its own source file:

```text
groups/<curator-slug>/<group-slug>.json
```

The individual files are the source of truth. This lets different curators
open PRs at the same time without editing one shared JSON file.

After changes reach `main`, GitHub Actions builds and publishes one aggregated
`groups-list.json` for applications to consume. Do not commit generated files.

## What a verified listing means

A listed group has:

- A real group in the stated onchain registry.
- A curator address that matches the group's current onchain owner.
- Public, understandable membership criteria.
- Enough metadata for a maker to make an informed choice.

Listing is not an endorsement or a guarantee about every member. Group owners
and resolvers can change membership over time. Makers should review the
curator, criteria, and trust model before opting in.

The canonical identity of a group is:

```text
(chainId, registryAddress, groupId)
```

Names and descriptions are metadata. They are not identifiers.

## Become a curator

Anyone can create and operate a group in the permissionless
`AddressGroupRegistry`.

1. Choose the wallet that will control the group. A Safe or other multisig is
   recommended for a production group.
2. Call `createGroup(name)` on the registry.
3. Wait for confirmation and record the `groupId` from the `GroupCreated`
   event. Do not predict the next ID from `groupCount`.
4. Manage membership with `addMembers` and `removeMembers`, or configure a
   resolver contract with `setResolver`.
5. Publish clear membership criteria and keep the group operational.
6. Submit the group to this repository once its onchain state can be verified.

Creating a group does not automatically add it to the verified list.

## Add a group to the list

1. Fork this repository.
2. Copy `examples/group.example.json`.
3. Save it as:

   ```text
   groups/<curator-slug>/<group-slug>.json
   ```

4. Replace every example value with the confirmed onchain and public metadata.
5. Run:

   ```bash
   npm ci
   npm run check
   ```

6. Open a PR. Prefer one group per PR.

Do not edit `groups-list.json` or anything under `dist/`; the aggregate is
generated after merge.

### Review requirements

Reviewers will confirm that:

- The group exists at the stated chain, registry, and ID.
- `curator.address` matches the onchain group owner.
- Any listed resolver matches the onchain resolver.
- The description and membership criteria are accurate and readable.
- The curator controls the linked accounts and resources where reasonably
  verifiable.
- The file path matches the curator and group slugs.

Materially misleading, abandoned, malicious, or unverifiable listings may be
updated or removed.

## Group file

```json
{
  "chainId": 8453,
  "registryAddress": "0x1111111111111111111111111111111111111111",
  "groupId": "123",
  "name": "Example Trusted Takers",
  "slug": "trusted-takers",
  "description": "Takers who meet the curator's published participation requirements.",
  "curator": {
    "address": "0x2222222222222222222222222222222222222222",
    "name": "Example Curator",
    "slug": "example-curator",
    "links": {
      "website": "https://example.com"
    }
  },
  "membership": {
    "description": "Membership is reviewed weekly against the published criteria.",
    "criteriaURI": "https://example.com/group-criteria"
  },
  "tags": ["reputation"]
}
```

See `schema/group.schema.json` for the complete format.

## Development

Requires Node.js 20 or newer.

```bash
npm ci
npm run validate
npm run build
```

- `npm run validate` checks every group, example, file path, and duplicate
  identity.
- `npm run build` produces the public aggregate under `dist/`.
- `npm run check` runs both.

## Versioning

`schemaVersion` describes the published data format:

- Major: breaking schema change.
- Minor: backward-compatible field addition.
- Patch: clarification or validation tightening.

Adding or updating a group does not require a schema version change.

## License

MIT
