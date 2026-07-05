import { formalSourceResponse } from "../../lib/formalSource";

export function GET() {
    return formalSourceResponse("lakefile.toml");
}
