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

        // Если путь относительный, то нечего и проверять
        if (isPathRelative(importTo)) {
          return false;
        }

        // Разобьем строку пути импорта на массив. Примерный его вид будет таков:
        // [entities, article, model, ...]. Если окажется, что в этом массиве есть что-то кроме
        // entities и article, то это будет указывать на то, что импорт осуществляется не из
        // public API
        const segments = importTo.split("/");

        // Если окажется, что импортируемая сущность не связана со слоями приложения, тогда
        // нечего и проверять
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

        // Однако одной такой проверки не достаточно
      },
    };
  },
};

function isPathRelative(path) {
  return path === "." || path.startsWith("./") || path.startsWith("../");
}
