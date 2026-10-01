import { expect, test } from "vite-plus/test";
import { transformFaq } from "../src/lib/faqTransform";

const faq = `<h2 id="faq">FAQ</h2><h3 id="faq-1">Question</h3><p id="p1">Answer</p><ul><li id="p2">List</li></ul><h3 id="faq-2">Second</h3><p id="p3">Second answer</p><h2 id="end">End</h2>`;

test("wraps English FAQ answers without replacing existing IDs", () => {
    const result = transformFaq(faq, "/faq/");

    expect(result).toContain('<div class="faq-answer" id="faq-1-answer">');
    expect(result).toContain(
        '<p id="p1">Answer</p><ul><li id="p2">List</li></ul>'
    );
    expect(result).not.toContain("faq-contest");
    expect(result.match(/id="p\d+"/g)).toEqual([
        'id="p1"',
        'id="p2"',
        'id="p3"',
    ]);
    expect(result).toContain('<h2 id="end">End</h2>');
});

test("wraps the Traditional Chinese FAQ answers the same way", () => {
    const result = transformFaq(faq, "/tw/faq/");

    expect(result).toContain('<div class="faq-answer" id="faq-2-answer">');
    expect(result).toContain('<p id="p3">Second answer</p></div>');
});

test("leaves other pages untouched", () => {
    expect(transformFaq(faq, "/measures/")).toBe(faq);
});
