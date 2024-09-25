/**
 * @fileoverview checking imports use only public api
 * @author wayfarer9
 */
"use strict";

const checkingLayers = {
  entities: "entities",
  features: "features",
  pages: "pages",
  widgets: "widgets",
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "checking imports use only public api",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          aliases: {
            type: "string",
          },
        },
      },
    ],
    messages: {
      shouldUseOnlyPublicApi:
        "Absolute import is only allowed from the public API",
    },
  },

  create(context) {
    const alias = context.options[0]?.alias || "";

    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, "") : value;

        if (isPathRelative(importTo)) {
          return false;
        }

        const segments = importTo.split("/");

        const layer = segments[0];
        if (!checkingLayers[layer]) {
          return false;
        }

        const isImportNotFromPublicApi = segments.length > 2;

        if (isImportNotFromPublicApi) {
          context.report({
            node,
            messageId: "shouldUseOnlyPublicApi",
          });
        }
      },
    };
  },
};

function isPathRelative(path) {
  return path === "." || path.startsWith("./") || path.startsWith("../");
}
