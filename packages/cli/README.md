# @aiql-org/cli

Command-line tool for parsing and transpiling AIQL code.

## Install

```bash
npm install -g @aiql-org/cli
```

## Commands

```bash
aiql transpile <file> -t <target>  # Transpile to target format
aiql parse <file>                   # Show AST
aiql formats                        # List supported targets
aiql validate <file>                # Validate syntax
```

## Targets

Python, JSON, YAML, SQL, Coq, Lean

## Docker

```bash
docker run -v $(pwd):/data aiql/cli transpile /data/example.aiql -t python
```

## License

MIT
