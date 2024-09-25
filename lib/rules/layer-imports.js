/**
 * @fileoverview check imports direction
 * @author wayfarer9
 */
"use strict";

const path = require("path");
const micromatch = require("micromatch");
const isPathRelative = require("../helpers");

const layers = {
  app: ["pages", "widgets", "features", "entities", "shared"],
  pages: ["widgets", "features", "entities", "shared"],
  widgets: ["features", "entities", "shared"],
  features: ["entities", "shared"],
  entities: ["entities", "shared"],
  shared: ["shared"],
};

const availableLayers = {
  app: "app",
  pages: "pages",
  widgets: "widgets",
  entities: "entities",
  features: "features",
  shared: "shared",
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "check imports direction",
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
          ignoreImportPatterns: {
            type: "array",
          },
        },
      },
    ],
    messages: {
      allowUnderlyingLayers: "Allows imports only from underlying layers",
    },
  },

  create(context) {
    const { alias = "", ignoreImportPatterns = [] } = context.options[0] ?? {};

    const getCurrentFileLayer = () => {
      const currentFilePath = context.filename;

      const normalizedPath = path.toNamespacedPath(currentFilePath);
      const projectPath = normalizedPath?.split("src")[1];
      const segments = projectPath?.split("\\");

      return segments?.[1];
    };

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, "") : value;
      const segments = importPath?.split("/");

      return segments?.[0];
    };

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const currentFileLayer = getCurrentFileLayer();
        const importLayer = getImportLayer(importPath);

        if (isPathRelative(importPath)) {
          return false;
        }

        if (
          !availableLayers[importLayer] ||
          !availableLayers[currentFileLayer]
        ) {
          return false;
        }

        const isIgnored = ignoreImportPatterns.some((pattern) => {
          return micromatch.isMatch(importPath, pattern);
        });

        if (isIgnored) {
          return false;
        }

        if (!layers[currentFileLayer]?.includes(importLayer)) {
          context.report({
            node,
            messageId: "allowUnderlyingLayers",
          });
        }
      },
    };
  },
};
