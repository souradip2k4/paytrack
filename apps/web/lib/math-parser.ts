export function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens);
  return parser.parse();
}

type TokenType =
  | "NUMBER"
  | "PLUS"
  | "MINUS"
  | "MULTIPLY"
  | "DIVIDE"
  | "MODULO"
  | "POWER"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

interface Token {
  type: TokenType;
  value?: string;
  position: number;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    const char = input[current];

    // Skip whitespace
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    // Numbers (integers and decimals)
    if (/[0-9]/.test(char) || char === ".") {
      let value = "";
      const start = current;
      let hasDot = false;

      // Handle leading dot
      if (char === ".") {
        value += ".";
        hasDot = true;
        current++;
      }

      while (current < input.length) {
        const c = input[current];
        if (/[0-9]/.test(c)) {
          value += c;
          current++;
        } else if (c === "." && !hasDot) {
          value += ".";
          hasDot = true;
          current++;
        } else {
          break;
        }
      }

      if (value === ".") {
          throw new Error(`Unexpected token '.' at position ${start}`);
      }

      tokens.push({ type: "NUMBER", value, position: start });
      continue;
    }

    if (char === "+") {
      tokens.push({ type: "PLUS", position: current });
      current++;
      continue;
    }
    if (char === "-") {
      tokens.push({ type: "MINUS", position: current });
      current++;
      continue;
    }
    if (char === "*") {
      tokens.push({ type: "MULTIPLY", position: current });
      current++;
      continue;
    }
    if (char === "/") {
      tokens.push({ type: "DIVIDE", position: current });
      current++;
      continue;
    }
    if (char === "%") {
      tokens.push({ type: "MODULO", position: current });
      current++;
      continue;
    }
    if (char === "^") {
      tokens.push({ type: "POWER", position: current });
      current++;
      continue;
    }
    if (char === "(") {
      tokens.push({ type: "LPAREN", position: current });
      current++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "RPAREN", position: current });
      current++;
      continue;
    }

    throw new Error(`Unknown character '${char}' at position ${current}`);
  }

  tokens.push({ type: "EOF", position: current });
  return tokens;
}

class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): number {
    const result = this.expression();
    if (!this.isAtEnd()) {
      throw new Error("Unexpected tokens after expression");
    }
    return result;
  }

  // expression -> term
  private expression(): number {
    return this.addition();
  }

  // addition -> multiplication ( ( "+" | "-" ) multiplication )*
  private addition(): number {
    let left = this.multiplication();

    while (this.match("PLUS", "MINUS")) {
      const operator = this.previous();
      const right = this.multiplication();
      if (operator.type === "PLUS") {
        left += right;
      } else {
        left -= right;
      }
    }

    return left;
  }

  // multiplication -> exponentiation ( ( "*" | "/" | "%" ) exponentiation )*
  private multiplication(): number {
    let left = this.exponentiation();

    while (this.match("MULTIPLY", "DIVIDE", "MODULO")) {
      const operator = this.previous();
      const right = this.exponentiation();
      if (operator.type === "MULTIPLY") {
        left *= right;
      } else if (operator.type === "DIVIDE") {
        if (right === 0) throw new Error("Division by zero");
        left /= right;
      } else if (operator.type === "MODULO") {
        left %= right;
      }
    }

    return left;
  }

  // exponentiation -> unary ( "^" unary )* (Right associative?)
  // Standard math often treats ^ as right associative: 2^3^4 = 2^(3^4).
  // JS Math.pow(2, 3) is 8. 2 ** 3 ** 2 is 512 (2^(3^2)).
  private exponentiation(): number {
    let left = this.unary();

    while (this.match("POWER")) {
      const right = this.exponentiation(); // Recursive call for right associativity
      left = Math.pow(left, right);
    }

    return left;
  }

  // unary -> ( "!" | "-" | "+" ) unary | primary
  private unary(): number {
    if (this.match("MINUS")) {
      return -this.unary();
    }
    if (this.match("PLUS")) {
      return this.unary();
    }
    return this.primary();
  }

  // primary -> NUMBER | "(" expression ")"
  private primary(): number {
    if (this.match("NUMBER")) {
      return parseFloat(this.previous().value!);
    }

    if (this.match("LPAREN")) {
      const expr = this.expression();
      this.consume("RPAREN", "Expect ')' after expression.");
      return expr;
    }

    throw new Error(`Expect expression at position ${this.peek().position}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
