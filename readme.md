# GraphQL Codegen - GraphQL Hooks

![npm](https://img.shields.io/npm/v/@stefanoruth/graphql-codegen-graphql-hooks)

## Install

`yarn add @stefanoruth/graphql-codegen-graphql-hooks`

or

`npm install @stefanoruth/graphql-codegen-graphql-hooks`

## Quick Start

Add the plugin to youre codegen.yml config

```yml
schema: 'my-schema.graphql'
generates:
    output.ts:
        plugins:
            - 'typescript'
            - 'typescript-operations'
            - '@stefanoruth/graphql-codegen-graphql-hooks'
```
