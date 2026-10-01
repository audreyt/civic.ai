import { parseFragment, serialize } from "parse5";

type Node = {
    nodeName?: string;
    tagName?: string;
    attrs?: Array<{ name: string; value: string }>;
    childNodes?: Node[];
};

function attr(node: Node, name: string): string | undefined {
    return node.attrs?.find((item) => item.name === name)?.value;
}

function faqNode(html: string): Node {
    return parseFragment(html) as unknown as Node;
}

export function transformFaq(html: string, url: string): string {
    if (url !== "/faq/" && url !== "/tw/faq/") return html;

    const document = faqNode(html);
    const children = document.childNodes!;

    for (let index = 0; index < children.length; index += 1) {
        const question = children[index]!;
        const questionId = attr(question, "id");
        if (question.tagName !== "h3" || !questionId?.startsWith("faq-"))
            continue;

        let end = index + 1;
        while (
            end < children.length &&
            children[end]!.tagName !== "h3" &&
            children[end]!.tagName !== "h2"
        ) {
            end += 1;
        }

        const answer = faqNode(
            `<div class="faq-answer" id="${questionId}-answer"></div>`
        ).childNodes![0]!;
        answer.childNodes = children.splice(index + 1, end - index - 1);
        children.splice(index + 1, 0, answer);
        index += 1;
    }

    return serialize(document as never);
}
