import { type Node } from "unist";

export interface NodeWithChildren extends Node {
    children: NodeWithChildren[];
    alt?: string;
    url?: string;
    value?: string;
}

export interface NodeOptionalChildren extends Omit<Node, "children"> {
    children?: NodeWithChildren[];
    value?: string;
}
