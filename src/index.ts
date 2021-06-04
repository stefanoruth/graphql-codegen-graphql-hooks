import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common'
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'
import { visit, concatAST, Kind, FragmentDefinitionNode, DocumentNode } from 'graphql'
import { GraphQLHooksVisitor } from './visitor'

export const plugin: PluginFunction = (schema, documents, config) => {
    const documentList: DocumentNode[] = documents.map(v => v.document).filter(Boolean) as any

    const allAst = concatAST(documentList)

    const allFragments: LoadedFragment[] = [
        ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
            fragmentDef => ({
                node: fragmentDef,
                name: fragmentDef.name.value,
                onType: fragmentDef.typeCondition.name.value,
                isExternal: false,
            })
        ),
        ...(config.externalFragments || []),
    ]

    const visitor = new GraphQLHooksVisitor(schema, allFragments, config, {}, documents)
    const visitorResult = visit(allAst, { leave: visitor })

    return {
        prepend: [...visitor.getImports()],
        content: [...visitorResult.definitions].join('\n'),
    }
}
