import { Types } from '@graphql-codegen/plugin-helpers'
import {
    ClientSideBaseVisitor,
    DocumentMode,
    RawClientSideBasePluginConfig,
    ClientSideBasePluginConfig,
    LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common'
import { GraphQLSchema, OperationDefinitionNode } from 'graphql'

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
            {
                ...rawConfig,
                documentMode: DocumentMode.string,
            },
            additionalConfig,
            documents
        )
    }

    getImports() {
        return [`import { useQuery, useMutation, UseClientRequestOptions, UseQueryOptions } from 'graphql-hooks';`]
    }

    protected buildOperation(
        node: OperationDefinitionNode,
        documentVariableName: string,
        operationType: string,
        operationResultType: string,
        operationVariablesTypes: string,
        hasRequiredVariables: boolean
    ) {
        if (operationType === 'Query') {
            return `export const use${operationResultType} = (variables?: UseQueryOptions<${operationVariablesTypes}>) => useQuery<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)`
        } else if (operationType === 'Mutation') {
            return `export const use${operationResultType} = (variables?: UseClientRequestOptions<${operationVariablesTypes}>) => useMutation<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables)`
        }

        return ''
    }
}
