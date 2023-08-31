// based on https://github.com/EugeneMeles/laravel-react-i18n/blob/master/src/loader.ts

import fs from "fs";
import path from "path";
import {
    type Constant,
    Engine,
    type Entry,
    type Node,
    type Array as ParserArray,
    type String as ParserString,
    type Return,
} from "php-parser";

type TranslationOutput = Record<string, string>;

interface TranslationFiles {
    name: string;
    path: string;
}

export const parseAll = (inputPath: string, outputPath: string): TranslationFiles[] => {
    inputPath = inputPath.replace(/[\\/]$/, "") + path.sep;
    outputPath = outputPath.replace(/[\\/]$/, "") + path.sep;

    const folders = fs
        .readdirSync(inputPath)
        .filter((file) => fs.statSync(inputPath + path.sep + file).isDirectory())
        .sort();

    const data = [];

    for (const folder of folders) {
        const lang = readThroughDirectory(inputPath + path.sep + folder);

        data.push({
            folder,
            translations: convertToDotsSyntax(lang),
        });
    }

    return data
        .filter(({ translations }) => Object.keys(translations).length > 0)
        .map(({ folder, translations }) => {
            const name = `${folder}.json`;
            const path = `${outputPath}${name}`;

            fs.writeFileSync(path, JSON.stringify(translations));

            return { name, path };
        });
};

export const parse = (content: string): TranslationOutput => {
    const array = new Engine({})
        .parseCode(content, "lang")
        .children.filter((child) => child.kind === "return")[0] as Return;

    if (array.expr?.kind !== "array") {
        return {};
    }

    return convertToDotsSyntax(parseItem(array.expr) as Record<string, string | TranslationOutput>);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseItem = (expr: Node): any => {
    if (expr.kind === "string") {
        return (expr as ParserString).value.replace(/:(\w+)/gi, "{{$1}}");
    }

    if (expr.kind === "array") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const items = (expr as ParserArray).items.map((item) => parseItem(item));

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if ((expr as ParserArray).items.every((item) => (item as Entry).key !== null)) {
            let temporary = {};

            for (const item of items) {
                temporary = Object.assign({}, temporary, item as Entry);
            }

            return temporary;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return items;
    }

    if ((expr as Entry).key !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { [((expr as Entry).key as ParserString).value]: parseItem((expr as Entry).value) };
    }

    return parseItem((expr as Constant).value as Node);
};

const convertToDotsSyntax = (list: Record<string, string | TranslationOutput>): TranslationOutput => {
    const flatten = (items: Record<string, string | TranslationOutput>, context = ""): TranslationOutput => {
        const data: TranslationOutput = {};

        for (const [key, value] of Object.entries(items)) {
            if (typeof value === "string") {
                data[context + key] = value;
                continue;
            }

            for (const [itemKey, itemValue] of Object.entries(flatten(value, context + key + "."))) {
                data[itemKey] = itemValue;
            }
        }

        return data;
    };

    return flatten(list);
};

export const readThroughDirectory = (directory: string): Record<string, TranslationOutput> => {
    const data: Record<string, TranslationOutput> = {};

    for (const file of fs.readdirSync(directory)) {
        data[file.replace(/\.\w+$/, "")] = parse(fs.readFileSync(directory + path.sep + file).toString());
    }

    return data;
};
