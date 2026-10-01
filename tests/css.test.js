import { expect, test } from "vite-plus/test";
import { stripCssComments } from "../scripts/lib/css.mjs";

test("drops comments and the blank lines they leave, keeping every rule", () => {
    const css =
        "/* lane A */\n.a {\n    color: red; /* why */\n}\n\n\n\n/* end */\n.b { margin: 0; }\n";
    expect(stripCssComments(css)).toBe(
        "\n.a {\n    color: red; \n}\n\n.b { margin: 0; }\n"
    );
});
