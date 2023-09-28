import { Types } from '@graphql-codegen/plugin-helpers'
import {
    ClientSideBaseVisitor,
    DocumentMode,
    RawClientSideBasePluginConfig,
    ClientSideBasePluginConfig,
    LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common'
import { GraphQLSchema, OperationDefinitionNode } from 'graphql'
import gqlmin from 'gqlmin'

export class GraphQLHooksVisitor extends ClientSideBaseVisitor<
    RawClientSideBasePluginConfig,
    ClientSideBasePluginConfig
> {
    constructor(
        schema: GraphQLSchema,
        fragments: LoadedFragment[],
        rawConfig: RawClientSideBasePluginConfig,
        additionalConfig: Partial<ClientSideBasePluginConfig>,
        documents?: Types.DocumentFile[]
    ) {
        super(
            schema,
            fragments,
            rawConfig,
            {
                // Don't include documents in the output, as we will add them manually instead
                documentMode: DocumentMode.external,
                ...additionalConfig,
            },
            documents
        )
    }

    override getImports() {
        return [
            `import { useQuery, useMutation, useManualQuery, UseClientRequestOptions, UseQueryOptions } from 'graphql-hooks';`,
        ]
    }

    protected override buildOperation(
        node: OperationDefinitionNode,
        documentVariableName: string,
        operationType: string,
        operationResultType: string,
        operationVariablesTypes: string,
        hasRequiredVariables: boolean
    ) {
        const documentName = `${documentVariableName}Raw`

        if (!node.loc) {
            throw new Error('Location missing?')
        }

        const rawQuery = gqlmin(node.loc.source.body.substring(node.loc.start, node.loc.end))
        if (operationType === 'Query') {
            return [
                `const ${documentName} = \`${rawQuery}\`;`,
                `export const use${operationResultType} = (options?: UseQueryOptions<${operationResultType}, ${operationVariablesTypes}>) => useQuery<${operationResultType}, ${operationVariablesTypes}>(${documentName}, options)`,
                `export const useManual${operationResultType} = (options?: UseClientRequestOptions<${operationResultType}, ${operationVariablesTypes}>) => useManualQuery<${operationResultType}, ${operationVariablesTypes}>(${documentName}, options)`,
            ].join('\n')
        } else if (operationType === 'Mutation') {
            return [
                `const ${documentName} = \`${rawQuery}\`;`,
                `export const use${operationResultType} = (options?: UseClientRequestOptions<${operationResultType}, ${operationVariablesTypes}>) => useMutation<${operationResultType}, ${operationVariablesTypes}>(${documentName}, options)`,
            ].join('\n')
        }

        return ''
    }
}
