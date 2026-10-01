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

function contest(url: string, questionId: string, zh: boolean): Node {
    const title = encodeURIComponent(
        `Question not answered: ${url}#${questionId}`
    );
    return faqNode(
        `<p class="faq-contest"><a href="https://github.com/audreyt/civic.ai/issues/new?title=${title}">${zh ? "還沒回答到？提出這個問題。" : "Not answered? File the question."}</a></p>`
    ).childNodes![0]!;
}

export function transformFaq(html: string, url: string): string {
    if (url !== "/faq/" && url !== "/tw/faq/") return html;

    const document = faqNode(html);
    const children = document.childNodes!;
    const zh = url === "/tw/faq/";

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
        answer.childNodes.push(contest(url, questionId, zh));
        children.splice(index + 1, 0, answer);
        index += 1;
    }

    return serialize(document as never);
}
